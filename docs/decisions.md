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
| D8 | **Domain: José Pablo finds and manages it** (systems engineer). *Replaced by D18 (25 Oct).* | Requirements and steps in [`architecture.md#domain`](architecture.md#domain). Recommended hosting: GitHub Pages (free, HTTPS). |
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
| D12 | **The app stays 100 % in English, with no language option.** Confirms D10 after talking with the organisers (25 Oct 2026): for impact the project must be fully in English, not bilingual. | No Spanish interface and no language switch. All app text lives in `web/js/strings.js`; a test checks there is no switch. Plain English is used instead of jargon ("water the air demands" next to ET0, counts instead of percentages), since the extension agent is the one who explains the plan to Spanish-speaking growers. Team guides in Spanish stay as they are (D10 exception). |
| D13 | **Defaults must not stand in for the farmer's data.** | pH starts as "I don't know" (SoilGrids reference, labelled as modelled); the reason Safety starts at 4 is shown under the sliders. |
| D14 | **Risk is shown as counts, not percentages.** | "Water short in 1 of 2 years" instead of "50 %": with 2021 → today there are only 2 El Niño events. The "El Niño year" button is labelled "Average El Niño year" and its note says it mixes 2023-24 (mild) and 2026 (severe). |
| D15 | **Every badge shows its rule.** | Under "Robust plan" / "Sensitive to El Niño" the card prints the 85 % / Safety 50 rule from `engine.js`. |
| D16 | **Validation is reported as it is.** | README lists each check as Done or Pending. The 2026 backtest is published even though it does not flag Nandayure. |

## 25 Oct 2026 — Team change
| # | Decision | What it implies |
|---|---|---|
| D17 | **José Pablo Ramírez Fernández is no longer on the team** (not available). The team is now 5 people. | His tasks are reassigned in [`plan.md`](plan.md) and [`roles/`](roles/README.md). His finished work (data pipeline, engine, tests) stays and keeps running on its own (weekly `data` workflow). The Space Apps team registration must be updated. |
| D18 | **No custom domain: the app uses the free GitHub Pages address** `https://joseantoniochavezurena2610-stack.github.io/Iriria_Sisu/`. Replaces D8. | Nothing to buy or renew, HTTPS included, no one person holds the domain. `docs/architecture.md#domain` stays as an optional step after the event. |
| D19 | **Cut to fit 5 people.** | Kept: income in colones, sensitivity analysis, POWER vs IMN check, field session. Optional: IMERG cross-check (needs an Earthdata account). Moved to after the event: soil moisture (`GWETROOT`) in the engine, Content-Security-Policy. |

## 25 Oct 2026 — Prices, data guard and scope
| # | Decision | What it implies |
|---|---|---|
| D20 | **Income is computed in colones per hectare** from published Costa Rican prices, costs and yields, researched on the web on 25 Oct. | `margin = yield × price × suitability × rotation effect × (1 − 0.5 × failure prob.) − cost + N saved × ₡1,341/kg`. Every crop is labelled **sourced**, **derived** or **estimate** in the CSV (`economic_confidence`) and in the app's Data tab. Rainfed rice (−₡148k/ha) and beans (−₡154k/ha) lose money at published figures; that matches the collapse of both crops. `relative_margin` stays only as a fallback. Details: [`research/prices-and-costs.md`](research/prices-and-costs.md). |
| D21 | **A NASA download that cannot be real never replaces good data.** | On 25 Oct the automatic POWER update came back with rainfall exactly **24 times** too high in every month of all 11 cantons (e.g. 7,931 mm in one month in Liberia). The files were restored to the 19 Oct run. `fetch_data.py` now rejects any month > 2,500 mm or year > 6,000 mm and stops the workflow before it commits; the browser's live download applies the same limit; a test checks the committed files. |
| D22 | **The challenge is judged on the working software, so nothing waits for an institution's approval.** No review by MAG/INTA, extension agencies or cooperatives is needed before the event. | Removed from the plan: the extension-agent session, collecting MAG/INTA contacts, and waiting for Economics to obtain prices (done with public web sources instead). These become post-event steps for scaling. Internal checks (tests, backtest, sensitivity, POWER vs IMN, dress rehearsal) stay. |

## 25 Oct 2026 — Theoretical challenge and the 48 hours
| # | Decision | What it implies |
|---|---|---|
| D23 | **The challenge is theoretical: the team does no physical tests.** No soil samples, no lab analyses, no ribbon tests by the team, no sensors and no field visits. Replaces the "optional sensor" part of D7. | The only inputs are NASA/NOAA/FAO/ISRIC data and what the farmer types in the form (the ribbon test stays as a way for the *farmer* to describe texture; the team does not perform it). Validation is done with data only: automated tests, backtests against real seasons (2026, 2023), ±20 % sensitivity, POWER vs IMN/IMERG cross-checks and an internal usability test of the website. The ESP32 sensor leaves the project; it is mentioned only as a post-event idea. Britzie's role becomes **Validation, usability and NASA resources** ([`roles/validation-usability.md`](roles/validation-usability.md)). In the video and the submission we never say we measured anything on a farm. |
| D24 | **During the 48 hours NASA gives access to real data and real-time tools; we arrive with everything else ready.** | Hours 0–3: inventory what is offered and compare it with [`event-nasa-resources.md`](event-nasa-resources.md). Hours 3–8: Science decides what enters the engine, Integration plugs it into the existing data layer (`scripts/` → `web/data/` JSON). A resource is adopted only if it passes the plausibility guard (D21), has a test and is in the app by hour 20; otherwise it is shown as a cross-check or listed as future work. The current POWER data is never removed for a new source that is not ready. |
| D25 | **Pre-existing code is allowed** (confirmed by the organisers on 22 Oct). | The blocker "may we arrive with pre-existing code?" is closed. The submission form declares what was built before the event and what during the 48 hours. |

## 26 Oct 2026 — Visual identity and the visit as a journey
| # | Decision | What it implies |
|---|---|---|
| D26 | **The app follows the Iriria Sìsù brand and is a short journey instead of one long page.** Palette: lime `#D0D959`, cream `#F3EBD6`, soil brown `#3C1D0A`, deep teal `#0A4A46` (tokens in `web/css/styles.css`, with a dark mode). Icons: Lucide (ISC licence), copied into `web/js/icons.js` so they work offline. | Welcome cover (logo, phrase, "Start planting") → 4 steps with a progress bar (farm, crop, soil, priorities) → "Look at these plans!" with three round buttons A/B/C plus "Today" → the plan opens on tap and is chosen with a button → goodbye screen with PDF / WhatsApp / link and the isotipo. Shared links skip the cover and open the plan in the link (`plan=A|B|C|base`). Printing prints only the chosen plan. The engine, data and tests are unchanged; the interface stays English only (D10). |

## 26 Oct 2026 — Less text, tap-cards, crops by canton
- **Crops by canton.** `data/catalog/crop_cantons.csv` lists the cantons where each crop is grown (`all` for green manures and fallow); `scripts/catalog_to_json.py` merges it into `crops.json` as `cantons`. The app only shows, and the engine only plans with, crops of the chosen canton (`cropsForCanton` in engine.js). Initial lists come from press reports and regional practice and are marked `pending`: **check them against the CENAGRO 2014 crop volume (INEC, Tomo II, tables by canton)** before the event.
- **Menus are cards.** Every `<select>` is hidden and drawn as tappable cards (`web/js/choices.js`); the select stays the source of truth, so links and the engine did not change. pH is a − / + stepper with an "I don't know" switch.
- **Less text.** Shorter notes and reasons; the climate panel starts closed; plan cells show only the crop and two signs (irrigation, water short) with the numbers in a tooltip; 3 reasons in view, the rest behind "n more". The net margin is no longer repeated in the reasons (it is in the money box).
