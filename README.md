# Iriria Sìsù 🌱

Project for the **NASA International Space Apps Challenge 2026** (14–15 November 2026).
Challenge: **Change of Course — Adapting Farms with NASA Data.** Pilot region: **Guanacaste, Costa Rica.**

> **Deliverables:** 🎬 a video of at most 30 s (English subtitles) · 🌐 a public web prototype.

## The problem
In Costa Rica's North Pacific, the 2026-27 El Niño has already cut rainfall by about 37 % (Jan–Aug 2026), all 11 cantons of Guanacaste are under an orange alert, and the national weather service (IMN) expects effects at least until July 2027. Grain growers decide what to plant without a tool that brings together the coming climate, the soil of their farm and their finances.

## The solution
A **web page** where the farmer (or the extension agent visiting them) enters their canton, what they plant, whether they have irrigation, what their soil is like and what matters most to them. The app uses **real NASA POWER rainfall and temperature since 2021** and NOAA's ENSO index to compare **3 three-year crop-rotation plans** against "keep planting what you plant today", showing the effect on **soil, water, risk and income** in a normal year and in an El Niño year. **No sensors needed**: everything comes from what the farmer knows. The decision is always theirs.

Details: [`docs/solution.md`](docs/solution.md) · Decisions: [`docs/decisions.md`](docs/decisions.md)

## Use of the scientific method
- **Hypothesis:** in El Niño years, rotations with legumes and drought-tolerant crops carry less risk than rainfed rice; and the best plan for a normal year is not always the best plan for an El Niño year.
- **Data:** NASA POWER daily data 2021 → today (11 cantons), NOAA's ENSO index, FAO-56 and ECOCROP. See [`docs/data-sources.md`](docs/data-sources.md).
- **Analysis:** a multi-criteria engine with transparent rules: FAO-56-style water balance with Hargreaves ET0, pH and calendar filters, rotation effects, and risk computed year by year. See [`docs/engine-rules.md`](docs/engine-rules.md).
- **Validation:** backtests with El Niño 2023 and 2026, ±20 % sensitivity analysis, POWER vs IMERG cross-check, review by an extension agent, and automated tests.

## 📚 Documentation
| Document | What for |
|---|---|
| [`docs/team-guides-es/`](docs/team-guides-es/) | **Team guides (Spanish PDFs):** how the repo is organised, what to read, and how to run the app |
| [`docs/glossary.md`](docs/glossary.md) · [`docs/glossary.es.md`](docs/glossary.es.md) | **Glossary of technical terms**, in English and in Spanish — everyone should read it |
| [`docs/decisions.md`](docs/decisions.md) | What we decided and why |
| [`docs/plan.md`](docs/plan.md) | Week-by-week plan until the event and the 48 hours |
| [`docs/architecture.md`](docs/architecture.md) | How the web app is built, how to publish it, and the **domain** |
| [`docs/engine-rules.md`](docs/engine-rules.md) | Engine formulas |
| [`docs/video-script.md`](docs/video-script.md) | Script for the 30-second video |
| [`docs/data-sources.md`](docs/data-sources.md) | Datasets, licences and limitations |
| [`docs/confirmed-data.md`](docs/confirmed-data.md) | Only verified facts, each with its source |
| [`docs/research/`](docs/research/) | El Niño 2021-2026 and fact-checking of the research |
| [`docs/roles/`](docs/roles/README.md) | Each person's plan |

## 🛠️ Stack
- **Static website:** HTML + CSS + JavaScript (no server, no build step). Map with Leaflet.
- **Engine:** `web/js/engine.js` (pure functions, runs in the browser) + tests with `node --test`.
- **Data:** Python scripts (standard library) run weekly by **GitHub Actions**, saving JSON to `web/data/`.
- **Hosting:** GitHub Pages + custom domain (handled by José Pablo).

## 🚀 How to run it
```bash
python3 -m http.server 8000 --directory web    # open http://localhost:8000
npm test                                        # engine tests (Node 20+)
```
Data is downloaded automatically by the **data** workflow (Actions tab). By hand: `python3 scripts/fetch_data.py`.

## 📂 Structure
```
web/               public app (index.html, css/, js/, data/)
scripts/           download and processing of NASA/NOAA/SoilGrids/IMERG data
data/catalog/      crop catalog (CSV the team edits)
tests/             engine tests
docs/              decisions, plan, glossary, architecture, research, roles, team guides
archive/           earlier prototype (reference)
.github/workflows/ data · tests · publish
```

## 👥 Team
| Name | Role |
|---|---|
| Jose Antonio Chávez Ureña | Science lead |
| José Pablo Ramírez Fernández | Data, engine and domain |
| Juan Diego Chávez Ureña | Integration, deployment and security |
| Angeli Abarca Ureña | Economics, impact and operations |
| Nesly Mejía Jiménez | Design, UX and video |
| Britzie Yarith García Arias | Field work, validation and optional sensor |

## 🎬 Submission
- Video (≤ 30 s, English subtitles): _[link]_
- Prototype: _[domain pending]_

## 📜 Data and licences
Code under the MIT licence. Open data from NASA (POWER, GPM), NOAA CPC, FAO and ISRIC (SoilGrids, CC BY 4.0). Details in [`docs/data-sources.md`](docs/data-sources.md). This tool does not replace advice from an agronomist.
