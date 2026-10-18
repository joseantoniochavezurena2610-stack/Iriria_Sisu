# Solución propuesta — v2 (actualizada 18-oct-2026)

## El problema en una frase
En Guanacaste, El Niño 2026-27 ya recortó más de un tercio de la lluvia y se espera que siga hasta mediados de 2027; los productores de granos deciden qué sembrar en la próxima época sin una herramienta que combine el clima que viene, su suelo y su bolsillo.

## La idea en una frase
**Iriria Sìsù** compara 2-3 planes de rotación a 3 años para una finca concreta, mostrando qué le pasa al suelo, al agua y al ingreso en un año normal y en un año El Niño, con datos NASA, el suelo de la finca y un sensor en la parcela.

## Qué cambió respecto a la v1
| Antes | Ahora | Por qué |
|---|---|---|
| El Niño como hipótesis de pitch | El Niño como **realidad actual** (−37 % lluvia en Pacífico Norte ene-ago 2026) | Hace el pitch urgente y verificable |
| Escenario "−30 % de lluvia" fijo | Escenarios con **años análogos reales** (2015, 2023 vs. un año neutro) desde IMERG/POWER | Defendible ante jueces de ciencia |
| 2 temporadas (primera/postrera) | **Seca · Primera · Canícula · Postrera** | La canícula es donde El Niño mata la cosecha |
| SMAP "verificado" con sensor | Sensor = **capa fina** que ajusta el balance hídrico; satélite = tendencia | Honestidad de escala |
| NDVI de MODIS | **HLS (30 m)** o VIIRS | MODIS se apaga a fines de 2026 / inicios de 2027 |
| LLM redacta las razones | **Plantillas** con los números del motor; LLM opcional | Costo cero y sin riesgo de inventar datos |
| Ingreso = "ingreso relativo" | Ingreso = precio real − costo de producción − **costo de cambiar** | Ver sección económica |

## Cómo funciona (flujo)
1. **Datos precalculados** para la región piloto (Pacífico Norte): POWER (lluvia, T°, radiación, `GWETROOT`) 1995-2025, IMERG para lluvia, SoilGrids (pH, textura, carbono), HLS/VIIRS para NDVI. Se guardan en Parquet → la demo funciona sin internet.
2. **Entrada del agricultor:** ubicación en el mapa, cultivo actual, pH/textura (o el de SoilGrids si no tiene análisis), ¿tiene riego? y sus prioridades 0-5 (suelo, agua, riesgo, ingreso).
3. **Motor de reglas** (función pura `recomendar(contexto, prioridades)`):
   - Genera secuencias de 3 años × 4 épocas con 6-8 cultivos.
   - Filtros duros: pH fuera de rango ECOCROP, misma familia seguida, cultivo sin agua suficiente sin riego.
   - Ejes 0-100: **Suelo** (balance de N, cambio de familia, abono verde) · **Agua** (déficit lluvia vs. demanda tipo FAO-56) · **Riesgo** (probabilidad de que la lluvia no llegue al 70 % de la demanda, calculada con los 30 años) · **Ingreso** (margen neto, ver abajo).
   - Puntaje final = promedio ponderado por las prioridades.
4. **Comparación de escenarios:** el mismo motor en año neutro vs. año El Niño. Etiqueta "**plan robusto**" si queda en el top en ambos.
5. **Sensor ESP32** (humedad de suelo calibrada + DHT22): reemplaza la humedad regional por la de la parcela y avisa "tu finca está X % más seca que la región".
6. **Salida:** 3 planes lado a lado, cada uno con calendario, puntajes por eje y 2-3 razones en lenguaje simple ("el frijol en primera deja nitrógeno para el maíz de postrera").

## Cultivos candidatos (piloto Guanacaste)
Arroz, maíz, frijol, sorgo, maní/caupí (leguminosas tolerantes a sequía), melón/sandía, abono verde (mucuna o canavalia), descanso. El líder científico verifica rangos con ECOCROP + fichas de INTA/MAG.

## Factor económico — que sea real y construible
### Costo de construir y operar la herramienta
| Componente | Costo | Nota |
|---|---|---|
| Datos NASA (POWER, IMERG, SMAP, HLS), SoilGrids, ECOCROP | **$0** | Abiertos; solo cuentas Earthdata gratis |
| App (Streamlit Community Cloud desde GitHub) | **$0** | Suficiente para piloto |
| Explicaciones | **$0** con plantillas | LLM opcional; si se usa, solo para redactar con números del motor |
| Nodo sensor (ESP32 + sensor capacitivo + DHT22 + caja/batería) | Bajo (decenas de dólares por nodo; cotizar en CR) | Un nodo por finca piloto, no por hectárea |

→ El MVP se puede mantener **sin presupuesto**; lo único que cuesta es el hardware del sensor, y es opcional para el agricultor (la herramienta funciona sin él).

### Costo real para el agricultor (dentro del motor)
- **Margen neto** = rendimiento esperado × precio − costo de producción. Precios de referencia de PIMA/CENADA; costos de producción de fichas MAG/INTA (el líder científico debe confirmar qué fichas existen para cada cultivo).
- **Costo de transición:** pasar de arroz a maíz/frijol implica semilla, maquinaria distinta y mercado. Se penaliza el primer año del cambio para no recomendar algo impagable.
- **Pérdida máxima tolerable:** el agricultor indica cuánto puede perder; se descartan planes cuyo peor año (escenario El Niño) supere ese límite.
- **Ahorro de fertilizante:** el crédito de N de las leguminosas se traduce a colones ahorrados en urea — es el argumento económico más fuerte de la rotación.

### Camino a impacto real
Piloto con **agencias de extensión del MAG / INTA** o una cooperativa de Guanacaste: ellos ya visitan fincas, pueden usar la herramienta en la visita y validar con datos de campo. Modelo sin costo para el agricultor; el sensor puede financiarse vía cooperativa.

## Qué NO prometemos (límites declarados)
- No predecimos el rendimiento exacto; comparamos planes.
- Los datos satelitales son regionales; el detalle de parcela viene del agricultor o del sensor.
- Los rangos de cultivos vienen de literatura; deben calibrarse con datos de campo.
