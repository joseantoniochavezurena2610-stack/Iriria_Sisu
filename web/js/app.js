// app.js — Iriria Sìsù interface. Loads the data, calls the engine and draws the plans.
import { SEASONS, MONTHS, buildScenarios, powerUrl, processPowerDaily } from './climate.js';
import { recommend } from './engine.js';

const $ = (id) => document.getElementById(id);
const pct = (x) => Math.round(x * 100);
const GROUPS = { gram: 'Grasses (rice, maize, sorghum)', leg: 'Legumes', cuc: 'Cucurbits (melon, watermelon)', cover: 'Green manure', none: 'Fallow' };
const SCENARIO_NOTE = {
  forecast: 'Costa Rica’s weather service (IMN) expects El Niño effects at least until July 2027: the Dry and Primera seasons of year 1 use the climate of the observed El Niño months; the rest use normal years.',
  normal: 'Average of the months without El Niño since 2021.',
  el_nino: 'Average of the El Niño months observed since 2021 (2023-24 and 2026). Note: El Niño 2023 barely dried Guanacaste; 2026 did.',
  worst: 'The year with the least rain from May to November since 2021.',
};
const PLAN_SCENARIOS = {
  forecast: ['el_nino', 'el_nino', ...Array(7).fill('normal')],
  normal: Array(9).fill('normal'), el_nino: Array(9).fill('el_nino'), worst: Array(9).fill('worst'),
};
const FIELDS = ['canton', 'current', 'irrigation', 'texture', 'ph', 'slope', 'om', 'soil', 'water', 'risk', 'income', 'maxloss'];

const state = { scenario: 'forecast', climate: {}, data: null, map: null, markers: {} };

async function json(path, optional = false) {
  try {
    const r = await fetch(path, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    if (optional) return null;
    throw new Error(`Could not load ${path} (${e.message})`);
  }
}

function setStatus(text, kind = '') { const f = $('status'); f.className = `flag ${kind}`; f.textContent = text; }

// ------------------------------------------------------------------ loading
async function start() {
  try {
    const [points, crops, enso, summary, soil] = await Promise.all([
      json('data/guanacaste/points.json'), json('data/crops.json'), json('data/enso.json'),
      json('data/guanacaste/summary.json', true), json('data/guanacaste/soil_reference.json', true),
    ]);
    state.data = { points: points.points, crops: crops.crops, enso, summary, soil };
  } catch (e) { setStatus(e.message, 'bad'); return; }

  const { points, crops } = state.data;
  $('canton').innerHTML = points.map((p) => `<option value="${p.id}">${p.name}</option>`).join('');
  $('current').innerHTML = crops.filter((c) => c.group !== 'cover')
    .map((c) => `<option value="${c.id}">${c.group === 'none' ? 'Nothing / fallow' : c.name}</option>`).join('');
  $('famlegend').innerHTML = Object.entries(GROUPS).map(([k, n]) => `<span><i style="background:var(--g-${k})"></i>${n}</span>`).join('');
  readUrl();
  tabs();
  drawMap();
  dataTab();
  wire();
  await update();
}

function readUrl() {
  const q = new URLSearchParams(location.search);
  FIELDS.forEach((k) => { const v = q.get(k); if (v != null && $(k)) $(k).value = v; });
  if (q.get('phunknown') === '1') $('phunknown').checked = true;
  if (q.get('scenario') && PLAN_SCENARIOS[q.get('scenario')]) state.scenario = q.get('scenario');
  if (!q.get('current')) $('current').value = 'rice';
}

function currentLink() {
  const q = new URLSearchParams();
  FIELDS.forEach((k) => q.set(k, $(k).value));
  if ($('phunknown').checked) q.set('phunknown', '1');
  q.set('scenario', state.scenario);
  return `${location.origin}${location.pathname}?${q}`;
}

function tabs() {
  const buttons = [...document.querySelectorAll('.tabs button')];
  const show = (t) => {
    if (!$(`p-${t}`)) t = 'tool';
    buttons.forEach((b) => { const on = b.dataset.tab === t; b.setAttribute('aria-selected', on); $(`p-${b.dataset.tab}`).hidden = !on; });
    if (t === 'tool' && state.map) setTimeout(() => state.map.invalidateSize(), 50);
  };
  buttons.forEach((b) => b.addEventListener('click', () => { show(b.dataset.tab); try { history.replaceState(null, '', `${location.search}#${b.dataset.tab}`); } catch (e) { /* preview frames */ } }));
  show((location.hash || '').slice(1) || 'tool');
}

function drawMap() {
  if (!window.L || !$('map')) return; // no internet or no Leaflet: the list still works
  const { points } = state.data;
  const m = L.map('map', { scrollWheelZoom: false, attributionControl: true }).setView([10.5, -85.35], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 12, attribution: '© OpenStreetMap' }).addTo(m);
  for (const p of points) {
    state.markers[p.id] = L.circleMarker([p.lat, p.lon], { radius: 7, weight: 2, color: '#1d7044', fillOpacity: 0.4 })
      .addTo(m).bindTooltip(p.name).on('click', () => { $('canton').value = p.id; update(); });
  }
  state.map = m;
}

function highlightMap() {
  for (const [id, mk] of Object.entries(state.markers)) mk.setStyle({ fillOpacity: id === $('canton').value ? 0.95 : 0.3, radius: id === $('canton').value ? 10 : 7 });
}

function wire() {
  $('form').addEventListener('input', (e) => {
    if (e.target.type === 'range') $(`o-${e.target.id}`).textContent = e.target.value;
    update();
  });
  ['soil', 'water', 'risk', 'income'].forEach((k) => { $(`o-${k}`).textContent = $(k).value; });
  document.querySelectorAll('#scenario button').forEach((b) => b.addEventListener('click', () => { state.scenario = b.dataset.sc; update(); }));
  $('locate').addEventListener('click', () => {
    if (!navigator.geolocation) { $('locmsg').textContent = 'Your browser does not support location.'; return; }
    $('locmsg').textContent = 'Locating…';
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude: la, longitude: lo } = pos.coords;
      const d = (p) => (p.lat - la) ** 2 + ((p.lon - lo) * Math.cos(la * Math.PI / 180)) ** 2;
      const near = [...state.data.points].sort((a, b) => d(a) - d(b))[0];
      $('canton').value = near.id;
      $('locmsg').textContent = `Nearest canton: ${near.name}. Your location is not stored or sent anywhere.`;
      update();
    }, () => { $('locmsg').textContent = 'Could not get your location. Choose the canton from the list.'; }, { timeout: 10000 });
  });
  $('print').addEventListener('click', () => window.print());
  $('share').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(currentLink()); $('sharemsg').textContent = 'Link copied.'; } catch (e) { $('sharemsg').textContent = currentLink(); }
  });
}

// ------------------------------------------------------------------ climate
async function climateOf(id) {
  if (state.climate[id]) return state.climate[id];
  const pre = await json(`data/guanacaste/climate_${id}.json`, true);
  if (pre && pre.months && pre.months.length) return (state.climate[id] = { ...pre, origin: 'precomputed' });
  // Not precomputed: try a live download from the browser.
  const p = state.data.points.find((x) => x.id === id);
  setStatus('Downloading NASA POWER data live (this can take a few seconds)…');
  const end = new Date(Date.now() - 864e5);
  const r = await fetch(powerUrl(p.lat, p.lon, new Date(Date.UTC(2021, 0, 1)), end));
  if (!r.ok) throw new Error(`NASA POWER answered HTTP ${r.status}`);
  const proc = processPowerDaily(await r.json(), p.lat);
  return (state.climate[id] = { id, name: p.name, lat: p.lat, lon: p.lon, ...proc, origin: 'live' });
}

function farm() {
  const id = $('canton').value;
  const ref = state.data.soil && state.data.soil.points[id];
  let ph = $('phunknown').checked ? null : (parseFloat($('ph').value) || null);
  $('ph').disabled = $('phunknown').checked;
  let note = '';
  if ($('phunknown').checked && ref && ref.phh2o) { ph = ref.phh2o; note = `Using pH ${ref.phh2o} as a SoilGrids reference (modelled at 250 m, not measured on your farm). A soil test is better.`; }
  else if ($('phunknown').checked) note = 'Without pH we cannot rule out crops because of acidity. A soil test (INTA, UCR or a private lab) is cheap and improves the result a lot.';
  $('phnote').textContent = note;
  return {
    ph, texture: $('texture').value, slope: $('slope').value, irrigation: $('irrigation').value,
    current_crop: $('current').value, organic_matter: $('om').value || null,
    max_loss_pct: $('maxloss').value ? +$('maxloss').value : null,
  };
}

// ------------------------------------------------------------------ drawing
function chart(sc) {
  const n = sc.normal.monthly, ni = sc.el_nino.monthly;
  const W = 680, H = 250, L = 46, R = 16, T = 24, B = 44, pw = W - L - R, ph = H - T - B;
  const max = Math.max(100, Math.ceil(Math.max(...n.map((m) => Math.max(m.P, m.ET0)), ...ni.map((m) => m.P)) / 100) * 100);
  const y = (v) => T + ph - (v / max) * ph, bw = pw / 12;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="min-width:520px;max-width:${W}px" role="img" aria-label="Monthly rainfall in normal and El Niño years, and evapotranspiration">`;
  for (let k = 0; k <= 4; k++) { const v = (max * k) / 4; s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`; }
  n.forEach((m, i) => {
    const x = L + i * bw, w = (bw - 8) / 2;
    s += `<rect x="${x + 4}" y="${y(m.P)}" width="${w}" height="${T + ph - y(m.P)}" rx="2" fill="var(--rain)"><title>${MONTHS[i]} normal: ${Math.round(m.P)} mm (${m.n} months)</title></rect>`;
    const q = ni[i];
    s += `<rect x="${x + 4 + w}" y="${y(q.P)}" width="${w}" height="${T + ph - y(q.P)}" rx="2" fill="var(--rain-nino)" ${q.filled ? 'opacity=".35"' : ''}><title>${MONTHS[i]} El Niño: ${Math.round(q.P)} mm${q.filled ? ' (no El Niño months observed: overall average used)' : ` (${q.n} months)`}</title></rect>`;
    s += `<text x="${x + bw / 2}" y="${H - B + 14}" text-anchor="middle">${MONTHS[i]}</text>`;
  });
  s += `<polyline fill="none" stroke="var(--et)" stroke-width="2" stroke-dasharray="4 3" points="${n.map((m, i) => `${L + i * bw + bw / 2},${y(m.ET0)}`).join(' ')}"/>`;
  SEASONS.forEach((se, i) => { const x = L + i * 4 * bw; s += `<line x1="${x + 3}" x2="${x + 4 * bw - 3}" y1="${H - 18}" y2="${H - 18}" stroke="var(--muted)" stroke-width="1.5"/><text x="${x + 2 * bw}" y="${H - 5}" text-anchor="middle">${se.name}</text>`; });
  s += `<text x="${L - 6}" y="10" text-anchor="end">mm</text></svg>`;
  $('chart').innerHTML = s;
}

function card(title, plan, crops, year0, isBase) {
  const sc = plan.scores;
  let cal = `<div class="cal"><span class="h"></span>${SEASONS.map((e) => `<span class="h" title="${e.hint}">${e.name}<br>${e.range}</span>`).join('')}`;
  for (let a = 0; a < 3; a++) {
    cal += `<span class="h">${year0 + a}</span>`;
    for (let e = 0; e < 3; e++) {
      const i = a * 3 + e, c = crops[plan.sequence[i]], d = sc.detail[i];
      const extra = c.group === 'none' ? '—' : `fit ${pct(d.suit)} %${d.irrigation > 5 ? ` · irrigation ${Math.round(d.irrigation)} mm` : ''}`;
      cal += `<div class="cell" style="background:var(--g-${c.group})" title="${c.name}${d.prob != null ? ` · water fell short in ${pct(d.prob)} % of observed years` : ''}"><b>${c.group === 'none' ? 'Fallow' : c.name}</b><span>${extra}</span></div>`;
    }
  }
  cal += '</div>';
  const axes = [['Soil', sc.soil], ['Water', sc.water], ['Safety', sc.risk], ['Income', sc.income]]
    .map(([n, v]) => `<span>${n}</span><div class="meter"><i style="width:${pct(v)}%"></i></div><span class="v">${pct(v)}</span>`).join('');
  const badge = plan.robust ? '<span class="badge">Robust plan</span>' : (!isBase && plan.comparison ? '<span class="badge warn">Sensitive to El Niño</span>' : '');
  const comp = plan.comparison ? `<p class="comp">Normal year: <b>${pct(plan.comparison.normal)}</b> · El Niño year: <b>${pct(plan.comparison.el_nino)}</b></p>` : '';
  return `<article class="plan${isBase ? ' base' : ''}"><header><h3>${title}</h3><div>${badge}<span class="total"><b>${pct(sc.total)}</b> / 100</span></div></header>${cal}<div class="side"><div class="meters">${axes}</div>${comp}<ul class="why">${plan.reasons.map((r) => `<li>${r}</li>`).join('')}</ul></div></article>`;
}

let turn = 0;
async function update() {
  const mine = ++turn;
  document.querySelectorAll('#scenario button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.sc === state.scenario));
  $('scnote').textContent = SCENARIO_NOTE[state.scenario];
  highlightMap();
  const id = $('canton').value;
  let climate;
  try { climate = await climateOf(id); } catch (e) {
    if (mine !== turn) return;
    setStatus(`There is no NASA data for this canton yet and the live download failed (${e.message}). The team must run the "data" workflow on GitHub.`, 'bad');
    $('plans').innerHTML = ''; $('chart').innerHTML = ''; return;
  }
  if (mine !== turn) return;
  let sc;
  try { sc = buildScenarios(climate, state.data.enso); } catch (e) { setStatus(e.message, 'bad'); return; }
  const m = sc.meta;
  const shares = state.data.summary && (state.data.summary.cantons_per_cell || []).find((g) => g.includes(climate.name) && g.length > 1);
  setStatus(`Data: NASA POWER${climate.origin === 'live' ? ' (downloaded now)' : ''}, ${m.from} to ${m.to} (${m.completeMonths} months). This is regional data from a grid cell tens of km wide${shares ? `, the same cell as ${shares.filter((n) => n !== climate.name).join(', ')}` : ''}; your farm may be drier or wetter.`, 'ok');
  $('climtitle').textContent = `Climate of ${climate.name} · ${Math.round(sc.scenarios.normal.monthly.reduce((s, x) => s + x.P, 0))} mm a year without El Niño`;
  chart(sc.scenarios);

  const r = recommend({
    crops: state.data.crops, scenarios: sc.scenarios, planScenarios: PLAN_SCENARIOS[state.scenario], farm: farm(),
    priorities: { soil: +$('soil').value, water: +$('water').value, risk: +$('risk').value, income: +$('income').value },
  });
  const today = new Date();
  const year0 = today.getMonth() >= 8 ? today.getFullYear() + 1 : today.getFullYear();
  $('notices').innerHTML = r.notices.map((a) => `<li>${a}</li>`).join('');
  $('plans').innerHTML = (r.plans.length ? r.plans.map((p, i) => card(`Plan ${'ABC'[i]}`, p, state.data.crops, year0, false)).join('')
    : '<p class="flag bad">No crop in the catalog fits these conditions.</p>') + card('If you keep planting what you plant today', r.base, state.data.crops, year0, true);
}

function dataTab() {
  const { summary, enso, crops, soil } = state.data;
  const rows = [
    ['Daily climate', 'NASA POWER (NASA Langley), daily API, AG community', summary ? `Generated ${summary.generated.slice(0, 10)}, since ${summary.window_start}` : 'Pending: run the "data" workflow'],
    ['Evapotranspiration (ET0)', 'Computed with Hargreaves (FAO-56, eq. 52) from POWER temperature', 'Monthly'],
    ['ENSO phase', enso.source, enso.automatic ? 'Automatic' : 'Fallback table'],
    ['Reference soil', soil ? soil.source : 'SoilGrids 2.0 (ISRIC) — pending; the REST API is paused', 'Only when the farmer does not know their pH'],
    ['Crop ranges', 'FAO-56 (Kc, duration) and FAO ECOCROP (pH, temperature)', 'Initial values under review'],
  ];
  $('datainfo').innerHTML = `<div class="table"><table><thead><tr><th>What</th><th>Source</th><th>Status</th></tr></thead><tbody>${rows.map((f) => `<tr>${f.map((x) => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const cols = ['name', 'seasons', 'cycle_days', 'ph_min', 'ph_max', 'kc_season', 'drought_tolerance', 'n_supply_kg_ha', 'relative_margin', 'verified_by'];
  const heads = ['Crop', 'Seasons', 'Cycle (days)', 'pH min', 'pH max', 'Kc', 'Drought tolerance (0-3)', 'N supply (kg/ha)', 'Margin (1-5)', 'Verified'];
  $('croptable').innerHTML = `<thead><tr>${heads.map((t) => `<th>${t}</th>`).join('')}</tr></thead><tbody>${crops.map((c) => `<tr>${cols.map((k) => `<td>${Array.isArray(c[k]) ? c[k].join(', ') : c[k] ?? '—'}</td>`).join('')}</tr>`).join('')}</tbody>`;
}

start();
