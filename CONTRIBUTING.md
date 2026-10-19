# Team workflow

So we don't waste time fighting git during the hackathon:

1. **Never push directly to `main`.** Everyone works on their own branch:
   ```bash
   git checkout -b feature/short-name
   ```
2. **Small, frequent commits** with clear messages:
   ```bash
   git add .
   git commit -m "feat: income axis in colones"
   ```
3. **Push the branch and open a Pull Request** (even within the team, it makes reviews quick):
   ```bash
   git push origin feature/short-name
   ```
4. Before every team checkpoint (~every 2-3 h), merge whatever already works into `main` to avoid huge conflicts at the end.
5. If something breaks close to the deadline: **go back to the last working commit** instead of trying to fix it under pressure.
   ```bash
   git log --oneline
   git checkout <hash-of-the-good-commit>
   ```

## Before opening a PR
```bash
npm test                                      # engine tests
python3 scripts/catalog_to_json.py            # if you changed the catalog CSV (also commit web/data/crops.json)
python3 -m http.server 8000 --directory web   # check the website at http://localhost:8000
```
- New technical terms → `docs/glossary.md` **and** `docs/glossary.es.md` (keep both versions in sync).
- New decisions → `docs/decisions.md`.
- Never commit passwords or keys (Earthdata goes in GitHub *Secrets*).
- Everything in the repository is written in **English**. The only exceptions are the Spanish team guides in `docs/team-guides-es/` and the Spanish glossary `docs/glossary.es.md`.

## Commit message convention
- `feat:` new functionality
- `fix:` bug fix
- `data:` changes to datasets / the data pipeline
- `docs:` documentation changes
- `chore:` configuration, dependencies, etc.
