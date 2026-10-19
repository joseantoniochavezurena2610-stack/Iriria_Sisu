# Glosario de Iriria Sìsù

Diccionario de los términos técnicos y poco conocidos del proyecto, para que todo el equipo hable el mismo idioma. Cada término dice **qué es** y **cómo lo usamos** nosotros.

Si encuentran una palabra que no está aquí, agréguenla en la sección que le corresponde (orden alfabético) con un PR.

**Secciones:** [1. Suelo](#1-suelo) · [2. Cultivos y rotación](#2-cultivos-y-rotación) · [3. Agua y balance hídrico](#3-agua-y-balance-hídrico) · [4. Clima y El Niño](#4-clima-y-el-niño) · [5. Satélites y datos NASA](#5-satélites-y-datos-nasa) · [6. Formatos y herramientas de datos](#6-formatos-y-herramientas-de-datos) · [7. Motor de decisión y método científico](#7-motor-de-decisión-y-método-científico) · [8. Web, dominio y despliegue](#8-web-dominio-y-despliegue) · [9. Economía](#9-economía) · [10. Instituciones y siglas de Costa Rica](#10-instituciones-y-siglas-de-costa-rica) · [11. Space Apps](#11-space-apps)

---

## 1. Suelo

| Término | Qué es | Cómo lo usamos |
|---|---|---|
| **Agregado** | Grupo de partículas de suelo pegadas entre sí (por arcilla, materia orgánica y organismos). | Explica por qué la materia orgánica mejora la estructura. |
| **Agua útil / agua disponible total (ADT, TAW)** | Agua que el suelo retiene entre la *capacidad de campo* y el *punto de marchitez permanente*; es la que la planta puede usar. Se expresa en mm por metro de suelo. | El motor usa 70 (arenoso), 140 (franco) y 170 mm/m (arcilloso) para calcular la reserva de agua. |
| **Andisol** | Suelo de origen volcánico, liviano y fértil. ~14 % de Costa Rica. | Contexto; poco común en las llanuras de Guanacaste. |
| **Capacidad de campo** | Cantidad de agua que queda en el suelo después de que drena el exceso (1–3 días tras una lluvia fuerte). | Límite superior del agua útil. |
| **Capacidad de intercambio catiónico (CIC)** | Capacidad del suelo de retener nutrientes con carga positiva (Ca, Mg, K, amonio). Baja CIC = los nutrientes se lavan fácil. | No está en el MVP; posible mejora. |
| **Carbono orgánico del suelo (COS, SOC)** | Carbono que forma parte de la materia orgánica. Indicador clásico de salud del suelo. | Dato de referencia de SoilGrids (`soc`). |
| **Compactación** | Pérdida de espacio poroso por presión (maquinaria, ganado). Reduce infiltración y raíces. | Se menciona como límite; no se mide. |
| **Conductividad eléctrica (CE)** | Medida de la cantidad de sales disueltas en el suelo. | Salinidad: mejora futura. |
| **Densidad aparente** | Masa de suelo seco por volumen total. Valores altos indican compactación. | Contexto. |
| **Entisol** | Suelo joven, poco desarrollado, sobre materiales sueltos o aluviales. ~12 % de CR; común en costas de Guanacaste. | Contexto de la región piloto. |
| **Erosión** | Pérdida de la capa superficial de suelo por agua o viento. Peor en terreno inclinado y desnudo. | El eje Suelo castiga dejar el suelo descubierto en terreno inclinado. |
| **Inceptisol** | Suelo joven a intermedio, el más común en CR (~38,6 %). | Contexto. |
| **Lixiviación** | Lavado de nutrientes hacia abajo por el agua. | Explica por qué suelos arenosos pierden nitrógeno. |
| **Materia orgánica (MO)** | Restos de plantas, animales y microorganismos en el suelo. Mejora estructura, agua y nutrientes. | Pregunta opcional al agricultor ("tierra clara / oscura"). |
| **Orden de suelo (USDA)** | Nivel más alto de la clasificación de suelos de EE. UU. (12 órdenes). CR tiene 10. | Argumento: no hay receta nacional, cada finca es distinta. |
| **pH** | Acidez (menor a 7) o alcalinidad (mayor a 7) del suelo. Cambia qué nutrientes puede tomar la planta. | **Regla dura** del motor: si el pH está fuera del rango tolerable del cultivo, se descarta. |
| **Prueba de la cinta** | Método de campo para estimar la textura: se moja tierra y se aprieta entre los dedos. Sin cinta = arenoso; cinta corta = franco; cinta larga = arcilloso. | Así el agricultor ingresa la textura sin laboratorio. |
| **Punto de marchitez permanente** | Humedad mínima por debajo de la cual la planta ya no puede sacar agua y se marchita sin recuperarse. | Límite inferior del agua útil. |
| **Rastrojo** | Restos de tallos y hojas que quedan en el campo después de cosechar. | En el motor, "Descanso (rastrojo)" da algo de cobertura. |
| **Salinidad** | Acumulación de sales que dificulta que la planta absorba agua. | Mejora futura. |
| **SoilGrids** | Mapas mundiales de propiedades del suelo a 250 m hechos por ISRIC con aprendizaje automático. **Son modelados, no medidos.** | Solo como valor de referencia cuando el agricultor no sabe su pH. Su API REST está pausada; usamos WCS. |
| **Textura** | Proporción de arena, limo y arcilla. Define cuánta agua retiene y qué tan rápido drena. | El agricultor elige arenoso / franco / arcilloso. |
| **Ultisol** | Suelo viejo, rojizo, ácido y pobre en nutrientes; ~21 % de CR. | Contexto. |
| **Vertisol** | Suelo arcilloso que se agrieta en verano y se hincha en invierno. ~1,6 % de CR; llanuras del Tempisque (arroz). | Contexto de Guanacaste. |

## 2. Cultivos y rotación

| Término | Qué es | Cómo lo usamos |
|---|---|---|
| **Abono verde** | Cultivo que se siembra para incorporarlo al suelo y no para cosechar (mucuna, canavalia). Aporta nitrógeno y materia orgánica. | Tiene `abono_verde = si` en el catálogo; da bono de +15 % al cultivo siguiente. |
| **Aptitud (del cultivo)** | Qué tan bien se adapta un cultivo a una época y finca, de 0 a 1. | Producto de 4 factores: agua × temperatura × pH × exceso de lluvia. |
| **Ciclo (días)** | Tiempo desde la siembra hasta la cosecha. | Define cuántos meses de la época ocupa el cultivo. |
| **Cultivo anual** | Cultivo que completa su ciclo en menos de un año (granos, hortalizas). | Solo estos entran en la rotación (no café, caña ni banano). |
| **Cultivo de cobertura** | Cultivo que protege el suelo de la erosión y el sol entre cosechas. | Columna `cobertura` (0-3) del catálogo. |
| **Familia botánica** | Grupo de plantas emparentadas (Poaceae = gramíneas; Fabaceae = leguminosas; Cucurbitaceae = melón, sandía…). Comparten plagas y nutrientes que consumen. | El motor castiga repetir la misma familia seguida. |
| **Fijación biológica de nitrógeno** | Proceso por el cual bacterias (rizobios) en las raíces de leguminosas toman nitrógeno del aire y lo dejan en el suelo. | Base del crédito de nitrógeno. |
| **Gramínea (Poaceae)** | Familia del arroz, maíz y sorgo. Consumen mucho nitrógeno. | Grupo `gram`. |
| **Leguminosa (Fabaceae)** | Familia del frijol, caupí, maní, soya. Fijan nitrógeno. | Grupo `leg`. Rotar con leguminosas sube ~20 % el rendimiento del cultivo principal (Zhao et al. 2022). |
| **Caupí** | *Vigna unguiculata*, "frijol de costa". Leguminosa muy tolerante a la sequía. | Opción clave en escenarios El Niño. |
| **Mucuna / Canavalia** | Leguminosas usadas como abono verde. La canavalia aguanta bien la sequía. | Abonos verdes del catálogo. |
| **Monocultivo** | Sembrar el mismo cultivo una y otra vez. Agota nutrientes y acumula plagas. | Es lo que la tarjeta "Si sigue sembrando lo de hoy" suele mostrar. |
| **Rotación de cultivos** | Cambiar ordenadamente los cultivos de un mismo terreno a lo largo de las épocas. | Lo que el motor diseña: 3 años × 3 épocas = 9 espacios. |
| **Secano** | Agricultura que depende solo de la lluvia, sin riego. | Opción "No, solo lluvia" del formulario. |

## 3. Agua y balance hídrico

| Término | Qué es | Cómo lo usamos |
|---|---|---|
| **Balance hídrico** | Cuenta de entradas (lluvia, riego, reserva del suelo) y salidas (evapotranspiración) de agua de un cultivo. | Calculado por época en `balanceAgua()` (motor.js). |
| **Cobertura de la demanda** | Fracción del agua que pide el cultivo que realmente recibe. | Si está bajo ~75 %, contamos esa época como "falla" para calcular el riesgo. |
| **Déficit hídrico** | Agua que le falta al cultivo: demanda menos lo que recibe. | Se cubre con riego hasta el máximo según la respuesta del agricultor. |
| **ET0 (evapotranspiración de referencia)** | Agua que "pide" la atmósfera: lo que evaporaría y transpiraría un pasto corto bien regado. Depende de temperatura, sol, viento y humedad. En mm. | Calculada mes a mes con Hargreaves a partir de la temperatura de NASA POWER. |
| **ETc (evapotranspiración del cultivo)** | ET0 × Kc: el agua que pide un cultivo concreto. | Demanda de agua de cada cultivo en cada época. |
| **Evapotranspiración** | Suma de la evaporación del suelo y la transpiración de las plantas. | — |
| **FAO-56** | Manual de la FAO (Allen et al., 1998) *Crop evapotranspiration*, referencia mundial para calcular el agua de los cultivos. | Fuente de Kc, duración de ciclos y fórmulas de ET0. |
| **Hargreaves (ecuación de)** | Fórmula de ET0 que solo necesita temperatura máxima, mínima y media, y la latitud. Recomendada por FAO-56 cuando faltan datos de viento y humedad. | La usamos porque es robusta y reproducible. |
| **Kc (coeficiente de cultivo)** | Número que ajusta la ET0 al cultivo según su etapa (inicial, media, final). | Usamos un Kc promedio de ciclo (`kc_ciclo`). |
| **Lluvia efectiva** | Parte de la lluvia que realmente queda en la zona de raíces (el resto escurre o se va hondo). | Método USDA-SCS mensual. |
| **Reserva fácilmente aprovechable (RAW)** | Parte del agua útil que la planta usa sin estresarse (≈ 50 %). | Si el mes anterior llovió más de lo que se evaporó, el cultivo arranca con esta reserva. |
| **Zona radicular** | Capa de suelo donde están las raíces (~0–1 m). | Profundidad media usada: 0,6 m. |

## 4. Clima y El Niño

| Término | Qué es | Cómo lo usamos |
|---|---|---|
| **Anomalía** | Diferencia entre un valor y su promedio histórico (ej. +2 °C sobre lo normal). | Base de los índices ENSO. |
| **Canícula / veranillo de San Juan** | Período más seco dentro de la época lluviosa en el Pacífico de CR, normalmente en julio–agosto. En 2026 empezó a fines de junio. | Cae dentro de la época **Primera**; por eso es la época más riesgosa en El Niño. |
| **El Niño** | Fase cálida del ENSO: el mar del Pacífico ecuatorial central y oriental se calienta. En Guanacaste suele traer **menos lluvia y más calor**; en el Caribe de CR, a veces más lluvia. | Escenario "Año El Niño" y "Pronóstico actual". |
| **ENSO (El Niño–Oscilación del Sur)** | Fenómeno natural y cíclico del sistema océano–atmósfera del Pacífico ecuatorial con tres fases: El Niño, La Niña y neutral. | Clasificamos cada mes con el índice de NOAA. |
| **Época seca** | En Guanacaste, ~diciembre a abril; casi no llueve. | Época "Seca" (ene–abr) del motor: sin riego, solo descanso o abono verde. |
| **Época lluviosa** | ~mayo a noviembre. Se divide en primera y postrera, con la canícula en medio. | — |
| **Escenario** | Versión del clima con la que corremos el motor: normal, El Niño, peor año o pronóstico. | Botones "¿Con qué clima comparamos?". |
| **IMN** | Instituto Meteorológico Nacional de Costa Rica. | Fuente de los pronósticos y déficits de lluvia de 2026. |
| **La Niña** | Fase fría del ENSO. En Guanacaste suele traer más lluvia. | 2021–2023 y 2024–2026 fueron La Niña. |
| **Niño 3.4** | Región del Pacífico (5°N–5°S, 170°W–120°W) cuya temperatura del mar define el ENSO. | — |
| **ONI (Oceanic Niño Index)** | Índice de NOAA: promedio de 3 meses de la anomalía de temperatura del mar en Niño 3.4. El Niño si ≥ +0,5 °C por 5 temporadas seguidas. | Respaldo si el RONI no está disponible. |
| **Primera** | Primera siembra de la época lluviosa (mayo–agosto en el motor). | Época 2 del calendario. |
| **Postrera** | Segunda siembra de la época lluviosa (septiembre–diciembre en el motor). | Época 3 del calendario. |
| **RONI (Relative ONI)** | Versión del ONI que resta el calentamiento general del trópico; NOAA lo usa ahora como índice oficial. | Primera opción del script de datos. |
| **Sequía meteorológica** | Período con lluvia muy por debajo de lo normal. Declarada por el IMN en la vertiente Pacífica en 2026. | Contexto del pitch. |

## 5. Satélites y datos NASA

| Término | Qué es | Cómo lo usamos |
|---|---|---|
| **AppEEARS** | Herramienta web de NASA para recortar datos de satélite por punto o polígono sin bajar archivos enteros. | Opción para HLS/ECOSTRESS en el futuro. |
| **CERES** | Instrumento/proyecto de NASA que mide radiación; alimenta los datos solares de POWER. | Fuente de `ALLSKY_SFC_SW_DWN`. |
| **DAAC** | *Distributed Active Archive Center*: centros de NASA que guardan y distribuyen datos (GES DISC, NSIDC, LP DAAC…). | — |
| **Earthdata (cuenta / login)** | Cuenta gratuita de NASA para descargar la mayoría de sus datos. | Necesaria para IMERG, SMAP, HLS. **No** para POWER. Se guarda como *secret* en GitHub, nunca en el código. |
| **earthaccess** | Librería de Python que maneja el login de Earthdata y la búsqueda/descarga. | `scripts/descargar_imerg.py`. |
| **ECOSTRESS** | Instrumento en la Estación Espacial que mide la temperatura de las plantas y estima evapotranspiración. Cobertura irregular. | Opcional / futuro. |
| **GES DISC** | Centro de datos de NASA Goddard para lluvia y atmósfera (ahí está IMERG). | — |
| **GIBS / Worldview** | Servicio de imágenes satelitales listas de NASA (GIBS) y su visor web (Worldview). | Imágenes para el video. |
| **GPM IMERG** | Producto de lluvia de la misión GPM que combina muchos satélites; malla de 0,1° (~10 km). Versiones Early, Late y **Final** (la más precisa, con meses de retraso). | Contraste de la lluvia de POWER (`descargar_imerg.py`). |
| **GWETTOP / GWETROOT** | Parámetros de POWER: humedad del suelo como fracción de 0 (seco) a 1 (saturado) en la capa superficial (0–5 cm) y en la zona de raíces. Vienen del modelo MERRA-2. | Se descargan y guardan; uso futuro en el motor. |
| **HLS** | *Harmonized Landsat Sentinel-2*: imágenes de 30 m armonizadas de Landsat y Sentinel-2. | Validación con NDVI a escala de finca (futuro). |
| **L3 / L4 (nivel de procesamiento)** | L3 = datos en malla regular; L4 = salida de modelo + observaciones (ej. SMAP L4). | — |
| **Latencia** | Tiempo entre que pasa algo y que el dato está disponible. POWER: días a meses según la variable. | Por eso el último mes puede faltar. |
| **Malla / resolución espacial** | Tamaño de cada celda del dato. POWER ≈ 0,5° × 0,625° (decenas de km); IMERG 0,1°; SMAP 9 km; SoilGrids 250 m. | Siempre decimos la escala: es dato **regional**, no de la parcela. |
| **MERRA-2** | Reanálisis atmosférico de NASA (modelo + observaciones). Fuente de la meteorología de POWER. | — |
| **MODIS** | Sensor de los satélites Terra y Aqua; deja de operar a fines de 2026/inicios de 2027. | **No dependemos de MODIS.** |
| **NASA POWER** | *Prediction Of Worldwide Energy Resources*. API gratuita de NASA Langley con clima diario desde 1981 para cualquier punto. Comunidad **AG** = agroclimatología. Máx. 20 parámetros por consulta. | **Fuente principal** del proyecto. |
| **NDVI / EVI** | Índices de vegetación calculados de imágenes: valores altos = vegetación verde y vigorosa. | Validación futura (¿la vegetación sufrió en 2023 y 2026?). |
| **PRECTOTCORR** | Parámetro de POWER: lluvia total corregida (mm/día). | Lluvia del motor. |
| **Reanálisis** | Reconstrucción del clima pasado combinando modelos y observaciones. | POWER usa MERRA-2. |
| **SMAP** | Misión de NASA que mide humedad del suelo desde el espacio con microondas (atraviesa nubes). L4 a 9 km. | Mejora futura; requiere Earthdata. |
| **T2M / T2M_MAX / T2M_MIN** | Temperatura del aire a 2 m: media, máxima y mínima diaria (°C). | Temperatura y cálculo de ET0. |
| **VIIRS** | Sensor sucesor de MODIS (satélites Suomi NPP, NOAA-20/21). Tiene productos de vegetación (VNP13). | Reemplazo de MODIS para NDVI. |

## 6. Formatos y herramientas de datos

| Término | Qué es | Cómo lo usamos |
|---|---|---|
| **API** | Forma en que un programa pide datos a otro por internet (ej. una URL que devuelve JSON). | POWER se consulta por API. |
| **API REST** | Estilo de API basado en URLs y métodos HTTP (GET, POST). | — |
| **COG (Cloud Optimized GeoTIFF)** | GeoTIFF organizado para leer solo un pedazo por internet. | HLS. |
| **CORS** | Regla de los navegadores que decide si una página puede pedir datos a otro dominio. | Si POWER no lo permite, la descarga en vivo desde la web falla y usamos los datos precalculados. |
| **CSV** | Tabla en texto separada por comas; se abre en Excel. | Catálogo de cultivos (`data/catalogo/`). |
| **GeoJSON** | JSON con geometrías (puntos, polígonos). | Posible para límites de cantones. |
| **GeoTIFF** | Imagen con coordenadas geográficas (mapas raster). | SoilGrids. |
| **HDF5 / NetCDF** | Formatos científicos para datos multidimensionales (tiempo × lat × lon). | IMERG, SMAP. |
| **JSON** | Formato de texto para datos estructurados (`{"clave": valor}`). | Todos los datos que lee la web. |
| **Parquet** | Formato de tablas comprimido y rápido. | Ya no se usa (era del plan Streamlit). |
| **Raster** | Dato en forma de cuadrícula de píxeles. | — |
| **Valor de relleno (fill value, -999)** | Número que significa "sin dato". | Lo descartamos; un mes con menos de 25 días válidos no se usa. **Nunca inventamos datos.** |
| **WCS** | *Web Coverage Service*: estándar para pedir un pedazo de un mapa raster por URL. | SoilGrids (porque su API REST está pausada). |
| **xarray / rasterio** | Librerías de Python para datos multidimensionales y raster. | Scripts opcionales. |

## 7. Motor de decisión y método científico

| Término | Qué es | Cómo lo usamos |
|---|---|---|
| **Análisis de sensibilidad** | Mover los parámetros inciertos (±20 %) y ver si cambian los resultados. | Validación: si el top 3 no cambia, el resultado es robusto. |
| **Año análogo** | Año pasado con condiciones parecidas al que se quiere estudiar (ej. otro año El Niño). | Escenarios basados en 2023 y 2026 reales. |
| **Backtest (prueba hacia atrás)** | Correr el modelo con datos de un año pasado y comparar con lo que realmente pasó. | 2026 es un experimento natural: arroceros de Nandayure no sembraron. |
| **Búsqueda en haz (beam search)** | Algoritmo que arma soluciones paso a paso guardando solo las N mejores parciales. | Arma las rotaciones de 9 épocas sin probar todas las combinaciones (11⁹). |
| **Caja negra** | Modelo cuyas decisiones no se pueden explicar. | **Lo que evitamos**: reglas transparentes. |
| **Decisión multicriterio** | Elegir entre opciones evaluadas con varios criterios a la vez, con pesos. | Ejes Suelo, Agua, Riesgo e Ingreso con las prioridades del agricultor. |
| **Eje** | Cada criterio puntuado de 0 a 100. | Suelo, Agua, Seguridad (riesgo) e Ingreso. |
| **Función pura** | Función que con las mismas entradas siempre da lo mismo y no toca nada externo. | `recomendar()`: fácil de probar. |
| **Hipótesis** | Afirmación que se puede poner a prueba con datos. | H1 y H2 en `docs/roles/lider-cientifico.md`. |
| **Plan robusto** | Plan cuyo puntaje en El Niño es al menos 85 % del puntaje en año normal y con seguridad ≥ 50. | Etiqueta verde en la tarjeta. |
| **Promedio ponderado** | Promedio donde cada valor pesa distinto. | Puntaje total con los pesos 0–5. |
| **Prueba unitaria** | Pequeño programa que verifica que una función hace lo esperado. | `tests/motor.test.js` (`npm test`). |
| **Regla dura** | Condición que descarta una opción sin importar el puntaje. | pH fuera de rango, cultivo fuera de época. |
| **Riesgo (eje Seguridad)** | 1 − fracción de años observados en que el agua no alcanzó. | Viene de los datos 2021→hoy, año por año. |
| **Validación experta** | Que un agrónomo/extensionista revise si los planes tienen sentido. | Pendiente (MAG/INTA). |

## 8. Web, dominio y despliegue

| Término | Qué es | Cómo lo usamos |
|---|---|---|
| **CDN** | Red de servidores que entrega archivos rápido desde el lugar más cercano. | Leaflet y fuentes vienen de CDN; la app funciona aunque fallen. |
| **CNAME** | Registro DNS que dice "este nombre apunta a este otro nombre". | Para apuntar `www.nuestrodominio` a GitHub Pages. |
| **DNS** | "Guía telefónica" de internet: traduce un dominio a la dirección del servidor. | Configuración del dominio. |
| **Dominio** | Nombre de la página (ej. `iririasisu.app`). Se compra a un registrador por año. | Lo busca y compra José Pablo. |
| **GitHub Actions** | Automatizaciones que corren en servidores de GitHub cuando pasa algo en el repo. | Bajar datos NASA, correr pruebas y publicar. |
| **GitHub Pages** | Hosting gratuito de páginas estáticas de GitHub, con HTTPS y dominio propio. | Opción recomendada para publicar `web/`. |
| **HTTPS / certificado TLS** | Conexión cifrada (el candadito). Obligatoria para usar ubicación del celular. | GitHub Pages lo da gratis con dominio propio. |
| **Hosting** | Servicio donde vive la página. | — |
| **Leaflet** | Librería de mapas web gratuita. | Mapa de cantones. |
| **Página estática** | Sitio hecho solo de archivos (HTML, CSS, JS, JSON), sin servidor que calcule. | Nuestra app: el motor corre en el navegador del usuario. Costo de operar ≈ $0. |
| **Registro A / AAAA** | Registros DNS que apuntan un dominio a una dirección IP (v4 / v6). | Para el dominio raíz en GitHub Pages. |
| **Registrador** | Empresa donde se compra el dominio (NIC Costa Rica para `.cr`; otros para `.com`, `.app`, etc.). | — |
| **Responsive** | Que la página se adapta a celular, tablet y computadora. | Requisito: extensionistas la usan en el campo. |
| **Secret (GitHub)** | Variable cifrada del repo para guardar contraseñas. | `EARTHDATA_USERNAME`, `EARTHDATA_PASSWORD`. |
| **Workflow** | Archivo YAML en `.github/workflows/` que define una automatización. | `datos.yml`, `pruebas.yml`, `publicar.yml`. |

## 9. Economía

| Término | Qué es | Cómo lo usamos |
|---|---|---|
| **Costo de producción** | Lo que cuesta producir una hectárea (semilla, fertilizante, mano de obra, maquinaria). | Columna `costo_produccion_crc_ha` (pendiente). |
| **Costo de transición** | Gasto extra de cambiar de cultivo (semilla nueva, equipo, aprender, buscar mercado). | Mejora futura del eje Ingreso. |
| **Margen** | Ingreso por venta menos costos. | Hoy relativo (1–5) hasta tener precios reales. |
| **Pérdida máxima tolerable** | Cuánto ingreso está dispuesto a dejar de ganar el agricultor para reducir riesgo. | Pregunta opcional; filtra planes. |
| **Precio mayorista** | Precio de venta en mercados como CENADA. | Fuente para `precio_crc_kg` (PIMA). |
| **Urea (46 % N)** | Fertilizante nitrogenado más común. | Para traducir el nitrógeno de las leguminosas a colones ahorrados. |

## 10. Instituciones y siglas de Costa Rica

| Sigla | Nombre | Para qué nos sirve |
|---|---|---|
| **ASADA** | Asociación Administradora de Sistemas de Acueductos y Alcantarillados comunales | Contexto de escasez de agua en comunidades. |
| **CENADA** | Centro Nacional de Abastecimiento y Distribución de Alimentos | Precios mayoristas. |
| **CNE** | Comisión Nacional de Prevención de Riesgos y Atención de Emergencias | Alertas por El Niño (naranja en los 11 cantones de Guanacaste). |
| **CNP** | Consejo Nacional de Producción | Precios al consumidor. |
| **INEC** | Instituto Nacional de Estadística y Censos | Encuesta Nacional Agropecuaria (área sembrada). |
| **INTA** | Instituto Nacional de Innovación y Transferencia en Tecnología Agropecuaria | Análisis de suelos, fichas técnicas de cultivos. |
| **MAG** | Ministerio de Agricultura y Ganadería | Agencias de extensión: camino para llegar al agricultor. |
| **PIMA** | Programa Integral de Mercadeo Agropecuario | Administra CENADA; publica precios. |
| **SENARA** | Servicio Nacional de Aguas Subterráneas, Riego y Avenamiento | Riego en Guanacaste (distrito Arenal-Tempisque). |
| **UPA** | Unión de Pequeños Productores Agropecuarios | Voz de los productores afectados. |

## 11. Space Apps

| Término | Qué es |
|---|---|
| **Challenge / reto** | El problema oficial que elegimos: "Cambio de rumbo: Adaptando las granjas con datos de la NASA". |
| **Demo del proyecto** | Video de **máximo 30 segundos** (o hasta 7 diapositivas). Debe estar **en inglés o con subtítulos en inglés** y alojado afuera (YouTube, Drive) con enlace público. **Elegimos video.** |
| **Final project link** | Enlace público, sin contraseña, al proyecto: será nuestra página web con dominio propio. |
| **Global Award** | Premios globales; para optar hay que usar datos o recursos de la NASA. |
| **Local Event** | Sede local donde está inscrito el equipo; todos deben estar en la misma. |
| **Declaración de uso de IA** | El formulario pide decir qué herramientas de IA se usaron y cómo. Imágenes/videos hechos con IA llevan marca de agua; no se puede usar ni modificar la marca NASA. |
