# Science lead plan (Jose Antonio)

Make sure **every number the app shows can be defended**. "Best Use of Science" judges reward a clear question, well-used data, validation and honest limits.

## 1. Question and hypotheses
- **Question:** Which 3-year rotations keep income up and improve the soil of a grain farm in Guanacaste when an El Niño year hits?
- **H1:** in El Niño years, rotations with legumes and drought-tolerant crops (sorghum, cowpea, jack bean) carry less water-deficit risk than rainfed rice, without losing more than X % of income. *(Automated test: `tests/engine.test.js`, H1 case.)*
- **H2:** the best plan for a normal year is not always the best for an El Niño year; the tool identifies the robust plans.

## 2. Data (rule: 2021 → today)
- Scenarios from real months: El Niño 2023-24 (weak in Guanacaste: North Pacific only −9 % in 2023) and El Niño 2026 (−37 % Jan–Aug). That difference is a finding, not a problem: the app shows the range.
- El Niño 2015 is **context only** (outside the 5-year window).
- First real download: the 11 cantons fall in 5 POWER cells; in Nandayure the El Niño Primera barely dries out according to POWER. **Check against IMERG and IMN stations.**

## 3. Tasks before the event
| Priority | Task | Deliverable |
|---|---|---|
| 🔴 | Verify every catalog value with a source (FAO-56, ECOCROP, INTA/MAG sheets) | `verified_by` filled in the CSV |
| 🔴 | Review the formulas and thresholds in [`engine-rules.md`](../engine-rules.md) | Comments / PR |
| 🔴 | Review the [glossary](../glossary.md): definitions and Spanish terms are correct | PR |
| 🔴 | Compare POWER rainfall with IMN stations (Liberia, Nicoya **and Nandayure**) for 2021-2026 — the 2026 backtest does not flag Nandayure, so this decides how we present it | Table + conclusion, by 1 Nov |
| 🟠 | Resolve the ❓ items in `research/verified-summary.md` | No ❓ in anything used in the video |
| ➖ | ~~Expert validation with an agronomist/extension agent~~ — not required for the challenge (D22); after the event | — |

## 4. Validation
1. **2026 backtest**: run the engine with May 2026 climate; does it advise against rainfed rice in Nandayure? (Rice growers in Nandayure and Jicaral did not plant.)
2. **2023 backtest**: weak El Niño in Guanacaste → the engine should not penalise as much. (Juan Diego extends the script by 8 Nov; you interpret it.)
3. **±20 % sensitivity** on Kc, failure threshold, N credit and margins: does the top 3 change? (Juan Diego prepares the script by 5 Nov; you interpret it.)
4. **IMERG vs POWER cross-check** (optional, Juan Diego — only if the Earthdata account is ready).
5. **Automated tests** (`npm test`) for every new rule.

## 5. NASA resources at the event (D24)
In hours 0–8 you decide which of the data/tools NASA offers enter the engine (*adopt / cross-check / skip*), using Britzie's inventory in [`event-nasa-resources.md`](../event-nasa-resources.md). Hour 20 is the last call. Nothing is validated in the field (D23).

## 6. Backup for Juan Diego
You own the repository. Before 8 Nov, run `npm test` once and re-run the `data` workflow from the Actions tab, so the team is not stuck if Juan Diego is unavailable.

## 7. Golden rules
- No number without a source in `data-sources.md` / `confirmed-data.md`.
- Every output states its scale ("regional data, tens of km").
- If data is missing the app says so; nothing is silently filled in.
- Science freeze on 13 Nov.

## 8. Your part in the video
The 10–20 s scene (normal vs El Niño). Check that the canton and the numbers shown are real and verified.
