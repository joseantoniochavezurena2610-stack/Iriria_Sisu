# Plans per role — Iriria Sìsù

Since 25 Oct the team has **5 people** (José Pablo left, decision D17); his tasks were split as shown in [`../plan.md`](../plan.md).

Team deliverables: **video (≤ 30 s)** and **web prototype**. Each role has tasks before the event (until 13 Nov), during the 48 hours, and its deliverable.

| Role | Person | Plan |
|---|---|---|
| Science lead | Jose Antonio Chávez Ureña | [science-lead.md](science-lead.md) |
| Integration, deployment, security, data and engine | Juan Diego Chávez Ureña | [integration-security.md](integration-security.md) |
| Economics, impact and operations | Angeli Abarca Ureña | [economics-operations.md](economics-operations.md) |
| Design, UX and video | Nesly Mejía Jiménez | [design-video.md](design-video.md) |
| Field work, validation and optional sensor | Britzie Yarith García Arias | [field-and-sensors.md](field-and-sensors.md) |

## How they connect
```
Science ──catalog and rules──▶ Engine (Integration) ──JSON + engine.js──▶ Website (Design + Integration)
   ▲                                 ▲                                     │
Economics ──prices and costs─────────┘                                     ▼
Field work ──internal user tests and dress rehearsal───────────▶  Video + public link
```

## Critical dependencies
1. **Prices and costs** → ✅ done 25 Oct (D20); Economics reviews the rows marked "estimate".
2. **Verified catalog** (Science) → deadline **8 Nov**.
3. **Real data in `web/data/`** (`data` workflow) → ✅ done; refreshed every Monday by itself.
4. **Public link + HTTPS** (Juan Diego, with Jose Antonio's owner account) → **27 Oct**: https://joseantoniochavezurena2610-stack.github.io/Iriria_Sisu/
5. **Freeze** of formulas and catalog → **13 Nov**.

## Common rules
- Every new term goes into the glossary, in both versions: [English](../glossary.md) and [Spanish](../glossary.es.md).
- No number in the app or the video without a source.
- Branches + PRs (see `CONTRIBUTING.md`). The tests (`npm test`) must pass.
- Everything in the repo is in English; the Spanish team guides live in [`../team-guides-es/`](../team-guides-es/).
