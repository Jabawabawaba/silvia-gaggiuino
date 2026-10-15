# Shared harness run list for the Silvia wiring reference and wire labels.
# Sources: realNiche's "Rancillio Silvia Wiring" (PCB v3.1/v4.0) for connections;
# Talon's harness and the older RS Wiring diagram for lengths (Discord install notes).

SPADE = "6.3 mm female spade"
SPADE2 = "6.3 mm female spade sized for two 18 AWG wires (blue)"
HOT = "Uninsulated 6.3 mm spade (open-barrel crimp) + self-fusing silicone tape"
HOT2 = "Uninsulated 6.3 mm spade sized for two 18 AWG wires + self-fusing silicone tape"
FORK2 = "Fork spade sized for two 18 AWG wires"
FORK = "Fork spade"
JST = "JST-PH 2 mm crimp in the connector housing"

RUNS = [
    # ---- Line side ----
    dict(id="AC1", sys="L", short="Inlet L → Power sw L", frm="Power inlet, L pin", to="Power switch, L pole outer spade",
         gauge="18 AWG", mm=None, lenNote="Reuse the stock lead if it is sound, or measure",
         ends=[SPADE, SPADE], src="realNiche", note="Supply goes on the outer spades of the power switch; the loads come off the center spades."),
    dict(id="AC3", sys="L", short="Power sw L → SSR 1", frm="Power switch, L pole center spade", to="SSR load terminal 1",
         gauge="18 AWG", mm=350, ends=[SPADE, FORK2 + ", shared with AC4"], src="Talon / RS lengths",
         note="Switched line into the SSR. The same SSR terminal also feeds the PCB through AC4."),
    dict(id="AC4", sys="L", short="SSR 1 → J11 Line", frm="SSR load terminal 1", to="PCB J11 (AC Line)",
         gauge="18 AWG", mm=200, ends=["Shared fork with AC3", SPADE], src="Talon / RS lengths",
         note="Powers the PCB and feeds its pump and solenoid outputs."),
    dict(id="AC13", sys="L", short="J13 → Solenoid coil", frm="PCB J13 (Solenoid)", to="Solenoid, coil spade",
         gauge="18 AWG", mm=120, ends=[SPADE, HOT], src="RS lengths",
         note="PCB-switched line to the 3-way valve coil. The valve sits on the hot group, so bare spades and silicone tape are the safer choice there."),
    dict(id="AC14", sys="L", short="J12 → Pump coil", frm="PCB J12 (Pump)", to="Pump, coil terminal",
         gauge="18 AWG", mm=None, lenNote="Not in the reference lengths; measure",
         ends=[SPADE, SPADE], src="realNiche",
         note="PCB-switched line to the pump. Neutral reaches the pump's other terminal through its thermal fuse."),
    # ---- Heater path ----
    dict(id="AC5", sys="H", short="SSR 2 → Safety tstat", frm="SSR load terminal 2", to="Safety thermostat (165 C), terminal 1",
         gauge="18 AWG", mm=350, ends=[FORK, HOT], hot="b", src="RS lengths (thermostat to SSR)",
         note="The 165 C safety thermostat stays in the heater line. Never bypass it."),
    dict(id="AC6", sys="H", short="Safety tstat → Element", frm="Safety thermostat, terminal 2", to="Boiler element, terminal 1",
         gauge="18 AWG", mm=250, ends=[HOT2 + ", shared with AC7", HOT], hot="both", src="Talon",
         note="Talon doubled the spade at the safety thermostat. The alternative is doubling at the element terminal, with both leads 250 mm."),
    dict(id="AC7", sys="H", short="Safety tstat → Lamp L", frm="Safety thermostat, terminal 2", to="Heating lamp, L spade",
         gauge="18 AWG", mm=100, lenNote="100 mm doubled at the thermostat (Talon); 250 mm if doubled at the element",
         ends=["Shared with AC6", SPADE], hot="a", src="Talon",
         note="The heating lamp sits across the element, so it lights whenever the SSR is heating."),
    # ---- Neutral chain ----
    dict(id="AC2", sys="N", short="Inlet N → Power sw N", frm="Power inlet, N pin", to="Power switch, N pole outer spade",
         gauge="18 AWG", mm=None, lenNote="Reuse the stock lead if it is sound, or measure",
         ends=[SPADE, SPADE], src="realNiche",
         note="The power switch breaks both line and neutral, one per pole."),
    dict(id="AC8", sys="N", short="Power sw N → Lamp N", frm="Power switch, N pole center spade", to="Heating lamp, N spade",
         gauge="18 AWG", mm=100, ends=[SPADE2 + ", shared with AC9", SPADE2 + ", shared with AC10"], src="Talon",
         note="Start of the neutral daisy chain."),
    dict(id="AC9", sys="N", short="Power sw N → Element", frm="Power switch, N pole center spade", to="Boiler element, terminal 2",
         gauge="18 AWG", mm=300, ends=["Shared with AC8", HOT], hot="b", src="Talon",
         note="Talon left this one long for cable management."),
    dict(id="AC10", sys="N", short="Lamp N → Pump N", frm="Heating lamp, N spade", to="Pump, thermal-fuse terminal",
         gauge="18 AWG", mm=400, ends=["Shared with AC8", SPADE2 + ", shared with AC11"], src="Talon / RS lengths",
         note="The pump's thermal fuse (110 C on realNiche's diagram) stays in circuit. If your pump has none, this run goes to the pump terminal."),
    dict(id="AC11", sys="N", short="Pump N → Solenoid N", frm="Pump, thermal-fuse terminal", to="Solenoid, N spade",
         gauge="18 AWG", mm=350, ends=["Shared with AC10", HOT2 + ", shared with AC12"], src="Talon / RS lengths", note=""),
    dict(id="AC12", sys="N", short="Solenoid N → J10 Neutral", frm="Solenoid, N spade", to="PCB J10 (AC Neutral)",
         gauge="18 AWG", mm=120, ends=["Shared with AC11", SPADE], src="Talon / RS lengths", note="End of the neutral chain."),
    # ---- Earth ----
    dict(id="G1", sys="E", short="Inlet earth → Boiler gnd", frm="Power inlet, earth pin", to="Boiler ground spade",
         gauge="18 AWG green", mm=None, lenNote="Reuse the stock earth lead if it is sound, or measure",
         ends=[SPADE, HOT2 + ", shared with G2"], hot="b", src="realNiche",
         note="Earth never connects to the PCB's 5 V ground (official warning)."),
    dict(id="G2", sys="E", short="Solenoid gnd → Boiler gnd", frm="Solenoid ground spade", to="Boiler ground spade",
         gauge="18 AWG green", mm=200, ends=[HOT, "Shared with G1"], hot="b", src="RS lengths", note=""),
    # ---- Low voltage: switches ----
    dict(id="LV1", sys="LV", short="J7 S → Steam sw", frm="PCB J7 S", to="Steam switch, ground pole center spade",
         gauge="22 AWG", mm=320, ends=[JST, "6.3 mm female spade (red)"], src="realNiche / RS lengths",
         note="Signal on the center spade, ground on the outer spade of the same pole."),
    dict(id="LV2", sys="LV", short="J7 B → Brew sw", frm="PCB J7 B", to="Brew switch, ground pole center spade",
         gauge="22 AWG", mm=320, ends=[JST, "6.3 mm female spade (red)"], src="realNiche / RS lengths", note=""),
    dict(id="LV3", sys="LV", short="J5 B15 → Hot water sw", frm="PCB J5 B15", to="Hot water switch, ground pole center spade",
         gauge="22 AWG", mm=400, ends=[JST, "6.3 mm female spade (red)"], src="realNiche / RS lengths",
         note="B15, not A12: PCB firmware reads the hot water switch on B15. Keep hot water on low voltage."),
    dict(id="LV4", sys="LVG", short="J7 GND → Steam sw gnd", frm="PCB J7 GND", to="Steam switch, ground pole outer spade",
         gauge="22 AWG", mm=470, ends=[JST, "6.3 mm female spade (red)"], src="RS lengths / Talon",
         note="Start of the switch ground chain. Talon brings it into the lowest switch first and chains up; start at whichever switch is nearest."),
    dict(id="LV5", sys="LVG", short="Steam sw gnd → Brew sw gnd", frm="Steam switch, ground pole outer spade", to="Brew switch, ground pole outer spade",
         gauge="22 AWG", mm=None, lenNote="Short jumper; measure (about 100 mm)",
         ends=["Shared spade or red butt splice", "6.3 mm female spade (red)"], src="Talon / LED notes", note=""),
    dict(id="LV6", sys="LVG", short="Brew sw gnd → Hot water gnd", frm="Brew switch, ground pole outer spade", to="Hot water switch, ground pole outer spade",
         gauge="22 AWG", mm=None, lenNote="Short jumper; measure (about 100 mm)",
         ends=["Shared spade or red butt splice", "6.3 mm female spade (red)"], src="Talon / LED notes", note=""),
    # ---- Low voltage: SSR and sensors ----
    dict(id="LV7", sys="S", short="J9 R1 → SSR +", frm="PCB J9 R1", to="SSR control +",
         gauge="22 AWG", mm=None, lenNote="Measure", ends=[JST, FORK], src="realNiche / official LV schematic",
         note="Polarity matters: R1 to +, GND to −."),
    dict(id="LV8", sys="S", short="J9 GND → SSR −", frm="PCB J9 GND", to="SSR control −",
         gauge="22 AWG", mm=None, lenNote="Measure", ends=[JST, FORK], src="realNiche / official LV schematic", note=""),
    dict(id="LV9", sys="S", short="J6 → Pressure sensor", frm="PCB J6 (5V, GND, P)", to="Pressure transducer",
         gauge="Sensor lead", mm=None, lenNote="Sensor's own lead; extend with 22 AWG if short",
         ends=["JST-PH 3-pin", "Transducer pigtail"], src="realNiche", note="Three wires: 5V, GND and P (signal)."),
    dict(id="LV10", sys="S", short="J4 → Thermocouple", frm="PCB J4 (+, −)", to="Thermocouple, brew thermostat position",
         gauge="TC lead", mm=None, lenNote="Thermocouple's own lead",
         ends=["Screw terminal; fold the bare wire over, don't clamp insulation", "M3 thermocouple"], src="Official PCB guide / Discord",
         note="Ungrounded K-type. Route it around the front of the boiler. If the bench test shows temperature falling when you warm it, swap the two leads."),
    dict(id="LV11", sys="S", short="J1 → Screen", frm="PCB J1 (GND, TX, RX, 5V)", to="4.3 in Gen 3.5 screen",
         gauge="Screen cable", mm=600, lenNote="DIY-EFI cable is 60 cm and Peak Coffee's 45 cm. The older diagram used 650 mm for a front mount; a funnel mount needs more (open question)",
         ends=["JST-PH 4-pin", "Screen connector"], src="DIY-EFI / RS lengths / Talon",
         note="Check connection points, not colors: blue and yellow can be swapped between cable revisions. Don't take pre-made cables apart."),
    # ---- Optional ----
    dict(id="OP1", sys="OPT", short="J8 → Scales board", frm="PCB J8 (D2, 5V, GND, CLK, D1)", to="Scales board (optional)",
         gauge="5-pin cable", mm=None, lenNote="5P JST XH to PH cable", ends=["JST-PH 5-pin", "JST-XH 5-pin"], src="Official BOM / Discord", note="Only if you fit hardware scales."),
    dict(id="OP2", sys="OPT", short="J2 → ToF sensor", frm="PCB J2, backside (JST-SH)", to="ToF sensor (optional)",
         gauge="Qwiic cable", mm=250, lenNote="250 mm or longer, JST SH 1.0 opposite direction",
         ends=["JST-SH 4-pin", "JST-SH 4-pin"], src="Official BOM / Discord", note="Only if you fit the ToF tank sensor."),
    dict(id="OP3", sys="OPT", short="5V splice → 1st sw LED", frm="Screen 5V line (BN1.25 butt splice)", to="First switch, LED pole outer spade",
         gauge="22 AWG", mm=320, ends=["BN1.25 butt splice", "6.3 mm female spade (red)"], src="Discord LED notes",
         note="LED switch mod only. See the LED guide for which pole gets 5 V."),
    dict(id="OP4", sys="OPT", short="1st sw LED → 2nd sw LED", frm="First switch, LED pole outer spade", to="Second switch, LED pole outer spade",
         gauge="22 AWG", mm=100, ends=["Shared spade", "6.3 mm female spade (red)"], src="Discord LED notes", note="LED switch mod only."),
    dict(id="OP5", sys="OPT", short="2nd sw LED → 3rd sw LED", frm="Second switch, LED pole outer spade", to="Third switch, LED pole outer spade",
         gauge="22 AWG", mm=100, ends=["Shared spade", "6.3 mm female spade (red)"], src="Discord LED notes", note="LED switch mod only."),
]

SYS = {
    "L": "Line",
    "H": "Heater line (after the SSR)",
    "N": "Neutral",
    "E": "Earth",
    "LV": "Switch signal",
    "LVG": "Switch ground",
    "S": "SSR control and sensors",
    "OPT": "Optional",
}

CONNECTORS = [
    ["J1", "Screen", "GND, TX, RX, 5V", "JST-PH 2 mm"],
    ["J2", "ToF / ToFnLED (backside)", "CLK, DATA, 3V3, GND", "JST-SH 1 mm"],
    ["J4", "Thermocouple", "−, +", "Screw terminal"],
    ["J5", "Extra IO", "GND, B15, A12", "JST-PH 2 mm"],
    ["J6", "Pressure transducer", "5V, GND, P", "JST-PH 2 mm"],
    ["J7", "Switches", "GND, S (steam), B (brew)", "JST-PH 2 mm"],
    ["J8", "Scales", "D2, 5V, GND, CLK, D1", "JST-PH 2 mm"],
    ["J9", "SSR", "GND, R1, R2 (R2 unused)", "JST-PH 2 mm"],
    ["J10", "AC Neutral", "N", "6.3 mm male spade"],
    ["J11", "AC Line", "L", "6.3 mm male spade"],
    ["J12", "Pump", "P", "6.3 mm male spade"],
    ["J13", "Solenoid (3-way valve)", "3", "6.3 mm male spade"],
]


# Connector kind at each end, for the cut list. Shared terminals carry an id after the colon
# and are counted once. f = insulated 6.3 mm female, f2 = insulated for two 18 AWG, b/b2 = bare
# (open-barrel) + silicone tape, fk/fk2 = fork for the SSR load screws, fks = small fork for SSR
# control, lv/lv2 = insulated 6.3 mm female for one/two 22 AWG, jst = JST-PH crimp, jst3 = three
# JST-PH crimps, bn = BN1.25 butt splice, tc/pig/pre = nothing to buy.
KINDS = {
    "AC1": ["f", "f"], "AC3": ["f", "fk2:SSR1"], "AC4": ["fk2:SSR1", "f"], "AC13": ["f", "b"], "AC14": ["f", "f"],
    "AC5": ["fk", "b"], "AC6": ["b2:TST2", "b"], "AC7": ["b2:TST2", "f"],
    "AC2": ["f", "f"], "AC8": ["f2:SWN", "f2:LAMPN"], "AC9": ["f2:SWN", "b"], "AC10": ["f2:LAMPN", "f2:PUMPN"],
    "AC11": ["f2:PUMPN", "b2:SOLN"], "AC12": ["b2:SOLN", "f"],
    "G1": ["f", "b2:BGND"], "G2": ["b", "b2:BGND"],
    "LV1": ["jst", "lv"], "LV2": ["jst", "lv"], "LV3": ["jst", "lv"], "LV4": ["jst", "lv2:STG"],
    "LV5": ["lv2:STG", "lv2:BRG"], "LV6": ["lv2:BRG", "lv"], "LV7": ["jst", "fks"], "LV8": ["jst", "fks"],
    "LV9": ["jst3", "pig"], "LV10": ["tc", "pig"], "LV11": ["pre", "pre"],
    "OP1": ["pre", "pre"], "OP2": ["pre", "pre"], "OP3": ["bn", "lv2:LED1"], "OP4": ["lv2:LED1", "lv2:LED2"], "OP5": ["lv2:LED2", "lv"],
}
HEADER = {"LV1": "J7", "LV2": "J7", "LV4": "J7", "LV3": "J5", "LV7": "J9", "LV8": "J9", "LV9": "J6"}
COLOR = {"L": "red", "H": "orange", "N": "blue", "E": "green", "LV": "white", "LVG": "black", "S": "", "OPT": ""}
COLOR_OVERRIDE = {"LV7": "red", "LV8": "black", "OP3": "yellow", "OP4": "yellow", "OP5": "yellow"}
for _r in RUNS:
    _r["k"] = KINDS[_r["id"]]
    _r["color"] = COLOR_OVERRIDE.get(_r["id"], COLOR[_r["sys"]])
    if _r["id"] in HEADER:
        _r["hdr"] = HEADER[_r["id"]]
