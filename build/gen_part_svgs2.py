"""Drawings for the second set of part guides: the screen housing, the ToFnLED, firmware updates and the hardware
scales. Same conventions as gen_part_svgs.py: every moving piece carries data-k, pieces that only belong to one
variant carry data-v, and part-guides-data.js moves them step by step. The drawings are diagrams, not to scale;
each step links to the official photo.

Shared by both sites (keep the copies identical): python3 gen_part_svgs2.py [gaggia|silvia]. The Silvia version
redraws the tank (deeper, under a lid), the scales mount and the screen's mount panel.
"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = (sys.argv[1] if len(sys.argv) > 1 else "gaggia").lower()
SILVIA = SITE == "silvia"


def g(key, inner, cls=None, extra=""):
    c = f' class="{cls}"' if cls else ""
    return f'<g data-k="{key}"{c}{extra}>{inner}</g>'


def txt(x, y, s, cls="cap", anchor=None, extra=""):
    a = f' text-anchor="{anchor}"' if anchor else ""
    extra = re.sub(r' fill="([^"]+)"', r' style="fill:\1"', extra)  # beat the class's fill
    return f'<text class="{cls}" x="{x}" y="{y}"{a}{extra}>{s}</text>'


# ---------------------------------------------------------------- screen housing
def housing_front(x, y, w=150, h=90):
    """the assembled housing seen from the front"""
    return (f'<rect class="pla" x="{x}" y="{y}" width="{w}" height="{h}" rx="10"/>'
            f'<rect class="glass" x="{x + 10}" y="{y + 9}" width="{w - 20}" height="{h - 18}" rx="3"/>'
            f'<path class="uiln" d="M{x + 18},{y + h - 22} C{x + 44},{y + h - 24} {x + 54},{y + 30} {x + 80},{y + 28} S{x + 116},{y + 40} {x + w - 20},{y + 36}"/>')


def screen():
    s = ['<svg id="pg-scr" viewBox="0 0 480 330" role="img" aria-labelledby="pg-scr-t"><title id="pg-scr-t">The screen housing, drawn step by step: '
         'on the left the housing and its mount from the front, on the right the machine from the side with the mount on the front, '
         'on the funnel or at the back, and the screen cable running in to the PCB.</title>']
    # ---- left panel: the housing, exploded, front view
    s.append(txt(18, 18, "the housing, from the front"))
    # back shell, with the cable gap at the bottom
    s.append(g("hb", '<rect class="pla" x="40" y="40" width="160" height="96" rx="11"/><rect class="pla2" x="48" y="48" width="144" height="80" rx="6"/>'
                     '<rect class="hole" x="150" y="128" width="26" height="8" rx="2"/>'
                     '<circle class="post" cx="70" cy="52" r="4"/><circle class="post" cx="170" cy="52" r="4"/>'))
    s.append(g("hbl", txt(40, 152, "back shell")))
    s.append(g("gap", '<circle class="magring" cx="163" cy="132" r="14"/>' + txt(184, 156, "gap", "lbl")))
    # the screen: its board, glass side up, the connector on its back
    s.append(g("scr", '<rect class="pcb" x="50" y="50" width="140" height="76" rx="3"/><rect class="glass" x="58" y="56" width="124" height="62" rx="2"/>'
                      '<rect class="conn" x="152" y="112" width="20" height="10" rx="1"/>' + txt(64, 70, "screen", "tiny", None, ' fill="#DDE6EE"')))
    # the cable: from the screen connector out through the gap, down off the panel
    s.append('<path data-k="scab" class="cable draw" pathLength="1" d="M162,120 V160 C162,190 214,196 214,226 V330"/>')
    # front cover with its window; top edge has the thinner bezel
    s.append(g("hf", '<rect class="pla" x="36" y="36" width="168" height="104" rx="12"/><rect class="glass" x="46" y="44" width="148" height="84" rx="3"/>'
                     '<path class="uiln" d="M54,116 C80,114 90,70 116,68 S152,80 186,76"/>'
                     '<rect class="nail" x="70" y="136" width="18" height="4" rx="2"/><rect class="nail" x="152" y="136" width="18" height="4" rx="2"/>'))
    s.append(g("topf", '<path class="turnhd" d="M40,32 H200"/>' + txt(120, 26, "top edge first", anchor="middle")))
    # variant mount pieces, below the housing
    s.append(('<g data-v="front">' if not SILVIA else '<g>') +
             g("mtF", '<rect class="pla" x="54" y="184" width="132" height="44" rx="8"/>'
                      '<rect class="pocket" x="62" y="198" width="32" height="16" rx="2"/><rect class="pocket" x="104" y="198" width="32" height="16" rx="2"/><rect class="pocket" x="146" y="198" width="32" height="16" rx="2"/>'
                      '<rect class="clip" x="110" y="178" width="20" height="8" rx="2"/>'
                      + g("mgs", '<rect class="magnet" x="64" y="200" width="13" height="12" rx="1"/><rect class="magnet" x="79" y="200" width="13" height="12" rx="1"/>'
                                 '<rect class="magnet" x="106" y="200" width="13" height="12" rx="1"/><rect class="magnet" x="121" y="200" width="13" height="12" rx="1"/>'
                                 '<rect class="magnet" x="148" y="200" width="13" height="12" rx="1"/><rect class="magnet" x="163" y="200" width="13" height="12" rx="1"/>')
                      + g("glue", '<circle class="drop" cx="78" cy="192" r="2.5"/><circle class="drop" cx="120" cy="192" r="2.5"/><circle class="drop" cx="162" cy="192" r="2.5"/>')
                      + txt(120, 244, "mount" if SILVIA else "front mount", anchor="middle")) +
             '</g>')
    if not SILVIA:
      s.append('<g data-v="funnel">' +
               g("fcov", '<rect class="pla" x="20" y="236" width="128" height="52" rx="8"/>' + txt(84, 304, "funnel cover", anchor="middle")) +
               g("lid", '<rect class="pla2" x="28" y="244" width="112" height="18" rx="4"/>' + txt(84, 257, "sliding lid", "tiny", "middle", ' fill="#E7E9EB"')) +
               g("pry", '<path class="blade" d="M148,252 L184,248 L185,254 L149,258 Z"/>') +
               g("hsi", '<rect class="brass" x="102" y="268" width="16" height="12" rx="2"/>' + '<path d="M121,274 H158" style="stroke:var(--muted);stroke-width:1;fill:none"/>' + txt(162, 278, "insert", "cap")) +
               g("iron", '<path class="gun" d="M110,268 L110,244 L104,234 H116 L110,244"/><path class="gun" d="M107,234 V196 H113 V234"/>') +
               g("lat", '<rect class="latch" x="34" y="268" width="34" height="12" rx="3"/>' + txt(38, 278, "latch", "tiny", None, ' fill="#3B2F07"')) +
               '</g>')
      for v in ("funnel", "rear"):
          s.append(f'<g data-v="{v}">' +
                   g("ap", '<rect class="pla2" x="70" y="166" width="100" height="18" rx="4"/><rect class="clip" x="110" y="162" width="20" height="6" rx="2"/>' + txt(176, 180, "plate", "cap")) +
                   '</g>')
      s.append('<g data-v="funnel">' +
               g("sw", '<rect class="pla" x="104" y="186" width="32" height="26" rx="3"/>'
                       '<circle class="screw" cx="112" cy="199" r="4"/><circle class="screw" cx="128" cy="199" r="4"/>' + txt(142, 206, "swivel", "cap")) +
               '</g>')
      s.append('<g data-v="rear">' +
               g("rm", '<path class="pla" d="M78,212 H162 V246 H150 V276 C150,284 140,284 140,276 V256 H100 V276 C100,284 90,284 90,276 V246 H78 Z"/>'
                       '<circle class="screw" cx="104" cy="226" r="4"/><circle class="screw" cx="136" cy="226" r="4"/>' + txt(120, 300, "rear mount", anchor="middle")) +
               '</g>')
    s.append(g("tape1", '<rect class="kapton" x="96" y="146" width="44" height="10" rx="1"/>' + txt(146, 156, "tape", "cap")))
    # ---- right panel: the machine from the side
    s.append('<path class="divider" d="M244,10 V320"/>')
    s.append(txt(260, 18, "the machine, from the side"))
    mx0, mx1 = 284, 452
    if SILVIA:
        s.append(f'<rect class="wallp" x="{mx0}" y="130" width="{mx1 - mx0}" height="186" rx="4"/>'
                 f'<rect class="alu" x="{mx0}" y="122" width="{mx1 - mx0}" height="10" rx="2"/>'
                 + txt(mx0 + 4, 312, "front", "cap onmetal") + txt(mx1 - 4, 312, "back", "cap onmetal", "end")
                 + txt(368, 144, "cup tray on top", "cap onmetal", "middle"))
    else:
        s.append(f'<rect class="wallp" x="{mx0}" y="140" width="{mx1 - mx0}" height="176" rx="4"/>'
                 + txt(mx0 + 4, 312, "front", "cap onmetal") + txt(mx1 - 4, 312, "back", "cap onmetal", "end"))
        s.append(g("cw", f'<rect class="alu" x="{mx0 + 46}" y="132" width="{mx1 - mx0 - 46}" height="9" rx="2"/>'
                         + txt(390, 128, "cup warmer", "cap", "middle")))
        s.append(g("fn", f'<path class="funnel" d="M{mx0},140 L{mx0 + 6},128 H{mx0 + 46} V141 H{mx0} Z"/>') + g("fnl", txt(mx0 + 4, 122, "funnel", "cap")))
    for i in range(5):
        s.append(f'<rect class="vent" x="{mx1 - 4}" y="{170 + i * 14}" width="6" height="8" rx="1"/>')
    s.append(f'<rect class="pcb" x="372" y="262" width="60" height="30" rx="3"/>' + txt(402, 281, "PCB J1", "tiny", "middle", ' fill="#F2F5F3"'))
    # where each mount puts the housing (side view: a thin slab), and its cable to J1
    s.append(('<g data-v="front">' if not SILVIA else '<g>') +
             g("onF", '<rect class="pla" x="270" y="150" width="12" height="70" rx="3"/><rect class="pla2" x="282" y="166" width="3" height="38"/>'
                      + txt(262, 236, "on its mount" if SILVIA else "on the front", "lbl", "end")) +
             f'<path data-k="rcF" class="cable draw" pathLength="1" d="M276,150 C276,126 300,124 304,140 V200 C304,240 360,250 372,272"/>' +
             g("tapeF", '<rect class="kapton" x="298" y="168" width="12" height="20" rx="1"/>') +
             '</g>')
    if not SILVIA:
      s.append('<g data-v="funnel">' +
             g("onU", '<rect class="pla" x="294" y="58" width="12" height="62" rx="3" transform="rotate(-10 300 120)"/><rect class="pla2" x="292" y="118" width="18" height="10" rx="2"/>'
                      + txt(316, 74, "on the funnel", "lbl")) +
             f'<path data-k="rcU" class="cable draw" pathLength="1" d="M300,124 C300,150 318,150 318,170 V220 C318,250 360,255 372,272"/>' +
             g("ties", '<path class="tie" d="M312,186 h12 M312,206 h12"/>') +
             '</g>')
      s.append('<g data-v="rear">' +
             g("onR", f'<rect class="pla" x="{mx1 - 18}" y="60" width="12" height="62" rx="3"/><path class="pla2" d="M{mx1 - 12},122 V{140} H{mx1 + 4} V176"/>'
                      + txt(mx1 - 24, 74, "at the back", "lbl", "end")) +
             f'<path data-k="rcR" class="cable draw" pathLength="1" d="M{mx1 - 12},122 C{mx1 - 12},150 {mx1 - 2},160 {mx1 - 2},184 C{mx1 - 30},200 440,240 432,272"/>' +
             '</g>')
    if not SILVIA:
        s.append(g("gnd", '<path class="wire-g" d="M330,141 C330,160 344,170 360,170"/><circle class="magring" cx="330" cy="150" r="12"/>'
                          + txt(328, 196, "reconnect the", "lbl onmetal") + txt(328, 210, "earth wires", "lbl onmetal")))
        s.append(g("lift", '<path class="turnhd" d="M398,112 V96 M392,102 L398,96 L404,102"/>' + txt(408, 104, "off", "cap")))
    s.append('</svg>')
    return "".join(s)


# ---------------------------------------------------------------- ToFnLED
def tof():
    deep = SILVIA
    ty0, ty1 = (110, 312) if deep else (124, 300)
    s = [f'<svg id="pg-tof" viewBox="0 0 480 330" role="img" aria-labelledby="pg-tof-t"><title id="pg-tof-t">The ToFnLED over the water tank, drawn in section: '
         f'its housing above the tank, the sensor\'s cone of light down to the water, and its cable down the side to J2 on the back of the PCB.</title>']
    # machine top and the tank
    s.append('<rect class="alu" x="60" y="56" width="300" height="10" rx="2"/>' + txt(60, 50, "the lid over the tank" if deep else "top of the machine", "cap"))
    s.append(f'<rect class="tankw" x="100" y="{ty0}" width="200" height="{ty1 - ty0}" rx="6"/>')
    wl = ty0 + (ty1 - ty0) * 0.38
    s.append(g("wat", f'<rect class="wfill2" x="102" y="{wl:.0f}" width="196" height="{ty1 - wl - 2:.0f}" rx="4"/><path class="waterln" d="M102,{wl:.0f} H298"/>'))
    s.append(txt(110, ty1 - 24, "water tank,", "cap onmetal") + txt(110, ty1 - 12, "about 200 mm deep", "cap onmetal") if deep else txt(200, ty1 - 12, "water tank", "cap onmetal", "middle"))
    # the side sheet metal, with its gap on the right
    s.append('<path class="sheet" d="M360,66 V200 M360,214 V310"/>' + txt(366, 208, "gap", "cap"))
    # glow inside the tank when the LED is on
    s.append(g("glow", f'<rect class="glowc" x="102" y="{ty0 + 2}" width="196" height="{ty1 - ty0 - 4}" rx="4"/>'))
    # cone of light down to the water
    s.append(g("cone", f'<path class="cone" d="M200,96 L156,{wl:.0f} H244 Z"/>'))
    # tubing: intake (and the OPV return) coming down into the tank
    s.append(g("tub", f'<path class="ptfeL" d="M262,40 V{ty1 - 14}"/><path class="ptfeL" d="M282,40 V{ty0 + 36}"/>' + txt(300, 44, "intake and OPV tubes", "cap")))
    s.append(g("tT", f'<path class="ptfeL" d="M272,40 V74"/><rect class="pushT" x="262" y="74" width="20" height="16" rx="3"/>'
                     f'<path class="ptfeL" d="M272,90 V{ty1 - 14}"/><path class="vcut" d="M266,{ty1 - 14} L272,{ty1 - 8} L278,{ty1 - 14}"/>'
                     + txt(290, 104, "T joins them", "lbl") + txt(290, 118, "above the tank", "lbl")))
    # matte tape on the wall below the sensor
    s.append(g("mtape", f'<rect class="matte" x="226" y="{ty0 - 2 if not deep else ty0 + 2}" width="36" height="10" rx="1"/>' + txt(228, ty0 + 24, "matte tape", "cap halo")))
    # the housing over the tank
    s.append(g("tofh", '<rect class="pla" x="176" y="70" width="48" height="26" rx="4"/><rect class="pcb" x="184" y="76" width="32" height="14" rx="2"/>'
                       '<rect class="sens" x="194" y="88" width="12" height="7" rx="1"/>'))
    s.append(g("film", '<rect class="film" x="190" y="94" width="20" height="6" rx="1"/>'))
    s.append(g("filmL", txt(150, 110, "peel the film", "lbl halo", "end")))
    s.append(g("tmag", '<rect class="magnet" x="182" y="66" width="10" height="4" rx="1"/><rect class="magnet" x="208" y="66" width="10" height="4" rx="1"/>'))
    s.append(g("tglue", '<circle class="drop" cx="187" cy="62" r="2.5"/><circle class="drop" cx="213" cy="62" r="2.5"/>' + txt(150, 82, "a drop of glue,", "cap", "end") + txt(150, 96, "magnet flat", "cap", "end")))
    # the Qwiic cable from the board, down the side, to J2 on the back of the PCB
    s.append('<path data-k="qc" class="qwiic draw" pathLength="1" d="M224,80 H340 C356,80 356,92 356,104 V200 C356,212 368,214 368,226 V266 C368,280 380,284 392,284"/>')
    s.append(g("pcbT", '<rect class="pcb" x="380" y="250" width="80" height="56" rx="4"/><rect class="pcbback" x="380" y="250" width="80" height="56" rx="4"/>'
                       '<rect class="term" x="388" y="278" width="14" height="10" rx="1"/>' + txt(420, 272, "PCB, back", "tiny", "middle", ' fill="#F2F5F3"')
                       + txt(408, 300, "J2", "tiny", None, ' fill="#F2F5F3"')))
    # firmware and settings callouts
    s.append(g("fwc", '<rect class="tagb" x="374" y="92" width="96" height="40" rx="4"/>' + txt(422, 108, "core .bin:", "tagt", "middle") + txt(422, 123, "pca or ncp", "tagt", "middle")))
    s.append(g("lvl", '<rect class="pla" x="376" y="140" width="92" height="44" rx="6"/><rect class="glass" x="382" y="146" width="80" height="32" rx="3"/>'
                      '<text class="lcdt2" data-k="lvlt" x="422" y="168" text-anchor="middle">62%</text>' + txt(422, 196, "tank level", "cap", "middle")))
    s.append(g("cpk", '<circle class="hue" cx="60" cy="230" r="22"/><circle class="wallbgc" cx="60" cy="230" r="11"/>' + txt(60, 268, "color and", "cap", "middle") + txt(60, 282, "brightness", "cap", "middle")))
    s.append('</svg>')
    return "".join(s)


# ---------------------------------------------------------------- firmware: over Wi-Fi
def fw_ota():
    s = ['<svg id="pg-fwo" viewBox="0 0 480 330" role="img" aria-labelledby="pg-fwo-t"><title id="pg-fwo-t">Updating Gaggiuino over Wi-Fi, drawn step by step: '
         'three files from the release page, uploaded one at a time from a browser at gaggiuino.local, core first, then the two screen files.</title>']
    # the machine's screen, left
    s.append(g("gs", '<rect class="pla" x="20" y="56" width="168" height="104" rx="10"/><rect class="glass" x="30" y="66" width="148" height="84" rx="3"/>'
                     + txt(104, 182, "the machine's screen", "cap", "middle")))
    s.append(g("about", txt(40, 86, "About", "uit") + txt(40, 106, "Core   build A", "uit") + txt(40, 122, "Mbed   build A", "uit") + txt(40, 138, "Web    build A", "uit")))
    s.append(g("blk", '<rect class="blank" x="30" y="66" width="148" height="84" rx="3"/>' + txt(104, 112, "black while it flashes", "uit", "middle")))
    s.append(g("okv", '<rect class="okc" x="150" y="70" width="24" height="24" rx="12"/><path class="okt" d="M156,82 l5,5 l8,-9"/>'))
    s.append('<g data-loop="wifi" class="wifi"><path d="M196,92 a14,14 0 0 1 0,24"/><path class="w2" d="M204,84 a24,24 0 0 1 0,40"/><path class="w3" d="M212,76 a34,34 0 0 1 0,56"/></g>')
    # Gaggiuino AP
    s.append(g("ap", '<rect class="tagb" x="16" y="196" width="180" height="54" rx="4"/>' + txt(106, 212, "Wi-Fi: Gaggiuino AP", "tagt", "middle")
               + txt(106, 227, "password: the name, with", "tagt", "middle") + txt(106, 242, "0 for o and no space", "tagt", "middle")))
    # the laptop and its browser, right
    s.append('<rect class="lapb" x="244" y="40" width="216" height="150" rx="8"/><rect class="scrn" x="252" y="48" width="200" height="134" rx="3"/>'
             '<path class="lapk" d="M232,190 H472 L462,204 H242 Z"/>')
    s.append(g("url", '<rect class="urlb" x="258" y="54" width="188" height="16" rx="3"/>' + txt(264, 66, "gaggiuino.local", "uit2")))
    s.append(g("otap", txt(262, 88, "SETTINGS › OTA Update", "uit2b") +
               '<circle class="radio" cx="268" cy="104" r="4"/>' + txt(278, 108, "Core Upgrade Package", "uit2") +
               '<circle class="radio" cx="268" cy="120" r="4"/>' + txt(278, 124, "LCD Upgrade Package", "uit2")))
    s.append(g("selC", '<circle class="radioon" cx="268" cy="104" r="2.6"/>'))
    s.append(g("selL", '<circle class="radioon" cx="268" cy="120" r="2.6"/>'))
    s.append(g("btns", '<rect class="btnu" x="262" y="134" width="70" height="16" rx="3"/>' + txt(297, 145, "SELECT FILE", "uit3", "middle")
               + '<rect class="btnu" x="340" y="134" width="56" height="16" rx="3"/>' + txt(368, 145, "UPLOAD", "uit3", "middle")))
    s.append('<rect class="barbg" x="262" y="160" width="180" height="8" rx="4"/>')
    s.append('<rect data-k="bar" class="barf" x="262" y="160" width="180" height="8" rx="4" data-origin="left center"/>')
    s.append(g("done", txt(262, 178, "Upgrade successful › START OVER", "uit2")))
    # the three files from the release
    s.append(g("rel", '<rect class="relb" x="244" y="226" width="216" height="94" rx="6"/>' + txt(252, 242, "Releases (latest), on GitHub", "lbl")))
    for i, (k, l1) in enumerate((("f1", "1  core .bin for PCB v4"), ("f2", "2  ui-embedded.bin"), ("f3", "3  ui-web.bin"))):
        y = 252 + i * 22
        s.append(g(k, f'<rect class="file" x="252" y="{y}" width="200" height="18" rx="3"/>' + txt(258, y + 13, l1, "uit2")))
    s.append('</svg>')
    return "".join(s)


# ---------------------------------------------------------------- firmware: wired
def fw_wired():
    s = ['<svg id="pg-fww" viewBox="0 0 480 330" role="img" aria-labelledby="pg-fww-t"><title id="pg-fww-t">Flashing the core by wire, drawn step by step: '
         'the machine unplugged, a WeAct Mini Debugger or ST-Link wired to J27 on the PCB, STM32CubeProgrammer connecting and programming.</title>']
    # computer with STM32CubeProgrammer
    s.append('<rect class="lapb" x="16" y="20" width="208" height="140" rx="8"/><rect class="scrn" x="24" y="28" width="192" height="124" rx="3"/>'
             '<path class="lapk" d="M4,160 H236 L226,174 H14 Z"/>')
    s.append(g("cube", txt(32, 44, "STM32CubeProgrammer", "uit2b") + txt(32, 62, "Erasing & programming", "uit2")
               + '<rect class="urlb" x="32" y="70" width="176" height="14" rx="2"/>' + txt(36, 81, "File path: core .bin", "uit2")
               + '<rect class="chk" x="32" y="92" width="9" height="9" rx="1"/>' + txt(46, 100, "Verify programming", "uit2")
               + '<rect class="chk" x="32" y="108" width="9" height="9" rx="1"/>' + txt(46, 116, "Skip flash erase", "uit2")))
    s.append(g("tick", '<path class="tickp" d="M33,96 l3,3 l5,-6"/>'))
    s.append(g("bconn", '<rect class="btnu" x="32" y="126" width="62" height="16" rx="3"/>' + txt(63, 137, "Connect", "uit3", "middle")))
    s.append(g("bprog", '<rect class="btnu" x="102" y="126" width="104" height="16" rx="3"/>' + txt(154, 137, "Start Programming", "uit3", "middle")))
    s.append(g("okp", '<rect class="okc" x="184" y="34" width="24" height="24" rx="12"/><path class="okt" d="M190,46 l5,5 l8,-9"/>'))
    # the debugger
    s.append(g("dbg", '<rect class="dbgb" x="96" y="210" width="70" height="34" rx="4"/>' + txt(131, 231, "debugger", "tiny", "middle", ' fill="#E7E9EB"')
               + '<rect class="usbp" x="70" y="220" width="26" height="14" rx="2"/>' + txt(131, 262, "Mini Debugger or ST-Link", "cap", "middle")))
    s.append('<path data-k="usb" class="cable draw" pathLength="1" d="M70,227 H50 C30,227 30,200 30,190 V174"/>')
    # the PCB with J27 and its USB-C
    s.append('<rect class="pcb" x="260" y="150" width="200" height="150" rx="6"/>' + txt(270, 168, "PCB", "lbl", None, ' fill="#F2F5F3"'))
    s.append('<rect class="hdr" x="300" y="196" width="72" height="18" rx="2"/>')
    pins = ("3V3", "SWDIO", "SWCLK", "GND")
    for i, p in enumerate(pins):
        x = 309 + i * 18
        s.append(f'<rect class="pinc" x="{x - 3}" y="200" width="6" height="10"/><text class="tiny" x="{x}" y="226" text-anchor="middle" style="fill:#F2F5F3" transform="rotate(-60 {x} 226)">{p}</text>')
    s.append(txt(336, 190, "J27", "tiny", "middle", ' fill="#F2F5F3"'))
    cols = ("w3v", "wio", "wck", "wgd")
    for i, c in enumerate(cols):
        x = 309 + i * 18
        s.append(f'<path data-k="{c}" class="dupont {c} draw" pathLength="1" d="M166,{216 + i * 6} C220,{216 + i * 6} {x},{270} {x},{214}"/>')
    s.append('<rect class="usbc" x="268" y="270" width="34" height="14" rx="6"/>' + txt(285, 296, "USB-C", "tiny", "middle", ' fill="#F2F5F3"'))
    s.append(g("nousb", '<path class="nono" d="M262,264 l46,26 M308,264 l-46,26"/>' + txt(262, 318, "PCB USB-C: not plugged in", "lbl")))
    # mains plug, out
    s.append(g("plug", '<rect class="plugb" x="300" y="40" width="60" height="40" rx="6"/><path class="cable" d="M360,60 H440"/>'
               '<rect class="steelc" x="290" y="50" width="12" height="6"/><rect class="steelc" x="290" y="64" width="12" height="6"/>'
               + txt(330, 98, "machine unplugged", "lbl", "middle")))
    s.append(g("plx", '<path class="nono" d="M286,36 l84,52 M370,36 l-84,52"/>'))
    s.append('</svg>')
    return "".join(s)


# ---------------------------------------------------------------- hardware scales
def scales():
    s = ['<svg id="pg-scl" viewBox="0 0 480 336" role="img" aria-labelledby="pg-scl-t"><title id="pg-scl-t">Hardware scales, drawn from above step by step: '
         'a load cell in each side housing, a load plate on each, the HX711 boards in the center housing wired to them, magnets, the drip tray on top '
         'and the cable to J8 on the PCB.</title>']
    s.append('<rect class="wallp" x="20" y="40" width="440" height="270" rx="8"/>' + txt(22, 328, ("the drip tray area, from above" if not SILVIA else "under the drip tray, from above"), "cap"))
    s.append(txt(240, 32, "machine front", "cap", "middle"))
    # side housings and center housing
    for side, x in (("L", 50), ("R", 350)):
        s.append(g("h" + side, f'<rect class="pla" x="{x}" y="64" width="80" height="210" rx="8"/>'))
        s.append(g("lc" + side, f'<rect class="alu" x="{x + 26}" y="84" width="28" height="160" rx="3"/>'
                                f'<rect class="hole" x="{x + 33}" y="150" width="14" height="30" rx="7"/>'
                                f'<path class="lcw{side}" d="M{x + 40},244 V262"/>'))
        s.append(g("adh" + side, f'<circle class="mark" cx="{x + 40}" cy="98" r="8"/><circle class="mark" cx="{x + 40}" cy="228" r="8"/>'))
        s.append(g("sc" + side, f'<circle class="screw" cx="{x + 40}" cy="98" r="4.5"/><circle class="screw" cx="{x + 40}" cy="114" r="4.5"/>'
                                f'<circle class="screw" cx="{x + 40}" cy="214" r="4.5"/><circle class="screw" cx="{x + 40}" cy="228" r="4.5"/>'))
        s.append(g("lp" + side, f'<rect class="pla2" x="{x + 10}" y="76" width="60" height="64" rx="6"/>'
                                f'<circle class="screwm" cx="{x + 40}" cy="96" r="4.5"/><circle class="screw" cx="{x + 40}" cy="118" r="4.5"/>'))
        s.append(g("mg" + side, f'<circle class="magnet" cx="{x + 22}" cy="86" r="4"/><circle class="magnet" cx="{x + 58}" cy="86" r="4"/>'
                                f'<circle class="magnet" cx="{x + 22}" cy="260" r="4"/><circle class="magnet" cx="{x + 58}" cy="260" r="4"/>'))
    if SILVIA:
        s.append(txt(90, 58, "load cell mount", "cap onmetal", "middle") + txt(390, 58, "load cell mount", "cap onmetal", "middle"))
    else:
        s.append(txt(90, 58, "left housing", "cap onmetal", "middle") + txt(390, 58, "right housing", "cap onmetal", "middle"))
    s.append(g("ctr", '<rect class="pla" x="170" y="196" width="140" height="86" rx="8"/>' + (txt(228, 176, "board enclosure", "cap onmetal", "middle") + txt(228, 189, "(inside the machine)", "cap onmetal", "middle") if SILVIA else txt(234, 190, "center housing", "cap onmetal", "middle"))))
    s.append(g("hx", '<rect class="hxb" x="180" y="214" width="54" height="40" rx="3"/><rect class="hxb" x="246" y="214" width="54" height="40" rx="3"/>'
                     + txt(207, 238, "HX711", "tiny", "middle", ' fill="#F2F5F3"') + txt(273, 238, "HX711", "tiny", "middle", ' fill="#F2F5F3"')))
    s.append(g("strip", '<rect class="stripb" x="214" y="258" width="52" height="18" rx="2"/>'
                        '<path class="pinrow" d="M222,276 v6 M230,276 v6 M238,276 v6 M246,276 v6 M254,276 v6"/>'))
    s.append(g("res", '<rect class="resb" x="198" y="262" width="12" height="6" rx="2"/>' + txt(204, 278, "1 kΩ", "tiny", "middle", ' fill="#E7E9EB"')))
    s.append('<path data-k="wL" class="lvw draw" pathLength="1" d="M90,262 C90,280 130,286 170,250 H184"/>')
    s.append('<path data-k="wR" class="lvw draw" pathLength="1" d="M390,262 C390,280 350,286 310,250 H296"/>')
    s.append(g("cut", '<path class="cutln" d="M80,270 H100 M380,270 H400"/>' + txt(36, 286, "cut, keep", "lbl onmetal") + txt(36, 300, "the offcuts", "lbl onmetal")))
    s.append(g("cov", '<rect class="cover" x="170" y="196" width="140" height="86" rx="8"/><circle class="screw" cx="184" cy="208" r="4"/><circle class="screw" cx="296" cy="208" r="4"/>'))
    s.append('<path data-k="j8" class="cable draw" pathLength="1" d="M304,196 V168 C304,128 330,112 350,102 C372,92 392,70 470,48"/>')
    s.append(g("j8l", txt(472, 14, "to J8 on the PCB:", "lbl", "end") + txt(472, 28, "D2, 5V, GND, CLK, D1", "lbl", "end")))
    # drip tray
    s.append(g("tray", '<rect class="trayb" x="40" y="70" width="400" height="200" rx="14"/>' + txt(230, 140, "drip tray", "lbl", "middle")))
    s.append(g("clr", '<path class="dimln acc" d="M40,64 V76 M40,70 H54"/>' + txt(60, 74, "≥ 0.5 mm clear", "lbl halo")))
    # calibration
    s.append(g("cal", '<rect class="pla2" x="62" y="120" width="56" height="56" rx="6"/><rect class="tamper" x="70" y="104" width="40" height="40" rx="18"/>'
                      + txt(90, 196, "200 to 400 g", "lbl halo", "middle")))
    s.append(g("rd", '<rect class="pla" x="150" y="96" width="180" height="62" rx="8"/><rect class="glass" x="158" y="104" width="164" height="46" rx="3"/>'
                     '<text class="lcdt2" data-k="rdt" x="240" y="134" text-anchor="middle">0 g</text>'))
    s.append('</svg>')
    return "".join(s)


def main():
    out = {"part-scr.svg.html": screen(), "part-tof.svg.html": tof(), "part-fwo.svg.html": fw_ota(), "part-fww.svg.html": fw_wired(), "part-scl.svg.html": scales()}
    for name, body in out.items():
        open(os.path.join(HERE, name), "w").write(body + "\n")
        print(name, len(body), "bytes")


if __name__ == "__main__":
    main()
