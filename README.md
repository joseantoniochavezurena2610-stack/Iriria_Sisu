# Iriria Sìsù 🌱

Proyecto para el **NASA International Space Apps Challenge 2026** (14–15 de noviembre de 2026).
Reto: **Cambio de rumbo — Adaptando las granjas con datos de la NASA.** Región piloto: **Guanacaste, Costa Rica.**

> **Entregables:** 🎬 video de máx. 30 s (subtítulos en inglés) · 🌐 prototipo web público.

## El problema
En el Pacífico Norte de Costa Rica, El Niño 2026-27 ya recortó cerca de un 37 % la lluvia (ene-ago 2026), los 11 cantones de Guanacaste están en alerta naranja y el IMN prevé efectos al menos hasta julio de 2027. Los productores de granos deciden qué sembrar sin una herramienta que una el clima que viene, el suelo de su finca y su economía.

## La solución
Una **página web** donde el agricultor (o el extensionista que lo visita) indica su cantón, qué siembra, si tiene riego, cómo es su suelo y qué le importa más. La app usa la **lluvia y temperatura reales de NASA POWER desde 2021** y el índice ENSO de NOAA para comparar **3 planes de rotación a 3 años** contra "seguir sembrando lo de hoy", mostrando el efecto en **suelo, agua, riesgo e ingreso** en un año normal y en un año El Niño. **No necesita sensores**: todo sale de lo que el agricultor sabe. La decisión siempre es suya.

Detalle: [`docs/solucion.md`](docs/solucion.md) · Decisiones: [`docs/decisiones.md`](docs/decisiones.md)

## Uso del método científico
- **Hipótesis:** en años El Niño, las rotaciones con leguminosas y cultivos tolerantes a sequía tienen menor riesgo que el arroz sin riego; y el mejor plan de un año normal no siempre es el mejor en un año El Niño.
- **Datos:** NASA POWER diario 2021 → hoy (11 cantones), índice ENSO de NOAA, FAO-56 y ECOCROP. Ver [`docs/fuentes-datos.md`](docs/fuentes-datos.md).
- **Análisis:** motor multicriterio con reglas transparentes: balance hídrico tipo FAO-56 con ET0 de Hargreaves, filtros de pH y calendario, efectos de rotación, riesgo calculado año por año. Ver [`docs/motor-reglas.md`](docs/motor-reglas.md).
- **Validación:** backtest con El Niño 2023 y 2026, sensibilidad ±20 %, contraste POWER vs IMERG, revisión de un extensionista y pruebas automáticas.

## 📚 Documentación
| Documento | Para qué |
|---|---|
| [`docs/Guia_repositorio_Iriria_Sisu.pdf`](docs/Guia_repositorio_Iriria_Sisu.pdf) | **Empiecen aquí:** guía en PDF de cómo está organizado el repo y qué leer |
| [`docs/glosario.md`](docs/glosario.md) | **Diccionario de términos técnicos** — léanlo todos |
| [`docs/decisiones.md`](docs/decisiones.md) | Qué decidimos y por qué |
| [`docs/plan.md`](docs/plan.md) | Plan semana a semana hasta el evento y las 48 h |
| [`docs/arquitectura.md`](docs/arquitectura.md) | Cómo está hecha la web, cómo publicarla y **dominio** |
| [`docs/motor-reglas.md`](docs/motor-reglas.md) | Fórmulas del motor |
| [`docs/guion-video.md`](docs/guion-video.md) | Guion del video de 30 s |
| [`docs/fuentes-datos.md`](docs/fuentes-datos.md) | Datasets, licencias y limitaciones |
| [`docs/datos-confirmados.md`](docs/datos-confirmados.md) | Solo datos verificados con fuente |
| [`docs/investigacion/`](docs/investigacion/) | El Niño 2021-2026 y verificación de la investigación |
| [`docs/roles/`](docs/roles/README.md) | Plan de cada persona |

## 🛠️ Stack
- **Web estática:** HTML + CSS + JavaScript (sin servidor, sin compilación). Mapa con Leaflet.
- **Motor:** `web/js/motor.js` (funciones puras, corre en el navegador) + pruebas con `node --test`.
- **Datos:** scripts en Python (biblioteca estándar) que corre **GitHub Actions** cada semana y guardan JSON en `web/data/`.
- **Publicación:** GitHub Pages + dominio propio (a cargo de José Pablo).

## 🚀 Cómo correrlo
```bash
python3 -m http.server 8000 --directory web    # abrir http://localhost:8000
npm test                                        # pruebas del motor (Node 20+)
```
Datos: se descargan solos con el workflow **datos** (pestaña *Actions*). A mano: `python3 scripts/descargar_datos.py`.

## 📂 Estructura
```
web/               app pública (index.html, css/, js/, data/)
scripts/           descarga y procesamiento de datos NASA/NOAA/SoilGrids/IMERG
data/catalogo/     catálogo de cultivos (CSV que llena el equipo)
tests/             pruebas del motor
docs/              decisiones, plan, glosario, arquitectura, investigación, roles
archivo/           prototipo anterior (referencia)
.github/workflows/ datos · pruebas · publicar
```

## 👥 Equipo
| Nombre | Rol |
|---|---|
| Jose Antonio Chávez Ureña | Líder científico |
| José Pablo Ramírez Fernández | Datos, motor y dominio |
| Juan Diego Chávez Ureña | Integración, despliegue y seguridad |
| Angelli Abarca Ureña | Economía, impacto y operaciones |
| Nesly Mejía Jiménez | Diseño, UX y video |
| Britzie Yarith García Arias | Campo, validación y sensor opcional |

## 🎬 Entrega
- Video (≤ 30 s, subtítulos en inglés): _[link]_
- Prototipo: _[dominio pendiente]_

## 📜 Datos y licencias
Código bajo licencia MIT. Datos abiertos de NASA (POWER, GPM), NOAA CPC, FAO e ISRIC (SoilGrids, CC BY 4.0). Detalle en [`docs/fuentes-datos.md`](docs/fuentes-datos.md). Esta herramienta no reemplaza la asesoría de un agrónomo.
