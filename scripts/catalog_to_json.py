#!/usr/bin/env python3
"""
Converts the crop catalog (a CSV the team edits) into the JSON used by the web app.

    python scripts/catalog_to_json.py

Input:   data/catalog/crops_guanacaste.csv
         data/catalog/crop_cantons.csv   (which cantons each crop is grown in; "all" = every canton)
Output:  web/data/crops.json
Fails with a clear message if a column is missing or a number is invalid,
so a mistake in the CSV never reaches the app.
"""
import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "data" / "catalog" / "crops_guanacaste.csv"
OUTPUT = ROOT / "web" / "data" / "crops.json"
CANTONS = ROOT / "data" / "catalog" / "crop_cantons.csv"
POINTS = ROOT / "web" / "data" / "guanacaste" / "points.json"

NUMBERS = ["cycle_days", "ph_min", "ph_max", "ph_opt_min", "ph_opt_max", "t_min_c", "t_opt_min_c",
           "t_opt_max_c", "t_max_c", "kc_season", "waterlogging_tolerance", "drought_tolerance",
           "n_supply_kg_ha", "n_demand_kg_ha", "cover", "residue", "relative_margin"]
OPTIONAL = ["yield_t_ha", "price_crc_kg", "production_cost_crc_ha"]
TEXT = ["id", "seasons", "name", "family", "group", "agronomic_source", "economic_source", "economic_confidence", "verified_by"]
BOOLEANS = ["legume", "green_manure"]
VALID_SEASONS = ("dry", "primera", "postrera")


def main() -> int:
    with INPUT.open(encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    missing = [c for c in NUMBERS + OPTIONAL + TEXT + BOOLEANS if c not in rows[0]]
    if missing:
        print(f"Missing columns in the CSV: {missing}", file=sys.stderr)
        return 1
    crops, errors = [], []
    for n, row in enumerate(rows, start=2):
        c = {k: row[k].strip() for k in TEXT}
        c["seasons"] = [s.strip() for s in c["seasons"].split(";") if s.strip()]
        bad = [s for s in c["seasons"] if s not in VALID_SEASONS]
        if bad or not c["seasons"]:
            errors.append(f"line {n} ({c['id']}): 'seasons' must be dry/primera/postrera separated by ';'")
        for k in BOOLEANS:
            c[k] = row[k].strip().lower() in ("yes", "y", "true", "1")
        for k in NUMBERS + OPTIONAL:
            v = row[k].strip()
            if v == "":
                if k in NUMBERS:
                    errors.append(f"line {n} ({c['id']}): '{k}' is empty")
                c[k] = None
                continue
            try:
                c[k] = float(v)
            except ValueError:
                errors.append(f"line {n} ({c['id']}): '{k}'='{v}' is not a number")
        if c.get("ph_min") is not None and c.get("ph_max") is not None and c["ph_min"] > c["ph_max"]:
            errors.append(f"line {n} ({c['id']}): ph_min > ph_max")
        crops.append(c)
    errors += add_cantons(crops)
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    OUTPUT.write_text(json.dumps({"source": str(INPUT.relative_to(ROOT)), "crops": crops},
                                 ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(crops)} crops → {OUTPUT.relative_to(ROOT)}")
    return 0


def add_cantons(crops: list) -> list:
    """Adds "cantons" (list of canton ids) to each crop; crops marked "all" get no list (= every canton)."""
    valid = {p["id"] for p in json.loads(POINTS.read_text(encoding="utf-8"))["points"]}
    with CANTONS.open(encoding="utf-8") as f:
        rows = {r["crop_id"].strip(): r for r in csv.DictReader(f)}
    errors = []
    for c in crops:
        row = rows.get(c["id"])
        if row is None:
            errors.append(f"{CANTONS.name}: crop '{c['id']}' has no row")
            continue
        value = row["cantons"].strip()
        if value == "all":
            continue
        ids = [x.strip() for x in value.split(";") if x.strip()]
        bad = [x for x in ids if x not in valid]
        if bad or not ids:
            errors.append(f"{CANTONS.name} ({c['id']}): unknown canton ids {bad}")
        c["cantons"] = ids
    for k in rows:
        if k not in {c["id"] for c in crops}:
            errors.append(f"{CANTONS.name}: '{k}' is not in the crop catalog")
    return errors


if __name__ == "__main__":
    sys.exit(main())
