# Planes por rol — Iriria Sìsù

Entregables del equipo: **video (≤ 30 s)** y **prototipo web**. Cada rol tiene tareas antes del evento (hasta el 13-nov), durante las 48 h y su entregable.

| Rol | Persona | Plan |
|---|---|---|
| Líder científico | Jose Antonio Chávez Ureña | [lider-cientifico.md](lider-cientifico.md) |
| Datos, motor y dominio | José Pablo Ramírez Fernández | [datos-y-motor.md](datos-y-motor.md) |
| Integración, despliegue y seguridad | Juan Diego Chávez Ureña | [integracion-seguridad.md](integracion-seguridad.md) |
| Economía, impacto y operaciones | Angeli Abarca Ureña | [economia-operaciones.md](economia-operaciones.md) |
| Diseño, UX y video | Nesly Mejía Jiménez | [diseno-video.md](diseno-video.md) |
| Campo, validación y sensor opcional | Britzie Yarith García Arias | [campo-y-sensores.md](campo-y-sensores.md) |

## Cómo se conectan
```
Ciencia ──catálogo y reglas──▶ Datos y motor ──JSON + motor.js──▶ Web (Diseño + Integración)
   ▲                                ▲                                   │
Economía ──precios y costos─────────┘                                   ▼
Campo ──pruebas con agricultores / extensionistas──────────────▶  Video + dominio público
```

## Dependencias críticas
1. **Catálogo verificado** (Ciencia + Economía) → fecha límite **8-nov**.
2. **Datos reales en `web/data/`** (workflow `datos`) → antes del **25-oct**.
3. **Dominio + HTTPS** (José Pablo) → antes del **1-nov**.
4. **Freeze** de fórmulas y catálogo → **13-nov**.

## Reglas comunes
- Todo término nuevo va al [glosario](../glosario.md).
- Ningún número en la app o el video sin fuente.
- Ramas + PR (ver `CONTRIBUTING.md`). Las pruebas (`npm test`) deben pasar.
