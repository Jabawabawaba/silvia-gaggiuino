"""Writes the thermostat-and-fuse figure (<figure id="mini-tstat">) for one site.
Graph: boiler temperature 20..210 C over the last 300 s of machine time. Below it, three cutaways in 110-wide boxes."""
import sys

def zig(x0, x1, y, n, amp):
    w = (x1 - x0) / n
    pts = [f'{x0:g},{y}']
    for i in range(1, n):
        pts.append(f'{x0 + w*i:g},{y - amp if i % 2 else y + amp}')
    pts.append(f'{x1:g},{y}')
    return ' '.join(pts)

def thermostat(key, reset=False):
    """A snap-disc thermostat in section, local coords 0..110 x 0..100. key names its parts for the script."""
    btn = ('<g class="tb-reset" data-k="%s-btn"><rect x="47" y="6" width="16" height="9" rx="2.5" class="tb-btn"/></g>' % key) if reset else ''
    return f'''<rect x="0" y="88" width="110" height="12" class="tb-wall"/>
        <rect x="49" y="74" width="12" height="16" class="tb-stud"/><path d="M49,78 h12 M49,82 h12 M49,86 h12" class="tb-thread"/>
        <rect x="24" y="0" width="8" height="20" rx="1" class="tb-spade"/><rect x="78" y="0" width="8" height="20" rx="1" class="tb-spade"/>
        {btn}
        <rect x="10" y="14" width="90" height="48" rx="6" class="tb-house"/>
        <rect x="16" y="20" width="78" height="40" rx="3" class="tb-cav"/>
        <path d="M14,56 V76 H96 V56" class="tb-cup"/>
        <path d="M28,20 V55 H58" class="tb-cond"/><circle cx="54" cy="52" r="3" class="tb-ct"/>
        <path d="M82,20 V34" class="tb-cond"/>
        <g data-k="{key}-arm"><path d="M82,34 L54,44" class="tb-blade" data-k="{key}-blade"/><circle cx="54" cy="47" r="3" class="tb-ct"/></g>
        <path d="M51,47 l2,2.5 l1.5,-1.5 l1.5,2 l1.5,-2 l1,2" class="tb-weld" data-k="{key}-weld"/>
        <rect x="62" y="41" width="6" height="27" rx="1.5" class="tb-pin" data-k="{key}-pin"/>
        <path d="M20,64 Q55,72 90,64" class="tb-disc" data-k="{key}-disc"/>'''

def fuse():
    """A one-shot thermal fuse in section: a pellet holds a spring that keeps the sliding contact on the lead."""
    return f'''<rect x="0" y="88" width="110" height="12" class="tb-wall"/>
        <path d="M12,88 V62 Q12,56 18,56 M98,88 V62 Q98,56 92,56" class="fz-clip"/>
        <rect x="0" y="40" width="10" height="8" rx="1" class="tb-spade"/><path d="M10,44 H16" class="fz-lead"/><path d="M92,44 H104" class="fz-lead"/><rect x="100" y="40" width="10" height="8" rx="1" class="tb-spade"/>
        <rect x="16" y="28" width="66" height="32" rx="7" class="fz-case"/>
        <rect x="21" y="32" width="58" height="24" rx="3" class="tb-cav"/>
        <rect x="80" y="34" width="13" height="20" rx="2" class="fz-bush"/>
        <rect x="64" y="42" width="22" height="4" class="fz-pin"/>
        <rect x="21" y="34" width="11" height="20" rx="2" class="fz-pellet" data-k="fz-pellet"/>
        <polyline points="{zig(32,58,44,8,7)}" class="fz-spring" data-k="fz-spring"/>
        <polyline points="{zig(64,79,51,6,2.5)}" class="fz-trip" data-k="fz-trip"/>
        <rect x="58" y="33" width="6" height="22" rx="1.5" class="fz-star" data-k="fz-star"/>'''

def badge(key, x, y):
    return (f'<g class="badge tb-badge" data-k="{key}-badge" transform="translate({x} {y})"><rect x="-40" y="0" width="80" height="15" rx="4"/>'
            f'<text x="0" y="10.8" text-anchor="middle" data-k="{key}-btext">CLOSED</text></g>')

def mark(n, x, y):
    return f'<g class="tb-mk"><circle cx="{x}" cy="{y}" r="5"/><text x="{x}" y="{y+2.6:g}" text-anchor="middle">{n}</text></g>'

S = 1.45   # the parts are drawn 110 wide and shown at this scale
BW = 110 * S

def figure(site):
    g = site == 'gaggia'
    third_t, third_s = ('thermal fuse', 'melts at %%FUSE%% °C') if g else ('safety thermostat', 'trips at 165 °C')
    def y(t): return 150 - (t - 20) * 142 / 190
    lines = ''
    for k, lab in (('bo', 'brew opens'), ('so', 'steam opens'), ('cut', 'fuse melts' if g else 'safety trips')):
        lines += f'<line x1="30" x2="350" class="tg-lim {k}" data-k="tg-{k}"/><text x="346" class="cap sm tg-lab {k}" text-anchor="end" data-k="tg-{k}-t">{lab}</text>'
    for k in ('bc', 'sc'):
        lines += f'<line x1="30" x2="350" class="tg-lim close" data-k="tg-{k}"/>'
    ticks = ''.join(f'<line x1="26" x2="30" y1="{y(t):.1f}" y2="{y(t):.1f}" class="tg-tick"/><text x="23" y="{y(t)+3.8:.1f}" class="cap sm" text-anchor="end">{t}</text>' for t in (50, 100, 150))
    reset_btn = ('<button type="button" class="btn" data-ts="fix" disabled>Fit a new fuse</button>' if g
                 else '<button type="button" class="btn" data-ts="fix" disabled>Press reset</button>')
    aria = ('Top, a graph of the boiler temperature over the last five minutes, with the points where the brew thermostat opens, '
            'the steam thermostat opens and the ' + ('thermal fuse melts' if g else 'safety thermostat trips') + ', and a band showing when the '
            + ('elements are' if g else 'element is') + ' heating. Below, each part in section. A thermostat is a bimetal disc in a cup that touches the boiler: '
            'at its set point the disc snaps from one shape to the other and pushes a ceramic pin up, which lifts a spring blade and parts the contacts; it snaps back, closing them, '
            'once it has cooled several degrees. ' +
            ('The thermal fuse is a sealed metal tube: a pellet inside holds a spring that keeps a sliding contact pressed on the lead. At its rating the pellet melts, the spring lets go, a second spring pushes the contact away, and it stays open for good.'
             if g else 'The safety thermostat works the same way, but its disc stays snapped open until its reset button is pressed.'))
    if g:
        cap = ('<figcaption>Simplified; the closing points and timings are illustrative. The thermostats are in series, so one stuck shut is still caught by the other: '
               'a stuck brew thermostat leaves the steam one in charge at %%STEAM_OPEN%% °C, and the coffee comes out far too hot. Only the steam thermostat stuck shut with steam on, '
               'or both stuck, lets the boiler run away, and then the fuse is the last line. '
               '<span data-when="fam:GCP"><span data-when="unset:model">On the Pro family it\'s</span><span data-when="set:model">It\'s</span> in the switched line, so when it melts only the power lamp still lights.</span>'
               '<span data-when="fam:GC"> <span data-when="unset:model">On the original Classic it\'s</span><span data-when="set:model">On your Classic it\'s</span> in the neutral feed, so when it melts the whole machine goes dark.</span>'
               ' The fuse is drawn as a typical pellet-type thermal cutoff. Never bypass it; unplug, find the cause and fit a new one. '
               'The resettable fuse some Gaggiuino kits include works like the thermostats, with a reset button instead.</figcaption>')
    else:
        cap = ('<figcaption>Simplified; the closing points and timings are illustrative. The thermostats are in series, so one stuck shut is still caught by the other: '
               'a stuck brew thermostat leaves the steam one in charge at %%STEAM_OPEN%% °C, and the coffee comes out far too hot. Only the steam thermostat stuck shut with steam on, '
               'or both stuck, lets the boiler run away, and then the safety thermostat is the last line. It stays open until it has cooled and you press its red button. '
               'In the usual stock wiring the heating light stays on while it\'s tripped. Unplug before resetting it, and find the cause first.'
               '<span data-when="ver:V1,V2"> Machines made before mid-2007 have a 110 °C brew thermostat.</span></figcaption>')
    tmarks = mark(1, 90, 44) + mark(2, 43, 47) + mark(3, 76, 55) + mark(4, 29, 56) + mark(5, 104, 66)
    fmarks = mark(6, 26, 21) + mark(7, 45, 21) + mark(8, 61, 21) + mark(9, 88, 25)
    def box(title, sub, body, key, x, top, marks=''):
        return (f'\n    <g class="tb-box"><text x="{x + BW/2:.1f}" y="{top}" class="cap sm tb-t" text-anchor="middle">{title}</text>'
                f'<text x="{x + BW/2:.1f}" y="{top + 12}" class="cap sm" text-anchor="middle">{sub}</text>'
                f'<g transform="translate({x} {top + 20}) scale({S})">{body}{marks}</g></g>' + badge(key, round(x + BW/2, 1), top + 20 + 100*S + 6))
    ax, bx = 14, 360 - 14 - BW
    rows = (box('brew thermostat', 'opens at %%BREW_OPEN%% °C', thermostat('b'), 'b', ax, 186, tmarks)
            + box('steam thermostat', 'opens at %%STEAM_OPEN%% °C', thermostat('s'), 's', bx, 186)
            + box(third_t, third_s, fuse() if g else thermostat('cut', reset=True), 'cut', ax, 396, fmarks if g else mark(6, 40, 10)))
    key = [('h', 'In each thermostat'), (1, 'spring blade'), (2, 'contacts'), (3, 'ceramic pin'), (4, 'bimetal disc'), (5, 'cup on the boiler')]
    key += ([('h', 'In the fuse'), (6, 'pellet'), (7, 'spring'), (8, 'sliding contact'), (9, 'lead')] if g else [('h', 'On the safety'), (6, 'reset button')])
    kx, ky, kt = 360 - 14 - 150, 404, ''
    for n, txt in key:
        if n == 'h':
            ky += 6 if kt else 0
            kt += f'<text x="{kx}" y="{ky}" class="cap sm tb-t">{txt}</text>'
        else:
            kt += f'<g class="tb-mk"><circle cx="{kx + 5}" cy="{ky - 3.5}" r="5"/><text x="{kx + 5}" y="{ky - 0.9}" text-anchor="middle">{n}</text></g><text x="{kx + 15}" y="{ky}" class="cap sm">{txt}</text>'
        ky += 15
    return f'''<!-- THERMOSTATS AND {'FUSE' if g else 'SAFETY'}: a boiler you can run, each part in section -->
<figure class="mini" id="mini-tstat">
  <div class="mini-ctl"><button type="button" class="btn" data-ts="steam" aria-pressed="false">Steam switch off</button><button type="button" class="btn" data-ts="restart">Start over</button>{reset_btn}</div>
  <div class="mini-ctl"><span class="mini-note" id="ts-fl">Fault:</span><span class="mini-seg" role="group" aria-labelledby="ts-fl"><button type="button" class="chip" data-fault="none" aria-pressed="true">Nothing stuck</button><button type="button" class="chip" data-fault="b" aria-pressed="false">Brew thermostat stuck shut</button><button type="button" class="chip" data-fault="s" aria-pressed="false">Steam thermostat stuck shut</button></span></div>
  <div class="mini-ctl"><span class="mini-note" data-ts-note>Heating from cold: both thermostats are closed.</span></div>
  <svg viewBox="0 0 360 600" role="img" aria-label="{aria}">
    <rect x="30" y="8" width="320" height="142" class="tg-frame"/>
    {ticks}<text x="23" y="17" class="cap sm" text-anchor="end">°C</text>
    {lines}
    <path class="tg-heat" data-k="tg-heat" d=""/>
    <path class="tg-trace" data-k="tg-trace" d=""/>
    <circle class="tg-now" data-k="tg-now" r="4.5" cx="-10" cy="-10"/>
    <rect x="30" y="162" width="10" height="5" class="tg-heatkey"/><text x="44" y="167" class="cap sm">{'elements' if g else 'element'} heating</text><text x="350" y="167" class="cap sm" text-anchor="end">last 5 minutes</text>
    {rows}
    {kt}
  </svg>
  {cap}
</figure>'''

if __name__ == '__main__':
    print(figure(sys.argv[1]))
