// strings.js — every text shown by Iriria Sìsù, in one place (English only, decision D10).
// Pure module: no DOM. app.js applies the strings to the page; engine.js uses the
// reason and notice templates. Keeping them here lets the team review the wording in one file.

const S = {
    'page.title': 'Iriria Sìsù — Crop rotations for Guanacaste',
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
    'lim.lack of water': 'lack of water', 'lim.cold': 'cold', 'lim.heat': 'heat', 'lim.pH': 'pH', 'lim.excess rain': 'excess rain'
};

const SEASONS_TEXT = { dry: { name: 'Dry', range: 'Jan–Apr', hint: 'Dry season' }, primera: { name: 'Primera', range: 'May–Aug', hint: 'First rainy-season planting (includes the mid-summer drought, "canícula")' }, postrera: { name: 'Postrera', range: 'Sep–Dec', hint: 'Second rainy-season planting' } };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** A string, or the result of a template; returns the key itself if it is missing. */
export function t(key, vars = {}) {
  const v = S[key];
  if (v == null) return key;
  return typeof v === 'function' ? v(vars) : v;
}

export const cropName = (crop) => (crop ? crop.name : '');
export const seasonText = (seasonId) => SEASONS_TEXT[seasonId];
export const monthNames = () => MONTHS;
export const hasKey = (key) => key in S;
