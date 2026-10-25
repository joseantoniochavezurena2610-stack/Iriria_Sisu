# Plan — Validation, usability and NASA resources (Britzie, mechatronics engineering)

**Change (25 Oct, decision D23):** the challenge is theoretical. The team does **no physical tests**: no ribbon tests on real soil, no soil-lab guide, no ESP32 sensor. This role now checks, with data and with people using the website, that the app is understandable and that we are ready to use the NASA resources offered during the 48 hours (D24).

## Before the event
| Priority | Task | Deliverable | Date |
|---|---|---|---|
| 🔴 | **NASA resources inventory:** fill in [`event-nasa-resources.md`](../event-nasa-resources.md) for each dataset/tool (what it measures, resolution, period, access, format, which part of the app could use it) so hour 0 of the event is a checklist, not research | Table complete | 8 Nov |
| 🔴 | With Angeli: internal user test — two people who did not code use the public link and note what they did not understand | Improvements as Issues | 8 Nov |
| 🟠 | Phone usability: fill in the form in < 2 min on Android and iPhone, on mobile data | Measured times in an Issue | 8 Nov |
| 🟠 | Help Jose Antonio build the POWER vs IMN rainfall table (Liberia, Nicoya, Nandayure) from published data | Shared table | 1 Nov |
| 🟠 | Owner of the **dress rehearsal** (week 4): someone who did not code uses the public link from scratch on a phone; note every stumble | List in Issues | 12 Nov |

Removed (D23): ribbon test on 3 soils, soil-testing guide, ESP32 sensor.

## During the 48 hours
- Hours 0–3: with Jose Antonio, compare what NASA offers against the inventory and mark *adopt / cross-check only / skip*.
- Check that any new NASA data shows correctly in the app (right canton, right units, source label visible).
- Phone tests (Android and iPhone, mobile data) after every merge to `main`.
- Help with the video: screen recordings of the form on a real phone.
