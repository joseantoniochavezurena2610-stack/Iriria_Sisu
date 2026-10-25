// i18n.js — Spanish / English strings for Iriria Sìsù.
// Pure module: no DOM. app.js applies the strings to the page; engine.js uses the
// reason and notice templates. English stays the default for judges; Spanish is
// chosen automatically when the browser is in Spanish (most growers in Guanacaste).

export const LANGS = ['en', 'es'];

const S = {
  en: {
    'page.title': 'Iriria Sìsù — Crop rotations for Guanacaste',
    'lang.toggle': 'Español',
    'lang.toggleAria': 'Cambiar a español',
    skip: 'Skip to content',
    eyebrow: 'NASA Space Apps 2026 · Change of Course',
    lede: 'Compare 3-year crop-rotation plans for your farm in Guanacaste, Costa Rica. We use NASA rainfall and temperature data since 2021, plus what you know about your land. The decision is always yours.',
    'tab.tool': 'Tool', 'tab.how': 'How it works', 'tab.data': 'Data and sources', 'tabs.aria': 'Sections',
    'f1.legend': '1 · Where is your farm?', 'f1.canton': 'Canton', 'f1.mapAria': 'Map of Guanacaste: tap your canton', 'f1.locate': 'Use my location',
    'f2.legend': '2 · What do you plant today?', 'f2.current': 'Main crop', 'f2.irrigation': 'Do you have irrigation?',
    'irr.none': 'No, rain only', 'irr.limited': 'A little (well, small reservoir)', 'irr.full': 'Yes, enough irrigation',
    'f3.legend': '3 · Your soil', 'f3.texture': 'Texture',
    'tex.loam': 'Loam (neither loose nor sticky)', 'tex.sandy': 'Sandy (loose, does not form a ball)', 'tex.clay': 'Clay (sticky, forms a long ribbon)',
    'f3.help': 'How do I know my texture?',
    'f3.helpBody': 'Ribbon test: wet a handful of soil and squeeze it between your thumb and index finger. If it does not form a ribbon, it is <b>sandy</b>. If it forms a short ribbon that breaks (less than 2.5 cm), it is <b>loam</b>. If it forms a long, shiny ribbon, it is <b>clay</b>.',
    'f3.ph': 'Soil pH', 'f3.phunknown': "I don't know my pH",
    'f3.slope': 'Land', 'slope.flat': 'Flat', 'slope.moderate': 'Somewhat sloped', 'slope.steep': 'Very steep',
    'f3.om': 'Organic matter', 'om.unknown': "I don't know", 'om.low': 'Low (light-coloured soil)', 'om.medium': 'Medium', 'om.high': 'High (dark soil)',
    'f4.legend': '4 · What matters most to you?',
    'f4.soil': 'Soil: take care of the soil', 'f4.water': 'Water: save water', 'f4.risk': 'Safety: lower the risk of losing the harvest', 'f4.income': 'Income: earn more',
    'f4.note': 'Safety starts at 4 because Costa Rica’s weather service (IMN) expects El Niño effects at least until July 2027. Move any slider: the plans update right away.',
    'f4.maxloss': 'At most, how much income could you give up compared with today?',
    'ml.none': 'No limit', 'ml.10': 'Up to 10 %', 'ml.25': 'Up to 25 %', 'ml.50': 'Up to 50 %',
    'sc.eyebrow': 'Which climate do we compare against?', 'sc.aria': 'Climate scenario',
    'sc.forecast': 'Current forecast', 'sc.normal': 'Normal year', 'sc.el_nino': 'Average El Niño year', 'sc.worst': 'Worst year seen',
    'sc.note.forecast': 'Costa Rica’s weather service (IMN) expects El Niño effects at least until July 2027: the Dry and Primera seasons of year 1 use the climate of the observed El Niño months; the rest use normal years.',
    'sc.note.normal': 'Average of the months without El Niño since 2021.',
    'sc.note.el_nino': 'Average of the El Niño months observed since 2021. It mixes a mild event for Guanacaste (2023-24) with a severe one (2026), so it can look wetter than 2026 did. For a harsher test, also check “Worst year seen”.',
    'sc.note.worst': 'The year with the least rain from May to November since 2021.',
    'status.loading': 'Loading data…',
    'clim.title': 'Climate of your canton',
    'clim.titleFull': (v) => `Climate of ${v.name} · ${v.mm} mm a year without El Niño`,
    'leg.rainNormal': 'Rainfall, years without El Niño', 'leg.rainNino': 'Rainfall, El Niño years', 'leg.et': 'Water the air demands (evapotranspiration, ET0)',
    'chart.aria': 'Monthly rainfall in normal and El Niño years, and the water the air demands',
    'chart.normalTip': (v) => `${v.m} normal: ${v.mm} mm (${v.n} months)`,
    'chart.ninoTip': (v) => `${v.m} El Niño: ${v.mm} mm${v.filled ? ' (no El Niño months observed: overall average used)' : ` (${v.n} months)`}`,
    'results.scoreNote': 'Scores from 0 to 100 compare these plans with each other. They are not a harvest forecast, and the climate data is regional.',
    'act.print': 'Print or save as PDF', 'act.share': 'Copy link to this plan', 'act.whatsapp': 'Send by WhatsApp',
    'act.linkNote': 'The link includes your answers (canton, crop, soil and priorities).', 'act.copied': 'Link copied.',
    'print.take': 'Bring this plan to your extension agent (MAG/INTA) or cooperative to discuss it before buying seed.',
    'print.meta': (v) => `Iriria Sìsù · ${v.canton} · ${v.scenario} · NASA POWER data ${v.from} to ${v.to} · printed ${v.date}`,
    'loc.unsupported': 'Your browser does not support location.', 'loc.locating': 'Locating…',
    'loc.found': (v) => `Nearest canton: ${v.name}. Your location is not stored or sent anywhere.`,
    'loc.failed': 'Could not get your location. Choose the canton from the list.',
    'ph.soilgrids': (v) => `Using pH ${v.ph} as a SoilGrids reference (modelled at 250 m, not measured on your farm). A soil test is better.`,
    'ph.none': 'Without pH we cannot rule out crops because of acidity. A soil test (INTA, UCR or a private lab) lets the engine rule out crops that do not tolerate your soil.',
    'status.live': 'Downloading NASA POWER data live (this can take a few seconds)…',
    'status.noData': (v) => `There is no NASA data for this canton yet and the live download failed (${v.err}). The team must run the "data" workflow on GitHub.`,
    'status.ok': (v) => `Data: NASA POWER${v.live ? ' (downloaded now)' : ''}, ${v.from} to ${v.to} (${v.n} months). This is regional data from a grid cell tens of km wide${v.shares ? `, the same cell as ${v.shares}` : ''}; your farm may be drier or wetter.`,
    'status.offline': 'You are offline: showing the data saved on this device.',
    'plan.title': (v) => `Plan ${v.letter}`, 'plan.base': 'If you keep planting what you plant today', 'plan.none': 'No crop in the catalog fits these conditions.',
    'plan.relative': 'relative score',
    'cell.fallow': 'Fallow', 'cell.fit': (v) => `fit ${v.p} %`, 'cell.irrigation': (v) => `irrigation ${v.mm} mm`,
    'cell.short': (v) => `water short: ${v.k} of ${v.n} years`,
    'axis.soil': 'Soil', 'axis.water': 'Water', 'axis.risk': 'Safety', 'axis.income': 'Income',
    'badge.robust': 'Robust plan', 'badge.sensitive': 'Sensitive to El Niño',
    'badge.robustRule': 'Robust: in an El Niño year it keeps at least 85 % of its normal-year score, and its Safety stays at 50 or more.',
    'badge.sensitiveRule': 'Sensitive: in an El Niño year it loses more than 15 % of its normal-year score, or its Safety falls below 50.',
    'comp': (v) => `Normal year: <b>${v.n}</b> · El Niño year: <b>${v.ni}</b>`,
    'group.gram': 'Grasses (rice, maize, sorghum)', 'group.leg': 'Legumes', 'group.cuc': 'Cucurbits (melon, watermelon)', 'group.cover': 'Green manure', 'group.none': 'Fallow',
    'crop.nothing': 'Nothing / fallow',
    'data.what': 'What', 'data.source': 'Source', 'data.status': 'Status',
    'data.climate': 'Daily climate', 'data.climateSrc': 'NASA POWER (NASA Langley), daily API, AG community',
    'data.generated': (v) => `Generated ${v.date}, since ${v.start}`, 'data.pending': 'Pending: run the "data" workflow',
    'data.et0': 'Water the air demands (ET0)', 'data.et0Src': 'Computed with Hargreaves (FAO-56, eq. 52) from POWER temperature', 'data.monthly': 'Monthly',
    'data.enso': 'ENSO phase', 'data.auto': 'Automatic', 'data.fallback': 'Fallback table',
    'data.soil': 'Reference soil', 'data.soilPending': 'SoilGrids 2.0 (ISRIC) — pending; the REST API is paused', 'data.soilWhen': 'Only when the farmer does not know their pH',
    'data.ranges': 'Crop ranges', 'data.rangesSrc': 'FAO-56 (Kc, duration) and FAO ECOCROP (pH, temperature)', 'data.rangesStatus': 'Initial values under review',
    'data.heads': ['Crop', 'Seasons', 'Cycle (days)', 'pH min', 'pH max', 'Kc', 'Drought tolerance (0-3)', 'N supply (kg/ha)', 'Margin (1-5)', 'Verified'],
    'data.h2': 'Data and sources', 'data.catalog': 'Crop catalog',
    'data.catalogNote': 'Initial values. The "Verified" column shows which ones the science lead has already reviewed.',
    'how.html': `<h2>How it works</h2>
    <ol class="steps">
      <li><b>Real climate for your canton.</b> We download daily rainfall and temperature from NASA POWER since January 2021, and compute how much water the air demands (ET0, FAO's Hargreaves method). Root-zone soil moisture is downloaded too, but the engine does not use it yet.</li>
      <li><b>We separate the years.</b> Using NOAA's official index we label each month as El Niño, La Niña or neutral. That lets us compare a normal year with an El Niño year using the rain that actually fell, not an invented percentage.</li>
      <li><b>We test every crop in every season.</b> Dry (Jan–Apr), Primera (May–Aug, includes the mid-summer drought or <i>canícula</i>) and Postrera (Sep–Dec). We check whether there is enough water (FAO-56-style balance), whether the temperature suits the crop and whether your pH allows it.</li>
      <li><b>We search the possible 3-year rotations</b>, keeping the 250 best at each step, and discard those that make no sense (pH out of range, crop out of season, same family repeated).</li>
      <li><b>We score from 0 to 100</b> on four things: <b>Soil</b> (nitrogen, ground cover, changing families), <b>Water</b> (how much irrigation or deficit remains), <b>Safety</b> (in how many observed years water fell short) and <b>Income</b>.</li>
      <li><b>You decide the weight</b> of each one. We show the 3 best plans and how each would do in a normal year and in an El Niño year. If it keeps at least 85 % of its score in an El Niño year and its Safety stays at 50 or more, we label it a <b>robust plan</b>.</li>
    </ol>
    <h3>What we do not promise</h3>
    <ul>
      <li>We do not predict your exact harvest: we compare plans against each other.</li>
      <li>Satellite and model data are <b>regional</b> (grid cells tens of km wide; the 11 cantons fall in 5 cells). What you know about your farm (pH, texture, irrigation) is what tailors the result to your plot.</li>
      <li>Risk is counted over few years (2021 → today; only 2 El Niño events), so we show counts like “1 of 2 years”, not percentages.</li>
      <li>Crop ranges come from FAO and the literature; the team is checking them against Costa Rican sources.</li>
      <li>Income is still <b>relative</b> (1 to 5) until prices and costs are verified.</li>
    </ul>`,
    'foot.html': 'Iriria Sìsù · Costa Rican team at the NASA International Space Apps Challenge 2026. Data: NASA POWER (NASA Langley), NOAA CPC ENSO index, FAO. Open source (MIT) on <a href="https://github.com/joseantoniochavezurena2610-stack/iriria_sisu">GitHub</a>. This tool does not replace advice from an agronomist.',
    'wa.text': (v) => `Iriria Sìsù — ${v.canton}, ${v.scenario}.\n${v.plan}: ${v.seq}\nScore ${v.score}/100 (relative).\n${v.link}`,
    // engine
    'r.nothing': 'Nothing is planted: the soil rests, but there is no income. None of the current crops fits these conditions.',
    'r.legumes': (v) => `${v.legs} of 9 seasons use legumes${v.green ? ` (${v.green} as green manure)` : ''}: they leave nitrogen for the next crop.`,
    'r.repeats': (v) => `Repeats the same crop family ${v.rep} ${v.rep > 1 ? 'times' : 'time'} in a row: watch for pests and soil depletion.`,
    'r.families': (v) => `${v.n} different crop families and none repeats back to back.`,
    'r.irrigation': (v) => `Estimated irrigation over 3 years: ${v.mm} mm${v.diff != null ? ` (${v.diff >= 0 ? '+' : '−'}${Math.abs(v.diff)} mm compared with today)` : ''}.`,
    'r.weak': (v) => `Weak spot: ${v.crop} in the ${v.season} season of year ${v.year} — water fell short in ${v.k} of ${v.n} observed years of that scenario${v.limiting ? ` (limiting: ${v.limiting})` : ''}.`,
    'r.noShort': 'In the observed years (2021 → today) no season of this plan ran out of water.',
    'r.above': (v) => `${v.d} points above what is planted today.`,
    'n.noPh': 'pH was not used: without a soil test the engine cannot rule out crops because of acidity.',
    'n.excluded': (v) => `${v.crop}: ruled out because of pH ${v.ph} outside the tolerable range (${v.min}–${v.max}).`,
    'n.maxloss': (v) => `No plan keeps income within the maximum loss of ${v.p} %; the best plans are shown anyway.`,
    'lim.lack of water': 'lack of water', 'lim.cold': 'cold', 'lim.heat': 'heat', 'lim.pH': 'pH', 'lim.excess rain': 'excess rain',
  },
  es: {
    'page.title': 'Iriria Sìsù — Rotación de cultivos para Guanacaste',
    'lang.toggle': 'English',
    'lang.toggleAria': 'Switch to English',
    skip: 'Ir al contenido',
    eyebrow: 'NASA Space Apps 2026 · Cambio de rumbo',
    lede: 'Compare planes de rotación de cultivos a 3 años para su finca en Guanacaste, Costa Rica. Usamos datos de lluvia y temperatura de la NASA desde 2021, más lo que usted sabe de su tierra. La decisión siempre es suya.',
    'tab.tool': 'Herramienta', 'tab.how': 'Cómo funciona', 'tab.data': 'Datos y fuentes', 'tabs.aria': 'Secciones',
    'f1.legend': '1 · ¿Dónde está su finca?', 'f1.canton': 'Cantón', 'f1.mapAria': 'Mapa de Guanacaste: toque su cantón', 'f1.locate': 'Usar mi ubicación',
    'f2.legend': '2 · ¿Qué siembra hoy?', 'f2.current': 'Cultivo principal', 'f2.irrigation': '¿Tiene riego?',
    'irr.none': 'No, solo lluvia', 'irr.limited': 'Un poco (pozo, reservorio pequeño)', 'irr.full': 'Sí, riego suficiente',
    'f3.legend': '3 · Su suelo', 'f3.texture': 'Textura',
    'tex.loam': 'Franco (ni suelto ni pegajoso)', 'tex.sandy': 'Arenoso (suelto, no hace bola)', 'tex.clay': 'Arcilloso (pegajoso, hace una cinta larga)',
    'f3.help': '¿Cómo sé mi textura?',
    'f3.helpBody': 'Prueba de la cinta: moje un puño de tierra y apriétela entre el pulgar y el índice. Si no forma cinta, es <b>arenoso</b>. Si forma una cinta corta que se quiebra (menos de 2,5 cm), es <b>franco</b>. Si forma una cinta larga y brillante, es <b>arcilloso</b>.',
    'f3.ph': 'pH del suelo', 'f3.phunknown': 'No sé mi pH',
    'f3.slope': 'Terreno', 'slope.flat': 'Plano', 'slope.moderate': 'Algo quebrado', 'slope.steep': 'Muy quebrado',
    'f3.om': 'Materia orgánica', 'om.unknown': 'No sé', 'om.low': 'Baja (suelo claro)', 'om.medium': 'Media', 'om.high': 'Alta (suelo oscuro)',
    'f4.legend': '4 · ¿Qué le importa más?',
    'f4.soil': 'Suelo: cuidar el suelo', 'f4.water': 'Agua: ahorrar agua', 'f4.risk': 'Seguridad: bajar el riesgo de perder la cosecha', 'f4.income': 'Ingreso: ganar más',
    'f4.note': 'Seguridad empieza en 4 porque el IMN espera efectos de El Niño al menos hasta julio de 2027. Mueva cualquier control: los planes cambian de una vez.',
    'f4.maxloss': 'Como máximo, ¿cuánto ingreso podría dejar de ganar comparado con hoy?',
    'ml.none': 'Sin límite', 'ml.10': 'Hasta 10 %', 'ml.25': 'Hasta 25 %', 'ml.50': 'Hasta 50 %',
    'sc.eyebrow': '¿Contra qué clima comparamos?', 'sc.aria': 'Escenario de clima',
    'sc.forecast': 'Pronóstico actual', 'sc.normal': 'Año normal', 'sc.el_nino': 'Año El Niño promedio', 'sc.worst': 'Peor año visto',
    'sc.note.forecast': 'El IMN espera efectos de El Niño al menos hasta julio de 2027: la época Seca y la Primera del año 1 usan el clima de los meses El Niño observados; el resto usa años normales.',
    'sc.note.normal': 'Promedio de los meses sin El Niño desde 2021.',
    'sc.note.el_nino': 'Promedio de los meses El Niño observados desde 2021. Mezcla un evento leve para Guanacaste (2023-24) con uno fuerte (2026), así que puede verse más lluvioso que 2026. Para una prueba más dura, revise también “Peor año visto”.',
    'sc.note.worst': 'El año con menos lluvia de mayo a noviembre desde 2021.',
    'status.loading': 'Cargando datos…',
    'clim.title': 'Clima de su cantón',
    'clim.titleFull': (v) => `Clima de ${v.name} · ${v.mm} mm al año sin El Niño`,
    'leg.rainNormal': 'Lluvia, años sin El Niño', 'leg.rainNino': 'Lluvia, años El Niño', 'leg.et': 'Agua que pide el aire (evapotranspiración, ET0)',
    'chart.aria': 'Lluvia mensual en años normales y El Niño, y el agua que pide el aire',
    'chart.normalTip': (v) => `${v.m} normal: ${v.mm} mm (${v.n} meses)`,
    'chart.ninoTip': (v) => `${v.m} El Niño: ${v.mm} mm${v.filled ? ' (sin meses El Niño observados: se usa el promedio general)' : ` (${v.n} meses)`}`,
    'results.scoreNote': 'Los puntajes de 0 a 100 comparan estos planes entre sí. No son un pronóstico de cosecha, y los datos de clima son regionales.',
    'act.print': 'Imprimir o guardar en PDF', 'act.share': 'Copiar link de este plan', 'act.whatsapp': 'Enviar por WhatsApp',
    'act.linkNote': 'El link incluye sus respuestas (cantón, cultivo, suelo y prioridades).', 'act.copied': 'Link copiado.',
    'print.take': 'Lleve este plan a su extensionista (MAG/INTA) o a su cooperativa para conversarlo antes de comprar semilla.',
    'print.meta': (v) => `Iriria Sìsù · ${v.canton} · ${v.scenario} · datos NASA POWER de ${v.from} a ${v.to} · impreso el ${v.date}`,
    'loc.unsupported': 'Su navegador no permite usar la ubicación.', 'loc.locating': 'Buscando…',
    'loc.found': (v) => `Cantón más cercano: ${v.name}. Su ubicación no se guarda ni se envía a ningún lado.`,
    'loc.failed': 'No se pudo obtener su ubicación. Escoja el cantón de la lista.',
    'ph.soilgrids': (v) => `Usamos pH ${v.ph} como referencia de SoilGrids (modelado a 250 m, no medido en su finca). Un análisis de suelo es mejor.`,
    'ph.none': 'Sin pH no podemos descartar cultivos por acidez. Un análisis de suelo (INTA, UCR o un laboratorio privado) permite descartar los cultivos que no toleran su suelo.',
    'status.live': 'Descargando datos de NASA POWER en vivo (puede tardar unos segundos)…',
    'status.noData': (v) => `Todavía no hay datos de la NASA para este cantón y la descarga en vivo falló (${v.err}). El equipo debe correr el workflow "data" en GitHub.`,
    'status.ok': (v) => `Datos: NASA POWER${v.live ? ' (descargados ahora)' : ''}, de ${v.from} a ${v.to} (${v.n} meses). Son datos regionales de una celda de decenas de km${v.shares ? `, la misma de ${v.shares}` : ''}; su finca puede ser más seca o más lluviosa.`,
    'status.offline': 'Está sin conexión: se muestran los datos guardados en este dispositivo.',
    'plan.title': (v) => `Plan ${v.letter}`, 'plan.base': 'Si sigue sembrando lo de hoy', 'plan.none': 'Ningún cultivo del catálogo calza con estas condiciones.',
    'plan.relative': 'puntaje relativo',
    'cell.fallow': 'Descanso', 'cell.fit': (v) => `le va ${v.p} %`, 'cell.irrigation': (v) => `riego ${v.mm} mm`,
    'cell.short': (v) => `faltó agua: ${v.k} de ${v.n} años`,
    'axis.soil': 'Suelo', 'axis.water': 'Agua', 'axis.risk': 'Seguridad', 'axis.income': 'Ingreso',
    'badge.robust': 'Plan robusto', 'badge.sensitive': 'Sensible a El Niño',
    'badge.robustRule': 'Robusto: en un año El Niño conserva al menos el 85 % de su puntaje de año normal, y su Seguridad queda en 50 o más.',
    'badge.sensitiveRule': 'Sensible: en un año El Niño pierde más del 15 % de su puntaje de año normal, o su Seguridad baja de 50.',
    'comp': (v) => `Año normal: <b>${v.n}</b> · Año El Niño: <b>${v.ni}</b>`,
    'group.gram': 'Gramíneas (arroz, maíz, sorgo)', 'group.leg': 'Leguminosas', 'group.cuc': 'Cucurbitáceas (melón, sandía)', 'group.cover': 'Abono verde', 'group.none': 'Descanso',
    'crop.nothing': 'Nada / descanso',
    'data.what': 'Qué', 'data.source': 'Fuente', 'data.status': 'Estado',
    'data.climate': 'Clima diario', 'data.climateSrc': 'NASA POWER (NASA Langley), API diaria, comunidad AG',
    'data.generated': (v) => `Generado ${v.date}, desde ${v.start}`, 'data.pending': 'Pendiente: correr el workflow "data"',
    'data.et0': 'Agua que pide el aire (ET0)', 'data.et0Src': 'Calculada con Hargreaves (FAO-56, ec. 52) a partir de la temperatura de POWER', 'data.monthly': 'Mensual',
    'data.enso': 'Fase ENSO', 'data.auto': 'Automática', 'data.fallback': 'Tabla de respaldo',
    'data.soil': 'Suelo de referencia', 'data.soilPending': 'SoilGrids 2.0 (ISRIC) — pendiente; la API REST está pausada', 'data.soilWhen': 'Solo cuando el agricultor no sabe su pH',
    'data.ranges': 'Rangos de cultivos', 'data.rangesSrc': 'FAO-56 (Kc, duración) y FAO ECOCROP (pH, temperatura)', 'data.rangesStatus': 'Valores iniciales en revisión',
    'data.heads': ['Cultivo', 'Épocas', 'Ciclo (días)', 'pH mín', 'pH máx', 'Kc', 'Tolerancia a sequía (0-3)', 'Aporte de N (kg/ha)', 'Margen (1-5)', 'Verificado'],
    'data.h2': 'Datos y fuentes', 'data.catalog': 'Catálogo de cultivos',
    'data.catalogNote': 'Valores iniciales. La columna "Verificado" muestra cuáles ya revisó el líder científico.',
    'how.html': `<h2>Cómo funciona</h2>
    <ol class="steps">
      <li><b>Clima real de su cantón.</b> Bajamos la lluvia y la temperatura diarias de NASA POWER desde enero de 2021 y calculamos cuánta agua pide el aire (ET0, método de Hargreaves de la FAO). También bajamos la humedad del suelo en la zona de raíces, pero el motor todavía no la usa.</li>
      <li><b>Separamos los años.</b> Con el índice oficial de la NOAA marcamos cada mes como El Niño, La Niña o neutro. Así comparamos un año normal con uno El Niño usando la lluvia que de verdad cayó, no un porcentaje inventado.</li>
      <li><b>Probamos cada cultivo en cada época.</b> Seca (ene–abr), Primera (may–ago, incluye la canícula) y Postrera (set–dic). Revisamos si alcanza el agua (balance tipo FAO-56), si la temperatura le sirve al cultivo y si su pH lo permite.</li>
      <li><b>Buscamos entre las rotaciones posibles a 3 años</b>, guardando las 250 mejores en cada paso, y descartamos las que no tienen sentido (pH fuera de rango, cultivo fuera de época, misma familia repetida).</li>
      <li><b>Puntuamos de 0 a 100</b> en cuatro cosas: <b>Suelo</b> (nitrógeno, cobertura, cambio de familias), <b>Agua</b> (cuánto riego o déficit queda), <b>Seguridad</b> (en cuántos de los años observados faltó agua) e <b>Ingreso</b>.</li>
      <li><b>Usted decide el peso</b> de cada una. Mostramos los 3 mejores planes y cómo le iría a cada uno en un año normal y en un año El Niño. Si conserva al menos el 85 % de su puntaje en un año El Niño y su Seguridad queda en 50 o más, lo marcamos como <b>plan robusto</b>.</li>
    </ol>
    <h3>Lo que no prometemos</h3>
    <ul>
      <li>No predecimos su cosecha exacta: comparamos planes entre sí.</li>
      <li>Los datos satelitales y de modelos son <b>regionales</b> (celdas de decenas de km; los 11 cantones caen en 5 celdas). Lo que usted sabe de su finca (pH, textura, riego) es lo que ajusta el resultado a su terreno.</li>
      <li>El riesgo se cuenta sobre pocos años (2021 → hoy; solo 2 eventos El Niño), por eso mostramos conteos como “1 de 2 años”, no porcentajes.</li>
      <li>Los rangos de los cultivos vienen de la FAO y la literatura; el equipo los está revisando con fuentes de Costa Rica.</li>
      <li>El ingreso todavía es <b>relativo</b> (1 a 5) hasta verificar precios y costos.</li>
    </ul>`,
    'foot.html': 'Iriria Sìsù · Equipo costarricense en el NASA International Space Apps Challenge 2026. Datos: NASA POWER (NASA Langley), índice ENSO de NOAA CPC, FAO. Código abierto (MIT) en <a href="https://github.com/joseantoniochavezurena2610-stack/iriria_sisu">GitHub</a>. Esta herramienta no reemplaza el consejo de un agrónomo.',
    'wa.text': (v) => `Iriria Sìsù — ${v.canton}, ${v.scenario}.\n${v.plan}: ${v.seq}\nPuntaje ${v.score}/100 (relativo).\n${v.link}`,
    // engine
    'r.nothing': 'No se siembra nada: el suelo descansa, pero no hay ingreso. Ningún cultivo actual calza con estas condiciones.',
    'r.legumes': (v) => `${v.legs} de 9 épocas usan leguminosas${v.green ? ` (${v.green} como abono verde)` : ''}: dejan nitrógeno para el cultivo siguiente.`,
    'r.repeats': (v) => `Repite la misma familia de cultivos ${v.rep} ${v.rep > 1 ? 'veces' : 'vez'} seguidas: ojo con plagas y desgaste del suelo.`,
    'r.families': (v) => `${v.n} familias de cultivos distintas y ninguna se repite seguida.`,
    'r.irrigation': (v) => `Riego estimado en 3 años: ${v.mm} mm${v.diff != null ? ` (${v.diff >= 0 ? '+' : '−'}${Math.abs(v.diff)} mm comparado con hoy)` : ''}.`,
    'r.weak': (v) => `Punto débil: ${v.crop} en la época ${v.season} del año ${v.year} — faltó agua en ${v.k} de ${v.n} años observados de ese escenario${v.limiting ? ` (limita: ${v.limiting})` : ''}.`,
    'r.noShort': 'En los años observados (2021 → hoy) a ninguna época de este plan le faltó agua.',
    'r.above': (v) => `${v.d} puntos por encima de lo que siembra hoy.`,
    'n.noPh': 'No se usó el pH: sin análisis de suelo el motor no puede descartar cultivos por acidez.',
    'n.excluded': (v) => `${v.crop}: descartado porque el pH ${v.ph} está fuera del rango tolerable (${v.min}–${v.max}).`,
    'n.maxloss': (v) => `Ningún plan mantiene el ingreso dentro de la pérdida máxima de ${v.p} %; igual se muestran los mejores planes.`,
    'lim.lack of water': 'falta de agua', 'lim.cold': 'frío', 'lim.heat': 'calor', 'lim.pH': 'pH', 'lim.excess rain': 'exceso de lluvia',
  },
};

const CROPS_ES = {
  rice: 'Arroz (secano)', maize: 'Maíz', sorghum: 'Sorgo', bean: 'Frijol', cowpea: 'Caupí (frijol de costa)', peanut: 'Maní',
  melon: 'Melón', watermelon: 'Sandía', mucuna: 'Mucuna (abono verde)', canavalia: 'Canavalia (abono verde)', fallow: 'Descanso (rastrojo)',
};

const SEASONS_I18N = {
  en: { dry: { name: 'Dry', range: 'Jan–Apr', hint: 'Dry season' }, primera: { name: 'Primera', range: 'May–Aug', hint: 'First rainy-season planting (includes the mid-summer drought, "canícula")' }, postrera: { name: 'Postrera', range: 'Sep–Dec', hint: 'Second rainy-season planting' } },
  es: { dry: { name: 'Seca', range: 'ene–abr', hint: 'Época seca' }, primera: { name: 'Primera', range: 'may–ago', hint: 'Primera siembra de la época lluviosa (incluye la canícula)' }, postrera: { name: 'Postrera', range: 'set–dic', hint: 'Segunda siembra de la época lluviosa' } },
};

const MONTHS_I18N = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'],
};

const norm = (lang) => (LANGS.includes(lang) ? lang : 'en');

/** A string (or the result of a template) in the given language; falls back to English, then to the key. */
export function t(lang, key, vars = {}) {
  const v = S[norm(lang)][key] ?? S.en[key];
  if (v == null) return key;
  return typeof v === 'function' ? v(vars) : v;
}

export function cropName(lang, crop) {
  if (norm(lang) === 'es' && crop && CROPS_ES[crop.id]) return CROPS_ES[crop.id];
  return crop ? crop.name : '';
}

export function seasonText(lang, seasonId) { return SEASONS_I18N[norm(lang)][seasonId]; }
export function monthNames(lang) { return MONTHS_I18N[norm(lang)]; }

/** Keys present in English but missing in another language (used by the tests). */
export function missingKeys(lang) { return Object.keys(S.en).filter((k) => !(k in S[norm(lang)])); }

/** Picks the language: ?lang= in the URL, then a saved choice, then the browser language. */
export function detectLang({ urlLang, saved, browser } = {}) {
  if (LANGS.includes(urlLang)) return urlLang;
  if (LANGS.includes(saved)) return saved;
  return String(browser || '').toLowerCase().startsWith('es') ? 'es' : 'en';
}
