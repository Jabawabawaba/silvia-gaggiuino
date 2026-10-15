# Silvia Gaggiuino Toolkit

Unofficial tools for fitting [Gaggiuino](https://gaggiuino.github.io/) (Gen 3, PCB v4) to a single-boiler **Rancilio Silvia** (V1 to V6, not the Pro or Pro X).

Gaggiuino is documented for the Gaggia Classic. The Silvia works, but there is no kit, no official schematic and no official install guide. The Silvia-specific knowledge lives in Discord threads. This site collects it into pages you can use at the bench.

**Site:** https://jabawabawaba.github.io/silvia-gaggiuino/ (GitHub Pages, served from this repo's root)

## What's here

| Page | For | What it does |
|---|---|---|
| `index.html` | Everyone | The tools in build order, your Silvia's version notes, what's different on a Silvia, starting settings, open questions, credits |
| `conversion.html` | Everyone | A scroll-driven animation of the whole conversion, from the stock machine to a profiled shot, each step linked to its page |
| `how-silvia-works.html` | Learning | The stock machine as an animated x-ray you can run through heat, brew, hot water and steam; every part explained; a live ladder diagram of the stock circuit you can switch |
| `how-gaggiuino-works.html` | Learning | What the PCB, sensors and SSR take over, how Gaggiuino holds the temperature and drives the pump, the new parts and mods, and why the low-voltage side floats, with interactive figures |
| `glossary.html` | Reference | 133 acronyms and shop words used across the site, searchable, each with a plain definition and links |
| `budget.html` | Planning | Cost builder: new or used machine, scales choice, ToF, LED mod; enter real quotes |
| `used-checklist.html` | Buying used | Inspection checklist per listing, with a price gauge |
| `which-silvia.html` | Planning | Tell V1 to V6 and E from M apart, and what each changes for the build |
| `parts-tracker.html` | Ordering | The Silvia BOM with links, status, price paid, box contents |
| `runbook.html` | Install day | Eight phases of tickable steps with notes, and a stop point before first power-on; prints as one checklist |
| `wiring.html` | Install day | realNiche's diagram redrawn with an ID per run, ends, gauge, connectors and lengths; tap to isolate a run |
| `cut-list.html` | Install day | Wire to buy by gauge and color, connectors to crimp, and every run to cut, with adjustable extra length |
| `wire-labels.html` | Install day | Printable flag labels per run end, PDF for Letter or A4 |
| `power-on-checks.html` | Before plugging in | 55 unplugged multimeter and visual checks that mark themselves pass or fail; prints with blanks for readings |
| `troubleshooting.html` | After | Symptoms with likely causes and checks, linked to check and run IDs |
| `led-mod.html` | After | mjr's switch LED conversion, drawn step by step |
| `silvia-specifics.html`, `discord-notes.html` | Reference | The two docs below, rendered as site pages |
| `docs/silvia-specifics.md` | Reference | The Silvia deltas from the Gaggia install, with reasoning and sources |
| `docs/discord-notes.md` | Reference | Notes captured from the Discord Silvia threads |

Every page is a single self-contained HTML file. Ticks, readings and prices are saved in your own browser (localStorage), so nothing leaves your machine and nothing is shared between devices.

**Your Silvia.** Set your version (V1 to V6), model (E or M, V5 and V6 only) and mains voltage from "Your Silvia" in the top bar or on the home page. The runbook, checks, wiring and troubleshooting pages then show only the steps and notes for your machine, and use RCD or GFCI wording to match your voltage. With nothing set, every note shows with a tag saying which machines it's for.

**Printing.** The runbook prints every phase as one checklist with your settings and blank lines for notes. The power-on checks print with a reading blank and pass or fail boxes on every item, or with your recorded readings if you've entered them. The cut list prints as a shopping and cutting sheet. Use your browser's print command on the published site.

## Safety

This conversion involves mains voltage. Work only with the cord out of the wall and the machine. Pass every power-on check before first plug-in, use a GFCI outlet (an RCD-protected socket on 230 V), keep the covers on. Nothing here has been reviewed by the Gaggiuino project; if anything disagrees with the [official docs](https://gaggiuino.github.io/) or with your own reading of your machine, trust those. You are responsible for your own build.

## Known gaps

- There is no validated Silvia schematic. `wiring.html` is a redraw of realNiche's community diagram; check each run against [his original](https://github.com/thejobbitt/gaggiuino_resources/tree/main/wiring_diagrams/rancilio_silvia).
- Harness lengths come from one builder's harness and an older untested diagram. Cut long, trim.
- The transducer location (OPV tee vs the 3-way valve's bottom port) and the screen cable length for a funnel mount are still open on Discord.
- The hot water switch on J5 B15 is from the public STM32 firmware's PCB pin definitions as read in October 2026, not from official install docs, and isn't yet confirmed on Gen 3 firmware.
- The Learn pages describe the heating and pump control from the public Gen 2 firmware, because Gen 3's source isn't published; Gen 3 uses the same settings. The PCB details come from the work-in-progress PCB v4 schematic. The stock circuit is redrawn from GaggiMate's diagram of the Silvia harness.

If you have a finished build, your lengths, photos and corrections are exactly what's missing. See `CONTRIBUTING.md`.

## Rebuilding the pages

`build/` holds the generators. `runs.py` is the single source of truth for the harness runs; `wiring.html`, `wire-labels.html` and `cut-list.html` are generated from it. The site-only pages (home, which Silvia, cut list, troubleshooting, the Learn pages and the glossary) are templates in `build/` that share `base.css`; the scroll animation on `conversion.html` is `story.tpl.html`, and `img/` holds the still the home page uses for it. The Learn pages pull their parts from `learn-*.html`, `learn-*.css` and `learn-*.js`, and the glossary entries live in `gen_glossary.py`. `machine.js` is the "Your Silvia" picker, inlined into every page.

```
cd build
python3 site.py https://github.com/Jabawabawaba/silvia-gaggiuino   # builds every page into ../site/ with nav, footer and relative links
```

Then copy the contents of `site/` over the repo root. The budget, used checklist, parts tracker and LED mod pages are edited directly in `build/pages/`. `build.py` on its own only makes the standalone versions of the install pages, which you don't need for the site.

## Credits

- The [Gaggiuino project](https://gaggiuino.github.io/) and its official docs.
- realNiche: the Rancilio Silvia wiring diagram.
- Talon, Juun, Zer0-bit, Vas, Joscha, cjs, Bitr0t, EspressoHackers and others in the Discord "Rancilio Silvia install specifics" and "[Concept] Rancilio Silvia BOM" threads.
- mjr, PBS and Mathieu: the switch LED guide.

## License

Content and code in this repo: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/), matching the license on realNiche's diagrams that the wiring pages derive from. See `LICENSE`.
