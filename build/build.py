"""Generate the four install pages from their templates.

  python3 build.py [wiring labels checks runbook]   -> claude.ai artifact versions next to build/
  (site.py calls render(name, "site") for the GitHub Pages versions)

runs.py is the single source of truth for harness runs; the wiring, labels and cut list pages use it.
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from runs import RUNS, SYS, CONNECTORS
from wiring_svg import build as build_svg

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
LINKS_FILE = os.path.join(HERE, "links.json")
ART = json.load(open(LINKS_FILE)) if os.path.exists(LINKS_FILE) else {}
SITE = {"WIRING": "wiring.html", "LABELS": "wire-labels.html", "CHECKS": "power-on-checks.html",
        "RUNBOOK": "runbook.html", "CUTLIST": "cut-list.html", "TROUBLE": "troubleshooting.html",
        "WHICH": "which-silvia.html", "LED": "led-mod.html", "TRACKER": "parts-tracker.html",
        "BUDGET": "budget.html", "USED": "used-checklist.html", "HOME": "index.html"}
ART_EXTRA = {"LED": "https://claude.ai/artifact/YammPPcWMq2CmaBdT3L1km",
             "TRACKER": "https://claude.ai/artifact/AeEeTNkB5mBChPXBAGSjVG",
             "BUDGET": "https://claude.ai/artifact/ArT3ks46jbJ4KEjXbDwcX7",
             "USED": "https://claude.ai/artifact/M1XvJ1RVFmLVkTG2qErFJf"}
FILES = {"wiring": ("wiring.tpl.html", "silvia-wiring-reference.html"),
         "labels": ("labels.tpl.html", "silvia-wire-labels.html"),
         "checks": ("checks.tpl.html", "silvia-power-on-checks.html"),
         "runbook": ("runbook.tpl.html", "silvia-install-runbook.html")}


def runs_json():
    out = []
    for r in RUNS:
        d = dict(r)
        for k, v in (("mm", None), ("lenNote", ""), ("hot", ""), ("note", ""), ("k", ["", ""]), ("color", "")):
            d.setdefault(k, v)
        out.append(d)
    return json.dumps(out, ensure_ascii=False)


def check_index():
    """Every power-on check's id and title, for the wiring map's back-links (wiring-refs.js)."""
    src = open(os.path.join(HERE, "checks.tpl.html")).read()
    return json.dumps([[m.group(1), m.group(2).replace("\\'", "'")] for m in re.finditer(r"\{id:'([a-h]\d+)',t:'((?:[^'\\]|\\.)*)'", src)], ensure_ascii=False)


def render(name, mode="artifact"):
    tpl, _ = FILES[name]
    s = open(os.path.join(HERE, tpl)).read()
    for _ in range(4):  # %%INCLUDE:file%% pulls in a file from build/, which may include others
        s = re.sub(r"%%INCLUDE:([A-Za-z0-9_.-]+)%%", lambda m: open(os.path.join(HERE, m.group(1))).read(), s)
    links = SITE if mode == "site" else dict(ART_EXTRA, **ART)
    for k in SITE:
        s = s.replace("%%LINK_" + k + "%%", links.get(k, "#"))
    s = s.replace("%%MODE%%", mode)
    extra = {}
    if name == "wiring":
        extra = {"CHECK_INDEX": check_index(), "SVG": build_svg(), "RUNS": runs_json(), "SYS": json.dumps(SYS), "CONN": json.dumps(CONNECTORS, ensure_ascii=False)}
    elif name == "labels":
        extra = {"RUNS": runs_json(), "CORE": open(os.path.join(HERE, "labels-core.js")).read()}
    for k, v in extra.items():
        s = s.replace("%%" + k + "%%", v)
    return s


if __name__ == "__main__":
    targets = [a for a in sys.argv[1:] if a in FILES] or list(FILES)
    for t in targets:
        open(os.path.join(OUT, FILES[t][1]), "w").write(render(t, "artifact"))
    print("built", targets)
