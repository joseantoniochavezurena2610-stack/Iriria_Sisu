// motor.js — motor de rotación de Iriria Sìsù.
// Sistema de decisión multicriterio con reglas transparentes (no es una caja negra):
//   1. evalúa cada cultivo en cada época (agua, temperatura, pH, exceso de lluvia)
//   2. descarta lo inviable (reglas duras)
//   3. arma secuencias de 3 años × 3 épocas con búsqueda en haz
//   4. puntúa 0-100 en Suelo, Agua, Riesgo e Ingreso
//   5. combina con las prioridades del agricultor y devuelve 3 planes + "lo de hoy"
// Las fórmulas están explicadas en docs/motor-reglas.md. Función pura: sin DOM ni red.

import { EPOCAS, climaEpoca, lluviaEfectiva } from './clima.js';

export const PARAMETROS = {
  // Agua disponible total (mm por metro de suelo) según textura — rangos típicos FAO-56 (tabla 19)
  aguaUtilPorM: { arenoso: 70, franco: 140, arcilloso: 170 },
  profRaiz: 0.6, // m, valor medio para granos
  fraccionFacil: 0.5, // fracción del agua útil que la planta usa sin estrés (p de FAO-56)
  drenaje: { arenoso: 0.6, franco: 1, arcilloso: 1.4 },
  riegoMaxPorEpoca: { no: 0, limitado: 150, completo: Infinity }, // mm
  pendiente: { plana: 0.3, media: 0.7, fuerte: 1.2 },
  aptitudMinima: 0.35, // por debajo, el cultivo no se propone en esa época
  diasEpoca: 120,
  bonoTrasLeguminosa: 1.10,
  bonoTrasAbonoVerde: 1.15,
  castigoMismaFamilia: 0.85,
  castigoFamiliaReciente: 0.95,
  umbralFallaBase: 0.75, // fracción de la demanda de agua cubierta; menos = cosecha en riesgo
  haz: 250,
};
const P = PARAMETROS;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const pct = (x) => Math.round(x * 100);

/** Balance hídrico simplificado tipo FAO-56 de un cultivo en una época. */
export function balanceAgua(cultivo, clima, finca) {
  if (cultivo.grupo === 'none') return { ETc: 0, Pe: 0, reserva: 0, riego: 0, faltante: 0, cobertura: 1, lluvia: 0 };
  const mesesCiclo = Math.min(4, cultivo.ciclo_dias / 30.4);
  let ETc = 0, Pe = 0, lluvia = 0;
  for (let i = 0; i < 4; i++) {
    const f = clamp(mesesCiclo - i, 0, 1);
    if (!f) break;
    ETc += clima.ET0[i] * cultivo.kc_ciclo * f;
    Pe += lluviaEfectiva(clima.P[i]) * f;
    lluvia += clima.P[i] * f;
  }
  // Si el mes anterior llovió más de lo que se evaporó, el suelo arranca con agua fácil.
  const util = P.aguaUtilPorM[finca.textura] ?? P.aguaUtilPorM.franco;
  const reserva = clima.previo && clima.previo.P > clima.previo.ET0 ? util * P.profRaiz * P.fraccionFacil : 0;
  const deficit = Math.max(0, ETc - Pe - reserva);
  const riego = Math.min(deficit, P.riegoMaxPorEpoca[finca.riego] ?? 0);
  const faltante = deficit - riego;
  return { ETc, Pe, reserva, riego, faltante, lluvia, cobertura: ETc ? clamp((ETc - faltante) / ETc) : 1 };
}

function factorTemperatura(c, T) {
  if (T < c.t_min_c || T > c.t_max_c) return 0;
  if (T < c.t_opt_min_c) return clamp((T - c.t_min_c) / (c.t_opt_min_c - c.t_min_c));
  if (T > c.t_opt_max_c) return clamp((c.t_max_c - T) / (c.t_max_c - c.t_opt_max_c));
  return 1;
}

function factorPh(c, ph) {
  if (ph == null) return { f: 1, excluido: false };
  if (ph < c.ph_min || ph > c.ph_max) return { f: 0, excluido: true };
  if (ph < c.ph_opt_min) return { f: 1 - 0.3 * (c.ph_opt_min - ph) / Math.max(0.1, c.ph_opt_min - c.ph_min), excluido: false };
  if (ph > c.ph_opt_max) return { f: 1 - 0.3 * (ph - c.ph_opt_max) / Math.max(0.1, c.ph_max - c.ph_opt_max), excluido: false };
  return { f: 1, excluido: false };
}

/** Aptitud (0-1) de un cultivo en una época, con el factor que más limita. */
export function evaluarCultivo(c, clima, finca) {
  if (c.grupo === 'none') return { apt: 1, agua: balanceAgua(c, clima, finca), limitante: '', excluido: null };
  const ph = factorPh(c, finca.ph);
  if (ph.excluido) return { apt: 0, agua: null, limitante: 'pH', excluido: `pH ${finca.ph} fuera del rango tolerable (${c.ph_min}–${c.ph_max})` };
  const mesesCiclo = Math.max(1, Math.round(Math.min(4, c.ciclo_dias / 30.4)));
  const T = clima.T.slice(0, mesesCiclo).reduce((a, b) => a + b, 0) / mesesCiclo;
  const fT = factorTemperatura(c, T);
  const agua = balanceAgua(c, clima, finca);
  const fA = clamp((agua.cobertura - 0.5) / 0.45);
  const exceso = agua.ETc ? agua.lluvia / agua.ETc : 0;
  const fX = exceso > 2.5 && c.tolera_encharcamiento < 2
    ? clamp(1 - (exceso - 2.5) * 0.15 * ((2 - c.tolera_encharcamiento) / 2) * (P.drenaje[finca.textura] ?? 1), 0.4, 1) : 1;
  const factores = [[fA, 'falta de agua'], [fT, T < c.t_opt_min_c ? 'frío' : 'calor'], [ph.f, 'pH'], [fX, 'exceso de lluvia']];
  const peor = factores.reduce((a, b) => (b[0] < a[0] ? b : a));
  return { apt: fA * fT * ph.f * fX, agua, T, limitante: peor[0] < 0.95 ? peor[1] : '', excluido: null };
}

/** Probabilidad de que el agua no alcance, con los años observados del escenario. */
export function probabilidadFalla(c, muestras, finca) {
  if (c.grupo === 'none' || !muestras || !muestras.length) return { prob: null, n: muestras ? muestras.length : 0, fallas: [] };
  const umbral = P.umbralFallaBase - 0.05 * (c.tolera_sequia || 0);
  const fallas = muestras.filter((m) => balanceAgua(c, m, finca).cobertura < umbral).map((m) => m.anio);
  return { prob: fallas.length / muestras.length, n: muestras.length, fallas };
}

/** Precalcula la evaluación de cada cultivo × época × escenario. */
export function prepararEvaluaciones(cultivos, escenarios, finca) {
  const tabla = {};
  for (const [id, esc] of Object.entries(escenarios)) {
    tabla[id] = EPOCAS.map((ep) => {
      const clima = climaEpoca(esc, ep);
      return cultivos.map((c) => {
        // Calendario regional: un cultivo fuera de sus épocas habituales no se propone.
        if (Array.isArray(c.epocas) && !c.epocas.includes(ep.id)) {
          return { apt: 0, agua: balanceAgua({ grupo: 'none' }, clima, finca), limitante: 'fuera de época', excluido: null, fueraDeEpoca: true, riesgo: { prob: null, n: 0, fallas: [] }, relleno: clima.relleno };
        }
        return { ...evaluarCultivo(c, clima, finca), riesgo: probabilidadFalla(c, esc.muestras[ep.id], finca), relleno: clima.relleno };
      });
    });
  }
  return tabla;
}

function modificadorRotacion(seq, i, cultivos) {
  const c = cultivos[seq[i]];
  if (i === 0 || c.grupo === 'none') return 1;
  let m = 1;
  const prev = cultivos[seq[i - 1]];
  if (prev.familia === c.familia) m *= P.castigoMismaFamilia;
  else {
    for (let j = Math.max(0, i - 3); j < i - 1; j++) if (cultivos[seq[j]].familia === c.familia) { m *= P.castigoFamiliaReciente; break; }
  }
  if (prev.leguminosa && !c.leguminosa) m *= prev.abono_verde ? P.bonoTrasAbonoVerde : P.bonoTrasLeguminosa;
  return m;
}

/**
 * Puntúa una secuencia. planEsc: arreglo con el escenario de cada espacio (9).
 * ref: ingreso máximo alcanzable por espacio (para normalizar).
 */
export function evaluarSecuencia(seq, ctx) {
  const { cultivos, tabla, planEsc, finca, pesos, ref } = ctx;
  let netoN = 0, cob = 0, res = 0, rep = 0, desnudo = 0, demanda = 0, usado = 0, riego = 0;
  let ingreso = 0, refIng = 0, riesgoSum = 0, riesgoN = 0, sembrados = 0;
  const familias = new Set();
  const detalle = [];
  for (let i = 0; i < seq.length; i++) {
    const c = cultivos[seq[i]];
    const ev = tabla[planEsc[i]][i % 3][seq[i]];
    const mod = modificadorRotacion(seq, i, cultivos);
    const prob = ev.riesgo.prob;
    netoN += (c.aporte_n_kg_ha - c.demanda_n_kg_ha) * (c.grupo === 'none' ? 0 : Math.max(ev.apt, 0.3));
    cob += c.cobertura; res += c.residuos * (c.grupo === 'none' ? 1 : ev.apt);
    if (c.cobertura <= 1) desnudo++;
    if (c.grupo !== 'none') {
      sembrados++;
      familias.add(c.familia);
      if (i > 0 && cultivos[seq[i - 1]].familia === c.familia) rep++;
      demanda += ev.agua.ETc; usado += ev.agua.riego + ev.agua.faltante; riego += ev.agua.riego;
      if (prob != null) { riesgoSum += prob; riesgoN++; } else { riesgoSum += 1 - clamp((ev.agua.cobertura - 0.5) / 0.45); riesgoN++; }
    }
    ingreso += c.margen_relativo * ev.apt * mod * (1 - 0.5 * (prob ?? 0));
    refIng += ref[i];
    detalle.push({ cultivo: c.cultivo, apt: ev.apt, mod, prob, n: ev.riesgo.n, riego: ev.agua ? ev.agua.riego : 0, faltante: ev.agua ? ev.agua.faltante : 0, limitante: ev.limitante });
  }
  const L = seq.length;
  const nScore = clamp((netoN / L + 120) / 220);
  const div = sembrados ? clamp(familias.size / Math.min(4, sembrados)) : 0;
  const erosion = (P.pendiente[finca.pendiente] ?? 0.5) * (desnudo / L) * 0.3;
  const moBaja = finca.materia_organica === 'baja' ? 0.05 : 0;
  const suelo = clamp(0.35 * nScore + 0.25 * cob / L / 3 + (0.15 + moBaja) * res / L / 3 + 0.25 * div - 0.08 * rep - erosion);
  const agua = demanda ? clamp(1 - usado / demanda) : 1;
  const riesgo = riesgoN ? clamp(1 - riesgoSum / riesgoN) : 1; // 1 = seguro
  const ingresoRel = refIng ? clamp(ingreso / refIng) : 0;
  const W = (pesos.suelo + pesos.agua + pesos.riesgo + pesos.ingreso) || 1;
  const total = (pesos.suelo * suelo + pesos.agua * agua + pesos.riesgo * riesgo + pesos.ingreso * ingresoRel) / W;
  return { total, suelo, agua, riesgo, ingreso: ingresoRel, riego, rep, familias: familias.size, sembrados, netoN: netoN / L, detalle };
}

function referenciaIngreso(cultivos, tabla, planEsc) {
  return planEsc.map((e, i) => Math.max(...cultivos.map((c, k) => c.margen_relativo * tabla[e][i % 3][k].apt)));
}

/** Busca las mejores secuencias (búsqueda en haz). */
function buscar(ctx, permitidos) {
  let haz = [[]];
  for (let i = 0; i < ctx.planEsc.length; i++) {
    const siguiente = [];
    for (const s of haz) for (const k of permitidos[i]) {
      const q = s.concat(k);
      siguiente.push([q, evaluarSecuencia(q, { ...ctx, planEsc: ctx.planEsc.slice(0, q.length), ref: ctx.ref.slice(0, q.length) }).total]);
    }
    siguiente.sort((a, b) => b[1] - a[1]);
    haz = siguiente.slice(0, P.haz).map((x) => x[0]);
  }
  return haz;
}

/** Explicaciones en lenguaje sencillo, siempre con el número que las sostiene. */
function razones(plan, base, cultivos, ctx) {
  const r = [];
  const sc = plan.puntajes;
  const seq = plan.secuencia;
  if (!sc.sembrados) return ['No se siembra nada: el suelo descansa, pero no hay ingreso. Ningún cultivo actual se adapta a estas condiciones.'];
  const legs = seq.filter((k) => cultivos[k].leguminosa).length;
  const verdes = seq.filter((k) => cultivos[k].abono_verde).length;
  if (legs) r.push(`${legs} de 9 épocas llevan leguminosas${verdes ? ` (${verdes} como abono verde)` : ''}: dejan nitrógeno para el cultivo que sigue.`);
  r.push(sc.rep ? `Repite la misma familia ${sc.rep} ${sc.rep > 1 ? 'veces' : 'vez'} seguidas: vigilar plagas y desgaste del suelo.` : `${sc.familias} familias de cultivo distintas y ninguna se repite seguida.`);
  if (ctx.finca.riego !== 'no' || sc.riego > 1) r.push(`Riego estimado en 3 años: ${Math.round(sc.riego)} mm${base ? ` (${Math.round(sc.riego - base.puntajes.riego) >= 0 ? '+' : '−'}${Math.abs(Math.round(sc.riego - base.puntajes.riego))} mm frente a lo de hoy)` : ''}.`);
  let peor = null;
  sc.detalle.forEach((d, i) => { if (cultivos[seq[i]].grupo !== 'none' && d.prob != null && (!peor || d.prob > peor.prob)) peor = { ...d, i }; });
  if (peor && peor.prob > 0) {
    const ep = EPOCAS[peor.i % 3];
    r.push(`Punto débil: ${cultivos[seq[peor.i]].nombre.toLowerCase()} en ${ep.nombre.toLowerCase()} del año ${Math.floor(peor.i / 3) + 1} — el agua no alcanzó en ${pct(peor.prob)} % de los ${peor.n} años observados de ese escenario${peor.limitante ? ` (limita: ${peor.limitante})` : ''}.`);
  } else r.push('En los años observados (2021 → hoy) ninguna época de este plan se quedó sin agua.');
  if (base) {
    const d = pct(plan.puntajes.total - base.puntajes.total);
    if (d > 0) r.push(`${d} puntos por encima de lo que se siembra hoy.`);
  }
  return r;
}

/**
 * Punto de entrada.
 * @param {object} p
 * @param {Array} p.cultivos      catálogo (web/data/cultivos.json → cultivos)
 * @param {object} p.escenarios   salida de construirEscenarios().escenarios
 * @param {string[]} p.planEsc    escenario por espacio (9), p. ej. pronóstico IMN: 2 × 'el_nino' + 7 × 'normal'
 * @param {object} p.finca        {ph|null, textura, pendiente, riego, cultivo_actual, materia_organica|null, perdida_max_pct|null}
 * @param {object} p.prioridades  {suelo, agua, riesgo, ingreso} de 0 a 5
 */
export function recomendar({ cultivos, escenarios, planEsc, finca, prioridades }) {
  const avisos = [];
  if (finca.ph == null) avisos.push('No se usó pH: sin un análisis de suelo el motor no puede descartar cultivos por acidez.');
  const pesos = { suelo: +prioridades.suelo || 0, agua: +prioridades.agua || 0, riesgo: +prioridades.riesgo || 0, ingreso: +prioridades.ingreso || 0 };
  if (!(pesos.suelo + pesos.agua + pesos.riesgo + pesos.ingreso)) Object.keys(pesos).forEach((k) => { pesos[k] = 1; });

  const tabla = prepararEvaluaciones(cultivos, escenarios, finca);
  const ref = referenciaIngreso(cultivos, tabla, planEsc);
  const ctx = { cultivos, tabla, planEsc, finca, pesos, ref };
  const iDesc = cultivos.findIndex((c) => c.grupo === 'none');

  const excluidos = new Map();
  const permitidos = planEsc.map((e, i) => {
    const ok = [];
    cultivos.forEach((c, k) => {
      const ev = tabla[e][i % 3][k];
      if (ev.excluido) excluidos.set(c.cultivo, ev.excluido);
      if (c.grupo === 'none' || ev.apt >= P.aptitudMinima) ok.push(k);
    });
    return ok;
  });
  for (const [c, motivo] of excluidos) avisos.push(`${cultivos.find((x) => x.cultivo === c).nombre}: descartado por ${motivo}.`);

  // Lo que se siembra hoy: el cultivo actual donde se pueda, descanso donde no.
  const iActual = cultivos.findIndex((c) => c.cultivo === finca.cultivo_actual);
  const seqBase = planEsc.map((e, i) => (iActual >= 0 && cultivos[iActual].grupo !== 'none' && tabla[e][i % 3][iActual].apt >= P.aptitudMinima ? iActual : iDesc));
  const base = { secuencia: seqBase, puntajes: evaluarSecuencia(seqBase, ctx) };

  let candidatos = buscar(ctx, permitidos).map((s) => ({ secuencia: s, puntajes: evaluarSecuencia(s, ctx) }));
  if (finca.perdida_max_pct != null && iActual >= 0) {
    const piso = base.puntajes.ingreso * (1 - finca.perdida_max_pct / 100);
    const filtrados = candidatos.filter((c) => c.puntajes.ingreso >= piso);
    if (filtrados.length) candidatos = filtrados;
    else avisos.push(`Ningún plan mantiene el ingreso dentro de la pérdida máxima de ${finca.perdida_max_pct} %; se muestran los mejores de todos modos.`);
  }

  // Diversidad: cada plan debe cambiar al menos 3 épocas Y usar una mezcla de cultivos distinta.
  const mezcla = (s) => [...new Set(s)].sort().join(',');
  const planes = [];
  for (const c of candidatos) {
    if (planes.every((p) => p.secuencia.filter((k, i) => k !== c.secuencia[i]).length >= 3 && mezcla(p.secuencia) !== mezcla(c.secuencia))) planes.push(c);
    if (planes.length === 3) break;
  }
  for (const c of candidatos) { // si no hay 3 mezclas distintas, se completa con el criterio simple
    if (planes.length === 3) break;
    if (!planes.includes(c) && planes.every((p) => p.secuencia.filter((k, i) => k !== c.secuencia[i]).length >= 3)) planes.push(c);
  }

  // Robustez: el mismo plan con todo normal y con todo El Niño.
  const todos = (id) => planEsc.map(() => id);
  const evaluarEn = (seq, id) => evaluarSecuencia(seq, { ...ctx, planEsc: todos(id), ref: referenciaIngreso(cultivos, tabla, todos(id)) });
  for (const p of [...planes, base]) {
    const n = evaluarEn(p.secuencia, 'normal'), ni = evaluarEn(p.secuencia, 'el_nino');
    p.comparacion = { normal: n.total, el_nino: ni.total, riesgo_el_nino: ni.riesgo };
    p.robusto = ni.total >= 0.85 * n.total && ni.riesgo >= 0.5;
  }
  for (const p of planes) p.razones = razones(p, base, cultivos, ctx);
  base.razones = razones(base, null, cultivos, ctx);

  return {
    planes, base, avisos,
    cultivosPorEspacio: planes.length ? null : 'Ningún cultivo del catálogo se ajusta: revise los datos de la finca.',
    nombres: (seq) => seq.map((k) => cultivos[k]),
  };
}
