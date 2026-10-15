# Contributing

The most useful contributions are from finished Silvia builds. Open an issue with:

- **Your machine:** Silvia version (V1 to V6, E or M), voltage, any prior mods.
- **Harness lengths you actually used**, by run ID from the wiring reference (AC1, LV3 and so on). The lengths on the site come from one builder and an untested older diagram.
- **Where your pressure transducer went** (OPV tee, 3-way valve bottom port, elsewhere) and the exact fittings.
- **Screen mount and cable length**, especially for the funnel mount.
- **Photos** of the finished wiring, boiler top, and switch backs.
- **Corrections.** If a check, a step or a run is wrong, say which page, which ID, and what the official docs or your machine show instead.

To change a page:

- Every page is built from `build/`. The install pages, cut list, troubleshooting, which Silvia and the home page are templates there; harness runs live in `runs.py`; the budget, used checklist, parts tracker and LED mod pages are in `build/pages/`. Edit the source, run `python3 site.py` in `build/`, and send the source change with the rebuilt pages.
- Don't edit the built `.html` files at the repo root by hand; the next build overwrites them.
- Keep the mains-voltage warnings. Keep the "unofficial" labelling. Don't present anything as validated unless the Gaggiuino project has reviewed it.

Everything contributed is published under CC BY-NC-SA 4.0 with credit to you by whatever name you give.
