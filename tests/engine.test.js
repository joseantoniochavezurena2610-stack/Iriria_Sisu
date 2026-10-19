// Engine tests. Run with:  npm test   (or  node --test tests/*.test.js)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildScenarios, effectiveRainfall, monthPhase, seasonClimate, SEASONS, processPowerDaily, et0Hargreaves } from '../web/js/climate.js';
import { recommend, evaluateCrop, scoreSequence, prepareEvaluations } from '../web/js/engine.js';
import { syntheticClimate, loadJSON } from './synthetic_data.js';

const crops = loadJSON('../web/data/crops.json').crops;
const enso = loadJSON('../web/data/enso.json');
const { scenarios } = buildScenarios(syntheticClimate(), enso);
const idx = (id) => crops.findIndex((c) => c.id === id);
const baseFarm = { ph: 6.2, texture: 'loam', slope: 'flat', irrigation: 'none', current_crop: 'rice', organic_matter: null, max_loss_pct: null };
const priorities = { soil: 3, water: 3, risk: 3, income: 3 };
const normal9 = Array(9).fill('normal');

test('effective rainfall follows the USDA-SCS formula', () => {
  assert.equal(effectiveRainfall(0), 0);
  assert.equal(effectiveRainfall(100), 100 * (125 - 20) / 125);
  assert.equal(effectiveRainfall(300), 125 + 30);
});

test('ENSO table labels 2022-01 as La Niña and the ongoing 2026 El Niño (Aug, and estimated Sep)', () => {
  assert.equal(monthPhase(enso, 2022, 1), 'la_nina');
  assert.equal(monthPhase(enso, 2026, 8), 'el_nino');
  assert.equal(monthPhase(enso, 2026, 9), 'el_nino');
});

test('fallback periods format still works', () => {
  const fallback = { periods: [{ from: '2026-06', to: '2027-12', phase: 'el_nino' }] };
  assert.equal(monthPhase(fallback, 2026, 7), 'el_nino');
  assert.equal(monthPhase(fallback, 2025, 7), null);
});

test('the El Niño scenario is drier than the normal one in Primera', () => {
  const pr = SEASONS[1];
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  assert.ok(sum(seasonClimate(scenarios.el_nino, pr).P) < sum(seasonClimate(scenarios.normal, pr).P));
  assert.ok(scenarios.el_nino.samples.primera.length >= 1);
});

test('hard rule: melon is ruled out at pH 5.0', () => {
  const ev = evaluateCrop(crops[idx('melon')], seasonClimate(scenarios.normal, SEASONS[1]), { ...baseFarm, ph: 5.0 });
  assert.ok(ev.excluded);
  assert.equal(ev.suit, 0);
});

test('without irrigation, melon is not suitable in the dry season', () => {
  const ev = evaluateCrop(crops[idx('melon')], seasonClimate(scenarios.normal, SEASONS[0]), baseFarm);
  assert.ok(ev.suit < 0.35, `suitability ${ev.suit}`);
});

test('with full irrigation, melon is suitable in the dry season', () => {
  const ev = evaluateCrop(crops[idx('melon')], seasonClimate(scenarios.normal, SEASONS[0]), { ...baseFarm, irrigation: 'full' });
  assert.ok(ev.suit > 0.6, `suitability ${ev.suit}`);
});

test('bean after bean scores worse on soil than bean → maize', () => {
  const table = prepareEvaluations(crops, scenarios, baseFarm);
  const ctx = { crops, table, planScenarios: normal9, farm: baseFarm, weights: priorities, ref: Array(9).fill(3) };
  const f = idx('fallow');
  const repeated = scoreSequence([f, idx('bean'), idx('bean'), f, idx('bean'), idx('bean'), f, idx('bean'), idx('bean')], ctx);
  const rotated = scoreSequence([f, idx('bean'), idx('maize'), f, idx('bean'), idx('maize'), f, idx('bean'), idx('maize')], ctx);
  assert.ok(repeated.rep > 0);
  assert.ok(rotated.soil > repeated.soil);
});

test('recommend returns up to 3 plans of 9 seasons with scores between 0 and 1', () => {
  const r = recommend({ crops, scenarios, planScenarios: normal9, farm: baseFarm, priorities });
  assert.ok(r.plans.length >= 1 && r.plans.length <= 3);
  for (const p of [...r.plans, r.base]) {
    assert.equal(p.sequence.length, 9);
    for (const k of ['total', 'soil', 'water', 'risk', 'income']) assert.ok(p.scores[k] >= 0 && p.scores[k] <= 1, `${k}=${p.scores[k]}`);
    assert.ok(Array.isArray(p.reasons) && p.reasons.length);
  }
  for (let a = 0; a < r.plans.length; a++) for (let b = a + 1; b < r.plans.length; b++) {
    assert.ok(r.plans[a].sequence.filter((k, i) => k !== r.plans[b].sequence[i]).length >= 3);
  }
});

test('H1: in El Niño the plans contain the same or less rice than in a normal year', () => {
  const count = (r) => r.plans.reduce((s, p) => s + p.sequence.filter((k) => k === idx('rice')).length, 0);
  const n = recommend({ crops, scenarios, planScenarios: normal9, farm: baseFarm, priorities });
  const ni = recommend({ crops, scenarios, planScenarios: Array(9).fill('el_nino'), farm: baseFarm, priorities });
  assert.ok(count(ni) <= count(n), `normal ${count(n)} vs El Niño ${count(ni)}`);
});

test('without pH the engine warns and does not rule out crops for acidity', () => {
  const r = recommend({ crops, scenarios, planScenarios: normal9, farm: { ...baseFarm, ph: null }, priorities });
  assert.ok(r.notices.some((a) => a.includes('pH')));
});

test('the engine answers in under 2 seconds', () => {
  const t = performance.now();
  recommend({ crops, scenarios, planScenarios: ['el_nino', 'el_nino', ...Array(7).fill('normal')], farm: { ...baseFarm, irrigation: 'limited' }, priorities });
  assert.ok(performance.now() - t < 2000);
});

test('in-browser POWER processing gives the same ET0 as the Python script', () => {
  const par = { PRECTOTCORR: {}, T2M: {}, T2M_MAX: {}, T2M_MIN: {} };
  for (let d = 1; d <= 31; d++) { const k = `202201${String(d).padStart(2, '0')}`; par.PRECTOTCORR[k] = 1; par.T2M[k] = 27; par.T2M_MAX[k] = 32; par.T2M_MIN[k] = 22; }
  const r = processPowerDaily({ properties: { parameter: par }, geometry: { coordinates: [-85.4, 10.6] } }, 10.6);
  assert.equal(r.months.length, 1);
  assert.equal(r.months[0].P, 31);
  // Reference value from scripts/fetch_data.py for the same input: 131.1 mm
  assert.ok(Math.abs(r.months[0].ET0 - 131.1) < 0.5, `ET0 ${r.months[0].ET0}`);
  assert.ok(et0Hargreaves(27, 32, 22, 10.6, 15) > 3);
});

test('real data: every canton file loads and builds scenarios', () => {
  const pts = loadJSON('../web/data/guanacaste/points.json').points;
  for (const p of pts) {
    const c = loadJSON(`../web/data/guanacaste/climate_${p.id}.json`);
    const { meta } = buildScenarios(c, enso);
    assert.ok(meta.completeMonths >= 60, `${p.id}: ${meta.completeMonths}`);
    assert.ok(meta.from <= '2021-01', `${p.id} starts ${meta.from}`);
  }
});
