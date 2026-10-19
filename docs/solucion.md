# Solución — v3 (18-oct-2026)

## El problema en una frase
En Guanacaste, El Niño 2026-27 ya recortó más de un tercio de la lluvia y seguirá al menos hasta julio de 2027; los productores de granos deciden qué sembrar sin una herramienta que una el clima que viene, su suelo y su bolsillo.

## La idea en una frase
**Iriria Sìsù** es una página web que, con lo que el agricultor sabe de su finca y la lluvia real de la NASA desde 2021, compara 3 planes de rotación a 3 años y muestra qué le pasa al suelo, al agua, al riesgo y al ingreso en un año normal y en uno El Niño.

## Qué cambió respecto a la v2
| v2 | v3 | Por qué |
|---|---|---|
| Streamlit (Python) | **Web estática 100 %** (HTML/JS), motor en el navegador | Abre en cualquier celular con un enlace; $0; dominio propio |
| Región por decidir | **Guanacaste**, 11 cantones | Zona más golpeada por El Niño |
| 30 años de clima (1995-2025) | **2021 → hoy** (mínimo 5 años) | Regla del equipo; incluye El Niño 2023 y 2026 y La Niña 2021-23 y 2024-26 |
| Sensor ESP32 como parte central | **El agricultor ingresa sus datos**; sensor opcional | No depender de hardware |
| Pitch en vivo + video | **Solo video (≤ 30 s) + prototipo** | Entregables definidos |
| 4 épocas | 3 épocas (Seca, Primera, Postrera); la canícula vive dentro de la Primera y entra al riesgo con la lluvia real | Más simple para el agricultor, igual de fiel |
| Parquet | JSON pequeño versionado, generado por GitHub Actions | La web lo lee directo |

## Flujo
1. **Datos** (automático, semanal): NASA POWER diario por cantón → mensual + ET0 (Hargreaves); índice ENSO de NOAA. Opcionales: SoilGrids (referencia de suelo), IMERG (contraste de lluvia).
2. **El agricultor** marca su cantón (lista, mapa o ubicación), su cultivo, si tiene riego, textura (prueba de la cinta), pH si lo sabe, pendiente y prioridades.
3. **Motor** (en el navegador): evalúa cada cultivo en cada época, descarta lo inviable, arma rotaciones y puntúa Suelo / Agua / Seguridad / Ingreso. Detalle: [`motor-reglas.md`](motor-reglas.md).
4. **Resultado**: 3 planes + "si sigue sembrando lo de hoy", con calendario, puntajes, comparación normal vs. El Niño, etiqueta de plan robusto y razones con números. Se puede imprimir o compartir el enlace.

## Cultivos del piloto
Arroz (secano), maíz, sorgo, frijol, caupí, maní, melón, sandía, mucuna y canavalia (abonos verdes), descanso. Catálogo: [`data/catalogo/cultivos_guanacaste.csv`](../data/catalogo/cultivos_guanacaste.csv).

## Factor económico
| Componente | Costo |
|---|---|
| Datos NASA, NOAA, SoilGrids, FAO | $0 |
| Hosting (GitHub Pages) | $0 |
| Dominio | Pago anual del registrador (José Pablo cotiza) |
| Explicaciones | $0 (plantillas, sin LLM) |
| Sensor | No requerido |

**Dentro del motor:** hoy el ingreso es relativo (1–5). Siguiente paso: margen = rendimiento × precio (PIMA/CENADA) − costo (MAG/INTA), más el ahorro de fertilizante por el nitrógeno de las leguminosas, y filtro de pérdida máxima tolerable (ya implementado).

## Camino a impacto
Agencias de extensión del MAG/INTA y cooperativas de Guanacaste: el extensionista abre el enlace en la visita, llena el formulario con el productor e imprime el plan. El mismo motor sirve para otras regiones del Corredor Seco centroamericano cambiando catálogo y puntos.

## Qué NO prometemos
- No predecimos la cosecha; comparamos planes.
- Los datos son regionales (celdas de decenas de km).
- Los rangos de cultivos están en verificación; el ingreso es relativo hasta tener precios.
