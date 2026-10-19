# Plan — Datos, motor y dominio (José Pablo, Ing. en sistemas)

**Misión:** que los datos NASA lleguen solos y limpios a la web, que el motor sea correcto y rápido, y que la app tenga su **dominio propio**.

## Ya hecho (18-oct)
- `scripts/descargar_datos.py`: POWER diario 2021 → hoy por cantón, ET0 Hargreaves, ENSO de NOAA. Solo biblioteca estándar.
- `web/js/clima.js` y `web/js/motor.js` + 12 pruebas (`npm test`).
- Workflow `datos.yml` (semanal y al cambiar scripts).

## Antes del evento
| Prioridad | Tarea | Entregable |
|---|---|---|
| 🔴 | **Dominio**: proponer 2-3 nombres al equipo, comprar, configurar DNS y HTTPS | Checklist de [`arquitectura.md#dominio`](../arquitectura.md#dominio) completo |
| 🔴 | Revisar la primera corrida del workflow `datos` (pestaña Actions) y los JSON generados | Issue con hallazgos |
| 🔴 | Cuenta Earthdata del equipo como *secrets*; probar `descargar_imerg.py` | `imerg_mensual.json` |
| 🟠 | Comparar POWER vs IMERG por cantón (correlación mensual) | Gráfico + 2 frases para Ciencia |
| 🟠 | Eje Ingreso en colones cuando Economía llene precios/costos | `motor.js` + prueba |
| 🟠 | Usar `GWETROOT` como reserva inicial de agua | `motor.js` + prueba |
| 🟡 | Revisar que `descargar_soilgrids.py` funcione (WCS) | `suelo_referencia.json` |

## Durante las 48 h
- Correr el workflow `datos` al inicio (datos frescos).
- Arreglos del motor según la revisión de Ciencia. Nada nuevo después de la hora 30.

## Reglas
- Ningún valor inventado: si falta dato, la app lo dice.
- Toda función del motor con prueba.
- Credenciales solo como *secrets*.
