"""The Silvia as it leaves the factory, for the wiring page's Out of the box view and its Show the change animation.

build() draws the stock circuit (factory-data.json) on the harness drawing's own layout (wiring_svg.part_svgs with
factory=True), so every machine part sits where the harness drawing has it, and routes each stock connection with a
small grid router (the Gaggia site's, wiring_map.py). It returns the drawing and what the page needs to show it:
each connection's ends, color and job, and each part's name and note."""
import heapq, json, os
from wiring_svg import W, H, part_svgs, esc, text, spade, PATHS, PATHS_SH
import re

HERE = os.path.dirname(os.path.abspath(__file__))
G = 8  # router grid, px


class Map:
    def __init__(self, key):
        self.key = key
        self.term = {}   # name -> (x, y, dir, part)
        self.obs = []    # (x0, y0, x1, y1, part)
        self.soft = []   # (x0, y0, x1, y1, cost)

    def t(self, name, x, y, d, part):
        self.term[name] = (x, y, d, part)


# ---------- router (from the Gaggia site's wiring_map.py) ----------
class Router:
    def __init__(self, m, used=None):
        self.m = m
        self.nx, self.ny = W // G + 1, H // G + 1
        self.block = [[False] * self.ny for _ in range(self.nx)]
        self.owner = {}
        for (x0, y0, x1, y1, pid) in m.obs:
            for i in range(max(0, int(x0 // G)), min(self.nx, -int(-x1 // G) + 1)):
                for j in range(max(0, int(y0 // G)), min(self.ny, -int(-y1 // G) + 1)):
                    self.block[i][j] = True
                    self.owner.setdefault((i, j), set()).add(pid)
        for i in range(self.nx):
            for j in range(0, 3):
                self.block[i][j] = True
        self.occ = {}
        self.bends = {}
        self.soft = {}
        for (x0, y0, x1, y1, c) in m.soft:
            for i in range(max(0, int(x0 // G)), min(self.nx, int(x1 // G) + 1)):
                for j in range(max(0, int(y0 // G)), min(self.ny, int(y1 // G) + 1)):
                    self.soft[(i, j)] = self.soft.get((i, j), 0) + c
        self.stubs = {tn: self.stub(tn) for tn in m.term}
        self.own = {}
        for tn, (cells, _) in self.stubs.items():
            i, j = cells[0]
            zone = {(i + a, j + b) for a in (-1, 0, 1) for b in (-1, 0, 1)}
            if used is None or tn in used:
                zone |= set(cells)
            self.own[tn] = zone
        self.keep = {}
        for tn, zone in self.own.items():
            for c in zone:
                self.keep.setdefault(c, set()).add(tn)
        self.near = {}
        for c, tns in self.keep.items():
            for (a, b) in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                n = (c[0] + a, c[1] + b)
                self.near.setdefault(n, set()).update(tns)
        self.fallback = []

    def stub(self, tn):
        x, y, d, part = self.m.term[tn]
        dx, dy = {"u": (0, -1), "d": (0, 1), "l": (-1, 0), "r": (1, 0)}[d]
        i, j = round(x / G), round(y / G)
        cells = [(i, j)]
        n = 0
        while True:
            i += dx
            j += dy
            n += 1
            cells.append((i, j))
            if n >= 3 and (not self.block[i][j] or part not in self.owner.get((i, j), ())):
                break
            if n > 40:
                break
        return cells, (dx, dy)

    def cost(self, cell, axis, nets, grp):
        c = self.soft.get(cell, 0)
        for (ax, rid, ts, g) in self.occ.get(cell, ()):
            if ts & nets:
                c += 0.15
            elif ax == axis:
                c += 14.0
            else:
                c += 9.0 if g == grp else 5.0
        for (rid, ts) in self.bends.get(cell, ()):
            if not ts & nets:
                c += 8.0
        if self.near.get(cell, set()) - nets:
            c += 6
        return c

    def route(self, a, b, rid, grp=""):
        try:
            return self._route(a, b, rid, grp, hard=True)
        except RuntimeError:
            self.fallback.append(rid)
            return self._route(a, b, rid, grp, hard=False)

    def unroute(self, rid):
        for d in (self.occ, self.bends):
            for c in list(d):
                keep = [e for e in d[c] if e[1 if d is self.occ else 0] != rid]
                if keep:
                    d[c] = keep
                else:
                    del d[c]

    def _route(self, a, b, rid, grp, hard):
        ca, da = self.stubs[a]
        cb, db = self.stubs[b]
        nets = {a, b}
        mine = self.own[a] | self.own[b]
        start, goal = ca[-1], cb[-1]
        dirs = ((1, 0), (-1, 0), (0, 1), (0, -1))
        sd = dirs.index(da)
        gd = dirs.index((-db[0], -db[1]))
        openq = [(0, 0, start, sd)]
        best = {(start, sd): 0}
        prev = {}
        endstate = None
        while openq:
            f, g, cell, di = heapq.heappop(openq)
            if cell == goal:
                endstate = (cell, di)
                break
            if g > best.get((cell, di), 1e18):
                continue
            for nd, (dx, dy) in enumerate(dirs):
                if (dx, dy) == (-dirs[di][0], -dirs[di][1]):
                    continue
                ni, nj = cell[0] + dx, cell[1] + dy
                if not (0 <= ni < self.nx and 0 <= nj < self.ny):
                    continue
                if self.block[ni][nj] and (ni, nj) != goal:
                    continue
                kept = (ni, nj) in self.keep and (ni, nj) not in mine
                if kept and hard:
                    continue
                axis = "h" if dx else "v"
                step = 1 + self.cost((ni, nj), axis, nets, grp) + (4 if nd != di else 0) + (40 if kept else 0)
                if (ni, nj) == goal and nd != gd:
                    step += 6
                ng = g + step
                if ng < best.get(((ni, nj), nd), 1e18):
                    best[((ni, nj), nd)] = ng
                    prev[((ni, nj), nd)] = (cell, di)
                    h = abs(ni - goal[0]) + abs(nj - goal[1])
                    heapq.heappush(openq, (ng + h, ng, (ni, nj), nd))
        if not endstate:
            raise RuntimeError(f"{self.m.key}: no route for {rid} ({a} to {b})")
        path = [endstate[0]]
        st = endstate
        while st in prev:
            st = prev[st]
            path.append(st[0])
        path.reverse()
        cells = ca + path[1:] + list(reversed(cb[:-1]))
        for k in range(1, len(cells)):
            (i0, j0), (i1, j1) = cells[k - 1], cells[k]
            axis = "h" if i0 != i1 else "v"
            for c in ((i0, j0), (i1, j1)):
                self.occ.setdefault(c, []).append((axis, rid, nets, grp))
        for k in range(1, len(cells) - 1):
            (i0, j0), (i1, j1), (i2, j2) = cells[k - 1], cells[k], cells[k + 1]
            if (i1 - i0, j1 - j0) != (i2 - i1, j2 - j1):
                self.bends.setdefault(cells[k], []).append((rid, nets))
        pts = [(c[0] * G, c[1] * G) for c in cells]
        pts[0] = self.m.term[a][:2]
        pts[-1] = self.m.term[b][:2]
        return straighten(pts)


def straighten(pts):
    if len(pts) > 2:
        (x0, y0), (x1, y1) = pts[0], pts[1]
        if pts[1][0] == pts[2][0]:
            pts[1] = (x1, y0)
        else:
            pts[1] = (x0, y1)
        (xa, ya), (xb, yb) = pts[-1], pts[-2]
        if pts[-2][0] == pts[-3][0]:
            pts[-2] = (xb, ya)
        else:
            pts[-2] = (xa, yb)
    out = [pts[0]]
    for p in pts[1:]:
        if p == out[-1]:
            continue
        if len(out) >= 2 and (out[-2][0] == out[-1][0] == p[0] or out[-2][1] == out[-1][1] == p[1]):
            out[-1] = p
        else:
            out.append(p)
    return out


def d_of(pts):
    s = f"M{pts[0][0]:g},{pts[0][1]:g}"
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        s += f" H{x1:g}" if y0 == y1 else (f" V{y1:g}" if x0 == x1 else f" L{x1:g},{y1:g}")
    return s


# ---------- the parts ----------
NAMES = {"hw": "Hot water switch", "brew": "Brew switch", "steam": "Steam switch", "lamp": "Heating lamp",
         "pwr": "Power switch", "boiler": "Boiler: element, safety thermostat and ground", "sol": "3-way solenoid valve",
         "pump": "Pump", "inlet": "Power inlet", "bt": "Brew thermostat", "st": "Steam thermostat",
         "cap": "Caption"}
NOTES = {
    "hw": "Hot water on joins its line pole, sending line to the pump alone, so the 3-way valve stays shut. Its neutral pole only feeds its own lamp.",
    "brew": "Brew on joins both poles: the line pole feeds the pump and the 3-way valve's coil, and the neutral pole completes the valve's return.",
    "steam": "Steam on joins the point between the two thermostats to neutral, so the brew thermostat no longer stops the element and the steam thermostat takes over. Its line pole only feeds its own lamp.",
    "lamp": "Across the safety thermostat and element, from switched line to the element terminal it shares with the steam thermostat, so it lights while the element heats. From V5 on it's a round LED beside the power switch.",
    "pwr": "It breaks both line and neutral, one per pole, with its own lamp inside. The E model has a push button and an energy-saver module instead, not drawn here.",
    "boiler": "One element, with the 165 °C safety thermostat in series on its line side. The ground spade stands in for the frame earth point GaggiMate's diagram draws.",
    "sol": "Fed with the pump while brewing; its return runs through the brew switch's neutral pole.",
    "pump": "Fed from the brew or hot water switch. Its return runs through a thermal fuse on some models.",
    "inlet": "Line, neutral and earth come in here.",
    "bt": "In series after the steam thermostat, on the neutral side: it holds brew temperature. Out on every Gaggiuino install: the PCB takes over, reading a thermocouple screwed into one of the boiler-top holes a thermostat's clamp used.",
    "st": "In series between the element and the brew thermostat. The new harness doesn't wire it, so it can stay in the boiler unwired or come out.",
}


def fac_thermostat(pid, cx, cy, w1, w2):
    """a stock thermostat on the boiler top: a hexagon and two spades leaving upward, labelled in two short lines"""
    s = (f'<polygon points="{cx - 8},{cy - 13} {cx + 8},{cy - 13} {cx + 15},{cy} {cx + 8},{cy + 13} {cx - 8},{cy + 13} {cx - 15},{cy}" class="term"/>'
         f'<circle cx="{cx}" cy="{cy}" r="4" class="inner"/>'
         + spade(cx - 7, cy - 17, 6, 9) + spade(cx + 7, cy - 17, 6, 9)
         + text(cx, cy + 26, w1, "tiny ring") + text(cx, cy + 37, w2, "tiny ring"))
    return s


def path_ends(d):
    """the first and last points of an orthogonal path"""
    x = y = None
    pts = []
    for c, a, b in re.findall(r"([MHVL])\s*([-\d.]+)(?:,([-\d.]+))?", d):
        if c in "ML":
            x, y = float(a), float(b)
        elif c == "H":
            x = float(a)
        else:
            y = float(a)
        pts.append((x, y))
    return [pts[0], pts[-1]]


def relations(m, runs, names, paths, reuse, sh=False, tol=32):
    """for each stock connection, what the harness puts at each of its ends. Both drawings share one layout, so each
    end of each drawn harness path is matched to the nearest stock terminal within tol px (switch spades sit 40 px
    apart, so the nearest one is the right one). With the Shelly the power switch's N pole stays empty. With the Shelly, the reusable inlet leads need a two-wire spade at the
    inlet end (runs.py), and AC2's other end goes into the BN2 splice; nbn says so. For the Out of the box view's Compare."""
    at = {}
    for rid, ds in paths.items():
        for d in ([ds] if isinstance(ds, str) else ds):
            for (px, py) in path_ends(d):
                best, bd = None, tol + 1
                for t, (x, y, _, _) in m.term.items():
                    if sh and t in ("pwr:Nin", "pwr:Nout"):
                        continue  # with the Shelly the N pole stays empty: what sits there is the BN2 splice
                    dd = max(abs(px - x), abs(py - y))
                    if dd < bd:
                        best, bd = t, dd
                if best and rid not in at.setdefault(best, []):
                    at[best].append(rid)
    rel = {}
    for r in runs:
        es = []
        for t in (r["a"], r["b"]):
            part = m.term[t][3]
            es.append({"t": names[t], "k": part if part in ("bt", "st") else "term", "now": list(at.get(t, []))})
        o = {"ends": es}
        if r["id"] in reuse:
            o["nb"] = reuse[r["id"]]
            if sh and reuse[r["id"]] in ("AC1", "AC2"):
                o["nbn"] = ("with a new two-wire spade at the inlet end, shared with " + ("SH1" if reuse[r["id"]] == "AC1" else "SH4")
                            + ("; its other end goes into the BN2 neutral splice where the N pole was" if reuse[r["id"]] == "AC2" else ""))
        rel[r["id"]] = o
    return rel


def build():
    fd = json.load(open(os.path.join(HERE, "factory-data.json")))
    m = Map("silvia-factory")
    parts = part_svgs(factory=True)
    parts += [("bt", fac_thermostat("bt", 216, 594, "brew", "thermostat")),
              ("st", fac_thermostat("st", 180, 650, "steam", "thermostat"))]
    # terminals: switch poles leave sideways (the neutral pole, drawn left, to the left; the line pole to the right)
    for pid, cx in (("hw", 100), ("brew", 260), ("steam", 420)):
        m.t(f"{pid}:Nin", cx - 42, 75, "l", pid)
        m.t(f"{pid}:Nout", cx - 42, 115, "l", pid)
        m.t(f"{pid}:Lin", cx + 42, 75, "r", pid)
        m.t(f"{pid}:Lout", cx + 42, 115, "r", pid)
        m.obs.append((cx - 55, 50, cx + 55, 140, pid))
        m.obs.append((cx - 40, 26, cx + 40, 46, pid))
    m.t("lamp:L", 575, 75, "r", "lamp")
    m.t("lamp:N", 545, 115, "l", "lamp")
    m.obs.append((535, 50, 585, 140, "lamp"))
    m.obs.append((515, 26, 605, 46, "lamp"))
    m.t("pwr:Lout", 678, 75, "l", "pwr")
    m.t("pwr:Lin", 678, 115, "l", "pwr")
    m.t("pwr:Nout", 762, 75, "r", "pwr")
    m.t("pwr:Nin", 762, 115, "r", "pwr")
    m.obs.append((665, 50, 775, 140, "pwr"))
    m.obs.append((690, 26, 750, 46, "pwr"))
    # the boiler: wires may cross it, at a cost, but not its parts
    m.t("sf:1", 127, 560, "u", "sf")
    m.t("sf:2", 95, 560, "u", "sf")
    m.obs.append((81, 562, 141, 588, "sf"))
    m.obs.append((70, 596, 166, 612, "sflabel"))
    m.t("el:1", 120, 700, "l", "el")
    m.t("el:2", 260, 700, "r", "el")
    m.obs.append((142, 686, 246, 714, "el"))
    m.obs.append((166, 720, 214, 736, "ellabel"))
    m.t("gnd", 306, 610, "r", "gnd")
    for pid, cx, cy in (("bt", 216, 594), ("st", 180, 650)):
        m.t(pid + ":a", cx - 7, cy - 21, "u", pid)
        m.t(pid + ":b", cx + 7, cy - 21, "u", pid)
        m.obs.append((cx - 16, cy - 22, cx + 16, cy + 14, pid))
        m.obs.append((cx - 26, cy + 16, cx + 26, cy + 40, pid))
    m.obs.append((160, 790, 222, 820, "boilerlabel"))
    m.soft.append((86, 556, 294, 764, 1))
    m.t("sol:gnd", 420, 556, "u", "sol")
    m.t("sol:N", 400, 648, "d", "sol")
    m.t("sol:coil", 440, 648, "d", "sol")
    m.obs.append((380, 556, 460, 644, "sol"))
    m.t("pump:N", 524, 556, "u", "pump")
    m.t("pump:L", 580, 556, "u", "pump")
    m.obs.append((500, 556, 600, 650, "pump"))
    for nm, x in (("L", 656), ("E", 720), ("N", 786)):
        m.t("inlet:" + nm, x, 783, "u", "inlet")
    m.obs.append((630, 783, 812, 840, "inlet"))
    runs = fd["runs"]
    for r in runs:
        for t in (r["a"], r["b"]):
            assert t in m.term, f"factory {r['id']}: no terminal {t}"
    used = {t for r in runs for t in (r["a"], r["b"])}
    rt = Router(m, used)
    order = {"L": 0, "H": 1, "N": 2, "E": 3}

    def dist(r):
        (ax, ay), (bx, by) = m.term[r["a"]][:2], m.term[r["b"]][:2]
        return abs(ax - bx) + abs(ay - by)
    jobs = sorted(runs, key=lambda r: (order.get(r["sys"], 5), dist(r)))
    got = {}
    for r in jobs:
        got[r["id"]] = rt.route(r["a"], r["b"], r["id"], r["sys"])
    for _ in range(2):
        rt.fallback = []
        for r in jobs:
            rt.unroute(r["id"])
            got[r["id"]] = rt.route(r["a"], r["b"], r["id"], r["sys"])
    if rt.fallback:
        print("  silvia factory: squeezed past another terminal:", ", ".join(rt.fallback))
    pof = {t: v[3] for t, v in m.term.items()}
    pof.update({k: "boiler" for k in ("sf:1", "sf:2", "el:1", "el:2", "gnd")})
    col = {"red": "#C2412F", "orange": "#E08A1E", "blue": "#2F5FB3", "white": "#F4F4F2", "black": "#1B1D20",
           "yellow": "#E3C21A", "brown": "#7A4A2A", "grey": "#8C939A", "yellowgreen": "#7DA82E"}
    o = [f'<svg viewBox="0 0 {W} {H}" class="dia fac" role="img" aria-labelledby="fac-title" xmlns="http://www.w3.org/2000/svg">',
         '<title id="fac-title">The Silvia\'s stock circuit, out of the box, on the harness drawing\'s layout: after GaggiMate\'s Silvia diagram, a community drawing. Tap a wire or a part.</title>',
         '<g class="parts">']
    o.extend(f'<g class="ap" data-ap="{pid}">{g}</g>' for pid, g in parts)
    o.append('</g><g class="phits">')
    boxes = {"hw": (45, 28, 155, 142), "brew": (205, 28, 315, 142), "steam": (365, 28, 475, 142), "lamp": (533, 28, 587, 142),
             "pwr": (665, 28, 775, 142), "boiler": (78, 548, 302, 822), "sol": (380, 560, 460, 640), "pump": (500, 560, 600, 650),
             "inlet": (630, 790, 812, 840), "bt": (198, 570, 234, 612), "st": (162, 626, 198, 668)}
    for pid, (x0, y0, x1, y1) in boxes.items():
        o.append(f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" rx="8" class="phit" data-part="{pid}"><title>{esc(NAMES[pid])}</title></rect>')
    o.append('</g><g class="wires">')
    for r in sorted(runs, key=lambda r: {"E": 0, "N": 1, "H": 2, "L": 3}.get(r["sys"], 0)):
        a, b = pof[r["a"]], pof[r["b"]]
        o.append(f'<g class="run s-{r["sys"]} fw" data-run="{r["id"]}" data-a="{a}" data-b="{b}" style="--wc:{col.get(r["color"], "#8C939A")}">')
        d = d_of(got[r["id"]])
        for k in ("halo", "wire", "flow", "hit"):
            o.append(f'<path d="{d}" class="{k}"/>')
        o.append('</g>')
    o.append('</g></svg>')
    names = {"inlet:L": "Power inlet, L", "inlet:N": "Power inlet, N", "inlet:E": "Power inlet, earth",
             "pwr:Lin": "Power switch, L pole outer spade", "pwr:Lout": "Power switch, L pole center spade",
             "pwr:Nin": "Power switch, N pole outer spade", "pwr:Nout": "Power switch, N pole center spade",
             "lamp:L": "Heating lamp, L spade", "lamp:N": "Heating lamp, N spade",
             "sf:1": "Safety thermostat (165 °C)", "sf:2": "Safety thermostat (165 °C)",
             "el:1": "Element, terminal 1", "el:2": "Element, terminal 2", "gnd": "Boiler ground spade",
             "bt:a": "Brew thermostat", "bt:b": "Brew thermostat", "st:a": "Steam thermostat", "st:b": "Steam thermostat",
             "sol:gnd": "3-way valve, ground spade", "sol:N": "3-way valve, N spade", "sol:coil": "3-way valve, coil spade",
             "pump:N": "Pump, return terminal", "pump:L": "Pump, coil terminal"}
    for pid, nm in (("hw", "Hot water switch"), ("brew", "Brew switch"), ("steam", "Steam switch")):
        # neither source shows which spade is which on these three, so the names say supply and load, not center and outer
        names[pid + ":Lin"] = nm + ", line pole, supply side"
        names[pid + ":Lout"] = nm + ", line pole, load side"
        names[pid + ":Nin"] = nm + ", neutral pole, supply side"
        names[pid + ":Nout"] = nm + ", neutral pole, load side"
    meta = {r["id"]: {"color": r["color"], "sys": r["sys"], "what": r["what"], "frm": names[r["a"]], "to": names[r["b"]], "n": [r["a"], r["b"]]} for r in runs}
    rel = [relations(m, runs, names, PATHS, fd.get("reuse", {})), relations(m, runs, names, PATHS_SH, fd.get("reuse", {}), sh=True)]
    ends = {r["id"]: [pof[r["a"]], pof[r["b"]]] for r in runs}
    return {"svg": "".join(o), "runs": meta, "ends": ends,
            "parts": {pid: {"name": NAMES[pid], "note": NOTES.get(pid, "")} for pid in boxes},
            "name": fd["name"], "src": fd["src"], "srcname": fd["srcname"], "src2": fd["src2"], "src2name": fd["src2name"],
            "reuse": fd.get("reuse", {}), "rel": rel,
            "out": ["bt", "st"]}


if __name__ == "__main__":
    f = build()
    print(len(f["runs"]), "factory wires,", len(f["svg"]) // 1024, "KB")
