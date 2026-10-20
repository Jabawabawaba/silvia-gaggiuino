"""Glossary data for glossary.html. Each entry: (term, expansion or "", definition, [(link text, href), ...]).

Keep definitions short and plain. Abbreviations get their expansion; words get none.
site.py calls render() to build the page body.
"""
import html, re

E = [
    # --- abbreviations and part numbers ---
    ("AC", "alternating current", "Mains electricity, which swings back and forth 60 full cycles a second in North America (60 Hz) and 50 in most other places (50 Hz). Also the prefix on the site's mains harness runs, AC1 to AC14.", [("Wiring reference", "wiring.html")]),
    ("ADC", "analog-to-digital converter", "A chip that turns a voltage into a number. On the Gaggiuino PCB an ADS1015 does this for the pressure sensor.", [("How Gaggiuino works", "how-gaggiuino-works.html#xdcr")]),
    ("ADS1015", "", "The 12-bit ADC on the Gaggiuino PCB that reads the pressure sensor's 0.5 to 4.5 V signal from J6.", [("How Gaggiuino works", "how-gaggiuino-works.html#xdcr")]),
    ("AP", "access point", "The Wi-Fi network the Gaggiuino screen creates itself, called Gaggiuino AP, so a phone can connect to it directly before it joins your home Wi-Fi.", []),
    ("AWG", "American Wire Gauge", "Wire thickness. Smaller numbers are thicker: the harness uses 18 AWG for mains runs and 22 AWG for low-voltage runs.", [("Cut list", "cut-list.html")]),
    ("BN1.25", "", "A small bare butt splice sized for thin wire, about 22 to 16 AWG. The LED mod uses one to tap the 5 V line.", [("LED switch mod", "led-mod.html")]),
    ("BOM", "bill of materials", "The full parts list for a build. The official Gaggiuino BOM covers the electronics; the Silvia adds a few parts of its own.", [("Parts tracker", "parts-tracker.html")]),
    ("BSPP", "British Standard Pipe Parallel", "A pipe thread with straight sides that seals on a gasket or O-ring, not on the thread. The pressure sensor's G1/4 thread is BSPP.", []),
    ("CC BY-NC-SA", "Creative Commons Attribution-NonCommercial-ShareAlike", "The license this site and realNiche's diagrams use: share and adapt with credit, not for sale, under the same terms.", []),
    ("CLK", "clock", "The timing line on a two-wire sensor bus. The scales header J8 has one, shared by both load cell boards.", []),
    ("D1, D2", "data 1, data 2", "The two scale data pins on J8, one per load cell board.", []),
    ("DC", "direct current", "Electricity that flows one way, like the 5 V and 3.3 V on the Gaggiuino low-voltage side and the signal that switches the SSR.", []),
    ("DIY-EFI", "", "A UK shop that makes and sells the official Gaggiuino PCB and screen. Not an abbreviation you need to expand; it's the shop's name.", [("Budget", "budget.html")]),
    ("DPST", "double pole, single throw", "A switch with two separate contacts that open and close together. The Silvia's power switch is DPST so it can break line and neutral at once.", [("How the Silvia works", "how-silvia-works.html#circuit")]),
    ("E and M", "", "From V5 on, the Silvia M has a plain on/off power switch and the Silvia E (sold in Europe) has a push button with a 30-minute auto-off.", [("Which Silvia is mine", "which-silvia.html")]),
    ("EP5", "", "The name parts sellers give the Silvia's pump, an Ulka E-series vibratory pump. Related versions for other voltages and fittings carry names such as EX5 and EAX5.", [("How the Silvia works", "how-silvia-works.html#part-pump")]),
    ("ESP32, ESP32-S3", "", "A family of Wi-Fi microcontrollers from Espressif. The Gaggiuino screen runs on an ESP32-S3; it draws the interface, serves the web page and handles updates while the STM32 runs the machine.", [("How Gaggiuino works", "how-gaggiuino-works.html#screen")]),
    ("FAT32", "", "A memory-card format. The Gaggiuino screen wants its microSD card formatted FAT32.", []),
    ("G1/4", "", "A quarter-inch BSPP thread, the size on the standard Gaggiuino pressure sensor. It won't seal into a 1/4\" NPT fitting.", []),
    ("GC, GCP", "Gaggia Classic, Gaggia Classic Pro", "The machines Gaggiuino was designed for and documents first.", []),
    ("GFCI", "ground-fault circuit interrupter", "The North American outlet protection that cuts power within milliseconds if current leaks to earth, for example through a person. Use one for first power-on. Elsewhere the same job is done by an RCD.", [("Power-on checks", "power-on-checks.html")]),
    ("GICAR", "", "An Italian maker of espresso machine control boards. The Silvia E's energy-saver (auto-off) module is a GICAR part.", [("Which Silvia is mine", "which-silvia.html")]),
    ("GND", "ground", "The 0 V reference of the low-voltage side. On this PCB it is not connected to earth.", [("How Gaggiuino works", "how-gaggiuino-works.html#ground")]),
    ("HPWR", "High Peak Width Resolution", "A Gaggiuino heating setting: the base time, in milliseconds, that Main Divider and Brew Divider scale into on and off pulses. The Gen 3 manual calls it the relay's maximum pulse width.", [("How Gaggiuino works", "how-gaggiuino-works.html#temp")]),
    ("HV, LV", "high voltage, low voltage", "Builder shorthand for mains wiring and for the 5 V and 3.3 V wiring. This site says mains and low voltage.", []),
    ("I/O", "input/output", "A pin that can read a signal or drive one. J5 on the PCB brings out spare I/O pins; the Silvia harness puts the hot water switch on one of them.", [("Wiring reference", "wiring.html")]),
    ("HW scales", "hardware scales", "Load cells built into the drip tray area, read by the PCB, as opposed to a Bluetooth scale you set on the tray.", [("How Gaggiuino works", "how-gaggiuino-works.html#scales")]),
    ("HX711", "", "A chip that measures the tiny voltage from a load cell bridge very precisely (24 bits) and passes the reading to the PCB.", [("How Gaggiuino works", "how-gaggiuino-works.html#scales")]),
    ("IEC C14, C13", "", "The standard three-pin appliance inlet on the back of the machine (C14) and the cord plug that fits it (C13).", []),
    ("J1 to J13", "", "Connector numbers printed on the Gaggiuino PCB. J1 screen, J2 ToF sensor, J4 thermocouple, J5 extra inputs, J6 pressure, J7 switches, J8 scales, J9 SSR (outputs R1 and R2), J10 neutral, J11 line, J12 pump, J13 3-way valve; J27 is the SWD programming header. Pin names like B15 and A12 are the STM32's own (PB15, PA12).", [("Wiring reference", "wiring.html"), ("How Gaggiuino works", "how-gaggiuino-works.html#pcb")]),
    ("JST", "Japan Solderless Terminal", "A maker of small wire-to-board connectors, and the usual name for them. JST-PH has 2.0 mm pin spacing (most PCB headers), JST-XH 2.5 mm, JST-SH 1.0 mm (the ToF cable).", [("Cut list", "cut-list.html")]),
    ("K-type", "", "The most common thermocouple: chromel against alumel, about 41 microvolts per degree. Silvia builds use an ungrounded K-type with an M3 thread.", [("How Gaggiuino works", "how-gaggiuino-works.html#tc")]),
    ("L, N, E", "line, neutral, earth", "The three conductors in a mains cord. Line carries the voltage, neutral is the return, earth is the safety connection to the metal case.", [("How the Silvia works", "how-silvia-works.html#circuit")]),
    ("LED", "light-emitting diode", "A small lamp that runs on low voltage. The LED mod puts one in each switch.", [("LED switch mod", "led-mod.html")]),
    ("M3, M4", "", "Metric screw threads 3 mm and 4 mm across. Silvia builders use an M3 thermocouple; the official BOM's is M4, for Gaggias.", []),
    ("MAX31855", "", "The thermocouple chip on the Gaggiuino PCB. It measures the K-type's tiny voltage, corrects for its own temperature and hands the STM32 a reading. Its minus input must never touch ground, which is why the low-voltage side floats.", [("How Gaggiuino works", "how-gaggiuino-works.html#tc")]),
    ("MCU", "microcontroller unit", "A single-chip computer. The Gaggiuino PCB's MCU is an STM32.", []),
    ("MELF", "metal electrode leadless face", "A tiny cylindrical resistor. The stock switch lamps hold their resistors as two MELF studs; the LED mod swaps them.", [("LED switch mod", "led-mod.html")]),
    ("MPa", "megapascal", "A pressure unit. 1 MPa is 10 bar, so the 0 to 1.2 MPa sensor reads 0 to 12 bar.", []),
    ("NPT", "National Pipe Taper", "An American tapered pipe thread that seals on the thread itself. Not the same as BSPP; the two don't mix.", []),
    ("OL", "overload, or open line", "What a multimeter shows when the reading is off its scale, usually because the circuit is open. On the power-on checks, OL is the right answer for every short test.", [("Power-on checks", "power-on-checks.html")]),
    ("OPV", "overpressure valve", "A spring-loaded valve that caps the pump pressure by sending excess water back to the tank.", [("How the Silvia works", "how-silvia-works.html#part-opv")]),
    ("OTA", "over the air", "Updating firmware over Wi-Fi instead of a cable. Gaggiuino updates the screen this way, and on PCB v4 the board too, from the web page.", [("How Gaggiuino works", "how-gaggiuino-works.html#pcb")]),
    ("PCB", "printed circuit board", "The Gaggiuino control board, with the STM32 on it and the connectors for every sensor and load.", [("How Gaggiuino works", "how-gaggiuino-works.html#pcb")]),
    ("PID", "proportional, integral, derivative", "A classic control method, and builder shorthand for any electronic temperature control that replaces a thermostat. The public Gen 2 Gaggiuino code doesn't use one: it heats in fixed steps set by HPWR and the dividers, and the Gen 3 docs describe the same settings.", [("How Gaggiuino works", "how-gaggiuino-works.html#temp")]),
    ("PSM", "pulse skip modulation", "Controlling an AC load by letting some mains cycles through and skipping others, spread evenly. Gaggiuino drives the pump this way, one stroke per cycle let through.", [("How Gaggiuino works", "how-gaggiuino-works.html#pump")]),
    ("PSU", "power supply unit", "The part that turns mains into the PCB's low-voltage supply. On the Gaggiuino PCB it's a sealed, isolated 5 V module on the board, fed from J10 and J11.", [("How Gaggiuino works", "how-gaggiuino-works.html#ground")]),
    ("PTFE tape", "polytetrafluoroethylene", "Plumber's thread tape. The Silvia pressure tee uses Loctite 55 instead, so fittings can be turned back to line up.", []),
    ("PZ", "Pump Zero", "In Gaggiuino's model of the pump, the water one stroke moves at 0 bar. The [UT] PZ Cal profile calibrates it against a scale, so the firmware can estimate flow and weight.", [("How Gaggiuino works", "how-gaggiuino-works.html#pump")]),
    ("Qwiic, I2C", "", "I2C is a two-wire bus that chips use to talk to each other; Qwiic is SparkFun's small four-pin plug for it. The ToF sensor plugs into the PCB's Qwiic socket, J2.", [("How Gaggiuino works", "how-gaggiuino-works.html#tof")]),
    ("RCD", "residual current device", "The UK, EU and Australian name for the protection a GFCI gives: it trips when current leaks to earth.", []),
    ("RS diagram", "", "An older, untested Rancilio Silvia wiring diagram from the Discord thread, kept only for its wire lengths.", [("Wiring reference", "wiring.html")]),
    ("RX, TX", "receive, transmit", "The two data lines of a serial link. The screen's TX goes to the PCB's RX and the other way round.", []),
    ("SSR", "solid-state relay", "An electronic switch with no moving parts. A small DC signal from the PCB turns it on, and it switches mains to the element.", [("How Gaggiuino works", "how-gaggiuino-works.html#ssr")]),
    ("SSR-40DA", "", "The common SSR part number: 40 A rating, DC control input, AC output.", []),
    ("Run IDs", "", "The names the wiring reference gives each harness run: AC for mains, LV for low voltage and G for earth, each numbered, like AC4 or G1.", [("Wiring reference", "wiring.html")]),
    ("ST-Link", "", "A small USB programmer from STMicroelectronics, used to flash the STM32 by wire when an update over Wi-Fi isn't possible. A WeAct Mini Debugger does the same job.", [("Troubleshooting", "troubleshooting.html")]),
    ("STM32, STM32U585", "", "A family of microcontrollers from STMicroelectronics. PCB v4 uses an STM32U585, which runs the machine: it reads the sensors, runs the profiles and switches the loads.", [("How Gaggiuino works", "how-gaggiuino-works.html#pcb")]),
    ("SWD", "Serial Wire Debug", "The two-wire programming connection the ST-Link uses: SWDIO for data, SWCLK for clock, plus 3.3 V and GND. It's on J27 on PCB v4.", []),
    ("ToF", "time of flight", "A distance sensor that times a light pulse's round trip. Gaggiuino's ToFnLED board uses one to measure the tank level.", [("How Gaggiuino works", "how-gaggiuino-works.html#tof")]),
    ("ToFnLED", "", "Gaggiuino's optional board with a ToF tank sensor and an RGB LED that lights the water tank. On a Silvia's covered tank builders use it for the level reading.", [("How Gaggiuino works", "how-gaggiuino-works.html#tof")]),
    ("UART", "universal asynchronous receiver-transmitter", "A simple two-wire serial link. The screen and the PCB talk over one on J1.", []),
    ("UI", "user interface", "What you see and touch: the screen, and the web page it serves.", []),
    ("[UT]", "utility", "The prefix on Gaggiuino's utility profiles, such as [UT] Tube Fill and [UT] Test OPV, which run tests rather than shots.", [("Install runbook", "runbook.html")]),
    ("V1 to V6", "", "The owner-assigned names for the Silvia's versions, from 1997 to now.", [("Which Silvia is mine", "which-silvia.html")]),
    ("VAT", "value-added tax", "UK sales tax, included or added on DIY-EFI prices.", []),
    ("VL53L0X", "", "The time-of-flight distance chip the Gen 2 firmware drives on the ToFnLED board.", [("How Gaggiuino works", "how-gaggiuino-works.html#tof")]),
    # --- words ---
    ("Backflush", "", "Cleaning the group by running water, often with detergent, back through it against a blind basket.", []),
    ("Bar", "", "A pressure unit, about one atmosphere. Espresso is usually brewed around 9 bar.", []),
    ("Bimetal", "", "Two metals bonded together that expand at different rates, so the piece bends as the temperature changes. The Silvia's brew and steam thermostats work this way.", [("How the Silvia works", "how-silvia-works.html#part-tstat")]),
    ("Blind basket", "", "A filter basket with no holes. Used for backflushing and for the Test OPV utility.", []),
    ("Boiler", "", "The brass tank where the Silvia heats its water. It feeds the group for shots and makes steam.", [("How the Silvia works", "how-silvia-works.html#part-boiler")]),
    ("Brew Delta", "", "A Gaggiuino setting that lets the boiler run above the target during a shot, in step with the flow, to meet the cold water coming in. The Silvia community starts with it off.", [("How Gaggiuino works", "how-gaggiuino-works.html#temp")]),
    ("Brew Divider", "", "A Gaggiuino heating setting. In the last 5 °C below the target the element is on one part in Brew Divider² + 1 of the time; at 3 that's one part in ten.", [("How Gaggiuino works", "how-gaggiuino-works.html#temp")]),
    ("Bridge", "", "Four resistances wired in a square so a tiny change in one shows up as a small voltage across the middle. Load cells and pressure sensors read their strain gauges this way.", [("How Gaggiuino works", "how-gaggiuino-works.html#scales")]),
    ("Butt splice", "", "A small sleeve that joins two wires end to end when crimped.", []),
    ("Check valve", "", "A one-way valve. The vibratory pump has them so its back-and-forth piston pushes water one way.", [("How the Silvia works", "how-silvia-works.html#part-pump")]),
    ("Cold junction", "", "Where the thermocouple wires meet the copper on the PCB. Its temperature has to be measured and corrected for, which the MAX31855 does.", [("How Gaggiuino works", "how-gaggiuino-works.html#tc")]),
    ("Continuity", "", "Whether current can get from one point to another. A multimeter's continuity or ohms setting checks it with the power off.", [("Power-on checks", "power-on-checks.html")]),
    ("Crimp, open-barrel", "", "A crimp style for uninsulated spades: the tabs fold over the wire. It needs its own crimper and is what the boiler ends use.", []),
    ("Daisy chain", "", "One wire run that hops from terminal to terminal, like the neutral chain and the switch ground chain.", []),
    ("Descale", "", "Dissolving the mineral scale that hard water leaves in the boiler and pipes.", []),
    ("Diaphragm", "", "The thin metal wall inside the pressure sensor that flexes with pressure.", [("How Gaggiuino works", "how-gaggiuino-works.html#xdcr")]),
    ("Diode", "", "A one-way valve for current. The pump's diode passes only one half of each mains cycle, so the piston gets one pull per cycle.", [("How the Silvia works", "how-silvia-works.html#part-pump")]),
    ("Dispersion block", "", "The part in the group that spreads incoming water before the shower screen.", []),
    ("DreamSteam", "", "A Gaggiuino feature that runs the pump gently during steaming to keep a small boiler topped up. The official docs don't recommend it on a Silvia.", []),
    ("Earth", "", "The safety conductor that bonds the metal case and boiler to the ground pin of the outlet, so a fault trips the protection instead of making the case live.", [("How the Silvia works", "how-silvia-works.html#circuit")]),
    ("Element", "", "The heating coil inside the boiler, a sealed resistive heater.", [("How the Silvia works", "how-silvia-works.html#part-element")]),
    ("Firmware", "", "The program running on the PCB and the screen. Flashing means loading it.", []),
    ("Flag connector", "", "A spade connector with the wire leaving sideways, for tight spots like a PCB behind the front panel.", []),
    ("Flush", "", "Running water through the group without a shot, to fill, rinse or cool it.", []),
    ("Fork spade", "", "A U-shaped crimp terminal that slides under a screw. All four SSR terminals use them.", []),
    ("Gasket", "", "The rubber ring in the group the portafilter seals against.", [("How the Silvia works", "how-silvia-works.html#part-group")]),
    ("Group head", "", "Where the portafilter locks in and the water comes out over the coffee.", [("How the Silvia works", "how-silvia-works.html#part-group")]),
    ("Heat shrink", "", "Plastic tube that shrinks tight around a joint when heated.", []),
    ("Hysteresis", "", "A gap between where a switch turns off and where it turns back on. It stops a thermostat chattering, and it's why the stock temperature swings.", [("How the Silvia works", "how-silvia-works.html#part-tstat")]),
    ("Isolation", "", "Keeping mains and low voltage apart with no wire between them, only light (in the SSR and the PCB's optocouplers) or a transformer (in the power supply).", [("How Gaggiuino works", "how-gaggiuino-works.html#ground")]),
    ("Load cell", "", "A metal bar with strain gauges on it that bends very slightly under weight. Used for the built-in scales.", [("How Gaggiuino works", "how-gaggiuino-works.html#scales")]),
    ("Loctite 55", "", "A thread-sealing cord for tapered pipe threads that can be readjusted after it's wound on.", []),
    ("Main Divider", "", "A Gaggiuino heating setting. From 10 to 5 °C below the target the element is on one part in Main Divider + 1 of the time; at 5 that's one part in six.", [("How Gaggiuino works", "how-gaggiuino-works.html#temp")]),
    ("Neutral", "", "The mains return conductor. It's near earth voltage but carries the full load current, so it's treated as live.", []),
    ("O-ring", "", "A rubber ring that seals a joint. The pressure sensor seals on a flat white O-ring, about 11 mm across, pressed into its fitting, not on its thread.", []),
    ("Offset", "", "A Gaggiuino setting that corrects for the difference between the thermocouple reading and the water temperature at the group.", []),
    ("Optocoupler", "", "A light source and a light sensor in one package, so a signal can cross between circuits without a wire. It's how an SSR isolates the PCB from mains.", [("How Gaggiuino works", "how-gaggiuino-works.html#ssr")]),
    ("Overshoot", "", "When the temperature carries on past the target after the heater stops, because heat is still soaking through.", [("How Gaggiuino works", "how-gaggiuino-works.html#temp")]),
    ("Pole", "", "One switching contact of a switch. A two-pole switch switches two separate circuits at once.", []),
    ("Portafilter", "", "The handle and basket that hold the coffee and lock into the group.", [("How the Silvia works", "how-silvia-works.html#part-pf")]),
    ("Preinfusion", "", "Wetting the coffee at low pressure before ramping up, so the puck settles evenly.", []),
    ("Pressure profile", "", "A planned curve of pressure or flow over a shot, which Gaggiuino follows by adjusting the pump.", [("How Gaggiuino works", "how-gaggiuino-works.html#pump")]),
    ("Puck", "", "The cake of tamped coffee in the basket.", []),
    ("Pull-up resistor", "", "A resistor that holds an input high until a switch pulls it to ground. Gaggiuino's brew and steam inputs have 10 kΩ ones on the PCB, and the firmware also turns on the STM32's built-in pull-ups, so on reads as low.", [("How Gaggiuino works", "how-gaggiuino-works.html#switches")]),
    ("Rocker switch", "", "A switch you press at one end to rock it on or off, like the Silvia's front switches.", []),
    ("Safety thermostat", "", "A high-limit thermostat that cuts the element if the boiler gets far too hot, for example if it boils dry. The Silvia's screws into the front of the boiler, opens at 165 °C and stays open until you press its red reset button.", [("How the Silvia works", "how-silvia-works.html#part-tstat")]),
    ("Self-fusing silicone tape", "", "Tape that bonds to itself into a solid rubber sleeve and handles boiler heat. It covers the bare spades.", []),
    ("Shower screen", "", "The perforated plate in the group that spreads water over the puck.", [("How the Silvia works", "how-silvia-works.html#part-group")]),
    ("Solenoid", "", "A coil that pulls an iron plunger when current flows. The 3-way valve and the pump both use one.", [("How the Silvia works", "how-silvia-works.html#part-sol")]),
    ("Spade connector", "", "A flat 6.3 mm push-on terminal, used on the switches, boiler, pump and PCB mains connectors.", []),
    ("Steam wand", "", "The pipe that delivers steam, or hot water, from the boiler for milk.", [("How the Silvia works", "how-silvia-works.html#part-wand")]),
    ("Strain gauge", "", "A thin foil whose resistance changes as it's stretched. Load cells and pressure sensors are built on them.", []),
    ("Tee, elbow", "", "Plumbing fittings: a tee splits a line in two, an elbow turns it. Most Silvia builds put the pressure sensor on a tee at the OPV, through an elbow.", []),
    ("Temperature surfing", "", "Timing a stock Silvia shot by the heating light to start at a known point in the thermostat's swing.", [("How the Silvia works", "how-silvia-works.html#shot")]),
    ("Thermal fuse", "", "A cut-out that opens if a part overheats. Some Silvias have one in the pump's wiring.", [("How the Silvia works", "how-silvia-works.html#part-pump")]),
    ("Thermoblock", "", "A heater that warms water as it flows through, instead of keeping a boilerful hot. Gaggiuino's docs use it to describe what Brew Delta does.", [("How Gaggiuino works", "how-gaggiuino-works.html#temp")]),
    ("Thermal paste", "", "Paste that fills the air gaps between a sensor and the metal it sits on, so heat reaches the sensor faster.", []),
    ("Thermocouple", "", "Two different metals joined at a tip; heating the tip makes a tiny voltage that gives the temperature.", [("How Gaggiuino works", "how-gaggiuino-works.html#tc")]),
    ("Thermostat", "", "A switch that opens and closes at a temperature. The stock Silvia controls its heat with them.", [("How the Silvia works", "how-silvia-works.html#part-tstat")]),
    ("Transducer", "", "A sensor that turns one quantity into another, here pressure into a voltage.", [("How Gaggiuino works", "how-gaggiuino-works.html#xdcr")]),
    ("Triac", "", "A semiconductor switch for AC that, once fired, conducts until the current next falls to zero. Inside the SSR one switches the element; on the PCB one drives the pump, and the 3-way valve's small solid-state relay has one inside.", [("How Gaggiuino works", "how-gaggiuino-works.html#ssr")]),
    ("Ulka, CEME", "", "Ulka is the vibratory pump brand in the Silvia and most home espresso machines, made by the Italian company CEME. Its E-series pumps are rated about 15 bar.", [("How the Silvia works", "how-silvia-works.html#part-pump")]),
    ("3-way valve", "", "The solenoid valve between the boiler and the group. On, it feeds the group; off, it vents the group to the drip tray.", [("How the Silvia works", "how-silvia-works.html#part-sol")]),
    ("Ungrounded thermocouple", "", "One whose junction is insulated from its metal sheath, so it doesn't connect the low-voltage side to the earthed boiler.", [("How Gaggiuino works", "how-gaggiuino-works.html#ground")]),
    ("Vibratory pump", "", "A pump whose piston is pulled by a coil and pushed back by a spring, once per mains cycle. Small, loud and cheap, and standard in home espresso machines.", [("How the Silvia works", "how-silvia-works.html#part-pump")]),
    ("Zero cross", "", "The moment the mains voltage passes through zero. Switching there makes less electrical noise. A detector on the PCB reports each one, and the STM32 times the pump to it.", [("How Gaggiuino works", "how-gaggiuino-works.html#pump")]),
]


def slug(t):
    return "t-" + re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")


def key(t):
    k = re.sub(r"^[^A-Za-z0-9]+", "", t).upper()
    return k[0] if k and k[0].isalpha() else "#"


def is_abbr(t, ex):
    """Abbreviations and part numbers: anything with an expansion, or a term whose first word is mostly capitals (AC, ToF, G1/4, E and M)."""
    if ex:
        return True
    for part in re.split(r",\s*| and | to ", t):
        tok = part.strip().strip("[]").split(" ")[0]
        letters = [c for c in tok if c.isalpha()]
        if letters and sum(c.isupper() for c in letters) * 2 >= len(letters) and (len(letters) > 1 or tok.isupper()):
            return True
    return False


def render():
    groups = {}
    for t, ex, d, see in sorted(E, key=lambda e: re.sub(r"^[^A-Za-z0-9]+", "", e[0]).lower()):
        groups.setdefault(key(t), []).append((t, ex, d, see))
    letters = sorted(groups, key=lambda k: (k == "#", k))
    bar = "".join(
        f'<a href="#L-{c}">{c}</a>' if c in groups else f'<span aria-hidden="true">{c}</span>'
        for c in "ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    if "#" in groups:
        bar = '<a href="#L-num">0–9</a>' + bar
    out = []
    for c in letters:
        cid = "num" if c == "#" else c
        out.append(f'<section class="gl-sec" id="L-{cid}" data-letter="{cid}"><h2 class="gl-l">{"0–9" if c == "#" else c}</h2><dl>')
        for t, ex, d, see in groups[c]:
            kind = "abbr" if is_abbr(t, ex) else "word"
            seeh = ""
            if see:
                seeh = '<span class="gl-see">' + ", ".join(f'<a href="{h}">{html.escape(x)}</a>' for x, h in see) + "</span>"
            exh = f'<span class="gl-ex">{html.escape(ex)}</span>' if ex else ""
            out.append(f'<div class="gl-e" id="{slug(t)}" data-kind="{kind}"><dt>{html.escape(t)}{exh}</dt><dd>{html.escape(d)}{seeh}</dd></div>')
        out.append("</dl></section>")
    return bar, "".join(out), len(E)


if __name__ == "__main__":
    b, body, n = render()
    print(n, "entries")
