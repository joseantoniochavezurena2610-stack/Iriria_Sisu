# Resumen y verificación de la investigación

Fuentes resumidas:
1. **Investigación de suelos** — *Principales condiciones y características del suelo para la agricultura* (Iriria Sìsù, oct. 2026).
2. **Investigación + Stack sugerido (Pepe)** — contexto del reto, Costa Rica, competencia, stack y motor de rotación.

Revisado el 18-oct-2026. Leyenda: ✅ verificado · ⚠️ corregido / matizado · ❓ sin fuente todavía (no usar en el pitch hasta tenerla).

---

## 1. Resumen — Investigación de suelos

**Idea central:** no existe un suelo "bueno" o "malo"; existe un suelo *apto o no* para cada cultivo. Por eso el motor debe comparar las condiciones de la finca contra el rango de tolerancia de cada especie.

| Bloque | Qué dice | Qué significa para el motor |
|---|---|---|
| Físicas | Textura, humedad (capacidad de campo – punto de marchitez = agua útil), estructura/compactación, drenaje, profundidad efectiva | Textura + agua útil definen cuánta lluvia "aguanta" el suelo entre aguaceros |
| Químicas | pH, N-P-K y micronutrientes, CIC, salinidad (CE) | pH = filtro duro; N = eje de rotación (leguminosas); CIC y CE para versiones posteriores |
| Biológicas | Materia orgánica / carbono, vida del suelo | Carbono como indicador de salud; microbiología no medible en el MVP (se declara) |
| Variables prioritarias | Humedad, T°, HR, lluvia, pH, textura, MO, NPK, NDVI, ET | Tabla de fuentes NASA + sensores |
| Integración | Satélite = tendencia regional; sensor = detalle de parcela | No presentar un dato regional como medición de finca |

## 2. Resumen — Investigación + Stack (Pepe)

- **El reto:** herramienta de apoyo a decisiones que combine observaciones NASA con suelo local, cultivos y prioridades del agricultor para explorar rotaciones.
- **Evidencia agronómica:** las rotaciones con leguminosas suben el rendimiento del cultivo principal; en arroz, también suben carbono del suelo en la mayoría de los casos.
- **Costa Rica:** 10 de 12 órdenes de suelo → la herramienta parte del suelo de *cada* finca. Rotación solo tiene sentido en cultivos anuales (no café/banano).
- **Región piloto:** Guanacaste (arroz, frijol, maíz, melón; la más golpeada por El Niño) o Cartago (papa, cebolla, hortalizas; Andisoles erosionados).
- **Datos NASA:** POWER, SMAP L4, GPM IMERG, MODIS/HLS, ECOSTRESS, GIBS. Limitaciones: nubes, escala, cuentas Earthdata, fin de MODIS.
- **Competencia (~14 equipos):** casi todos Bangladesh o "globales"; ninguno trabaja el trópico de dos estaciones + ENSO.
- **Diferenciación:** trópico + El Niño, opciones lado a lado con consecuencias, sensor físico.
- **Stack:** Python + Streamlit, datos precalculados en Parquet, motor de reglas transparente (FAO ECOCROP, crédito de N, castigo por repetir familia, balance hídrico tipo FAO-56), LLM solo para redactar.
- **Motor:** generar → filtrar (pH, repetición) → puntuar 0-100 en Suelo/Agua/Riesgo/Ingreso → promedio ponderado por prioridades → top 3 con razones. Se corre en escenario normal vs El Niño.

---

## 3. Verificación de datos

| # | Afirmación en los documentos | Estado | Dato verificado / corrección | Fuente |
|---|---|---|---|---|
| 1 | Leguminosas: +20 % rendimiento del cultivo principal, metaanálisis de 462 experimentos y 11 768 observaciones; +32 % en ambientes de bajo rendimiento, +7 % en alto; baja con más N | ✅ | Correcto tal cual | Zhao et al. 2022, *Nature Communications* 13:4926 — https://doi.org/10.1038/s41467-022-32464-0 |
| 2 | Arroz después de leguminosas: +15 % rendimiento; 65,5 % de casos mejoran rendimiento y carbono | ⚠️ | **+15,7 %** y **65,8 %** de los casos (1 483 pares de datos, 17 países) | Yao et al. 2025, *One Earth* — https://agritrop.cirad.fr/611529/ |
| 3 | Arroz después de leguminosas: +51 % beneficio económico neto | ❓ | No aparece en el resumen del artículo; revisar el texto completo antes de citarlo | — |
| 4 | Órdenes de suelo de CR: Inceptisoles 38-39 %, Ultisoles 21 %, Andisoles 14 %, Entisoles 12 %, Alfisoles 9-10 %, Vertisoles 1,5-2 % | ✅ | 38,6 / 21 / 14,4 / 12,4 / 9,6 / 1,6 % (Mollisoles 1,4 %) | Bertsch et al. 2000, citado en Alvarado & Forsythe 2005, *Agronomía Costarricense* 29(1) |
| 5 | CR tiene 10 de los 12 órdenes del USDA | ✅ | Correcto | Misma fuente |
| 6 | ENA 2024 (dato 2023): "74 hectáreas de café" | ⚠️ | **~74 000 ha** de café (error de tipeo). Caña 56 619, banano 47 766, arroz 13 770, frijol 9 074, maíz 5 149 ha | Semanario Universidad sobre la ENA 2024 (INEC) |
| 7 | Arroz cayó 59 % (33 586 → 13 770 ha) | ✅ | Correcto (−19 816 ha) | Misma fuente |
| 8 | El Niño 2026-27: IMN lo proyectaba de junio 2026 a inicios de 2027, ~30 % menos lluvia | ⚠️ | **Ya está ocurriendo y es más fuerte.** Pacífico Norte con **−37 % de lluvia ene-ago 2026**, alerta naranja (Liberia, Nicoya, Cañas, Tilarán). Intensidad "fuerte", podría pasar a "muy fuerte" nov-2026 a ene-2027. IMN prevé efectos **al menos hasta julio de 2027** | Infobae (18-sep-2026, boletín IMN/CNE); Monumental (18-oct-2026) |
| 9 | En El Niño 2014-15 chile dulce, pepino y zanahoria subieron hasta 300 % | ❓ | No encontré fuente; no usar el número sin ella | — |
| 10 | Formar unos cm de suelo toma ~1 000 años; se erosiona una cancha de fútbol cada 5 s | ✅ | Ambos atribuidos a la FAO (julio 2022); para el submission conviene citar la publicación original de la FAO | ONU Noticias — https://news.un.org/en/story/2022/07/1123462 |
| 11 | Solo 11,6 % del territorio apto para agricultura intensiva; ~60 % de tierras forestales mal usadas | ❓ | Buscar la fuente (probablemente estudio de capacidad de uso / Estado de la Nación) | — |
| 12 | NASA POWER: API REST, JSON/CSV, sin llave, hasta 20 parámetros por consulta | ✅ | 20 parámetros por consulta de punto; salidas JSON, CSV, NetCDF, ASCII, ICASA | power.larc.nasa.gov/docs/services/api/temporal/daily/ |
| 13 | POWER ≈ 50 km de resolución | ⚠️ | Aproximado: meteorología de MERRA-2 (~0,5°×0,625°), solar ~1°. Decir "decenas de km" | Misma fuente |
| 14 | SMAP ve a 9 km | ✅ | SMAP L4 se entrega en malla de 9 km | NASA SMAP |
| 15 | "La API REST de GIBS está en pausa" | ❌ | **Falso.** GIBS sigue activo (WMTS/WMS). Lo que se **descontinuó fue NEO** (sept. 2026); NASA recomienda Worldview | science.nasa.gov/earth/nasa-earth-observations-neo/ |
| 16 | Terra y Aqua (MODIS) al final de su vida; VIIRS es el sucesor | ✅ | MODIS deja de operar a **fines de 2026 o inicios de 2027**. Para NDVI usar VIIRS (verificar producto, p. ej. VNP13) o **HLS** (30 m, mejor para parcelas) | earthdata.nasa.gov — Transition from MODIS to VIIRS |
| 17 | Fechas del evento 14-15 nov 2026 | ✅ | Correcto; el juzgamiento empieza el 16 de nov | astrobiology.com (anuncio de registro 2026) |
| 18 | Lista de "otros equipos" | ❓ | Si son proyectos de otra edición, sirven como referencia de lo que los jueces ya vieron; confirmar de dónde salió la lista | — |

### Errores conceptuales a corregir en los documentos
- **"Verificar SMAP con un sensor capacitivo":** un píxel de SMAP (9 km) y un sensor de un punto no miden lo mismo. El sensor **no valida** SMAP; lo **complementa** (capa fina de la parcela) y sirve para detectar si la finca está más seca o húmeda que su región. Además el sensor capacitivo barato mide contenido volumétrico solo tras **calibrarlo con el suelo de la finca** (método gravimétrico).
- **NASA POWER también trae humedad de suelo** (`GWETTOP`, `GWETROOT`, fracción 0-1). Sirve para el MVP sin Earthdata; SMAP L4 queda como mejora.
- **Dos temporadas no alcanza para el Pacífico de CR:** hay época **seca** (dic-abr), **primera**, **canícula / veranillo** (jul-ago) y **postrera**. El Niño golpea justo la canícula y la postrera. El prototipo en `src/` ya usa 3 épocas (Seca / Primera / Postrera); conviene agregar la canícula como factor de riesgo.
- **El Niño no es "−30 % parejo":** en CR el Pacífico se seca y el Caribe puede llover más. El escenario debe salir de años análogos reales (2015, 2023) medidos con IMERG/POWER, no de un porcentaje fijo.
