# Gaggiuino on Rancilio Silvia: Discord notes

Notes captured from the Gaggiuino Discord in October 2026. Community material, unreviewed, kept here as the raw source behind the site's pages. Credit to the contributors named below. Where these notes and the site's pages disagree, the pages are the later reading; where either disagrees with the official docs, trust the official docs.

Sources (Gaggiuino Discord):
- "Rancilio Silvia install specifics" thread (Jan 2024 to Jan 2026). Contributors: Zer0-bit, Juun, Talon, realNiche, Joscha, cjs, Bitr0t, EspressoHackers. This thread is for install notes and 3D models only; questions go in individual help threads.
- "[Untested] Rancilio Silvia PCBv3 Wiring Diagram" thread (Jun 2023). Contributors: realNiche (OP), Juun, Vas, Loogle. The original design discussion; mostly about where the hot water switch connects.
- "[gerrg][Silvia V6][PCBv4][Gen 3]" build log (May 2025 to Apr 2026). Contributors: gerrg (OP), Talon, Juun, redjb, bomerst. See section 9.

These are the Silvia-specific additions and deviations. The standard Gaggiuino BOM and install guide still apply.

Thread attachments (not included here; see the Discord threads):
- realNiche's "Rancillio Silvia Wiring" diagram (PCB v3.1/v4.0)
- The older "RS Wiring" diagram (220 VAC, PCB v3, marked UNTESTED, has wire lengths)
- Three of Talon's install photos (top, back, front)
- cjs's Tank_level_top.STL and Tank_level_but.STL
- Loogle's "Component Housing Schematic" for the Lego build (rev 3.4, 2023-06-22)
- Switch panel sketches: hot water combo jumpers, LED on the hot water switch, spare terminals circled on steam/brew, and a single-switch LED + 1k ohm circuit
- Blackpill pinout with PA12 marked

---

## 1. System settings (best known so far)

| Setting | Value |
|---|---|
| HPWR | 100 |
| M.DIV | 5 |
| B.DIV | 3 |
| Offset | 5 |
| Brew Delta | OFF |
| Dream Steam | OFF |

- Dream Steam is unnecessary on Silvia (large boiler, strong steam on stock). Gen3 software: disable in Settings. Older software: add to `extra_defines.ini` alongside any scales/ToF defines:
  ```
  [extra]
  build_flags =
      -DDREAM_STEAM_DISABLED
  ```
- If removing the steam thermostat for custom wiring, set max steam to 150C.

## 2. Component placement

- SSR: left of the 3-way valve. Talon drilled one hole for a screw/washers/nut to hold it (his photo shows it on a small metal bracket at the left wall).
- Pressure transducer: screwed into the bottom port of the 3-way valve via an elbow, hanging below the valve (visible in Talon's front photo).
- PCB: right of the 3-way valve, or next to the pump. Thin velcro strips work for the PCB and scales board case.
- LEGO box (PCB enclosure): right of the 3-way valve. Talon's is a black 3D-printed box on the right wall.
- HX711/scales board enclosure: Talon's sits bottom center, between the transducer and the PCB box.
- Thermocouple: M3 instead of M4 (confirmed back in the 2023 thread). Use thermal paste, hand tight.
- Use flag connectors if the PCB goes behind the front panel (AliExpress item 1005005109606262).
- Screen enclosure:
  - Silvia V1-V4: Printables model 691527 (unofficial Nextion display enclosure for Gaggiuino)
  - Silvia V5+: Printables model 343688 (Silvia V6 Nextion display enclosure)
  - Talon used the funnel-mount screen enclosure instead of front mount, which needs longer screen cables.

## 3. Wiring

- Reference diagram: realNiche's, at github.com/thejobbitt/gaggiuino_resources, in `wiring_diagrams/rancilio_silvia` (the thread called the folder "Wiring Diagrams/Rancilio Silvia"; it has since been renamed). Covers 110-240 VAC, PCB v3.1/v4.0, with Nextion NX3224F024, Headless E177, or ESP32-S3 display options. Eco machines require full custom wiring.
- Thick lines = high voltage, thin lines = low voltage.
- Plumbing BOM: link in thread was broken (listed as unknown).

### Thermostats

- realNiche's first (2023) draft removed both the brew and steam thermostats.
- Juun: most people just disconnect the brew thermostat and use its connectors to feed the SSR. Whether to keep the steam thermostat was left open; if you remove it, set max steam to 150C (section 1).

### Component specs (from the diagram)

- Switches: Steam, Hot Water, Brew, Power are all DPST, 6.3 mm male spades, viewed from back.
- Indicator lamp: shows when boiler is heating, 6.3 mm spades.
- Safety thermostat: 165C, on the boiler.
- Boiler terminals: 6.3 mm spades.
- SSR: 3-32 VDC control, 24-480 VAC load, 40 A. Use fork spade connectors on all 4 screw terminals.
- Solenoid (3-way valve): Brass 57, 6.3 mm spades on connector side, plus a ground spade.
- Pump: Ulka EFP5 or EP5, with 110C pump thermal fuse.
- Pressure transducer: 0-1.2 MPa, 5 V, G1/4, side view.
- Thermocouple: K type, ungrounded, M3.
- Power socket: IEC C14 15 A, ground facing up (cord NEMA 5-15P to C13 for US).

### CoffeeHat PCB v3.1/v4.0 connector map

| Connector | Function | Pins |
|---|---|---|
| J1 | Touch screen (JST-PH 2 mm) | GND, TX, RX, 5V |
| J2 | ToFnLED (backside, JST-SH 1 mm) | CLK, DATA, 3V3, GND |
| J4 | Thermocouple | -, + |
| J5 | Extra IO | GND, B15, A12 |
| J6 | Pressure transducer | 5V, GND, P |
| J7 | Switches | GND, S (steam), B (brew) |
| J8 | Scales | D2, 5V, GND, CLK, D1 |
| J9 | SSR relay | GND, R1, R2 (R1 drives the boiler SSR; R2 unused on Silvia, per the older diagram) |
| J27 | Programming / UART | |
| J10 | AC Neutral (6.3 mm spade) | |
| J11 | AC Line (6.3 mm spade) | |
| J12 | Pump (6.3 mm spade) | |
| J13 | Solenoid / 3-way valve (6.3 mm spade) | |

Switch LV wiring: Steam to J7 S, Brew to J7 B, Hot Water to J5 B15, with GND daisy-chained across all three switches to J7 GND.

### Hot water switch: which input (resolved)

The 2023 thread was mostly about this. Short answer for a PCB build: use J5 **B15**, not A12.

- Firmware check (public `release/stm32-blackpill` branch, `src/pindef.h`, checked Oct 2026): `waterPin` is **PB15** when built with `-DSINGLE_BOARD`, and **PA12** otherwise. Every `all-pcb-*` PlatformIO target defines `SINGLE_BOARD`; the `lego-*` targets do not. So PCB builds read PB15 with no code change or soldering. Gen3 firmware was not checked.
- J5 breaks out both B15 and A12. A12 is the Lego-build pin; on PCB firmware, a switch on A12 would be ignored.
- History: hot water was first implemented on PA12 (it came in from someone's Lego build). PCB v3 did not route PA12 to any connector, so the options in 2023 were soldering to the Blackpill header leg or moving to PB15 (originally reserved for a water level reed, freed up once ToFnLED handled water level). The older RS Wiring diagram still shows a green "Manual Connection PA12" wire from the hot water switch; that is obsolete for current PCB builds.
- No-extra-wire alternative: the firmware also treats brew + steam closed at the same time as hot water (`hotWaterSwitchState = waterPinState() || (brew && steam)`, the GC/GCP switch combo). One sketch uses this: jumper the hot water switch so one pole pulls the steam S line to GND and the other pulls the brew B line to GND (S jumped to hot water pole 1, hot water pole 2 jumped to brew B, both bottom terminals tied to GND). Works, but the dedicated B15 wire is cleaner and is what realNiche's diagram uses.
- Keep it low voltage. Juun noted Silvia could hard-wire hot water to the pump like stock, but LV avoids extra piggybacks and splitters. Vas warned that switching the pump in HV around the PCB's pump output effectively shorts the dimmer's triac. Do not leave the stock HV hot water wiring in place.

### Reference wire lengths (from the older RS Wiring diagram, 220 V PCB v3, marked untested)

These line up with Talon's harness below, so they are a reasonable starting point.

| Run | Length |
|---|---|
| Touch screen cable (front mount) | 650 mm |
| Switch LV wires (S, B, GND daisy chain) | 320 mm, 320 mm, 470 mm |
| Hot water switch to IO (B15) | 400 mm |
| Thermostat to SSR (L) | 350 mm |
| SSR to PCB L | 200 mm |
| Boiler L lead | 250 mm |
| Lamp L lead | 250 mm or 100 mm (see doubling choice below) |
| Power switch L | 350 mm |
| Power switch to indicator lamp (N) | 100 mm |
| Indicator lamp N | 400 mm |
| Boiler N | 300 mm |
| Solenoid N | 120 mm |
| Pump N | 350 mm |
| Solenoid to J13 | 120 mm |
| Solenoid ground | 200 mm |

### Talon's custom harness (based on realNiche's diagram)

Shows logical connections only; doubled/spliced wires are not drawn.

- **N chain:** N to Solenoid (120 mm) > Solenoid to Pump (350 mm) > Pump to Indicator Lamp (400 mm) > Lamp to Power Switch (100 mm) > Switch to Boiler (300 mm, for cable management)
- **L (at PCB):** L to SSR (200 mm) > SSR to Power Switch (350 mm)
- **L (at boiler/thermostat/lamp):** two options for the doubled spade
  - Doubled at boiler terminal: both leads 250 mm, one to indicator lamp, one to safety thermostat
  - Doubled at safety thermostat: 250 mm to boiler, 100 mm to indicator lamp (Talon chose this)
- **Screen cables:** longer than needed for funnel mount; could be shortened a little.

### Install rules from Talon's build

- Do NOT use nylon spades at the boiler. Use uninsulated spades plus self-adhering silicone tape. (His top photo still shows red nylon spades on the boiler; he redid these afterward.)
- Do NOT crimp two 18 AWG wires into red spades. Use blue spades.
- Front: LV connections to the PCB routed right, SSR HV connections straight up.
- Back: AC, pump hose (braided steel), and pump wiring consolidated to the center slot for HV/LV isolation.
- Top: daisy-chained LV switch wire enters the lowest switch first, then chains up. HV routed high for isolation.
- Butt splices (red, 18-22 AWG) are used liberally for the LV daisy chains; a labeled "ground" splice sits near the solenoid.

### Lego (non-PCB) build reference

Loogle's Component Housing Schematic (rev 3.4) is for the Lego build: Blackpill on a Nano expansion board, MAX6675 thermocouple board, pump dimmer, relay for the 3-way valve, snubber, 12 V AC-DC PSU plus 5 V step-down, ADS1015 for the pressure transducer, optional dual HX711 and ToFnLED. Its "Silvia Only" block wires the hot water switch to PA12 with COM on GND, matching the Lego firmware pin above. Not the path for a CoffeeHat PCB build, but its wiring notes are useful generally:

- HV wires 22 AWG or heavier; boiler heater wires 18 AWG or heavier.
- LV between housing components 22-26 AWG (22 for PSU, step-down, and switch runs). Scale wires 26-30 AWG.
- Bare wire or crimped ferrules in screw terminals; do not tin wires that get clamped.
- Solder where possible; no DuPont connectors (headers on the Blackpill/expansion board are fine).
- AC-DC PSU and snubber L/N polarity does not matter as long as it is consistent.
- ToFnLED is not 5 V tolerant: feed it 3.3 V through an LDO and use a level converter on SDA/SCL.

## 4. Hardware scales

### Load cell mount (3D printed)

- Original: 3D Printed Load Cell Mounts for Silvia
- Remixes: Makkuro's slide-on, Sacatab's
- Latest/recommended: Joscha's "beefy" remix, Printables model 1277828. Thicker bridge (less flex), narrower left/right spacing, magnet pockets, wider/longer tray paddles. Designed for 1 kg 13x13x80 mm load cells.

### Scales BOM

- 2x 1 kg load cells (13x13x80 mm)
- 4x M4 x 10 mm countersunk screws
- M5 x 10 mm low profile screws
- 4x 5x2 mm magnets (same as standard HW scales)
- Stripboard
- 1 row 2.54 mm right-angle header pins
- 5P JST XH connector
- 26 AWG silicone wire
- Either 2x HX711 interface boards + 1k resistor, or Vas' Dualscales board
- Enclosure for the HX711s or Dualscales board: Sacatab's HX711 enclosure, Waffe's Dualscales board enclosure, or a plastic project box

Remaining steps follow the standard GC/P HW scales install instructions.

## 5. ToF water level sensor

- The Silvia tank is deeper (~200 mm), so the stock ranges are wrong.
  - Gen3 software: set ToF ranges in the ToFnLED Settings page. No code edit needed.
  - Older software: edit `src/peripherials/tof.h`, `readRangeToPct`, and replace the ranges array with 10 values: 20, 40, 60, 80, 100, 120, 140, 160, 180, 200 (water_lvl array stays 100 down to 10). Credit cryptenstein.
- ToF-only (no LED strip) makes sense on Silvia since the tank is covered.

### ToF-only BOM

- Standalone ToF sensor
- Oskar_diy ToF enclosure (designed for four 5x2 mm magnets)
- 4-pin JST SH 1.0 cable (pigtails, or crimp your own)
- Conformal coat the ToF board, leaving the sensor top uncovered. Clear nail polish is sufficient.

### Mounting

- Screen funnel mounts are plastic, so magnets need a metal target. Talon stuck a leftover adhesive-backed metal disk under the funnel mount and let the enclosure magnets hold to it. Position to keep silicone hoses clear of the sensor.
- Double-sided tape works but makes it hard to disconnect the ToF when removing the funnel mount (e.g. to pull the water tank).
- Alternative: cjs's water tank mount, two STLs, requires a T-fitting.
  - Tank_level_but.STL (body): 25.0 x 30.1 x 48.0 mm bounding box, ~238k triangles
  - Tank_level_top.STL (cap/insert): 16.6 x 5.9 x 35.4 mm bounding box, ~62k triangles
  - Files are from cjs's help thread ([csj][Silvia V2][PCBv3][Gen2]) on Discord.

## 6. LED (low voltage) mod

- Power: butt splice (BN 1.25) on the 5V line from the screen connection, cut closer to the PCB but leaving enough wire to exit the 3D printed enclosure. 320 mm from the splice, then 100 mm daisy chains between switches.
- Circuit per switch (from the single-switch sketch): the first pole stays as the signal-to-GND input. 5 V goes to the second pole's bottom terminal, and an LED plus 1k ohm resistor runs from that pole's top terminal to GND, so the LED lights when the switch is on. The circled sketch marks those spare second-pole terminals on steam and brew. Another sketch shows an LED drawn across the hot water switch's top terminals.
- The metal "studs" in the switches are 0407 MELF surface-mount resistors, 47k ohm each.
- No-solder option: replace with 0 ohm MELFs (DigiKey MMB02070Z0000ZB200, Vishay), or pick a value from a 100 ohm to 1k ohm variety pack. 12 AWG solid copper wire (~2 mm) also works as a 0 ohm replacement.
- Resolved later in the thread: the studs can simply be removed (PBS), and every LED keeps its own 1k to 3k series resistor (mjr, Mathieu). See the LED switch mod page.

## 7. Notes and gotchas

- The 3-way valve clip must be "opposite direction." The standard Gaggiuino BOM link offers same/opposite selection; the Silvia thread link does not, and vendor listings change, so verify when ordering.
- Dream Steam off is the consensus; see section 1.
- Flash with Dream Steam off via extra defines on pre-Gen3 builds.
- The RS Wiring diagram with lengths is marked UNTESTED and is for 220 V / PCB v3 (STM32 Blackpill). Use realNiche's v3.1/v4.0 diagram for connections; use the older one only for length reference. Ignore its "Manual Connection PA12" hot water wire.
- Hot water switch goes to J5 B15 on PCB builds (firmware reads PB15 there). Keep it LV; switching the pump in HV around the PCB output shorts the dimmer triac. See section 3.

## 8. Silvia-specific BOM summary (additions to standard Gaggiuino BOM)

**Mechanical / enclosures**
- Screen enclosure for your Silvia version (Printables 691527 for V1-V4, 343688 for V5+)
- Load cell mount (Joscha beefy remix, Printables 1277828)
- HX711 or Dualscales board enclosure
- ToF enclosure (Oskar_diy) or cjs tank mount + T-fitting
- M3 thermocouple, thermal paste
- SSR mounting hardware (one screw, washers, nut) or bracket

**Scales**
- 2x 1 kg load cells (13x13x80 mm)
- 4x M4x10 countersunk, M5x10 low profile screws
- 4x 5x2 mm magnets
- 2x HX711 + 1k resistor, or Vas' Dualscales board
- Stripboard, 2.54 mm right-angle headers, 5P JST XH, 26 AWG silicone wire

**ToF**
- Standalone ToF sensor
- 4-pin JST SH 1.0 cable
- Clear nail polish (conformal coat)
- Adhesive metal disk (if magnet-mounting to funnel mount)

**Wiring / electrical**
- Uninsulated spades + self-adhering silicone tape (boiler)
- Blue spades for doubled 18 AWG runs
- Fork spades for the 4 SSR terminals
- Flag connectors (if PCB behind front panel)
- Red butt splices for LV daisy chains; BN 1.25 butt splice (LED mod)
- 0 ohm 0407 MELF resistors or 12 AWG solid copper (LED mod), or 100 ohm to 1k ohm MELFs
- 3-way valve clip, opposite direction
- Velcro strips (PCB, scales board case)

## 9. A Silvia V6 build log (gerrg, May 2025 to April 2026)

A US Silvia V6 on PCB v4 and Gen 3. After wiring, everything worked except the hardware scales, which turned out to be a wiring slip.

- **Parts list:** a public Google Sheet, the most complete Silvia V6 list found so far: https://docs.google.com/spreadsheets/d/1xjcB6rN2AdtnimUDdN68e9jHE2p5eL-skKkFtvtA_5I
- **PCB, screen and pressure sensor from Peak Coffee.** Talon: if you order from Peak, those items work; the sensor can come from wherever is cheapest. Peak's complete kit adds the Gaggia ToFnLED, which is no use with the Silvia's covered tank, so he bought load cells and a plain ToF instead.
- **Pressure sensor at the OPV** with Juun's parts: 1/8" FFM tee, 1/4"F to 1/8"M elbow, Loctite 55. No 3-way valve clip anywhere in the list. Talon's review: "Quick review looks fine", plus a reminder to plan crimp tools (spades, butt connectors, JST unless you use pigtails) and insulation (self-adhering silicone tape or silicone heat shrink).
- **Housings:** screen in Loogle's Gen 3 screen housing (Printables 356026); PCB in Loogle's hinged PCB v3.1/v4 housing (Printables 894339), held with velcro.
- **ToFnLED on a Silvia:** set different min/max values; Talon thinks 20/200 works ("don't quote me"). Matches the ranges in section 5.
- **Hardware scales:** 1 kg load cells need only the standard calibration (Talon). Weight stuck at 0: Juun's checklist is HW scales enabled in the settings, then voltage at the HX711 board and photos of the wiring. gerrg's 5 V and CLK were swapped. The older load cell mount (Printables 357683) was wobbly; wrapping self-fusing silicone tape around the frame where it clips on made it solid.
- **Crimping:** uninsulated flags, spades and forks, with interchangeable jaws: HS-056FL for flags, SN-058B for spades, SN-6 for forks. His AliExpress crimper links wouldn't ship to the US.
- **JST pins:** the sharp tip of a pair of tweezers releases them: https://www.youtube.com/watch?v=nRVhPhfdawg
- **Not Gaggiuino, but done on the same machine:** an insulated steam wand with a PTFE tube inside (sharpen the tube's end with a pencil sharpener to feed it through; bomerst: recess the O-ring at the ball end deeply, deburr and chamfer the ball end, and if steam starts running outside the tube, fill around it with silicone), and a low-profile shower screen screw.
- **Leads:** gblur's "[gblur][Silvia V6 E][PCB v4]" build guide in #help-silvia and his walkthrough video: https://www.youtube.com/watch?v=nquiqOzltUo
- Talon asks people to put questions about their own build in their own help thread.

## 10. Links

- realNiche wiring diagram (current): https://github.com/thejobbitt/gaggiuino_resources/tree/main/wiring_diagrams/rancilio_silvia
- realNiche original 2023 diagram (historical): https://github.com/thejobbitt/gaggiuino-build/tree/main/wiring/Rancilio%20Silvia
- Firmware pin definitions: https://github.com/Zer0-bit/gaggiuino/blob/release/stm32-blackpill/src/pindef.h
- Screen enclosure V1-V4: https://www.printables.com/model/691527-unofficial-nextion-display-enclosure-for-gaggiuino
- Screen enclosure V5+: https://www.printables.com/model/343688-rancilio-silvia-v6-nextion-display-enclosure-for-g
- Joscha load cell mount: https://www.printables.com/model/1277828-rancilio-silvia-load-cell-mount-beefy
- Flag connectors: https://www.aliexpress.com/item/1005005109606262.html
- 0 ohm MELF: https://www.digikey.com/en/products/detail/vishay/MMB02070Z0000ZB200/2177496
