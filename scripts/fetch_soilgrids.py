#!/usr/bin/env python3
"""
REFERENCE soil values (SoilGrids 2.0, ISRIC) for each pilot canton.

The SoilGrids REST API is paused (see docs.isric.org), so the WCS service is used.
This is EXPERIMENTAL: if it fails the app keeps working, because the farmer enters
pH and texture; SoilGrids is only offered as a "reference value" when they do not know.

Requires: pip install rasterio numpy
Output:   web/data/guanacaste/soil_reference.json
"""
import json
import sys
import tempfile
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import rasterio

ROOT = Path(__file__).resolve().parents[1]
REGION_DIR = ROOT / "web" / "data" / "guanacaste"
WCS = "https://maps.isric.org/mapserv"
CRS4326 = "http://www.opengis.net/def/crs/EPSG/0/4326"
# property: (factor to convert to a common unit, unit)
PROPERTIES = {"phh2o": (0.1, "pH"), "clay": (0.1, "%"), "sand": (0.1, "%"),
              "silt": (0.1, "%"), "soc": (0.1, "g/kg")}
DEPTHS = ["0-5cm", "5-15cm", "15-30cm"]
HALF = 0.004  # ~400 m around the point


def read_wcs(prop: str, depth: str, lat: float, lon: float):
    for axes in (("long", "lat"), ("X", "Y")):
        q = [("map", f"/map/{prop}.map"), ("SERVICE", "WCS"), ("VERSION", "2.0.1"),
             ("REQUEST", "GetCoverage"), ("COVERAGEID", f"{prop}_{depth}_mean"),
             ("FORMAT", "GEOTIFF_INT16"),
             ("SUBSET", f"{axes[0]}({lon - HALF},{lon + HALF})"),
             ("SUBSET", f"{axes[1]}({lat - HALF},{lat + HALF})"),
             ("SUBSETTINGCRS", CRS4326), ("OUTPUTCRS", CRS4326)]
        url = f"{WCS}?{urllib.parse.urlencode(q)}"
        try:
            with urllib.request.urlopen(url, timeout=120) as r:
                content = r.read()
            with tempfile.NamedTemporaryFile(suffix=".tif") as tmp:
                tmp.write(content)
                tmp.flush()
                with rasterio.open(tmp.name) as ds:
                    a = ds.read(1).astype(float)
                    if ds.nodata is not None:
                        a[a == ds.nodata] = np.nan
                    a[a <= 0] = np.nan
            if np.isfinite(a).any():
                return float(np.nanmedian(a))
        except Exception as e:  # noqa: BLE001
            print(f"    {prop} {depth} with axes {axes}: {e}", file=sys.stderr)
    return None


def texture_class(sand, clay):
    """Simplified to the 3 classes the app uses."""
    if sand is None or clay is None:
        return None
    if clay >= 35:
        return "clay"
    if sand >= 60:
        return "sandy"
    return "loam"


def main() -> int:
    points = json.loads((REGION_DIR / "points.json").read_text(encoding="utf-8"))["points"]
    out = {"source": "SoilGrids 2.0 (ISRIC), WCS service, 0-30 cm mean — MODELLED values, not measured",
           "license": "CC BY 4.0",
           "generated": datetime.now(timezone.utc).date().isoformat(), "points": {}}
    for pt in points:
        print(f"→ {pt['name']}")
        v = {}
        for prop, (factor, _) in PROPERTIES.items():
            vals = [read_wcs(prop, d, pt["lat"], pt["lon"]) for d in DEPTHS]
            vals = [x * factor for x in vals if x is not None]
            v[prop] = round(sum(vals) / len(vals), 2) if vals else None
        v["texture_class"] = texture_class(v.get("sand"), v.get("clay"))
        out["points"][pt["id"]] = v
        print(f"  {v}")
    if not any(any(x is not None for x in p.values()) for p in out["points"].values()):
        print("SoilGrids returned no values; the file is not written.", file=sys.stderr)
        return 1
    (REGION_DIR / "soil_reference.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
