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

## Team change (25 Oct)
José Pablo left the team (D17). His pipeline, engine and tests stay and keep running. His open tasks were reassigned below; the custom domain was dropped in favour of the free GitHub Pages address (D18), and two extras were moved to after the event (D19).

| His task | Now | New date |
|---|---|---|
| Domain + DNS | Not needed: https://joseantoniochavezurena2610-stack.github.io/Iriria_Sisu/ — **Juan Diego** turns on Pages with Jose Antonio's owner account | 27 Oct |
| Income axis in colones | **Juan Diego** (engine) with Angeli's prices and costs | data 1 Nov · engine 8 Nov |
| ±20 % sensitivity | **Juan Diego** writes the script · **Jose Antonio** interprets | 5 Nov |
| POWER vs station data | **Jose Antonio** (IMN stations; Nandayure added) | 1 Nov |
| Earthdata secrets + IMERG | **Juan Diego**, optional | if time |
| Soil moisture (`GWETROOT`) in the engine | After the event | — |
| Engine fixes during the 48 h | **Juan Diego** | event |

## Before the event
### Week 1 · 19–25 Oct — data and publishing
- [ ] Check the weekly runs of the `data` workflow (Actions tab) — **Juan Diego**
- [ ] Turn on GitHub Pages (`PUBLISH_PAGES=true`) with the owner account — **Juan Diego + Jose Antonio** (by 27 Oct)
- [ ] Protect `main` (PR + green tests) — **Juan Diego** (by 27 Oct)
- [ ] Update the team on the Space Apps site (5 members) — **Angeli**
- [ ] Review repository collaborators after the team change — **Jose Antonio** (owner)
- [ ] Read the whole [glossary](glossary.md) — **everyone**
- [ ] Ask the organisers whether we may arrive with pre-existing code — **Angeli**

### Week 2 · 26 Oct – 1 Nov — science and economics
- [ ] Prices (PIMA/CENADA), production costs (MAG/INTA) and yields for every crop — **Angeli** (by 1 Nov)
- [ ] Compare POWER rainfall with IMN station data for Liberia, Nicoya and Nandayure — **Jose Antonio** (by 1 Nov)
- [ ] Verify the catalog crop by crop with sources (`verified_by`) — **Jose Antonio**
- [ ] Final mockups and palette; test the app on 3 different phones — **Nesly**

### Week 3 · 2–8 Nov — validation and engine
- [x] 2026 backtest (`scripts/backtest_2026.mjs`) — done 25 Oct; Nandayure does not match, see [`research/backtest-2026.md`](research/backtest-2026.md)
- [ ] ±20 % sensitivity script — **Juan Diego** (5 Nov) · interpretation — **Jose Antonio**
- [ ] Income axis in colones (engine + test) — **Juan Diego** (8 Nov)
- [ ] Take the app to a MAG/INTA extension agent or a Guanacaste grower — **Angeli + Britzie**
- [ ] Run `npm test` and the `data` workflow once, as backup — **Jose Antonio**

### Week 4 · 9–13 Nov — freeze
- [ ] Freeze the catalog and the formulas (13 Nov)
- [ ] Video storyboard approved — **Nesly**
- [ ] Dress rehearsal: a teammate who did not code uses the public link from scratch on a phone — **Britzie**

## During the 48 hours
| Hour | Milestone |
|---|---|
| 0–3 | Run the `data` workflow (Juan Diego); confirm the challenge, review the pre-existing-code rules, adjust to what the organisers ask |
| 3–20 | Pending improvements (prioritised list in Issues), fresh data from the workflow |
| 20–30 | Interface and copy polish; phone testing |
| 30 | **Freeze**: fixes only |
| 30–40 | Record and edit the video with English subtitles |
| 40–46 | Submission form in English (summary, NASA data used, AI use) |
| 46–48 | Final check: public link with no password, public video, *Submit for Judging* |

## Roles
| Person | Main role | Plan |
|---|---|---|
| Juan Diego Chávez Ureña | Integration, deployment, security, data and engine | [integration-security.md](roles/integration-security.md) |
| Jose Antonio Chávez Ureña | Science lead | [science-lead.md](roles/science-lead.md) |
| Britzie Yarith García Arias | Field work, validation and optional sensor | [field-and-sensors.md](roles/field-and-sensors.md) |
| Angeli Abarca Ureña | Economics, impact and operations | [economics-operations.md](roles/economics-operations.md) |
| Nesly Mejía Jiménez | Design, UX and video | [design-video.md](roles/design-video.md) |

## Blockers / pending decisions
- May we arrive with pre-existing code? (ask the organisers)
- ~~Final domain name~~ → no custom domain (D18)
