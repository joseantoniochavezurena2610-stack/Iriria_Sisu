# Plan — Data, engine and domain (José Pablo, systems engineer)

**Mission:** NASA data reaches the website automatically and clean, the engine is correct and fast, and the app has its **own domain**.

## Already done (18 Oct)
- `scripts/fetch_data.py`: daily POWER 2021 → today per canton, Hargreaves ET0, NOAA ENSO. Standard library only.
- `web/js/climate.js` and `web/js/engine.js` + 14 tests (`npm test`).
- `data.yml` workflow (weekly and when scripts change). First real download done: 11 cantons, 69 months each.

## Before the event
| Priority | Task | Deliverable |
|---|---|---|
| 🔴 | **Domain**: propose 2-3 names to the team, buy, set up DNS and HTTPS | Checklist in [`architecture.md#domain`](../architecture.md#domain) complete |
| 🔴 | Team Earthdata account as *secrets*; test `fetch_imerg.py` | `imerg_monthly.json` |
| 🟠 | Compare POWER vs IMERG per canton (monthly correlation) | Chart + 2 sentences for Science |
| 🟠 | Income axis in colones once Economics fills in prices/costs | `engine.js` + test |
| 🟠 | Use `GWETROOT` as the initial soil-water reserve | `engine.js` + test |
| 🟡 | Check the weekly `data` runs and that SoilGrids (WCS) keeps working | Issue with findings |

## During the 48 hours
- Run the `data` workflow at the start (fresh data).
- Engine fixes from Science's review. Nothing new after hour 30.

## Rules
- No invented values: if data is missing, the app says so.
- Every engine function has a test.
- Credentials only as *secrets*.
