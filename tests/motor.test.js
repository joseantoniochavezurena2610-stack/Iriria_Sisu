// Pruebas del motor. Correr con:  npm test   (o  node --test tests/)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { construirEscenarios, lluviaEfectiva, faseMes, climaEpoca, EPOCAS } from '../web/js/clima.js';
import { recomendar, evaluarCultivo, evaluarSecuencia, prepararEvaluaciones } from '../web/js/motor.js';
import { climaSintetico, cargarJSON } from './datos_sinteticos.js';

const cultivos = cargarJSON('../web/data/cultivos.json').cultivos;
const enso = cargarJSON('../web/data/enso.json');
const { escenarios } = construirEscenarios(climaSintetico(), enso);
const idx = (id) => cultivos.findIndex((c) => c.cultivo === id);
const fincaBase = { ph: 6.2, textura: 'franco', pendiente: 'plana', riego: 'no', cultivo_actual: 'arroz', materia_organica: null, perdida_max_pct: null };
const prioridades = { suelo: 3, agua: 3, riesgo: 3, ingreso: 3 };
const normal9 = Array(9).fill('normal');

test('lluvia efectiva (USDA-SCS) se comporta como la fórmula', () => {
  assert.equal(lluviaEfectiva(0), 0);
  assert.equal(lluviaEfectiva(100), 100 * (125 - 20) / 125);
  assert.equal(lluviaEfectiva(300), 125 + 30);
});

test('la tabla ENSO de respaldo marca 2026-08 como El Niño y 2022-01 como La Niña', () => {
  assert.equal(faseMes(enso, 2026, 8), 'el_nino');
  assert.equal(faseMes(enso, 2022, 1), 'la_nina');
});

test('el escenario El Niño es más seco que el normal en la primera', () => {
  const pr = EPOCAS[1];
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  assert.ok(sum(climaEpoca(escenarios.el_nino, pr).P) < sum(climaEpoca(escenarios.normal, pr).P));
  assert.ok(escenarios.el_nino.muestras.primera.length >= 1);
});

test('regla dura: el melón queda descartado con pH 5,0', () => {
  const ev = evaluarCultivo(cultivos[idx('melon')], climaEpoca(escenarios.normal, EPOCAS[1]), { ...fincaBase, ph: 5.0 });
  assert.ok(ev.excluido);
  assert.equal(ev.apt, 0);
});

test('sin riego, el melón no es apto en la época seca', () => {
  const ev = evaluarCultivo(cultivos[idx('melon')], climaEpoca(escenarios.normal, EPOCAS[0]), fincaBase);
  assert.ok(ev.apt < 0.35, `aptitud ${ev.apt}`);
});

test('con riego completo, el melón sí es apto en la seca', () => {
  const ev = evaluarCultivo(cultivos[idx('melon')], climaEpoca(escenarios.normal, EPOCAS[0]), { ...fincaBase, riego: 'completo' });
  assert.ok(ev.apt > 0.6, `aptitud ${ev.apt}`);
});

test('frijol seguido de frijol puntúa peor en suelo que frijol → maíz', () => {
  const tabla = prepararEvaluaciones(cultivos, escenarios, fincaBase);
  const ctx = { cultivos, tabla, planEsc: normal9, finca: fincaBase, pesos: prioridades, ref: Array(9).fill(3) };
  const d = idx('descanso');
  const repetido = evaluarSecuencia([d, idx('frijol'), idx('frijol'), d, idx('frijol'), idx('frijol'), d, idx('frijol'), idx('frijol')], ctx);
  const rotado = evaluarSecuencia([d, idx('frijol'), idx('maiz'), d, idx('frijol'), idx('maiz'), d, idx('frijol'), idx('maiz')], ctx);
  assert.ok(repetido.rep > 0);
  assert.ok(rotado.suelo > repetido.suelo);
});

test('recomendar devuelve hasta 3 planes de 9 épocas con puntajes entre 0 y 1', () => {
  const r = recomendar({ cultivos, escenarios, planEsc: normal9, finca: fincaBase, prioridades });
  assert.ok(r.planes.length >= 1 && r.planes.length <= 3);
  for (const p of [...r.planes, r.base]) {
    assert.equal(p.secuencia.length, 9);
    for (const k of ['total', 'suelo', 'agua', 'riesgo', 'ingreso']) assert.ok(p.puntajes[k] >= 0 && p.puntajes[k] <= 1, `${k}=${p.puntajes[k]}`);
    assert.ok(Array.isArray(p.razones) && p.razones.length);
  }
  // planes distintos entre sí en al menos 3 épocas
  for (let a = 0; a < r.planes.length; a++) for (let b = a + 1; b < r.planes.length; b++) {
    assert.ok(r.planes[a].secuencia.filter((k, i) => k !== r.planes[b].secuencia[i]).length >= 3);
  }
});

test('H1: en El Niño los planes llevan igual o menos arroz que en un año normal', () => {
  const cuenta = (r) => r.planes.reduce((s, p) => s + p.secuencia.filter((k) => k === idx('arroz')).length, 0);
  const n = recomendar({ cultivos, escenarios, planEsc: normal9, finca: fincaBase, prioridades });
  const ni = recomendar({ cultivos, escenarios, planEsc: Array(9).fill('el_nino'), finca: fincaBase, prioridades });
  assert.ok(cuenta(ni) <= cuenta(n), `normal ${cuenta(n)} vs El Niño ${cuenta(ni)}`);
});

test('sin pH el motor avisa y no descarta por acidez', () => {
  const r = recomendar({ cultivos, escenarios, planEsc: normal9, finca: { ...fincaBase, ph: null }, prioridades });
  assert.ok(r.avisos.some((a) => a.includes('pH')));
});

test('el motor responde en menos de 2 segundos', () => {
  const t = performance.now();
  recomendar({ cultivos, escenarios, planEsc: ['el_nino', 'el_nino', ...Array(7).fill('normal')], finca: { ...fincaBase, riego: 'limitado' }, prioridades });
  assert.ok(performance.now() - t < 2000);
});

test('procesarPowerDiario (navegador) da el mismo ET0 que el script de Python', async () => {
  const { procesarPowerDiario, et0Hargreaves } = await import('../web/js/clima.js');
  const par = { PRECTOTCORR: {}, T2M: {}, T2M_MAX: {}, T2M_MIN: {} };
  for (let d = 1; d <= 31; d++) { const k = `202201${String(d).padStart(2, '0')}`; par.PRECTOTCORR[k] = 1; par.T2M[k] = 27; par.T2M_MAX[k] = 32; par.T2M_MIN[k] = 22; }
  const r = procesarPowerDiario({ properties: { parameter: par }, geometry: { coordinates: [-85.4, 10.6] } }, 10.6);
  assert.equal(r.meses.length, 1);
  assert.equal(r.meses[0].P, 31);
  // Valor de referencia calculado con scripts/descargar_datos.py para los mismos datos: 131.1 mm
  assert.ok(Math.abs(r.meses[0].ET0 - 131.1) < 0.5, `ET0 ${r.meses[0].ET0}`);
  assert.ok(et0Hargreaves(27, 32, 22, 10.6, 15) > 3);
});
