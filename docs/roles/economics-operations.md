# Plan — Economics, impact and operations (Angeli, industrial engineering)

**Mission:** the Income axis uses real numbers, the tool's cost is clear and there is a credible path to the farmer. Also the team's clock.

## Before the event
| Priority | Task | Deliverable |
|---|---|---|
| 🔴 | **Update the team on the Space Apps site** (José Pablo left, D17) | Registration shows 5 members |
| 🔴 | Reference price for each crop in the catalog (PIMA/CENADA) — **by 1 Nov** (the engine needs it) | `price_crc_kg` and `economic_source` columns in `data/catalog/crops_guanacaste.csv` |
| 🔴 | Production cost per hectare (MAG/INTA sheets) and typical yield in Guanacaste — **by 1 Nov** | `production_cost_crc_ha`, `yield_t_ha` |
| 🔴 | Ask the organisers about the pre-existing-code rule | Answer in `docs/decisions.md` |
| 🟠 | Urea price to translate legume nitrogen into colones | Sourced value |
| 🟠 | Contacts at MAG / INTA extension agencies or cooperatives in Guanacaste | List |

## During the 48 hours
- Owner of the clock (milestones in `docs/plan.md`).
- Submission form **in English** from hour 36 (summary, impact, NASA data, AI use).

## Questions she must be able to answer
- How much does it cost to keep this running? → $0: free data and free GitHub Pages hosting, no domain to renew.
- Who would use it tomorrow? → extension agents and cooperatives.
- How does it scale? → same engine, another catalog and another region of the dry tropics.
