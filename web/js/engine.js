// engine.js — Iriria Sìsù crop-rotation engine.
// A transparent multi-criteria decision system (not a black box):
//   1. evaluates every crop in every season (water, temperature, pH, excess rain)
//   2. discards what is not viable (hard rules)
//   3. builds 3-year × 3-season sequences with beam search
//   4. scores Soil, Water, Risk and Income from 0 to 100 (income from yield × price − cost, in colones per hectare)
//   5. weights them with the farmer's priorities and returns 3 plans + "what you plant today"
// Formulas are documented in docs/engine-rules.md. Pure functions: no DOM, no network.

import { SEASONS, seasonClimate, effectiveRainfall } from './climate.js?v=8';
import { t, cropName, seasonText } from './strings.js?v=8';

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
  // Nitrogen a legume leaves behind is valued at the price of urea: ₡27,755 per 45 kg sack, 46 % N
  // (MAG-SEPSA input-price survey, Aug 2026) → ₡1,341 per kg of N.
  nitrogenPriceCrcPerKg: 1341,
  failureYieldLoss: 0.5, // share of the harvest lost in a season where water falls short
  // Root-zone soil wetness of the month before the season (NASA POWER GWETROOT, 0-1) sets how much
  // readily available water the soil starts with: none at or below `dry`, all of it at or above `wet`.
  // Guanacaste ranges 0.40 (end of the dry season) to 0.99 (Oct) in 2021-2026.
  soilWetness: { dry: 0.45, wet: 0.85 },
  // A green manure takes a whole season without anything to sell: at most this many in the 9 seasons.
  maxGreenManureSeasons: 2,
  // Plans B and C come from these profiles: the farmer's weights plus extra weight on one axis.
  profiles: [['money', { income: 5 }], ['safe', { risk: 5, water: 3 }], ['soil', { soil: 5 }]],
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
  // Water already in the soil when the season starts. With NASA POWER root-zone wetness (GWETROOT) of the
  // month before, it scales from 0 (dry) to all the readily available water (wet); without it, the old rule:
  // full if the month before rained more than it evaporated.
  const available = P.availableWaterPerM[farm.texture] ?? P.availableWaterPerM.loam;
  const full = available * P.rootDepth * P.readilyAvailableFraction;
  const prev = climate.previous;
  const g = prev && prev.GWETROOT != null ? clamp((prev.GWETROOT - P.soilWetness.dry) / (P.soilWetness.wet - P.soilWetness.dry)) : null;
  const carryOver = !prev ? 0 : g != null ? full * g : (prev.P > prev.ET0 ? full : 0);
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
  if (ph.excluded) return { suit: 0, water: null, limiting: 'pH', excluded: `pH ${farm.ph} outside the tolerable range (${c.ph_min}–${c.ph_max})`, phRange: { min: c.ph_min, max: c.ph_max } };
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

/** True when every planted crop has yield, price and cost: then income is computed in colones. */
export function hasEconomics(crops) {
  return crops.every((c) => c.group === 'none' || (c.yield_t_ha != null && c.price_crc_kg != null && c.production_cost_crc_ha != null));
}

/**
 * Expected net margin of one crop in one season, in colones per hectare:
 *   yield × price × suitability × rotation effect × (1 − 0.5 × failure probability) − production cost
 *   + nitrogen left by the previous legume × urea price (only up to what this crop needs).
 * Fallow costs and earns nothing. Green manures sell nothing: their value is the nitrogen they leave.
 */
export function seasonMargin(c, ev, mod = 1, prev = null, prevSuit = 1) {
  if (c.group === 'none') return { revenue: 0, cost: 0, nSaved: 0, margin: 0 };
  const prob = ev.risk ? ev.risk.prob ?? 0 : 0;
  const revenue = (c.yield_t_ha || 0) * 1000 * (c.price_crc_kg || 0) * ev.suit * mod * (1 - P.failureYieldLoss * prob);
  const cost = c.production_cost_crc_ha || 0;
  let nSaved = 0;
  if (prev && prev.legume && !c.legume) nSaved = Math.min(prev.n_supply_kg_ha * Math.max(prevSuit, 0.3), c.n_demand_kg_ha) * P.nitrogenPriceCrcPerKg;
  return { revenue, cost, nSaved, margin: revenue - cost + nSaved };
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
  // The yield bonus after a legume comes from cereal studies (Zhao et al. 2022), so it applies to grasses only;
  // other crops still get the nitrogen the legume leaves (seasonMargin).
  if (prev.legume && !c.legume && c.group === 'gram') m *= prev.green_manure ? P.bonusAfterGreenManure : P.bonusAfterLegume;
  return m;
}

/**
 * Scores a sequence. planScenarios: array with the scenario of each slot (9).
 * ref: maximum reachable income per slot (for normalisation).
 */
export function scoreSequence(seq, ctx) {
  const { crops, table, planScenarios, farm, weights, ref } = ctx;
  const money = ctx.money ?? hasEconomics(crops);
  let margin = 0, refMax = 0, refMin = 0;
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
    const r = ref[i];
    refIncome += typeof r === 'number' ? r : r.rel;
    let m = null;
    if (money) {
      const prev = i > 0 ? crops[seq[i - 1]] : null;
      const prevSuit = i > 0 ? table[planScenarios[i - 1]][(i - 1) % 3][seq[i - 1]].suit : 1;
      m = seasonMargin(c, ev, mod, prev, prevSuit);
      margin += m.margin;
      refMax += typeof r === 'number' ? 0 : r.max;
      refMin += typeof r === 'number' ? 0 : r.min;
    }
    detail.push({ crop: c.id, suit: ev.suit, mod, prob, n: ev.risk.n, irrigation: ev.water ? ev.water.irrigation : 0, unmet: ev.water ? ev.water.unmet : 0, limiting: ev.limiting, margin: m ? m.margin : null, nSaved: m ? m.nSaved : 0 });
  }
  const L = seq.length;
  const nScore = clamp((netN / L + 120) / 220);
  const div = planted ? clamp(families.size / Math.min(4, planted)) : 0;
  const erosion = (P.slope[farm.slope] ?? 0.5) * (bare / L) * 0.3;
  const lowOM = farm.organic_matter === 'low' ? 0.05 : 0;
  const soil = clamp(0.35 * nScore + 0.25 * cov / L / 3 + (0.15 + lowOM) * res / L / 3 + 0.25 * div - 0.08 * rep - erosion);
  const water = demand ? clamp(1 - used / demand) : 1;
  const risk = riskN ? clamp(1 - riskSum / riskN) : 1; // 1 = safe
  // Money mode: 0 = the worst viable crop every season, 1 = the best one every season (fallow = ₡0 sits in between).
  const incomeRel = money
    ? (refMax > refMin ? clamp((margin - refMin) / (refMax - refMin)) : 0)
    : (refIncome ? clamp(income / refIncome) : 0);
  const W = (weights.soil + weights.water + weights.risk + weights.income) || 1;
  const total = (weights.soil * soil + weights.water * water + weights.risk * risk + weights.income * incomeRel) / W;
  return { total, soil, water, risk, income: incomeRel, margin: money ? margin : null, irrigation, rep, families: families.size, planted, netN: netN / L, detail };
}

/** Per slot: best relative margin (legacy) and the best / worst money margin among viable crops (fallow = 0 included). */
function incomeReference(crops, table, planScenarios) {
  return planScenarios.map((s, i) => {
    const evs = table[s][i % 3];
    const rel = Math.max(...crops.map((c, k) => c.relative_margin * evs[k].suit));
    const viable = crops.map((c, k) => [c, evs[k]]).filter(([c, ev]) => c.group === 'none' || ev.suit >= P.minSuitability);
    const ms = viable.map(([c, ev]) => seasonMargin(c, ev).margin);
    return { rel, max: Math.max(0, ...ms), min: Math.min(0, ...ms) };
  });
}

/** Finds the best sequences (beam search). */
function search(ctx, allowed) {
  let beam = [[]];
  for (let i = 0; i < ctx.planScenarios.length; i++) {
    const next = [];
    for (const s of beam) for (const k of allowed[i]) {
      if (ctx.crops[k].green_manure && s.filter((x) => ctx.crops[x].green_manure).length >= P.maxGreenManureSeasons) continue;
      const q = s.concat(k);
      next.push([q, scoreSequence(q, { ...ctx, planScenarios: ctx.planScenarios.slice(0, q.length), ref: ctx.ref.slice(0, q.length) }).total]);
    }
    next.sort((a, b) => b[1] - a[1]);
    beam = next.slice(0, P.beamWidth).map((x) => x[0]);
  }
  return beam;
}

/**
 * Crops grown in a canton (catalog column "cantons", from data/catalog/crop_cantons.csv).
 * A crop without a list (green manures, fallow) fits every canton.
 */
export function cropsForCanton(crops, cantonId) {
  return crops.filter((c) => !cantonId || !Array.isArray(c.cantons) || c.cantons.includes(cantonId));
}

const lower = (name) => name.charAt(0).toLowerCase() + name.slice(1);

/** Plain-language reasons, always with the number behind them. Risk is given as a count ("1 of 2 years"). */
function reasons(plan, base, crops, ctx) {
  const r = [];
  const sc = plan.scores;
  const seq = plan.sequence;
  if (!sc.planted) return [t('r.nothing')];
  const legs = seq.filter((k) => crops[k].legume).length;
  const green = seq.filter((k) => crops[k].green_manure).length;
  if (legs) r.push(t('r.legumes', { legs, green }));
  r.push(sc.rep ? t('r.repeats', { rep: sc.rep }) : t('r.families', { n: sc.families }));
  if (ctx.farm.irrigation !== 'none' || sc.irrigation > 1) {
    r.push(t('r.irrigation', { mm: Math.round(sc.irrigation), diff: base ? Math.round(sc.irrigation - base.scores.irrigation) : null }));
  }
  let weakest = null;
  sc.detail.forEach((d, i) => { if (crops[seq[i]].group !== 'none' && d.prob != null && (!weakest || d.prob > weakest.prob)) weakest = { ...d, i }; });
  if (weakest && weakest.prob > 0) {
    const s = SEASONS[weakest.i % 3];
    r.push(t('r.weak', {
      crop: lower(cropName(crops[seq[weakest.i]])), season: seasonText(s.id).name, year: Math.floor(weakest.i / 3) + 1,
      k: Math.round(weakest.prob * weakest.n), n: weakest.n, limiting: weakest.limiting ? t(`lim.${weakest.limiting}`) : '',
    }));
  } else r.push(t('r.noShort'));
  if (sc.margin != null) {
    // The margin itself is shown in the money box of each plan; reasons only flag losses and savings.
    let worst = null;
    sc.detail.forEach((d, i) => { if (crops[seq[i]].group !== 'none' && crops[seq[i]].yield_t_ha && d.margin != null && d.margin < 0 && (!worst || d.margin < worst.margin)) worst = { ...d, i }; });
    if (worst) r.push(t('r.loss', { crop: lower(cropName(crops[seq[worst.i]])), season: seasonText(SEASONS[worst.i % 3].id).name, year: Math.floor(worst.i / 3) + 1, crc: -worst.margin }));
    const saved = sc.detail.reduce((a, d) => a + (d.nSaved || 0), 0);
    if (saved > 0) r.push(t('r.nsaved', { crc: saved }));
  }
  if (base) {
    const d = pct(plan.scores.total - base.scores.total);
    if (d > 0) r.push(t('r.above', { d }));
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
  if (farm.ph == null) notices.push(t('n.noPh'));
  const weights = { soil: +priorities.soil || 0, water: +priorities.water || 0, risk: +priorities.risk || 0, income: +priorities.income || 0 };
  if (!(weights.soil + weights.water + weights.risk + weights.income)) Object.keys(weights).forEach((k) => { weights[k] = 1; });

  const table = prepareEvaluations(crops, scenarios, farm);
  const ref = incomeReference(crops, table, planScenarios);
  const money = hasEconomics(crops);
  const ctx = { crops, table, planScenarios, farm, weights, ref, money };
  const iFallow = crops.findIndex((c) => c.group === 'none');

  const excluded = new Map();
  const allowed = planScenarios.map((s, i) => {
    const ok = [];
    crops.forEach((c, k) => {
      const ev = table[s][i % 3][k];
      if (ev.excluded) excluded.set(c.id, ev.phRange);
      if (c.group === 'none' || ev.suit >= P.minSuitability) ok.push(k);
    });
    return ok;
  });
  for (const [c, range] of excluded) notices.push(t('n.excluded', { crop: cropName(crops.find((x) => x.id === c)), ph: farm.ph, ...range }));

  // What is planted today: the current crop wherever it fits, fallow elsewhere.
  const iCurrent = crops.findIndex((c) => c.id === farm.current_crop);
  const baseSeq = planScenarios.map((s, i) => (iCurrent >= 0 && crops[iCurrent].group !== 'none' && table[s][i % 3][iCurrent].suit >= P.minSuitability ? iCurrent : iFallow));
  const base = { sequence: baseSeq, scores: scoreSequence(baseSeq, ctx) };

  // Max-loss filter (in colones): a plan may earn at most max_loss_pct % less than today
  // (measured on |today's margin| when today loses money).
  const key = money ? 'margin' : 'income';
  let lossHit = false;
  const keepLoss = (list) => {
    if (farm.max_loss_pct == null || iCurrent < 0) return list;
    const b = base.scores[key];
    const floor = b - Math.abs(b) * (farm.max_loss_pct / 100);
    const kept = list.filter((c) => c.scores[key] >= floor);
    if (kept.length) return kept;
    lossHit = true;
    return list;
  };

  // Plan A follows the farmer's priorities. Plans B and C follow profiles (more money, safer, better soil):
  // the same weights with extra weight on one axis, so the three plans are real alternatives, not near-copies.
  const runs = [['mine', weights], ...P.profiles.map(([id, extra]) => [id, Object.fromEntries(Object.entries(weights).map(([k, v]) => [k, v + (extra[k] || 0)]))])];
  const mix = (s) => [...new Set(s)].sort().join(',');
  const differs = (a, b) => a.sequence.filter((k, i) => k !== b.sequence[i]).length >= 3;
  const plans = [];
  const pool = [];
  for (const [profile, w] of runs) {
    if (plans.length === 3) break;
    const pctx = { ...ctx, weights: w };
    const found = keepLoss(search(pctx, allowed).map((s) => ({ sequence: s, scores: scoreSequence(s, ctx), profile })));
    found.sort((x, y) => scoreSequence(y.sequence, pctx).total - scoreSequence(x.sequence, pctx).total);
    pool.push(...found);
    const pick = found.find((c) => plans.every((p) => differs(p, c) && mix(p.sequence) !== mix(c.sequence)))
      || found.find((c) => plans.every((p) => differs(p, c)));
    if (pick) plans.push(pick);
  }
  for (const c of pool.sort((x, y) => y.scores.total - x.scores.total)) { // fewer than 3: fill with the next best
    if (plans.length === 3) break;
    if (plans.every((p) => differs(p, c))) plans.push({ ...c, profile: 'alt' });
  }
  if (lossHit) notices.push(t('n.maxloss', { p: farm.max_loss_pct }));

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

  return { plans, base, notices, money };
}
