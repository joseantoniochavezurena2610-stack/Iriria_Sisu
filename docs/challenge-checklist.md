# Challenge checklist — Field Shift: Adapting Farms with NASA Data

Every point of the official challenge text and the challenge video (1 Nov 2026), mapped to what Iriria Sìsù does today.
Status: ✅ done · 🟡 partial · ⬜ to do · ➖ not applicable (and the app says why).
Decision behind the changes of 1 Nov: **D27** in [`decisions.md`](decisions.md).

## What the video stresses (the judges' lens)
The video sums the mission up in four verbs — **compare rotations, reveal trade-offs, understand risk, make uncertainty visible** — and invites "an SI (AI) model, an interactive map, a visualization, a decision-support tool, or something none of us has imagined yet". Two of the four subject-matter experts work with **astronaut photography of Earth from the ISS** (William Stefanov: remote sensing and disaster response; Alex Token: machine learning on astronaut photos). One of them is the **machine-learning** domain expert.

| Video point | Status | Where / what is missing |
|---|---|---|
| Compare rotations | ✅ | Plans A, B, C + "Today" side by side; money bar chart |
| Reveal trade-offs | ✅ | Four axes per plan; profiles *More money / Safer / Better soil* show what each gives up |
| Understand risk | ✅ | Water short "k of n observed years"; robust / sensitive badge with its rule |
| **Make uncertainty visible** | 🟡 | ✅ Margin range across climates (normal / El Niño / driest year) · ✅ "What we do not know yet" per plan · ✅ risk as counts · ⬜ confidence label per data source in the Data tab · ⬜ percentile bands in the climate chart |
| AI / ML model | ⬜ | Engine is rules (by design, explainable). **Team decision needed:** add one small, honest ML/statistical piece and compare it with the rule (see the team PDF) |
| Astronaut photography (ISS) | ⬜ | Optional: one ISS photo of Guanacaste / Tempisque in the video or as map context (search *Gateway to Astronaut Photography of Earth*) |

## Objectives (challenge text)
| Requirement | Status | Where |
|---|---|---|
| Combine NASA Earth observations with local agricultural information | ✅ | NASA POWER (rain, T, ET0 inputs, GWETROOT soil wetness) + farmer form |
| App / model / interactive map / decision-support tool | ✅ | Web app with map, form, plans |
| **Compare at least three strategies, including the existing rotation** | ✅ | 3 plans + "If you keep planting what you plant today". **New:** the farmer can give a different crop per season (existing rotation), not only one main crop |
| For each strategy: **why suggested** | ✅ | Profile line + "Why this plan" reasons |
| … **what evidence supports it** | ✅ new | "What backs this plan" (method + source: FAO-56, NASA POWER, NOAA, Zhao et al. 2022, CR prices) |
| … **benefits** | ✅ | Axes + reasons + margin vs today |
| … **information gaps** | ✅ new | "What we do not know yet" (pH source, organic matter, estimated prices, unverified ranges, few years, filled months, regional grid) |
| … **risks that need local review** | ✅ new | "Check with your extension agent before planting" (new crops, green-manure seed, buyer, irrigation, sowing dates, pests) |
| Supportive tool, does not replace farmer judgement | ✅ new | Line under every plan + How it works + footer |

## Datasets named in the challenge
| Dataset | Status | Note |
|---|---|---|
| NASA POWER | ✅ | Core climate since 2021 (D5) |
| GPM IMERG | 🟡 | Script exists (`fetch_imerg.py`), needs Earthdata secret — cross-check only |
| SMAP | ⬜ | POWER GWETROOT used instead today; SMAP L4 9 km as cross-check during the event (D24) |
| ECOSTRESS | ⬜ | Irregular coverage; candidate for the 48 h |
| Landsat / HLS | ⬜ | 30 m NDVI; candidate for the 48 h (validation of bare-field seasons) |
| MODIS | ➖ | Ending operations; not used on purpose (VIIRS is the successor) |
| GRACE / GRACE-FO | ⬜ | Long-term water-storage trend; very coarse (~300 km) → regional context only |
| SRTM elevation | ⬜ | Would replace the farmer's slope guess with a reference slope per canton (erosion) |
| GEDI biomass | ➖ | Forest biomass; not useful for annual-crop rotation in the pilot |

## Things the tool may highlight (challenge text)
| Point | Status | Where |
|---|---|---|
| Times when fields are typically bare | ✅ new | "Field bare or nearly bare in k of 9 seasons" on every plan |
| Seasons when current crops are more vulnerable | ✅ new | "Weak spots of what you plant today" on the Today card |
| Interrupt pest cycles | ✅ | Family-change rule + evidence line |
| Reduce water demand / improve infiltration | 🟡 | Water axis; infiltration only indirectly (cover + residue) |
| Supplemental income | ✅ | Income in colones |
| Forage value | ⬜ | No forage crop in the catalog yet (Guanacaste is cattle country) — team decision |
| Nitrogen-fixing, cover, deep-rooting, drought-tolerant crops explained | 🟡 | Glossary + reasons; deep-rooting not modelled |

## Potential considerations
| Point | Status | Where |
|---|---|---|
| Explain ET, soil-moisture anomalies, NDVI, frost risk, water balance | 🟡 | Glossary has them; the app explains ET0 and water balance in plain words |
| Satellite vs ground measurements | ✅ | Gap line "Satellite climate is regional…"; How it works |
| Compare SI / statistical approaches | ⬜ | See video row "AI / ML model" |
| How the model handles uncertainty; where local expertise is needed | ✅ new | Gaps + checks per plan |
| Harmonise resolutions to a common grid | 🟡 | Only POWER today (5 grid cells for 11 cantons, shown in the app). Explain in the submission if SMAP/IMERG enter |
| Interactive maps over time | 🟡 | Canton map + monthly chart; no time slider |
| Field-level vulnerability zones | ➖ | Plot-level maps need data the challenge's theoretical scope excludes (D23) |
| Scenario sliders for rainfall / temperature | 🟡 | Four scenario buttons (normal, El Niño, driest year, forecast); a free slider is not built |
| Farmer inputs priorities and constraints (water, equipment, market) | ✅ new | Priorities, irrigation, max loss, **and new "crops I cannot grow (no buyer, equipment or seed)"** |
| Frost risk | ➖ | Not modelled; the app says why: coldest monthly-average minimum 19.7 °C (NASA POWER, 2021 → today, 11 cantons) |
