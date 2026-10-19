#!/usr/bin/env python3
"""
Lluvia mensual GPM IMERG (Final, V07, ~10 km) para los cantones piloto, 2021 → hoy.

Sirve para CONTRASTAR la lluvia de NASA POWER (malla de decenas de km) con un
producto satelital de mejor detalle. Es una mejora: la app funciona sin él.

Requiere una cuenta gratuita de NASA Earthdata. En GitHub se guardan como
secrets del repo: EARTHDATA_USERNAME y EARTHDATA_PASSWORD (nunca en el código).

    pip install earthaccess xarray h5netcdf numpy
    EARTHDATA_USERNAME=... EARTHDATA_PASSWORD=... python scripts/descargar_imerg.py

Salida: web/data/guanacaste/imerg_mensual.json
"""
import calendar
import json
import os
import sys
from datetime import date, datetime, timezone
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
DIR_REGION = RAIZ / "web" / "data" / "guanacaste"
CAJA = (-86.0, 9.8, -84.7, 11.3)  # oeste, sur, este, norte (Guanacaste con margen)


def main() -> int:
    if not os.environ.get("EARTHDATA_USERNAME"):
        print("Sin credenciales de Earthdata: se omite IMERG.")
        return 0
    import earthaccess
    import xarray as xr

    earthaccess.login(strategy="environment")
    resultados = earthaccess.search_data(short_name="GPM_3IMERGM", version="07",
                                         temporal=("2021-01-01", date.today().isoformat()),
                                         bounding_box=CAJA)
    print(f"{len(resultados)} archivos mensuales encontrados")
    archivos = earthaccess.download(resultados, local_path=str(RAIZ / "data" / "raw" / "imerg"))
    puntos = json.loads((DIR_REGION / "puntos.json").read_text(encoding="utf-8"))["puntos"]
    series = {p["id"]: [] for p in puntos}
    for ruta in sorted(map(str, archivos)):
        ds = xr.open_dataset(ruta, group="Grid", engine="h5netcdf")
        t = ds["time"].values[0]
        fecha = datetime.utcfromtimestamp(t.astype("datetime64[s]").astype(int)) if hasattr(t, "astype") else t
        horas = calendar.monthrange(fecha.year, fecha.month)[1] * 24
        for p in puntos:
            v = float(ds["precipitation"].sel(lat=p["lat"], lon=p["lon"], method="nearest").values.squeeze())
            series[p["id"]].append({"anio": fecha.year, "mes": fecha.month,
                                    "P": None if v < 0 else round(v * horas, 1)})
        ds.close()
    (DIR_REGION / "imerg_mensual.json").write_text(json.dumps({
        "fuente": "GPM IMERG Final Precipitation L3 1 month 0.1° V07 (GPM_3IMERGM), NASA GES DISC",
        "unidades": {"P": "mm/mes"},
        "generado": datetime.now(timezone.utc).date().isoformat(),
        "series": series}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("IMERG listo")
    return 0


if __name__ == "__main__":
    sys.exit(main())
