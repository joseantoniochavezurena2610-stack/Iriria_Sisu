#!/usr/bin/env python3
"""
Descarga y procesa los datos NASA de la región piloto (Guanacaste) para la web.

- NASA POWER (diario, comunidad AG, sin cuenta): lluvia, temperatura, humedad
  relativa, radiación y humedad de suelo (GWETTOP / GWETROOT).
- Índice ENSO de NOAA CPC (RONI y, si falla, ONI) para clasificar cada mes
  como El Niño, La Niña o neutral.

Ventana de datos: desde 2021-01-01 hasta el último día disponible
(regla del equipo: mínimo 5 años hacia acá).

Solo usa la biblioteca estándar de Python. Lo corre el workflow
.github/workflows/datos.yml; también se puede correr a mano:

    python scripts/descargar_datos.py

Salida (se versiona en el repo, es pequeña):
    web/data/guanacaste/clima_<id>.json
    web/data/guanacaste/resumen.json
    web/data/enso.json
Los JSON crudos de POWER quedan en data/raw/ (ignorado por git).
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

RAIZ = Path(__file__).resolve().parents[1]
WEB_DATA = RAIZ / "web" / "data"
DIR_REGION = WEB_DATA / "guanacaste"
DIR_CRUDO = RAIZ / "data" / "raw"

VENTANA_INICIO = date(2021, 1, 1)
MIN_DIAS_VALIDOS = 25  # un mes con menos días válidos se marca como sin dato

POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
# Máximo 20 parámetros por consulta de punto. Si el conjunto completo falla,
# se reintenta con el básico.
PARAMS_COMPLETOS = ["PRECTOTCORR", "T2M", "T2M_MAX", "T2M_MIN", "RH2M",
                    "ALLSKY_SFC_SW_DWN", "WS2M", "GWETTOP", "GWETROOT"]
PARAMS_BASICOS = ["PRECTOTCORR", "T2M", "T2M_MAX", "T2M_MIN"]

ENSO_URLS = [
    ("RONI", "https://www.cpc.ncep.noaa.gov/data/indices/RONI.ascii.txt"),
    ("ONI", "https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt"),
]
TEMPORADAS = ["DJF", "JFM", "FMA", "MAM", "AMJ", "MJJ",
              "JJA", "JAS", "ASO", "SON", "OND", "NDJ"]

AGENTE = "IririaSisu-SpaceApps2026/1.0 (+https://github.com/joseantoniochavezurena2610-stack/iriria_sisu)"


# ---------------------------------------------------------------- utilidades
def http_get(url: str, intentos: int = 4, espera: float = 5.0) -> bytes:
    ultimo_error = None
    for i in range(intentos):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": AGENTE})
            with urllib.request.urlopen(req, timeout=180) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            ultimo_error = e
            if 400 <= e.code < 500 and e.code != 429:
                raise  # error de la consulta: no sirve reintentar
        except (urllib.error.URLError, TimeoutError) as e:
            ultimo_error = e
        time.sleep(espera * (i + 1))
    raise RuntimeError(f"No se pudo descargar {url}: {ultimo_error}")


def escribir_json(ruta: Path, datos) -> None:
    ruta.parent.mkdir(parents=True, exist_ok=True)
    ruta.write_text(json.dumps(datos, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def redondear(x, n=2):
    return None if x is None else round(x, n)


# ------------------------------------------------------------ evapotranspiración
def radiacion_extraterrestre_mm(lat_grados: float, dia_juliano: int) -> float:
    """Ra (FAO-56, ec. 21) convertida a mm/día equivalentes (× 0,408)."""
    phi = math.radians(lat_grados)
    dr = 1 + 0.033 * math.cos(2 * math.pi * dia_juliano / 365)
    delta = 0.409 * math.sin(2 * math.pi * dia_juliano / 365 - 1.39)
    ws = math.acos(max(-1.0, min(1.0, -math.tan(phi) * math.tan(delta))))
    ra_mj = (24 * 60 / math.pi) * 0.0820 * dr * (
        ws * math.sin(phi) * math.sin(delta) + math.cos(phi) * math.cos(delta) * math.sin(ws))
    return 0.408 * ra_mj


def et0_hargreaves(tmed, tmax, tmin, lat, dia_juliano):
    """ET0 diaria (mm) con la ecuación de Hargreaves (FAO-56, ec. 52)."""
    if None in (tmed, tmax, tmin) or tmax < tmin:
        return None
    ra = radiacion_extraterrestre_mm(lat, dia_juliano)
    return 0.0023 * (tmed + 17.8) * math.sqrt(tmax - tmin) * ra


# ------------------------------------------------------------------ NASA POWER
def descargar_power(lat: float, lon: float, fin: date) -> dict:
    for params in (PARAMS_COMPLETOS, PARAMS_BASICOS):
        q = urllib.parse.urlencode({
            "parameters": ",".join(params), "community": "AG",
            "latitude": f"{lat:.4f}", "longitude": f"{lon:.4f}",
            "start": VENTANA_INICIO.strftime("%Y%m%d"), "end": fin.strftime("%Y%m%d"),
            "format": "JSON", "time-standard": "LST",
        })
        try:
            return json.loads(http_get(f"{POWER_URL}?{q}"))
        except urllib.error.HTTPError as e:
            print(f"  POWER rechazó {len(params)} parámetros (HTTP {e.code}); reintento con menos…", file=sys.stderr)
    raise RuntimeError("POWER no respondió ni con los parámetros básicos")


def procesar_power(crudo: dict, lat: float) -> dict:
    """Convierte la respuesta diaria de POWER en totales/promedios mensuales."""
    p = crudo["properties"]["parameter"]
    relleno = crudo.get("header", {}).get("fill_value", -999)

    def valor(nombre, clave):
        v = p.get(nombre, {}).get(clave)
        return None if v is None or v == relleno or v <= -900 else float(v)

    meses: dict[tuple[int, int], dict] = {}
    ultimo_dia_valido = None
    for clave in sorted(p["PRECTOTCORR"].keys()):
        d = datetime.strptime(clave, "%Y%m%d").date()
        lluvia = valor("PRECTOTCORR", clave)
        if lluvia is None:
            continue
        ultimo_dia_valido = d
        m = meses.setdefault((d.year, d.month), {"dias": 0, "P": 0.0, "ET0": 0.0, "dias_et0": 0,
                                                 "acum": {}, "n": {}})
        m["dias"] += 1
        m["P"] += lluvia
        tmed, tmax, tmin = valor("T2M", clave), valor("T2M_MAX", clave), valor("T2M_MIN", clave)
        et0 = et0_hargreaves(tmed, tmax, tmin, lat, d.timetuple().tm_yday)
        if et0 is not None:
            m["ET0"] += et0
            m["dias_et0"] += 1
        for nombre in ("T2M", "T2M_MAX", "T2M_MIN", "RH2M", "ALLSKY_SFC_SW_DWN", "WS2M", "GWETTOP", "GWETROOT"):
            v = valor(nombre, clave)
            if v is not None:
                m["acum"][nombre] = m["acum"].get(nombre, 0.0) + v
                m["n"][nombre] = m["n"].get(nombre, 0) + 1

    salida = []
    for (anio, mes), m in sorted(meses.items()):
        if m["dias"] < MIN_DIAS_VALIDOS:
            continue  # mes incompleto: no se inventa nada
        dias_mes = ((date(anio + (mes == 12), mes % 12 + 1, 1) - date(anio, mes, 1)).days)
        prom = {k: m["acum"][k] / m["n"][k] for k in m["acum"]}
        escala = dias_mes / m["dias"]  # completa los pocos días faltantes del mes
        salida.append({
            "anio": anio, "mes": mes,
            "P": redondear(m["P"] * escala, 1),
            "ET0": redondear(m["ET0"] * dias_mes / m["dias_et0"], 1) if m["dias_et0"] >= MIN_DIAS_VALIDOS else None,
            "T": redondear(prom.get("T2M")), "Tmax": redondear(prom.get("T2M_MAX")),
            "Tmin": redondear(prom.get("T2M_MIN")), "HR": redondear(prom.get("RH2M"), 1),
            "Rad": redondear(prom.get("ALLSKY_SFC_SW_DWN")), "Viento": redondear(prom.get("WS2M")),
            "GWETTOP": redondear(prom.get("GWETTOP"), 3), "GWETROOT": redondear(prom.get("GWETROOT"), 3),
            "dias": m["dias"],
        })
    return {"meses": salida, "ultimo_dia": ultimo_dia_valido.isoformat() if ultimo_dia_valido else None}


# ----------------------------------------------------------------------- ENSO
def parsear_indice(texto: str) -> list[dict]:
    filas = []
    for linea in texto.splitlines():
        partes = linea.split()
        if len(partes) < 3 or partes[0] not in TEMPORADAS:
            continue
        try:
            anio, anom = int(partes[1]), float(partes[-1])
        except ValueError:
            continue
        mes_central = TEMPORADAS.index(partes[0]) + 1  # DJF → enero, …, NDJ → diciembre
        filas.append({"anio": anio, "mes": mes_central, "anom": anom})
    return filas


def clasificar_enso(filas: list[dict], umbral: float = 0.5) -> list[dict]:
    """Regla NOAA: El Niño/La Niña si el índice supera el umbral en ≥ 5 temporadas seguidas."""
    filas = sorted(filas, key=lambda f: (f["anio"], f["mes"]))
    signo = [1 if f["anom"] >= umbral else -1 if f["anom"] <= -umbral else 0 for f in filas]
    fase = ["neutral"] * len(filas)
    i = 0
    while i < len(filas):
        j = i
        while j < len(filas) and signo[j] == signo[i] and signo[i] != 0:
            j += 1
        if j - i >= 5:
            for k in range(i, j):
                fase[k] = "el_nino" if signo[i] > 0 else "la_nina"
        i = max(j, i + 1)
    return [{"anio": f["anio"], "mes": f["mes"], "anom": f["anom"], "fase": ph}
            for f, ph in zip(filas, fase)]


def actualizar_enso() -> None:
    for nombre, url in ENSO_URLS:
        try:
            filas = parsear_indice(http_get(url, intentos=2).decode("utf-8", "replace"))
            if len(filas) < 24:
                raise ValueError("archivo sin filas reconocibles")
            meses = [f for f in clasificar_enso(filas) if f["anio"] >= VENTANA_INICIO.year]
            escribir_json(WEB_DATA / "enso.json", {
                "fuente": f"NOAA CPC — {nombre} ({url})",
                "umbral": 0.5, "automatico": True,
                "generado": datetime.now(timezone.utc).date().isoformat(),
                "regla": "≥ 5 temporadas trimestrales seguidas sobre +0,5 °C (El Niño) o bajo −0,5 °C (La Niña)",
                "meses": meses,
            })
            print(f"ENSO actualizado con {nombre}: {len(meses)} meses")
            return
        except Exception as e:  # noqa: BLE001 — se informa y se prueba la siguiente fuente
            print(f"No se pudo usar {nombre}: {e}", file=sys.stderr)
    print("Se conserva la tabla ENSO de respaldo existente.", file=sys.stderr)


# ---------------------------------------------------------------------- main
def main() -> int:
    puntos = json.loads((DIR_REGION / "puntos.json").read_text(encoding="utf-8"))["puntos"]
    fin = datetime.now(timezone.utc).date() - timedelta(days=1)
    resumen = {"region": "Guanacaste", "ventana_inicio": VENTANA_INICIO.isoformat(),
               "generado": datetime.now(timezone.utc).isoformat(timespec="seconds"),
               "fuente": "NASA POWER, API diaria, comunidad AG (https://power.larc.nasa.gov)",
               "puntos": []}
    errores = 0
    for pt in puntos:
        print(f"→ {pt['nombre']} ({pt['lat']}, {pt['lon']})")
        try:
            crudo = descargar_power(pt["lat"], pt["lon"], fin)
            escribir_json(DIR_CRUDO / f"power_{pt['id']}.json", crudo)
            proc = procesar_power(crudo, pt["lat"])
        except Exception as e:  # noqa: BLE001
            errores += 1
            print(f"  ERROR: {e}", file=sys.stderr)
            continue
        celda = crudo.get("geometry", {}).get("coordinates", [None, None])
        datos = {
            "id": pt["id"], "nombre": pt["nombre"], "lat": pt["lat"], "lon": pt["lon"],
            "celda_power": {"lon": celda[0], "lat": celda[1]},
            "fuente": resumen["fuente"],
            "parametros": sorted(crudo["properties"]["parameter"].keys()),
            "unidades": {"P": "mm/mes", "ET0": "mm/mes (Hargreaves, FAO-56)", "T": "°C", "Tmax": "°C",
                         "Tmin": "°C", "HR": "%", "Rad": "kWh/m²/día", "Viento": "m/s",
                         "GWETTOP": "fracción 0-1 (0-5 cm)", "GWETROOT": "fracción 0-1 (zona radicular)"},
            "ultimo_dia": proc["ultimo_dia"],
            "meses": proc["meses"],
        }
        escribir_json(DIR_REGION / f"clima_{pt['id']}.json", datos)
        resumen["puntos"].append({"id": pt["id"], "nombre": pt["nombre"], "meses": len(proc["meses"]),
                                  "ultimo_dia": proc["ultimo_dia"], "celda_power": datos["celda_power"]})
        print(f"  {len(proc['meses'])} meses completos, último día {proc['ultimo_dia']}")
        time.sleep(2)  # ser amables con la API

    # cantones que comparten celda de POWER
    celdas: dict[str, list[str]] = {}
    for p in resumen["puntos"]:
        celdas.setdefault(json.dumps(p["celda_power"]), []).append(p["nombre"])
    resumen["cantones_por_celda"] = [v for v in celdas.values()]
    escribir_json(DIR_REGION / "resumen.json", resumen)

    actualizar_enso()
    print(f"Listo. Puntos con error: {errores}")
    return 1 if errores == len(puntos) else 0


if __name__ == "__main__":
    sys.exit(main())
