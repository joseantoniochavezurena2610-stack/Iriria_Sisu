# Research summary and fact-check

> **Note (18 Oct 2026):** final pilot region = Guanacaste; 100 % web app; the model only uses data from 2021 onwards. Earlier data (e.g. El Niño 2014-16) is historical context. See [`decisions.md`](../decisions.md).

Sources summarised:
1. **Soil research** — *Main soil conditions and characteristics for agriculture* (Iriria Sìsù, Oct 2026; internal document in Spanish).
2. **Research + suggested stack (Pepe)** — challenge context, Costa Rica, competing teams, stack and rotation engine (internal document in Spanish).

Reviewed on 18 Oct 2026. Legend: ✅ verified · ⚠️ corrected / nuanced · ❓ no source yet (do not use in the video or submission until it has one).

---

## 1. Summary — Soil research

**Core idea:** there is no "good" or "bad" soil; a soil is *suitable or not* for each crop. That is why the engine compares the farm's conditions against each species' tolerance range.

| Block | What it says | What it means for the engine |
|---|---|---|
| Physical | Texture, moisture (field capacity – wilting point = available water), structure/compaction, drainage, effective depth | Texture + available water define how much rain the soil "holds" between storms |
| Chemical | pH, N-P-K and micronutrients, CEC, salinity (EC) | pH = hard filter; N = rotation axis (legumes); CEC and EC for later versions |
| Biological | Organic matter / carbon, soil life | Carbon as a health indicator; microbiology not measurable in the MVP (declared) |
| Priority variables | Moisture, temperature, RH, rainfall, pH, texture, OM, NPK, NDVI, ET | Table of NASA sources + farmer data |
| Integration | Satellite = regional trend; farm data = plot detail | Never present a regional value as a farm measurement |

## 2. Summary — Research + stack (Pepe)

- **The challenge:** a decision-support tool combining NASA observations with local soil, crops and farmer priorities to explore rotations.
- **Agronomic evidence:** rotations with legumes raise the main crop's yield; in rice they also raise soil carbon in most cases.
- **Costa Rica:** 10 of 12 soil orders → the tool starts from *each* farm's soil. Rotation only makes sense for annual crops (not coffee/banana).
- **Pilot region:** Guanacaste (rice, beans, maize, melon; hit hardest by El Niño) or Cartago (potato, onion, vegetables; eroded Andisols). **Decision: Guanacaste.**
- **NASA data:** POWER, SMAP L4, GPM IMERG, MODIS/HLS, ECOSTRESS, GIBS. Limitations: clouds, scale, Earthdata accounts, end of MODIS.
- **Competing teams (~14):** almost all Bangladesh or "global"; none works with the two-season tropics + ENSO.
- **Differentiation:** tropics + El Niño, side-by-side options with consequences, decisions based on what the farmer knows.
- **Stack (original proposal):** Python + Streamlit. **Replaced** by a 100 % static website with the engine in JavaScript (see [`decisions.md`](../decisions.md)).
- **Engine:** generate → filter (pH, repetition) → score 0-100 on Soil/Water/Risk/Income → weighted average by priorities → top 3 with reasons. Run in a normal vs El Niño scenario.

---

## 3. Fact-check

| # | Claim in the documents | Status | Verified fact / correction | Source |
|---|---|---|---|---|
| 1 | Legumes: +20 % main-crop yield, meta-analysis of 462 experiments and 11,768 observations; +32 % in low-yield environments, +7 % in high; shrinks with more N | ✅ | Correct as stated | Zhao et al. 2022, *Nature Communications* 13:4926 — https://doi.org/10.1038/s41467-022-32464-0 |
| 2 | Rice after legumes: +15 % yield; 65.5 % of cases improve yield and carbon | ⚠️ | **+15.7 %** and **65.8 %** of cases (1,483 data pairs, 17 countries) | Yao et al. 2025, *One Earth* — https://agritrop.cirad.fr/611529/ |
| 3 | Rice after legumes: +51 % net economic benefit | ❓ | Not in the article's abstract; check the full text before citing | — |
| 4 | CR soil orders: Inceptisols 38-39 %, Ultisols 21 %, Andisols 14 %, Entisols 12 %, Alfisols 9-10 %, Vertisols 1.5-2 % | ✅ | 38.6 / 21 / 14.4 / 12.4 / 9.6 / 1.6 % (Mollisols 1.4 %) | Bertsch et al. 2000, cited in Alvarado & Forsythe 2005, *Agronomía Costarricense* 29(1) |
| 5 | CR has 10 of the 12 USDA orders | ✅ | Correct | Same |
| 6 | ENA 2024 (2023 data): "74 hectares of coffee" | ⚠️ | **~74,000 ha** of coffee (typo). Sugarcane 56,619, banana 47,766, rice 13,770, beans 9,074, maize 5,149 ha | Semanario Universidad on the ENA 2024 (INEC) |
| 7 | Rice fell 59 % (33,586 → 13,770 ha) | ✅ | Correct (−19,816 ha) | Same |
| 8 | El Niño 2026-27: IMN projected it from June 2026 to early 2027, ~30 % less rain | ⚠️ | **It is already happening and it is stronger.** North Pacific **−37 % rainfall Jan–Aug 2026**, orange alert (Liberia, Nicoya, Cañas, Tilarán). "Strong", possibly "very strong" Nov 2026 – Jan 2027. IMN expects effects **at least until July 2027** | Infobae (18 Sep 2026, IMN/CNE bulletin); Monumental (18 Oct 2026) |
| 9 | In El Niño 2014-15 sweet pepper, cucumber and carrot rose up to 300 % | ❓ | No source found; do not use the number without one | — |
| 10 | Forming a few cm of soil takes ~1,000 years; one football pitch is eroded every 5 s | ✅ | Both attributed to FAO (July 2022); cite the original FAO publication in the submission | UN News — https://news.un.org/en/story/2022/07/1123462 |
| 11 | Only 11.6 % of the territory suits intensive agriculture; ~60 % of forest-vocation land misused | ❓ | Find the source (likely a land-use capacity study / State of the Nation report) | — |
| 12 | NASA POWER: REST API, JSON/CSV, no key, up to 20 parameters per request | ✅ | 20 parameters per point request; JSON, CSV, NetCDF, ASCII, ICASA outputs | power.larc.nasa.gov/docs/services/api/temporal/daily/ |
| 13 | POWER ≈ 50 km resolution | ⚠️ | Approximate: MERRA-2 meteorology (~0.5°×0.625°), solar ~1°. Say "tens of km". **Confirmed:** Guanacaste's 11 cantons fall in 5 cells | Same; our own data check |
| 14 | SMAP sees at 9 km | ✅ | SMAP L4 is delivered on a 9 km grid | NASA SMAP |
| 15 | "The GIBS REST API is paused" | ❌ | **False.** GIBS is active (WMTS/WMS). What was **discontinued is NEO** (Sep 2026); NASA recommends Worldview | science.nasa.gov/earth/nasa-earth-observations-neo/ |
| 16 | Terra and Aqua (MODIS) at end of life; VIIRS is the successor | ✅ | MODIS stops operating in **late 2026 or early 2027**. For NDVI use VIIRS (e.g. VNP13) or **HLS** (30 m, better for plots) | earthdata.nasa.gov — Transition from MODIS to VIIRS |
| 17 | Event dates 14-15 Nov 2026 | ✅ | Correct; judging starts 16 Nov | astrobiology.com (2026 registration announcement) |
| 18 | List of "other teams" | ❓ | If these are projects from another edition, they are a reference for what judges have already seen; confirm where the list came from | — |

### Conceptual errors corrected in the documents
- **"Verify SMAP with a capacitive sensor":** a SMAP pixel (9 km) and a single-point sensor do not measure the same thing. A sensor does **not validate** SMAP; it **complements** it. Since 18 Oct the app does not depend on sensors at all (decision D7).
- **NASA POWER also provides soil moisture** (`GWETTOP`, `GWETROOT`, fraction 0-1). Good for the MVP without Earthdata; SMAP L4 is an improvement.
- **Two seasons are not enough for CR's Pacific side:** there is a **dry** season (Dec–Apr), **Primera**, **canícula** (Jul–Aug) and **Postrera**. El Niño hits exactly the canícula and Postrera. The app uses 3 seasons (Dry / Primera / Postrera) and the canícula enters the risk through each year's real rainfall.
- **El Niño is not a flat "−30 %":** in CR the Pacific dries while the Caribbean can get wetter. The scenario comes from real analog years measured with POWER (2023 and 2026), not a fixed percentage.
