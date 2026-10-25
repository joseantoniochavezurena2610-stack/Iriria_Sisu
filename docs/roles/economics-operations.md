# Plan — Economics, impact and operations (Angeli, industrial engineering)

**Mission:** the Income axis uses real numbers, the tool's cost is clear and there is a credible path to the farmer. Also the team's clock.

## Before the event
| Priority | Task | Deliverable |
|---|---|---|
| 🔴 | **Update the team on the Space Apps site** (José Pablo left, D17) | Registration shows 5 members |
| ✅ | Prices, costs and yields for every crop — **done 25 Oct** from public web sources (D20) | `yield_t_ha`, `price_crc_kg`, `production_cost_crc_ha`, `economic_source`, `economic_confidence` in the CSV; [`research/prices-and-costs.md`](../research/prices-and-costs.md) |
| 🟠 | Review the rows marked **estimate** (sorghum, cowpea, peanut, melon and watermelon prices, green-manure cost) and replace any with a better public source | Edited CSV + `python scripts/catalog_to_json.py` |
| 🟠 | Be able to explain why rice and beans lose money in the app (published prices below published costs) | 2 sentences for the submission |
| ✅ | Pre-existing-code rule — answered 22 Oct: allowed (D25). The submission form must say what was built before and during the event | `docs/decisions.md` |
| ✅ | Urea price for legume nitrogen — done: ₡27,755 per 45 kg sack (MAG-SEPSA, Aug 2026) → ₡1,341 per kg N | In `engine.js` |

## During the 48 hours
- Owner of the clock (milestones in `docs/plan.md`).
- Submission form **in English** from hour 36 (summary, impact, NASA data, AI use).

## Questions she must be able to answer
- How much does it cost to keep this running? → $0: free data and free GitHub Pages hosting, no domain to renew.
- Who would use it tomorrow? → extension agents and cooperatives.
- How does it scale? → same engine, another catalog and another region of the dry tropics.
