#!/usr/bin/env python3
"""
Valores de REFERENCIA de suelo (SoilGrids 2.0, ISRIC) para cada cantón piloto.

La API REST de SoilGrids está pausada (ver docs.isric.org), así que se usa el
servicio WCS. Esto es EXPERIMENTAL: si falla, la app sigue funcionando porque
el pH y la textura los ingresa el agricultor; SoilGrids solo se ofrece como
"valor de referencia" cuando el agricultor no sabe.

Requiere: pip install rasterio numpy
Salida:   web/data/guanacaste/suelo_referencia.json
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

RAIZ = Path(__file__).resolve().parents[1]
DIR_REGION = RAIZ / "web" / "data" / "guanacaste"
WCS = "https://maps.isric.org/mapserv"
CRS4326 = "http://www.opengis.net/def/crs/EPSG/0/4326"
# propiedad: (factor para pasar a unidad común, unidad)
PROPIEDADES = {"phh2o": (0.1, "pH"), "clay": (0.1, "%"), "sand": (0.1, "%"),
               "silt": (0.1, "%"), "soc": (0.1, "g/kg")}
PROFUNDIDADES = ["0-5cm", "5-15cm", "15-30cm"]
MEDIO = 0.004  # ~400 m alrededor del punto


def leer_wcs(prop: str, prof: str, lat: float, lon: float):
    for ejes in (("long", "lat"), ("X", "Y")):
        q = [("map", f"/map/{prop}.map"), ("SERVICE", "WCS"), ("VERSION", "2.0.1"),
             ("REQUEST", "GetCoverage"), ("COVERAGEID", f"{prop}_{prof}_mean"),
             ("FORMAT", "GEOTIFF_INT16"),
             ("SUBSET", f"{ejes[0]}({lon - MEDIO},{lon + MEDIO})"),
             ("SUBSET", f"{ejes[1]}({lat - MEDIO},{lat + MEDIO})"),
             ("SUBSETTINGCRS", CRS4326), ("OUTPUTCRS", CRS4326)]
        url = f"{WCS}?{urllib.parse.urlencode(q)}"
        try:
            with urllib.request.urlopen(url, timeout=120) as r:
                contenido = r.read()
            with tempfile.NamedTemporaryFile(suffix=".tif") as tmp:
                tmp.write(contenido)
                tmp.flush()
                with rasterio.open(tmp.name) as ds:
                    a = ds.read(1).astype(float)
                    if ds.nodata is not None:
                        a[a == ds.nodata] = np.nan
                    a[a <= 0] = np.nan
            if np.isfinite(a).any():
                return float(np.nanmedian(a))
        except Exception as e:  # noqa: BLE001
            print(f"    {prop} {prof} con ejes {ejes}: {e}", file=sys.stderr)
    return None


def clase_textura(arena, arcilla):
    """Simplificación a las 3 clases que usa la app."""
    if arena is None or arcilla is None:
        return None
    if arcilla >= 35:
        return "arcilloso"
    if arena >= 60:
        return "arenoso"
    return "franco"


def main() -> int:
    puntos = json.loads((DIR_REGION / "puntos.json").read_text(encoding="utf-8"))["puntos"]
    salida = {"fuente": "SoilGrids 2.0 (ISRIC), servicio WCS, media 0-30 cm — valores MODELADOS, no medidos",
              "licencia": "CC BY 4.0",
              "generado": datetime.now(timezone.utc).date().isoformat(), "puntos": {}}
    for pt in puntos:
        print(f"→ {pt['nombre']}")
        v = {}
        for prop, (factor, _) in PROPIEDADES.items():
            vals = [leer_wcs(prop, prof, pt["lat"], pt["lon"]) for prof in PROFUNDIDADES]
            vals = [x * factor for x in vals if x is not None]
            v[prop] = round(sum(vals) / len(vals), 2) if vals else None
        v["textura_app"] = clase_textura(v.get("sand"), v.get("clay"))
        salida["puntos"][pt["id"]] = v
        print(f"  {v}")
    if not any(any(x is not None for x in p.values()) for p in salida["puntos"].values()):
        print("SoilGrids no devolvió ningún valor; no se escribe el archivo.", file=sys.stderr)
        return 1
    (DIR_REGION / "suelo_referencia.json").write_text(
        json.dumps(salida, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
