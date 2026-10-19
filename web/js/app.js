// app.js — interfaz de Iriria Sìsù. Carga los datos, llama al motor y dibuja los planes.
import { EPOCAS, MESES, construirEscenarios, urlPower, procesarPowerDiario } from './clima.js';
import { recomendar } from './motor.js';

const $ = (id) => document.getElementById(id);
const pct = (x) => Math.round(x * 100);
const GRUPOS = { gram: 'Gramíneas (arroz, maíz, sorgo)', leg: 'Leguminosas', cuc: 'Cucurbitáceas (melón, sandía)', cover: 'Abono verde', none: 'Descanso' };
const NOTA_ESC = {
  pronostico: 'El IMN prevé efectos de El Niño al menos hasta julio de 2027: la seca y la primera del primer año usan el clima de los meses El Niño observados; el resto, años normales.',
  normal: 'Promedio de los meses sin El Niño desde 2021.',
  el_nino: 'Promedio de los meses El Niño observados desde 2021 (2023-24 y 2026). Ojo: El Niño 2023 casi no secó Guanacaste; el de 2026 sí.',
  peor: 'El año con menos lluvia de mayo a noviembre desde 2021.',
};
const PLAN_ESC = {
  pronostico: ['el_nino', 'el_nino', ...Array(7).fill('normal')],
  normal: Array(9).fill('normal'), el_nino: Array(9).fill('el_nino'), peor: Array(9).fill('peor'),
};

const estado = { esc: 'pronostico', clima: {}, datos: null, mapa: null, marcadores: {} };

async function json(ruta, opcional = false) {
  try {
    const r = await fetch(ruta, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    if (opcional) return null;
    throw new Error(`No se pudo cargar ${ruta} (${e.message})`);
  }
}

function setEstado(texto, tipo = '') { const f = $('estado'); f.className = `flag ${tipo}`; f.textContent = texto; }

// ------------------------------------------------------------------ carga
async function iniciar() {
  try {
    const [puntos, cultivos, enso, resumen, suelo] = await Promise.all([
      json('data/guanacaste/puntos.json'), json('data/cultivos.json'), json('data/enso.json'),
      json('data/guanacaste/resumen.json', true), json('data/guanacaste/suelo_referencia.json', true),
    ]);
    estado.datos = { puntos: puntos.puntos, cultivos: cultivos.cultivos, enso, resumen, suelo };
  } catch (e) { setEstado(e.message, 'bad'); return; }

  const { puntos, cultivos } = estado.datos;
  $('canton').innerHTML = puntos.map((p) => `<option value="${p.id}">${p.nombre}</option>`).join('');
  $('actual').innerHTML = cultivos.filter((c) => c.grupo !== 'cover')
    .map((c) => `<option value="${c.cultivo}">${c.grupo === 'none' ? 'Nada / descanso' : c.nombre}</option>`).join('');
  $('famlegend').innerHTML = Object.entries(GRUPOS).map(([k, n]) => `<span><i style="background:var(--g-${k})"></i>${n}</span>`).join('');
  leerURL();
  pestañas();
  mapa();
  datosTab();
  conectar();
  await actualizar();
}

function leerURL() {
  const q = new URLSearchParams(location.search);
  const set = (id, v) => { if (v != null && $(id)) $(id).value = v; };
  ['canton', 'actual', 'riego', 'textura', 'ph', 'pendiente', 'mo', 'suelo', 'agua', 'riesgo', 'ingreso', 'perdida'].forEach((k) => set(k, q.get(k)));
  if (q.get('phno') === '1') $('phno').checked = true;
  if (q.get('esc') && PLAN_ESC[q.get('esc')]) estado.esc = q.get('esc');
  if (!q.get('actual')) $('actual').value = 'arroz';
}

function enlaceActual() {
  const q = new URLSearchParams();
  ['canton', 'actual', 'riego', 'textura', 'ph', 'pendiente', 'mo', 'suelo', 'agua', 'riesgo', 'ingreso', 'perdida'].forEach((k) => q.set(k, $(k).value));
  if ($('phno').checked) q.set('phno', '1');
  q.set('esc', estado.esc);
  return `${location.origin}${location.pathname}?${q}`;
}

function pestañas() {
  const tabs = [...document.querySelectorAll('.tabs button')];
  const mostrar = (t) => {
    if (!$(`p-${t}`)) t = 'herramienta';
    tabs.forEach((b) => { const on = b.dataset.tab === t; b.setAttribute('aria-selected', on); $(`p-${b.dataset.tab}`).hidden = !on; });
    if (t === 'herramienta' && estado.mapa) setTimeout(() => estado.mapa.invalidateSize(), 50);
  };
  tabs.forEach((b) => b.addEventListener('click', () => { mostrar(b.dataset.tab); try { history.replaceState(null, '', `${location.search}#${b.dataset.tab}`); } catch (e) { /* vista previa */ } }));
  mostrar((location.hash || '').slice(1) || 'herramienta');
}

function mapa() {
  if (!window.L) return; // sin internet o sin Leaflet: queda el selector
  const { puntos } = estado.datos;
  const m = L.map('mapa', { scrollWheelZoom: false, attributionControl: true }).setView([10.5, -85.35], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 12, attribution: '© OpenStreetMap' }).addTo(m);
  for (const p of puntos) {
    estado.marcadores[p.id] = L.circleMarker([p.lat, p.lon], { radius: 7, weight: 2, color: '#1d7044', fillOpacity: 0.4 })
      .addTo(m).bindTooltip(p.nombre).on('click', () => { $('canton').value = p.id; actualizar(); });
  }
  estado.mapa = m;
}

function resaltarMapa() {
  for (const [id, mk] of Object.entries(estado.marcadores)) mk.setStyle({ fillOpacity: id === $('canton').value ? 0.95 : 0.3, radius: id === $('canton').value ? 10 : 7 });
}

function conectar() {
  $('form').addEventListener('input', (e) => {
    if (e.target.type === 'range') $(`o-${e.target.id}`).textContent = e.target.value;
    actualizar();
  });
  ['suelo', 'agua', 'riesgo', 'ingreso'].forEach((k) => { $(`o-${k}`).textContent = $(k).value; });
  document.querySelectorAll('#escenario button').forEach((b) => b.addEventListener('click', () => { estado.esc = b.dataset.esc; actualizar(); }));
  $('ubicacion').addEventListener('click', () => {
    if (!navigator.geolocation) { $('ubicmsg').textContent = 'Su navegador no permite ubicación.'; return; }
    $('ubicmsg').textContent = 'Buscando…';
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude: la, longitude: lo } = pos.coords;
      const d = (p) => (p.lat - la) ** 2 + ((p.lon - lo) * Math.cos(la * Math.PI / 180)) ** 2;
      const cerca = [...estado.datos.puntos].sort((a, b) => d(a) - d(b))[0];
      $('canton').value = cerca.id;
      $('ubicmsg').textContent = `Cantón más cercano: ${cerca.nombre}. Su ubicación no se guarda ni se envía.`;
      actualizar();
    }, () => { $('ubicmsg').textContent = 'No se pudo obtener la ubicación. Elija el cantón en la lista.'; }, { timeout: 10000 });
  });
  $('imprimir').addEventListener('click', () => window.print());
  $('compartir').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(enlaceActual()); $('compmsg').textContent = 'Enlace copiado.'; } catch (e) { $('compmsg').textContent = enlaceActual(); }
  });
}

// ------------------------------------------------------------------ clima
async function climaDe(id) {
  if (estado.clima[id]) return estado.clima[id];
  const pre = await json(`data/guanacaste/clima_${id}.json`, true);
  if (pre && pre.meses && pre.meses.length) return (estado.clima[id] = { ...pre, origen: 'precalculado' });
  // No está precalculado: se intenta en vivo desde el navegador.
  const p = estado.datos.puntos.find((x) => x.id === id);
  setEstado('Descargando datos de NASA POWER en vivo (puede tardar unos segundos)…');
  const fin = new Date(Date.now() - 864e5);
  const r = await fetch(urlPower(p.lat, p.lon, new Date(Date.UTC(2021, 0, 1)), fin));
  if (!r.ok) throw new Error(`NASA POWER respondió HTTP ${r.status}`);
  const proc = procesarPowerDiario(await r.json(), p.lat);
  return (estado.clima[id] = { id, nombre: p.nombre, lat: p.lat, lon: p.lon, ...proc, origen: 'en vivo' });
}

function finca() {
  const id = $('canton').value;
  const ref = estado.datos.suelo && estado.datos.suelo.puntos[id];
  let ph = $('phno').checked ? null : (parseFloat($('ph').value) || null);
  $('ph').disabled = $('phno').checked;
  let nota = '';
  if ($('phno').checked && ref && ref.phh2o) { ph = ref.phh2o; nota = `Usamos pH ${ref.phh2o} como referencia de SoilGrids (dato modelado a 250 m, no medido en su finca). Un análisis de suelo es mejor.`; }
  else if ($('phno').checked) nota = 'Sin pH no podemos descartar cultivos por acidez. Un análisis de suelo (INTA, UCR o laboratorio privado) cuesta poco y mejora mucho el resultado.';
  $('phnote').textContent = nota;
  return {
    ph, textura: $('textura').value, pendiente: $('pendiente').value, riego: $('riego').value,
    cultivo_actual: $('actual').value, materia_organica: $('mo').value || null,
    perdida_max_pct: $('perdida').value ? +$('perdida').value : null,
  };
}

// ------------------------------------------------------------------ dibujo
function grafico(esc) {
  const n = esc.normal.mensual, ni = esc.el_nino.mensual;
  const W = 680, H = 250, L = 46, R = 16, T = 24, B = 44, pw = W - L - R, ph = H - T - B;
  const max = Math.max(100, Math.ceil(Math.max(...n.map((m) => Math.max(m.P, m.ET0)), ...ni.map((m) => m.P)) / 100) * 100);
  const y = (v) => T + ph - (v / max) * ph, bw = pw / 12;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="min-width:520px;max-width:${W}px" role="img" aria-label="Lluvia mensual en años normales y El Niño, y evapotranspiración">`;
  for (let k = 0; k <= 4; k++) { const v = (max * k) / 4; s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`; }
  n.forEach((m, i) => {
    const x = L + i * bw, w = (bw - 8) / 2;
    s += `<rect x="${x + 4}" y="${y(m.P)}" width="${w}" height="${T + ph - y(m.P)}" rx="2" fill="var(--rain)"><title>${MESES[i]} normal: ${Math.round(m.P)} mm (${m.n} meses)</title></rect>`;
    const q = ni[i];
    s += `<rect x="${x + 4 + w}" y="${y(q.P)}" width="${w}" height="${T + ph - y(q.P)}" rx="2" fill="var(--rain-nino)" ${q.relleno ? 'opacity=".35"' : ''}><title>${MESES[i]} El Niño: ${Math.round(q.P)} mm${q.relleno ? ' (sin meses El Niño observados: se usa el promedio general)' : ` (${q.n} meses)`}</title></rect>`;
    s += `<text x="${x + bw / 2}" y="${H - B + 14}" text-anchor="middle">${MESES[i]}</text>`;
  });
  s += `<polyline fill="none" stroke="var(--et)" stroke-width="2" stroke-dasharray="4 3" points="${n.map((m, i) => `${L + i * bw + bw / 2},${y(m.ET0)}`).join(' ')}"/>`;
  EPOCAS.forEach((ep, i) => { const x = L + i * 4 * bw; s += `<line x1="${x + 3}" x2="${x + 4 * bw - 3}" y1="${H - 18}" y2="${H - 18}" stroke="var(--muted)" stroke-width="1.5"/><text x="${x + 2 * bw}" y="${H - 5}" text-anchor="middle">${ep.nombre}</text>`; });
  s += `<text x="${L - 6}" y="10" text-anchor="end">mm</text></svg>`;
  $('chart').innerHTML = s;
}

function tarjeta(titulo, plan, cultivos, anio0, esBase) {
  const sc = plan.puntajes;
  let cal = `<div class="cal"><span class="h"></span>${EPOCAS.map((e) => `<span class="h">${e.nombre}<br>${e.rango}</span>`).join('')}`;
  for (let a = 0; a < 3; a++) {
    cal += `<span class="h">${anio0 + a}</span>`;
    for (let e = 0; e < 3; e++) {
      const i = a * 3 + e, c = cultivos[plan.secuencia[i]], d = sc.detalle[i];
      const extra = c.grupo === 'none' ? '—' : `ajuste ${pct(d.apt)} %${d.riego > 5 ? ` · riego ${Math.round(d.riego)} mm` : ''}`;
      cal += `<div class="cell" style="background:var(--g-${c.grupo})" title="${c.nombre}${d.prob != null ? ` · el agua no alcanzó en ${pct(d.prob)} % de los años observados` : ''}"><b>${c.grupo === 'none' ? 'Descanso' : c.nombre}</b><span>${extra}</span></div>`;
    }
  }
  cal += '</div>';
  const ejes = [['Suelo', sc.suelo], ['Agua', sc.agua], ['Seguridad', sc.riesgo], ['Ingreso', sc.ingreso]]
    .map(([n, v]) => `<span>${n}</span><div class="meter"><i style="width:${pct(v)}%"></i></div><span class="v">${pct(v)}</span>`).join('');
  const badge = plan.robusto ? '<span class="badge">Plan robusto</span>' : (!esBase && plan.comparacion ? '<span class="badge warn">Sensible a El Niño</span>' : '');
  const comp = plan.comparacion ? `<p class="comp">Año normal: <b>${pct(plan.comparacion.normal)}</b> · Año El Niño: <b>${pct(plan.comparacion.el_nino)}</b></p>` : '';
  return `<article class="plan${esBase ? ' base' : ''}"><header><h3>${titulo}</h3><div>${badge}<span class="total"><b>${pct(sc.total)}</b> / 100</span></div></header>${cal}<div class="side"><div class="meters">${ejes}</div>${comp}<ul class="why">${plan.razones.map((r) => `<li>${r}</li>`).join('')}</ul></div></article>`;
}

let turno = 0;
async function actualizar() {
  const mio = ++turno;
  document.querySelectorAll('#escenario button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.esc === estado.esc));
  $('escnote').textContent = NOTA_ESC[estado.esc];
  resaltarMapa();
  const id = $('canton').value;
  let clima;
  try { clima = await climaDe(id); } catch (e) {
    if (mio !== turno) return;
    setEstado(`Todavía no hay datos NASA para este cantón y la descarga en vivo falló (${e.message}). El equipo debe correr el workflow "datos" en GitHub.`, 'bad');
    $('planes').innerHTML = ''; $('chart').innerHTML = ''; return;
  }
  if (mio !== turno) return;
  let esc;
  try { esc = construirEscenarios(clima, estado.datos.enso); } catch (e) { setEstado(e.message, 'bad'); return; }
  const m = esc.meta;
  const comparte = estado.datos.resumen && (estado.datos.resumen.cantones_por_celda || []).find((g) => g.includes(clima.nombre) && g.length > 1);
  setEstado(`Datos: NASA POWER${clima.origen === 'en vivo' ? ' (descargados ahora)' : ''}, ${m.desde} a ${m.hasta} (${m.mesesCompletos} meses). Es un dato regional de una celda de decenas de km${comparte ? `, la misma que ${comparte.filter((n) => n !== clima.nombre).join(', ')}` : ''}; su finca puede ser más seca o más húmeda.`, 'ok');
  $('climtitle').textContent = `Clima de ${clima.nombre} · ${Math.round(esc.escenarios.normal.mensual.reduce((s, x) => s + x.P, 0))} mm al año sin El Niño`;
  grafico(esc.escenarios);

  const r = recomendar({
    cultivos: estado.datos.cultivos, escenarios: esc.escenarios, planEsc: PLAN_ESC[estado.esc], finca: finca(),
    prioridades: { suelo: +$('suelo').value, agua: +$('agua').value, riesgo: +$('riesgo').value, ingreso: +$('ingreso').value },
  });
  const hoy = new Date();
  const anio0 = hoy.getMonth() >= 8 ? hoy.getFullYear() + 1 : hoy.getFullYear();
  $('avisos').innerHTML = r.avisos.map((a) => `<li>${a}</li>`).join('');
  $('planes').innerHTML = (r.planes.length ? r.planes.map((p, i) => tarjeta(`Plan ${'ABC'[i]}`, p, estado.datos.cultivos, anio0, false)).join('')
    : '<p class="flag bad">Ningún cultivo del catálogo se adapta a estas condiciones.</p>') + tarjeta('Si sigue sembrando lo de hoy', r.base, estado.datos.cultivos, anio0, true);
}

function datosTab() {
  const { resumen, enso, cultivos, suelo } = estado.datos;
  const filas = [
    ['Clima diario', 'NASA POWER (NASA Langley), API diaria, comunidad AG', resumen ? `Generado ${resumen.generado.slice(0, 10)}, desde ${resumen.ventana_inicio}` : 'Pendiente: correr el workflow "datos"'],
    ['Evapotranspiración (ET0)', 'Calculada con Hargreaves (FAO-56, ec. 52) a partir de la temperatura de POWER', 'Mensual'],
    ['Fase ENSO', enso.fuente, enso.automatico ? 'Automático' : 'Tabla de respaldo'],
    ['Suelo de referencia', suelo ? suelo.fuente : 'SoilGrids 2.0 (ISRIC) — pendiente; la API REST está pausada', 'Solo si el agricultor no sabe su pH'],
    ['Rangos de cultivos', 'FAO-56 (Kc, duración) y FAO ECOCROP (pH, temperatura)', 'Valores iniciales en verificación'],
  ];
  $('datosinfo').innerHTML = `<div class="tabla"><table><thead><tr><th>Qué</th><th>Fuente</th><th>Estado</th></tr></thead><tbody>${filas.map((f) => `<tr>${f.map((x) => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const col = ['nombre', 'epocas', 'ciclo_dias', 'ph_min', 'ph_max', 'kc_ciclo', 'tolera_sequia', 'aporte_n_kg_ha', 'margen_relativo', 'verificado_por'];
  const tit = ['Cultivo', 'Épocas', 'Ciclo (días)', 'pH mín', 'pH máx', 'Kc', 'Tolera sequía (0-3)', 'Aporta N (kg/ha)', 'Margen (1-5)', 'Verificado'];
  $('tablacultivos').innerHTML = `<thead><tr>${tit.map((t) => `<th>${t}</th>`).join('')}</tr></thead><tbody>${cultivos.map((c) => `<tr>${col.map((k) => `<td>${Array.isArray(c[k]) ? c[k].join(', ') : c[k] ?? '—'}</td>`).join('')}</tr>`).join('')}</tbody>`;
}

iniciar();
