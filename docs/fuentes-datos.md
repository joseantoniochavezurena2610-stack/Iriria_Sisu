# Fuentes de datos

**Regla:** todo dato que entra al modelo cubre como mínimo **ene-2021 → hoy**. Datos más viejos solo como contexto histórico (citados en `investigacion/`), nunca dentro del motor. Revisado el 18-oct-2026.

| Dataset | Fuente | Link | Licencia | Uso | Estado |
|---|---|---|---|---|---|
| NASA POWER diario, comunidad AG | NASA Langley | https://power.larc.nasa.gov/docs/services/api/temporal/daily/ | Abierto (NASA) | Lluvia (`PRECTOTCORR`), T (`T2M`, `_MAX`, `_MIN`), HR, radiación, viento, humedad de suelo (`GWETTOP`, `GWETROOT`) por cantón, 2021 → hoy | **Núcleo** — `scripts/descargar_datos.py` |
| ET0 | Calculada (Hargreaves, FAO-56 ec. 52) con T de POWER | — | — | Demanda de agua de los cultivos | **Núcleo** |
| Índice ENSO (RONI / ONI) | NOAA CPC | https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/ | Dominio público (EE. UU.) | Clasificar cada mes en El Niño / La Niña / neutral | **Núcleo** (con tabla de respaldo) |
| FAO-56 | FAO, Allen et al. 1998 | https://www.fao.org/4/x0490e/x0490e00.htm | FAO | Kc, duración de ciclos, fórmulas de agua | **Núcleo** (catálogo) |
| FAO ECOCROP | FAO | https://gaez.fao.org/pages/ecocrop | FAO | Rangos de pH y temperatura por cultivo | **Núcleo** (catálogo, por verificar) |
| SoilGrids 2.0 (WCS) | ISRIC | https://docs.isric.org/globaldata/soilgrids/ | CC BY 4.0 | pH, textura y carbono de **referencia** cuando el agricultor no sabe | Opcional; la API REST está **pausada**, se usa WCS |
| GPM IMERG Final mensual V07 | NASA GES DISC | https://gpm.nasa.gov/data/imerg | Abierto (NASA) | Contrastar la lluvia de POWER (~10 km) | Opcional; requiere Earthdata (secrets) |
| SMAP L4 | NASA NSIDC | https://nsidc.org/data/smap | Abierto (NASA) | Humedad de suelo 9 km | Futuro; verificar estado de la misión |
| HLS / VIIRS (NDVI) | NASA LP DAAC | https://www.earthdata.nasa.gov/data/projects/hls | Abierto | Validar estrés de vegetación en 2023 y 2026 | Futuro (validación) |
| Worldview / GIBS | NASA ESDIS | https://worldview.earthdata.nasa.gov | Abierto | Imágenes para el video | Video |
| Precios mayoristas | PIMA / CENADA | — | Público | Eje Ingreso en colones | Pendiente (Angeli) |
| Costos de producción | MAG / INTA | — | Público | Eje Ingreso en colones | Pendiente (Angeli) |
| Área sembrada | INEC — ENA 2024 | — | Público | Contexto | Contexto |

## Acceso
- **Sin cuenta:** POWER, NOAA CPC, SoilGrids (WCS), Worldview.
- **Con cuenta Earthdata (gratis):** IMERG, SMAP, HLS, VIIRS. En GitHub: *Settings → Secrets → Actions* → `EARTHDATA_USERNAME`, `EARTHDATA_PASSWORD`. Nunca en el código.
- **Límite POWER:** máx. 20 parámetros por consulta de punto; datos diarios desde 1981.

## Limitaciones declaradas
- **Escala:** POWER es una malla de decenas de km; varios cantones comparten celda (ver `web/data/guanacaste/resumen.json`, campo `cantones_por_celda`). Por eso los datos del agricultor (pH, textura, riego) son los que ajustan a la parcela.
- **Ventana corta (≈ 5,8 años):** solo 2 episodios El Niño (2023-24, débil en Guanacaste; 2026, fuerte). Los meses ene–may casi no tienen muestra El Niño → se rellenan con el promedio y se marca en el gráfico.
- **Latencia:** el último mes puede estar incompleto; los meses con menos de 25 días válidos no se usan.
- **SoilGrids es modelado**, con pocas muestras de CR: solo referencia.
- **MODIS** termina a fines de 2026 / inicios de 2027: no se usa.
