# Data sources

**Rule:** every piece of data that enters the model covers at least **Jan 2021 → today**. Older data is only historical context (cited in `research/`), never inside the engine. Reviewed on 18 Oct 2026.

| Dataset | Provider | Link | Licence | Use | Status |
|---|---|---|---|---|---|
| NASA POWER daily, AG community | NASA Langley | https://power.larc.nasa.gov/docs/services/api/temporal/daily/ | Open (NASA) | Rainfall (`PRECTOTCORR`), temperature (`T2M`, `_MAX`, `_MIN`), RH, radiation, wind, soil moisture (`GWETTOP`, `GWETROOT`) per canton, 2021 → today | **Core** — `scripts/fetch_data.py` |
| ET0 | Computed (Hargreaves, FAO-56 eq. 52) from POWER temperature | — | — | Crop water demand | **Core** |
| ENSO index (RONI / ONI) | NOAA CPC | https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/ | Public domain (US) | Label every month as El Niño / La Niña / neutral | **Core** (with fallback table) |
| FAO-56 | FAO, Allen et al. 1998 | https://www.fao.org/4/x0490e/x0490e00.htm | FAO | Kc, cycle lengths, water formulas | **Core** (catalog) |
| FAO ECOCROP | FAO | https://gaez.fao.org/pages/ecocrop | FAO | pH and temperature ranges per crop | **Core** (catalog, to be verified) |
| SoilGrids 2.0 (WCS) | ISRIC | https://docs.isric.org/globaldata/soilgrids/ | CC BY 4.0 | **Reference** pH, texture and carbon when the farmer does not know | Optional; the REST API is **paused**, WCS is used |
| GPM IMERG Final monthly V07 | NASA GES DISC | https://gpm.nasa.gov/data/imerg | Open (NASA) | Cross-check POWER rainfall (~10 km) | Optional; needs Earthdata (secrets) |
| SMAP L4 | NASA NSIDC | https://nsidc.org/data/smap | Open (NASA) | 9 km soil moisture | Future; check mission status |
| HLS / VIIRS (NDVI) | NASA LP DAAC | https://www.earthdata.nasa.gov/data/projects/hls | Open | Validate vegetation stress in 2023 and 2026 | Future (validation) |
| Worldview / GIBS | NASA ESDIS | https://worldview.earthdata.nasa.gov | Open | Images for the video | Video |
| Wholesale prices | PIMA / CENADA | — | Public | Income axis in colones | Pending (Angeli) |
| Production costs | MAG / INTA | — | Public | Income axis in colones | Pending (Angeli) |
| Planted area | INEC — National Agricultural Survey 2024 | — | Public | Context | Context |

## Access
- **No account:** POWER, NOAA CPC, SoilGrids (WCS), Worldview.
- **Earthdata account (free):** IMERG, SMAP, HLS, VIIRS. On GitHub: *Settings → Secrets → Actions* → `EARTHDATA_USERNAME`, `EARTHDATA_PASSWORD`. Never in code.
- **POWER limit:** max. 20 parameters per point request; daily data since 1981.

## Declared limitations
- **Scale:** POWER is a grid tens of km wide. Confirmed with the data: the 11 cantons fall in **only 5 cells** with identical series (Liberia = Carrillo = Santa Cruz; Bagaces = Tilarán = Cañas = Abangares; Nicoya = Hojancha; La Cruz; Nandayure), see `summary.json`, `cantons_per_cell`. That is why the farmer's own data (pH, texture, irrigation) is what tailors the result to the plot.
- **Short window (≈ 5.8 years):** only 2 El Niño episodes (2023-24, weak in Guanacaste; 2026, strong). Jan–May have almost no El Niño samples → they are filled with the average and marked in the chart.
- **Ongoing ENSO:** NOAA's official rule needs 5 seasons; El Niño 2026 is labelled from June as *ongoing* and months the index has not published yet inherit its phase (*estimated*).
- **Finding to review (science):** according to POWER, the worst year (May–Nov) of 2021-2025 is 2023, and in Nandayure Primera barely dries out during El Niño. Cross-check with IMERG and IMN stations.
- **Latency:** the last month may be incomplete; months with fewer than 25 valid days are not used.
- **SoilGrids is modelled**, with few Costa Rican samples: reference only.
- **MODIS** ends in late 2026 / early 2027: not used.
