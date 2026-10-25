# Decision log

Every team decision with its date and its reason. If something changes, add a new entry; do not delete the old one.

## 18 Oct 2026 — Project restructuring

| # | Decision | What it implies |
|---|---|---|
| D1 | **Final pilot region: Guanacaste** (all 11 cantons). | Cartago is dropped. Crop catalog, data and examples are for Guanacaste. It is the area hit hardest by the 2026-27 El Niño (−37 % rainfall Jan–Aug, orange alert in all 11 cantons). |
| D2 | **The app is 100 % web.** | Streamlit is dropped. The app is a static page (HTML + CSS + JavaScript) in `web/`; the engine runs in the browser. It opens on any phone or computer from a link, with nothing to install. See [`architecture.md`](architecture.md). |
| D3 | **Get as much done as possible before the event** (until 13 Nov). | The working prototype already exists; the 48 hours go to verified data, polish, validation and the video. Check the organisers' rule on pre-existing code. See [`plan.md`](plan.md). |
| D4 | **Only deliverables: the video and the final prototype.** | No live pitch and no slide deck. The video is the Space Apps "demo" (**max. 30 s, English subtitles**). The prototype is the "final project link" (the public website). See [`video-script.md`](video-script.md). |
| D5 | **Data: at least the last 5 years (2021 → today).** | Every dataset in the model covers at least Jan 2021 to today. It includes La Niña 2021-23, El Niño 2023-24, La Niña 2024-26 and El Niño 2026. Older data (e.g. El Niño 2015) is only cited as historical context and never enters the engine. |
| D6 | **Shared glossary.** | [`glossary.md`](glossary.md): every new technical term is added there. |
| D7 | **The farmer enters their data; we do not depend on sensors.** | The form asks for canton, crop, irrigation, texture (ribbon test), pH (optional), slope, organic matter and priorities. If the farmer does not know their pH, SoilGrids is used as a reference (and the app says so). The ESP32 sensor becomes an **optional extra** that blocks nothing. |
| D8 | **Domain: José Pablo finds and manages it** (systems engineer). | Requirements and steps in [`architecture.md#domain`](architecture.md#domain). Recommended hosting: GitHub Pages (free, HTTPS). |
| D9 | **Everything researched or changed goes to GitHub.** | Branches + PRs as in `CONTRIBUTING.md`. NASA data is downloaded and committed automatically by the `data` workflow. |

### Derived technical decisions
- **Explanations from templates, not an LLM**: zero cost, no server and no risk of invented data.
- **ET0 with Hargreaves (FAO-56)**: it only needs temperature, which POWER provides without an account.
- **Three seasons per year** (Dry Jan–Apr, Primera May–Aug, Postrera Sep–Dec). The mid-summer drought (*canícula*, Jul–Aug) falls inside Primera and shows up in the risk because we use each year's real rainfall.
- **Scenarios from real years**, not a fixed "−30 %": normal (non-El Niño months), El Niño (observed El Niño months), worst year, and "current forecast" (El Niño in the Dry and Primera seasons of 2027, then normal) following the IMN.
- **SoilGrids via WCS** because its REST API is paused; it is optional.
- **No MODIS**: it ends operations in late 2026 / early 2027.

## 18 Oct 2026 — Data findings after the first real download
- NASA POWER for the 11 cantons falls in **only 5 grid cells** with identical series. The app shows which cantons share data.
- The NOAA "5 consecutive seasons" rule could not yet confirm the ongoing 2026 El Niño. The classification now labels an ongoing episode with ≥ 3 seasons (`ongoing`) and lets unpublished recent months inherit its phase (`estimated`).

## 18 Oct 2026 — Language
| # | Decision | What it implies |
|---|---|---|
| D10 | **Everything is in English** for greater impact: repository, code, data, documentation, the app and the v1 prototype. | The only exception is the **team guides in Spanish** (PDFs in [`team-guides-es/`](team-guides-es/)). The glossary lists the Spanish term next to each English one so the team stays on the same page. Local terms with no good English equivalent (*Primera*, *Postrera*, *canícula*, canton names) are kept and explained. |
| D11 | **Bilingual glossary.** | The glossary exists in full in English ([`glossary.md`](glossary.md)) and Spanish ([`glossary.es.md`](glossary.es.md)), each listing the term in the other language. Both are updated together. |

## 25 Oct 2026 — Behaviour audit (who can actually use the tool)
| # | Decision | What it implies |
|---|---|---|
| D12 | **The app's interface is bilingual (Spanish / English).** Amends D10 for the screen the grower sees: the growers in Guanacaste speak Spanish. | Spanish when the browser is in Spanish, English otherwise (judges); a switch in the header; the choice is kept in the shared link. Repository, code and docs stay in English. Strings live in `web/js/i18n.js`; the tests fail if a Spanish string is missing. |
| D13 | **Defaults must not stand in for the farmer's data.** | pH starts as "I don't know" (SoilGrids reference, labelled as modelled); the reason Safety starts at 4 is shown under the sliders. |
| D14 | **Risk is shown as counts, not percentages.** | "Water short in 1 of 2 years" instead of "50 %": with 2021 → today there are only 2 El Niño events. The "El Niño year" button is labelled "Average El Niño year" and its note says it mixes 2023-24 (mild) and 2026 (severe). |
| D15 | **Every badge shows its rule.** | Under "Robust plan" / "Sensitive to El Niño" the card prints the 85 % / Safety 50 rule from `engine.js`. |
| D16 | **Validation is reported as it is.** | README lists each check as Done or Pending. The 2026 backtest is published even though it does not flag Nandayure. |
