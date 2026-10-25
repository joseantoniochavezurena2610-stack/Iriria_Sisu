# Prices, costs and yields — Costa Rica, researched 25 Oct 2026

These are the values behind the app's **Income** axis (decision D20). They live in
`data/catalog/crops_guanacaste.csv`; run `python scripts/catalog_to_json.py` after editing.
Each crop is labelled:

- **sourced** — the figures are published Costa Rican figures.
- **derived** — computed from published figures (the calculation is written below).
- **estimate** — no Costa Rican series was found; the team's best estimate, said so in the app.

Exchange rate used where needed: ₡454.86 per US$ (BCCR buying rate, 6 Aug 2026, as printed in the MAG-SEPSA maize model).

| Crop | Yield (t/ha) | Price (₡/kg) | Cost (₡/ha) | Margin per season (₡/ha) | Confidence |
|---|---|---|---|---|---|
| Rice (rainfed) | 4.3 | 275 | 1,330,000 | −147,500 | derived |
| Maize | 3.0 | 326 | 647,835 | +330,165 | sourced |
| Sorghum | 2.5 | 245 | 470,000 | +142,500 | estimate |
| Common bean | 0.828 | 739 | 766,278 | −154,386 | sourced |
| Cowpea | 0.9 | 590 | 575,000 | −44,000 | estimate |
| Peanut | 2.0 | 550 | 900,000 | +200,000 | estimate |
| Melon | 26 | 180 | 3,389,002 | +1,290,998 | derived |
| Watermelon | 28 | 150 | 2,916,811 | +1,283,189 | derived |
| Mucuna / jack bean (green manure) | — | — | 120,000 | −120,000 (+ N saved on the next crop) | estimate |
| Fallow | — | — | 0 | 0 | n/a |

Margins shown are with suitability 1 and no water risk; the engine scales the harvest by suitability, the rotation effect and the failure probability.

**Nitrogen from legumes:** urea 46 % at ₡27,755 per 45 kg sack (MAG-SEPSA input-price survey, August 2026, national average with VAT) → ₡617 per kg of urea → **₡1,341 per kg of N**.

## How each value was obtained
- **Rice.** Mills paid ₡20,247 per 73.6 kg sack of dry, clean paddy once the minimum price ended (Semanario Universidad, 24 May 2023) → ₡275/kg. Yield 4.3 t/ha = 58.5 sacks, the weighted national average in Decree 39763-MEIC. Cost: the 2022 MEIC reference price of ₡27,253 per sack was by law the model cost plus at most 20 % profit, so cost ≈ 27,253 ÷ 1.2 × 58.5 ≈ ₡1.33 million/ha. Context: rice area fell from 35,301 ha (2021-22) to 13,709 ha (2023-24) (Conarroz via Revista Summa).
- **Maize.** MAG-SEPSA cost structure *Maíz, Región Chorotega*, model Feb 2022, updated Aug 2026: production cycle ₡647,835/ha and 3.0 t/ha. Price ₡15,000 per 46 kg quintal (Ceproma La Palmera, Upala; Semanario Universidad, 24 Nov 2023).
- **Common bean.** Defensoría de los Habitantes, 16 Jun 2026: in Chorotega producers receive ₡34,000 per quintal while it costs ₡42,571 to produce. Yield 18 quintals/ha from the MAG-SEPSA cost structure *Frijol, Región Brunca* (Jun 2025).
- **Sorghum.** No Costa Rican series. Cost and yield ratios to maize from the El Salvador MAG cost report 2019-20 (semi-technified sorghum ≈ 72.5 % of the cost of semi-technified maize); price assumed at 75 % of maize, the usual feed-grain ratio.
- **Cowpea, peanut.** No Costa Rican series; estimates stated in the CSV.
- **Melon.** MAG-SEPSA cost structure *Melón, Pacífico Central* (Feb 2025): ₡3,389,002/ha, 26 t/ha, unit cost ₡130/kg. Price estimated at ₡180/kg; PIMA publishes CENADA melon prices only as seasonal indices.
- **Watermelon.** MAG cost model *Sandía, mercado nacional, Región Chorotega* (May 2020): ₡2,916,811/ha, 28 t/ha. Price estimated at ₡150/kg.

## What this means in the app
- At published figures **rainfed rice and beans lose money** in Chorotega; the engine therefore stops proposing rainfed rice even where water is enough. The 2026 backtest notes this (part B is now partly a price signal).
- Melon and watermelon have the highest margins but need irrigation (melon) or a dry-enough Postrera, high upfront cost and a buyer; the engine does not model market risk.
- When the team finds a better public figure for any **estimate** row, edit the CSV, set the confidence, regenerate the JSON and open a PR.

## Sources
- Semanario Universidad — Productor de Guanacaste, mills paying ₡20,247 per sack (24 May 2023): https://semanariouniversidad.com/pais/productor-de-guanacaste-tengo-que-andar-de-industria-en-industria-rogandole-a-los-gerentes-que-me-compren-el-arroz/
- Decree 39763-MEIC, rice cost model structures (2016): https://faolex.fao.org/docs/pdf/cos163077.pdf
- Semanario Universidad — MEIC reference price ₡27,253 (13 Jul 2022): https://semanariouniversidad.com/pais/la-ruta-del-arroz-dejara-al-50-de-los-productores-nacionales-en-el-camino/
- Revista Summa — rice area and production in Costa Rica: https://revistasumma.com/importaciones-costo-de-produccion-y-clima-golpean-la-produccion-de-arroz-en-centroamerica/
- MAG-SEPSA (InfoAgro) — cost structures: https://www.infoagro.go.cr/costos-de-produccion/
- MAG-SEPSA — Maize, Chorotega 2026: https://infoagro.go.cr/download/5912/
- MAG-SEPSA — Bean, Brunca 2025: https://www.infoagro.go.cr/wp-content/uploads/2025/07/FRIJOL_Brunca_2025.pdf
- MAG-SEPSA — Melon, Pacífico Central 2025: https://infoagro.go.cr/wp-content/uploads/2025/02/MELON_PacificoCentral_2025.pdf
- MAG — Watermelon, national market, Chorotega 2020: https://www.mag.go.cr/bibliotecavirtual/AV-0241.pdf
- MAG-SEPSA — Input-price survey, Aug 2026: https://infoagro.go.cr/wp-content/uploads/2026/10/SEPSA-INF-2026-027_Sondeo_Insumos_Agropecuarios_agosto-2026-Final.pdf
- Defensoría de los Habitantes — bean producers' crisis (16 Jun 2026): https://www.dhr.go.cr/informacion_relevante/comunicados/2026/junio_comunicados/018_Productores_nacionales_frijol_enfrentan_peores_crisis.pdf
- Semanario Universidad — Upala maize at ₡15,000 per quintal (24 Nov 2023): https://semanariouniversidad.com/pais/productores-de-upala-afectados-por-importaciones-tienen-184-000-kilos-de-maiz-para-vender-con-urgencia/
- MAG El Salvador — cost report 2019-20: https://www.mag.gob.sv/wp-content/uploads/2021/09/INFORMES-DE-COSTOS-DEPRODUCCION-2019-2020.pdf
