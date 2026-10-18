# Plan — Datos y motor (Ing. en sistemas)

**Misión:** que los datos NASA lleguen limpios al motor y que el motor devuelva 3 planes con puntajes reproducibles.

## Antes del evento
| Prioridad | Tarea | Entregable |
|---|---|---|
| 🔴 | Cuenta Earthdata + probar `earthaccess` | Login funcionando |
| 🔴 | Script POWER: lluvia, T2M, RH2M, radiación, `GWETROOT` diarios 1995-2025 para 3-5 puntos del Pacífico Norte | `notebooks/01_power.ipynb` + `data/processed/power_*.parquet` |
| 🔴 | Definir `contexto.json` (finca, suelo, clima por época, escenario) junto con Ciencia | `src/motor/esquema.py` |
| 🟠 | IMERG mensual para los mismos puntos (años 2015, 2023 y un año neutro) | Parquet |
| 🟠 | SoilGrids pH, textura y carbono por punto | Parquet |
| 🟠 | Esqueleto del motor: generar → filtrar → puntuar → combinar | `src/motor/` con `recomendar(contexto, prioridades)` |
| 🟡 | Pruebas pytest con casos conocidos que dé Ciencia | `tests/` |

## Diseño del motor (acordado con Ciencia)
- **Función pura:** `recomendar(contexto, prioridades) -> list[Plan]`. No sabe de Streamlit ni de la NASA.
- **Generación:** 3 años × 4 épocas (Seca, Primera, Canícula, Postrera) → limitar combinaciones (podar en cuanto una regla dura falla) para que corra en < 2 s.
- **Ejes 0-100:** Suelo, Agua, Riesgo, Ingreso; fórmulas en `docs/motor-reglas.md` (las escribe Ciencia).
- **Escenarios:** correr el mismo motor con clima neutro y El Niño; marcar planes robustos.
- **Salida:** cada plan trae puntajes por eje + lista de razones con los números que las sostienen (Diseño las convierte en texto).

## Durante las 48 h
- **H0-12:** pipeline cerrado y motor en consola con datos reales.
- **H12-20:** integrarlo a Streamlit con Diseño.
- **H20-30:** backtest 2015/2023 con Ciencia; arreglar bugs.
- **H30+:** solo correcciones; nada nuevo.

## Reglas
- Todo dato pesado fuera del repo (`.gitignore`); solo Parquet pequeño procesado.
- Ningún valor inventado: si falta un dato, el motor devuelve "sin dato".
- Cada función del motor con al menos una prueba.
