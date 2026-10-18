# Plan — Economía, impacto y operaciones (Ing. industrial)

**Misión:** que la solución sea **real y sostenible**: el eje Ingreso con números de verdad, el costo de la herramienta claro y un camino creíble para llegar a los agricultores. También llevar el control del tiempo del equipo.

## Antes del evento
| Prioridad | Tarea | Entregable |
|---|---|---|
| 🔴 | Precios de referencia de cada cultivo del catálogo (PIMA/CENADA) | Columnas `precio_crc_kg` y `fuente_economica` en `data/catalogo/cultivos_plantilla.csv` |
| 🔴 | Costos de producción por hectárea (fichas MAG/INTA; si no existen para un cultivo, documentarlo) | Columna `costo_produccion_crc_ha` |
| 🔴 | Definir con Ciencia la fórmula del eje Ingreso: margen = rendimiento × precio − costo − costo de transición | Sección en `docs/motor-reglas.md` |
| 🟠 | Costo de transición (cambiar de arroz a maíz/frijol: semilla, maquinaria, mercado) — al menos una estimación razonable con fuente | Tabla corta |
| 🟠 | Ahorro de fertilizante por leguminosas: kg de N → kg de urea → colones | Fórmula + precio de urea con fuente |
| 🟠 | Costo de operar la herramienta (datos $0, hosting $0, nodo sensor cotizado) | Tabla en `docs/solucion.md` |
| 🟡 | Camino de piloto: contactos de agencias de extensión MAG/INTA o cooperativas de Guanacaste | 1 página de "cómo llega al agricultor" |

## Durante las 48 h
- **Dueña del reloj:** controla los hitos de `docs/roles/README.md` y avisa cuando algo se atrasa.
- Llena el **formulario de submission** (descripción, impacto, uso de datos) a partir de H36.
- Prepara y dice la parte de **Impacto** del pitch.

## Preguntas que debe poder responder ante los jueces
- ¿Cuánto cuesta mantener esto? → casi $0.
- ¿Quién lo usaría mañana? → extensionistas y cooperativas.
- ¿Por qué un agricultor confiaría? → muestra consecuencias y fuentes; la decisión es suya.
- ¿Cómo escala? → mismo motor, otro catálogo y otra región del trópico seco.
