# Plan del líder científico (Jose Antonio)

Que **cada número que sale de la app sea defendible**. Los jueces de "Best Use of Science" premian una pregunta clara, datos bien usados, validación y límites honestos.

## 1. Pregunta e hipótesis
- **Pregunta:** ¿Qué rotaciones de 3 años mantienen el ingreso y mejoran el suelo de una finca de granos en Guanacaste cuando ocurre un año El Niño?
- **H1:** en años El Niño, las rotaciones con leguminosas y cultivos tolerantes a sequía (sorgo, caupí, canavalia) tienen menor riesgo de déficit hídrico que el arroz sin riego, sin perder más de X % de ingreso. *(Prueba automática: `tests/motor.test.js`, caso H1.)*
- **H2:** el mejor plan de un año normal no siempre es el mejor en un año El Niño; la herramienta identifica los planes robustos.

## 2. Datos (regla: 2021 → hoy)
- Escenarios con meses reales: El Niño 2023-24 (débil en Guanacaste: Pacífico Norte solo −9 % en 2023) y El Niño 2026 (−37 % ene-ago). Esa diferencia es un hallazgo, no un problema: la app muestra el rango.
- El Niño 2015 queda **solo como contexto** (fuera de la ventana de 5 años).

## 3. Tareas antes del evento
| Prioridad | Tarea | Entregable |
|---|---|---|
| 🔴 | Verificar cada valor del catálogo con fuente (FAO-56, ECOCROP, fichas INTA/MAG) | `verificado_por` lleno en el CSV |
| 🔴 | Revisar las fórmulas y umbrales de [`motor-reglas.md`](../motor-reglas.md) | Comentarios / PR |
| 🔴 | Revisar el [glosario](../glosario.md): que las definiciones sean correctas | PR |
| 🟠 | Comparar lluvia POWER con estaciones del IMN (Liberia, Nicoya) para 2021-2026 | Tabla + conclusión |
| 🟠 | Resolver los datos ❓ de `investigacion/resumen-verificado.md` | Tabla sin ❓ en lo que vaya al video |
| 🟡 | Validación experta con un agrónomo/extensionista | 1-2 citas |

## 4. Validación
1. **Backtest 2026**: correr el motor con el clima de mayo 2026; ¿desaconseja arroz sin riego en Nandayure? (Los arroceros de Nandayure y Jicaral no sembraron.)
2. **Backtest 2023**: El Niño débil en Guanacaste → el motor no debería castigar tanto.
3. **Sensibilidad ±20 %** en Kc, umbral de falla, crédito de N y márgenes: ¿cambia el top 3?
4. **Contraste IMERG vs POWER** (José Pablo).
5. **Pruebas automáticas** (`npm test`) para cada regla nueva.

## 5. Reglas de oro
- Ningún número sin fuente en `fuentes-datos.md` / `datos-confirmados.md`.
- Toda salida dice su escala ("dato regional de decenas de km").
- Si no hay dato, la app lo dice; no se rellena en silencio.
- Freeze de la ciencia el 13-nov.

## 6. Tu parte en el video
La escena 10–20 s (normal vs El Niño). Revisá que el cantón y los números mostrados sean reales y estén verificados.
