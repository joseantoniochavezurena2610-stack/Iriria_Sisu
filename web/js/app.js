// app.js — Iriria Sìsù interface. Loads the data, calls the engine and draws the plans.
import { SEASONS, buildScenarios, powerUrl, processPowerDaily } from './climate.js';
import { recommend } from './engine.js';
import { t, cropName, seasonText, monthNames, crc } from './strings.js';

const $ = (id) => document.getElementById(id);
const pct = (x) => Math.round(x * 100);
const GROUP_KEYS = ['gram', 'leg', 'cuc', 'cover', 'none'];
const PLAN_SCENARIOS = {
  forecast: ['el_nino', 'el_nino', ...Array(7).fill('normal')],
  normal: Array(9).fill('normal'), el_nino: Array(9).fill('el_nino'), worst: Array(9).fill('worst'),
};
const FIELDS = ['canton', 'current', 'irrigation', 'texture', 'ph', 'slope', 'om', 'soil', 'water', 'risk', 'income', 'maxloss'];

const state = { scenario: 'forecast', climate: {}, data: null, map: null, markers: {}, lastScenarios: null, last: null };
const L = t;

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

// ------------------------------------------------------------------ text
// Static labels live in strings.js; the HTML carries the same English text so the page reads fine before scripts run.
function fillLists() {
  const keep = $('current').value;
  $('current').innerHTML = state.data.crops.filter((c) => c.group !== 'cover')
    .map((c) => `<option value="${c.id}">${c.group === 'none' ? L('crop.nothing') : cropName(c)}</option>`).join('');
  if (keep) $('current').value = keep;
  $('famlegend').innerHTML = GROUP_KEYS.map((k) => `<span><i style="background:var(--g-${k})"></i>${L(`group.${k}`)}</span>`).join('');
  document.querySelectorAll('[data-html]').forEach((el) => { el.innerHTML = L(el.dataset.html); });
  dataTab();
}

// ------------------------------------------------------------------ loading
async function start() {
  try {
    const [points, crops, enso, summary, soil] = await Promise.all([
      json('data/guanacaste/points.json'), json('data/crops.json'), json('data/enso.json'),
      json('data/guanacaste/summary.json', true), json('data/guanacaste/soil_reference.json', true),
    ]);
    state.data = { points: points.points, crops: crops.crops, enso, summary, soil };
  } catch (e) { setStatus(e.message, 'bad'); return; }

  $('canton').innerHTML = state.data.points.map((p) => `<option value="${p.id}">${p.name}</option>`).join('');
  fillLists();
  readUrl();
  tabs();
  drawMap();
  wire();
  await update();
}

function readUrl() {
  const q = new URLSearchParams(location.search);
  FIELDS.forEach((k) => { const v = q.get(k); if (v != null && $(k)) $(k).value = v; });
  // pH starts as "I don't know" unless the link says otherwise. Older links carried a pH but no flag: that pH was the user's.
  if (q.has('phunknown')) $('phunknown').checked = q.get('phunknown') === '1';
  else if (q.has('ph')) $('phunknown').checked = false;
  if (q.get('scenario') && PLAN_SCENARIOS[q.get('scenario')]) state.scenario = q.get('scenario');
  if (!q.get('current')) $('current').value = 'rice';
  ['soil', 'water', 'risk', 'income'].forEach((k) => { $(`o-${k}`).textContent = $(k).value; });
}

function currentLink() {
  const q = new URLSearchParams();
  FIELDS.forEach((k) => q.set(k, $(k).value));
  q.set('phunknown', $('phunknown').checked ? '1' : '0');
  q.set('scenario', state.scenario);
  return `${location.origin}${location.pathname}?${q}`;
}

function tabs() {
  const buttons = [...document.querySelectorAll('.tabs button')];
  const show = (tab) => {
    if (!$(`p-${tab}`)) tab = 'tool';
    buttons.forEach((b) => { const on = b.dataset.tab === tab; b.setAttribute('aria-selected', on); $(`p-${b.dataset.tab}`).hidden = !on; });
    if (tab === 'tool' && state.map) setTimeout(() => state.map.invalidateSize(), 50);
  };
  buttons.forEach((b) => b.addEventListener('click', () => { show(b.dataset.tab); try { history.replaceState(null, '', `${location.search}#${b.dataset.tab}`); } catch (e) { /* preview frames */ } }));
  show((location.hash || '').slice(1) || 'tool');
}

function drawMap() {
  if (!window.L || !$('map')) return; // no internet or no Leaflet: the list still works
  const m = window.L.map('map', { scrollWheelZoom: false, attributionControl: true }).setView([10.5, -85.35], 8);
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 12, attribution: '© OpenStreetMap' }).addTo(m);
  for (const p of state.data.points) {
    state.markers[p.id] = window.L.circleMarker([p.lat, p.lon], { radius: 7, weight: 2, color: '#1d7044', fillOpacity: 0.4 })
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
  document.querySelectorAll('#scenario button').forEach((b) => b.addEventListener('click', () => { state.scenario = b.dataset.sc; update(); }));
  $('locate').addEventListener('click', () => {
    if (!navigator.geolocation) { $('locmsg').textContent = L('loc.unsupported'); return; }
    $('locmsg').textContent = L('loc.locating');
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude: la, longitude: lo } = pos.coords;
      const d = (p) => (p.lat - la) ** 2 + ((p.lon - lo) * Math.cos(la * Math.PI / 180)) ** 2;
      const near = [...state.data.points].sort((a, b) => d(a) - d(b))[0];
      $('canton').value = near.id;
      $('locmsg').textContent = L('loc.found', { name: near.name });
      update();
    }, () => { $('locmsg').textContent = L('loc.failed'); }, { timeout: 10000 });
  });
  $('print').addEventListener('click', () => window.print());
  $('share').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(currentLink()); $('sharemsg').textContent = L('act.copied'); } catch (e) { $('sharemsg').textContent = currentLink(); }
  });
  $('whatsapp').addEventListener('click', () => {
    const text = whatsappText();
    if (text) window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });
  let timer = null;
  window.addEventListener('resize', () => { clearTimeout(timer); timer = setTimeout(() => { if (state.lastScenarios) chart(state.lastScenarios); }, 150); });
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
}

function whatsappText() {
  if (!state.last) return '';
  const { plans, base, crops } = state.last;
  const p = plans[0] || base;
  const seq = p.sequence.map((k) => (crops[k].group === 'none' ? L('cell.fallow') : cropName(crops[k])));
  const years = [0, 1, 2].map((a) => `${a + 1}: ${seq.slice(a * 3, a * 3 + 3).join(' → ')}`).join(' | ');
  return L('wa.text', {
    canton: $('canton').selectedOptions[0]?.textContent || '', scenario: L(`sc.${state.scenario}`),
    plan: plans[0] ? L('plan.title', { letter: 'A' }) : L('plan.base'), seq: years, score: pct(p.scores.total), margin: p.scores.margin, link: currentLink(),
  });
}

// ------------------------------------------------------------------ climate
async function climateOf(id) {
  if (state.climate[id]) return state.climate[id];
  const pre = await json(`data/guanacaste/climate_${id}.json`, true);
  if (pre && pre.months && pre.months.length) return (state.climate[id] = { ...pre, origin: 'precomputed' });
  // Not precomputed: try a live download from the browser.
  const p = state.data.points.find((x) => x.id === id);
  setStatus(L('status.live'));
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
  if ($('phunknown').checked && ref && ref.phh2o) { ph = ref.phh2o; note = L('ph.soilgrids', { ph: ref.phh2o }); }
  else if ($('phunknown').checked) note = L('ph.none');
  $('phnote').textContent = note;
  return {
    ph, texture: $('texture').value, slope: $('slope').value, irrigation: $('irrigation').value,
    current_crop: $('current').value, organic_matter: $('om').value || null,
    max_loss_pct: $('maxloss').value ? +$('maxloss').value : null,
  };
}

// ------------------------------------------------------------------ drawing
function chart(sc) {
  state.lastScenarios = sc;
  const box = $('chart');
  const n = sc.normal.monthly, ni = sc.el_nino.monthly;
  const months = monthNames();
  // Draw at the width available, so text keeps its size on a phone.
  const W = Math.round(Math.max(300, Math.min(680, box.clientWidth || 680)));
  const H = W < 480 ? 220 : 250, Lm = 40, R = 10, T = 24, B = 44, pw = W - Lm - R, ph = H - T - B;
  const max = Math.max(100, Math.ceil(Math.max(...n.map((m) => Math.max(m.P, m.ET0)), ...ni.map((m) => m.P)) / 100) * 100);
  const y = (v) => T + ph - (v / max) * ph, bw = pw / 12;
  const label = (m) => (bw < 34 ? m.charAt(0) : m);
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px" role="img" aria-label="${L('chart.aria')}">`;
  for (let k = 0; k <= 4; k++) { const v = (max * k) / 4; s += `<line x1="${Lm}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${Lm - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`; }
  n.forEach((m, i) => {
    const x = Lm + i * bw, w = (bw - 6) / 2;
    s += `<rect x="${x + 3}" y="${y(m.P)}" width="${w}" height="${T + ph - y(m.P)}" rx="2" fill="var(--rain)"><title>${L('chart.normalTip', { m: months[i], mm: Math.round(m.P), n: m.n })}</title></rect>`;
    const q = ni[i];
    s += `<rect x="${x + 3 + w}" y="${y(q.P)}" width="${w}" height="${T + ph - y(q.P)}" rx="2" fill="var(--rain-nino)" ${q.filled ? 'opacity=".35"' : ''}><title>${L('chart.ninoTip', { m: months[i], mm: Math.round(q.P), filled: q.filled, n: q.n })}</title></rect>`;
    s += `<text x="${x + bw / 2}" y="${H - B + 14}" text-anchor="middle">${label(months[i])}</text>`;
  });
  s += `<polyline fill="none" stroke="var(--et)" stroke-width="2" stroke-dasharray="4 3" points="${n.map((m, i) => `${Lm + i * bw + bw / 2},${y(m.ET0)}`).join(' ')}"/>`;
  SEASONS.forEach((se, i) => { const x = Lm + i * 4 * bw; s += `<line x1="${x + 3}" x2="${x + 4 * bw - 3}" y1="${H - 18}" y2="${H - 18}" stroke="var(--muted)" stroke-width="1.5"/><text x="${x + 2 * bw}" y="${H - 5}" text-anchor="middle">${seasonText(se.id).name}</text>`; });
  s += `<text x="${Lm - 6}" y="10" text-anchor="end">mm</text></svg>`;
  box.innerHTML = s;
}

function card(title, plan, crops, year0, isBase, base) {
  const sc = plan.scores;
  const st = (id) => seasonText(id);
  let cal = `<div class="cal"><span class="h"></span>${SEASONS.map((e) => `<span class="h" title="${st(e.id).hint}">${st(e.id).name}<br>${st(e.id).range}</span>`).join('')}`;
  for (let a = 0; a < 3; a++) {
    cal += `<span class="h">${year0 + a}</span>`;
    for (let e = 0; e < 3; e++) {
      const i = a * 3 + e, c = crops[plan.sequence[i]], d = sc.detail[i];
      const name = c.group === 'none' ? L('cell.fallow') : cropName(c);
      const short = d.prob != null && d.n ? Math.round(d.prob * d.n) : null;
      const bits = c.group === 'none' ? ['—'] : [L('cell.fit', { p: pct(d.suit) })];
      if (c.group !== 'none' && d.irrigation > 5) bits.push(L('cell.irrigation', { mm: Math.round(d.irrigation) }));
      if (short) bits.push(L('cell.short', { k: short, n: d.n }));
      if (c.group !== 'none' && d.margin != null) bits.push(crc(d.margin));
      cal += `<div class="cell" style="background:var(--g-${c.group})"><b>${name}</b><span>${bits.join(' · ')}</span></div>`;
    }
  }
  cal += '</div>';
  const axes = [['axis.soil', sc.soil], ['axis.water', sc.water], ['axis.risk', sc.risk], ['axis.income', sc.income]]
    .map(([k, v]) => `<span>${L(k)}</span><div class="meter"><i style="width:${pct(v)}%"></i></div><span class="v">${pct(v)}</span>`).join('');
  let badge = '', rule = '';
  if (plan.robust) { badge = `<span class="badge">${L('badge.robust')}</span>`; rule = L('badge.robustRule'); }
  else if (!isBase && plan.comparison) { badge = `<span class="badge warn">${L('badge.sensitive')}</span>`; rule = L('badge.sensitiveRule'); }
  const comp = plan.comparison ? `<p class="comp">${L('comp', { n: pct(plan.comparison.normal), ni: pct(plan.comparison.el_nino) })}</p>` : '';
  const ruleP = rule ? `<p class="rule">${rule}</p>` : '';
  const money = sc.margin != null ? `<p class="money">${L('plan.margin', { total: sc.margin, diff: !isBase && base && base.scores.margin != null ? sc.margin - base.scores.margin : null })}</p>` : '';
  return `<article class="plan${isBase ? ' base' : ''}"><header><h3>${title}</h3><div>${badge}<span class="total"><b>${pct(sc.total)}</b> / 100 · ${L('plan.relative')}</span></div></header>${cal}<div class="side"><div class="meters">${axes}</div>${money}${comp}${ruleP}<ul class="why">${plan.reasons.map((r) => `<li>${r}</li>`).join('')}</ul></div></article>`;
}

let turn = 0;
async function update() {
  if (!state.data) return;
  const mine = ++turn;
  document.querySelectorAll('#scenario button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.sc === state.scenario));
  $('scnote').textContent = L(`sc.note.${state.scenario}`);
  highlightMap();
  const id = $('canton').value;
  let climate;
  try { climate = await climateOf(id); } catch (e) {
    if (mine !== turn) return;
    setStatus(L('status.noData', { err: e.message }), 'bad');
    $('plans').innerHTML = ''; $('chart').innerHTML = ''; return;
  }
  if (mine !== turn) return;
  let sc;
  try { sc = buildScenarios(climate, state.data.enso); } catch (e) { setStatus(e.message, 'bad'); return; }
  const m = sc.meta;
  const shares = state.data.summary && (state.data.summary.cantons_per_cell || []).find((g) => g.includes(climate.name) && g.length > 1);
  const offline = navigator.onLine === false ? ` ${L('status.offline')}` : '';
  setStatus(L('status.ok', { live: climate.origin === 'live', from: m.from, to: m.to, n: m.completeMonths, shares: shares ? shares.filter((x) => x !== climate.name).join(', ') : '' }) + offline, 'ok');
  $('climtitle').textContent = L('clim.titleFull', { name: climate.name, mm: Math.round(sc.scenarios.normal.monthly.reduce((s, x) => s + x.P, 0)) });
  chart(sc.scenarios);

  const crops = state.data.crops;
  const r = recommend({
    crops, scenarios: sc.scenarios, planScenarios: PLAN_SCENARIOS[state.scenario], farm: farm(),
    priorities: { soil: +$('soil').value, water: +$('water').value, risk: +$('risk').value, income: +$('income').value },
  });
  state.last = { ...r, crops };
  const today = new Date();
  const year0 = today.getMonth() >= 8 ? today.getFullYear() + 1 : today.getFullYear();
  $('printmeta').textContent = L('print.meta', { canton: climate.name, scenario: L(`sc.${state.scenario}`), from: m.from, to: m.to, date: today.toISOString().slice(0, 10) });
  $('notices').innerHTML = r.notices.map((a) => `<li>${a}</li>`).join('');
  $('plans').innerHTML = (r.plans.length ? r.plans.map((p, i) => card(L('plan.title', { letter: 'ABC'[i] }), p, crops, year0, false, r.base)).join('')
    : `<p class="flag bad">${L('plan.none')}</p>`) + card(L('plan.base'), r.base, crops, year0, true)
    + (r.money ? `<p class="note">${L('plan.marginNote')}</p>` : '');
}

function dataTab() {
  const { summary, enso, crops, soil } = state.data;
  const rows = [
    [L('data.climate'), L('data.climateSrc'), summary ? L('data.generated', { date: summary.generated.slice(0, 10), start: summary.window_start }) : L('data.pending')],
    [L('data.et0'), L('data.et0Src'), L('data.monthly')],
    [L('data.enso'), enso.source, enso.automatic ? L('data.auto') : L('data.fallback')],
    [L('data.soil'), soil ? soil.source : L('data.soilPending'), L('data.soilWhen')],
    [L('data.money'), L('data.moneySrc'), L('data.moneyStatus')],
    [L('data.ranges'), L('data.rangesSrc'), L('data.rangesStatus')],
  ];
  $('datainfo').innerHTML = `<div class="table"><table><thead><tr><th>${L('data.what')}</th><th>${L('data.source')}</th><th>${L('data.status')}</th></tr></thead><tbody>${rows.map((f) => `<tr>${f.map((x) => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const cols = ['name', 'seasons', 'cycle_days', 'ph_min', 'ph_max', 'kc_season', 'drought_tolerance', 'n_supply_kg_ha', 'yield_t_ha', 'price_crc_kg', 'production_cost_crc_ha', 'economic_confidence'];
  const heads = L('data.heads');
  const cellOf = (c, k) => {
    if (k === 'name') return cropName(c);
    if (k === 'seasons' && Array.isArray(c.seasons)) return c.seasons.map((s) => seasonText(s)?.name || s).join(', ');
    if (k === 'production_cost_crc_ha' && c[k] != null) return crc(c[k]);
    return Array.isArray(c[k]) ? c[k].join(', ') : c[k] ?? '—';
  };
  $('croptable').innerHTML = `<thead><tr>${heads.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${crops.map((c) => `<tr>${cols.map((k) => `<td>${cellOf(c, k)}</td>`).join('')}</tr>`).join('')}</tbody>`;
}

// Offline: after the first visit, the page and the data of the cantons opened stay on the device.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => { /* optional */ }); });
}

start();
