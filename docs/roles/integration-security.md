# Plan — Integration, deployment and security (Juan Diego, cybersecurity engineering)

**Mission:** the website is online with HTTPS, `main` always works, the demo does not fail and no credentials leak.

## Before the event
| Priority | Task | Deliverable |
|---|---|---|
| 🔴 | Turn on GitHub Pages: *Settings → Pages → Source: GitHub Actions* and variable `PUBLISH_PAGES=true` | Public URL working |
| 🔴 | Protect `main` (PR required + `tests` workflow green) | Branch rule |
| 🔴 | Help José Pablo with the domain (`web/CNAME`, *Enforce HTTPS*) | Domain with padlock |
| 🟠 | Check that the `data` workflow commits without breaking `main` | Successful run |
| 🟠 | Basic Content-Security-Policy in `index.html` (only cdnjs, Google Fonts, OSM tiles, power.larc.nasa.gov) | CSP meta tested |
| 🟡 | Offline mode: test the app served locally with the repo's JSON | Documented command |

## During the 48 hours
- Owner of `main`: merge at every checkpoint.
- Hour 30: freeze. Hour 46: tag `v1.0` and verify the public link (no login, incognito, phone on mobile data).

## Security checklist
- [ ] No keys in the git history
- [ ] Earthdata secrets only on GitHub
- [ ] The app neither stores nor sends the farmer's data (everything runs in the browser)
- [ ] HTTPS enforced on the domain
- [ ] External dependencies pinned to a version (Leaflet 1.9.4)
