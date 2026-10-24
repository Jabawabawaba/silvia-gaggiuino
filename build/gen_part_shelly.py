"""Drawing for the Shelly smart relay part guide (an unofficial add-on): python3 gen_part_shelly.py [gaggia|silvia]
writes part-shl.svg.html. Same conventions as gen_part_svgs.py: every moving piece carries data-k and
part-guides-data.js moves them step by step. A diagram, not to scale. The same file builds both sites' drawings.

Gaggia: the socket moves into an enclosure outside the back panel, with the Shelly beside it; the wires into the
machine pass through the old socket hole. Silvia: the inlet stays in the back panel, and the Shelly sits in its own
enclosure beside it, its four wires through a grommet. Both views look down on the back of the machine, so the
panel is the band across the middle: outside below it, inside above it.
"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = (sys.argv[1] if len(sys.argv) > 1 else "gaggia").lower()


def g(key, inner, cls=None, extra=""):
    c = f' class="{cls}"' if cls else ""
    return f'<g data-k="{key}"{c}{extra}>{inner}</g>'


def txt(x, y, s, cls="cap", anchor=None):
    a = f' text-anchor="{anchor}"' if anchor else ""
    return f'<text class="{cls}" x="{x}" y="{y}"{a}>{s}</text>'


def wire(key, d, cls, label=None, lx=0, ly=0, anchor=None):
    """a wire that draws itself in: a halo under it so crossings read as one passing over the other"""
    s = (f'<g data-k="{key}" class="draw"><path class="shhalo" pathLength="1" d="{d}"/>'
         f'<path class="shw {cls}" pathLength="1" d="{d}"/></g>')
    if label:
        s += g(key + "t", txt(lx, ly, label, "lbl halo", anchor))
    return s


def screw_t(x, y, lab):
    """a Shelly screw terminal with its label under it"""
    return (f'<circle class="screw" cx="{x}" cy="{y}" r="8"/><path class="slot" d="M{x - 5},{y} H{x + 5}"/>'
            + txt(x, y + 24, lab, "lbl onshb", "middle"))


def tab(x, y, lab):
    return f'<rect class="tab" x="{x - 5}" y="{y - 14}" width="10" height="16" rx="1.5"/>' + txt(x, y + 18, lab, "lbl onpla", "middle")


def shelly_box():
    """the Shelly in its enclosure, terminals O, SW, L and N along the top"""
    return g("shl", '<rect class="shb" x="40" y="246" width="164" height="62" rx="10"/>'
             + "".join(screw_t(64 + 36 * i, 258, lab) for i, lab in enumerate(("O", "SW", "L", "N")))
             + txt(122, 300, "Shelly", "cap onshb", "middle"))


def scene_part():
    """scene 1: the Shelly on its own"""
    return ('<g data-k="sc1">' + txt(240, 40, "Shelly 1PM, front", "cap", "middle")
            + '<rect class="shb" x="150" y="70" width="180" height="150" rx="14"/>'
            + txt(240, 174, "Shelly 1PM", "nm onshb", "middle") + txt(240, 192, "16 A (15 A UL)", "cap onshb", "middle")
            + txt(240, 207, "110 to 240 V~", "cap onshb", "middle")
            + "".join(screw_t(186 + 36 * i, 96, lab) for i, lab in enumerate(("O", "SW", "L", "N")))
            + g("k1o", txt(150, 262, "O: switched line out", "lbl", "start"))
            + g("k1sw", txt(150, 280, "SW: the switch input", "lbl", "start"))
            + g("k1ln", txt(150, 298, "L and N: its supply", "lbl", "start"))
            + g("k1mini", '<rect class="tagb" x="336" y="128" width="132" height="44" rx="4"/>' + txt(402, 146, "not a Mini:", "tagt", "middle")
                + txt(402, 162, "they switch 8 A", "tagt", "middle"))
            + '</g>')


def scene_ferrule():
    """the ferrule, close up, in three stages"""
    return ('<g data-k="sc3"><rect class="wallbg" x="0" y="0" width="480" height="330"/>' + txt(240, 36, "a ferrule on each wire into the Shelly", "cap", "middle")
            # 1 strip
            + g("strip", '<path class="shw L" d="M20,150 H96"/><path class="copperw" d="M96,150 H128"/>'
                '<path class="dimln" d="M96,128 V138 M128,128 V138 M96,133 H128"/>' + txt(112, 122, "6 mm", "lbl", "middle")
                + txt(74, 196, "1. strip", "cap", "middle"))
            # 2 ferrule on, crimped
            + g("fer", '<path class="shw L" d="M178,150 H238"/><rect class="ferc" x="236" y="141" width="14" height="18" rx="3"/>'
                '<rect class="ferm" x="250" y="144" width="34" height="12" rx="2"/>' + txt(232, 196, "2. ferrule on", "cap", "middle"))
            + g("jaw", '<rect class="jawp" x="246" y="110" width="42" height="30" rx="3"/><rect class="jawp" x="246" y="160" width="42" height="30" rx="3"/>'
                + txt(267, 104, "crimp", "lbl", "middle"))
            # 3 into the terminal
            + g("blk", '<rect class="shb" x="352" y="96" width="112" height="104" rx="8"/><rect class="pla" x="372" y="136" width="70" height="30" rx="3"/>'
                '<rect class="ferm" x="384" y="145" width="34" height="12" rx="2"/><rect class="ferc" x="370" y="142" width="14" height="18" rx="3"/>'
                '<path class="shw L" d="M330,151 H370"/>'
                '<circle class="screw" cx="407" cy="118" r="11"/><path class="slot" d="M400,118 H414"/>' + txt(408, 222, "3. in fully, tighten", "cap", "middle"))
            + g("tq", txt(407, 86, "0.4 Nm at most", "lbl", "middle"))
            + g("tug", txt(240, 268, "then a gentle tug: nothing moves, no copper showing", "lbl", "middle"))
            + '</g>')


def scene_meters(rows, caption):
    """three meter readouts; rows are (reading, line 1, line 2)"""
    s = '<g data-k="sc4"><rect class="wallbg" x="0" y="0" width="480" height="330"/>'
    for i, (val, l1, l2) in enumerate(rows):
        x = 22 + i * 152
        s += (f'<rect class="meter" x="{x}" y="60" width="132" height="150" rx="12"/><rect class="lcd" x="{x + 14}" y="76" width="104" height="40" rx="4"/>'
              f'<text class="lcdt" x="{x + 66}" y="103" text-anchor="middle">{val}</text><circle class="jack" cx="{x + 42}" cy="184" r="6"/><circle class="jack r" cx="{x + 90}" cy="184" r="6"/>'
              + txt(x + 66, 232, l1, "cap", "middle") + txt(x + 66, 246, l2, "cap", "middle"))
    return s + txt(240, 286, caption, "cap", "middle") + '</g>'


def scene_app():
    """the Shelly app's settings"""
    return ('<g data-k="sc5"><rect class="wallbg" x="0" y="0" width="480" height="330"/>'
            '<rect class="phone" x="150" y="18" width="180" height="296" rx="22"/><rect class="pscr" x="160" y="40" width="160" height="252" rx="8"/>'
            + txt(240, 64, "Shelly app", "pt", "middle")
            + g("st1", '<rect class="prow" x="168" y="82" width="144" height="40" rx="6"/>' + txt(176, 98, "Input mode", "pk") + txt(176, 114, "Switch, or Button", "pv"))
            + g("st2", '<rect class="prow" x="168" y="130" width="144" height="40" rx="6"/>' + txt(176, 146, "Action on power on", "pk") + txt(176, 162, "Turn OFF", "pv"))
            + g("st3", '<rect class="prow" x="168" y="178" width="144" height="40" rx="6"/>' + txt(176, 194, "Auto off", "pk") + txt(176, 210, "optional", "pv"))
            + g("st4", '<rect class="prow" x="168" y="226" width="144" height="40" rx="6"/>' + txt(176, 242, "Firmware", "pk") + txt(176, 258, "up to date", "pv"))
            + '</g>')


def gaggia():
    s = ['<svg id="pg-shl" viewBox="0 0 480 330" role="img" aria-labelledby="pg-shl-t"><title id="pg-shl-t">The Shelly smart relay '
         'drawn step by step, looking down on the back of the machine: the Shelly and the socket in an enclosure outside the back panel, '
         'their wires through the old socket hole to the power switch and to a splice by it, then ferrules, the meter checks and the app settings.</title>']
    s.append(scene_part())
    # scene 2 onward: the back of the machine
    sc = ['<g data-k="sc2">']
    sc.append(txt(12, 20, "inside the machine", "cap"))
    # the back panel with its socket hole
    sc.append('<rect class="wallp" x="0" y="148" width="196" height="12"/><rect class="wallp" x="424" y="148" width="56" height="12"/>'
              + txt(476, 142, "back panel", "cap", "end"))
    sc.append(g("grom", '<rect class="grom" x="192" y="145" width="12" height="18" rx="5"/><rect class="grom" x="416" y="145" width="12" height="18" rx="5"/>'))
    # the enclosure outside, over the hole
    sc.append(g("encl", '<rect class="encl" x="16" y="168" width="448" height="156" rx="12"/>' + txt(456, 319, "enclosure, outside the case", "cap", "end")))
    # the power switch, seen from the back, and splice S6 by it
    sw = '<rect class="pla" x="372" y="22" width="84" height="104" rx="6"/>' + txt(414, 16, "power switch, back", "cap", "middle")
    for i, n in enumerate((1, 2, 3)):
        y = 44 + 30 * i
        sw += f'<rect class="tab fadedtab" x="384" y="{y - 5}" width="22" height="10" rx="1"/>' + txt(380, y + 4, str(n), "cap", "end")
        sw += f'<rect class="tab{"" if n < 3 else " fadedtab"}" x="422" y="{y - 5}" width="22" height="10" rx="1"/>' + txt(460, y + 4, str(n + 3), "lbl", "start")
    sc.append(g("sw", sw))
    sc.append(g("s6", '<rect class="bn2" x="168" y="94" width="22" height="13" rx="2"/>' + txt(179, 88, "S6", "lbl", "middle")))
    # the Shelly and the socket in the enclosure
    sc.append(shelly_box())
    sc.append(g("sock", '<rect class="pla" x="262" y="246" width="128" height="62" rx="8"/>'
                + tab(288, 252, "N") + tab(328, 252, "E") + tab(368, 252, "L") + txt(326, 298, "socket", "cap onpla", "middle")))
    # wires: inside the enclosure
    sc.append(wire("w1", "M364,238 V196 H136 V250", "L", "SH1", 250, 192, "middle"))
    sc.append(wire("w2", "M284,238 V222 H172 V250", "N", "SH2", 200, 218, "start"))
    sc.append(g("pig", '<rect class="pig" x="279" y="230" width="18" height="10" rx="2"/>'))
    sc.append(g("pigt", txt(272, 244, "piggyback", "cap halo", "end")))
    # into the machine: AC1 to spade 5, the neutral pair and G1 (stubs)
    sc.append(wire("ac1", "M372,238 V186 H404 V74 H422", "L", "AC1", 398, 178, "end"))
    sc.append(wire("nn", "M292,234 V110 M298,234 V110", "N", "neutral pair", 295, 102, "middle"))
    sc.append(wire("g1", "M328,238 V118", "E", "G1", 334, 126, "start"))
    # the Shelly's output and switch input
    sc.append(wire("w3", "M64,250 V176 H208 V100 H190", "O", "SH3", 200, 128, "end"))
    sc.append(wire("w4", "M100,250 V184 H224 V30 H410 V44 H422", "SW", "SH4", 300, 26, "middle"))
    sc.append(wire("ac23", "M168,97 H40 M168,104 V122 H40", "O", None))
    sc.append(g("ac23t", txt(40, 90, "AC2, to the SSR", "lbl halo") + txt(40, 136, "AC3, to the lamps", "lbl halo")))
    sc.append(g("hot", '<rect class="hotz" x="16" y="168" width="448" height="156" rx="12"/><rect class="hotz" x="372" y="22" width="84" height="104" rx="6"/>'))
    sc.append('</g>')
    s.extend(sc)
    s.append(scene_ferrule())
    s.append(scene_meters((("0.3 Ω", "e30: inlet L", "to Shelly L"), ("0.4 Ω", "e31: Shelly O", "to J11"), ("OL", "e32: inlet L", "to J11")),
                          "unplugged: the relay is open, so e32 reads OL"))
    s.append(scene_app())
    s.append('</svg>')
    return "".join(s)


def silvia():
    s = ['<svg id="pg-shl" viewBox="0 0 480 330" role="img" aria-labelledby="pg-shl-t"><title id="pg-shl-t">The Shelly smart relay '
         'drawn step by step, looking down on the back of the Silvia: the Shelly in an enclosure outside the back panel, its four wires through a grommet '
         'to the inlet, the power switch and SSR terminal 1, and a splice for neutral by the switch, then ferrules, the meter checks and the app settings.</title>']
    s.append(scene_part())
    sc = ['<g data-k="sc2">']
    sc.append(txt(12, 20, "inside the machine", "cap"))
    # the back panel: a grommeted hole for the Shelly's wires, and the inlet
    sc.append('<rect class="wallp" x="0" y="158" width="140" height="12"/><rect class="wallp" x="204" y="158" width="96" height="12"/>'
              '<rect class="wallp" x="420" y="158" width="60" height="12"/>' + txt(476, 212, "back panel", "cap", "end"))
    sc.append(g("grom", '<rect class="grom" x="136" y="155" width="12" height="18" rx="5"/><rect class="grom" x="196" y="155" width="12" height="18" rx="5"/>'))
    sc.append('<rect class="pla" x="300" y="136" width="120" height="22" rx="4"/><rect class="pla" x="306" y="170" width="108" height="26" rx="4"/>'
              + tab(324, 136, "L") + tab(360, 136, "E") + tab(396, 136, "N") + txt(360, 188, "inlet", "cap onpla", "middle"))
    # the enclosure outside, against the panel
    sc.append(g("encl", '<rect class="encl" x="16" y="170" width="274" height="148" rx="12"/>' + txt(282, 310, "enclosure", "cap", "end")))
    # the power switch from behind: the L pole's two spades in use, the N pole empty; the neutral splice beside it
    sw = ('<rect class="pla" x="300" y="24" width="80" height="60" rx="6"/>' + txt(340, 16, "power switch, back", "cap", "middle")
          + '<rect class="tab" x="311" y="35" width="22" height="10" rx="1"/><rect class="tab" x="311" y="63" width="22" height="10" rx="1"/>'
          + '<rect class="tab fadedtab" x="347" y="35" width="22" height="10" rx="1"/><rect class="tab fadedtab" x="347" y="63" width="22" height="10" rx="1"/>'
          + txt(322, 58, "L", "lbl onpla", "middle") + txt(358, 58, "N", "cap onpla", "middle"))
    sc.append(g("sw", sw))
    sc.append(g("nsp", '<rect class="bn2" x="424" y="40" width="12" height="24" rx="2"/>' + txt(444, 56, "BN2", "lbl", "start")))
    sc.append(shelly_box())
    # into the machine: AC1 to the L pole, and the neutral side: AC2 to the splice, AC8 and AC9 on, and G1
    sc.append(wire("ac1", "M328,122 V73", "L", "AC1", 334, 114, "start"))
    sc.append(wire("ac2", "M400,122 V84 H430 V64", "N", "AC2", 406, 112, "start"))
    sc.append(wire("ac89", "M428,40 V26 M432,40 V26", "N", "AC8 + AC9", 476, 18, "end"))
    sc.append(wire("g1", "M360,122 V112", "E", "G1", 366, 116, "start"))
    # the Shelly's four wires, through the grommet
    sc.append(wire("wl", "M320,122 V108 H176 V216 H136 V250", "L", "SH1", 250, 124, "middle"))
    sc.append(wire("wn", "M392,122 V96 H188 V226 H172 V250", "N", "SH4", 250, 90, "middle"))
    sc.append(wire("wsw", "M311,40 H164 V206 H100 V250", "SW", "SH2", 230, 34, "middle"))
    sc.append(wire("wo", "M64,250 V196 H152 V130 H20", "O", "SH3, to the SSR", 20, 124, "start"))
    sc.append(g("hot", '<rect class="hotz" x="16" y="170" width="274" height="148" rx="12"/><rect class="hotz" x="300" y="122" width="120" height="74" rx="4"/>'
                '<rect class="hotz" x="300" y="24" width="80" height="60" rx="6"/>'))
    sc.append('</g>')
    s.extend(sc)
    s.append(scene_ferrule())
    s.append(scene_meters((("0.3 Ω", "e11: inlet L", "to Shelly L"), ("0.4 Ω", "e12: Shelly O", "to J11"), ("OL", "e13: inlet L", "to J11")),
                          "unplugged, the relay is open: e13 reads OL or a high value"))
    s.append(scene_app())
    s.append('</svg>')
    return "".join(s)


def main():
    svg = silvia() if SITE == "silvia" else gaggia()
    open(os.path.join(HERE, "part-shl.svg.html"), "w").write(svg + "\n")
    print("part-shl.svg.html", SITE, len(svg) // 1024, "KB")


if __name__ == "__main__":
    main()
