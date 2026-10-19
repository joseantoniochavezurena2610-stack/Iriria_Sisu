# Motor de rotación — reglas y fórmulas

Implementación: [`web/js/motor.js`](../web/js/motor.js) y [`web/js/clima.js`](../web/js/clima.js). Pruebas: [`tests/motor.test.js`](../tests/motor.test.js). Todos los parámetros ajustables están en `PARAMETROS` (motor.js) y en el catálogo CSV. **Cambiar una fórmula = cambiar este documento + su prueba.**

## 1. Entradas
| Entrada | De dónde sale |
|---|---|
| Clima mensual 2021 → hoy: lluvia `P`, temperatura `T`, ET0 | NASA POWER (precalculado por cantón) |
| Fase ENSO de cada mes | NOAA CPC (RONI/ONI) |
| Catálogo de cultivos | `data/catalogo/cultivos_guanacaste.csv` |
| Finca: pH (opcional), textura, pendiente, riego, cultivo actual, materia orgánica (opcional), pérdida máxima (opcional) | El agricultor |
| Prioridades Suelo / Agua / Riesgo / Ingreso (0–5) | El agricultor |

## 2. Escenarios (clima.js)
- **Normal**: promedio de cada mes calendario usando solo meses **no** El Niño.
- **El Niño**: promedio usando solo meses El Niño. Si un mes calendario nunca fue El Niño en la ventana, se usa el promedio general y se marca como "relleno" (barra transparente en el gráfico).
- **Peor año**: el año con menos lluvia de mayo a noviembre.
- **Pronóstico actual**: seca y primera del año 1 con El Niño (IMN: efectos al menos hasta jul-2027); las demás 7 épocas, normal.
- **Muestras año por año** por época: se usan para calcular el riesgo (normal → años no-Niño; El Niño → años Niño; peor → todos).

## 3. Evaluación de un cultivo en una época
Épocas: **Seca** (ene–abr), **Primera** (may–ago, contiene la canícula), **Postrera** (sep–dic). El cultivo ocupa `ciclo_dias / 30,4` meses desde el inicio de la época.

1. **Calendario** (regla dura): si la época no está en la columna `epocas` del cultivo → no se propone.
2. **pH** (regla dura): fuera de [`ph_min`, `ph_max`] → descartado. Entre el mínimo y el óptimo → factor lineal de 1,0 a 0,7. Sin pH → no se aplica (y se avisa).
3. **Agua (balance tipo FAO-56)**
   - `ETc = Σ ET0_mes × kc_ciclo` en los meses del ciclo.
   - `Pe = Σ lluvia efectiva` (USDA-SCS: si P ≤ 250 mm, `P(125−0,2P)/125`; si no, `125 + 0,1P`).
   - `Reserva = agua útil(textura) × 0,6 m × 0,5` solo si el mes anterior a la época llovió más que su ET0.
   - `Déficit = max(0, ETc − Pe − Reserva)`; `Riego = min(Déficit, máx. según respuesta)` (no: 0 · un poco: 150 mm · suficiente: todo).
   - `Cobertura = (ETc − faltante) / ETc`; **factor agua** = `clamp((Cobertura − 0,5) / 0,45)`.
4. **Temperatura**: 1 dentro del rango óptimo, baja lineal hasta 0 en los límites absolutos.
5. **Exceso de lluvia**: si `lluvia / ETc > 2,5` y el cultivo tolera poco el encharcamiento, castigo mayor en suelo arcilloso.
6. **Aptitud** = agua × temperatura × pH × exceso. Si es menor que **0,35**, el cultivo no se propone en esa época.
7. **Probabilidad de falla** = fracción de años observados en que `Cobertura < 0,75 − 0,05 × tolera_sequia`.

## 4. Armado de planes
- 9 espacios (3 años × 3 épocas). Búsqueda en haz de 250 secuencias.
- **Efectos de rotación** sobre el rendimiento: misma familia seguida ×0,85; misma familia en las 3 épocas anteriores ×0,95; después de leguminosa ×1,10; después de abono verde ×1,15 (conservador frente al +20 % promedio de Zhao et al. 2022).
- Se devuelven los **3 mejores planes distintos** (cambian al menos 3 épocas y la mezcla de cultivos) + "Si sigue sembrando lo de hoy".

## 5. Ejes (0 a 100)
| Eje | Fórmula (resumen) |
|---|---|
| **Suelo** | 0,35 × balance de nitrógeno normalizado + 0,25 × cobertura + 0,15 × residuos + 0,25 × diversidad de familias − 0,08 × repeticiones − erosión (épocas con poca cobertura × factor de pendiente). Materia orgánica baja da más peso a los residuos. |
| **Agua** | 1 − (riego + déficit no cubierto) / demanda total. Mide cuánto depende el plan de agua que no da la lluvia. |
| **Seguridad (Riesgo)** | 1 − promedio de la probabilidad de falla de las épocas sembradas. |
| **Ingreso** | Σ margen_relativo × aptitud × efecto de rotación × (1 − 0,5 × prob. de falla), normalizado contra el mejor cultivo posible en cada época. **Relativo** hasta tener precios verificados. |
| **Total** | Promedio ponderado con las prioridades del agricultor. |

**Pérdida máxima**: si el agricultor la indica, se descartan planes cuyo ingreso sea menor que el de "lo de hoy" × (1 − pérdida).

**Plan robusto**: puntaje con todo El Niño ≥ 85 % del puntaje con todo normal **y** seguridad en El Niño ≥ 50.

## 6. Pendientes para el líder científico y Economía
- [ ] Verificar cada valor del catálogo con fuente (FAO-56, ECOCROP, INTA/MAG) y llenar `verificado_por`.
- [ ] Revisar umbrales: aptitud mínima 0,35; falla 0,75; reserva 50 % del agua útil; profundidad 0,6 m.
- [ ] Reemplazar `margen_relativo` por rendimiento × precio − costo (columnas ya existen en el CSV).
- [ ] Usar `GWETROOT` (humedad de suelo POWER) para la reserva inicial en vez de la regla del mes anterior.
- [ ] Análisis de sensibilidad (±20 %) y backtest 2023 / 2026.
