# Plan — Integration, deployment, security, data and engine (Juan Diego, cybersecurity engineering)

**Mission:** the website is online with HTTPS, `main` always works, the NASA data keeps arriving, the engine is correct, and no credentials leak.
**Since 25 Oct** this role also covers data and engine (José Pablo left the team, decision D17). The pipeline and the engine already work and have tests; what is left is listed below.

**Backup:** Jose Antonio owns the repository and can turn on Pages, re-run workflows and merge if Juan Diego is not available. He should run `npm test` and the `data` workflow once before 8 Nov.

## Before the event
| Priority | Task | Deliverable | Date |
|---|---|---|---|
| 🔴 | Turn on GitHub Pages with the repo owner's account: *Settings → Pages → Source: GitHub Actions* and variable `PUBLISH_PAGES=true` | Public URL working: https://joseantoniochavezurena2610-stack.github.io/Iriria_Sisu/ | 27 Oct |
| 🔴 | Protect `main` (PR required + `tests` workflow green) | Branch rule | 27 Oct |
| 🔴 | Income axis in colones: margin = yield × price − cost per ha, from Angeli's columns in `data/catalog/crops_guanacaste.csv` | `engine.js` + test | 8 Nov |
| 🟠 | ±20 % sensitivity script on Kc, failure threshold, N credit and margins (same style as `scripts/backtest_2026.mjs`) | Table for Jose Antonio | 5 Nov |
| 🟠 | Check that the weekly `data` workflow keeps committing without breaking `main` (every Monday) | Green runs | weekly |
| 🟡 | Optional: team Earthdata account as repo *secrets* and `fetch_imerg.py` for the IMERG cross-check | `imerg_monthly.json` | only if time |

Moved to after the event (D19): soil moisture (`GWETROOT`) in the engine, Content-Security-Policy meta.

## During the 48 hours
- Run the `data` workflow at the start (fresh data).
- Owner of `main`: merge at every checkpoint; engine fixes from Science's review. Nothing new after hour 30.
- Hour 46: tag `v1.0` and verify the public link (no login, incognito, phone on mobile data).

## Rules
- No invented values: if data is missing, the app says so.
- Every engine function has a test.

## Security checklist
- [ ] No keys in the git history
- [ ] Earthdata secrets only on GitHub (if used)
- [ ] Repository collaborators reviewed after the team change
- [ ] The app neither stores nor sends the farmer's data (everything runs in the browser)
- [ ] HTTPS on the public address (GitHub Pages provides it)
- [ ] External dependencies pinned to a version (Leaflet 1.9.4)
