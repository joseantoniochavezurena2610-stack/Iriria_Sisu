// Datos SINTÉTICOS con la forma de clima_<id>.json, para probar el motor sin internet.
// Imitan el patrón de Guanacaste (seca dic–abr, canícula jul–ago) pero NO son datos reales.
import { readFileSync } from 'node:fs';

const LLUVIA = [3, 2, 5, 25, 200, 240, 140, 170, 330, 320, 110, 15]; // mm/mes
const ET0 = [165, 170, 195, 185, 150, 130, 140, 140, 120, 120, 125, 145];
const TEMP = [27.5, 28.2, 29, 29.5, 28.3, 27.4, 27.5, 27.3, 26.8, 26.6, 26.8, 27];

export function climaSintetico() {
  const meses = [];
  for (let anio = 2021; anio <= 2026; anio++) {
    for (let mes = 1; mes <= 12; mes++) {
      if (anio === 2026 && mes > 9) break;
      const nino = (anio === 2023 && mes >= 6) || (anio === 2024 && mes <= 3) || (anio === 2026 && mes >= 6);
      const ruido = 1 + 0.1 * Math.sin(anio * 7 + mes);
      meses.push({ anio, mes, P: +(LLUVIA[mes - 1] * (nino ? 0.5 : 1) * ruido).toFixed(1), ET0: ET0[mes - 1] * (nino ? 1.05 : 1), T: TEMP[mes - 1] + (nino ? 0.8 : 0) });
    }
  }
  return { id: 'sintetico', nombre: 'Prueba', meses };
}

export function cargarJSON(ruta) {
  return JSON.parse(readFileSync(new URL(ruta, import.meta.url), 'utf8'));
}
