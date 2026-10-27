// app.js — Iriria Sìsù interface. Loads the data, calls the engine and draws the plans.
// The visit is a short journey: welcome cover → 4 steps → three plans to tap → the chosen plan and how to keep it.
import { SEASONS, buildScenarios, powerUrl, processPowerDaily } from './climate.js';
import { recommend, cropsForCanton } from './engine.js';
import { t, cropName, seasonText, monthNames, monthFull, crc } from './strings.js';
import { icon, paintIcons } from './icons.js';
import { choices, syncChoices } from './choices.js';

const $ = (id) => document.getElementById(id);
const pct = (x) => Math.round(x * 100);
const GROUP_KEYS = ['gram', 'leg', 'cuc', 'cover', 'none'];
const GROUP_ICON = { gram: 'wheat', leg: 'bean', cuc: 'citrus', cover: 'sprout', none: 'circle-dashed' };
const AXES = [['soil', 'sprout'], ['water', 'droplet'], ['risk', 'shield-check'], ['income', 'coins']];
const STEPS = 4;
const PLAN_SCENARIOS = {
  forecast: ['el_nino', 'el_nino', ...Array(7).fill('normal')],
  normal: Array(9).fill('normal'), el_nino: Array(9).fill('el_nino'), worst: Array(9).fill('worst'),
};
const FIELDS = ['canton', 'current', 'irrigation', 'texture', 'ph', 'slope', 'om', 'soil', 'water', 'risk', 'income', 'maxloss'];

const state = {
  scenario: 'forecast', climate: {}, data: null, map: null, markers: {}, lastScenarios: null, last: null,
  step: 0, revealed: false, sel: null, chosen: null, chartView: null, climateName: '', cropCanton: null,
};
const L = t;
const MONTH_FULL = monthFull();

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
  document.querySelectorAll('[data-html]').forEach((el) => { el.innerHTML = L(el.dataset.html); });
  dataTab();
}

const cantonName = () => (state.data.points.find((p) => p.id === $('canton').value) || {}).name || '';
const shortName = (name) => name.replace(/\s*\(.*\)$/, '');

/**
 * Rebuilds the "what do you plant today" cards with only the crops grown in the chosen canton
 * (catalog column "cantons"). If today's crop is not grown there, another one is picked and the farmer is told.
 */
function refreshCrops(prefer = null) {
  const canton = $('canton').value;
  if (state.cropCanton === canton && !prefer) return;
  const first = state.cropCanton == null;
  state.cropCanton = canton;
  const list = cropsForCanton(state.data.crops, canton).filter((c) => c.group !== 'cover');
  const keep = prefer || $('current').value || 'rice';
  const keepCrop = state.data.crops.find((c) => c.id === keep);
  $('current').innerHTML = list.map((c) => `<option value="${c.id}" data-art="ic:${GROUP_ICON[c.group] || 'leaf'}" data-tone="var(--g-${c.group})">${c.group === 'none' ? L('crop.nothing') : shortName(cropName(c))}</option>`).join('');
  const fits = list.some((c) => c.id === keep);
  $('current').value = fits ? keep : list[0].id;
  choices($('current'), 'cards');
  const name = shortName(cantonName());
  $('croplabel').textContent = L('crop.inCanton', { canton: name });
  $('cropnote').textContent = !fits && !first && keepCrop && keepCrop.group !== 'none' ? L('crop.moved', { crop: shortName(cropName(keepCrop)), canton: name }) : '';
}

// ------------------------------------------------------------------ loading
async function start() {
  paintIcons();
  wireJourney();
  try {
    const [points, crops, enso, summary, soil] = await Promise.all([
      json('data/guanacaste/points.json'), json('data/crops.json'), json('data/enso.json'),
      json('data/guanacaste/summary.json', true), json('data/guanacaste/soil_reference.json', true),
    ]);
    state.data = { points: points.points, crops: crops.crops, enso, summary, soil };
  } catch (e) { setStatus(e.message, 'bad'); $('next').disabled = true; return; }

  $('canton').innerHTML = state.data.points.map((p) => {
    const sub = (p.name.match(/\((.*)\)/) || [])[1];
    return `<option value="${p.id}"${sub ? ` data-sub="${sub}"` : ''}>${shortName(p.name)}</option>`;
  }).join('');
  $('canton').value = 'liberia';
  fillLists();
  choices($('canton'), 'grid');
  ['irrigation', 'texture', 'slope', 'om'].forEach((id) => choices($(id), 'cards'));
  choices($('maxloss'), 'pills');
  refreshCrops();
  const shared = readUrl();
  tabs();
  drawMap();
  wire();
  goStep(0);
  if (shared) { enterApp(); reveal(false); }
  await update();
}

/** Applies a shared link. Returns true when the link carries answers (then the cover is skipped). */
function readUrl() {
  const q = new URLSearchParams(location.search);
  FIELDS.forEach((k) => {
    const v = q.get(k);
    if (k === 'current') { refreshCrops(v); return; }
    if (v != null && $(k)) $(k).value = v;
  });
  // pH starts as "I don't know" unless the link says otherwise. Older links carried a pH but no flag: that pH was the user's.
  if (q.has('phunknown')) $('phunknown').checked = q.get('phunknown') === '1';
  else if (q.has('ph')) $('phunknown').checked = false;
  if (q.get('scenario') && PLAN_SCENARIOS[q.get('scenario')]) state.scenario = q.get('scenario');
  syncChoices();
  ['soil', 'water', 'risk', 'income'].forEach((k) => { $(`o-${k}`).textContent = $(k).value; });
  const plan = q.get('plan');
  if (plan === 'base') state.sel = 'base';
  else if (/^[ABC]$/.test(plan || '')) state.sel = 'ABC'.indexOf(plan);
  return FIELDS.some((k) => q.has(k));
}

function currentLink() {
  const q = new URLSearchParams();
  FIELDS.forEach((k) => q.set(k, $(k).value));
  q.set('phunknown', $('phunknown').checked ? '1' : '0');
  q.set('scenario', state.scenario);
  const sel = state.chosen ?? state.sel;
  if (sel != null) q.set('plan', sel === 'base' ? 'base' : 'ABC'[sel]);
  return `${location.origin}${location.pathname}?${q}`;
}

// ------------------------------------------------------------------ journey
function enterApp() {
  $('cover').hidden = true;
  $('app').hidden = false;
  window.scrollTo(0, 0);
  if (state.map) setTimeout(() => state.map.invalidateSize(), 60);
}

function wireJourney() {
  $('start').addEventListener('click', () => { enterApp(); $('canton').focus({ preventScroll: true }); });
  $('home').addEventListener('click', () => { $('app').hidden = true; $('cover').hidden = false; window.scrollTo(0, 0); });
}

function goStep(n) {
  state.step = Math.max(0, Math.min(STEPS - 1, n));
  document.querySelectorAll('#form .step').forEach((f) => { f.hidden = +f.dataset.step !== state.step; });
  document.querySelectorAll('#stepper li').forEach((li, i) => {
    li.classList.toggle('on', i === state.step);
    li.classList.toggle('done', i < state.step || (state.revealed && i !== state.step));
    li.querySelector('button').setAttribute('aria-current', i === state.step ? 'step' : 'false');
  });
  $('stepcount').textContent = L('step.count', { n: state.step + 1, of: STEPS });
  $('back').disabled = state.step === 0;
  const last = state.step === STEPS - 1;
  $('next').innerHTML = last
    ? `<span>${L(state.revealed ? 'step.update' : 'step.see')}</span>${icon('sparkles')}`
    : `<span>${L('step.next')}</span>${icon('arrow-right')}`;
  if (state.step === 0 && state.map) setTimeout(() => state.map.invalidateSize(), 60);
}

function reveal(scroll = true) {
  state.revealed = true;
  $('results').hidden = false;
  goStep(state.step);
  if (scroll) $('results').scrollIntoView({ block: 'start' });
}

function choose(sel) {
  state.chosen = sel;
  renderDone();
  showTab('done');
  window.scrollTo(0, 0);
}

// ------------------------------------------------------------------ tabs
let showTab = () => {};
function tabs() {
  const buttons = [...document.querySelectorAll('.tabs button')];
  const panels = ['tool', 'how', 'data', 'done'];
  showTab = (tab) => {
    if (!panels.includes(tab) || (tab === 'done' && state.chosen == null)) tab = 'tool';
    panels.forEach((p) => { $(`p-${p}`).hidden = p !== tab; });
    buttons.forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === (tab === 'done' ? 'tool' : tab)));
    if (tab === 'tool' && state.map) setTimeout(() => state.map.invalidateSize(), 50);
  };
  buttons.forEach((b) => b.addEventListener('click', () => {
    showTab(b.dataset.tab);
    if ((location.hash || '') !== `#${b.dataset.tab}`) { try { history.replaceState(null, '', `${location.search}#${b.dataset.tab}`); } catch (e) { /* preview frames */ } }
  }));
  const h = (location.hash || '').slice(1);
  showTab(h || 'tool');
  if (h === 'how' || h === 'data') enterApp();
}

function drawMap() {
  if (!window.L || !$('map')) return; // no internet or no Leaflet: the list still works
  const m = window.L.map('map', { scrollWheelZoom: false, attributionControl: true }).setView([10.5, -85.35], 8);
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 12, attribution: '© OpenStreetMap' }).addTo(m);
  for (const p of state.data.points) {
    state.markers[p.id] = window.L.circleMarker([p.lat, p.lon], { radius: 7, weight: 2, color: '#0a4a46', fillColor: '#d0d959', fillOpacity: 0.5 })
      .addTo(m).bindTooltip(p.name).on('click', () => { $('canton').value = p.id; update(); });
  }
  state.map = m;
}

function highlightMap() {
  for (const [id, mk] of Object.entries(state.markers)) mk.setStyle({ fillOpacity: id === $('canton').value ? 1 : 0.35, radius: id === $('canton').value ? 11 : 7 });
}

function wire() {
  $('form').addEventListener('input', (e) => {
    if (e.target.type === 'range') $(`o-${e.target.id}`).textContent = e.target.value;
    update();
  });
  $('next').addEventListener('click', () => {
    if (state.step < STEPS - 1) { goStep(state.step + 1); $('wizard').scrollIntoView({ block: 'start' }); } else reveal();
  });
  $('back').addEventListener('click', () => goStep(state.step - 1));
  $('phbox').addEventListener('click', (e) => {
    const b = e.target.closest('[data-ph]');
    if (!b) return;
    const v = Math.min(9.5, Math.max(3.5, (parseFloat($('ph').value) || 6) + +b.dataset.ph));
    $('phunknown').checked = false;
    $('ph').value = v.toFixed(1);
    $('form').dispatchEvent(new Event('input'));
  });
  document.querySelectorAll('#stepper button').forEach((b) => b.addEventListener('click', () => goStep(+b.dataset.go)));
  $('farmbar').addEventListener('click', (e) => { if (e.target.closest('#edit')) { goStep(0); $('wizard').scrollIntoView({ block: 'start' }); } });
  document.querySelectorAll('#scenario button').forEach((b) => b.addEventListener('click', () => { state.scenario = b.dataset.sc; state.chartView = null; update(); }));
  document.querySelectorAll('#chartview button').forEach((b) => b.addEventListener('click', () => { state.chartView = b.dataset.cv; if (state.lastScenarios) chart(state.lastScenarios); }));
  $('earnchart').addEventListener('click', (e) => { const b = e.target.closest('[data-sel]'); if (!b) return; state.sel = b.dataset.sel === 'base' ? 'base' : +b.dataset.sel; renderPlans(); $('plan').firstElementChild?.scrollIntoView({ block: 'start' }); });
  $('climate').addEventListener('toggle', () => { if ($('climate').open && state.lastScenarios) chart(state.lastScenarios); });
  $('picker').addEventListener('click', (e) => {
    const b = e.target.closest('[data-sel]');
    if (!b) return;
    state.sel = b.dataset.sel === 'base' ? 'base' : +b.dataset.sel;
    renderPlans();
    $('plan').firstElementChild?.scrollIntoView({ block: 'start' });
  });
  $('plan').addEventListener('click', (e) => { if (e.target.closest('[data-choose]')) choose(state.sel); });
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
  $('again').addEventListener('click', () => { showTab('tool'); $('picker').scrollIntoView({ block: 'center' }); });
  $('restart').addEventListener('click', () => {
    state.chosen = null; state.sel = null; state.revealed = false;
    $('results').hidden = true;
    try { history.replaceState(null, '', location.pathname); } catch (e) { /* preview frames */ }
    showTab('tool'); goStep(0); window.scrollTo(0, 0); renderPlans();
  });
  let timer = null;
  window.addEventListener('resize', () => { clearTimeout(timer); timer = setTimeout(() => { if (state.lastScenarios) chart(state.lastScenarios); earnChart(); }, 150); });
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
}

/** The plan object for a selection: 0-2 for plans A-C, 'base' for "what you plant today". */
function planOf(sel) {
  if (!state.last || sel == null) return null;
  return sel === 'base' ? state.last.base : state.last.plans[sel] || null;
}
const planTitle = (sel) => (sel === 'base' ? L('plan.base') : L('plan.title', { letter: 'ABC'[sel] }));

function whatsappText() {
  if (!state.last) return '';
  const sel = state.chosen ?? state.sel ?? (state.last.plans.length ? 0 : 'base');
  const p = planOf(sel) || state.last.base;
  const { crops } = state.last;
  const seq = p.sequence.map((k) => (crops[k].group === 'none' ? L('cell.fallow') : cropName(crops[k])));
  const years = [0, 1, 2].map((a) => `${a + 1}: ${seq.slice(a * 3, a * 3 + 3).join(' → ')}`).join(' | ');
  return L('wa.text', {
    canton: $('canton').selectedOptions[0]?.textContent || '', scenario: L(`sc.${state.scenario}`),
    plan: planTitle(sel), seq: years, score: pct(p.scores.total), margin: p.scores.margin, link: currentLink(),
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

/** Puts the marker on the acid → alkaline bar and greys out the stepper when the pH is unknown. */
function phScale() {
  const unknown = $('phunknown').checked;
  $('phbox').classList.toggle('off', unknown);
  const v = parseFloat($('ph').value) || 6;
  $('phmark').style.left = `${Math.min(100, Math.max(0, ((v - 3.5) / 6) * 100))}%`;
  $('phmark').hidden = unknown;
}

// ------------------------------------------------------------------ drawing
// Which year the climate chart shows follows the scenario buttons until the farmer picks one on the chart itself.
const CHART_OF = { forecast: 'el_nino', normal: 'normal', el_nino: 'el_nino', worst: 'worst' };
const fmt = (x) => Math.round(x).toLocaleString('en-US');

/** "Water in vs water out": one column of rain per month, coloured by whether it covers what crops need (ET0). */
function chart(sc) {
  state.lastScenarios = sc;
  const view = state.chartView || CHART_OF[state.scenario];
  document.querySelectorAll('#chartview button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.cv === view));
  const ms = sc[view].monthly, normal = sc.normal.monthly;
  const months = monthNames(), full = MONTH_FULL;
  const name = state.climateName || '';
  const total = ms.reduce((s, m) => s + m.P, 0), totalN = normal.reduce((s, m) => s + m.P, 0);
  const short = ms.map((m) => m.P < m.ET0);
  const nShort = short.filter(Boolean).length;
  const worst = ms.reduce((w, m, i) => (m.P - m.ET0 < ms[w].P - ms[w].ET0 ? i : w), 0);
  const change = view === 'normal' ? null : Math.round(((total - totalN) / totalN) * 100);

  $('climtiles').innerHTML = `<div class="tile"><small>${icon('cloud-rain')}${L('ch.tileRain')}</small><b>${fmt(total)} <span>mm</span></b>${change != null ? `<span class="delta">${L('ch.vsNormal', { change })}</span>` : `<span class="delta">${L('ch.normalNote')}</span>`}</div>`
    + `<div class="tile"><small>${icon('sun')}${L('ch.tileDry')}</small><b>${nShort} <span>${L('ch.of12')}</span></b><div class="dots" aria-hidden="true">${short.map((s) => `<i class="${s ? 'short' : ''}"></i>`).join('')}</div></div>`
    + `<div class="tile"><small>${icon('triangle-alert')}${L('ch.tileHard')}</small><b>${full[worst]}</b><span class="delta">${L('ch.hardNote', { p: fmt(ms[worst].P), e: fmt(ms[worst].ET0) })}</span></div>`;

  const box = $('chart');
  const W = Math.round(Math.max(300, Math.min(900, box.clientWidth || 680)));
  const H = W < 480 ? 240 : 270, Lm = 40, R = 8, T = 30, B = 26, pw = W - Lm - R, ph = H - T - B;
  const top = Math.max(100, Math.ceil(Math.max(...ms.map((m) => Math.max(m.P, m.ET0)), ...normal.map((m) => m.P)) / 100) * 100);
  const y = (v) => T + ph - (v / top) * ph, bw = pw / 12, cw = Math.min(24, bw - 8);
  const label = (m) => (bw < 34 ? m.charAt(0) : m);
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px" role="img" aria-label="${L('ch.aria', { view: L(`ch.view.${view}`), name })}">`;
  // the dry season gets a faint band so the two rainy seasons stand out
  s += `<rect x="${Lm}" y="${T}" width="${bw * 4}" height="${ph}" fill="var(--sunk)" opacity=".6"/>`;
  SEASONS.forEach((se, i) => { s += `<text class="season" x="${Lm + i * 4 * bw + 2 * bw}" y="${T - 12}" text-anchor="middle">${bw * 4 < 150 ? seasonText(se.id).name : `${seasonText(se.id).name} · ${seasonText(se.id).range}`}</text>`; });
  for (let k = 0; k <= 4; k++) { const v = (top * k) / 4; s += `<line x1="${Lm}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="1"/><text x="${Lm - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`; }
  s += `<text x="${Lm - 6}" y="${T - 12}" text-anchor="end">mm</text>`;
  ms.forEach((m, i) => {
    const cx = Lm + i * bw + bw / 2, x = cx - cw / 2, h = Math.max(0, T + ph - y(m.P)), r = Math.min(4, h);
    const col = short[i] ? 'var(--water-short)' : 'var(--water-ok)';
    // column with a 4px rounded top, square at the baseline
    if (h > 0) s += `<path d="M${x},${T + ph} V${T + ph - h + r} Q${x},${T + ph - h} ${x + r},${T + ph - h} H${x + cw - r} Q${x + cw},${T + ph - h} ${x + cw},${T + ph - h + r} V${T + ph} Z" fill="${col}" ${m.filled ? 'opacity=".45"' : ''}/>`;
    s += `<line class="need" x1="${cx - cw / 2 - 4}" x2="${cx + cw / 2 + 4}" y1="${y(m.ET0)}" y2="${y(m.ET0)}"/>`;
    s += `<text x="${cx}" y="${H - 8}" text-anchor="middle">${label(months[i])}</text>`;
    s += `<rect class="hit" data-i="${i}" x="${Lm + i * bw}" y="${T}" width="${bw}" height="${ph}" tabindex="0" role="img" aria-label="${L('ch.tipAria', { m: full[i], p: fmt(m.P), e: fmt(m.ET0), ok: !short[i] })}"/>`;
  });
  s += `<line x1="${Lm}" x2="${W - R}" y1="${T + ph}" y2="${T + ph}" stroke="var(--muted)" stroke-width="1"/></svg><div class="tip" id="tip" role="presentation"></div>`;
  box.innerHTML = s;
  $('chartnote').textContent = ms.some((m) => m.filled) ? L('ch.fadedNote') : '';

  const tip = $('tip');
  const showTip = (el) => {
    const i = +el.dataset.i, m = ms[i];
    tip.innerHTML = '';
    const row = (k, txt, val) => { const d = document.createElement('div'); d.className = 't-r'; const key = document.createElement('i'); key.className = 'k'; key.style.background = k; const sp = document.createElement('span'); sp.textContent = txt; const b = document.createElement('b'); b.textContent = val; d.append(key, sp, b); return d; };
    const h = document.createElement('div'); h.className = 't-h'; h.textContent = full[i];
    const v = document.createElement('div'); v.className = 't-v';
    v.textContent = short[i] ? L('ch.tipShort', { mm: fmt(m.ET0 - m.P) }) : L('ch.tipOk', { mm: fmt(m.P - m.ET0) });
    tip.append(h, row(short[i] ? 'var(--water-short)' : 'var(--water-ok)', L('ch.rain'), `${fmt(m.P)} mm`), row('var(--et)', L('ch.need'), `${fmt(m.ET0)} mm`), v);
    if (m.filled) { const f = document.createElement('div'); f.className = 'note'; f.textContent = L('ch.filled'); tip.append(f); }
    tip.classList.add('on');
    const bx = box.getBoundingClientRect(), r = el.getBoundingClientRect();
    const left = Math.min(Math.max(0, r.left - bx.left + r.width / 2 - tip.offsetWidth / 2), box.clientWidth - tip.offsetWidth);
    tip.style.left = `${left}px`; tip.style.top = `${Math.max(0, r.top - bx.top + 8)}px`;
  };
  box.querySelectorAll('.hit').forEach((el) => {
    el.addEventListener('pointerenter', () => showTip(el)); el.addEventListener('focus', () => showTip(el));
    el.addEventListener('click', () => showTip(el));
    el.addEventListener('pointerleave', () => tip.classList.remove('on')); el.addEventListener('blur', () => tip.classList.remove('on'));
  });

  $('climtable').innerHTML = `<table><thead><tr><th>${L('ch.month')}</th><th>${L('ch.rain')} (mm)</th><th>${L('ch.need')} (mm)</th><th>${L('ch.enough')}</th></tr></thead><tbody>${ms.map((m, i) => `<tr><td>${full[i]}</td><td>${fmt(m.P)}</td><td>${fmt(m.ET0)}</td><td>${short[i] ? L('ch.no') : L('ch.yes')}</td></tr>`).join('')}</tbody></table>`;
}

/** Horizontal bars of the 3-year margin of each plan and of "today", with a zero line. */
function earnChart() {
  const box = $('earnchart');
  if (!state.last || !state.last.money) { $('earn').hidden = true; return; }
  const { plans, base } = state.last;
  const rows = [...plans.map((p, i) => [i, p]), ['base', base]].filter(([, p]) => p.scores.margin != null);
  if (!rows.length) { $('earn').hidden = true; return; }
  $('earn').hidden = false;
  const vals = rows.map(([, p]) => p.scores.margin);
  const lo = Math.min(0, ...vals), hi = Math.max(0, ...vals), span = hi - lo || 1;
  // leave room for the amount label beyond each bar end
  const pad = window.matchMedia('(max-width: 560px)').matches ? 0.02 : 0.28, x = (v) => ((v - lo) / span) * (1 - pad) * 100 + (lo < 0 ? pad * 50 : 0);
  const z = x(0);
  box.innerHTML = rows.map(([sel, p]) => {
    const v = p.scores.margin, a = x(Math.min(0, v)), b = x(Math.max(0, v));
    const pos = v >= 0;
    const amt = pos ? `left:calc(${b}% + 6px)` : `right:calc(${100 - a}% + 6px)`;
    return `<button type="button" class="ebar" data-sel="${sel}" aria-pressed="${state.sel === sel}"><span class="nm">${sel === 'base' ? L('orb.today') : planTitle(sel)}</span>`
      + `<span class="track"><span class="bar ${pos ? 'pos' : 'neg'}" style="left:${a}%;width:${Math.max(0.5, b - a)}%"></span><span class="zero" style="left:${z}%"></span><span class="amt" style="${amt}">${crc(v)}</span></span><span class="amt2">${crc(v)}</span></button>`;
  }).join('');
}

function reasonIcon(r) {
  if (/^Weak spot|^Same crop family| loses about /.test(r)) return 'triangle-alert';
  if (/legume|Nitrogen/i.test(r)) return 'bean';
  if (/irrigation/i.test(r)) return 'droplet';
  if (/ran out of water/.test(r)) return 'shield-check';
  if (/urea/.test(r)) return 'coins';
  if (/points above/.test(r)) return 'sparkles';
  return 'leaf';
}

function calendar(plan, crops, year0) {
  const sc = plan.scores;
  const st = (id) => seasonText(id);
  let cal = `<div class="cal"><span class="h"></span>${SEASONS.map((e) => `<span class="h" title="${st(e.id).hint}">${st(e.id).name}<br>${st(e.id).range}</span>`).join('')}`;
  for (let a = 0; a < 3; a++) {
    cal += `<span class="h y">${year0 + a}</span>`;
    for (let e = 0; e < 3; e++) {
      const i = a * 3 + e, c = crops[plan.sequence[i]], d = sc.detail[i];
      const name = c.group === 'none' ? L('cell.fallow') : cropName(c);
      const short = d.prob != null && d.n ? Math.round(d.prob * d.n) : null;
      const planted = c.group !== 'none';
      // The cell shows only the crop and two small signs; the numbers live in the tooltip.
      const tip = planted ? L('cell.tip', { name, fit: pct(d.suit), irr: d.irrigation > 5 ? Math.round(d.irrigation) : 0, short: short ? `${short}/${d.n}` : '', money: d.margin != null ? crc(d.margin) : '' }) : name;
      const signs = planted ? `${d.irrigation > 5 ? `<i class="sg irr" title="${L('cell.irrigation', { mm: Math.round(d.irrigation) })}">${icon('droplet')}</i>` : ''}${short ? `<i class="sg warn" title="${L('cell.short', { k: short, n: d.n })}">${icon('triangle-alert')}</i>` : ''}` : '';
      cal += `<div class="cell" style="background:var(--g-${c.group})" title="${tip}"><span class="gi">${icon(GROUP_ICON[c.group] || 'leaf')}</span><b>${name}</b>${signs ? `<span class="signs">${signs}</span>` : ''}</div>`;
    }
  }
  return `${cal}</div>`;
}

const famLegend = () => `<div class="famleg">${GROUP_KEYS.map((k) => `<span><i style="background:var(--g-${k})">${icon(GROUP_ICON[k])}</i>${L(`group.${k}`)}</span>`).join('')}</div>`;

/** The full card of one plan: header, axes, money, normal vs El Niño, the 3-year calendar and the reasons. */
function detail(sel, plan, crops, year0, base, { choose: withChoose = true } = {}) {
  const sc = plan.scores, isBase = sel === 'base';
  const axes = AXES.map(([k, ic]) => `<div class="axis"><div class="axis-top"><i class="chip-ic ${k}">${icon(ic)}</i>${L(`axis.${k}`)}<b>${pct(sc[k])}</b></div><div class="meter"><i style="width:${pct(sc[k])}%"></i></div></div>`).join('');
  let badge = '';
  if (plan.robust) badge = `<span class="badge" title="${L('badge.robustRule')}">${icon('shield-check')}${L('badge.robust')}</span>`;
  else if (!isBase && plan.comparison) badge = `<span class="badge warn" title="${L('badge.sensitiveRule')}">${icon('thermometer-sun')}${L('badge.sensitive')}</span>`;
  let money = '';
  if (sc.margin != null) {
    const diff = !isBase && base && base.scores.margin != null ? sc.margin - base.scores.margin : null;
    money = `<div class="money"><small>${L('money.label')}</small><b>${crc(sc.margin)}</b><span>${L('money.per')}${diff != null ? ` · <span class="${diff >= 0 ? 'up' : 'down'}">${diff >= 0 ? '+' : '−'}${crc(Math.abs(diff))} ${L('money.vsToday')}</span>` : ''}</span></div>`;
  }
  const years = plan.comparison ? `<div class="years"><div>${icon('cloud-rain')}${L('years.normal')}<b>${pct(plan.comparison.normal)}</b></div><div>${icon('thermometer-sun')}${L('years.nino')}<b>${pct(plan.comparison.el_nino)}</b></div></div>` : '';
  // Warnings first, then three reasons in view; the rest wait behind "n more".
  const warn = (r) => reasonIcon(r) === 'triangle-alert';
  const rs = [...plan.reasons].sort((a, b) => warn(b) - warn(a));
  const li = (r) => `<li class="${warn(r) ? 'w' : ''}">${icon(reasonIcon(r))}<span>${r}</span></li>`;
  const more = rs.length > 3 ? `<details class="more"><summary>${L('why.more', { n: rs.length - 3 })}</summary><ul class="why">${rs.slice(3).map(li).join('')}</ul></details>` : '';
  const why = `<div class="why-box"><h4>${icon('leaf')}${L('why.title')}</h4><ul class="why">${rs.slice(0, 3).map(li).join('')}</ul>${more}</div>`;
  const pick = withChoose ? `<div class="choose"><button type="button" class="btn big" data-choose>${icon('circle-check')}<span>${L(isBase ? 'plan.keep' : 'plan.choose')}</span></button></div>` : '';
  return `<article class="plan card${isBase ? ' base' : ''}"><header><h3>${planTitle(sel)}</h3><div>${badge}<span class="total"><b>${pct(sc.total)}</b> / 100 · ${L('plan.relative')}</span></div></header>`
    + `<div class="side"><div class="axes">${axes}</div>${money}${years}</div>`
    + `<div class="cal-wrap">${calendar(plan, crops, year0)}${famLegend()}</div>${why}${pick}</article>`;
}

function orb(sel, plan) {
  const isBase = sel === 'base', on = state.sel === sel;
  const cap = isBase ? '' : plan.robust ? `<span class="cap robust">${icon('shield-check')}${L('badge.robustShort')}</span>`
    : plan.comparison ? `<span class="cap">${icon('thermometer-sun')}${L('badge.sensitiveShort')}</span>` : '';
  return `<button type="button" class="orb${isBase ? ' base' : ''}" role="tab" aria-selected="${on}" data-sel="${sel}" style="--p:${pct(plan.scores.total)}" aria-label="${planTitle(sel)}, ${pct(plan.scores.total)} / 100">`
    + `<span class="ring"><span class="face"><span class="letter">${isBase ? L('orb.today') : 'ABC'[sel]}</span><span class="score">${pct(plan.scores.total)}</span></span></span>${cap}</button>`;
}

const year0Now = () => { const d = new Date(); return d.getMonth() >= 8 ? d.getFullYear() + 1 : d.getFullYear(); };

function renderPlans() {
  if (!state.last) return;
  const { plans, base, crops } = state.last;
  if (typeof state.sel === 'number' && !plans[state.sel]) state.sel = plans.length ? 0 : 'base';
  $('picker').innerHTML = plans.map((p, i) => orb(i, p)).join('') + orb('base', base);
  earnChart();
  const p = planOf(state.sel);
  $('plan').innerHTML = p ? detail(state.sel, p, crops, year0Now(), base) : (plans.length ? '' : `<p class="flag bad">${L('plan.none')}</p>`);
}

function renderFarmbar() {
  const opt = (id) => $(id).selectedOptions[0]?.textContent.replace(/\s*\(.*\)$/, '') || '';
  $('farmbar').innerHTML = [['map-pin', opt('canton')], ['wheat', opt('current')], ['droplet', `${L('farm.irr')}: ${opt('irrigation')}`], ['shovel', opt('texture')]]
    .map(([ic, txt]) => `<span class="tag">${icon(ic)}${txt}</span>`).join('')
    + `<button type="button" class="btn ghost" id="edit">${icon('pencil')}<span>${L('farm.edit')}</span></button>`;
}

function renderDone() {
  if (!state.last || state.chosen == null) return;
  const p = planOf(state.chosen) || state.last.base;
  const { crops, base } = state.last;
  const y0 = year0Now();
  const seq = [0, 1, 2].map((a) => `<div><em>${y0 + a}</em>${[0, 1, 2].map((e) => {
    const c = crops[p.sequence[a * 3 + e]];
    return `<span style="background:var(--g-${c.group})">${c.group === 'none' ? L('cell.fallow') : cropName(c)}</span>`;
  }).join('')}</div>`).join('');
  $('donePlan').innerHTML = `<div class="dp-head"><b>${planTitle(state.chosen)}</b><span class="total"><b>${pct(p.scores.total)}</b> / 100${p.scores.margin != null ? ` · ${crc(p.scores.margin)} ${L('money.short')}` : ''}</span></div><div class="seq">${seq}</div>`;
  $('printout').innerHTML = `<p class="p-meta">${$('printmeta').textContent}</p>${detail(state.chosen, p, crops, y0, base, { choose: false })}<p class="p-take">${L('print.take')}</p><p class="p-meta">${L('plan.marginNote')}</p>`;
}

let turn = 0;
async function update() {
  if (!state.data) return;
  const mine = ++turn;
  document.querySelectorAll('#scenario button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.sc === state.scenario));
  $('scnote').textContent = L(`sc.note.${state.scenario}`);
  refreshCrops();
  syncChoices();
  phScale();
  highlightMap();
  renderFarmbar();
  const id = $('canton').value;
  let climate;
  try { climate = await climateOf(id); } catch (e) {
    if (mine !== turn) return;
    setStatus(L('status.noData', { err: e.message }), 'bad');
    $('climate').open = true;
    $('plan').innerHTML = ''; $('picker').innerHTML = ''; $('chart').innerHTML = ''; return;
  }
  if (mine !== turn) return;
  let sc;
  try { sc = buildScenarios(climate, state.data.enso); } catch (e) { setStatus(e.message, 'bad'); return; }
  const m = sc.meta;
  const shares = state.data.summary && (state.data.summary.cantons_per_cell || []).find((g) => g.includes(climate.name) && g.length > 1);
  const offline = navigator.onLine === false ? ` ${L('status.offline')}` : '';
  setStatus(L('status.ok', { live: climate.origin === 'live', from: m.from, to: m.to, n: m.completeMonths, shares: shares ? shares.filter((x) => x !== climate.name).join(', ') : '' }) + offline, 'ok');
  $('climtitle').textContent = L('clim.titleFull', { name: climate.name, mm: Math.round(sc.scenarios.normal.monthly.reduce((s, x) => s + x.P, 0)) });
  state.climateName = climate.name;
  chart(sc.scenarios);

  const crops = cropsForCanton(state.data.crops, id);
  const r = recommend({
    crops, scenarios: sc.scenarios, planScenarios: PLAN_SCENARIOS[state.scenario], farm: farm(),
    priorities: { soil: +$('soil').value, water: +$('water').value, risk: +$('risk').value, income: +$('income').value },
  });
  state.last = { ...r, crops };
  $('printmeta').textContent = L('print.meta', { canton: climate.name, scenario: L(`sc.${state.scenario}`), from: m.from, to: m.to, date: new Date().toISOString().slice(0, 10) });
  $('notices').innerHTML = r.notices.map((a) => `<li>${a}</li>`).join('');
  $('marginnote').textContent = r.money ? L('plan.marginNote') : '';
  renderPlans();
  renderDone();
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
  const cols = ['name', 'cantons', 'seasons', 'cycle_days', 'ph_min', 'ph_max', 'kc_season', 'drought_tolerance', 'n_supply_kg_ha', 'yield_t_ha', 'price_crc_kg', 'production_cost_crc_ha', 'economic_confidence'];
  const heads = L('data.heads');
  const cellOf = (c, k) => {
    if (k === 'name') return cropName(c);
    if (k === 'cantons') return Array.isArray(c.cantons) ? c.cantons.map((id) => shortName((state.data.points.find((p) => p.id === id) || {}).name || id)).join(', ') : L('data.allCantons');
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
