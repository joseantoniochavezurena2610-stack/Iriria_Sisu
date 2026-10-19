# Plan — Iriria Sìsù

**Event:** 14–15 November 2026. **Deliverables:** video (≤ 30 s, English subtitles) + public web prototype.
Current decisions: [`decisions.md`](decisions.md).

## Status on 18 Oct 2026
- [x] Pilot region: Guanacaste (11 cantons)
- [x] Web app working in `web/` (form, scenarios, 3 plans + today's, robustness, print, share link)
- [x] Rule-based engine in JavaScript with 14 automated tests
- [x] Scripts and workflow that download NASA POWER (2021 → today) and NOAA's ENSO index
- [x] **Real data downloaded** for the 11 cantons (69 months each) + SoilGrids reference
- [x] Crop catalog of 11 crops with initial values (not yet verified)
- [x] Glossary, architecture, engine rules and video script
- [x] Whole repository, app and v1 prototype in English; team guides in Spanish

## Before the event
### Week 1 · 19–25 Oct — data and domain
- [ ] Check the weekly runs of the `data` workflow (Actions tab) — **Juan Diego**
- [ ] Buy the domain and configure DNS — **José Pablo** ([checklist](architecture.md#domain))
- [ ] Turn on GitHub Pages (`PUBLISH_PAGES=true`) — **Juan Diego**
- [ ] Everyone with an Earthdata account; store a team account's username/password as repo *secrets* — **José Pablo**
- [ ] Read the whole [glossary](glossary.md) — **everyone**
- [ ] Ask the organisers whether we may arrive with pre-existing code — **Angeli**

### Week 2 · 26 Oct – 1 Nov — science and economics
- [ ] Verify the catalog crop by crop with sources (`verified_by`) — **Jose Antonio**
- [ ] Prices (PIMA/CENADA) and production costs (MAG/INTA) for every crop — **Angeli**
- [ ] Compare POWER rainfall with IMN station data for Liberia and Nicoya — **Jose Antonio + José Pablo**
- [ ] Final mockups and palette; test the app on 3 different phones — **Nesly**

### Week 3 · 2–8 Nov — validation
- [ ] 2026 backtest: does the engine advise against rainfed rice in Nandayure for Primera 2026? — **Jose Antonio**
- [ ] ±20 % sensitivity analysis on Kc, thresholds and margins — **Jose Antonio + José Pablo**
- [ ] Take the app to a MAG/INTA extension agent or a Guanacaste grower — **Angeli + Britzie**
- [ ] Income axis in colones (engine) — **José Pablo**

### Week 4 · 9–13 Nov — freeze
- [ ] Freeze the catalog and the formulas (13 Nov)
- [ ] Video storyboard approved — **Nesly**
- [ ] Dress rehearsal: a teammate who did not code uses the app from scratch on a phone

## During the 48 hours
| Hour | Milestone |
|---|---|
| 0–3 | Confirm the challenge, review the pre-existing-code rules, adjust to what the organisers ask |
| 3–20 | Pending improvements (prioritised list in Issues), fresh data from the workflow |
| 20–30 | Interface and copy polish; phone testing |
| 30 | **Freeze**: fixes only |
| 30–40 | Record and edit the video with English subtitles |
| 40–46 | Submission form in English (summary, NASA data used, AI use) |
| 46–48 | Final check: public link with no password, public video, *Submit for Judging* |

## Roles
| Person | Main role | Plan |
|---|---|---|
| Juan Diego Chávez Ureña | Integration, deployment and security | [integration-security.md](roles/integration-security.md) |
| Jose Antonio Chávez Ureña | Science lead | [science-lead.md](roles/science-lead.md) |
| José Pablo Ramírez Fernández | Data, engine and domain | [data-and-engine.md](roles/data-and-engine.md) |
| Britzie Yarith García Arias | Field work, validation and optional sensor | [field-and-sensors.md](roles/field-and-sensors.md) |
| Angeli Abarca Ureña | Economics, impact and operations | [economics-operations.md](roles/economics-operations.md) |
| Nesly Mejía Jiménez | Design, UX and video | [design-video.md](roles/design-video.md) |

## Blockers / pending decisions
- May we arrive with pre-existing code? (ask the organisers)
- Final domain name
