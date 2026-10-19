# Flujo de trabajo del equipo

Para no perder tiempo peleando con git durante el hackatón:

1. **Nunca hacer push directo a `main`.** Cada persona trabaja en su propia rama:
   ```bash
   git checkout -b feature/nombre-corto
   ```
2. **Commits pequeños y frecuentes**, mensajes claros:
   ```bash
   git add .
   git commit -m "feat: eje ingreso en colones"
   ```
3. **Subir la rama y abrir Pull Request** (aunque sea el mismo equipo, ayuda a revisar rápido):
   ```bash
   git push origin feature/nombre-corto
   ```
4. Antes de cada checkpoint de equipo (~cada 2-3h), hacer merge de lo que ya funciona a `main` para evitar conflictos gigantes al final.
5. Si algo se rompe cerca de la entrega: **volver al último commit funcional** en vez de intentar arreglar en caliente.
   ```bash
   git log --oneline
   git checkout <hash-del-commit-bueno>
   ```

## Antes de abrir un PR
```bash
npm test                              # pruebas del motor
python3 scripts/catalogo_a_json.py    # si cambiaron el CSV del catálogo (suban también web/data/cultivos.json)
python3 -m http.server 8000 --directory web   # revisar la web en http://localhost:8000
```
- Términos técnicos nuevos → `docs/glosario.md`.
- Decisiones nuevas → `docs/decisiones.md`.
- Nunca subir contraseñas ni llaves (Earthdata va en *Secrets* de GitHub).

## Convención de mensajes de commit
- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `data:` cambios relacionados a datasets/pipeline de datos
- `docs:` cambios en documentación
- `chore:` configuración, dependencias, etc.
