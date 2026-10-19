# Plan — Iriria Sìsù

**Evento:** 14–15 de noviembre de 2026. **Entregables:** video (≤ 30 s, subtítulos en inglés) + prototipo web público.
Decisiones vigentes: [`decisiones.md`](decisiones.md).

## Estado al 18-oct-2026
- [x] Región piloto: Guanacaste (11 cantones)
- [x] App web funcionando en `web/` (formulario, escenarios, 3 planes + lo de hoy, robustez, imprimir, compartir enlace)
- [x] Motor de reglas en JavaScript con 12 pruebas automáticas
- [x] Scripts y workflow para bajar NASA POWER (2021 → hoy) y el índice ENSO de NOAA
- [x] Catálogo de 11 cultivos con valores iniciales (sin verificar)
- [x] Glosario, arquitectura, reglas del motor y guion del video
- [ ] Datos reales descargados (se generan solos al hacer merge a `main`; revisar la pestaña *Actions*)

## Antes del evento
### Semana 1 · 19–25 oct — datos y dominio
- [ ] Revisar que el workflow `datos` corrió y que `web/data/guanacaste/clima_*.json` existen — **Juan Diego**
- [ ] Comprar dominio y configurar DNS — **José Pablo** ([checklist](arquitectura.md#dominio))
- [ ] Activar GitHub Pages (`PUBLICAR_PAGES=true`) — **Juan Diego**
- [ ] Todos con cuenta Earthdata; guardar usuario/contraseña de una cuenta del equipo como *secrets* del repo — **José Pablo**
- [ ] Leer el [glosario](glosario.md) completo — **todos**
- [ ] Preguntar a los organizadores si se puede llegar con código previo — **Angeli**

### Semana 2 · 26 oct – 1 nov — ciencia y economía
- [ ] Verificar el catálogo cultivo por cultivo con fuente (`verificado_por`) — **Jose Antonio**
- [ ] Precios (PIMA/CENADA) y costos de producción (MAG/INTA) para cada cultivo — **Angeli**
- [ ] Comparar la lluvia de POWER con datos del IMN para Liberia y Nicoya (¿se parecen?) — **Jose Antonio + José Pablo**
- [ ] Mockups finales y paleta; probar la app en 3 celulares distintos — **Nesly**

### Semana 3 · 2–8 nov — validación
- [ ] Backtest 2026: ¿el motor desaconseja arroz sin riego en Nandayure para la primera 2026? — **Jose Antonio**
- [ ] Análisis de sensibilidad ±20 % en Kc, umbrales y márgenes — **Jose Antonio + José Pablo**
- [ ] Llevar la app a un extensionista del MAG/INTA o a un productor de Guanacaste — **Angeli + Britzie**
- [ ] Eje Ingreso en colones (motor) — **José Pablo**

### Semana 4 · 9–13 nov — congelar
- [ ] Freeze del catálogo y las fórmulas (13-nov)
- [ ] Storyboard del video aprobado — **Nesly**
- [ ] Ensayo general: un compañero que no programó usa la app desde cero en el celular

## Durante las 48 h
| Hora | Hito |
|---|---|
| 0–3 | Confirmar reto, revisar reglas de código previo, ajustar lo que pidan los organizadores |
| 3–20 | Mejoras pendientes (lista priorizada en Issues), datos frescos con el workflow |
| 20–30 | Pulido de interfaz y textos; pruebas en celular |
| 30 | **Freeze**: solo arreglos |
| 30–40 | Grabar y editar el video con subtítulos en inglés |
| 40–46 | Formulario de envío en inglés (resumen, datos NASA usados, uso de IA) |
| 46–48 | Revisión final: enlace público sin contraseña, video público, *Submit for Judging* |

## Roles
| Persona | Rol principal | Plan |
|---|---|---|
| Juan Diego Chávez Ureña | Integración, despliegue y seguridad | [integracion-seguridad.md](roles/integracion-seguridad.md) |
| Jose Antonio Chávez Ureña | Líder científico | [lider-cientifico.md](roles/lider-cientifico.md) |
| José Pablo Ramírez Fernández | Datos, motor y dominio | [datos-y-motor.md](roles/datos-y-motor.md) |
| Britzie Yarith García Arias | Campo, validación y sensor opcional | [campo-y-sensores.md](roles/campo-y-sensores.md) |
| Angeli Abarca Ureña | Economía, impacto y operaciones | [economia-operaciones.md](roles/economia-operaciones.md) |
| Nesly Mejía Jiménez | Diseño, UX y video | [diseno-video.md](roles/diseno-video.md) |

## Bloqueos / decisiones pendientes
- ¿Se permite llegar con código previo? (preguntar a organizadores)
- Nombre de dominio final
