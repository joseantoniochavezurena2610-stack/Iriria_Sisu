# Arquitectura — app 100 % web

## En una frase
Una página estática (HTML + CSS + JavaScript, sin servidor) que carga datos NASA ya procesados en JSON y corre el motor de rotación **en el navegador** del agricultor. GitHub Actions baja y actualiza los datos solo.

```
              ┌──────────────── GitHub Actions (cada lunes / al cambiar scripts) ───────────────┐
NASA POWER ──▶│ scripts/descargar_datos.py   → web/data/guanacaste/clima_<cantón>.json           │
NOAA CPC   ──▶│                              → web/data/enso.json  (El Niño / La Niña por mes)   │
SoilGrids  ──▶│ scripts/descargar_soilgrids.py → suelo_referencia.json   (opcional)              │
IMERG      ──▶│ scripts/descargar_imerg.py     → imerg_mensual.json      (opcional, Earthdata)   │
CSV equipo ──▶│ scripts/catalogo_a_json.py     → web/data/cultivos.json                          │
              └──────────────────────────────────┬──────────────────────────────────────────────┘
                                                 │ commit automático
                                                 ▼
                    Hosting estático (GitHub Pages + dominio propio)  ──▶  navegador del agricultor
                                                                          web/js/app.js   (interfaz)
                                                                          web/js/clima.js (escenarios)
                                                                          web/js/motor.js (motor)
```

## Por qué así
| Necesidad | Solución |
|---|---|
| 100 % web, que abra en un celular | Página estática responsive |
| Costo de operación ≈ $0 | Sin servidor ni base de datos; hosting gratuito |
| Que no falle en la demo | Datos precalculados en el repo; si falta un cantón, se intenta descargar en vivo de POWER |
| Que el agricultor no dependa de sensores | Todo sale de un formulario |
| Datos siempre frescos (El Niño en curso) | Workflow `datos` semanal |
| Defendible ante jueces | Motor de reglas transparente con pruebas automáticas |
| Privacidad | Nada se guarda ni se envía: el cálculo ocurre en el navegador. La ubicación del celular solo elige el cantón más cercano |

## Carpetas
```
web/                 ← lo que se publica
  index.html
  css/estilos.css
  js/app.js          interfaz (DOM)
  js/clima.js        escenarios, lluvia efectiva, ET0, lector de POWER (funciones puras)
  js/motor.js        motor de rotación (funciones puras)
  data/              JSON que lee la app (generados por scripts)
scripts/             descarga y procesamiento de datos (Python, se corre en GitHub Actions)
data/catalogo/       catálogo de cultivos en CSV (lo llena el equipo)
tests/               pruebas del motor (npm test)
.github/workflows/   datos.yml · pruebas.yml · publicar.yml
archivo/             prototipo anterior (referencia)
```

## Correr en local
```bash
python3 -m http.server 8000 --directory web   # abrir http://localhost:8000
npm test                                       # pruebas del motor (Node 20+)
python3 scripts/catalogo_a_json.py             # después de editar el CSV
python3 scripts/descargar_datos.py             # bajar datos NASA (necesita internet)
```
> Abrir `index.html` con doble clic no funciona (el navegador bloquea leer los JSON). Siempre con un servidor local.

## Publicación
Workflow `publicar.yml` (apagado por defecto):
1. Settings → Pages → *Source*: **GitHub Actions**.
2. Settings → Secrets and variables → Actions → pestaña *Variables* → `PUBLICAR_PAGES` = `true`.
3. Cada push a `main` y cada actualización de datos republica la web.

Alternativas equivalentes (todas gratis para sitios estáticos): Cloudflare Pages, Netlify, Vercel. Basta con apuntarlas a la carpeta `web/` sin paso de compilación.

<a id="dominio"></a>
## Dominio (responsable: José Pablo)
### Requisitos
- Corto, fácil de dictar en una finca y de escribir en un celular. Ideas: `iririasisu.app`, `iririasisu.com`, `iririasisu.cr`, `sisu.cr`. Evitar tildes en el dominio.
- **HTTPS obligatorio** (la ubicación del celular solo funciona con HTTPS). GitHub Pages lo da gratis.
- Pago anual: anotar quién es el titular, la fecha de vencimiento y activar renovación automática para que no se caiga después del concurso.
- Confirmar que el registrador permite editar registros DNS (A, AAAA, CNAME).

### Pasos con GitHub Pages
1. Comprar el dominio (NIC Costa Rica para `.cr`; cualquier registrador para `.com`/`.app`).
2. En el registrador, crear los registros DNS:
   - Dominio raíz: registros **A** a `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (y AAAA si se quiere IPv6).
   - `www`: registro **CNAME** a `joseantoniochavezurena2610-stack.github.io`.
   - Verificar estas IPs en la documentación oficial de GitHub Pages el día que se configure.
3. Crear el archivo `web/CNAME` con una sola línea: el dominio (ej. `iririasisu.app`).
4. Settings → Pages → *Custom domain* → escribir el dominio → *Enforce HTTPS*.
5. Recomendado: *verificar el dominio* en la configuración de la cuenta/organización de GitHub para evitar que alguien lo tome.
6. Probar en celular con datos móviles (no solo wifi).

### Checklist
- [ ] Dominio comprado y anotado en `docs/decisiones.md`
- [ ] DNS configurado
- [ ] `web/CNAME` subido
- [ ] HTTPS activo
- [ ] Enlace probado en celular
- [ ] Enlace puesto en el README y en el formulario de Space Apps
