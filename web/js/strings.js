// strings.js — every text shown by Iriria Sìsù, in one place (English only, decision D10).
// Pure module: no DOM. app.js applies the strings to the page; engine.js uses the
// reason and notice templates. Keeping them here lets the team review the wording in one file.

/** Colones, rounded to the nearest thousand: ₡1,234,000 / −₡147,000. */
export const crc = (x) => `${x < 0 ? '−' : ''}₡${(Math.round(Math.abs(x) / 1000) * 1000).toLocaleString('en-US')}`;

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
    'f3.helpBody': 'Wet some soil and squeeze it between thumb and finger. No ribbon: <b>sandy</b>. Short ribbon that breaks: <b>loam</b>. Long, shiny ribbon: <b>clay</b>.',
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
    'sc.note.forecast': 'IMN forecast: El Niño until mid-2027, then normal years.',
    'sc.note.normal': 'Average of the years without El Niño since 2021.',
    'sc.note.el_nino': 'Average of the El Niño months since 2021 (2023-24 mild, 2026 severe).',
    'sc.note.worst': 'The driest rainy season since 2021.',
    'status.loading': 'Loading data…',
    'clim.title': 'Climate of your canton',
    'clim.titleFull': (v) => `${v.name.replace(/\s*\(.*\)$/, '')} climate · ${v.mm} mm/year`,
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
    'ph.soilgrids': (v) => `We'll use ${v.ph}, a satellite soil-map estimate.`,
    'ph.none': 'No problem: no crop will be ruled out for acidity.',
    'status.live': 'Downloading NASA POWER data live (this can take a few seconds)…',
    'status.noData': (v) => `There is no NASA data for this canton yet and the live download failed (${v.err}). The team must run the "data" workflow on GitHub.`,
    'status.ok': (v) => `NASA POWER${v.live ? ' (live)' : ''} · ${v.from} → ${v.to} · regional data, your farm may differ.`,
    'status.offline': 'Offline: saved data.',
    'plan.title': (v) => `Plan ${v.letter}`, 'plan.base': 'If you keep planting what you plant today', 'plan.none': 'No crop in the catalog fits these conditions.',
    'plan.relative': 'relative score',
    'plan.margin': (v) => `Expected net margin: <b>${crc(v.total)}</b> per hectare over 3 years${v.diff != null ? ` (${v.diff >= 0 ? '+' : '−'}${crc(Math.abs(v.diff))} compared with today)` : ''}`,
    'plan.marginNote': 'Margins use current Costa Rican prices and costs (see the Data tab).',
    // journey (cover → steps → plans → goodbye)
    'step.count': (v) => `Step ${v.n} of ${v.of}`, 'step.next': 'Next', 'step.see': 'See my plans', 'step.update': 'Show my plans',
    'farm.edit': 'Edit answers', 'farm.irr': 'Irrigation', 'ph.unknown': 'I don\'t know',
    'orb.today': 'Today', 'badge.robustShort': 'Robust', 'badge.sensitiveShort': 'El Niño risk',
    'plan.choose': 'Choose this plan', 'plan.keep': 'Keep what I plant today',
    'money.label': 'Expected net margin', 'money.per': 'per hectare over 3 years', 'money.vsToday': 'vs. today', 'money.short': 'per ha in 3 years',
    'years.normal': 'Normal year', 'years.nino': 'El Niño year', 'why.title': 'Why this plan',
    // climate chart, in plain words
    'ch.view.normal': 'a normal year', 'ch.view.el_nino': 'an El Niño year', 'ch.view.worst': 'the driest year seen',
    'ch.head': (v) => `In ${v.view}, ${v.name} gets <b>${v.mm} mm</b> of rain${v.change != null ? ` (${v.change < 0 ? `<b>${-v.change} % less</b>` : `${v.change} % more`} than a normal year)` : ''}, and <b>${v.short} of 12 months</b> are too dry for crops without irrigation.`,
    'ch.tileRain': 'Rain in the year', 'ch.vsNormal': (v) => `${v.change < 0 ? '−' : '+'}${Math.abs(v.change)} % vs. a normal year`, 'ch.normalNote': 'Average of the years without El Niño',
    'ch.tileDry': 'Months too dry', 'ch.of12': 'of 12',
    'ch.tileHard': 'Hardest month', 'ch.hardNote': (v) => `${v.p} mm of rain; crops need ${v.e} mm`,
    'ch.rain': 'Rain', 'ch.need': 'Crops need', 'ch.month': 'Month', 'ch.enough': 'Enough rain?', 'ch.yes': 'Yes', 'ch.no': 'No — needs irrigation',
    'ch.tipOk': (v) => `Enough rain: ${v.mm} mm to spare`, 'ch.tipShort': (v) => `Too dry: ${v.mm} mm short`,
    'ch.fadedNote': 'Faded columns: no El Niño month has been observed there yet, so the overall average is used.',
    'ch.filled': 'No El Niño month observed here yet: the overall average is used.',
    'ch.tipAria': (v) => `${v.m}: ${v.p} mm of rain, crops need ${v.e} mm. ${v.ok ? 'Enough rain.' : 'Too dry.'}`,
    'ch.aria': (v) => `Monthly rain in ${v.view} in ${v.name}, compared with the water crops need`,
    'cell.fallow': 'Fallow', 'cell.fit': (v) => `fit ${v.p} %`, 'cell.irrigation': (v) => `irrigation ${v.mm} mm`,
    'cell.short': (v) => `water short ${v.k} of ${v.n} years`,
    'cell.tip': (v) => `${v.name} · fit ${v.fit} %${v.irr ? ` · irrigation ${v.irr} mm` : ''}${v.short ? ` · water short ${v.short}` : ''}${v.money ? ` · ${v.money}` : ''}`,
    'pick.note': 'Tap a plan to see it.', 'cell.hint': 'Tap a season to see its numbers.',
    'profile.mine': 'Your mix', 'profile.money': 'More money', 'profile.safe': 'Safer', 'profile.soil': 'Better soil', 'profile.alt': 'Another option',
    'profile.mine.long': 'Built on your priorities.', 'profile.money.long': 'Your priorities, leaning towards income.',
    'profile.safe.long': 'Your priorities, leaning towards safety in dry years.', 'profile.soil.long': 'Your priorities, leaning towards soil health.',
    'profile.alt.long': 'Another good option for your priorities.', 'earn.title': 'Money per hectare (3 years)', 'earn.note': 'Tap a bar to open that plan.',
    'why.more': (v) => `${v.n} more`, 'why.less': 'Show less',
    'crop.inCanton': (v) => `Crops grown in ${v.canton}`,
    'crop.moved': (v) => `${v.crop} is not usually grown in ${v.canton}, so we picked another crop.`,
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
    'data.money': 'Prices, costs and yields', 'data.moneySrc': 'MAG-SEPSA cost structures (Chorotega 2026), Defensoría de los Habitantes (beans, Jun 2026), mill and market prices reported in the press, MAG-SEPSA urea price (Aug 2026)', 'data.moneyStatus': 'Each crop is marked sourced, derived or estimate',
    'data.ranges': 'Crop ranges', 'data.rangesSrc': 'FAO-56 (Kc, duration) and FAO ECOCROP (pH, temperature)', 'data.rangesStatus': 'Initial values under review',
    'data.allCantons': 'All', 'data.heads': ['Crop', 'Cantons', 'Seasons', 'Cycle (days)', 'pH min', 'pH max', 'Kc', 'Drought tolerance (0-3)', 'N supply (kg/ha)', 'Yield (t/ha)', 'Price (₡/kg)', 'Cost (₡/ha)', 'Economic data'],
    'data.h2': 'Data and sources', 'data.catalog': 'Crop catalog',
    'data.catalogNote': 'Agronomic ranges come from FAO-56 and ECOCROP. "Economic data" says how each price and cost was obtained: <b>sourced</b> (published Costa Rican figure), <b>derived</b> (computed from published figures) or <b>estimate</b> (no Costa Rican series found; the team’s best estimate). Sources are in the catalog CSV on GitHub.',
    'how.html': `<h2>How it works</h2>
    <ol class="steps">
      <li><b>Real climate for your canton.</b> We download daily rainfall and temperature from NASA POWER since January 2021, and compute how much water the air demands (ET0, FAO's Hargreaves method). We also use NASA POWER root-zone soil wetness: how wet the soil is before each season sets how much water a crop starts with.</li>
      <li><b>We separate the years.</b> Using NOAA's official index we label each month as El Niño, La Niña or neutral. That lets us compare a normal year with an El Niño year using the rain that actually fell, not an invented percentage.</li>
      <li><b>We test every crop in every season.</b> Dry (Jan–Apr), Primera (May–Aug, includes the mid-summer drought or <i>canícula</i>) and Postrera (Sep–Dec). We check whether there is enough water (FAO-56-style balance), whether the temperature suits the crop and whether your pH allows it.</li>
      <li><b>We search the possible 3-year rotations</b>, keeping the 250 best at each step, and discard those that make no sense (pH out of range, crop out of season, same family repeated).</li>
      <li><b>We score from 0 to 100</b> on four things: <b>Soil</b> (nitrogen, ground cover, changing families), <b>Water</b> (how much irrigation or deficit remains), <b>Safety</b> (in how many observed years water fell short) and <b>Income</b> (expected net margin in colones: yield × price − production cost, plus the fertiliser a legume saves the next crop).</li>
      <li><b>We start from what you plant today.</b> Give one crop, or a different crop for each season (your current rotation). That is the baseline every plan is compared with; we also show where it leaves the field bare or runs short of water. Tick any crop you cannot grow (no buyer, equipment or seed) and it is left out.</li>
      <li><b>You decide the weight</b> of each one. We show 3 plans (one built on your priorities, the others leaning towards more money, safety or soil) and how each would do in a normal year and in an El Niño year. If it keeps at least 85 % of its score in an El Niño year and its Safety stays at 50 or more, we label it a <b>robust plan</b>.</li>
    </ol>
    <h3>What we do not promise</h3>
    <ul>
      <li>We do not predict your exact harvest: we compare plans against each other.</li>
      <li>Satellite and model data are <b>regional</b> (grid cells tens of km wide; the 11 cantons fall in 5 cells). What you know about your farm (pH, texture, irrigation) is what tailors the result to your plot.</li>
      <li>Risk is counted over few years (2021 → today; only 2 El Niño events), so we show counts like “1 of 2 years”, not percentages.</li>
      <li>Crop ranges come from FAO and the literature; the team is checking them against Costa Rican sources.</li>
      <li><b>Frost is not a risk here</b>, so the tool does not model it: the coldest monthly-average night temperature in Guanacaste in 2021 → today was 19.7 °C (NASA POWER, all 11 cantons).</li>
      <li>For each plan we list <b>what backs it, what we do not know yet and what to check locally</b> (seed, buyer, equipment, pests, sowing dates). The tool helps you explore options; it does not replace your judgement or local agricultural advice.</li>
      <li>Prices and costs are recent Costa Rican averages, not your farm’s. Rice and beans lose money at today’s prices in Chorotega (published figures); melon and watermelon need irrigation and a buyer. Some values are estimates and are labelled so.</li>
    </ul>`,
    'foot.html': 'Iriria Sìsù · Costa Rican team at the NASA International Space Apps Challenge 2026. Data: NASA POWER (NASA Langley), NOAA CPC ENSO index, FAO. Open source (MIT) on <a href="https://github.com/joseantoniochavezurena2610-stack/iriria_sisu">GitHub</a>. This tool does not replace advice from an agronomist.',
    'wa.text': (v) => `Iriria Sìsù — ${v.canton}, ${v.scenario}.\n${v.plan}: ${v.seq}\nScore ${v.score}/100 (relative).${v.margin != null ? ` Expected net margin ${crc(v.margin)}/ha over 3 years.` : ''}\n${v.link}`,
    // engine
    'r.nothing': 'Nothing is planted: the soil rests, but there is no income. None of the current crops fits these conditions.',
    'r.legumes': (v) => `${v.legs} legume season${v.legs > 1 ? 's' : ''}${v.green ? ` (${v.green} green manure)` : ''}: free nitrogen for the next crop.`,
    'r.repeats': (v) => `Same crop family ${v.rep}× in a row: watch for pests.`,
    'r.families': (v) => `${v.n} crop families, none back to back.`,
    'r.irrigation': (v) => `Irrigation: ${v.mm} mm in 3 years${v.diff != null ? ` (${v.diff >= 0 ? '+' : '−'}${Math.abs(v.diff)} vs. today)` : ''}.`,
    'r.weak': (v) => `Weak spot: ${v.crop}, ${v.season} of year ${v.year} — water fell short in ${v.k} of ${v.n} observed years.`,
    'r.noShort': 'Never ran out of water in 2021 → today.',
    'r.above': (v) => `${v.d} points above today.`,
    'r.loss': (v) => `${v.crop.charAt(0).toUpperCase() + v.crop.slice(1)} (${v.season}, year ${v.year}) loses about ${crc(v.crc)}/ha.`,
    'r.nsaved': (v) => `Legumes save about ${crc(v.crc)}/ha of urea.`,
    'n.noPh': 'No pH given: no crop was ruled out for acidity.',
    'n.excluded': (v) => `${v.crop}: ruled out because of pH ${v.ph} outside the tolerable range (${v.min}–${v.max}).`,
    'n.maxloss': (v) => `No plan stays within the maximum loss of ${v.p} %; showing the best ones.`,
    'n.banned': (v) => `Left out because you said you cannot grow them: ${v.crops}.`,
    slot: (v) => `${v.season}, year ${v.year}`,
    // the five blocks of each plan (D27): why / benefits = reasons + axes; then evidence, gaps, local checks
    'ins.title': 'Evidence, gaps and what to check',
    'ins.evidence': 'What backs this plan', 'ins.gaps': 'What we do not know yet', 'ins.checks': 'Check with your extension agent before planting',
    'ins.bare': (v) => (v.count ? `Field bare or nearly bare in ${v.count} of ${v.of} seasons: ${v.slots.join('; ')}.` : 'The field is never left bare.'),
    'ins.range': (v) => `Range: <b>${crc(v.low)}</b> to <b>${crc(v.high)}</b> per hectare, depending on the climate (normal, El Niño or the driest year seen, every season).`,
    'ins.support': 'This tool helps you explore options. It does not replace your judgement or local agricultural advice.',
    'e.legume': 'Legume before a grass: +10 % yield in the engine — half the +20 % average of a meta-analysis of 462 experiments (Zhao et al. 2022).',
    'e.water': 'Water need from the FAO-56 method, with NASA POWER rainfall, temperature and root-zone soil wetness for your canton (2021 → today).',
    'e.risk': (v) => `Safety counted over ${v.n} observed year${v.n > 1 ? 's' : ''} of this climate, labelled with NOAA’s El Niño index.`,
    'e.families': 'No crop family back to back: changing families interrupts pest and disease cycles.',
    'e.money': (v) => `Prices and costs: ${v.k} of ${v.m} crops use published Costa Rican figures.`,
    'g.phModel': (v) => `pH ${v.ph} is a satellite soil-map estimate (SoilGrids, 250 m), not a test of your soil.`,
    'g.phNone': 'No pH: no crop was ruled out for acidity. A soil test would sharpen the plan.',
    'g.om': 'Organic matter unknown: the Soil score assumes a medium level.',
    'g.estimate': (v) => `Price or cost of ${v.crops} is the team’s estimate (no Costa Rican series found).`,
    'g.unverified': (v) => `Crop ranges for ${v.crops} are FAO global values, still being checked against Costa Rican sources.`,
    'g.fewYears': (v) => `Only ${v.n} observed year${v.n > 1 ? 's' : ''} behind the risk count: treat it as a warning sign, not a probability.`,
    'g.filled': (v) => `No El Niño month observed yet in ${v.seasons}: the overall average is used there.`,
    'g.regional': 'Satellite climate is regional (grid cells tens of km wide): your farm can be wetter or drier.',
    'c.new': (v) => `New to your farm: ${v.crops}. Check seed, buyer, equipment and local pests.`,
    'c.green': (v) => `Green manure (${v.crops}): check local seed supply and when to cut it.`,
    'c.buyer': 'Melon or watermelon: agree on a buyer before planting.',
    'c.irrigation': (v) => `Uses ${v.mm} mm of irrigation in 3 years: check your source holds up in an El Niño year.`,
    'c.sowing': (v) => `Water fell short some years for ${v.slots}: confirm sowing dates with local rain.`,
    'c.pests': (v) => `Same family ${v.rep}× in a row: ask about pest build-up.`,
    'vul.title': 'Weak spots of what you plant today',
    'vul.bare': (v) => `${v.season}: the field stays bare — nothing you plant today fits.`,
    'vul.short': (v) => `${v.season}: ${v.crop} ran short of water in ${v.k} of ${v.n} observed years.`,
    'vul.none': 'No weak season found for what you plant today in this climate.',
    'f2.rotation': 'Different crop in each season?', 'f2.rotNote': 'Leave “Main crop” if you plant the same one.', 'rot.same': 'Main crop',
    'f4.exclude': 'Any crop you cannot grow? (no buyer, no equipment, no seed)',
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
export const monthFull = () => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const hasKey = (key) => key in S;
