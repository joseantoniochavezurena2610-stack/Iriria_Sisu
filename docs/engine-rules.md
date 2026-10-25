# Rotation engine — rules and formulas

Implementation: [`web/js/engine.js`](../web/js/engine.js) and [`web/js/climate.js`](../web/js/climate.js). Tests: [`tests/engine.test.js`](../tests/engine.test.js). All tunable parameters live in `PARAMETERS` (engine.js) and in the catalog CSV. **Changing a formula = changing this document + its test.**

## 1. Inputs
| Input | Where it comes from |
|---|---|
| Monthly climate 2021 → today: rainfall `P`, temperature `T`, ET0 | NASA POWER (precomputed per canton) |
| ENSO phase of each month | NOAA CPC (RONI/ONI) |
| Crop catalog | `data/catalog/crops_guanacaste.csv` |
| Farm: pH (optional), texture, slope, irrigation, current crop, organic matter (optional), maximum loss (optional) | The farmer |
| Priorities Soil / Water / Risk / Income (0–5) | The farmer |

## 2. Scenarios (climate.js)
- **Normal**: average of each calendar month using only **non**-El Niño months.
- **El Niño**: average using only El Niño months. If a calendar month was never El Niño inside the window, the overall average is used and the month is marked as "filled" (transparent bar in the chart).
- **Worst year**: the year with the least rain from May to November.
- **Current forecast**: Dry and Primera of year 1 with El Niño (IMN: effects at least until Jul 2027); the other 7 seasons normal.
- **Year-by-year samples** per season: used to compute risk (normal → non-El Niño years; El Niño → El Niño years; worst → all).

## 3. Evaluating a crop in a season
Seasons: **Dry** (Jan–Apr), **Primera** (May–Aug, contains the *canícula*), **Postrera** (Sep–Dec). The crop occupies `cycle_days / 30.4` months from the start of the season.

1. **Calendar** (hard rule): if the season is not in the crop's `seasons` column → not proposed.
2. **pH** (hard rule): outside [`ph_min`, `ph_max`] → ruled out. Between the minimum and the optimum → linear factor from 1.0 to 0.7. No pH → not applied (and the app says so).
3. **Water (FAO-56-style balance)**
   - `ETc = Σ ET0_month × kc_season` over the months of the cycle.
   - `Pe = Σ effective rainfall` (USDA-SCS: if P ≤ 250 mm, `P(125−0.2P)/125`; otherwise `125 + 0.1P`).
   - `CarryOver = available water(texture) × 0.6 m × 0.5`, only if the month before the season rained more than its ET0.
   - `Deficit = max(0, ETc − Pe − CarryOver)`; `Irrigation = min(Deficit, max. by answer)` (none: 0 · a little: 150 mm · enough: all of it).
   - `Coverage = (ETc − unmet) / ETc`; **water factor** = `clamp((Coverage − 0.5) / 0.45)`.
4. **Temperature**: 1 inside the optimal range, falling linearly to 0 at the absolute limits.
5. **Excess rain**: if `rain / ETc > 2.5` and the crop tolerates waterlogging poorly, a penalty that is stronger on clay soil.
6. **Suitability** = water × temperature × pH × excess. If it is below **0.35**, the crop is not proposed for that season.
7. **Failure probability** = share of observed years in which `Coverage < 0.75 − 0.05 × drought_tolerance`.

## 4. Building plans
- 9 slots (3 years × 3 seasons). Beam search with 250 sequences.
- **Rotation effects** on yield: same family back to back ×0.85; same family in the previous 3 seasons ×0.95; after a legume ×1.10; after a green manure ×1.15 (conservative compared with the +20 % average of Zhao et al. 2022).
- The **3 best different plans** are returned (they change at least 3 seasons and the crop mix) + "If you keep planting what you plant today".

## 5. Axes (0 to 100)
| Axis | Formula (summary) |
|---|---|
| **Soil** | 0.35 × normalised nitrogen balance + 0.25 × ground cover + 0.15 × residue + 0.25 × family diversity − 0.08 × repetitions − erosion (seasons with little cover × slope factor). Low organic matter gives more weight to residue. |
| **Water** | 1 − (irrigation + unmet deficit) / total demand. Measures how much the plan depends on water the rain does not provide. |
| **Safety (Risk)** | 1 − average failure probability of the planted seasons. |
| **Income** | Σ relative_margin × suitability × rotation effect × (1 − 0.5 × failure prob.), normalised against the best possible crop in each season. **Relative** until verified prices are available. |
| **Total** | Weighted average with the farmer's priorities. |

**Maximum loss**: if the farmer sets it, plans whose income is lower than "today's" × (1 − loss) are discarded.

**Robust plan**: score with all-El Niño ≥ 85 % of the score with all-normal **and** El Niño safety ≥ 50. The card prints this rule under the badge; a plan that misses it is labelled "Sensitive to El Niño" with the opposite rule.

**How risk is shown**: as a count of observed years ("water short: 1 of 2 years"), from the same `failureProbability` result (`round(prob × n)` of `n`). Percentages are not shown because `n` is 2–6 years.

**Text**: reason and notice templates live in `web/js/strings.js`.

## 6. To do for the science lead and Economics
- [ ] Verify every catalog value with a source (FAO-56, ECOCROP, INTA/MAG) and fill in `verified_by`.
- [ ] Review thresholds: minimum suitability 0.35; failure 0.75; carry-over 50 % of available water; depth 0.6 m.
- [ ] Replace `relative_margin` with yield × price − cost (the columns already exist in the CSV).
- [ ] Use `GWETROOT` (POWER soil moisture) for the initial reserve instead of the previous-month rule.
- [ ] Sensitivity analysis (±20 %) and 2023 / 2026 backtests.
