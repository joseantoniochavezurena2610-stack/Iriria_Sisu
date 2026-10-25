// climate.js — turns NASA POWER monthly data into climate scenarios for the engine.
// Pure functions: no DOM, no network. Used by app.js and by the tests in tests/.

export const SEASONS = [
  { id: 'dry', name: 'Dry', range: 'Jan–Apr', months: [1, 2, 3, 4], hint: 'Dry season' },
  { id: 'primera', name: 'Primera', range: 'May–Aug', months: [5, 6, 7, 8], hint: 'First rainy-season planting (includes the mid-summer drought, "canícula")' },
  { id: 'postrera', name: 'Postrera', range: 'Sep–Dec', months: [9, 10, 11, 12], hint: 'Second rainy-season planting' },
];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const SCENARIOS = {
  normal: { name: 'Year without El Niño', short: 'Normal' },
  el_nino: { name: 'El Niño year', short: 'El Niño' },
  worst: { name: 'Worst observed year', short: 'Worst year' },
};

/** ENSO phase of a month. Accepts the automatic format (months) or the fallback format (periods). */
export function monthPhase(enso, year, month) {
  if (!enso) return null;
  if (Array.isArray(enso.months)) {
    const f = enso.months.find((x) => x.year === year && x.month === month);
    if (f) return f.phase;
  }
  if (Array.isArray(enso.periods)) {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    const p = enso.periods.find((x) => x.from <= key && key <= x.to);
    if (p) return p.phase;
  }
  return null;
}

/** Monthly effective rainfall (USDA-SCS method, as used in FAO CROPWAT). */
export function effectiveRainfall(p) {
  if (p == null || p <= 0) return 0;
  return p <= 250 ? (p * (125 - 0.2 * p)) / 125 : 125 + 0.1 * p;
}

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/**
 * Builds the scenarios from climate_<id>.json and enso.json.
 * Each scenario has 12 months {P, ET0, T, n, filled} and, per season, the year-by-year
 * samples the engine uses to compute risk.
 */
export function buildScenarios(climate, enso) {
  const months = (climate.months || []).filter((m) => m.P != null && m.ET0 != null && m.T != null)
    .map((m) => ({ ...m, phase: monthPhase(enso, m.year, m.month) }));
  if (months.length < 24) throw new Error('Fewer than 2 years of complete data for this location.');

  const years = [...new Set(months.map((m) => m.year))].sort();
  const byYearMonth = new Map(months.map((m) => [`${m.year}-${m.month}`, m]));

  // Worst year: the complete year (May–Nov) with the least rain.
  const wetSeason = years.map((y) => {
    const ms = [5, 6, 7, 8, 9, 10, 11].map((k) => byYearMonth.get(`${y}-${k}`));
    return ms.every(Boolean) ? { year: y, P: ms.reduce((s, m) => s + m.P, 0) } : null;
  }).filter(Boolean).sort((a, b) => a.P - b.P);
  const worstYear = wetSeason.length ? wetSeason[0].year : null;

  const filters = {
    normal: (m) => m.phase !== 'el_nino',
    el_nino: (m) => m.phase === 'el_nino',
    worst: (m) => m.year === worstYear,
  };

  const scenarios = {};
  for (const [id, keep] of Object.entries(filters)) {
    const monthly = [];
    for (let month = 1; month <= 12; month++) {
      let group = months.filter((m) => m.month === month && keep(m));
      let filled = false;
      if (!group.length) { group = months.filter((m) => m.month === month); filled = true; }
      monthly.push({
        month, n: group.length, filled,
        P: mean(group.map((m) => m.P)), ET0: mean(group.map((m) => m.ET0)), T: mean(group.map((m) => m.T)),
        GWETROOT: mean(group.map((m) => m.GWETROOT).filter((x) => x != null)),
        years: [...new Set(group.map((m) => m.year))],
      });
    }
    scenarios[id] = { id, ...SCENARIOS[id], monthly, samples: {} };
  }

  // Year-by-year samples for each season (complete seasons only).
  for (const s of SEASONS) {
    const samples = [];
    for (const y of years) {
      const ms = s.months.map((k) => byYearMonth.get(`${y}-${k}`));
      if (!ms.every(Boolean)) continue;
      const prevMonth = s.months[0] === 1 ? byYearMonth.get(`${y - 1}-12`) : byYearMonth.get(`${y}-${s.months[0] - 1}`);
      const nino = ms.filter((m) => m.phase === 'el_nino').length;
      samples.push({
        year: y, P: ms.map((m) => m.P), ET0: ms.map((m) => m.ET0), T: ms.map((m) => m.T),
        previous: prevMonth ? { P: prevMonth.P, ET0: prevMonth.ET0 } : null,
        phase: nino >= 2 ? 'el_nino' : 'other',
      });
    }
    scenarios.normal.samples[s.id] = samples.filter((m) => m.phase !== 'el_nino');
    scenarios.el_nino.samples[s.id] = samples.filter((m) => m.phase === 'el_nino');
    scenarios.worst.samples[s.id] = samples;
  }

  const phasesSeen = months.reduce((acc, m) => { acc[m.phase || 'no_data'] = (acc[m.phase || 'no_data'] || 0) + 1; return acc; }, {});
  return {
    scenarios,
    meta: {
      from: `${months[0].year}-${String(months[0].month).padStart(2, '0')}`,
      to: `${months.at(-1).year}-${String(months.at(-1).month).padStart(2, '0')}`,
      completeMonths: months.length, years, worstYear, phasesSeen,
    },
  };
}

/** Climate of one season in one scenario: its 4 months + the month before (for soil-water carry-over). */
export function seasonClimate(scenario, season) {
  const m = (k) => scenario.monthly[k - 1];
  const prev = season.months[0] === 1 ? m(12) : m(season.months[0] - 1);
  return {
    P: season.months.map((k) => m(k).P), ET0: season.months.map((k) => m(k).ET0), T: season.months.map((k) => m(k).T),
    previous: { P: prev.P, ET0: prev.ET0 },
    filled: season.months.some((k) => m(k).filled),
  };
}

// ---------------------------------------------------------------------------
// In-browser processing of the DAILY NASA POWER response (live download).
// Same calculation as scripts/fetch_data.py, for locations that are not precomputed.

function extraterrestrialRadiationMm(lat, day) {
  const phi = (lat * Math.PI) / 180;
  const dr = 1 + 0.033 * Math.cos((2 * Math.PI * day) / 365);
  const delta = 0.409 * Math.sin((2 * Math.PI * day) / 365 - 1.39);
  const ws = Math.acos(Math.max(-1, Math.min(1, -Math.tan(phi) * Math.tan(delta))));
  const ra = ((24 * 60) / Math.PI) * 0.082 * dr * (ws * Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.sin(ws));
  return 0.408 * ra;
}

/** Daily ET0 (mm) with the Hargreaves equation (FAO-56, eq. 52). */
export function et0Hargreaves(tmean, tmax, tmin, lat, day) {
  if ([tmean, tmax, tmin].some((v) => v == null) || tmax < tmin) return null;
  return 0.0023 * (tmean + 17.8) * Math.sqrt(tmax - tmin) * extraterrestrialRadiationMm(lat, day);
}

export const POWER_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';
export const MAX_MONTH_RAIN_MM = 2500;

export function powerUrl(lat, lon, start, end) {
  const f = (d) => d.toISOString().slice(0, 10).replaceAll('-', '');
  const q = new URLSearchParams({ parameters: 'PRECTOTCORR,T2M,T2M_MAX,T2M_MIN,RH2M,GWETROOT', community: 'AG', latitude: lat.toFixed(4), longitude: lon.toFixed(4), start: f(start), end: f(end), format: 'JSON', 'time-standard': 'LST' });
  return `${POWER_URL}?${q}`;
}

export function processPowerDaily(json, lat) {
  const p = json && json.properties && json.properties.parameter;
  if (!p || !p.PRECTOTCORR) throw new Error('The NASA POWER response has no rainfall (PRECTOTCORR).');
  const fill = (json.header && json.header.fill_value) ?? -999;
  const val = (n, k) => { const v = p[n] && p[n][k]; return v == null || v === fill || v <= -900 ? null : v; };
  const months = new Map();
  for (const k of Object.keys(p.PRECTOTCORR).sort()) {
    const P = val('PRECTOTCORR', k);
    if (P == null) continue;
    const year = +k.slice(0, 4), month = +k.slice(4, 6), dom = +k.slice(6, 8);
    const day = Math.round((Date.UTC(year, month - 1, dom) - Date.UTC(year, 0, 0)) / 864e5);
    const m = months.get(`${year}-${month}`) || { year, month, days: 0, P: 0, et: 0, nEt: 0, T: 0, nT: 0, RH: 0, nRH: 0, G: 0, nG: 0 };
    m.days++; m.P += P;
    const t = val('T2M', k), tx = val('T2M_MAX', k), tn = val('T2M_MIN', k);
    const e = et0Hargreaves(t, tx, tn, lat, day);
    if (e != null) { m.et += e; m.nEt++; }
    if (t != null) { m.T += t; m.nT++; }
    const rh = val('RH2M', k); if (rh != null) { m.RH += rh; m.nRH++; }
    const g = val('GWETROOT', k); if (g != null) { m.G += g; m.nG++; }
    months.set(`${year}-${month}`, m);
  }
  const out = [];
  for (const m of months.values()) {
    if (m.days < 25) continue;
    const daysInMonth = new Date(Date.UTC(m.year, m.month, 0)).getUTCDate();
    out.push({
      year: m.year, month: m.month, P: +(m.P * daysInMonth / m.days).toFixed(1),
      ET0: m.nEt >= 25 ? +(m.et * daysInMonth / m.nEt).toFixed(1) : null,
      T: m.nT ? +(m.T / m.nT).toFixed(2) : null, RH: m.nRH ? +(m.RH / m.nRH).toFixed(1) : null,
      GWETROOT: m.nG ? +(m.G / m.nG).toFixed(3) : null, days: m.days,
    });
  }
  out.sort((a, b) => a.year - b.year || a.month - b.month);
  // Same plausibility limit as scripts/fetch_data.py (decision D21): never use rainfall that cannot be real.
  const wettest = out.reduce((w, m) => (m.P > (w ? w.P : -1) ? m : w), null);
  if (wettest && wettest.P > MAX_MONTH_RAIN_MM) throw new Error(`NASA POWER returned implausible rainfall (${Math.round(wettest.P)} mm in ${wettest.year}-${String(wettest.month).padStart(2, '0')}); not used.`);
  const g = (json.geometry && json.geometry.coordinates) || [];
  return { months: out, power_cell: { lon: g[0], lat: g[1] }, source: 'NASA POWER, daily API, AG community (live download)' };
}
