# Planes por rol — Iriria Sìsù

Cada rol tiene su plan con tareas **antes del evento** (hasta el 13-nov), **durante las 48 h** y su **entregable**. Pongan su nombre en la tabla.

| Rol | Perfil sugerido | Persona | Plan |
|---|---|---|---|
| Líder científico | Estudiante científico | Jose Antonio Chavez Ureña | [lider-cientifico.md](lider-cientifico.md) |
| Datos y motor | Ing. en sistemas | Jose Pablo Ramírez | [datos-y-motor.md](datos-y-motor.md) |
| Sensores y hardware | Ing. mecatrónica | Britzie García | [sensores-hardware.md](sensores-hardware.md) |
| Economía, impacto y operaciones | Ing. industrial | Angelli Abarca | [economia-operaciones.md](economia-operaciones.md) |
| Diseño, UX y pitch | Diseñadora gráfica | Nesly Mejía | [diseno-pitch.md](diseno-pitch.md) |
| Integración, despliegue y seguridad | Ing. en seguridad informática | Juan Diego Chávez Ureña | [integracion-seguridad.md](integracion-seguridad.md) |

## Cómo se conectan
```
Ciencia ──define variables, reglas y validación──▶ Datos y motor ──puntajes──▶ App (Diseño)
   ▲                                                   ▲                       │
   │                                     lectura en vivo│                       ▼
Economía ──precios, costos, pérdida máx.──┘      Sensores           Integración: deploy + demo offline
```

## Dependencias críticas (quién espera a quién)
1. **Catálogo de cultivos** (Ciencia + Economía) → sin él no hay motor. Fecha límite: **8-nov**.
2. **Formato del contexto** `contexto.json` (Datos) → lo usan Diseño y Sensores. Fecha límite: **9-nov**.
3. **Formato del mensaje del sensor** (Sensores + Integración) → acordar antes del evento.
4. **Datos precalculados en Parquet** (Datos) → la demo no depende de internet.

## Checkpoints durante el hackatón (cada ~3 h, 10 min máx.)
Cada quien responde: ¿qué terminé?, ¿qué sigue?, ¿qué me bloquea? El líder científico revisa que los números sigan teniendo sentido; Integración hace merge a `main` de lo que funciona.

## Hitos del hackatón
| Hora | Hito |
|---|---|
| 0-3 | Problema en una frase, MVP cerrado, repo corriendo en todas las compus |
| 12 | Motor corriendo con datos reales en consola |
| 20 | App end-to-end (fea pero completa) |
| 30 | **Freeze de ciencia y de features** |
| 36 | Sensor integrado + demo offline probada |
| 42 | Video de 30 s y submission en borrador |
| 46 | Pitch ensayado 2 veces cronometrado |
| 48 | Entrega |
