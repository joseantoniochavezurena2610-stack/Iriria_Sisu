// engine.js — Iriria Sìsù crop-rotation engine.
// A transparent multi-criteria decision system (not a black box):
//   1. evaluates every crop in every season (water, temperature, pH, excess rain)
//   2. discards what is not viable (hard rules)
//   3. builds 3-year × 3-season sequences with beam search
//   4. scores Soil, Water, Risk and Income from 0 to 100
//   5. weights them with the farmer's priorities and returns 3 plans + "what you plant today"
// Formulas are documented in docs/engine-rules.md. Pure functions: no DOM, no network.

import { SEASONS, seasonClimate, effectiveRainfall } from './climate.js';

export const PARAMETERS = {
  // Total available water (mm per metre of soil) by texture — typical FAO-56 ranges (table 19)
  availableWaterPerM: { sandy: 70, loam: 140, clay: 170 },
  rootDepth: 0.6, // m, typical for grain crops
  readilyAvailableFraction: 0.5, // share of available water used without stress (FAO-56 "p")
  drainage: { sandy: 0.6, loam: 1, clay: 1.4 },
  maxIrrigationPerSeason: { none: 0, limited: 150, full: Infinity }, // mm
  slope: { flat: 0.3, moderate: 0.7, steep: 1.2 },
  minSuitability: 0.35, // below this a crop is not proposed for that season
  seasonDays: 120,
  bonusAfterLegume: 1.10,
  bonusAfterGreenManure: 1.15,
  penaltySameFamily: 0.85,
  penaltyRecentFamily: 0.95,
  baseFailureThreshold: 0.75, // share of water demand covered; below = crop at risk
  beamWidth: 250,
};
const P = PARAMETERS;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const pct = (x) => Math.round(x * 100);

/** Simplified FAO-56-style water balance of one crop in one season. */
export function waterBalance(crop, climate, farm) {
  if (crop.group === 'none') return { ETc: 0, Pe: 0, carryOver: 0, irrigation: 0, unmet: 0, coverage: 1, rain: 0 };
  const cycleMonths = Math.min(4, crop.cycle_days / 30.4);
  let ETc = 0, Pe = 0, rain = 0;
  for (let i = 0; i < 4; i++) {
    const f = clamp(cycleMonths - i, 0, 1);
    if (!f) break;
    ETc += climate.ET0[i] * crop.kc_season * f;
    Pe += effectiveRainfall(climate.P[i]) * f;
    rain += climate.P[i] * f;
  }
  // If the month before rained more than it evaporated, the soil starts with readily available water.
  const available = P.availableWaterPerM[farm.texture] ?? P.availableWaterPerM.loam;
  const carryOver = climate.previous && climate.previous.P > climate.previous.ET0 ? available * P.rootDepth * P.readilyAvailableFraction : 0;
  const deficit = Math.max(0, ETc - Pe - carryOver);
  const irrigation = Math.min(deficit, P.maxIrrigationPerSeason[farm.irrigation] ?? 0);
  const unmet = deficit - irrigation;
  return { ETc, Pe, carryOver, irrigation, unmet, rain, coverage: ETc ? clamp((ETc - unmet) / ETc) : 1 };
}

function temperatureFactor(c, T) {
  if (T < c.t_min_c || T > c.t_max_c) return 0;
  if (T < c.t_opt_min_c) return clamp((T - c.t_min_c) / (c.t_opt_min_c - c.t_min_c));
  if (T > c.t_opt_max_c) return clamp((c.t_max_c - T) / (c.t_max_c - c.t_opt_max_c));
  return 1;
}

function phFactor(c, ph) {
  if (ph == null) return { f: 1, excluded: false };
  if (ph < c.ph_min || ph > c.ph_max) return { f: 0, excluded: true };
  if (ph < c.ph_opt_min) return { f: 1 - 0.3 * (c.ph_opt_min - ph) / Math.max(0.1, c.ph_opt_min - c.ph_min), excluded: false };
  if (ph > c.ph_opt_max) return { f: 1 - 0.3 * (ph - c.ph_opt_max) / Math.max(0.1, c.ph_max - c.ph_opt_max), excluded: false };
  return { f: 1, excluded: false };
}

/** Suitability (0-1) of a crop in a season, with the most limiting factor. */
export function evaluateCrop(c, climate, farm) {
  if (c.group === 'none') return { suit: 1, water: waterBalance(c, climate, farm), limiting: '', excluded: null };
  const ph = phFactor(c, farm.ph);
  if (ph.excluded) return { suit: 0, water: null, limiting: 'pH', excluded: `pH ${farm.ph} outside the tolerable range (${c.ph_min}–${c.ph_max})` };
  const cycleMonths = Math.max(1, Math.round(Math.min(4, c.cycle_days / 30.4)));
  const T = climate.T.slice(0, cycleMonths).reduce((a, b) => a + b, 0) / cycleMonths;
  const fT = temperatureFactor(c, T);
  const water = waterBalance(c, climate, farm);
  const fW = clamp((water.coverage - 0.5) / 0.45);
  const excess = water.ETc ? water.rain / water.ETc : 0;
  const fX = excess > 2.5 && c.waterlogging_tolerance < 2
    ? clamp(1 - (excess - 2.5) * 0.15 * ((2 - c.waterlogging_tolerance) / 2) * (P.drainage[farm.texture] ?? 1), 0.4, 1) : 1;
  const factors = [[fW, 'lack of water'], [fT, T < c.t_opt_min_c ? 'cold' : 'heat'], [ph.f, 'pH'], [fX, 'excess rain']];
  const worst = factors.reduce((a, b) => (b[0] < a[0] ? b : a));
  return { suit: fW * fT * ph.f * fX, water, T, limiting: worst[0] < 0.95 ? worst[1] : '', excluded: null };
}

/** Probability that water falls short, using the observed years of the scenario. */
export function failureProbability(c, samples, farm) {
  if (c.group === 'none' || !samples || !samples.length) return { prob: null, n: samples ? samples.length : 0, failures: [] };
  const threshold = P.baseFailureThreshold - 0.05 * (c.drought_tolerance || 0);
  const failures = samples.filter((s) => waterBalance(c, s, farm).coverage < threshold).map((s) => s.year);
  return { prob: failures.length / samples.length, n: samples.length, failures };
}

/** Precomputes the evaluation of every crop × season × scenario. */
export function prepareEvaluations(crops, scenarios, farm) {
  const table = {};
  for (const [id, sc] of Object.entries(scenarios)) {
    table[id] = SEASONS.map((s) => {
      const climate = seasonClimate(sc, s);
      return crops.map((c) => {
        // Regional calendar: a crop outside its usual seasons is not proposed.
        if (Array.isArray(c.seasons) && !c.seasons.includes(s.id)) {
          return { suit: 0, water: waterBalance({ group: 'none' }, climate, farm), limiting: 'out of season', excluded: null, outOfSeason: true, risk: { prob: null, n: 0, failures: [] }, filled: climate.filled };
        }
        return { ...evaluateCrop(c, climate, farm), risk: failureProbability(c, sc.samples[s.id], farm), filled: climate.filled };
      });
    });
  }
  return table;
}

function rotationModifier(seq, i, crops) {
  const c = crops[seq[i]];
  if (i === 0 || c.group === 'none') return 1;
  let m = 1;
  const prev = crops[seq[i - 1]];
  if (prev.family === c.family) m *= P.penaltySameFamily;
  else {
    for (let j = Math.max(0, i - 3); j < i - 1; j++) if (crops[seq[j]].family === c.family) { m *= P.penaltyRecentFamily; break; }
  }
  if (prev.legume && !c.legume) m *= prev.green_manure ? P.bonusAfterGreenManure : P.bonusAfterLegume;
  return m;
}

/**
 * Scores a sequence. planScenarios: array with the scenario of each slot (9).
 * ref: maximum reachable income per slot (for normalisation).
 */
export function scoreSequence(seq, ctx) {
  const { crops, table, planScenarios, farm, weights, ref } = ctx;
  let netN = 0, cov = 0, res = 0, rep = 0, bare = 0, demand = 0, used = 0, irrigation = 0;
  let income = 0, refIncome = 0, riskSum = 0, riskN = 0, planted = 0;
  const families = new Set();
  const detail = [];
  for (let i = 0; i < seq.length; i++) {
    const c = crops[seq[i]];
    const ev = table[planScenarios[i]][i % 3][seq[i]];
    const mod = rotationModifier(seq, i, crops);
    const prob = ev.risk.prob;
    netN += (c.n_supply_kg_ha - c.n_demand_kg_ha) * (c.group === 'none' ? 0 : Math.max(ev.suit, 0.3));
    cov += c.cover; res += c.residue * (c.group === 'none' ? 1 : ev.suit);
    if (c.cover <= 1) bare++;
    if (c.group !== 'none') {
      planted++;
      families.add(c.family);
      if (i > 0 && crops[seq[i - 1]].family === c.family) rep++;
      demand += ev.water.ETc; used += ev.water.irrigation + ev.water.unmet; irrigation += ev.water.irrigation;
      if (prob != null) { riskSum += prob; riskN++; } else { riskSum += 1 - clamp((ev.water.coverage - 0.5) / 0.45); riskN++; }
    }
    income += c.relative_margin * ev.suit * mod * (1 - 0.5 * (prob ?? 0));
    refIncome += ref[i];
    detail.push({ crop: c.id, suit: ev.suit, mod, prob, n: ev.risk.n, irrigation: ev.water ? ev.water.irrigation : 0, unmet: ev.water ? ev.water.unmet : 0, limiting: ev.limiting });
  }
  const L = seq.length;
  const nScore = clamp((netN / L + 120) / 220);
  const div = planted ? clamp(families.size / Math.min(4, planted)) : 0;
  const erosion = (P.slope[farm.slope] ?? 0.5) * (bare / L) * 0.3;
  const lowOM = farm.organic_matter === 'low' ? 0.05 : 0;
  const soil = clamp(0.35 * nScore + 0.25 * cov / L / 3 + (0.15 + lowOM) * res / L / 3 + 0.25 * div - 0.08 * rep - erosion);
  const water = demand ? clamp(1 - used / demand) : 1;
  const risk = riskN ? clamp(1 - riskSum / riskN) : 1; // 1 = safe
  const incomeRel = refIncome ? clamp(income / refIncome) : 0;
  const W = (weights.soil + weights.water + weights.risk + weights.income) || 1;
  const total = (weights.soil * soil + weights.water * water + weights.risk * risk + weights.income * incomeRel) / W;
  return { total, soil, water, risk, income: incomeRel, irrigation, rep, families: families.size, planted, netN: netN / L, detail };
}

function incomeReference(crops, table, planScenarios) {
  return planScenarios.map((s, i) => Math.max(...crops.map((c, k) => c.relative_margin * table[s][i % 3][k].suit)));
}

/** Finds the best sequences (beam search). */
function search(ctx, allowed) {
  let beam = [[]];
  for (let i = 0; i < ctx.planScenarios.length; i++) {
    const next = [];
    for (const s of beam) for (const k of allowed[i]) {
      const q = s.concat(k);
      next.push([q, scoreSequence(q, { ...ctx, planScenarios: ctx.planScenarios.slice(0, q.length), ref: ctx.ref.slice(0, q.length) }).total]);
    }
    next.sort((a, b) => b[1] - a[1]);
    beam = next.slice(0, P.beamWidth).map((x) => x[0]);
  }
  return beam;
}

const lower = (name) => name.charAt(0).toLowerCase() + name.slice(1);

/** Plain-language reasons, always with the number behind them. */
function reasons(plan, base, crops, ctx) {
  const r = [];
  const sc = plan.scores;
  const seq = plan.sequence;
  if (!sc.planted) return ['Nothing is planted: the soil rests, but there is no income. None of the current crops fits these conditions.'];
  const legs = seq.filter((k) => crops[k].legume).length;
  const green = seq.filter((k) => crops[k].green_manure).length;
  if (legs) r.push(`${legs} of 9 seasons use legumes${green ? ` (${green} as green manure)` : ''}: they leave nitrogen for the next crop.`);
  r.push(sc.rep ? `Repeats the same crop family ${sc.rep} ${sc.rep > 1 ? 'times' : 'time'} in a row: watch for pests and soil depletion.` : `${sc.families} different crop families and none repeats back to back.`);
  if (ctx.farm.irrigation !== 'none' || sc.irrigation > 1) r.push(`Estimated irrigation over 3 years: ${Math.round(sc.irrigation)} mm${base ? ` (${Math.round(sc.irrigation - base.scores.irrigation) >= 0 ? '+' : '−'}${Math.abs(Math.round(sc.irrigation - base.scores.irrigation))} mm compared with today)` : ''}.`);
  let weakest = null;
  sc.detail.forEach((d, i) => { if (crops[seq[i]].group !== 'none' && d.prob != null && (!weakest || d.prob > weakest.prob)) weakest = { ...d, i }; });
  if (weakest && weakest.prob > 0) {
    const s = SEASONS[weakest.i % 3];
    r.push(`Weak spot: ${lower(crops[seq[weakest.i]].name)} in the ${s.name} season of year ${Math.floor(weakest.i / 3) + 1} — water fell short in ${pct(weakest.prob)} % of the ${weakest.n} observed years of that scenario${weakest.limiting ? ` (limiting: ${weakest.limiting})` : ''}.`);
  } else r.push('In the observed years (2021 → today) no season of this plan ran out of water.');
  if (base) {
    const d = pct(plan.scores.total - base.scores.total);
    if (d > 0) r.push(`${d} points above what is planted today.`);
  }
  return r;
}

/**
 * Entry point.
 * @param {object} p
 * @param {Array} p.crops          catalog (web/data/crops.json → crops)
 * @param {object} p.scenarios     output of buildScenarios().scenarios
 * @param {string[]} p.planScenarios scenario per slot (9), e.g. IMN forecast: 2 × 'el_nino' + 7 × 'normal'
 * @param {object} p.farm          {ph|null, texture, slope, irrigation, current_crop, organic_matter|null, max_loss_pct|null}
 * @param {object} p.priorities    {soil, water, risk, income} from 0 to 5
 */
export function recommend({ crops, scenarios, planScenarios, farm, priorities }) {
  const notices = [];
  if (farm.ph == null) notices.push('pH was not used: without a soil test the engine cannot rule out crops because of acidity.');
  const weights = { soil: +priorities.soil || 0, water: +priorities.water || 0, risk: +priorities.risk || 0, income: +priorities.income || 0 };
  if (!(weights.soil + weights.water + weights.risk + weights.income)) Object.keys(weights).forEach((k) => { weights[k] = 1; });

  const table = prepareEvaluations(crops, scenarios, farm);
  const ref = incomeReference(crops, table, planScenarios);
  const ctx = { crops, table, planScenarios, farm, weights, ref };
  const iFallow = crops.findIndex((c) => c.group === 'none');

  const excluded = new Map();
  const allowed = planScenarios.map((s, i) => {
    const ok = [];
    crops.forEach((c, k) => {
      const ev = table[s][i % 3][k];
      if (ev.excluded) excluded.set(c.id, ev.excluded);
      if (c.group === 'none' || ev.suit >= P.minSuitability) ok.push(k);
    });
    return ok;
  });
  for (const [c, why] of excluded) notices.push(`${crops.find((x) => x.id === c).name}: ruled out because of ${why}.`);

  // What is planted today: the current crop wherever it fits, fallow elsewhere.
  const iCurrent = crops.findIndex((c) => c.id === farm.current_crop);
  const baseSeq = planScenarios.map((s, i) => (iCurrent >= 0 && crops[iCurrent].group !== 'none' && table[s][i % 3][iCurrent].suit >= P.minSuitability ? iCurrent : iFallow));
  const base = { sequence: baseSeq, scores: scoreSequence(baseSeq, ctx) };

  let candidates = search(ctx, allowed).map((s) => ({ sequence: s, scores: scoreSequence(s, ctx) }));
  if (farm.max_loss_pct != null && iCurrent >= 0) {
    const floor = base.scores.income * (1 - farm.max_loss_pct / 100);
    const kept = candidates.filter((c) => c.scores.income >= floor);
    if (kept.length) candidates = kept;
    else notices.push(`No plan keeps income within the maximum loss of ${farm.max_loss_pct} %; the best plans are shown anyway.`);
  }

  // Diversity: each plan must change at least 3 seasons AND use a different crop mix.
  const mix = (s) => [...new Set(s)].sort().join(',');
  const plans = [];
  for (const c of candidates) {
    if (plans.every((p) => p.sequence.filter((k, i) => k !== c.sequence[i]).length >= 3 && mix(p.sequence) !== mix(c.sequence))) plans.push(c);
    if (plans.length === 3) break;
  }
  for (const c of candidates) { // if there are not 3 different mixes, fill with the simple rule
    if (plans.length === 3) break;
    if (!plans.includes(c) && plans.every((p) => p.sequence.filter((k, i) => k !== c.sequence[i]).length >= 3)) plans.push(c);
  }

  // Robustness: the same plan with all-normal and all-El Niño climate.
  const all = (id) => planScenarios.map(() => id);
  const scoreIn = (seq, id) => scoreSequence(seq, { ...ctx, planScenarios: all(id), ref: incomeReference(crops, table, all(id)) });
  for (const p of [...plans, base]) {
    const n = scoreIn(p.sequence, 'normal'), ni = scoreIn(p.sequence, 'el_nino');
    p.comparison = { normal: n.total, el_nino: ni.total, risk_el_nino: ni.risk };
    p.robust = ni.total >= 0.85 * n.total && ni.risk >= 0.5;
  }
  for (const p of plans) p.reasons = reasons(p, base, crops, ctx);
  base.reasons = reasons(base, null, crops, ctx);

  return { plans, base, notices };
}
