// SYNTHETIC data shaped like climate_<id>.json, to test the engine without internet.
// They mimic Guanacaste's pattern (dry Dec–Apr, mid-summer drought Jul–Aug) but are NOT real data.
import { readFileSync } from 'node:fs';

const RAIN = [3, 2, 5, 25, 200, 240, 140, 170, 330, 320, 110, 15]; // mm/month
const ET0 = [165, 170, 195, 185, 150, 130, 140, 140, 120, 120, 125, 145];
const TEMP = [27.5, 28.2, 29, 29.5, 28.3, 27.4, 27.5, 27.3, 26.8, 26.6, 26.8, 27];

export function syntheticClimate() {
  const months = [];
  for (let year = 2021; year <= 2026; year++) {
    for (let month = 1; month <= 12; month++) {
      if (year === 2026 && month > 9) break;
      const nino = (year === 2023 && month >= 6) || (year === 2024 && month <= 3) || (year === 2026 && month >= 6);
      const noise = 1 + 0.1 * Math.sin(year * 7 + month);
      months.push({ year, month, P: +(RAIN[month - 1] * (nino ? 0.5 : 1) * noise).toFixed(1), ET0: ET0[month - 1] * (nino ? 1.05 : 1), T: TEMP[month - 1] + (nino ? 0.8 : 0) });
    }
  }
  return { id: 'synthetic', name: 'Test', months };
}

export function loadJSON(path) {
  return JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
}
