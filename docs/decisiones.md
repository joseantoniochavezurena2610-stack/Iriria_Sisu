# Registro de decisiones

Cada decisión del equipo con su fecha y su porqué. Si algo cambia, se agrega una entrada nueva; no se borra la anterior.

## 18-oct-2026 — Reestructuración del proyecto

| # | Decisión | Qué implica |
|---|---|---|
| D1 | **Región piloto final: Guanacaste** (los 11 cantones). | Cartago queda descartado. Catálogo de cultivos, datos y ejemplos son de Guanacaste. Es la zona más golpeada por El Niño 2026-27 (−37 % de lluvia ene-ago, alerta naranja en los 11 cantones). |
| D2 | **La app es 100 % web.** | Se abandona Streamlit. La app es una página estática (HTML + CSS + JavaScript) en `web/`; el motor corre en el navegador. Se abre en cualquier celular o computadora con un enlace, sin instalar nada. Ver [`arquitectura.md`](arquitectura.md). |
| D3 | **Se avanza todo lo posible antes del evento** (hasta el 13-nov). | El prototipo funcional ya existe; las 48 h se usan para datos verificados, pulido, validación y el video. Revisar con los organizadores la regla de código previo. Ver [`plan.md`](plan.md). |
| D4 | **Únicos entregables: el video y el prototipo final.** | No hay pitch en vivo ni presentación de diapositivas. El video cumple la "demo" de Space Apps (**máx. 30 s, subtítulos en inglés**). El prototipo es el "final project link" (la web pública). Ver [`guion-video.md`](guion-video.md). |
| D5 | **Datos: mínimo los últimos 5 años (2021 → hoy).** | Todo dataset del modelo cubre al menos ene-2021 a la fecha. Incluye La Niña 2021-23, El Niño 2023-24, La Niña 2024-26 y El Niño 2026. Datos más viejos (p. ej. El Niño 2015) solo se citan como contexto histórico, no entran al motor. |
| D6 | **Glosario compartido.** | [`glosario.md`](glosario.md): todo término técnico nuevo se agrega ahí. |
| D7 | **El agricultor ingresa sus datos; no dependemos de sensores.** | El formulario pide cantón, cultivo, riego, textura (prueba de la cinta), pH (opcional), pendiente, materia orgánica y prioridades. Si no sabe el pH, se usa SoilGrids como referencia (avisándolo). El sensor ESP32 pasa a ser un **extra opcional** que no bloquea nada. |
| D8 | **Dominio: lo busca y gestiona José Pablo** (ingeniero en sistemas). | Requisitos y pasos en [`arquitectura.md#dominio`](arquitectura.md#dominio). Hosting recomendado: GitHub Pages (gratis, HTTPS). |
| D9 | **Todo lo investigado o modificado se sube a GitHub.** | Ramas + PR según `CONTRIBUTING.md`. Los datos NASA los baja y sube automáticamente el workflow `datos`. |

### Decisiones técnicas derivadas
- **Explicaciones con plantillas, no con un LLM**: costo $0, sin servidor y sin riesgo de inventar datos.
- **ET0 por Hargreaves (FAO-56)**: solo necesita temperatura, que POWER da sin cuenta.
- **Tres épocas por año** (Seca ene–abr, Primera may–ago, Postrera sep–dic). La canícula (jul–ago) queda dentro de la Primera y se refleja en el riesgo porque usamos la lluvia real de cada año.
- **Escenarios con años reales**, no con un "−30 %" fijo: normal (meses sin El Niño), El Niño (meses El Niño observados), peor año, y "pronóstico actual" (El Niño en la seca y primera de 2027, luego normal) según el IMN.
- **SoilGrids por WCS** porque su API REST está pausada; es opcional.
- **MODIS fuera**: termina operaciones a fines de 2026/inicios de 2027.
