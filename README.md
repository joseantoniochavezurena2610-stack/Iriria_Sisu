# Iriria Sìsù🌱

Proyecto para el **NASA International Space Apps Challenge 2026** (14–15 de noviembre de 2026).

## 🎯 Reto elegido
> Cambio de Rumbo: Adaptando las granjas con datos de la NASA

**Problema:** En el Pacífico Norte de Costa Rica, El Niño 2026-27 ya recortó cerca de un 37 % la lluvia (ene-ago 2026) y el IMN prevé efectos al menos hasta julio de 2027. Los productores de granos deciden qué sembrar sin una herramienta que una el clima que viene, el suelo de su finca y su economía.

**Categorías objetivo:** Galactic Impact · Best Use of Science

## 💡 La idea de nuestra resolución (esto es lo que decimos en el pitch)
Una herramienta que compara **2-3 planes de rotación a 3 años** para una finca concreta y muestra qué le pasa al **suelo, al agua, al riesgo y al ingreso** en un año normal y en un año El Niño. Usa datos NASA (POWER, IMERG, SMAP, HLS/VIIRS), el suelo de la finca (SoilGrids o análisis propio), rangos de cultivo de FAO ECOCROP, precios y costos reales, y un **sensor ESP32** en la parcela. La decisión siempre es del agricultor.

Detalle completo: [`docs/solucion.md`](docs/solucion.md)

## 🧪 Uso del método científico
- **Hipótesis:** en años El Niño, las rotaciones con leguminosas y cultivos de menor demanda hídrica tienen menor riesgo que el arroz continuo sin riego, sin sacrificar demasiado margen; y el mejor plan de un año normal no siempre es el mejor en un año El Niño.
- **Datos usados:** ver [`docs/fuentes-datos.md`](docs/fuentes-datos.md).
- **Análisis:** motor de decisión multicriterio con reglas transparentes (filtros de pH/agua/familia, balance hídrico tipo FAO-56, crédito de N de leguminosas, margen económico), comparado en escenarios con años análogos reales.
- **Validación:** backtest con El Niño 2015 y 2023, contraste con NDVI satelital, análisis de sensibilidad y revisión de un extensionista. Ver [`docs/roles/lider-cientifico.md`](docs/roles/lider-cientifico.md).

## 🌍 Impacto (por qué importa)
Costa Rica tiene 10 de los 12 órdenes de suelo del USDA: un promedio nacional no sirve, cada finca necesita su propia respuesta. La herramienta cuesta $0 de operar (datos abiertos + hosting gratuito) y puede usarse en las visitas de las agencias de extensión. El mismo motor sirve para cualquier región tropical con estación seca y ENSO (Centroamérica, Corredor Seco).

## 🛠️ Stack técnico
- **Lenguaje/Framework:** Python 3 + Streamlit (prototipo visual actual en `src/Iriria Sisu.html`)
- **Datos:** NASA POWER (requests), IMERG/SMAP/HLS (earthaccess / AppEEARS), SoilGrids; precalculados en Parquet
- **Motor:** módulo Python de reglas + pytest
- **Visualización:** Plotly + streamlit-folium
- **Hardware:** ESP32 + sensor capacitivo de humedad (calibrado) + DHT22

## 📚 Investigación
- [`docs/datos-confirmados.md`](docs/datos-confirmados.md) — **hoja rápida con solo los datos confirmados y su fuente**
- [`docs/investigacion/resumen-verificado.md`](docs/investigacion/resumen-verificado.md) — resumen de la investigación y verificación de cada dato (✅/⚠️/❓)
- [`docs/solucion.md`](docs/solucion.md) — solución v2, incluyendo el factor económico
- [`docs/roles/lider-cientifico.md`](docs/roles/lider-cientifico.md) — hipótesis, validación y tareas de ciencia
- [`data/catalogo/cultivos_plantilla.csv`](data/catalogo/cultivos_plantilla.csv) — catálogo de cultivos a llenar con fuentes

## 📂 Estructura del repo
```
Iriria Sìsù/
├── data/             # datasets (NO subir datasets pesados, usar .gitignore); data/catalogo/ sí se versiona
├── docs/             # pitch, plan, investigación, fuentes, solución
├── notebooks/        # exploración de datos, prototipos rápidos
├── src/              # código fuente de la solución final
├── assets/           # imágenes, logo, screenshots para README y submission
└── .github/workflows/ # CI opcional (lint/tests)
```

## 👥 Equipo — Iriria Sìsù
| Nombre | Rol |
|---|---|
| Juan Diego Chávez Ureña |  |
| Jose Antonio Chávez Ureña |Lider Cientifico |
| Britzie Yarith García Arias | _por definir_ |
| Angeli Abarca Ureña | _por definir_ |
| José Pablo Ramírez Fernández | _por definir_ |
| Nesly Mejía Jiménez | _por definir_ |

## 🧭 Planes por rol
Cada rol tiene su plan (antes del evento, durante las 48 h y entregables): [`docs/roles/`](docs/roles/README.md)

## 🎬 Demo / Pitch
- Video (30 seg, requerido para submission global): _[link]_
- Guion del pitch: [`docs/pitch.md`](docs/pitch.md)

## ⏱️ Cronograma de las 48 horas
Ver [`docs/plan.md`](docs/plan.md)

## 📜 Datos y licencias
Este proyecto usa datos abiertos de la NASA y sus agencias asociadas. Ver [`docs/fuentes-datos.md`](docs/fuentes-datos.md) para el detalle de cada dataset y su licencia.

## 🚀 Cómo correrlo
_[instrucciones de instalación cuando el stack esté decidido]_
