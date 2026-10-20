"""Drawings for the Silvia site's Part guides page (part-guides.tpl.html).

Writes part-defs.svg.html (shared gradients and patterns) and one scene per guide: part-tc.svg.html (the M3
thermocouple in a brew thermostat clamp hole), part-ps.svg.html (the pressure sensor on its elbow and the OPV tee),
part-wire.svg.html (making the wires), part-ssr.svg.html (the SSR on the left wall) and part-sw.svg.html (the
switches). Each moving piece carries data-k, the key part-guides.js animates; data-when pieces show only for the
Silvias that condition fits (machine.js), and data-loop pieces run only during the steps that name them.
Run `python3 gen_part_svgs.py` after editing, then build the site. Drawings are illustrations, not to scale.
The helpers and the look are shared with the Gaggia site's generator.
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))


def zig(x0, x1, y, h, step=4, horiz=True):
    """thread teeth along a wall: from x0 to x1 at height y, teeth h tall (negative = up)"""
    pts, x, up = [f"M{x0},{y}"], x0, True
    while x + step / 2 <= x1 + 0.01:
        x += step / 2
        pts.append(f"L{x:g},{y + (h if up else 0):g}")
        up = not up
    return "".join(pts)


def zigv(y0, y1, x, w, step=4):
    """the same down a vertical wall"""
    pts, y, out = [f"M{x},{y0}"], y0, True
    while y + step / 2 <= y1 + 0.01:
        y += step / 2
        pts.append(f"L{x + (w if out else 0):g},{y:g}")
        out = not out
    return "".join(pts)


def ticks(x0, x1, y0, y1, step=4):
    """slanted thread lines across a stud lying along x"""
    return "".join(f"M{x:g},{y0}L{x + 2:g},{y1}" for x in range(int(x0) + 2, int(x1) - 1, step))


def ticksv(y0, y1, x0, x1, step=4):
    return "".join(f"M{x0},{y:g}L{x1},{y + 2:g}" for y in range(int(y0) + 2, int(y1) - 1, step))


def spanner(x, y, sc=1.0, slash=False):
    s = (f'<g transform="translate({x} {y}) scale({sc})"><path class="spn" d="M-22,6 L10,-6 A9,9 0 1,1 16,4 L10,0 L6,4 L10,9 '
         f'A9,9 0 0,1 2,6 L-20,14 Z"/>')
    if slash:
        s += '<circle class="nono" cx="-2" cy="4" r="24"/><path class="nono" d="M-19,-13 L15,21"/>'
    return s + "</g>"


def arrow_ellipse(cx, cy, rx, ry, key, rev=False):
    """a flowing arc with an arrowhead around a part being turned"""
    if not rev:
        d = f"M{cx - rx},{cy} A{rx},{ry} 0 1,1 {cx},{cy + ry}"
        head = f"M{cx},{cy + ry} l7,-4 M{cx},{cy + ry} l7,5"
    else:
        d = f"M{cx + rx},{cy} A{rx},{ry} 0 1,0 {cx},{cy + ry}"
        head = f"M{cx},{cy + ry} l-7,-4 M{cx},{cy + ry} l-7,5"
    return f'<g data-loop="{key}" class="turn"><path class="turnarc" d="{d}"/><path class="turnhd" d="{head}"/></g>'


DEFS = """<svg class="pg-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
<linearGradient id="pg-alu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E3E7EA"/><stop offset=".55" stop-color="#C6CCD1"/><stop offset="1" stop-color="#A9B1B8"/></linearGradient>
<linearGradient id="pg-brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0CF7A"/><stop offset=".5" stop-color="#D2A443"/><stop offset="1" stop-color="#A97A22"/></linearGradient>
<linearGradient id="pg-copper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDB081"/><stop offset=".5" stop-color="#C77A45"/><stop offset="1" stop-color="#94532A"/></linearGradient>
<linearGradient id="pg-steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EEF1F3"/><stop offset=".5" stop-color="#C3CAD0"/><stop offset="1" stop-color="#959EA6"/></linearGradient>
<linearGradient id="pg-steelh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9AA3AB"/><stop offset=".35" stop-color="#EEF1F3"/><stop offset="1" stop-color="#A3ACB4"/></linearGradient>
<linearGradient id="pg-hue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF3B30"/><stop offset=".2" stop-color="#FFCC00"/><stop offset=".4" stop-color="#34C759"/><stop offset=".6" stop-color="#32ADE6"/><stop offset=".8" stop-color="#5856D6"/><stop offset="1" stop-color="#FF2D55"/></linearGradient>
<pattern id="pg-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="#8D959C" stroke-width="1.2" opacity=".55"/></pattern>
<pattern id="pg-keep" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#B13A2F" stroke-width="1.4" opacity=".35"/></pattern>
</defs></svg>"""




def copper(x0, x1, y, h=8):
    """bare stranded copper, centred on y"""
    t = y - h / 2
    lines = "".join(f"M{x0},{t + k:g}H{x1}" for k in (h * .25, h * .5, h * .75))
    return f'<rect class="cu" x="{x0}" y="{t}" width="{x1 - x0}" height="{h}" rx="2"/><path class="strand" d="{lines}"/>'


def jaws(key, x0, x1, y, gap, die=None, hump=False, label=None):
    """a crimper's two jaws closing on y; die is a colour dot on the top jaw"""
    mid = (x0 + x1) / 2
    if hump:
        top = f"M{x0},{y - 80} H{x1} V{y - gap} Q{mid + (x1 - mid) / 2},{y - gap + 8} {mid},{y - gap} Q{mid - (mid - x0) / 2},{y - gap + 8} {x0},{y - gap} Z"
    else:
        top = f"M{x0},{y - 80} H{x1} V{y - gap} Q{mid},{y - gap + 7} {x0},{y - gap} Z"
    bot = f"M{x0},{y + 80} H{x1} V{y + gap} Q{mid},{y + gap - 7} {x0},{y + gap} Z"
    s = f'<g data-k="{key}T"><path class="jaw" d="{top}"/>'
    if die:
        s += f'<circle class="die-{die}" cx="{mid}" cy="{y - 64}" r="5"/>'
    if label:
        s += f'<text class="cap" x="{mid}" y="{y - 88}" text-anchor="middle">{label}</text>'
    return s + f'</g><g data-k="{key}B"><path class="jaw" d="{bot}"/></g>'


def heat(key, xs, y):
    return f'<g data-loop="{key}" class="heatw">' + "".join(f'<path d="M{x},{y} q6,-8 0,-16 q-6,-8 0,-16"/>' for x in xs) + '</g>'



def ssr_top(x, y):
    """the SSR seen from above, control screws at the top, load screws at the bottom"""
    return (f'<rect class="ssrb" x="{x}" y="{y}" width="200" height="200" rx="8"/>'
            f'<text class="ssrt" x="{x + 100}" y="{y + 104}" text-anchor="middle">SSR-40DA</text>'
            f'<text class="ssrs" x="{x + 100}" y="{y + 70}" text-anchor="middle">DC control</text><text class="ssrs" x="{x + 100}" y="{y + 138}" text-anchor="middle">AC load</text>')


def screw(key, cx, cy, r):
    return (f'<rect class="plate" x="{cx - r - 5}" y="{cy - r - 5}" width="{2 * r + 10}" height="{2 * r + 10}" rx="3"/>'
            f'<g data-k="{key}" data-origin="center"><circle class="screw" cx="{cx}" cy="{cy}" r="{r}"/><path class="slot" d="M{cx - r + 3},{cy}H{cx + r - 3}M{cx},{cy - r + 3}V{cy + r - 3}"/></g>')


def fork(cx, cy, up=True, cls="isl", two=False):
    """an insulated fork terminal around a screw at (cx,cy); its wire leaves downward (up=False: upward)"""
    d = 1 if up else -1
    tip = cy
    s = (f'<path class="metal" d="M{cx - 11},{tip - 4 * d} V{tip + 18 * d} H{cx + 11} V{tip - 4 * d} H{cx + 5} V{tip + 6 * d} H{cx - 5} V{tip - 4 * d} Z"/>')
    y0 = tip + 18 * d
    s += f'<rect class="{"isl-b" if two else cls}" x="{cx - 8}" y="{min(y0, y0 + 24 * d)}" width="16" height="24" rx="4"/>'
    return s



def spade_tab(x, y, n, faded=False, lab="l"):
    t = f'<rect class="tab{" fadedtab" if faded else ""}" x="{x - 11}" y="{y - 5}" width="22" height="10" rx="1"/>'
    tx = x - 18 if lab == "l" else x + 18
    return t + f'<text class="cap onmetal" x="{tx}" y="{y + 4}" text-anchor="{"end" if lab == "l" else "start"}">{n}</text>'


def conn(key, x, y, wire_d, label=None, lx=0, ly=0, cls="wire-m", sleeve=False):
    s = f'<g data-k="{key}"><path class="{cls}" d="{wire_d}"/><rect class="conn" x="{x - 14}" y="{y - 8}" width="28" height="16" rx="3"/>'
    if sleeve:
        s += f'<rect data-k="{key}s" class="slv" x="{x - 18}" y="{y - 12}" width="36" height="24" rx="7"/>'
    if label:
        s += f'<g class="tagg" data-k="{key}t"><rect class="tagb" x="{x + lx - 15}" y="{y + ly - 10}" width="30" height="16" rx="3"/><text class="tagt" x="{x + lx}" y="{y + ly + 2}" text-anchor="middle">{label}</text></g>'
    return s + "</g>"


def lvwire(key, d, cls, end, cap=None, capxy=None):
    """a low-voltage wire drawn in, ending in a small female spade at end=(x,y)"""
    x, y = end
    s = f'<g data-k="{key}"><path class="{cls}" d="{d}"/><rect class="conn lvc" x="{x - 12}" y="{y - 7}" width="24" height="14" rx="3"/>'
    if cap:
        s += f'<text class="lbl" x="{capxy[0]}" y="{capxy[1]}">{cap}</text>'
    return s + "</g>"


def meters(prefix, a, b, caption="unplugged, J7 plug off, probes on its pins"):
    """two meter readouts for the switch checks"""
    s = f'<g data-k="{prefix}"><rect class="wallbg" x="0" y="0" width="480" height="300"/>'
    for i, (val, l1, l2) in enumerate((a, b)):
        x = 90 + i * 190
        s += (f'<rect class="meter" x="{x}" y="60" width="110" height="140" rx="12"/><rect class="lcd" x="{x + 12}" y="74" width="86" height="36" rx="4"/>'
              f'<text class="lcdt" x="{x + 55}" y="100" text-anchor="middle">{val}</text><circle class="jack" cx="{x + 34}" cy="176" r="6"/><circle class="jack r" cx="{x + 76}" cy="176" r="6"/>'
              f'<text class="cap" x="{x + 55}" y="222" text-anchor="middle">{l1}</text><text class="cap" x="{x + 55}" y="236" text-anchor="middle">{l2}</text>')
    return s + f'<text class="cap" x="240" y="270" text-anchor="middle">{caption}</text></g>'



# ---------------------------------------------------------------- thermocouple
def tc():
    s = ['<svg id="pg-tc" viewBox="0 0 480 300" role="img" aria-labelledby="pg-tc-t"><title id="pg-tc-t">Thermocouple install on a Silvia, drawn step by step: '
         'the brew thermostat\'s leads come off, its clamp screws come out and it lifts off the boiler top, the M3 thermocouple goes into one of the '
         'clamp holes with thermal paste, finger tight, its lead runs around the front of the boiler to the PCB, and it clamps into J4.</title>']
    s.append('<g data-k="close">')
    s.append('<rect class="water" x="20" y="206" width="440" height="74"/><text class="cap" x="40" y="272">water</text>'
             '<rect class="brass" x="20" y="176" width="440" height="30"/><rect class="hatch" x="20" y="176" width="440" height="30"/>'
             '<text class="cap" x="452" y="226" text-anchor="end">boiler top, in section</text>')
    for x in (146, 294):
        s.append(f'<rect class="hole" x="{x - 5}" y="176" width="10" height="20"/><path class="thr" d="{zigv(176, 196, x - 5, 2, 3)}{zigv(176, 196, x + 5, -2, 3)}"/>')
    # brew thermostat under its clamp
    s.append('<g data-k="bt"><rect class="tbody" x="176" y="134" width="88" height="42" rx="6"/><rect class="tcap" x="184" y="127" width="72" height="9" rx="3"/>'
             '<rect class="tab" x="196" y="100" width="8" height="28" rx="1"/><rect class="tab" x="236" y="100" width="8" height="28" rx="1"/>'
             '<text class="cap onmetal" x="220" y="160" text-anchor="middle">brew</text><text class="cap onmetal" x="220" y="172" text-anchor="middle">thermostat</text></g>')
    s.append('<g data-k="clp"><path class="clampb" d="M132,176 H160 V124 H280 V176 H308"/></g>')
    for k, x in (("sc1", 146), ("sc2", 294)):
        s.append(f'<g data-k="{k}"><rect class="steel" x="{x - 2.5}" y="172" width="5" height="24"/><rect class="screw" x="{x - 8}" y="162" width="16" height="10" rx="2"/>'
                 f'<path class="slot" d="M{x - 5},166H{x + 5}"/></g>')
    s.append(arrow_ellipse(146, 166, 16, 5, "spinU", rev=True) + arrow_ellipse(294, 166, 16, 5, "spinU", rev=True))
    s.append('<g data-k="l1"><path class="wire-m" d="M200,86 C200,58 260,46 330,40 S430,30 486,30"/><rect class="conn" x="191" y="84" width="18" height="18" rx="2"/></g>'
             '<g data-k="l2"><path class="wire-m" d="M240,86 C240,66 290,62 350,62 S440,58 486,58"/><rect class="conn" x="231" y="84" width="18" height="18" rx="2"/></g>'
             '<g data-k="lcap"><text class="cap" x="330" y="86">its two leads</text></g>')
    s.append('<g data-k="safe"><text class="cap" x="452" y="130" text-anchor="end">the 165 °C safety thermostat,</text>'
             '<text class="cap" x="452" y="144" text-anchor="end">on the front, stays</text></g>')
    # thermocouple, M3
    s.append('<g data-k="tc"><path class="braid" d="M146,118 C146,78 110,64 60,58 H-6"/><path class="braid2" d="M146,118 C146,78 110,64 60,58 H-6"/>'
             '<rect class="copper" x="142" y="168" width="8" height="28"/>'
             f'<path class="thrl" d="{ticksv(168, 196, 142, 150, 3)}"/>'
             '<rect data-k="paste" data-origin="center top" class="paste pasteon" x="141" y="168" width="10" height="28" rx="2"/>'
             '<rect class="copper" x="134" y="150" width="24" height="18" rx="2"/><path class="facet" d="M142,150V168M150,150V168"/>'
             '<rect class="steel" x="139" y="118" width="14" height="32" rx="3"/>'
             '<g data-k="syr"><rect class="syr" x="82" y="174" width="44" height="18" rx="3"/><rect class="syrp" x="70" y="178" width="14" height="10" rx="2"/>'
             '<path class="syr" d="M126,178 L126,188 L139,184.5 L139,181.5 Z"/><circle class="paste" cx="141" cy="183" r="3"/></g>'
             + arrow_ellipse(146, 159, 20, 6, "spinF") + '<text class="cap" x="164" y="132">M3</text></g>')
    s.append('<g data-k="nosp">' + spanner(236, 66, 0.95, slash=True) + '<text class="cap" x="236" y="106" text-anchor="middle">finger tight, no spanner</text></g>')
    # insulation, V5 and V6
    s.append('<g data-k="ins" data-when="ver:V5,V6"><rect class="insul" x="12" y="88" width="456" height="122" rx="18"/>'
             '<path class="quilt" d="M12,128 H468 M12,170 H468 M88,88 V210 M164,88 V210 M240,88 V210 M316,88 V210 M392,88 V210"/>'
             '<text class="lbl" x="240" y="153" text-anchor="middle">boiler insulation (V5, V6)</text></g>')
    s.append('</g>')
    # route, top view
    s.append('<g data-k="route"><rect class="chassis" x="60" y="34" width="360" height="236" rx="14"/>'
             '<text class="cap" x="240" y="290" text-anchor="middle">front of the machine</text><text class="cap" x="240" y="26" text-anchor="middle">back</text>'
             '<rect class="ssrb" x="70" y="116" width="24" height="54" rx="3"/><text class="cap" x="102" y="146">SSR</text>'
             '<rect class="brass" x="174" y="92" width="132" height="118" rx="18"/><text class="lbl onmetal" x="240" y="158" text-anchor="middle">boiler</text>'
             '<rect class="steelc" x="226" y="214" width="28" height="22" rx="3"/><text class="cap" x="240" y="252" text-anchor="middle">3-way valve</text>'
             '<rect class="pcb" x="330" y="168" width="78" height="80" rx="6"/><text class="lbl" x="369" y="204" text-anchor="middle">PCB</text>'
             '<text class="cap onpcb" x="369" y="222" text-anchor="middle">J4</text>'
             '<path data-k="rlead" class="tclead draw" pathLength="1" d="M200,114 H162 V258 H318 V212 H330"/>'
             '<rect class="copper" x="194" y="108" width="12" height="12" rx="2"/>'
             '<text class="cap" x="412" y="58" text-anchor="end">low voltage low,</text><text class="cap" x="412" y="72" text-anchor="end">to the right</text></g>')
    # J4 and the two meter checks
    s.append('<g data-k="j4v"><rect class="pcb" x="40" y="56" width="170" height="92" rx="8"/><text class="lbl" x="56" y="78">J4</text>'
             '<rect class="term" x="70" y="88" width="50" height="48" rx="4"/><rect class="term" x="130" y="88" width="50" height="48" rx="4"/>'
             '<g data-k="t1" data-origin="center"><circle class="screw" cx="95" cy="104" r="10"/><path class="slot" d="M88,104H102"/></g>'
             '<g data-k="t2" data-origin="center"><circle class="screw" cx="155" cy="104" r="10"/><path class="slot" d="M148,104H162"/></g>'
             '<text class="lbl onpcb" x="95" y="130" text-anchor="middle">−</text><text class="lbl onpcb" x="155" y="130" text-anchor="middle">+</text>'
             '<g data-k="tcw"><path class="tcwire" d="M95,138 V214 C95,236 120,244 125,262 V300"/><path class="tcwire" d="M155,138 V214 C155,236 130,244 125,262 V300"/>'
             '<path class="braid" d="M125,262 V300"/></g>'
             '<g data-k="ma"><rect class="meter" x="240" y="40" width="104" height="128" rx="12"/><rect class="lcd" x="252" y="54" width="80" height="34" rx="4"/>'
             '<text class="lcdt" x="292" y="79" text-anchor="middle">OL</text><circle class="jack" cx="272" cy="146" r="6"/><circle class="jack r" cx="312" cy="146" r="6"/>'
             '<text class="cap" x="292" y="188" text-anchor="middle">either wire</text><text class="cap" x="292" y="202" text-anchor="middle">to the boiler</text></g>'
             '<g data-k="mb"><rect class="meter" x="360" y="40" width="104" height="128" rx="12"/><rect class="lcd" x="372" y="54" width="80" height="34" rx="4"/>'
             '<text class="lcdt" x="412" y="79" text-anchor="middle">3.1 Ω</text><circle class="jack" cx="392" cy="146" r="6"/><circle class="jack r" cx="432" cy="146" r="6"/>'
             '<text class="cap" x="412" y="188" text-anchor="middle">wire to wire</text><text class="cap" x="412" y="202" text-anchor="middle">a few ohms</text></g>'
             '</g>')
    s.append('</svg>')
    return "".join(s)


# ---------------------------------------------------------------- pressure sensor on the OPV tee
def ps():
    s = ['<svg id="pg-ps" viewBox="0 0 480 330" role="img" aria-labelledby="pg-ps-t"><title id="pg-ps-t">Pressure sensor on a Silvia, drawn step by step: '
         'the flat O-ring goes into the elbow\'s socket and the sensor screws in, thread cord goes on the tapered threads, the tee goes in at the OPV '
         'with the elbow in it so the sensor hangs below, its cable plugs into J6, and the line is filled and pressure-tested.</title>']
    # the OPV, always there
    s.append('<rect class="brass" x="240" y="20" width="110" height="56" rx="4"/><text class="lbl onmetal" x="268" y="52">OPV</text>'
             '<rect class="hole" x="288" y="62" width="14" height="14"/>'
             '<text class="cap" x="356" y="38">drawn as an</text><text class="cap" x="356" y="52">illustration</text>')
    # the tee
    s.append('<g data-k="tee"><rect class="brass" x="288" y="62" width="14" height="22"/>'
             f'<path class="thrl" d="{ticksv(62, 84, 288, 302, 3)}"/>'
             '<g data-k="cord2"><path class="cord" d="M287,66 L303,70 M287,71 L303,75 M287,76 L303,80"/></g>'
             '<rect class="brass" x="278" y="84" width="34" height="40" rx="3"/><path class="facet" d="M278,94H312M278,114H312"/>'
             '<rect class="brass" x="258" y="94" width="20" height="20" rx="2"/><rect class="brass" x="312" y="94" width="20" height="20" rx="2"/>'
             '<path class="hoseB" d="M332,104 H404 C440,104 450,86 452,62"/><text class="cap" x="400" y="128">the line</text><text class="cap" x="400" y="142">carries on</text>'
             '<text class="cap" x="296" y="140" text-anchor="middle">1/8" FFM tee</text></g>')
    # elbow and sensor, built on the left first
    s.append('<g data-k="asm">')
    s.append('<rect class="brass" x="238" y="98" width="20" height="12"/>'
             f'<path class="thrl" d="{ticks(238, 258, 98, 110, 3)}"/>'
             '<g data-k="cord1"><path class="cord" d="M242,97 L246,111 M247,97 L251,111 M252,97 L256,111"/></g>'
             '<rect class="brass" x="212" y="92" width="28" height="26" rx="3"/>'
             '<rect class="brass" x="208" y="118" width="36" height="32" rx="2"/><rect class="hole" x="216" y="118" width="20" height="32"/>'
             f'<path class="thr" d="{zigv(124, 150, 216, 2.5, 3)}{zigv(124, 150, 236, -2.5, 3)}"/>'
             '<rect class="hole" x="221" y="100" width="10" height="20"/>')
    s.append('<g data-k="or1"><rect class="oring-w" x="216.5" y="118" width="6" height="5" rx="1.2"/><rect class="oring-w" x="229.5" y="118" width="6" height="5" rx="1.2"/></g>')
    s.append('<g data-loop="pulseR" class="pulse"><circle cx="226" cy="121" r="20"/></g>')
    s.append('<g data-k="sen"><rect class="steel" x="219" y="122" width="14" height="28"/>'
             f'<path class="thrl" d="{ticksv(122, 150, 219, 233, 3)}"/>'
             '<rect class="oring-g" x="212" y="150" width="28" height="4" rx="2"/>'
             '<rect class="steel" x="206" y="154" width="40" height="16" rx="2"/><path class="facet" d="M218,154V170M234,154V170"/>'
             '<rect class="steel2" x="210" y="170" width="32" height="68" rx="6"/><path class="cable" d="M226,238 V252"/>'
             + arrow_ellipse(226, 162, 28, 8, "spinS") + '</g>')
    s.append('<g data-k="qt">' + spanner(286, 168, 0.7) + '<text class="lbl" x="286" y="202" text-anchor="middle">¼ max</text></g>')
    s.append('<g data-k="foam"><rect class="foam" x="200" y="160" width="52" height="86" rx="12"/><text class="cap" x="194" y="204" text-anchor="end">foam if it</text><text class="cap" x="194" y="218" text-anchor="end">reads noisy</text></g>')
    s.append('<g data-k="wat"><rect class="wfill" x="222" y="101" width="8" height="18"/><rect class="wfill" x="232" y="101" width="26" height="6"/><rect class="wfill" x="221" y="118" width="10" height="4"/></g>')
    s.append('<g data-k="lcaps"><text class="cap" x="266" y="100">elbow</text><text class="cap" x="266" y="114">1/4"F to 1/8"M</text>'
             '<text class="cap" x="266" y="142">flat O-ring</text><path class="lead" d="M262,139 L238,122"/>'
             '<text class="cap" x="256" y="214">sensor</text><text class="cap" x="256" y="228">1.2 MPa</text></g>')
    s.append('</g>')
    s.append('<g data-k="wat2"><rect class="wfill" x="280" y="96" width="30" height="16"/><rect class="wfill" x="290" y="66" width="10" height="30"/></g>')
    # chassis floor
    s.append('<g data-k="chs"><path class="chassis" d="M20,300 H200"/><text class="cap" x="24" y="316">chassis: the sensor hangs clear of it</text></g>')
    # J6
    s.append('<g data-k="j6"><rect class="pcb" x="330" y="200" width="134" height="74" rx="6"/><text class="lbl" x="344" y="222">J6</text>'
             '<rect class="term" x="352" y="234" width="20" height="18" rx="2"/><rect class="term" x="378" y="234" width="20" height="18" rx="2"/><rect class="term" x="404" y="234" width="20" height="18" rx="2"/>'
             '<text class="cap onpcb" x="362" y="266" text-anchor="middle">5V</text><text class="cap onpcb" x="388" y="266" text-anchor="middle">GND</text><text class="cap onpcb" x="414" y="266" text-anchor="middle">P</text></g>')
    s.append('<path data-k="cab" class="cable draw" pathLength="1" d="M226,252 V284 C226,300 250,302 290,302 H388 V252"/>')
    # gauge for the test
    s.append('<g data-k="gauge"><rect class="meter" x="40" y="24" width="104" height="58" rx="10"/><rect class="lcd" x="48" y="32" width="88" height="30" rx="4"/>'
             '<text class="lcdt" data-k="pval" x="92" y="53" text-anchor="middle">0 bar</text><text class="cap" x="92" y="98" text-anchor="middle">[UT] Test OPV</text></g>')
    s.append('</svg>')
    return "".join(s)


# ---------------------------------------------------------------- making the wires
def wires():
    s = ['<svg id="pg-wire" viewBox="0 30 480 220" role="img" aria-labelledby="pg-wire-t"><title id="pg-wire-t">Making the wires for a Silvia harness, drawn step by step: '
         'cut and label, strip about 6 mm, crimp insulated spades and forks, crimp bare spades for the boiler and tape them after the checks, '
         'one spade or fork for two wires, a red butt splice in the switch ground chain, and the pull test.</title>']
    # 1 cut and label
    s.append('<g data-k="wv1"><rect class="ins-r" x="20" y="134" width="282" height="12" rx="5"/>'
             '<g data-k="waste"><rect class="ins-r" x="300" y="134" width="70" height="12" rx="5"/></g>'
             '<g data-k="cutT"><path class="blade" d="M286,40 L314,40 L304,138 L298,138 Z"/></g><g data-k="cutB"><path class="blade" d="M286,240 L314,240 L304,142 L298,142 Z"/></g>'
             '<g data-k="flag"><rect class="flagw" x="62" y="96" width="46" height="30" rx="3"/><text class="lbl onmetal" x="85" y="117" text-anchor="middle">AC5</text>'
             '<rect class="flagw" x="78" y="126" width="14" height="26" rx="2"/></g>'
             '<g data-k="mkr"><text class="mkt" x="236" y="143.5" text-anchor="middle">AC5</text><text class="cap" x="236" y="124" text-anchor="middle">boiler end: marker</text></g>'
             '<g data-k="wd1"><path class="dimln" d="M20,176 V188 M300,176 V188 M20,182 H300"/><text class="cap" x="160" y="204" text-anchor="middle">a little longer than the cut list</text></g></g>')
    # 2 strip
    s.append('<g data-k="wv2">' + copper(262, 300, 140) + '<rect class="ins-r" x="20" y="134" width="244" height="12" rx="3"/>'
             '<g data-k="slug"><rect class="ins-r" x="262" y="134" width="38" height="12" rx="3"/></g>'
             '<g data-k="sjT"><path class="jaw" d="M255,50 H269 V128 L264,133 H260 L255,128 Z"/></g><g data-k="sjB"><path class="jaw" d="M255,230 H269 V152 L264,147 H260 L255,152 Z"/></g>'
             '<g data-k="wd2"><path class="dimln" d="M262,108 V118 M300,108 V118 M262,113 H300"/><text class="lbl" x="281" y="102" text-anchor="middle">≈ 6 mm</text></g></g>')
    # 3 insulated spade
    s.append('<g data-k="wv3"><rect class="ins-r" x="20" y="134" width="216" height="12" rx="3"/>' + copper(234, 264, 140) +
             '<g data-k="isp"><rect class="metal" x="266" y="132" width="46" height="16" rx="2"/><path class="facet" d="M266,136 H312 M266,144 H312"/>'
             '<path class="isl" d="M228,130.5 H262 L268,134 V146 L262,149.5 H228 Z"/><rect data-k="dimp" class="dimple" x="240" y="130.5" width="14" height="19" rx="3"/></g>'
             + jaws("cj", 234, 260, 140, 12, die="r", label="red die") +
             '<text class="cap" x="380" y="120">nylon spade:</text><text class="cap" x="380" y="134">105 °C max</text>'
             '<text class="cap" x="380" y="162">forks on all</text><text class="cap" x="380" y="176">four SSR screws</text></g>')
    # 4 bare spade for the boiler, taped after the checks
    s.append('<g data-k="wv4"><rect class="ins-r" x="20" y="134" width="218" height="12" rx="3"/>' + copper(236, 264, 140) +
             '<g data-k="bsp"><rect class="metal" x="266" y="133" width="42" height="14" rx="2"/><rect class="metal" x="222" y="146" width="46" height="4"/>'
             '<g data-k="wo"><path class="wing" d="M246,148 V122 M262,148 V122 M226,148 V116 M240,148 V116"/></g>'
             '<g data-k="wc"><rect class="metal" x="244" y="133" width="22" height="14" rx="5"/><rect class="metal" x="222" y="131" width="20" height="18" rx="6"/></g>'
             '<g data-k="wcap"><text class="cap" x="254" y="198" text-anchor="middle">copper</text><text class="cap" x="230" y="212" text-anchor="middle">insulation</text></g></g>'
             + jaws("oj", 220, 268, 140, 13, hump=True, label="open-barrel die") +
             '<g data-k="tape" data-origin="left center"><rect class="tapeb" x="204" y="126" width="80" height="28" rx="8"/>'
             '<path class="tapel" d="M212,126 L222,154 M226,126 L236,154 M240,126 L250,154 M254,126 L264,154 M268,126 L278,154"/></g>'
             '<g data-k="tcap"><text class="cap" x="244" y="196" text-anchor="middle">self-fusing silicone tape,</text><text class="cap" x="244" y="210" text-anchor="middle">once the checks have probed it</text></g></g>')
    # 5 two wires on one terminal
    s.append('<g data-k="wv5"><rect class="ins-r" x="20" y="92" width="120" height="11" rx="3"/><rect class="ins-r" x="20" y="108" width="120" height="11" rx="3"/>'
             + copper(138, 160, 105.5, 14) +
             '<g data-k="tsp"><rect class="metal" x="186" y="96" width="46" height="19" rx="2"/><path class="isl-b" d="M132,93 H180 L188,97 V114 L180,118 H132 Z"/></g>'
             '<text class="cap" x="160" y="76" text-anchor="middle">two 18 AWG wires: blue, never red</text>'
             '<rect class="ins-r" x="250" y="176" width="112" height="11" rx="3"/><rect class="ins-r" x="250" y="192" width="112" height="11" rx="3"/>'
             + copper(360, 380, 189.5, 14) +
             '<g data-k="fk2"><rect class="metal" x="392" y="180" width="44" height="19" rx="2"/><rect class="hole" x="416" y="186" width="22" height="7" rx="3"/>'
             '<path class="isl-b" d="M352,177 H386 L394,181 V198 L386,202 H352 Z"/></g>'
             '<text class="cap" x="330" y="232" text-anchor="middle">SSR terminal 1: one fork for AC3 and AC4</text></g>')
    # 6 a red butt splice in the switch ground chain
    s.append('<g data-k="wv6"><g data-k="bl"><rect class="ins-k" x="10" y="135" width="188" height="10" rx="3"/>' + copper(196, 236, 140, 6) + '</g>'
             '<g data-k="br"><rect class="ins-k" x="282" y="135" width="188" height="10" rx="3"/>' + copper(244, 284, 140, 6) + '</g>'
             '<path class="isl" d="M188,129 H292 V151 H188 Z"/><path class="facet" d="M240,129 V151"/>'
             '<rect data-k="bd1" class="dimple" x="206" y="129" width="16" height="22" rx="3"/><rect data-k="bd2" class="dimple" x="258" y="129" width="16" height="22" rx="3"/>'
             '<text class="cap" x="240" y="196" text-anchor="middle">red butt splice, 22 AWG ground chain</text>'
             + jaws("bj", 204, 228, 140, 13, die="r") + '</g>')
    # 7 pull test
    s.append('<g data-k="wv7"><g data-loop="jig" class="jig"><rect class="ins-r" x="40" y="134" width="196" height="12" rx="3"/>'
             '<rect class="metal" x="266" y="132" width="46" height="16" rx="2"/><path class="isl" d="M228,130.5 H262 L268,134 V146 L262,149.5 H228 Z"/>'
             '<rect class="dimple" x="240" y="130.5" width="14" height="19" rx="3"/></g>'
             '<g data-loop="tug" class="tug"><path d="M30,140 H-2 M8,130 L-2,140 L8,150"/><path d="M322,140 H360 M350,130 L360,140 L350,150"/></g>'
             '<g data-k="okm"><circle class="okc" cx="420" cy="80" r="22"/><path class="okt" d="M409,80 l8,8 l14,-16"/></g>'
             '<text class="cap" x="176" y="196" text-anchor="middle">a firm tug: nothing moves</text></g>')
    s.append('</svg>')
    return "".join(s)


# ---------------------------------------------------------------- SSR on the left wall
def ssr():
    s = ['<svg id="pg-ssr" viewBox="0 0 480 300" role="img" aria-labelledby="pg-ssr-t"><title id="pg-ssr-t">SSR install on a Silvia, drawn step by step: '
         'its place on the left wall clear of the pump, one screw with washers and a nut through a drilled hole, AC3 and AC4 in one fork on load terminal 1, '
         'AC5 on load terminal 2, the J9 control wires on + and −, and the cover closed.</title>']
    # 1 where it goes
    s.append('<g data-k="sv1"><rect class="wallp" x="30" y="16" width="420" height="268" rx="6"/><text class="cap onmetal" x="44" y="274">left wall, from inside</text>'
             '<rect class="pumpb" x="60" y="196" width="112" height="70" rx="8"/><text class="lbl" x="116" y="236" text-anchor="middle" fill="#E7E9EB">pump</text>'
             '<g data-k="ssr1"><rect class="ssrb" x="236" y="100" width="88" height="74" rx="5"/><text class="ssrs" x="280" y="142" text-anchor="middle">SSR</text></g>'
             '<g data-k="clr"><path class="dimln acc" d="M172,214 H232 M172,208 V220 M232,208 V220"/><text class="cap onmetal" x="202" y="234" text-anchor="middle">clear of</text>'
             '<text class="cap onmetal" x="202" y="248" text-anchor="middle">the pump</text></g></g>')
    # 2 one screw through a drilled hole, in section
    s.append('<g data-k="sv2"><text class="cap" x="150" y="34" text-anchor="middle">inside</text><text class="cap" x="350" y="34" text-anchor="middle">outside</text>'
             '<rect class="wallp" x="250" y="44" width="12" height="110"/><rect class="wallp" x="250" y="166" width="12" height="110"/>'
             '<rect class="hatch" x="250" y="44" width="12" height="110"/><rect class="hatch" x="250" y="166" width="12" height="110"/>'
             '<rect class="ssrb" x="130" y="96" width="108" height="128" rx="6"/><rect class="metal" x="238" y="92" width="12" height="136" rx="2"/>'
             '<text class="ssrs" x="184" y="166" text-anchor="middle">SSR</text>'
             '<g data-k="scw"><rect class="steel" x="226" y="155" width="70" height="10"/><rect class="cap-screw" x="214" y="148" width="12" height="24" rx="3"/></g>'
             '<g data-k="wsh"><rect class="steel" x="262" y="146" width="5" height="28" rx="1"/></g>'
             '<g data-k="nut"><rect class="steel" x="267" y="149" width="14" height="22" rx="2"/><path class="facet" d="M267,156 H281 M267,164 H281"/></g>'
             + arrow_ellipse(274, 160, 12, 22, "nutspin") +
             '<text class="lbl" x="150" y="250" text-anchor="middle">screw, washers, nut</text><text class="cap" x="150" y="266" text-anchor="middle">through a drilled hole, or a small bracket</text>'
             '<text class="cap" x="356" y="236" text-anchor="middle">base flat on the metal</text></g>')
    # 3-6 the SSR from above
    s.append('<g data-k="sv3">' + ssr_top(140, 50) +
             '<circle data-k="led" data-run="blink" class="led" cx="240" cy="98" r="5"/>' + screw("sc1", 190, 90, 10) + screw("sc2", 290, 90, 10) + screw("sl1", 190, 210, 13) + screw("sl2", 290, 210, 13) +
             '<text class="lbl onssr" x="168" y="94" text-anchor="end">+</text><text class="lbl onssr" x="312" y="94">−</text>'
             '<text class="lbl onssr" x="168" y="214" text-anchor="end">1</text><text class="lbl onssr" x="312" y="214">2</text>')
    s.append('<g data-k="lw1">' + fork(190, 210, two=True) + '<path class="wire-m" d="M186,252 V300 M194,252 V300"/><text class="lbl" x="172" y="290" text-anchor="end">AC3 + AC4</text></g>'
             '<g data-k="lw2">' + fork(290, 210) + '<path class="wire-m" d="M290,252 V300"/><text class="lbl" x="308" y="290">AC5</text></g>')
    s.append('<g data-k="cwp">' + fork(190, 90, up=False, cls="isl") + '<path class="lvw" d="M190,48 V0"/><text class="lbl" x="172" y="18" text-anchor="end">J9 R1</text></g>'
             '<g data-k="cwm">' + fork(290, 90, up=False, cls="isl") + '<path class="lvg" d="M290,48 V0"/><text class="lbl" x="308" y="18">J9 GND</text></g>')
    s.append('<g data-k="cov"><rect class="cover" x="134" y="44" width="212" height="212" rx="10"/></g></g>')
    s.append('</svg>')
    return "".join(s)


# ---------------------------------------------------------------- switches
def switches():
    s = ['<svg id="pg-sw" viewBox="0 0 480 300" role="img" aria-labelledby="pg-sw-t"><title id="pg-sw-t">Silvia switches seen from the back, drawn side by side, step by step: '
         'the power switch keeps mains, with the inlet on its outer spades and the loads on its center spades; brew, steam and hot water each use one pole, '
         'with the PCB signal on its center spade and the ground chain on its outer spade.</title>']
    s.append('<g data-k="swv"><text class="cap" x="474" y="294" text-anchor="end">seen from the back, drawn side by side</text>')
    W = 88
    names = (("pw", 64, "Power"), ("st", 166, "Steam"), ("br", 268, "Brew"), ("hw", 370, "Hot water"))
    X = {k: x for k, x, _ in names}
    for key, x0, nm in names:
        s.append(f'<rect class="swbody" x="{x0}" y="66" width="{W}" height="140" rx="10"/><text class="lbl" x="{x0 + W // 2}" y="240" text-anchor="middle">{nm}</text>')
        free = key != "pw"
        s.append(spade_tab(x0 + 26, 112, "", faded=free) + spade_tab(x0 + 62, 112, "") + spade_tab(x0 + 26, 176, "", faded=free) + spade_tab(x0 + 62, 176, ""))
        if free:
            s.append(f'<text class="tiny" x="{x0 + 26}" y="146" text-anchor="middle">free</text>')
    pw = X["pw"]
    s.append(f'<text class="cap" x="{pw + 26}" y="224" text-anchor="middle">L</text><text class="cap" x="{pw + 62}" y="224" text-anchor="middle">N</text>'
             '<text class="cap" x="4" y="116">center</text><text class="cap" x="4" y="180">outer</text>')
    # power switch: mains, each tag sitting on its own wire
    l, n = pw + 26, pw + 62
    s.append(conn("ac1", l, 176, f"M{l - 14},176 C{l - 32},176 {l - 38},150 {l - 38},0", "AC1", -38, -136))
    s.append(conn("ac2", n, 176, f"M{n + 14},176 C{n + 32},176 {n + 34},150 {n + 34},0", "AC2", 34, -136))
    s.append(conn("ac3", l, 112, f"M{l},104 V0", "AC3", 0, -60))
    s.append(f'<g data-k="ac89"><path class="wire-m" d="M{n - 3},104 V0 M{n + 3},104 V0"/><rect class="conn" x="{n - 14}" y="104" width="28" height="16" rx="3"/><rect class="isl-b" x="{n - 10}" y="106" width="20" height="12" rx="2"/>'
             f'<g class="tagg"><rect class="tagb" x="{n - 29}" y="8" width="58" height="16" rx="3"/><text class="tagt" x="{n}" y="20" text-anchor="middle">AC8+AC9</text></g></g>')
    # low voltage: the signal comes in from above to the center spade, the ground chain runs along the bottom to the outer spades
    for key, sw, lab in (("lv1", "st", "J7 S"), ("lv2", "br", "J7 B"), ("lv3", "hw", "J5 B15")):
        x0 = X[sw]
        s.append(f'<g data-k="{key}"><path class="lvw" d="M{x0 + 80},0 V112 H{x0 + 74}"/><rect class="conn lvc" x="{x0 + 50}" y="105" width="24" height="14" rx="3"/>'
                 f'<text class="cap" x="{x0 + 76}" y="40" text-anchor="end">{lab}</text></g>')
    st, br, hw = X["st"], X["br"], X["hw"]
    gx = st - 7
    s.append(lvwire("lv4", f"M{gx},300 V214 H{st + 58} V183", "lvg", (st + 62, 176)))
    s.append(lvwire("lv5", f"M{st + 66},183 V218 H{br + 58} V183", "lvg", (br + 62, 176)))
    s.append(lvwire("lv6", f"M{br + 66},183 V214 H{hw + 58} V183", "lvg", (hw + 62, 176)))
    s.append(f'<g data-k="lvcap"><text class="cap" x="{gx - 6}" y="270" text-anchor="end">J7 GND</text></g>')
    # the E's push button and module, before the rocker goes in
    s.append(f'<g data-k="pbE" data-when="model:E"><rect class="wallbg" x="{pw - 6}" y="58" width="{W + 12}" height="190" rx="10"/><rect class="swbody" x="{pw}" y="66" width="{W}" height="140" rx="10"/>'
             f'<circle class="pbtn" cx="{pw + 44}" cy="112" r="24"/><rect class="blkh" x="{pw + 10}" y="150" width="{W - 20}" height="34" rx="4"/>'
             f'<text class="cap" x="{pw + 44}" y="171" text-anchor="middle" fill="#E7E9EB">module</text><text class="cap" x="{pw + 44}" y="240" text-anchor="middle">E: push button</text></g>')
    s.append('</g>')
    s.append(meters("swm", ("0.3 Ω", "brew ON:", "J7 B to GND"), ("OL", "brew OFF:", "J7 B to GND"), "unplugged, J7 and J5 plugs off, probes on their pins"))
    s.append('</svg>')
    return "".join(s)


def main():
    out = {"part-defs.svg.html": DEFS, "part-tc.svg.html": tc(), "part-ps.svg.html": ps(), "part-wire.svg.html": wires(), "part-ssr.svg.html": ssr(), "part-sw.svg.html": switches()}
    for name, body in out.items():
        open(os.path.join(HERE, name), "w").write(body + "\n")
        print(name, len(body), "bytes")


if __name__ == "__main__":
    main()
