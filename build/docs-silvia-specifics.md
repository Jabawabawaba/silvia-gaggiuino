# Gaggiuino on a Rancilio Silvia: what's different

The official Gaggiuino docs cover the Gaggia Classic family. A single-boiler Silvia (V1 to V6) runs Gaggiuino well, and Gen 3 is the recommended generation for it, but the install differs in the ways below. Sources are marked **[Official]** (gaggiuino.github.io, read October 2026), **[Discord]** (the "Rancilio Silvia install specifics" and "[Concept] Rancilio Silvia BOM" threads, 2023 to 2026) or **[Firmware]** (the public repo). Nothing in this doc applies to the dual-boiler Silvia Pro or Pro X.

## Generations

V1 1997 to 2006, V2 August 2006 to 2008, V3 mid-2008 to 2014, V4 2014 to about 2016, V5 about 2016 to 2020, V6 2020 on. From V5 it's sold as the Silvia M (manual off) and, in Europe, the Silvia E with a 30-minute auto-off. The US unit is the Silvia M. Gaggiuino replaces the control wiring entirely, so what you're buying is the boiler, element, pump, group and case; any version with the 3-way solenoid is covered by the Discord thread. There's no stock-wiring integration for a Silvia, so every version gets the full custom harness. **[Discord]** Version dates and features: Wikipedia, Seattle Coffee Gear and Whole Latte Love; see `which-silvia.html` for how to tell them apart.

### What each version changes for the build

- **V1 before May 2000:** a different boiler design. Confirm how the thermocouple mounts before buying one.
- **V1 from 2002, V2 and V3:** the element is soldered into the boiler; a dead one means a new boiler half. Measure it before buying.
- **V1:** single-nut OPV set with washers, not the later two-nut adjuster.
- **V4:** the element screws in and can be replaced on its own. The closest match to realNiche's diagram.
- **V5 and V6:** insulated boiler (lift it before the thermostats come off, refit after the thermocouple) and round power and heating LEDs. Trace the heating LED's wires before cutting: stock, it usually runs from the switched line to the element terminal shared with the steam thermostat, and the new harness puts it across the element (AC7, AC8). On an E the energy-saver module may drive the LEDs; ask on Discord first.
- **Silvia E (V5, V6):** a push-button power switch driving a GICAR energy-saver module. Both come out; the harness needs a latching double-pole switch that breaks line and neutral. Which part E builders fit is still open; confirm on Discord. **[Auber/Jetblack E note]**
- **230 V machines:** same harness (realNiche's diagram covers 110 to 240 V). The element's resistance is roughly three times a 120 V one's (about 48 Ω against 15 Ω), and the protection is an RCD rather than a GFCI.

## Buying parts

- **No Silvia kit.** Talon (Oct 2025): buy the PCB v4 and the 4.3" screen from an approved supplier (DIY-EFI in the UK, or Gaggiuino.co) and source the rest yourself. Only the STM32 section of the official BOM applies; skip the Gaggia tubing, tap block and fittings. **[Discord]**
- **Peak Coffee** (peakcoffee.cc) is a second source for US buyers: V4 PCB $68, 4.3" Gen 3 screen $58 or $65 (pre-flashed and activated, one or two cables), pressure sensor $38 (silicone O-ring and a pre-crimped 20 cm lead), with US tax included (October 2026). Talon OK'd its PCB, screen and sensor for a Silvia build in 2025. It isn't on the official docs' current approved list, though it has its own channel on the Discord (#peakcoffee-cc). The catches: a 5.2% card fee, shipping from Asia (pick expedited, since the other options aren't covered for loss or damage), no warranty, and no refunds once an order is packed. Skip its kits for a Silvia: they carry a Gaggia pressure tap block, an M4 thermocouple, HV cables cut for Gaggia stock wiring and the ToFnLED's LED bar, which you can't see in a Silvia. Its scales board comes only with 750 g load cells, and the Silvia mounts are made for 1 kg ones. **[Supplier site + Discord]**
- **Thermocouple: M3, ungrounded K-type**, not the BOM's M4. Thermal paste rated 180 °C or more. **[Discord]**
- **Pressure transducer plumbing.** The standard 0 to 1.2 MPa G1/4 transducer, on a 1/8" FFM tee at the OPV through a 1/4"F to 1/8"M elbow, which keeps it clear of the steam pipes. Loctite 55 thread cord on the tapered tee and elbow threads so they can be turned back to line up; the transducer seals on a flat 11 × 6 mm O-ring pressed flush into the elbow's 1/4" socket (the official guide's advice, since the sensor's own base O-ring often can't reach the seat), hand tight plus at most a quarter turn. The transducer is rated to 105 °C and this spot never sees steam temperatures. A tee at the pump adds vibration noise to the reading. Some builds use the 3-way valve's bottom port instead (Talon's does). A 2025 V6 build used the OPV tee and Talon OK'd its parts list, so both work; the OPV tee has an exact parts list. **[Discord]**
- **Wire:** 18 AWG 200 °C silicone for mains, 22 AWG for low voltage. The Silvia harness is longer than a Gaggia one; budget an extra meter of 18 AWG. **[Official + Discord]**
- **Spades:** uninsulated 6.3 mm spades crimped with an open-barrel crimper plus self-fusing silicone tape at the boiler (nylon spades are rated to 105 °C). Spades sized for two 18 AWG wires (blue, or bare 16–14 AWG) wherever two runs share a terminal. Fork spades on all four SSR terminals. Flag connectors if the PCB sits behind the front panel. **[Official + Discord]**
- **Prints:** the official Gen 3 screen housing with the funnel mount has been used on a Silvia (Talon) and needs a longer screen cable than a Gaggia front mount. A 2025 V6 build used Loogle's Gen 3 screen housing (Printables 356026). The Printables "Silvia Nextion enclosure" models (691527, 343688) are Gen 2 housings and don't fit a Gen 3 screen. PCB housing: Printables 894339 or any box. **[Official + Discord]**
- **Screen cable:** DIY-EFI's screen comes with a 60 cm cable and Peak Coffee lists 45 cm for its own. A front-mount Silvia build used about 65 cm and the funnel mount runs longer, so plan on a longer cable (JST-PH 4-pin, wired by pin, not by color). **[Supplier sites + Discord]**
- **The "3-way valve clip, opposite direction"** in the thread's BOM is probably a garbled reference to the ToF cable's "opposite direction" JST SH type. A complete 2025 V6 parts list that Talon reviewed has no valve clip. **[Discord]**

## Placement

SSR on the left wall (one drilled hole, or a small bracket), PCB to the right of the 3-way valve or beside the pump on velcro, transducer hanging below its tee, scales board bottom center. Mains routed high, low voltage low and to the right; mains, pump hose and pump wiring through the center slot at the back for separation. **[Discord]**

## Wiring

There is no official Silvia schematic. realNiche's "Rancillio Silvia Wiring" (PCB v3.1/v4.0, 110–240 V) is the reference everyone uses: https://github.com/thejobbitt/gaggiuino_resources/tree/main/wiring_diagrams/rancilio_silvia. The site's wiring reference is a redraw of it with run IDs and lengths.

- **Power switch** stays on mains and breaks both line and neutral, one per pole. Supply on the outer spades, loads off the center spades. [On the wiring map](wiring.html#map?part=pwr).
- **Line:** switched line feeds both SSR load terminal 1 and PCB J11. SSR terminal 2 feeds the 165 °C safety thermostat, then the boiler element, with the heating lamp across the element. [On the wiring map](wiring.html#map?runs=AC1,AC3,AC4,AC5,AC6,AC7&label=Line%20and%20heater).
- **Neutral:** a daisy chain from the power switch to the lamp, pump (through its thermal fuse where fitted; realNiche's diagram shows 110 °C), solenoid and PCB J10, plus a run to the element. [On the wiring map](wiring.html#map?layer=N).
- **PCB outputs:** J12 pump, J13 solenoid. [On the wiring map](wiring.html#map?runs=AC14,AC13&label=PCB%20outputs).
- **Earth:** inlet earth to the boiler ground spade, solenoid ground to the boiler ground spade. Earth never connects to the PCB's 5 V ground, which floats so the thermocouple reads correctly. **[Official]** [On the wiring map](wiring.html#map?layer=E).
- **Switches:** brew, steam and hot water each use one pole. Signal on the center spade, ground on the outer spade: steam to J7 S, brew to J7 B, hot water to **J5 B15**, with the ground chain to J7 GND. [On the wiring map](wiring.html#map?runs=LV1,LV2,LV3,LV4,LV5,LV6&label=Switch%20signal%20and%20ground%20wires).
- **Hot water on B15, not A12:** realNiche's schematic puts the switch on J5 B15, and Talon confirmed on Discord in October 2026 that Gen 3 reads it there. In the public STM32 firmware, `pindef.h` reads `waterPin` as PB15 when built with `SINGLE_BOARD`, which every `all-pcb-*` target defines; A12 is the component (Lego) build pin. Brew plus steam together also triggers hot water mode. Keep the switch low voltage; switching the pump in mains around the PCB's output shorts its triac. **[Firmware + Discord]**
- **Thermostats:** the brew thermostat comes out. The brew and steam thermostats are clamped to the boiler top with M3 screws, and the M3 thermocouple screws into one of those holes; GaggiMate's Silvia guide suggests the middle or left-most hole for better readings. The safety thermostat stays in the heater line. The steam thermostat isn't wired in realNiche's harness, so it no longer limits anything whether it stays in the boiler or comes out; set Steam Temperature to 150 °C either way. **[Discord]**
- **Lengths** (Talon's harness and an older untested diagram): N chain 120, 350, 400, 100, 300 mm; L to SSR 200 mm, SSR to switch 350 mm, thermostat to SSR 350 mm; doubled leads 250 mm at the element or 250 + 100 mm at the thermostat; switch LV 320, 320, 470 mm; hot water 400 mm; screen 650 mm front mount, more for funnel. Cut long. **[Discord]**

## Settings

Starting values from the thread, not official defaults (the manual recommends its defaults for Gaggia models only):

| Setting | Value |
|---|---|
| DreamSteam | Off (the official manual itself says not recommended for the Silvia) |
| Brew Delta | Off |
| Temperature Offset | 5, then tune against a group-head measurement |
| HPWR / Main Divider / Brew Divider | 100 / 5 / 3 |
| Steam Temperature (max steam) | 150 °C (the steam thermostat is off the heater line) |

## First power-on and calibration

Fill the boiler **before anything else**: open the steam knob and run Flush until water comes steadily from the wand (Rancilio's way of filling a Silvia), then close the knob and run water through the group for 5 seconds or more, as the official Gen 3 manual asks. Then run [UT] Tube Fill (T-fitting installs), then [UT] Test OPV with a blank basket: 10.5 to 13 bar, water moving through the OPV tubing, no leaks. Then [UT] PZ Cal for the pump. **[Official]** Watch that the temperature rises while the heating light is on; if it falls, the thermocouple is reversed at J4 (how thermocouples behave; not in the official docs).

## Extras

- **Hardware scales:** 1 kg 13×13×80 mm load cells on Joscha's "beefy" mount (Printables 1277828), M4×10 countersunk and M5×10 low-profile screws, 5×2 mm magnets, then the standard HX711 or dual-scales board install. **[Discord]**
- **ToF:** the tank is ~200 mm deep and covered, so the board is used for the level reading; its RGB tank light is hidden under the lid. Gen 3 sets the ranges in the ToFnLED settings page. Magnet-mount to an adhesive metal disk under the funnel mount, or cjs's tank mount with a T-fitting. **[Discord]**
- **LED switch mod:** the lamps go dark on low voltage. Remove the lamp and the two 47k studs, fit an orange 5 mm LED with its own 1k to 3k resistor, 5 V from the screen line via a butt splice. See the LED page. **[Discord]**

## Still open

1. The screen cable length a V6 funnel mount needs.
2. Which latching double-pole switch Silvia E builders fit in place of the push button and energy-saver module, and whether anything else on the E needs bypassing under the custom harness. gblur's "[gblur][Silvia V6 E][PCB v4]" build thread in #help-silvia and his walkthrough video are the place to check.
3. Whether a stock Silvia OPV passes [UT] Test OPV (10.5 to 13 bar) or usually needs raising.
4. More real harness lengths, to compare with Talon's.
