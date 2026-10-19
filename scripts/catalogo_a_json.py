#!/usr/bin/env python3
"""
Convierte el catálogo de cultivos (CSV que llena el equipo) en el JSON que usa la web.

    python scripts/catalogo_a_json.py

Entrada:  data/catalogo/cultivos_guanacaste.csv
Salida:   web/data/cultivos.json
Falla con un mensaje claro si falta una columna o un número no es válido,
para que un error en el CSV no llegue a la app.
"""
import csv
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
ENTRADA = RAIZ / "data" / "catalogo" / "cultivos_guanacaste.csv"
SALIDA = RAIZ / "web" / "data" / "cultivos.json"

NUMEROS = ["ciclo_dias", "ph_min", "ph_max", "ph_opt_min", "ph_opt_max", "t_min_c", "t_opt_min_c",
           "t_opt_max_c", "t_max_c", "kc_ciclo", "tolera_encharcamiento", "tolera_sequia",
           "aporte_n_kg_ha", "demanda_n_kg_ha", "cobertura", "residuos", "margen_relativo"]
OPCIONALES = ["rendimiento_t_ha", "precio_crc_kg", "costo_produccion_crc_ha"]
TEXTO = ["cultivo", "epocas", "nombre", "familia", "grupo", "fuente_agronomica", "fuente_economica", "verificado_por"]
BOOLEANOS = ["leguminosa", "abono_verde"]


def main() -> int:
    with ENTRADA.open(encoding="utf-8") as f:
        filas = list(csv.DictReader(f))
    faltan = [c for c in NUMEROS + OPCIONALES + TEXTO + BOOLEANOS if c not in filas[0]]
    if faltan:
        print(f"Faltan columnas en el CSV: {faltan}", file=sys.stderr)
        return 1
    cultivos, errores = [], []
    for n, fila in enumerate(filas, start=2):
        c = {k: fila[k].strip() for k in TEXTO}
        c["epocas"] = [e.strip() for e in c["epocas"].split(";") if e.strip()]
        malas = [e for e in c["epocas"] if e not in ("seca", "primera", "postrera")]
        if malas or not c["epocas"]:
            errores.append(f"línea {n} ({c['cultivo']}): 'epocas' debe ser seca/primera/postrera separadas por ';'")
        for k in BOOLEANOS:
            c[k] = fila[k].strip().lower() in ("si", "sí", "true", "1")
        for k in NUMEROS + OPCIONALES:
            v = fila[k].strip()
            if v == "":
                if k in NUMEROS:
                    errores.append(f"línea {n} ({c['cultivo']}): '{k}' está vacío")
                c[k] = None
                continue
            try:
                c[k] = float(v)
            except ValueError:
                errores.append(f"línea {n} ({c['cultivo']}): '{k}'='{v}' no es un número")
        if c.get("ph_min") is not None and c.get("ph_max") is not None and c["ph_min"] > c["ph_max"]:
            errores.append(f"línea {n} ({c['cultivo']}): ph_min > ph_max")
        cultivos.append(c)
    if errores:
        print("\n".join(errores), file=sys.stderr)
        return 1
    SALIDA.write_text(json.dumps({"fuente": str(ENTRADA.relative_to(RAIZ)), "cultivos": cultivos},
                                 ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(cultivos)} cultivos → {SALIDA.relative_to(RAIZ)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
