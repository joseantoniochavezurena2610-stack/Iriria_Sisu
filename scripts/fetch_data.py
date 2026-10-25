#!/usr/bin/env python3
"""
Downloads and processes the NASA data for the pilot region (Guanacaste) used by the web app.

- NASA POWER (daily, AG community, no account needed): rainfall, temperature, relative
  humidity, radiation, wind and soil moisture (GWETTOP / GWETROOT).
- NOAA CPC ENSO index (RONI, falling back to ONI) to label every month as
  El Niño, La Niña or neutral.

Data window: from 2021-01-01 to the latest available day
(team rule: at least the last 5 years).

Standard library only. Run by .github/workflows/data.yml; it can also be run by hand:

    python scripts/fetch_data.py

Output (versioned in the repo, it is small):
    web/data/guanacaste/climate_<id>.json
    web/data/guanacaste/summary.json
    web/data/enso.json
Raw POWER responses go to data/raw/ (ignored by git).
"""
from __future__ import annotations

import json
import math
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB_DATA = ROOT / "web" / "data"
REGION_DIR = WEB_DATA / "guanacaste"
RAW_DIR = ROOT / "data" / "raw"

WINDOW_START = date(2021, 1, 1)
MIN_VALID_DAYS = 25  # a month with fewer valid days is treated as missing
# Plausibility limits for Guanacaste. The wettest month in the good 2021-2026 series is ~1,300 mm
# and the wettest year ~2,600 mm. On 25 Oct 2026 POWER returned rainfall exactly 24 times too high
# for every month; these limits stop such a download from overwriting good data (decision D21).
MAX_MONTH_RAIN_MM = 2500
MAX_YEAR_RAIN_MM = 6000

POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
# At most 20 parameters per point request. If the full set fails, retry with the basic set.
FULL_PARAMS = ["PRECTOTCORR", "T2M", "T2M_MAX", "T2M_MIN", "RH2M",
               "ALLSKY_SFC_SW_DWN", "WS2M", "GWETTOP", "GWETROOT"]
BASIC_PARAMS = ["PRECTOTCORR", "T2M", "T2M_MAX", "T2M_MIN"]

ENSO_URLS = [
    ("RONI", "https://www.cpc.ncep.noaa.gov/data/indices/RONI.ascii.txt"),
    ("ONI", "https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt"),
]
SEASONS_3M = ["DJF", "JFM", "FMA", "MAM", "AMJ", "MJJ",
              "JJA", "JAS", "ASO", "SON", "OND", "NDJ"]

USER_AGENT = "IririaSisu-SpaceApps2026/1.0 (+https://github.com/joseantoniochavezurena2610-stack/iriria_sisu)"
ENSO_RULE = ("≥ 5 consecutive overlapping 3-month seasons above +0.5 °C (El Niño) or below −0.5 °C (La Niña); "
             "an ongoing episode with ≥ 3 seasons is also labelled (ongoing) and months not yet published "
             "inherit its phase (estimated)")


# ------------------------------------------------------------------ helpers
def http_get(url: str, attempts: int = 4, wait: float = 5.0) -> bytes:
    last_error = None
    for i in range(attempts):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=180) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            last_error = e
            if 400 <= e.code < 500 and e.code != 429:
                raise  # bad request: retrying will not help
        except (urllib.error.URLError, TimeoutError) as e:
            last_error = e
        time.sleep(wait * (i + 1))
    raise RuntimeError(f"Could not download {url}: {last_error}")


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def rnd(x, n=2):
    return None if x is None else round(x, n)


# ------------------------------------------------------------ evapotranspiration
def extraterrestrial_radiation_mm(lat_deg: float, day_of_year: int) -> float:
    """Ra (FAO-56, eq. 21) converted to equivalent mm/day (× 0.408)."""
    phi = math.radians(lat_deg)
    dr = 1 + 0.033 * math.cos(2 * math.pi * day_of_year / 365)
    delta = 0.409 * math.sin(2 * math.pi * day_of_year / 365 - 1.39)
    ws = math.acos(max(-1.0, min(1.0, -math.tan(phi) * math.tan(delta))))
    ra_mj = (24 * 60 / math.pi) * 0.0820 * dr * (
        ws * math.sin(phi) * math.sin(delta) + math.cos(phi) * math.cos(delta) * math.sin(ws))
    return 0.408 * ra_mj


def et0_hargreaves(tmean, tmax, tmin, lat, day_of_year):
    """Daily ET0 (mm) with the Hargreaves equation (FAO-56, eq. 52)."""
    if None in (tmean, tmax, tmin) or tmax < tmin:
        return None
    ra = extraterrestrial_radiation_mm(lat, day_of_year)
    return 0.0023 * (tmean + 17.8) * math.sqrt(tmax - tmin) * ra


# ------------------------------------------------------------------ NASA POWER
def download_power(lat: float, lon: float, end: date) -> dict:
    for params in (FULL_PARAMS, BASIC_PARAMS):
        q = urllib.parse.urlencode({
            "parameters": ",".join(params), "community": "AG",
            "latitude": f"{lat:.4f}", "longitude": f"{lon:.4f}",
            "start": WINDOW_START.strftime("%Y%m%d"), "end": end.strftime("%Y%m%d"),
            "format": "JSON", "time-standard": "LST",
        })
        try:
            return json.loads(http_get(f"{POWER_URL}?{q}"))
        except urllib.error.HTTPError as e:
            print(f"  POWER rejected {len(params)} parameters (HTTP {e.code}); retrying with fewer…", file=sys.stderr)
    raise RuntimeError("POWER did not answer even with the basic parameters")


def process_power(raw: dict, lat: float) -> dict:
    """Turns the daily POWER response into monthly totals/means."""
    p = raw["properties"]["parameter"]
    fill = raw.get("header", {}).get("fill_value", -999)

    def value(name, key):
        v = p.get(name, {}).get(key)
        return None if v is None or v == fill or v <= -900 else float(v)

    months: dict[tuple[int, int], dict] = {}
    last_valid_day = None
    for key in sorted(p["PRECTOTCORR"].keys()):
        d = datetime.strptime(key, "%Y%m%d").date()
        rain = value("PRECTOTCORR", key)
        if rain is None:
            continue
        last_valid_day = d
        m = months.setdefault((d.year, d.month), {"days": 0, "P": 0.0, "ET0": 0.0, "days_et0": 0,
                                                   "sum": {}, "n": {}})
        m["days"] += 1
        m["P"] += rain
        tmean, tmax, tmin = value("T2M", key), value("T2M_MAX", key), value("T2M_MIN", key)
        et0 = et0_hargreaves(tmean, tmax, tmin, lat, d.timetuple().tm_yday)
        if et0 is not None:
            m["ET0"] += et0
            m["days_et0"] += 1
        for name in ("T2M", "T2M_MAX", "T2M_MIN", "RH2M", "ALLSKY_SFC_SW_DWN", "WS2M", "GWETTOP", "GWETROOT"):
            v = value(name, key)
            if v is not None:
                m["sum"][name] = m["sum"].get(name, 0.0) + v
                m["n"][name] = m["n"].get(name, 0) + 1

    out = []
    for (year, month), m in sorted(months.items()):
        if m["days"] < MIN_VALID_DAYS:
            continue  # incomplete month: nothing is invented
        days_in_month = (date(year + (month == 12), month % 12 + 1, 1) - date(year, month, 1)).days
        avg = {k: m["sum"][k] / m["n"][k] for k in m["sum"]}
        scale = days_in_month / m["days"]  # fills the few missing days of the month
        out.append({
            "year": year, "month": month,
            "P": rnd(m["P"] * scale, 1),
            "ET0": rnd(m["ET0"] * days_in_month / m["days_et0"], 1) if m["days_et0"] >= MIN_VALID_DAYS else None,
            "T": rnd(avg.get("T2M")), "Tmax": rnd(avg.get("T2M_MAX")),
            "Tmin": rnd(avg.get("T2M_MIN")), "RH": rnd(avg.get("RH2M"), 1),
            "Rad": rnd(avg.get("ALLSKY_SFC_SW_DWN")), "Wind": rnd(avg.get("WS2M")),
            "GWETTOP": rnd(avg.get("GWETTOP"), 3), "GWETROOT": rnd(avg.get("GWETROOT"), 3),
            "days": m["days"],
        })
    return {"months": out, "last_day": last_valid_day.isoformat() if last_valid_day else None}


def check_plausible(months: list[dict], units: str | None) -> None:
    """Raises ValueError if the rainfall cannot be real (e.g. a units change at the source)."""
    wettest = max(months, key=lambda m: m["P"] or 0) if months else None
    if wettest and wettest["P"] > MAX_MONTH_RAIN_MM:
        raise ValueError(f"implausible rainfall: {wettest['P']:.0f} mm in {wettest['year']}-{wettest['month']:02d} "
                         f"(limit {MAX_MONTH_RAIN_MM} mm; POWER units reported: {units!r}). Keeping the previous data.")
    years: dict[int, list[float]] = {}
    for m in months:
        years.setdefault(m["year"], []).append(m["P"] or 0)
    for y, vals in years.items():
        if len(vals) == 12 and sum(vals) > MAX_YEAR_RAIN_MM:
            raise ValueError(f"implausible rainfall: {sum(vals):.0f} mm in {y} (limit {MAX_YEAR_RAIN_MM} mm; "
                             f"POWER units reported: {units!r}). Keeping the previous data.")


# ----------------------------------------------------------------------- ENSO
def parse_index(text: str) -> list[dict]:
    rows = []
    for line in text.splitlines():
        parts = line.split()
        if len(parts) < 3 or parts[0] not in SEASONS_3M:
            continue
        try:
            year, anom = int(parts[1]), float(parts[-1])
        except ValueError:
            continue
        centre_month = SEASONS_3M.index(parts[0]) + 1  # DJF → January, …, NDJ → December
        rows.append({"year": year, "month": centre_month, "anom": anom})
    return rows


def classify_enso(rows: list[dict], threshold: float = 0.5, today: date | None = None) -> list[dict]:
    """NOAA rule: El Niño/La Niña when the index passes the threshold for ≥ 5 consecutive seasons.

    An ONGOING episode at the end of the series cannot reach 5 seasons yet; if it already has
    ≥ 3 and is still past the threshold it is labelled anyway (ongoing=True), as NOAA does when it
    declares "El Niño conditions". Recent months the index has not published yet (~1-2 month lag)
    inherit the ongoing phase, marked estimated=True.
    """
    rows = sorted(rows, key=lambda r: (r["year"], r["month"]))
    sign = [1 if r["anom"] >= threshold else -1 if r["anom"] <= -threshold else 0 for r in rows]
    phase = ["neutral"] * len(rows)
    ongoing = [False] * len(rows)
    i = 0
    while i < len(rows):
        j = i
        while j < len(rows) and sign[j] == sign[i] and sign[i] != 0:
            j += 1
        length, at_end = j - i, j == len(rows)
        if length >= 5 or (at_end and length >= 3):
            for k in range(i, j):
                phase[k] = "el_nino" if sign[i] > 0 else "la_nina"
                ongoing[k] = at_end and length < 5
        i = max(j, i + 1)
    out = [{"year": r["year"], "month": r["month"], "anom": r["anom"], "phase": ph, **({"ongoing": True} if og else {})}
           for r, ph, og in zip(rows, phase, ongoing)]
    # Recent months with no published index inherit the current phase (max. 3 months).
    if out and out[-1]["phase"] != "neutral":
        today = today or datetime.now(timezone.utc).date()
        y, m = out[-1]["year"], out[-1]["month"]
        for _ in range(3):
            y, m = (y + 1, 1) if m == 12 else (y, m + 1)
            if (y, m) > (today.year, today.month):
                break
            out.append({"year": y, "month": m, "anom": None, "phase": out[-1]["phase"], "estimated": True})
    return out


def update_enso() -> None:
    for name, url in ENSO_URLS:
        try:
            rows = parse_index(http_get(url, attempts=2).decode("utf-8", "replace"))
            if len(rows) < 24:
                raise ValueError("file has no recognisable rows")
            months = [r for r in classify_enso(rows) if r["year"] >= WINDOW_START.year]
            write_json(WEB_DATA / "enso.json", {
                "source": f"NOAA CPC — {name} ({url})",
                "threshold": 0.5, "automatic": True,
                "generated": datetime.now(timezone.utc).date().isoformat(),
                "rule": ENSO_RULE,
                "months": months,
            })
            print(f"ENSO updated with {name}: {len(months)} months")
            return
        except Exception as e:  # noqa: BLE001 — report and try the next source
            print(f"Could not use {name}: {e}", file=sys.stderr)
    print("Keeping the existing ENSO table.", file=sys.stderr)


# ---------------------------------------------------------------------- main
def main() -> int:
    points = json.loads((REGION_DIR / "points.json").read_text(encoding="utf-8"))["points"]
    end = datetime.now(timezone.utc).date() - timedelta(days=1)
    summary = {"region": "Guanacaste", "window_start": WINDOW_START.isoformat(),
               "generated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
               "source": "NASA POWER, daily API, AG community (https://power.larc.nasa.gov)",
               "points": []}
    errors = 0
    implausible = 0
    for pt in points:
        print(f"→ {pt['name']} ({pt['lat']}, {pt['lon']})")
        try:
            raw = download_power(pt["lat"], pt["lon"], end)
            write_json(RAW_DIR / f"power_{pt['id']}.json", raw)
            proc = process_power(raw, pt["lat"])
            units = (raw.get("parameters", {}).get("PRECTOTCORR") or {}).get("units")
            check_plausible(proc["months"], units)
        except ValueError as e:
            errors += 1
            implausible += 1
            print(f"  REJECTED: {e}", file=sys.stderr)
            continue
        except Exception as e:  # noqa: BLE001
            errors += 1
            print(f"  ERROR: {e}", file=sys.stderr)
            continue
        cell = raw.get("geometry", {}).get("coordinates", [None, None])
        data = {
            "id": pt["id"], "name": pt["name"], "lat": pt["lat"], "lon": pt["lon"],
            "power_cell": {"lon": cell[0], "lat": cell[1]},
            "source": summary["source"],
            "parameters": sorted(raw["properties"]["parameter"].keys()),
            "power_rain_units": units,
            "units": {"P": "mm/month", "ET0": "mm/month (Hargreaves, FAO-56)", "T": "°C", "Tmax": "°C",
                      "Tmin": "°C", "RH": "%", "Rad": "kWh/m²/day", "Wind": "m/s",
                      "GWETTOP": "fraction 0-1 (0-5 cm)", "GWETROOT": "fraction 0-1 (root zone)"},
            "last_day": proc["last_day"],
            "months": proc["months"],
        }
        write_json(REGION_DIR / f"climate_{pt['id']}.json", data)
        summary["points"].append({"id": pt["id"], "name": pt["name"], "months": len(proc["months"]),
                                  "last_day": proc["last_day"], "power_cell": data["power_cell"]})
        print(f"  {len(proc['months'])} complete months, last day {proc['last_day']}")
        time.sleep(2)  # be gentle with the API

    if implausible:
        # Fail the whole run: the workflow then stops before its commit step, so nothing is pushed.
        print(f"Stopped: {implausible} location(s) returned implausible rainfall. Nothing will be committed.", file=sys.stderr)
        return 1

    # Cantons sharing the same POWER meteorology cell (MERRA-2: 0.5° lat × 0.625° lon).
    # The API returns the requested coordinates, not the cell centre, so it is computed here.
    cells: dict[str, list[str]] = {}
    for p in summary["points"]:
        pt = next(x for x in points if x["id"] == p["id"])
        key = f"{round(pt['lat'] / 0.5) * 0.5:.2f},{round(pt['lon'] / 0.625) * 0.625:.3f}"
        p["merra2_cell"] = key
        cells.setdefault(key, []).append(p["name"])
    summary["cantons_per_cell"] = list(cells.values())
    write_json(REGION_DIR / "summary.json", summary)

    update_enso()
    print(f"Done. Locations with errors: {errors}")
    return 1 if errors == len(points) else 0


if __name__ == "__main__":
    sys.exit(main())
