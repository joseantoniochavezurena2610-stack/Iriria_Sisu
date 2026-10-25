# NASA resources during the 48 hours (decision D24)

During the event NASA gives access to real data and real-time tools. We arrive with the app, the engine and the data pipeline working, so the job in the 48 hours is to **decide quickly what each resource adds and plug in only what is ready**. Nothing here requires physical measurements (D23).

**Owner of the inventory:** Britzie (fills in this table before 8 Nov). **Decides what enters the engine:** Jose Antonio. **Plugs it in:** Juan Diego.

## How a new resource gets into the app
1. A script in `scripts/` downloads it for the 11 cantons (or the 5 POWER cells) and writes small JSON to `web/data/guanacaste/`.
2. The plausibility guard (D21) checks it; impossible values stop the run.
3. `web/js/climate.js` or `engine.js` reads it, with at least one test in `tests/`.
4. The app shows its source, scale and date, like the existing data.

**Rule (D24):** adopted only if steps 1–4 are done by **hour 20**. Otherwise it is shown as a cross-check or listed as future work. POWER stays as the base until a replacement is ready.

**Rule (D5):** anything that changes the engine's scores must cover 2021 → today. A real-time product that starts later can only be shown as "current conditions" or used as a cross-check.

## Inventory (to fill in before 8 Nov)
| Resource | What it gives | Resolution / period | Access | What we would use it for | Status in our app | Decision at the event |
|---|---|---|---|---|---|---|
| NASA POWER (daily, AG) | Rain, temperature, humidity, radiation, soil wetness | Tens of km · 1981 → near real time | API, no account | Base of the engine | **In use** | Keep |
| GPM IMERG (Final / Late / Early) | Satellite rainfall | ~10 km · 2000 → hours ago (Early/Late) | Earthdata | Cross-check POWER, current-season rain | Script ready (`fetch_imerg.py`), not in the app | |
| SMAP L4 | Surface and root-zone soil moisture | 9 km · 2015 → days ago | Earthdata | "Current soil moisture" note per canton | Future | |
| HLS / VIIRS (NDVI) | Vegetation vigour | 30 m (HLS) / 500 m (VIIRS) | Earthdata | Check vegetation stress in 2023 and 2026 | Future (validation) | |
| ECOSTRESS | Evapotranspiration, plant stress | 70 m · irregular passes | Earthdata / AppEEARS | Compare with our Hargreaves ET0 | Future | |
| Worldview / GIBS | Ready-made maps and images | — | No account | Images for the video | Video | |
| _Tools given at the event_ | | | | | | |

## Hour-by-hour
| Hour | Who | What |
|---|---|---|
| 0–3 | Britzie + Jose Antonio | List what is offered, compare with this table, mark *adopt / cross-check / skip* |
| 3–8 | Juan Diego | Scripts and JSON for the adopted resources, guard and test |
| 8–20 | Juan Diego + Jose Antonio | Into the engine or the app; check the numbers make sense |
| 20 | Jose Antonio | Last call: anything not working leaves the app and becomes future work |
