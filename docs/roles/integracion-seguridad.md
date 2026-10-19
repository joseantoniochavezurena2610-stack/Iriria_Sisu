# Plan — Integración, despliegue y seguridad (Juan Diego, Ing. en seguridad informática)

**Misión:** que la web esté en línea con HTTPS, que `main` siempre funcione, que la demo no falle y que no se filtren credenciales.

## Antes del evento
| Prioridad | Tarea | Entregable |
|---|---|---|
| 🔴 | Activar GitHub Pages: *Settings → Pages → Source: GitHub Actions* y variable `PUBLICAR_PAGES=true` | URL pública funcionando |
| 🔴 | Proteger `main` (PR obligatorio + workflow `pruebas` en verde) | Regla de rama |
| 🔴 | Apoyar a José Pablo con el dominio (`web/CNAME`, *Enforce HTTPS*) | Dominio con candado |
| 🟠 | Revisar que el workflow `datos` haga commit sin romper `main` | Corrida exitosa |
| 🟠 | Content-Security-Policy básica en `index.html` (solo cdnjs, Google Fonts, OSM tiles, power.larc.nasa.gov) | Meta CSP probada |
| 🟡 | Modo sin internet: probar la app servida en local con los JSON del repo | Comando documentado |

## Durante las 48 h
- Dueño de `main`: merge en cada checkpoint.
- Hora 30: freeze. Hora 46: etiqueta `v1.0` y verificación del enlace público (sin login, incógnito, celular con datos móviles).

## Checklist de seguridad
- [ ] Sin llaves en el historial de git
- [ ] Secrets de Earthdata solo en GitHub
- [ ] La app no guarda ni envía datos del agricultor (todo corre en el navegador)
- [ ] HTTPS obligatorio en el dominio
- [ ] Dependencias externas fijadas a versión (Leaflet 1.9.4)
