# Iriria Sìsù glossary

A dictionary of the technical and lesser-known terms in the project, so the whole team speaks the same language. Each term gives its **Spanish equivalent**, **what it is** and **how we use it**.

If you find a word that is not here, add it to the right section (alphabetical order) with a PR.

**Sections:** [1. Soil](#1-soil) · [2. Crops and rotation](#2-crops-and-rotation) · [3. Water and water balance](#3-water-and-water-balance) · [4. Climate and El Niño](#4-climate-and-el-niño) · [5. Satellites and NASA data](#5-satellites-and-nasa-data) · [6. Data formats and tools](#6-data-formats-and-tools) · [7. Decision engine and scientific method](#7-decision-engine-and-scientific-method) · [8. Web, domain and deployment](#8-web-domain-and-deployment) · [9. Economics](#9-economics) · [10. Costa Rican institutions and acronyms](#10-costa-rican-institutions-and-acronyms) · [11. Space Apps](#11-space-apps)

---

## 1. Soil

| Term | Spanish | What it is | How we use it |
|---|---|---|---|
| **Aggregate** | Agregado | A group of soil particles stuck together (by clay, organic matter and organisms). | Explains why organic matter improves structure. |
| **Andisol** | Andisol | Volcanic soil, light and fertile. ~14 % of Costa Rica. | Context; uncommon on the Guanacaste plains. |
| **Bulk density** | Densidad aparente | Mass of dry soil per total volume. High values indicate compaction. | Context. |
| **Cation exchange capacity (CEC)** | Capacidad de intercambio catiónico (CIC) | The soil's ability to hold positively charged nutrients (Ca, Mg, K, ammonium). Low CEC = nutrients wash out easily. | Not in the MVP; possible improvement. |
| **Compaction** | Compactación | Loss of pore space from pressure (machinery, cattle). Reduces infiltration and roots. | Mentioned as a limitation; not measured. |
| **Crop residue** | Rastrojo | Stalks and leaves left in the field after harvest. | In the engine, "Fallow (crop residue)" gives some ground cover. |
| **Electrical conductivity (EC)** | Conductividad eléctrica (CE) | Measure of the amount of dissolved salts in the soil. | Salinity: future improvement. |
| **Entisol** | Entisol | Young, poorly developed soil on loose or alluvial material. ~12 % of CR; common on Guanacaste's coast. | Pilot-region context. |
| **Erosion** | Erosión | Loss of the topsoil by water or wind. Worse on bare, sloping land. | The Soil axis penalises leaving soil uncovered on slopes. |
| **Field capacity** | Capacidad de campo | Water left in the soil after excess water drains (1–3 days after heavy rain). | Upper limit of available water. |
| **Inceptisol** | Inceptisol | Young to intermediate soil, the most common in CR (~38.6 %). | Context. |
| **Leaching** | Lixiviación | Nutrients washed downwards by water. | Explains why sandy soils lose nitrogen. |
| **Organic matter (OM)** | Materia orgánica (MO) | Remains of plants, animals and microorganisms in the soil. Improves structure, water and nutrients. | Optional question for the farmer ("light / dark soil"). |
| **pH** | pH | Acidity (below 7) or alkalinity (above 7) of the soil. Changes which nutrients the plant can take up. | **Hard rule** in the engine: if pH is outside the crop's tolerable range, the crop is ruled out. |
| **Permanent wilting point** | Punto de marchitez permanente | Moisture below which the plant can no longer extract water and wilts without recovering. | Lower limit of available water. |
| **Ribbon test** | Prueba de la cinta | Field method to estimate texture: wet soil is squeezed between the fingers. No ribbon = sandy; short ribbon = loam; long ribbon = clay. | How the farmer enters texture without a lab. |
| **Salinity** | Salinidad | Build-up of salts that makes it harder for plants to absorb water. | Future improvement. |
| **Soil order (USDA)** | Orden de suelo (USDA) | Top level of the US soil classification (12 orders). CR has 10. | Argument: there is no national recipe, every farm is different. |
| **Soil organic carbon (SOC)** | Carbono orgánico del suelo (COS) | Carbon that is part of organic matter. A classic indicator of soil health. | SoilGrids reference value (`soc`). |
| **SoilGrids** | SoilGrids | Global 250 m maps of soil properties made by ISRIC with machine learning. **Modelled, not measured.** | Only as a reference value when the farmer does not know their pH. Its REST API is paused; we use WCS. |
| **Texture** | Textura | Proportion of sand, silt and clay. Defines how much water the soil holds and how fast it drains. | The farmer picks sandy / loam / clay. |
| **Total available water (TAW)** | Agua útil / agua disponible total (ADT) | Water held between *field capacity* and the *permanent wilting point*; the water plants can use. In mm per metre of soil. | The engine uses 70 (sandy), 140 (loam) and 170 mm/m (clay) for soil-water carry-over. |
| **Ultisol** | Ultisol | Old, reddish, acidic, nutrient-poor soil; ~21 % of CR. | Context. |
| **Vertisol** | Vertisol | Clay soil that cracks in the dry season and swells in the rains. ~1.6 % of CR; Tempisque plains (rice). | Guanacaste context. |

## 2. Crops and rotation

| Term | Spanish | What it is | How we use it |
|---|---|---|---|
| **Annual crop** | Cultivo anual | A crop that completes its cycle in less than a year (grains, vegetables). | Only these enter the rotation (not coffee, sugarcane or banana). |
| **Biological nitrogen fixation** | Fijación biológica de nitrógeno | Bacteria (rhizobia) in legume roots take nitrogen from the air and leave it in the soil. | Basis of the nitrogen credit. |
| **Botanical family** | Familia botánica | Group of related plants (Poaceae = grasses; Fabaceae = legumes; Cucurbitaceae = melon, watermelon…). They share pests and the nutrients they use. | The engine penalises repeating the same family back to back. |
| **Cover crop** | Cultivo de cobertura | A crop that protects the soil from erosion and sun between harvests. | `cover` column (0-3) of the catalog. |
| **Cowpea** | Caupí, "frijol de costa" | *Vigna unguiculata*. A very drought-tolerant legume. | Key option in El Niño scenarios. |
| **Crop cycle (days)** | Ciclo (días) | Time from sowing to harvest. | Defines how many months of the season the crop occupies. |
| **Grass family (Poaceae)** | Gramínea | Family of rice, maize and sorghum. They use a lot of nitrogen. | `gram` group. |
| **Green manure** | Abono verde | A crop sown to be incorporated into the soil, not harvested (mucuna, jack bean). Adds nitrogen and organic matter. | `green_manure = yes` in the catalog; gives a +15 % bonus to the next crop. |
| **Jack bean / Mucuna** | Canavalia / Mucuna | Legumes used as green manure. Jack bean tolerates drought well. | Green manures in the catalog. |
| **Legume (Fabaceae)** | Leguminosa | Family of beans, cowpea, peanut, soybean. They fix nitrogen. | `leg` group. Rotating with legumes raises the main crop's yield by ~20 % (Zhao et al. 2022). |
| **Monoculture** | Monocultivo | Planting the same crop over and over. Depletes nutrients and builds up pests. | Usually what the "If you keep planting what you plant today" card shows. |
| **Rainfed** | Secano | Farming that depends only on rain, without irrigation. | The "No, rain only" option of the form. |
| **Rotation** | Rotación de cultivos | Changing the crops of the same field in an orderly way across seasons. | What the engine designs: 3 years × 3 seasons = 9 slots. |
| **Suitability** | Aptitud | How well a crop fits a season and a farm, from 0 to 1. | Product of 4 factors: water × temperature × pH × excess rain. |

## 3. Water and water balance

| Term | Spanish | What it is | How we use it |
|---|---|---|---|
| **Coverage of demand** | Cobertura de la demanda | Share of the water the crop needs that it actually receives. | Below ~75 % we count that season as a "failure" when computing risk. |
| **Effective rainfall** | Lluvia efectiva | Part of the rain that actually stays in the root zone (the rest runs off or drains deep). | USDA-SCS monthly method. |
| **ET0 (reference evapotranspiration)** | ET0 (evapotranspiración de referencia) | Water "demanded" by the air: what a short, well-watered grass would evaporate and transpire. Depends on temperature, sun, wind and humidity. In mm. | Computed month by month with Hargreaves from NASA POWER temperature. |
| **ETc (crop evapotranspiration)** | ETc (evapotranspiración del cultivo) | ET0 × Kc: the water a specific crop demands. | Water demand of each crop in each season. |
| **Evapotranspiration** | Evapotranspiración | Evaporation from the soil plus transpiration from plants. | — |
| **FAO-56** | FAO-56 | FAO manual (Allen et al., 1998) *Crop evapotranspiration*, the global reference for crop water calculations. | Source of Kc, cycle lengths and ET0 formulas. |
| **Hargreaves equation** | Ecuación de Hargreaves | ET0 formula that only needs maximum, minimum and mean temperature and latitude. Recommended by FAO-56 when wind and humidity data are missing. | We use it because it is robust and reproducible. |
| **Kc (crop coefficient)** | Kc (coeficiente de cultivo) | Number that adjusts ET0 to the crop by growth stage (initial, mid, late). | We use a season-average Kc (`kc_season`). |
| **Readily available water (RAW)** | Reserva fácilmente aprovechable | Part of the available water the plant uses without stress (≈ 50 %). | If the previous month rained more than it evaporated, the crop starts with this reserve. |
| **Root zone** | Zona radicular | Soil layer where the roots are (~0–1 m). | Average depth used: 0.6 m. |
| **Water balance** | Balance hídrico | Accounting of water inputs (rain, irrigation, soil reserve) and outputs (evapotranspiration) of a crop. | Computed per season in `waterBalance()` (engine.js). |
| **Water deficit** | Déficit hídrico | Water the crop is missing: demand minus what it receives. | Covered with irrigation up to the maximum the farmer reports. |

## 4. Climate and El Niño

| Term | Spanish | What it is | How we use it |
|---|---|---|---|
| **Anomaly** | Anomalía | Difference between a value and its historical average (e.g. +2 °C above normal). | Basis of the ENSO indices. |
| **Canícula (mid-summer drought)** | Canícula / veranillo de San Juan | Driest stretch inside the rainy season on Costa Rica's Pacific side, usually July–August. In 2026 it began in late June. | Falls inside the **Primera** season; that is why Primera is the riskiest season in El Niño. |
| **Dry season** | Época seca | In Guanacaste roughly December to April; it barely rains. | The engine's "Dry" season (Jan–Apr): without irrigation, only fallow or green manure. |
| **El Niño** | El Niño | Warm phase of ENSO: the central and eastern equatorial Pacific warms up. In Guanacaste it usually brings **less rain and more heat**; Costa Rica's Caribbean side sometimes gets more rain. | "El Niño year" and "Current forecast" scenarios. |
| **ENSO (El Niño–Southern Oscillation)** | ENOS (El Niño–Oscilación del Sur) | Natural, cyclic phenomenon of the equatorial Pacific ocean–atmosphere system with three phases: El Niño, La Niña and neutral. | We label every month with NOAA's index. |
| **IMN** | IMN | Costa Rica's National Meteorological Institute. | Source of the 2026 forecasts and rainfall deficits. |
| **La Niña** | La Niña | Cold phase of ENSO. In Guanacaste it usually brings more rain. | 2021–2023 and 2024–2026 were La Niña. |
| **Meteorological drought** | Sequía meteorológica | A period with rainfall far below normal. Declared by the IMN for the Pacific slope in 2026. | Context. |
| **Niño 3.4** | Niño 3.4 | Pacific region (5°N–5°S, 170°W–120°W) whose sea temperature defines ENSO. | — |
| **ONI (Oceanic Niño Index)** | ONI | NOAA index: 3-month average of the sea-temperature anomaly in Niño 3.4. El Niño if ≥ +0.5 °C for 5 consecutive seasons. | Fallback if RONI is not available. |
| **Postrera** | Postrera | Second planting of the rainy season (September–December in the engine). | Season 3 of the calendar. |
| **Primera** | Primera | First planting of the rainy season (May–August in the engine). | Season 2 of the calendar. |
| **Rainy season** | Época lluviosa | Roughly May to November. Split into Primera and Postrera, with the canícula in between. | — |
| **RONI (Relative ONI)** | RONI | Version of the ONI that subtracts overall tropical warming; NOAA now uses it as the official index. | First choice in the data script. |
| **Scenario** | Escenario | The version of the climate the engine runs with: normal, El Niño, worst year or forecast. | "Which climate do we compare against?" buttons. |

## 5. Satellites and NASA data

| Term | Spanish | What it is | How we use it |
|---|---|---|---|
| **AppEEARS** | AppEEARS | NASA web tool to subset satellite data by point or polygon without downloading whole files. | Option for HLS/ECOSTRESS in the future. |
| **CERES** | CERES | NASA instrument/project that measures radiation; feeds POWER's solar data. | Source of `ALLSKY_SFC_SW_DWN`. |
| **DAAC** | DAAC | *Distributed Active Archive Center*: NASA centres that store and distribute data (GES DISC, NSIDC, LP DAAC…). | — |
| **Earthdata (account / login)** | Cuenta Earthdata | Free NASA account to download most of its data. | Needed for IMERG, SMAP, HLS. **Not** for POWER. Stored as a GitHub *secret*, never in code. |
| **earthaccess** | earthaccess | Python library that handles Earthdata login, search and download. | `scripts/fetch_imerg.py`. |
| **ECOSTRESS** | ECOSTRESS | Instrument on the Space Station that measures plant temperature and estimates evapotranspiration. Irregular coverage. | Optional / future. |
| **GES DISC** | GES DISC | NASA Goddard data centre for precipitation and atmosphere (home of IMERG). | — |
| **GIBS / Worldview** | GIBS / Worldview | NASA service of ready-made satellite imagery (GIBS) and its web viewer (Worldview). | Images for the video. |
| **GPM IMERG** | GPM IMERG | GPM mission rainfall product combining many satellites; 0.1° grid (~10 km). Early, Late and **Final** runs (Final is the most accurate, with months of delay). | Cross-check of POWER rainfall (`fetch_imerg.py`). |
| **Grid / spatial resolution** | Malla / resolución espacial | Size of each data cell. POWER ≈ 0.5° × 0.625° (tens of km); IMERG 0.1°; SMAP 9 km; SoilGrids 250 m. | We always state the scale: it is **regional** data, not the plot. |
| **GWETTOP / GWETROOT** | GWETTOP / GWETROOT | POWER parameters: soil moisture as a fraction from 0 (dry) to 1 (saturated) in the surface layer (0–5 cm) and the root zone. From the MERRA-2 model. | Downloaded and stored; future use in the engine. |
| **HLS** | HLS | *Harmonized Landsat Sentinel-2*: 30 m imagery harmonised from Landsat and Sentinel-2. | Farm-scale NDVI validation (future). |
| **L3 / L4 (processing level)** | Nivel L3 / L4 | L3 = data on a regular grid; L4 = model output + observations (e.g. SMAP L4). | — |
| **Latency** | Latencia | Time between an event and the data becoming available. POWER: days to months depending on the variable. | That is why the last month may be missing. |
| **MERRA-2** | MERRA-2 | NASA atmospheric reanalysis (model + observations). Source of POWER's meteorology. | — |
| **MODIS** | MODIS | Sensor on the Terra and Aqua satellites; stops operating in late 2026 / early 2027. | **We do not depend on MODIS.** |
| **NASA POWER** | NASA POWER | *Prediction Of Worldwide Energy Resources*. Free NASA Langley API with daily climate since 1981 for any point. **AG** community = agroclimatology. Max. 20 parameters per request. | **Main data source** of the project. |
| **NDVI / EVI** | NDVI / EVI | Vegetation indices computed from imagery: high values = green, vigorous vegetation. | Future validation (did vegetation suffer in 2023 and 2026?). |
| **PRECTOTCORR** | PRECTOTCORR | POWER parameter: corrected total precipitation (mm/day). | The engine's rainfall. |
| **Reanalysis** | Reanálisis | Reconstruction of past climate combining models and observations. | POWER uses MERRA-2. |
| **SMAP** | SMAP | NASA mission that measures soil moisture from space with microwaves (sees through clouds). L4 at 9 km. | Future improvement; needs Earthdata. |
| **T2M / T2M_MAX / T2M_MIN** | T2M / T2M_MAX / T2M_MIN | Air temperature at 2 m: daily mean, maximum and minimum (°C). | Temperature and ET0 calculation. |
| **VIIRS** | VIIRS | MODIS successor sensor (Suomi NPP, NOAA-20/21 satellites). Has vegetation products (VNP13). | MODIS replacement for NDVI. |

## 6. Data formats and tools

| Term | Spanish | What it is | How we use it |
|---|---|---|---|
| **API** | API | A way for one program to request data from another over the internet (e.g. a URL that returns JSON). | POWER is queried through an API. |
| **COG (Cloud Optimized GeoTIFF)** | COG | GeoTIFF organised so that only a piece can be read over the internet. | HLS. |
| **CORS** | CORS | Browser rule that decides whether a page may request data from another domain. | If POWER does not allow it, the live download from the website fails and the precomputed data is used. |
| **CSV** | CSV | Comma-separated text table; opens in Excel. | Crop catalog (`data/catalog/`). |
| **Fill value (-999)** | Valor de relleno | A number meaning "no data". | We discard it; a month with fewer than 25 valid days is not used. **We never invent data.** |
| **GeoJSON** | GeoJSON | JSON with geometries (points, polygons). | Possible for canton boundaries. |
| **GeoTIFF** | GeoTIFF | Image with geographic coordinates (raster maps). | SoilGrids. |
| **HDF5 / NetCDF** | HDF5 / NetCDF | Scientific formats for multidimensional data (time × lat × lon). | IMERG, SMAP. |
| **JSON** | JSON | Text format for structured data (`{"key": value}`). | All the data the website reads. |
| **Raster** | Ráster | Data shaped as a grid of pixels. | — |
| **REST API** | API REST | API style based on URLs and HTTP methods (GET, POST). | — |
| **WCS** | WCS | *Web Coverage Service*: a standard for requesting a piece of a raster map by URL. | SoilGrids (because its REST API is paused). |
| **xarray / rasterio** | xarray / rasterio | Python libraries for multidimensional and raster data. | Optional scripts. |

## 7. Decision engine and scientific method

| Term | Spanish | What it is | How we use it |
|---|---|---|---|
| **Analog year** | Año análogo | A past year with conditions similar to the one being studied (e.g. another El Niño year). | Scenarios based on the real years 2023 and 2026. |
| **Axis** | Eje | Each criterion scored from 0 to 100. | Soil, Water, Safety (risk) and Income. |
| **Backtest** | Prueba hacia atrás | Running the model with data from a past year and comparing with what really happened. | 2026 is a natural experiment: rice growers in Nandayure did not plant. |
| **Beam search** | Búsqueda en haz | An algorithm that builds solutions step by step keeping only the N best partial ones. | Builds the 9-season rotations without testing every combination (11⁹). |
| **Black box** | Caja negra | A model whose decisions cannot be explained. | **What we avoid**: transparent rules. |
| **Expert validation** | Validación experta | An agronomist or extension agent checks whether the plans make sense. | Pending (MAG/INTA). |
| **Hard rule** | Regla dura | A condition that rules out an option regardless of its score. | pH out of range, crop out of season. |
| **Hypothesis** | Hipótesis | A statement that can be tested with data. | H1 and H2 in `docs/roles/science-lead.md`. |
| **Multi-criteria decision** | Decisión multicriterio | Choosing among options evaluated on several weighted criteria at once. | Soil, Water, Risk and Income axes with the farmer's priorities. |
| **Pure function** | Función pura | A function that always returns the same output for the same input and touches nothing external. | `recommend()`: easy to test. |
| **Risk (Safety axis)** | Riesgo (eje Seguridad) | 1 − share of observed years in which water fell short. | Comes from the 2021→today data, year by year. |
| **Robust plan** | Plan robusto | A plan whose El Niño score is at least 85 % of its normal-year score, with safety ≥ 50. | Green label on the card. |
| **Sensitivity analysis** | Análisis de sensibilidad | Moving the uncertain parameters (±20 %) and checking whether the results change. | Validation: if the top 3 does not change, the result is robust. |
| **Unit test** | Prueba unitaria | A small program that checks a function does what it should. | `tests/engine.test.js` (`npm test`). |
| **Weighted average** | Promedio ponderado | An average where each value carries a different weight. | Total score with the 0–5 weights. |

## 8. Web, domain and deployment

| Term | Spanish | What it is | How we use it |
|---|---|---|---|
| **CDN** | CDN | Network of servers that delivers files quickly from the nearest location. | Leaflet and the fonts come from a CDN; the app works even if they fail. |
| **CNAME** | CNAME | DNS record meaning "this name points to that other name". | To point `www.ourdomain` to GitHub Pages. |
| **DNS** | DNS | The internet's "phone book": translates a domain into the server's address. | Domain setup. |
| **Domain** | Dominio | The page's name (e.g. `iririasisu.app`). Bought yearly from a registrar. | José Pablo finds and buys it. |
| **GitHub Actions** | GitHub Actions | Automations that run on GitHub's servers when something happens in the repo. | Download NASA data, run tests and publish. |
| **GitHub Pages** | GitHub Pages | Free GitHub hosting for static pages, with HTTPS and custom domains. | Recommended option to publish `web/`. |
| **Hosting** | Hosting | The service where the page lives. | — |
| **HTTPS / TLS certificate** | HTTPS / certificado TLS | Encrypted connection (the padlock). Required to use the phone's location. | GitHub Pages provides it for free with a custom domain. |
| **Leaflet** | Leaflet | Free web mapping library. | Canton map. |
| **A / AAAA record** | Registro A / AAAA | DNS records pointing a domain to an IP address (v4 / v6). | For the root domain on GitHub Pages. |
| **Registrar** | Registrador | Company where the domain is bought (NIC Costa Rica for `.cr`; others for `.com`, `.app`, etc.). | — |
| **Responsive** | Responsive / adaptable | The page adapts to phone, tablet and computer. | Requirement: extension agents use it in the field. |
| **Secret (GitHub)** | Secret (GitHub) | Encrypted repository variable for passwords. | `EARTHDATA_USERNAME`, `EARTHDATA_PASSWORD`. |
| **Static page** | Página estática | A site made only of files (HTML, CSS, JS, JSON), with no server doing calculations. | Our app: the engine runs in the user's browser. Running cost ≈ $0. |
| **Workflow** | Workflow | YAML file in `.github/workflows/` that defines an automation. | `data.yml`, `tests.yml`, `publish.yml`. |

## 9. Economics

| Term | Spanish | What it is | How we use it |
|---|---|---|---|
| **Maximum tolerable loss** | Pérdida máxima tolerable | How much income the farmer is willing to give up to reduce risk. | Optional question; filters plans. |
| **Margin** | Margen | Sales income minus costs. | Relative (1–5) for now, until real prices are in. |
| **Production cost** | Costo de producción | What it costs to produce one hectare (seed, fertiliser, labour, machinery). | `production_cost_crc_ha` column (pending). |
| **Transition cost** | Costo de transición | Extra cost of switching crops (new seed, equipment, learning, finding a market). | Future improvement of the Income axis. |
| **Urea (46 % N)** | Urea | The most common nitrogen fertiliser. | To translate legume nitrogen into colones saved. |
| **Wholesale price** | Precio mayorista | Selling price in markets such as CENADA. | Source for `price_crc_kg` (PIMA). |

## 10. Costa Rican institutions and acronyms

| Acronym | Name (Spanish) | English | Why it matters to us |
|---|---|---|---|
| **ASADA** | Asociación Administradora de Sistemas de Acueductos y Alcantarillados comunales | Community water-system association | Context of water shortage in communities. |
| **CENADA** | Centro Nacional de Abastecimiento y Distribución de Alimentos | National food wholesale market | Wholesale prices. |
| **CNE** | Comisión Nacional de Prevención de Riesgos y Atención de Emergencias | National Emergency Commission | El Niño alerts (orange in all 11 cantons of Guanacaste). |
| **CNP** | Consejo Nacional de Producción | National Production Council | Consumer prices. |
| **INEC** | Instituto Nacional de Estadística y Censos | National Statistics Institute | National Agricultural Survey (planted area). |
| **INTA** | Instituto Nacional de Innovación y Transferencia en Tecnología Agropecuaria | National agricultural technology institute | Soil tests, crop technical sheets. |
| **MAG** | Ministerio de Agricultura y Ganadería | Ministry of Agriculture and Livestock | Extension agencies: the path to reach farmers. |
| **PIMA** | Programa Integral de Mercadeo Agropecuario | Agricultural marketing programme | Runs CENADA; publishes prices. |
| **SENARA** | Servicio Nacional de Aguas Subterráneas, Riego y Avenamiento | National groundwater, irrigation and drainage service | Irrigation in Guanacaste (Arenal-Tempisque district). |
| **UPA** | Unión de Pequeños Productores Agropecuarios | Small farmers' union | Voice of affected growers. |

## 11. Space Apps

| Term | Spanish | What it is |
|---|---|---|
| **AI-use disclosure** | Declaración de uso de IA | The form asks which AI tools were used and how. AI-made images/videos need a watermark; NASA branding may not be used or modified. |
| **Challenge** | Reto | The official problem we chose: "Change of Course: Adapting Farms with NASA Data". |
| **Final project link** | Enlace final del proyecto | Public link to the project, with no password: it will be our website with a custom domain. |
| **Global Award** | Premio global | Global prizes; to be eligible you must use NASA data or resources. |
| **Local Event** | Sede local | The local venue where the team is registered; everyone must be at the same one. |
| **Project demo** | Demo del proyecto | A video of **at most 30 seconds** (or up to 7 slides). It must be **in English or have English subtitles** and be hosted externally (YouTube, Drive) with a public link. **We chose video.** |
