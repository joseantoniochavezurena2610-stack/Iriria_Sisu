# Plan de 48 horas — Iriria Sìsù

## Fase 1 · Horas 0-3 — Definición
- [ ] Elegir challenge oficial y confirmar dataset(s)
- [ ] Escribir el problema en una sola frase
- [ ] Definir el MVP mínimo (qué es lo mínimo que demuestra la idea)
- [ ] Repartir roles
- [ ] Elegir stack técnico y crear el setup inicial

## Fase 2 · Horas 3-30 — Construcción del core
- [ ] Pipeline de datos funcionando (ingesta → limpieza → uso)
- [ ] Primer análisis / prueba de la hipótesis científica
- [ ] Primera versión end-to-end corriendo (aunque sea fea)
- [ ] Checkpoints de equipo cada 2-3h: qué hice / qué sigue / bloqueos

## Fase 3 · Horas 30-42 — Pulido
- [ ] Code freeze de features nuevas
- [ ] Validar que el análisis científico es correcto y explicable
- [ ] Mejorar visualización / UI
- [ ] Escribir el README final y `docs/fuentes-datos.md`

## Fase 4 · Horas 42-48 — Entrega
- [ ] Grabar video de 30 segundos
- [ ] Escribir el resumen del proyecto (submission form)
- [ ] Ensayar el pitch en vivo (cronometrado)
- [ ] Subir todo al repo y verificar que el submission en spaceappschallenge.org quedó completo
- [ ] Plan B: video/demo grabado por si algo falla en vivo

## Antes del evento (hasta el 13-nov)
- [ ] Todo el equipo con cuenta Earthdata
- [ ] Decidir región piloto (propuesta: Pacífico Norte) y 6-8 cultivos
- [ ] Llenar `data/catalogo/cultivos_plantilla.csv` con fuentes (líder científico)
- [ ] Notebook: lluvia por época en el Pacífico Norte, año neutro vs. 2015 y 2023 (POWER + IMERG)
- [ ] Probar una consulta de POWER y una de AppEEARS con un punto de Guanacaste
- [ ] Calibrar el sensor capacitivo con suelo real
- [ ] Preguntar a los organizadores si se puede llegar con código previo
- [ ] Resolver los datos ❓ de `docs/investigacion/resumen-verificado.md`

## Roles
| Persona | Rol principal | Backup |
|---|---|---|
| Juan Diego Chávez Ureña | Líder científico | |
| Jose Antonio Chávez Ureña | | |
| Britzie Yarith García Arias | | |
| Angeli Abarca Ureña | | |
| José Pablo Ramírez Fernández | | |
| Nesly Mejía Jiménez | | |

## Bloqueos / decisiones pendientes
- Región piloto final (Guanacaste vs. Cartago)
- ¿LLM para las explicaciones o solo plantillas? (plantillas = $0 y sin riesgo de inventar datos)
