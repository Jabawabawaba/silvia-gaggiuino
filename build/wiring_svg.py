"""Generate the Silvia harness diagram as inline SVG (classes styled by the page CSS)."""
from runs import RUNS

W, H = 1240, 860

# Wire paths (absolute, orthogonal). Coordinates worked out by hand; see notes in build log.
PATHS = {
    # line
    "AC1": "M656,790 V115 H678",
    "AC3": "M678,75 H644 V262 H344 V452 H298 V424",
    "AC4": "M282,424 V460 H336 V774 H930",
    "AC13": "M440,640 V698 H920 V730 H930",
    "AC14": "M580,560 V540 H620 V714 H912 V752 H930",
    # heater
    "AC5": "M190,424 V494 H127 V564",
    "AC6": "M91,564 H48 V700 H120",
    "AC7": "M575,75 H604 V250 H99 V564",
    # neutral
    "AC2": "M786,790 V115 H762",
    "AC8": "M762,71 H806 V24 H512 V111 H545",
    "AC9": "M762,79 H798 V730 H276 V700 H260",
    "AC10": "M545,119 H532 V560",
    "AC11": "M516,560 V548 H476 V676 H404 V640",
    "AC12": "M396,640 V744 H904 V796 H930",
    # earth
    "G1": "M720,790 V760 H316 V614 H306",
    "G2": "M420,560 V532 H352 V606 H306",
    # switch signals and ground chain
    "LV3": "M58,75 H28 V204 H884 V348 H930",
    "LV2": "M218,75 H188 V192 H892 V298 H930",
    "LV1": "M378,75 H348 V180 H900 V280 H930",
    "LV4": "M378,115 H358 V168 H908 V262 H930",
    "LV5": "M408,111 H416 V158 H264 V111 H248",
    "LV6": "M248,119 H256 V150 H104 V115 H88",
    # SSR control
    "LV7": "M190,316 V296 H868 V416 H930",
    "LV8": "M290,316 V280 H876 V398 H930",
    # sensors
    "LV9": ["M830,560 V466 H930", "M845,560 V484 H930", "M860,560 V502 H930"],
    "LV10": ["M210,584 V512 H912 V534 H930", "M220,584 V520 H904 V552 H930"],
    "LV11": ["M1010,232 V172", "M1030,232 V172", "M1050,232 V172", "M1070,232 V172"],
}

TAGS = {
    "AC1": (656, 400), "AC2": (786, 759), "AC3": (344, 380), "AC4": (336, 680), "AC5": (158, 494),
    "AC6": (48, 630), "AC7": (240, 250), "AC8": (660, 24), "AC9": (366, 730), "AC10": (532, 420),
    "AC11": (476, 612), "AC12": (396, 690), "AC13": (850, 698), "AC14": (700, 714),
    "G1": (500, 760), "G2": (386, 532),
    "LV1": (480, 180), "LV2": (570, 192), "LV3": (720, 204), "LV4": (420, 168),
    "LV5": (300, 158), "LV6": (150, 150), "LV7": (590, 296), "LV8": (440, 280),
    "LV9": (893, 484), "LV10": (720, 516), "LV11": (1040, 202),
}

SYS_CLASS = {r["id"]: r["sys"] for r in RUNS}

# parts you can tap, with the box that picks them; the runs that land on each come from their ends' wording
PARTS = [
    ("hw", "Hot water switch", (45, 28, 155, 142)), ("brew", "Brew switch", (205, 28, 315, 142)),
    ("steam", "Steam switch", (365, 28, 475, 142)), ("lamp", "Heating lamp", (533, 28, 587, 142)),
    ("pwr", "Power switch", (665, 28, 775, 142)), ("ssr", "Solid-state relay (SSR)", (160, 300, 320, 440)),
    ("boiler", "Boiler: element, safety thermostat, thermocouple and ground", (78, 548, 302, 822)),
    ("sol", "3-way solenoid valve", (380, 560, 460, 640)), ("pump", "Pump and its thermal fuse", (500, 560, 600, 650)),
    ("inlet", "Power inlet", (630, 790, 812, 840)), ("psens", "Pressure sensor and tee", (818, 560, 872, 650)),
    ("screen", "4.3 in screen", (980, 60, 1180, 172)), ("pcb", "Gaggiuino PCB", (930, 232, 1200, 828)),
]
PART_WORDS = [("Power inlet", "inlet"), ("Power switch", "pwr"), ("SSR", "ssr"), ("Safety thermostat", "boiler"),
              ("Boiler", "boiler"), ("Thermocouple", "boiler"), ("Heating lamp", "lamp"), ("Pump", "pump"),
              ("Solenoid", "sol"), ("PCB", "pcb"), ("Steam switch", "steam"), ("Brew switch", "brew"),
              ("Hot water switch", "hw"), ("Pressure", "psens"), ("4.3 in", "screen")]


def part_of(end):
    for w, pid in PART_WORDS:
        if end.startswith(w):
            return pid
    return ""


ENDS = {r["id"]: [part_of(r["frm"]), part_of(r["to"])] for r in RUNS}


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def text(x, y, s, cls="t", anchor="middle", extra=""):
    return f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}"{extra}>{esc(s)}</text>'


def spade(x, y, w=30, h=10, cls="sp"):
    return f'<rect x="{x - w / 2}" y="{y - h / 2}" width="{w}" height="{h}" rx="1.5" class="{cls}"/>'


def switch(cx, name, lamp=False):
    out = []
    if lamp:
        out.append(f'<rect x="{cx - 25}" y="50" width="50" height="90" rx="6" class="box"/>')
        out.append(spade(cx, 75))
        out.append(spade(cx, 115))
        out.append(text(cx, 40, name, "nm"))
        out.append(text(cx + 22, 62, "L", "tiny", "end"))
        out.append(text(cx + 22, 134, "N", "tiny", "end"))
        return "".join(out)
    out.append(f'<rect x="{cx - 55}" y="50" width="110" height="90" rx="6" class="box"/>')
    a, b = cx - 27, cx + 27
    out.append(spade(a, 75))
    out.append(spade(a, 115))
    out.append(spade(b, 75, cls="sp sp-idle"))
    out.append(spade(b, 115, cls="sp sp-idle"))
    out.append(text(cx, 40, name, "nm"))
    return "".join(out)


def build():
    o = [f'<svg viewBox="0 0 {W} {H}" class="dia" role="img" aria-labelledby="dia-title dia-desc" xmlns="http://www.w3.org/2000/svg">']
    o.append('<title id="dia-title">Silvia Gaggiuino harness, run by run</title>')
    o.append('<desc id="dia-desc">Schematic redrawn from realNiche\'s Silvia diagram for PCB v4. Mains comes in at the inlet and through the double-pole power switch. Switched line feeds SSR terminal 1 and PCB J11. SSR terminal 2 feeds the 165 C safety thermostat, then the boiler element and the heating lamp. Neutral daisy-chains from the power switch to the lamp, pump, solenoid and PCB J10, with a separate run to the element. The PCB switches the pump (J12) and solenoid (J13). Earth runs from the inlet and the solenoid to the boiler ground spade. Low-voltage runs connect the brew, steam and hot water switches, SSR control, pressure sensor, thermocouple and screen to the PCB.</desc>')

    # ----- components (under wires) -----
    o.append('<g class="parts">')
    o.append(text(45, 18, "Switches viewed from the back · top row = center spades, bottom row = outer spades · order drawn for clarity", "cap", "start"))
    o.append(switch(100, "Hot water"))
    o.append(switch(260, "Brew"))
    o.append(switch(420, "Steam"))
    o.append(switch(560, "Heating lamp", lamp=True))
    o.append(switch(720, "Power"))
    o.append(text(693, 64, "L pole", "tiny"))
    o.append(text(747, 64, "N pole", "tiny"))
    for cx in (100, 260, 420):
        o.append(text(cx - 27, 64, "gnd pole", "tiny"))
        o.append(text(cx + 27, 64, "LED pole", "tiny idle"))

    # SSR
    o.append('<rect x="160" y="300" width="160" height="140" rx="6" class="box"/>')
    o.append('<line x1="160" y1="338" x2="320" y2="338" class="div"/><line x1="160" y1="402" x2="320" y2="402" class="div"/>')
    for (x, y) in ((190, 316), (290, 316), (190, 424), (290, 424)):
        o.append(f'<circle cx="{x}" cy="{y}" r="8" class="term"/>')
    o.append(text(190, 354, "+ control", "tiny"))
    o.append(text(290, 354, "− control", "tiny"))
    o.append(text(240, 376, "SSR-40DA", "nm"))
    o.append(text(240, 392, "view: top", "tiny"))
    o.append(text(190, 398, "load 2", "tiny"))
    o.append(text(290, 398, "load 1", "tiny"))

    # Boiler
    o.append('<circle cx="190" cy="660" r="112" class="box"/>')
    o.append('<circle cx="190" cy="660" r="98" class="inner"/>')
    o.append('<path d="M144,700 l8,-10 l10,20 l10,-20 l10,20 l10,-20 l10,20 l10,-20 l10,20 l6,-10" class="elem"/>')
    o.append(spade(132, 700, 24, 9))
    o.append(spade(248, 700, 24, 9))
    o.append(text(190, 730, "element", "tiny"))
    o.append('<rect x="81" y="564" width="60" height="22" rx="4" class="box"/>')
    o.append(f'<circle cx="95" cy="564" r="4" class="term"/><circle cx="127" cy="564" r="4" class="term"/>')
    o.append(text(111, 579, "165 °C", "tiny"))
    o.append(text(118, 606, "safety thermostat", "tiny"))
    o.append('<polygon points="208,584 222,584 227,592 222,600 208,600 203,592" class="term"/>')
    o.append(text(226, 620, "thermocouple", "tiny"))
    o.append(text(226, 632, "(brew tstat spot)", "tiny"))
    o.append(spade(297, 610, 18, 9))
    o.append(text(300, 596, "ground", "tiny"))
    o.append(text(190, 800, "Boiler", "nm"))
    o.append(text(190, 815, "view: top", "tiny"))

    # Solenoid
    o.append('<rect x="380" y="560" width="80" height="80" rx="6" class="box"/>')
    o.append(spade(420, 560, 18, 8))
    o.append(spade(400, 640, 8, 16))
    o.append(spade(440, 640, 8, 16))
    o.append(text(420, 594, "Solenoid", "nm"))
    o.append(text(420, 608, "3-way valve", "tiny"))
    o.append(text(420, 576, "gnd", "tiny"))
    o.append(text(400, 628, "N", "tiny"))
    o.append(text(440, 628, "coil", "tiny"))

    # Pump
    o.append('<rect x="500" y="560" width="100" height="90" rx="6" class="box"/>')
    o.append(spade(524, 560, 30, 8))
    o.append(spade(580, 560, 16, 8))
    o.append('<rect x="512" y="572" width="24" height="12" rx="2" class="fuse"/>')
    o.append(text(524, 597, "fuse 110 °C", "tiny"))
    o.append(text(580, 580, "coil", "tiny"))
    o.append(text(550, 622, "Pump", "nm"))
    o.append(text(550, 636, "Ulka EP5", "tiny"))

    # Inlet
    o.append('<rect x="630" y="790" width="182" height="50" rx="6" class="box"/>')
    for x, lab in ((656, "L"), (720, "E"), (786, "N")):
        o.append(spade(x, 790, 10, 14))
        o.append(text(x, 812, lab, "nm"))
    o.append(text(721, 832, "Power inlet · IEC C14", "tiny"))

    # Pressure transducer
    o.append('<rect x="818" y="560" width="54" height="46" rx="5" class="box"/>')
    o.append('<rect x="830" y="606" width="30" height="24" rx="2" class="box"/>')
    o.append(text(845, 588, "P sensor", "tiny"))
    o.append(text(845, 646, "pressure tee", "tiny"))

    # Screen
    o.append('<rect x="980" y="60" width="200" height="112" rx="10" class="box"/>')
    o.append(text(1080, 104, "4.3 in screen", "nm"))
    o.append(text(1080, 120, "Gen 3.5 · view: back", "tiny"))

    # PCB
    o.append('<rect x="930" y="232" width="270" height="596" rx="8" class="pcb"/>')
    o.append(text(1188, 694, "Gaggiuino PCB v4", "nm", "end"))
    o.append(text(1188, 708, "view: top", "tiny", "end"))
    pins = [
        ("J7", "Switches", [("GND", 262), ("S", 280), ("B", 298)]),
        ("J5", "Extra IO", [("GND", 330), ("B15", 348), ("A12", 366)]),
        ("J9", "SSR", [("GND", 398), ("R1", 416), ("R2", 434)]),
        ("J6", "Pressure", [("5V", 466), ("GND", 484), ("P", 502)]),
        ("J4", "Thermocouple", [("−", 534), ("+", 552)]),
        ("J8", "Scales (optional)", [("D2", 590), ("5V", 608), ("GND", 626), ("CLK", 644), ("D1", 662)]),
        ("J13", "Solenoid", [("3", 730)]),
        ("J12", "Pump", [("P", 752)]),
        ("J11", "AC Line", [("L", 774)]),
        ("J10", "AC Neutral", [("N", 796)]),
    ]
    for j, name, plist in pins:
        ys = [p[1] for p in plist]
        mid = (min(ys) + max(ys)) / 2
        ac = j in ("J10", "J11", "J12", "J13")
        if not ac:
            o.append(f'<rect x="934" y="{min(ys) - 9}" width="50" height="{max(ys) - min(ys) + 18}" rx="3" class="hdr"/>')
        for lab, y in plist:
            if ac:
                o.append(spade(944, y, 26, 9))
            else:
                o.append(f'<circle cx="930" cy="{y}" r="3.5" class="pin"/>')
                o.append(text(942, y + 3.5, lab, "pinl", "start"))
        o.append(text(996, mid + 4, j, "jn", "start"))
        o.append(text(1030, mid + 4, name, "t", "start"))
    o.append('<rect x="1100" y="586" width="80" height="26" rx="3" class="hdr hdr-opt"/>')
    o.append(text(1140, 603, "J2 ToF · back", "tiny"))
    for i, (lab, x) in enumerate((("GND", 1010), ("TX", 1030), ("RX", 1050), ("5V", 1070))):
        o.append(f'<circle cx="{x}" cy="232" r="3.5" class="pin"/>')
        o.append(text(x, 250, lab, "pinl"))
    o.append(text(1090, 250, "J1", "jn", "start"))
    o.append('</g>')

    # ----- tap targets for parts, under the wires -----
    o.append('<g class="phits">')
    for pid, name, (x0, y0, x1, y1) in PARTS:
        o.append(f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" rx="8" class="phit" data-part="{pid}"><title>{esc(name)}</title></rect>')
    o.append('</g>')

    # ----- wires -----
    o.append('<g class="wires">')
    order = ["LV11", "LV9", "LV10", "LV7", "LV8", "LV1", "LV2", "LV3", "LV4", "LV5", "LV6",
             "G1", "G2", "AC2", "AC8", "AC9", "AC10", "AC11", "AC12", "AC5", "AC6", "AC7",
             "AC1", "AC3", "AC4", "AC13", "AC14"]
    for rid in order:
        ds = PATHS[rid]
        if isinstance(ds, str):
            ds = [ds]
        sysc = SYS_CLASS[rid]
        a, b = ENDS[rid]
        o.append(f'<g class="run s-{sysc}" data-run="{rid}" data-a="{a}" data-b="{b}" tabindex="-1">')
        for k in ("halo", "wire", "flow", "hit"):
            for d in ds:
                o.append(f'<path d="{d}" class="{k}"/>')
        o.append('</g>')
    o.append('</g>')

    # ----- tags -----
    o.append('<g class="tags">')
    for rid, (x, y) in TAGS.items():
        w = 8 + 7 * len(rid)
        sysc = SYS_CLASS[rid]
        o.append(f'<g class="tag s-{sysc}" data-run="{rid}"><rect x="{x - w / 2}" y="{y - 8}" width="{w}" height="16" rx="4"/>'
                 f'<text x="{x}" y="{y + 3.6}" text-anchor="middle">{rid}</text></g>')
    o.append('</g>')
    o.append('</svg>')
    return "".join(o)


if __name__ == "__main__":
    print(build())
