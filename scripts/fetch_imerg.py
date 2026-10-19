#!/usr/bin/env python3
"""
Monthly GPM IMERG rainfall (Final, V07, ~10 km) for the pilot cantons, 2021 → today.

Used to CROSS-CHECK the NASA POWER rainfall (a grid tens of km wide) against a satellite
product with finer detail. It is an improvement: the app works without it.

Requires a free NASA Earthdata account. On GitHub it is stored as repository secrets:
EARTHDATA_USERNAME and EARTHDATA_PASSWORD (never in the code).

    pip install earthaccess xarray h5netcdf numpy
    EARTHDATA_USERNAME=... EARTHDATA_PASSWORD=... python scripts/fetch_imerg.py

Output: web/data/guanacaste/imerg_monthly.json
"""
import calendar
import json
import os
import sys
from datetime import date, datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGION_DIR = ROOT / "web" / "data" / "guanacaste"
BBOX = (-86.0, 9.8, -84.7, 11.3)  # west, south, east, north (Guanacaste with margin)


def main() -> int:
    if not os.environ.get("EARTHDATA_USERNAME"):
        print("No Earthdata credentials: skipping IMERG.")
        return 0
    import earthaccess
    import xarray as xr

    earthaccess.login(strategy="environment")
    results = earthaccess.search_data(short_name="GPM_3IMERGM", version="07",
                                      temporal=("2021-01-01", date.today().isoformat()),
                                      bounding_box=BBOX)
    print(f"{len(results)} monthly files found")
    files = earthaccess.download(results, local_path=str(ROOT / "data" / "raw" / "imerg"))
    points = json.loads((REGION_DIR / "points.json").read_text(encoding="utf-8"))["points"]
    series = {p["id"]: [] for p in points}
    for path in sorted(map(str, files)):
        ds = xr.open_dataset(path, group="Grid", engine="h5netcdf")
        t = ds["time"].values[0]
        when = datetime.utcfromtimestamp(t.astype("datetime64[s]").astype(int)) if hasattr(t, "astype") else t
        hours = calendar.monthrange(when.year, when.month)[1] * 24
        for p in points:
            v = float(ds["precipitation"].sel(lat=p["lat"], lon=p["lon"], method="nearest").values.squeeze())
            series[p["id"]].append({"year": when.year, "month": when.month,
                                    "P": None if v < 0 else round(v * hours, 1)})
        ds.close()
    (REGION_DIR / "imerg_monthly.json").write_text(json.dumps({
        "source": "GPM IMERG Final Precipitation L3 1 month 0.1° V07 (GPM_3IMERGM), NASA GES DISC",
        "units": {"P": "mm/month"},
        "generated": datetime.now(timezone.utc).date().isoformat(),
        "series": series}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("IMERG done")
    return 0


if __name__ == "__main__":
    sys.exit(main())
