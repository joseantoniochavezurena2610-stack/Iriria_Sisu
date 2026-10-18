# Plan del líder científico

El trabajo del líder científico es que **cada número que sale de la app sea defendible**. Los jueces de "Best Use of Science" premian una pregunta clara, datos bien usados, validación y límites honestos — no la cantidad de datasets.

## 1. Pregunta e hipótesis (dejar escritas antes del evento)
- **Pregunta:** ¿Qué rotaciones de 3 años mantienen el ingreso y mejoran el suelo de una finca de granos en el Pacífico Norte de Costa Rica cuando ocurre un año El Niño?
- **Hipótesis H1:** en años El Niño, las rotaciones con leguminosas y cultivos de menor demanda hídrica (maíz, sorgo, frijol, caupí) tienen menor riesgo de déficit hídrico que el arroz continuo sin riego, sin perder más de X % de margen.
- **Hipótesis H2:** el plan recomendado en un año neutro no siempre es el mejor en un año El Niño; la herramienta detecta cuáles planes son robustos en ambos.

## 2. Tareas antes del evento (hasta el 13-nov)
| Prioridad | Tarea | Entregable |
|---|---|---|
| 🔴 | Elegir **una** región piloto (recomendado: Pacífico Norte — Liberia/Nicoya/Cañas) y 6-8 cultivos | Decisión escrita en `docs/plan.md` |
| 🔴 | Llenar el **catálogo de cultivos** con fuente por cada número | `data/catalogo/cultivos_plantilla.csv` |
| 🔴 | Definir años análogos: neutro vs. El Niño (2015, 2023) y comprobar con IMERG/POWER que la lluvia del Pacífico Norte realmente cayó | Notebook con gráfico lluvia por época |
| 🟠 | Corregir los datos marcados ⚠️ y ❓ en `docs/investigacion/resumen-verificado.md` | Tabla sin ❓ en lo que vaya al pitch |
| 🟠 | Escribir las fórmulas de cada eje (Suelo, Agua, Riesgo, Ingreso) en una página | `docs/motor-reglas.md` |
| 🟠 | Conseguir precios (PIMA/CENADA) y costos de producción (MAG/INTA) de los cultivos | Columnas económicas del catálogo |
| 🟡 | Protocolo de calibración del sensor con suelo real (gravimétrico) junto con quien haga hardware | Curva de calibración |
| 🟡 | Preguntar a un agrónomo/extensionista (MAG, INTA, UCR, UTN) si los planes tienen sentido | 1-2 citas de validación experta |

## 3. Validación (lo que más pesa con los jueces)
1. **Backtest (prueba hacia atrás):** correr el motor con el clima real de 2015 y 2023. ¿Los planes con arroz sin riego salen con riesgo alto en esos años? ¿Coincide con la caída real de área de arroz (−59 % entre 2022 y 2023, ENA 2024)?
2. **Contraste con NDVI:** en esos años, ¿el NDVI (HLS/VIIRS) de zonas de granos del Pacífico Norte bajó? Es evidencia satelital independiente de que el estrés que el motor predice existió.
3. **Análisis de sensibilidad:** mover ±20 % los parámetros más inciertos (demanda de agua, crédito de N, precios) y ver si el top 3 cambia. Si no cambia → resultado robusto; si cambia → se dice.
4. **Validación experta:** que un extensionista revise 3 planes y diga si los haría.
5. **Pruebas automáticas (pytest):** reglas conocidas — p. ej. "arroz no pasa el filtro con pH 4,5", "frijol después de frijol se penaliza".

## 4. Reglas de oro durante el hackatón
- Ningún número en la app ni en el pitch sin fuente en `docs/fuentes-datos.md`.
- Toda salida muestra su **escala** ("dato regional ~50 km" vs. "dato de tu parcela").
- Si no hay dato, la app lo dice; no se rellena.
- El LLM (si se usa) solo redacta con números del motor; nunca genera datos.
- Freeze de la ciencia a la hora ~30: desde ahí solo se explica, no se cambian fórmulas.

## 5. Tu parte del pitch (≈20 s, "Ciencia detrás")
Guion base: *"Usamos 30 años de lluvia NASA para la finca, el suelo de SoilGrids y rangos de cultivo de la FAO. Probamos el motor contra El Niño de 2015 y 2023: los planes que marcó como riesgosos son los mismos que fallaron en la realidad. Y cada recomendación dice de dónde sale y qué tan precisa es."*

## 6. Coordinación con el equipo
- **Datos/sistemas:** vos definís qué variable y período; ellos la bajan y la guardan en Parquet.
- **Hardware (sensor):** vos definís qué se mide y cómo se calibra.
- **Industrial:** costos, precios y modelo de piloto con MAG/cooperativa.
- **Diseño:** cómo se ven las razones y la escala de cada dato para un agricultor.
- Checkpoint científico cada 3 h: ¿los números siguen teniendo sentido?
