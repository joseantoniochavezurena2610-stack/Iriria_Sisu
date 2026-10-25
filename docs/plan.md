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

## Scope (25 Oct): theoretical challenge
The team does **no physical tests** (no soil samples, ribbon tests, sensors or field visits) — decision D23. Validation is done with data: tests, backtests, sensitivity and cross-checks. During the 48 hours NASA gives access to real data and real-time tools; we arrive with the rest ready and plug in what fits (D24).

## Team change (25 Oct)
José Pablo left the team (D17). His pipeline, engine and tests stay and keep running. His open tasks were reassigned below; the custom domain was dropped in favour of the free GitHub Pages address (D18), and two extras were moved to after the event (D19).

| His task | Now | New date |
|---|---|---|
| Domain + DNS | Not needed: https://joseantoniochavezurena2610-stack.github.io/Iriria_Sisu/ — **Juan Diego** turns on Pages with Jose Antonio's owner account | 27 Oct |
| Income axis in colones | ✅ Done 25 Oct (D20): prices and costs researched on the web, engine and tests updated | — |
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
- [x] Ask the organisers whether we may arrive with pre-existing code — answered 22 Oct: allowed (D25)

### Week 2 · 26 Oct – 1 Nov — science and economics
- [x] Prices, production costs and yields for every crop — done 25 Oct from public web sources (D20); **Angeli** reviews the "estimate" rows and replaces any she can source better
- [ ] Compare POWER rainfall with IMN station data for Liberia, Nicoya and Nandayure — **Jose Antonio** (by 1 Nov)
- [ ] Verify the catalog crop by crop with sources (`verified_by`) — **Jose Antonio**
- [ ] Final mockups and palette; test the app on 3 different phones — **Nesly**

### Week 3 · 2–8 Nov — validation and engine
- [x] 2026 backtest (`scripts/backtest_2026.mjs`) — done 25 Oct; Nandayure does not match, see [`research/backtest-2026.md`](research/backtest-2026.md)
- [ ] ±20 % sensitivity script — **Juan Diego** (5 Nov) · interpretation — **Jose Antonio**
- [x] Income axis in colones (engine + test) — done 25 Oct
- ~~Take the app to a MAG/INTA extension agent~~ → not required for the challenge (D22); after the event
- [ ] Internal user test: two people outside the code use the public link and note what they did not understand — **Angeli + Britzie** (8 Nov)
- [ ] NASA resources inventory for the 48 hours ([`event-nasa-resources.md`](event-nasa-resources.md)) — **Britzie** (8 Nov)
- [ ] 2023 backtest (weak El Niño): extend `scripts/backtest_2026.mjs` — **Juan Diego** (8 Nov) · interpretation — **Jose Antonio**
- [ ] Run `npm test` and the `data` workflow once, as backup — **Jose Antonio**

### Week 4 · 9–13 Nov — freeze
- [ ] Freeze the catalog and the formulas (13 Nov)
- [ ] Video storyboard approved — **Nesly**
- [ ] Dress rehearsal: a teammate who did not code uses the public link from scratch on a phone — **Britzie**

## During the 48 hours
| Hour | Milestone |
|---|---|
| 0–3 | Run the `data` workflow (Juan Diego); confirm the challenge; **inventory the NASA data and real-time tools offered** against [`event-nasa-resources.md`](event-nasa-resources.md) (Britzie + Jose Antonio) |
| 3–8 | Science decides *adopt / cross-check / skip* for each resource; Integration plugs the adopted ones in (script → JSON → guard → test) (D24) |
| 8–20 | Pending improvements (prioritised list in Issues) and the new NASA data in the app; **hour 20: last call** for new data sources |
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
| Britzie Yarith García Arias | Validation, usability and NASA resources | [validation-usability.md](roles/validation-usability.md) |
| Angeli Abarca Ureña | Economics, impact and operations | [economics-operations.md](roles/economics-operations.md) |
| Nesly Mejía Jiménez | Design, UX and video | [design-video.md](roles/design-video.md) |

## Blockers / pending decisions
- ~~May we arrive with pre-existing code?~~ → yes, confirmed 22 Oct (D25)
- ~~Final domain name~~ → no custom domain (D18)
- ~~Approval or review by MAG/INTA~~ → not needed to compete (D22)
- Watch the next Monday `data` run: if POWER still returns ×24 rainfall the run fails on purpose and the 19 Oct data stays (D21)
