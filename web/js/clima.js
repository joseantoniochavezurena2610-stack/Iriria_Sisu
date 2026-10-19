// clima.js — convierte los datos mensuales de NASA POWER en escenarios para el motor.
// Funciones puras: no tocan el DOM ni la red. Las usa app.js y las pruebas en tests/.

export const EPOCAS = [
  { id: 'seca', nombre: 'Seca', rango: 'Ene–Abr', meses: [1, 2, 3, 4] },
  { id: 'primera', nombre: 'Primera', rango: 'May–Ago', meses: [5, 6, 7, 8] },
  { id: 'postrera', nombre: 'Postrera', rango: 'Sep–Dic', meses: [9, 10, 11, 12] },
];
export const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
export const ESCENARIOS = {
  normal: { nombre: 'Año sin El Niño', corto: 'Normal' },
  el_nino: { nombre: 'Año El Niño', corto: 'El Niño' },
  peor: { nombre: 'Peor año observado', corto: 'Peor año' },
};

/** Fase ENSO de un mes. Acepta el formato automático (meses) o el de respaldo (periodos). */
export function faseMes(enso, anio, mes) {
  if (!enso) return null;
  if (Array.isArray(enso.meses)) {
    const f = enso.meses.find((x) => x.anio === anio && x.mes === mes);
    if (f) return f.fase;
  }
  if (Array.isArray(enso.periodos)) {
    const clave = `${anio}-${String(mes).padStart(2, '0')}`;
    const p = enso.periodos.find((x) => x.desde <= clave && clave <= x.hasta);
    if (p) return p.fase;
  }
  return null;
}

/** Lluvia efectiva mensual (método USDA-SCS, usado en FAO/CROPWAT). */
export function lluviaEfectiva(p) {
  if (p == null || p <= 0) return 0;
  return p <= 250 ? (p * (125 - 0.2 * p)) / 125 : 125 + 0.1 * p;
}

const media = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/**
 * Construye los escenarios a partir de clima_<id>.json y enso.json.
 * Cada escenario trae 12 meses {P, ET0, T, n, relleno} y, por época, las muestras
 * año por año que usa el motor para calcular el riesgo.
 */
export function construirEscenarios(clima, enso) {
  const meses = (clima.meses || []).filter((m) => m.P != null && m.ET0 != null && m.T != null)
    .map((m) => ({ ...m, fase: faseMes(enso, m.anio, m.mes) }));
  if (meses.length < 24) throw new Error('Hay menos de 2 años de datos completos para este punto.');

  const anios = [...new Set(meses.map((m) => m.anio))].sort();
  const porAnioMes = new Map(meses.map((m) => [`${m.anio}-${m.mes}`, m]));

  // Peor año: el año completo (may–nov) con menos lluvia.
  const lluviaHumeda = anios.map((a) => {
    const ms = [5, 6, 7, 8, 9, 10, 11].map((k) => porAnioMes.get(`${a}-${k}`));
    return ms.every(Boolean) ? { anio: a, P: ms.reduce((s, m) => s + m.P, 0) } : null;
  }).filter(Boolean).sort((x, y) => x.P - y.P);
  const peorAnio = lluviaHumeda.length ? lluviaHumeda[0].anio : null;

  const filtros = {
    normal: (m) => m.fase !== 'el_nino',
    el_nino: (m) => m.fase === 'el_nino',
    peor: (m) => m.anio === peorAnio,
  };

  const escenarios = {};
  for (const [id, filtro] of Object.entries(filtros)) {
    const mensual = [];
    for (let mes = 1; mes <= 12; mes++) {
      let grupo = meses.filter((m) => m.mes === mes && filtro(m));
      let relleno = false;
      if (!grupo.length) { grupo = meses.filter((m) => m.mes === mes); relleno = true; }
      mensual.push({
        mes, n: grupo.length, relleno,
        P: media(grupo.map((m) => m.P)), ET0: media(grupo.map((m) => m.ET0)), T: media(grupo.map((m) => m.T)),
        GWETROOT: media(grupo.map((m) => m.GWETROOT).filter((x) => x != null)),
        anios: [...new Set(grupo.map((m) => m.anio))],
      });
    }
    escenarios[id] = { id, ...ESCENARIOS[id], mensual, muestras: {} };
  }

  // Muestras año por año de cada época (solo épocas completas).
  for (const ep of EPOCAS) {
    const muestras = [];
    for (const a of anios) {
      const ms = ep.meses.map((k) => porAnioMes.get(`${a}-${k}`));
      if (!ms.every(Boolean)) continue;
      const mesPrevio = ep.meses[0] === 1 ? porAnioMes.get(`${a - 1}-12`) : porAnioMes.get(`${a}-${ep.meses[0] - 1}`);
      const nino = ms.filter((m) => m.fase === 'el_nino').length;
      muestras.push({
        anio: a, P: ms.map((m) => m.P), ET0: ms.map((m) => m.ET0), T: ms.map((m) => m.T),
        previo: mesPrevio ? { P: mesPrevio.P, ET0: mesPrevio.ET0 } : null,
        fase: nino >= 2 ? 'el_nino' : 'otro',
      });
    }
    escenarios.normal.muestras[ep.id] = muestras.filter((m) => m.fase !== 'el_nino');
    escenarios.el_nino.muestras[ep.id] = muestras.filter((m) => m.fase === 'el_nino');
    escenarios.peor.muestras[ep.id] = muestras;
  }

  const fasesVistas = meses.reduce((acc, m) => { acc[m.fase || 'sin_dato'] = (acc[m.fase || 'sin_dato'] || 0) + 1; return acc; }, {});
  return {
    escenarios,
    meta: {
      desde: `${meses[0].anio}-${String(meses[0].mes).padStart(2, '0')}`,
      hasta: `${meses.at(-1).anio}-${String(meses.at(-1).mes).padStart(2, '0')}`,
      mesesCompletos: meses.length, anios, peorAnio, fasesVistas,
    },
  };
}

/** Clima de una época en un escenario: los 4 meses + el mes anterior (para la reserva de agua). */
export function climaEpoca(escenario, epoca) {
  const m = (k) => escenario.mensual[k - 1];
  const previo = epoca.meses[0] === 1 ? m(12) : m(epoca.meses[0] - 1);
  return {
    P: epoca.meses.map((k) => m(k).P), ET0: epoca.meses.map((k) => m(k).ET0), T: epoca.meses.map((k) => m(k).T),
    previo: { P: previo.P, ET0: previo.ET0 },
    relleno: epoca.meses.some((k) => m(k).relleno),
  };
}

// ---------------------------------------------------------------------------
// Procesamiento de la respuesta DIARIA de NASA POWER en el navegador (descarga en vivo).
// Es el mismo cálculo que scripts/descargar_datos.py, para cuando el punto no está precalculado.

function radiacionExtraterrestreMm(lat, dia) {
  const phi = (lat * Math.PI) / 180;
  const dr = 1 + 0.033 * Math.cos((2 * Math.PI * dia) / 365);
  const delta = 0.409 * Math.sin((2 * Math.PI * dia) / 365 - 1.39);
  const ws = Math.acos(Math.max(-1, Math.min(1, -Math.tan(phi) * Math.tan(delta))));
  const ra = ((24 * 60) / Math.PI) * 0.082 * dr * (ws * Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.sin(ws));
  return 0.408 * ra;
}

/** ET0 diaria (mm) por Hargreaves (FAO-56, ec. 52). */
export function et0Hargreaves(tmed, tmax, tmin, lat, dia) {
  if ([tmed, tmax, tmin].some((v) => v == null) || tmax < tmin) return null;
  return 0.0023 * (tmed + 17.8) * Math.sqrt(tmax - tmin) * radiacionExtraterrestreMm(lat, dia);
}

export const URL_POWER = 'https://power.larc.nasa.gov/api/temporal/daily/point';

export function urlPower(lat, lon, inicio, fin) {
  const f = (d) => d.toISOString().slice(0, 10).replaceAll('-', '');
  const q = new URLSearchParams({ parameters: 'PRECTOTCORR,T2M,T2M_MAX,T2M_MIN,RH2M,GWETROOT', community: 'AG', latitude: lat.toFixed(4), longitude: lon.toFixed(4), start: f(inicio), end: f(fin), format: 'JSON', 'time-standard': 'LST' });
  return `${URL_POWER}?${q}`;
}

export function procesarPowerDiario(json, lat) {
  const p = json && json.properties && json.properties.parameter;
  if (!p || !p.PRECTOTCORR) throw new Error('La respuesta de NASA POWER no trae lluvia (PRECTOTCORR).');
  const relleno = (json.header && json.header.fill_value) ?? -999;
  const val = (n, k) => { const v = p[n] && p[n][k]; return v == null || v === relleno || v <= -900 ? null : v; };
  const meses = new Map();
  for (const k of Object.keys(p.PRECTOTCORR).sort()) {
    const P = val('PRECTOTCORR', k);
    if (P == null) continue;
    const anio = +k.slice(0, 4), mes = +k.slice(4, 6), diaMes = +k.slice(6, 8);
    const dia = Math.round((Date.UTC(anio, mes - 1, diaMes) - Date.UTC(anio, 0, 0)) / 864e5);
    const m = meses.get(`${anio}-${mes}`) || { anio, mes, dias: 0, P: 0, et: 0, nEt: 0, T: 0, nT: 0, HR: 0, nHR: 0, G: 0, nG: 0 };
    m.dias++; m.P += P;
    const t = val('T2M', k), tx = val('T2M_MAX', k), tn = val('T2M_MIN', k);
    const e = et0Hargreaves(t, tx, tn, lat, dia);
    if (e != null) { m.et += e; m.nEt++; }
    if (t != null) { m.T += t; m.nT++; }
    const hr = val('RH2M', k); if (hr != null) { m.HR += hr; m.nHR++; }
    const g = val('GWETROOT', k); if (g != null) { m.G += g; m.nG++; }
    meses.set(`${anio}-${mes}`, m);
  }
  const salida = [];
  for (const m of meses.values()) {
    if (m.dias < 25) continue;
    const diasMes = new Date(Date.UTC(m.anio, m.mes, 0)).getUTCDate();
    salida.push({
      anio: m.anio, mes: m.mes, P: +(m.P * diasMes / m.dias).toFixed(1),
      ET0: m.nEt >= 25 ? +(m.et * diasMes / m.nEt).toFixed(1) : null,
      T: m.nT ? +(m.T / m.nT).toFixed(2) : null, HR: m.nHR ? +(m.HR / m.nHR).toFixed(1) : null,
      GWETROOT: m.nG ? +(m.G / m.nG).toFixed(3) : null, dias: m.dias,
    });
  }
  salida.sort((a, b) => a.anio - b.anio || a.mes - b.mes);
  const g = (json.geometry && json.geometry.coordinates) || [];
  return { meses: salida, celda_power: { lon: g[0], lat: g[1] }, fuente: 'NASA POWER, API diaria, comunidad AG (descarga en vivo)' };
}
