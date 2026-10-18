# Fuentes de datos

Registrar aquí cada dataset usado — esto ayuda mucho para el criterio de "Best Use of Data/Science" en el submission. Estado revisado el 18-oct-2026.

| Dataset | Fuente | Link | Licencia | Uso en el proyecto | Prioridad |
|---|---|---|---|---|---|
| NASA POWER (diario/mensual, comunidad AG) | NASA LaRC | https://power.larc.nasa.gov/docs/services/api/temporal/daily/ | Abierto (NASA) | Lluvia, T°, HR, radiación, `GWETTOP`/`GWETROOT` (humedad de suelo) 1995-2025 por punto | MVP |
| GPM IMERG (Final, diario/mensual) | NASA GES DISC | https://gpm.nasa.gov/data/imerg | Abierto (NASA) | Lluvia con mejor detalle (~10 km); años análogos El Niño 2015 y 2023 | MVP |
| SoilGrids 250 m | ISRIC | https://soilgrids.org | CC BY 4.0 | pH, textura, carbono orgánico por punto | MVP |
| FAO ECOCROP | FAO | https://gaez.fao.org/pages/ecocrop | Abierto (FAO) | Rangos de pH, lluvia y T° por cultivo | MVP |
| SMAP L4 (humedad superficial y zona radicular, 9 km) | NASA NSIDC DAAC | https://nsidc.org/data/smap | Abierto (NASA) | Humedad regional; mejora sobre `GWETROOT` | Mejora |
| HLS (Landsat + Sentinel-2, 30 m) | NASA LP DAAC | https://www.earthdata.nasa.gov/data/projects/hls | Abierto | NDVI para validar estrés en años El Niño | Validación |
| VIIRS índices de vegetación | NASA LAADS/LP DAAC | https://www.earthdata.nasa.gov/data/alerts-outages/transition-from-modis-viirs | Abierto | Sucesor de MODIS para NDVI (MODIS se apaga fines 2026/inicios 2027) | Validación |
| ECOSTRESS (ET, estrés hídrico) | NASA JPL / LP DAAC | https://ecostress.jpl.nasa.gov | Abierto | Evapotranspiración real (opcional, cobertura irregular) | Opcional |
| GIBS / Worldview | NASA ESDIS | https://worldview.earthdata.nasa.gov | Abierto | Imágenes para el pitch y la demo (NEO fue descontinuado sept. 2026; usar Worldview) | Pitch |
| Precios mayoristas | PIMA / CENADA | — | Público | Eje Ingreso | MVP |
| Costos de producción | MAG / INTA (confirmar fichas disponibles) | — | Público | Eje Ingreso | MVP |
| Área sembrada por cultivo | INEC — Encuesta Nacional Agropecuaria 2024 | — | Público | Contexto y validación (caída del arroz 2022→2023) | Contexto |
| Sensor de parcela | Propio (ESP32 + capacitivo calibrado + DHT22) | — | — | Humedad y T° locales | Demo |

## Notas de acceso
- **Sin cuenta:** POWER, SoilGrids, Worldview/GIBS.
- **Con cuenta Earthdata (gratis, crear antes del evento):** IMERG, SMAP, HLS, VIIRS, ECOSTRESS (vía `earthaccess` o AppEEARS).
- **Formatos:** POWER JSON/CSV/NetCDF; IMERG NetCDF/HDF5; SMAP HDF5; HLS GeoTIFF (COG); SoilGrids GeoTIFF/WCS.
- **Límites:** POWER máx. 20 parámetros por consulta de punto.

## Limitaciones conocidas
- **Escala:** POWER ≈ decenas de km; SMAP 9 km; IMERG ~10 km; SoilGrids 250 m (modelado, no medido). Nada de esto es la parcela: por eso existen el dato del agricultor y el sensor.
- **Nubes:** NDVI óptico con huecos en el trópico → usar compuestos de 16 días o mensuales.
- **Continuidad:** MODIS (Terra/Aqua) termina a fines de 2026 / inicios de 2027 → no depender de MODIS.
- **SoilGrids en CR:** pocas muestras locales en el modelo → avisar al usuario y permitir pH/textura de análisis propio.
