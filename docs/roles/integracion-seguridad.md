# Plan — Integración, despliegue y seguridad (Ing. en seguridad informática)

**Misión:** que todo junte, que esté en línea con URL pública, que la demo funcione aunque falle el internet y que no se filtren credenciales.

## Antes del evento
| Prioridad | Tarea | Entregable |
|---|---|---|
| 🔴 | Repo listo: estructura, `requirements.txt`, ramas según `CONTRIBUTING.md`, protección de `main` | Repo configurado |
| 🔴 | Despliegue de prueba en Streamlit Community Cloud desde GitHub | URL pública con una app "hola mundo" |
| 🔴 | Manejo de secretos: credenciales Earthdata y cualquier llave en `.env` / secrets de Streamlit, nunca en el código | Guía en el README |
| 🟠 | Endpoint para el sensor (acordar formato con Hardware); validar el payload y usar un token simple | Endpoint probado |
| 🟠 | **Modo offline:** la app corre local con Parquet precalculado, sin internet | Comando de arranque probado |
| 🟡 | CI básico en `.github/workflows/`: correr pytest en cada PR | Workflow funcionando |

## Durante las 48 h
- **Dueño de `main`:** en cada checkpoint hace merge de lo que funciona.
- **H20:** primera versión desplegada.
- **H30:** freeze; desde aquí solo se arreglan bugs.
- **H36:** prueba completa de la demo en modo offline y con el sensor.
- **H42:** etiqueta `v1.0` en el commit de entrega y verifica que el submission tenga el link correcto.

## Checklist de seguridad (sirve como punto extra en el pitch)
- [ ] Sin llaves ni contraseñas en el historial de git
- [ ] Payload del sensor validado (tipos y rangos)
- [ ] La app no guarda datos personales del agricultor
- [ ] Dependencias fijadas a versión
