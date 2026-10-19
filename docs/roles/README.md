# Plans per role — Iriria Sìsù

Team deliverables: **video (≤ 30 s)** and **web prototype**. Each role has tasks before the event (until 13 Nov), during the 48 hours, and its deliverable.

| Role | Person | Plan |
|---|---|---|
| Science lead | Jose Antonio Chávez Ureña | [science-lead.md](science-lead.md) |
| Data, engine and domain | José Pablo Ramírez Fernández | [data-and-engine.md](data-and-engine.md) |
| Integration, deployment and security | Juan Diego Chávez Ureña | [integration-security.md](integration-security.md) |
| Economics, impact and operations | Angeli Abarca Ureña | [economics-operations.md](economics-operations.md) |
| Design, UX and video | Nesly Mejía Jiménez | [design-video.md](design-video.md) |
| Field work, validation and optional sensor | Britzie Yarith García Arias | [field-and-sensors.md](field-and-sensors.md) |

## How they connect
```
Science ──catalog and rules──▶ Data & engine ──JSON + engine.js──▶ Website (Design + Integration)
   ▲                                 ▲                                     │
Economics ──prices and costs─────────┘                                     ▼
Field work ──tests with farmers / extension agents────────────▶  Video + public domain
```

## Critical dependencies
1. **Verified catalog** (Science + Economics) → deadline **8 Nov**.
2. **Real data in `web/data/`** (`data` workflow) → ✅ done; refreshed every Monday.
3. **Domain + HTTPS** (José Pablo) → before **1 Nov**.
4. **Freeze** of formulas and catalog → **13 Nov**.

## Common rules
- Every new term goes into the glossary, in both versions: [English](../glossary.md) and [Spanish](../glossary.es.md).
- No number in the app or the video without a source.
- Branches + PRs (see `CONTRIBUTING.md`). The tests (`npm test`) must pass.
- Everything in the repo is in English; the Spanish team guides live in [`../team-guides-es/`](../team-guides-es/).
