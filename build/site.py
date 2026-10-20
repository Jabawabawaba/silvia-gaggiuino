"""Build the GitHub Pages site.

Usage: python3 site.py [REPO_URL]
Output: ../site/  (copy its contents to the repo root; GitHub Pages serves from root with .nojekyll)

Pages come from three places:
- the four install pages, rendered from templates in build/ by build.py's render(),
- site-only templates in build/ (home, which Silvia, cut list, troubleshooting), and
- four standalone pages (budget, used checklist, parts tracker, LED mod), read from build/pages/
  when it exists (as it does in the published repo) or else from next to build/.
"""
import json, os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(HERE)
OUT = os.path.join(SRC, "site")
REPO_URL = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else ""
_gh = re.match(r"https://github\.com/([^/]+)/([^/]+)$", REPO_URL)
# GitHub Pages address for a repo: https://owner.github.io/repo/
SITE_URL = f"https://{_gh.group(1).lower()}.github.io/{_gh.group(2)}/" if _gh else ""
sys.path.insert(0, HERE)

# (artifact id or None, source, site file, nav label, group)
PAGES = [
    (None, "conversion.tpl.html", "conversion.html", "The conversion", "learn"),
    (None, "learn-silvia.tpl.html", "how-silvia-works.html", "How the Silvia works", "learn"),
    (None, "learn-gaggiuino.tpl.html", "how-gaggiuino-works.html", "How Gaggiuino works", "learn"),
    (None, "glossary.tpl.html", "glossary.html", "Glossary", "learn"),
    ("ArT3ks46jbJ4KEjXbDwcX7", "silvia-build-budget.html", "budget.html", "Budget", "plan"),
    ("M1XvJ1RVFmLVkTG2qErFJf", "used-silvia-checklist.html", "used-checklist.html", "Used Silvia check", "plan"),
    (None, "which.tpl.html", "which-silvia.html", "Which Silvia", "plan"),
    ("AeEeTNkB5mBChPXBAGSjVG", "silvia-parts-tracker.html", "parts-tracker.html", "Parts tracker", "plan"),
    (None, "test-yourself.tpl.html", "test-yourself.html", "Test yourself", "plan"),
    ("Gq87FYxKzHytcFKB93RWDL", "silvia-install-runbook.html", "runbook.html", "Runbook", "install"),
    (None, "part-guides.tpl.html", "part-guides.html", "Part guides", "install"),
    ("D9WraKUFqQPNH1bvFE5VPV", "silvia-wiring-reference.html", "wiring.html", "Wiring", "install"),
    (None, "cutlist.tpl.html", "cut-list.html", "Cut list", "install"),
    ("M4rDRUCjSCyrQEubSFssd6", "silvia-wire-labels.html", "wire-labels.html", "Wire labels", "install"),
    ("S23pyiHZ6rBDpK2Dk5tKF3", "silvia-power-on-checks.html", "power-on-checks.html", "Power-on checks", "install"),
    (None, "trouble.tpl.html", "troubleshooting.html", "Troubleshooting", "after"),
    ("YammPPcWMq2CmaBdT3L1km", "silvia-switch-led-mod.html", "led-mod.html", "LED switch mod", "after"),
]
# Reference docs rendered to pages from build/docs-*.md (kept as Markdown in docs/ for the repo view)
DOCS = [("docs-silvia-specifics.md", "silvia-specifics.html", "Silvia deltas from the Gaggia install"),
        ("docs-discord-notes.md", "discord-notes.html", "Discord thread notes")]


def render_doc(src, kind):
    import html as H
    import md2html
    md2html.PAGES = {p[2] for p in PAGES} | {"index.html"} | {d[1] for d in DOCS}
    title, body = md2html.title_and_body(open(os.path.join(HERE, src)).read())
    s = open(os.path.join(HERE, "doc.tpl.html")).read()
    s = s.replace("%%DOC_TITLE%%", H.escape(title)).replace("%%DOC_KIND%%", H.escape(kind)).replace("%%DOC_BODY%%", body)
    return s.replace("%%BASECSS%%", open(os.path.join(HERE, "base.css")).read())


LINKMAP = {"https://claude.ai/artifact/" + a: f for a, _, f, _, _ in PAGES if a}
LOCAL = {"%%LINK_" + k + "%%": v for k, v in {
    "WIRING": "wiring.html", "LABELS": "wire-labels.html", "CHECKS": "power-on-checks.html",
    "RUNBOOK": "runbook.html", "CUTLIST": "cut-list.html", "TROUBLE": "troubleshooting.html",
    "WHICH": "which-silvia.html", "LED": "led-mod.html", "TRACKER": "parts-tracker.html",
    "BUDGET": "budget.html", "USED": "used-checklist.html", "HOME": "index.html"}.items()}

NAV_CSS = """
<style>
.site-nav{position:sticky;top:env(safe-area-inset-top,0px);z-index:50;font:500 14px/1.35 "Barlow",system-ui,sans-serif;background:var(--surface,#F9FAFA);color:var(--ink,#16191C);border-bottom:1px solid var(--line,#CBD0D5);transition:transform .22s ease,box-shadow .22s ease}
/* it slides away while you read down the page and comes back as soon as you scroll up a little (NAV_JS) */
.site-nav.nav-hide{transform:translateY(calc(-100% - env(safe-area-inset-top,0px)))}
.site-nav.nav-float{box-shadow:0 6px 18px rgba(0,0,0,.16)}
@media (prefers-reduced-motion:reduce){.site-nav{transition:none}}
.site-nav .in{max-width:1300px;margin:0 auto;padding:8px max(16px,env(safe-area-inset-right,0px)) 8px max(16px,env(safe-area-inset-left,0px));display:flex;align-items:center;gap:6px 16px;flex-wrap:wrap}
.site-nav a{color:var(--ink,#16191C);text-decoration:none;padding:4px 0;white-space:nowrap}
.site-nav a:hover,.site-nav a[aria-current]{text-decoration:underline;text-underline-offset:3px}
.site-nav .brand{font-weight:700;letter-spacing:.01em;padding:8px 0}
.site-nav .brand small{font-weight:500;color:var(--muted,#59616A);margin-left:6px;font-size:12px}
.site-nav .nav-links{display:flex;flex-wrap:wrap;align-items:center;gap:2px 16px;flex:1 1 auto;min-width:0}
.site-nav .grp{display:inline-flex;flex-wrap:wrap;align-items:center;gap:2px 12px}
.site-nav .gl{font:600 10.5px var(--f-mono,ui-monospace,monospace);letter-spacing:.1em;text-transform:uppercase;color:var(--muted,#59616A)}
.site-nav button{font:inherit;color:inherit}
.nav-toggle{display:none;appearance:none;border:1px solid var(--line,#CBD0D5);background:var(--surface,#F9FAFA);border-radius:8px;padding:6px 12px;cursor:pointer;margin-left:auto}
.nav-toggle[aria-expanded="true"]{background:var(--ink,#16191C);color:var(--bg,#ECEEF0);border-color:var(--ink,#16191C)}
.mchip{appearance:none;border:1px solid var(--accent,#D98400);background:var(--accent-soft,#F4E1C0);color:var(--accent-ink,#965300);border-radius:999px;padding:6px 12px;min-height:36px;cursor:pointer;font-weight:600;white-space:nowrap}
.mchip b{color:var(--ink,#16191C);font-weight:600;margin-left:4px}
/* desktop: brand and Your Silvia on the first row, every page on the second */
@media (min-width:1061px){
  .site-nav .nav-links{order:3;flex-basis:100%}
  .mchip{margin-left:auto}
}
/* tablets and phones: brand, Your Silvia and the Pages button on one row; the page list opens below */
@media (max-width:1060px){
  .site-nav .brand{order:1}
  .mchip{order:2;margin-left:auto;min-height:40px}
  .nav-toggle{display:inline-block;order:3;margin-left:0;min-height:40px}
  .site-nav .nav-links{display:none;order:5;flex-basis:100%;flex-direction:column;align-items:flex-start;gap:6px;padding:6px 0 6px}
  .site-nav .nav-links.open{display:flex;position:absolute;left:0;right:0;top:100%;background:var(--surface,#F9FAFA);border-top:1px solid var(--line,#CBD0D5);border-bottom:1px solid var(--line,#CBD0D5);box-shadow:0 12px 24px rgba(0,0,0,.18);padding:4px max(16px,env(safe-area-inset-right,0px)) 12px max(16px,env(safe-area-inset-left,0px));max-height:calc(100vh - 120px);max-height:calc(100svh - 120px);overflow-y:auto;overscroll-behavior:contain}
  .site-nav .grp{gap:0 18px}
  .site-nav .nav-links a{display:inline-flex;align-items:center;min-height:40px}
}
@media (max-width:480px){
  .site-nav .in{gap:6px 10px}
  .site-nav .brand small{display:none}
  .mchip:not(.set) #mchip-l{display:none}
  .mchip.set .mchip-k{display:none}
  .mchip.set b{margin-left:0}
}
/* the page list (phones) and the Your Silvia panel open over the page, so nothing below them jumps */
.mpanel{position:absolute;left:0;right:0;top:100%;border-top:1px solid var(--line,#CBD0D5);border-bottom:1px solid var(--line,#CBD0D5);background:var(--surface,#F9FAFA);box-shadow:0 12px 24px rgba(0,0,0,.18);max-height:calc(100vh - 120px);max-height:calc(100svh - 120px);overflow-y:auto;overscroll-behavior:contain}
.mpanel .in{display:grid;gap:12px;padding-block:14px 16px}
/* behind an open page list or panel: dims the page, and a tap on it closes them instead of following whatever link was under it */
.nav-scrim{position:fixed;inset:0;z-index:49;background:rgba(10,14,18,.3);-webkit-tap-highlight-color:transparent}
.mrow{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px}
.mk{font:600 11px var(--f-mono,ui-monospace,monospace);letter-spacing:.1em;text-transform:uppercase;color:var(--muted,#59616A);min-width:7ch}
.mseg{display:inline-flex;flex-wrap:wrap;border:1px solid var(--line,#CBD0D5);border-radius:999px;overflow:hidden}
.mseg button{appearance:none;border:0;border-right:1px solid var(--line,#CBD0D5);background:var(--surface,#F9FAFA);padding:7px 13px;cursor:pointer;font-weight:600;min-height:36px}
.mseg button:last-child{border-right:0}
.mseg button[aria-pressed="true"]{background:var(--ink,#16191C);color:var(--bg,#ECEEF0)}
.mseg button[disabled]{opacity:.4;cursor:default}
.mh{font-size:13px;color:var(--muted,#59616A)}
#m-summary{margin:0;font-size:14px;color:var(--muted,#59616A);max-width:80ch}
.mact{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px}
.mact a{color:var(--accent-ink,#965300);text-decoration:underline}
.mact button{appearance:none;border:1px solid var(--line,#CBD0D5);background:var(--surface,#F9FAFA);border-radius:8px;padding:6px 12px;cursor:pointer}
.mact button#m-done{background:var(--ink,#16191C);color:var(--bg,#ECEEF0);border-color:var(--ink,#16191C)}
.vtag{display:inline-block;font:600 10.5px/1 var(--f-mono,ui-monospace,monospace);letter-spacing:.06em;text-transform:uppercase;padding:4px 6px;border-radius:4px;background:var(--accent-soft,#F4E1C0);color:var(--accent-ink,#965300);vertical-align:2px;margin-left:6px;white-space:nowrap}
.site-foot{font:400 13.5px/1.5 "Barlow",system-ui,sans-serif;color:var(--muted,#59616A);border-top:1px solid var(--line,#CBD0D5);background:var(--bg,#ECEEF0)}
.site-foot .in{max-width:1300px;margin:0 auto;padding:16px max(16px,env(safe-area-inset-right,0px)) 28px max(16px,env(safe-area-inset-left,0px));display:grid;gap:6px}
.site-foot a{color:var(--accent-ink,#965300)}
.site-foot p{margin:0;max-width:95ch}
/* every page ends with the full page list, so the next page is one tap away at the bottom too */
.foot-nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 24px;min-width:0;padding-bottom:14px;margin-bottom:8px;border-bottom:1px solid var(--line,#CBD0D5)}
@media (min-width:640px){.foot-nav{grid-template-columns:repeat(4,minmax(0,180px))}}
.foot-nav .fn-home{grid-column:1/-1;justify-self:start;font-weight:700;color:var(--ink,#16191C);text-decoration:none;padding:4px 0}
.foot-nav .fn-g{display:flex;flex-direction:column;align-items:flex-start;gap:0;min-width:0}
.foot-nav .gl{font:600 11.5px var(--f-mono,ui-monospace,monospace);letter-spacing:.1em;text-transform:uppercase;color:var(--muted,#59616A);margin-bottom:2px}
.foot-nav .fn-g a{color:var(--ink,#16191C);text-decoration:none;padding:3px 0}
.foot-nav a:hover,.foot-nav a[aria-current]{text-decoration:underline;text-underline-offset:3px}
@media (pointer:coarse){.foot-nav .fn-g a,.foot-nav .fn-home{padding:8px 0}}
@media print{.site-nav,.site-foot,.swipe-hint,.nav-scrim{display:none!important}}
/* phones: inputs fill their boxes, small text buttons get a bigger tap area, wide drawings say they scroll */
.read input,.money input,.unitbox input{align-self:stretch}
@media (pointer:coarse){
  .linkbtn{min-height:40px}
  summary{min-height:40px}
  .mact a,.foot .links a{display:inline-block;padding:10px 0}
  input.mm{min-height:36px}
  input[type=range]{height:32px}
}
@media (max-width:600px){
  .plate{font-size:12px}
  .vtag{font-size:11px}
}
.swipe-hint{margin:6px 0 0;font:500 12.5px "Barlow",system-ui,sans-serif;color:var(--muted,#59616A);display:flex;align-items:center;gap:6px}
.swipe-hint::before{content:"";width:18px;height:10px;background:linear-gradient(90deg,transparent 0 3px,currentColor 3px 15px,transparent 15px) center/100% 2px no-repeat;opacity:.7}
</style>"""


def nav(current):
    def link(f, label):
        cur = ' aria-current="page"' if f == current else ""
        return f'<a href="{f}"{cur}>{label}</a>'
    groups = {"learn": [], "plan": [], "install": [], "after": []}
    for _, _, f, label, g in PAGES:
        groups[g].append(link(f, label))
    gl = {"learn": "Learn", "plan": "Plan", "install": "Install", "after": "After"}
    links = "".join(f'<span class="grp"><span class="gl">{gl[g]}</span>{"".join(groups[g])}</span>' for g in ("learn", "plan", "install", "after"))
    vers = "".join(f'<button type="button" data-mv="V{i}" aria-pressed="false">V{i}</button>' for i in range(1, 7))
    panel = ('<div class="mpanel" id="mpanel" hidden><div class="in">'
             f'<div class="mrow"><span class="mk">Version</span><div class="mseg" role="group" aria-label="Version">{vers}</div>'
             '<label class="mh" id="m-early-w" hidden><input type="checkbox" id="m-early"> Boiler made before May 2000</label></div>'
             '<div class="mrow"><span class="mk">Model</span><div class="mseg" role="group" aria-label="Model">'
             '<button type="button" data-mm="M" aria-pressed="false">M, manual off</button><button type="button" data-mm="E" aria-pressed="false">E, auto-off</button></div>'
             '<span class="mh" id="m-model-hint">E and M only exist from V5 on.</span></div>'
             '<div class="mrow"><span class="mk">Mains</span><div class="mseg" role="group" aria-label="Mains voltage">'
             '<button type="button" data-mvolt="120" aria-pressed="false">120 V</button><button type="button" data-mvolt="230" aria-pressed="false">230 V</button></div></div>'
             '<p id="m-summary"></p>'
             '<div class="mact"><a href="which-silvia.html">Not sure which you have? Identify your Silvia</a><button type="button" id="m-clear">Clear</button><button type="button" id="m-done">Done</button></div>'
             '</div></div>')
    return ('<nav class="site-nav" aria-label="Site"><div class="in">'
            '<a class="brand" href="index.html"' + (' aria-current="page"' if current == "index.html" else "") + '>Silvia × Gaggiuino<small>unofficial</small></a>'
            '<button type="button" class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="nav-links">Pages</button>'
            f'<div class="nav-links" id="nav-links">{links}</div>'
            '<button type="button" class="mchip" id="mchip" aria-expanded="false" aria-controls="mpanel" aria-label="Your Silvia: not set"><span class="mchip-k">Your Silvia</span><b id="mchip-l">Set it</b></button>'
            '</div>' + panel + '</nav><div class="nav-scrim" id="nav-scrim" hidden></div>')


def foot(current="index.html"):
    repo = f' · <a href="{REPO_URL}">Source and issues on GitHub</a>' if REPO_URL else ""
    def link(f, label):
        cur = ' aria-current="page"' if f == current else ""
        return f'<a href="{f}"{cur}>{label}</a>'
    gl = {"learn": "Learn", "plan": "Plan", "install": "Install", "after": "After"}
    groups = "".join('<div class="fn-g"><span class="gl">' + gl[g] + '</span>' + "".join(link(f, label) for _, _, f, label, pg in PAGES if pg == g) + '</div>'
                     for g in ("learn", "plan", "install", "after"))
    pages = ('<nav class="foot-nav" aria-label="All pages"><a class="fn-home" href="index.html"' + (' aria-current="page"' if current == "index.html" else "")
             + '>Silvia × Gaggiuino home</a>' + groups + '</nav>')
    return ('<footer class="site-foot"><div class="in">' + pages +
            '<p><strong>Mains voltage.</strong> This conversion puts your hands near 120/230 V wiring. Work only with the cord out, check everything with a meter before first power-on, and stop if anything here disagrees with the official Gaggiuino docs or your own reading of the machine. Nothing on this site has been reviewed by the Gaggiuino project. You are responsible for your own build.</p>'
            '<p>Unofficial community material for the Rancilio Silvia, built on the work of realNiche, Talon, Juun, mjr and others on the Gaggiuino Discord, and the official docs at <a href="https://gaggiuino.github.io/">gaggiuino.github.io</a>. Content is <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>, the same terms as realNiche\'s diagrams.'
            + repo + '</p></div></footer>')


HEAD = ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
        'body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style>')


def wrap(body, current):
    body = body.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "")
    for url, f in LINKMAP.items():
        body = body.replace(url, f)
    for k, v in LOCAL.items():
        body = body.replace(k, v)
    # site pages open each other in the same tab
    for f in [p[2] for p in PAGES] + ["index.html"]:
        body = body.replace(f'href="{f}" target="_blank" rel="noopener"', f'href="{f}"')
    m = re.search(r"<title>(.*?)</title>", body)
    title = m.group(1) if m else current
    if m:
        body = body.replace(m.group(0), "", 1)
    machine = "<script>" + open(os.path.join(HERE, "machine.js")).read() + "</script>"
    for old, new in STICKY:
        body = body.replace(old, new)
    return (HEAD + f"<title>{title}</title>" + NAV_CSS + "</head><body>" + nav(current) + TOP_JS + NAV_JS + machine + body + foot(current) + "</body></html>")


# Sticky bars inside pages sit below the nav while it's showing: --nav-cover is the nav's height then, 0 when it's away.
STICKY = [
    (".summary{position:sticky;top:calc(env(safe-area-inset-top,0px) + 16px)}",
     ".summary{position:sticky;top:calc(env(safe-area-inset-top,0px) + 16px + var(--nav-cover,0px));transition:top .22s ease}"),
    (".progress{position:sticky;top:env(safe-area-inset-top,0px);",
     ".progress{position:sticky;top:calc(env(safe-area-inset-top,0px) + var(--nav-cover,0px));transition:top .22s ease;"),
]

# The nav hides after a short scroll down and shows again after a short scroll up. It stays put near the top of the page,
# while its page list or Your Silvia panel is open, and while it has keyboard focus. A jump to a section on the page
# (a #link or the address bar) keeps it out of the way so it never covers the heading you jumped to.
# Overscroll at either end (the bounce on iPhones) is ignored, so the bounce at the bottom doesn't bring it back.
NAV_JS = ("<script>(function(){var nav=document.querySelector('.site-nav');if(!nav)return;"
          "var root=document.documentElement,last=0,acc=0,ticking=false,hidden=false,hold=0,touched=false;"
          "function h(){return nav.offsetHeight}"
          "function fv(a){try{return a.matches(':focus-visible')}catch(e){return true}}"
          "function busy(){var t=document.getElementById('nav-toggle'),p=document.getElementById('mpanel'),a=document.activeElement;"
          "return (t&&t.getAttribute('aria-expanded')==='true')||(p&&!p.hidden)||(a&&a!==document.body&&nav.contains(a)&&fv(a))}"
          "function cover(){root.style.setProperty('--nav-cover',hidden?'0px':h()+'px')}"
          "function set(hide){hidden=hide;nav.classList.toggle('nav-hide',hide);cover()}"
          "function Y(){var y=window.pageYOffset||0,m=Math.max(0,root.scrollHeight-innerHeight);return y<0?0:y>m?m:y}"
          "function update(){ticking=false;var y=Y(),d=y-last;last=y;nav.classList.toggle('nav-float',y>2);"
          "if(y<=h()||busy()){acc=0;if(hidden)set(false);return}"
          "if(Date.now()<hold||Math.abs(d)>innerHeight*0.8){acc=0;if(!hidden)set(true);return}"
          "if((d>0)!==(acc>0))acc=0;acc+=d;if(acc>10&&!hidden)set(true);else if(acc<-24&&hidden)set(false)}"
          "function jump(){last=Y();acc=0;if(last>h()&&!busy())set(true)}"
          "addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});"
          "addEventListener('hashchange',function(){hold=Date.now()+600;jump()});"
          "document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href*=\"#\"]');"
          "if(a&&a.hash&&a.pathname===location.pathname&&a.host===location.host){hold=Date.now()+600;setTimeout(jump,0)}},true);"
          "nav.addEventListener('focusin',function(e){if(hidden&&fv(e.target))set(false)});"
          "['wheel','touchstart','keydown'].forEach(function(t){addEventListener(t,function(){touched=true},{once:true,passive:true})});"
          "if(window.ResizeObserver)new ResizeObserver(function(){if(!hidden)cover()}).observe(nav);"
          "set(false);function init(){last=Y();if(location.hash&&last>h()&&!touched)set(true)}"
          "if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();addEventListener('load',init)})();</script>")


# A page opened from a link starts at its top, or at the section its link names (#...); Back and Forward are left alone.
# Besides the page's own scroll this brings the spot into view in whatever scrolls around the page, for viewers
# (like phone apps) that show it in a frame grown to its full height and would otherwise keep their old scroll.
# The second pass at load is skipped once the reader has started scrolling.
TOP_JS = ("<script>(function(){var n=(performance.getEntriesByType&&performance.getEntriesByType('navigation')[0])||{};"
          "if(n.type==='back_forward')return;var moved=false;"
          "['wheel','touchstart','keydown'].forEach(function(t){addEventListener(t,function(){moved=true},{once:true,passive:true})});"
          "function go(){if(moved)return;try{var h=location.hash;"
          "if(h){var t=document.getElementById(decodeURIComponent(h.slice(1)));if(t&&t.scrollIntoView)t.scrollIntoView({block:'start'});return}"
          "window.scrollTo(0,0);var e=document.body&&document.body.firstElementChild;if(e&&e.scrollIntoView)e.scrollIntoView({block:'start'})}catch(x){}}"
          "if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();"
          "addEventListener('load',go)})();</script>")


def page_src(name):
    p = os.path.join(HERE, "pages", name)
    return p if os.path.exists(p) else os.path.join(SRC, name)


def n_checks():
    """How many checks the power-on checklist has, so the home page and README never go stale."""
    return len(re.findall(r"\{id:'[a-z]\d+'", open(os.path.join(HERE, "checks.tpl.html")).read()))


# Stock thermostats for the circuit diagram (learn-ladder.js): Rancilio's opening points, illustrative closing points
THERMO = {"BREW_OPEN": "100", "BREW_CLOSE": "88", "STEAM_OPEN": "140", "STEAM_CLOSE": "128"}


def includes(s, depth=0):
    """Replace %%INCLUDE:file%% with the file's contents (files live in build/), and
    %%INCLUDE_MINI:name%% with the <figure id="mini-name"> from learn-minis.html."""
    if depth >= 5:
        return s
    def rep(m):
        return includes(open(os.path.join(HERE, m.group(1))).read(), depth + 1)
    s = re.sub(r"%%INCLUDE:([A-Za-z0-9_.-]+)%%", rep, s)
    if "%%FIG:" in s:
        figs = open(os.path.join(HERE, "learn-gg-figs.html")).read()
        def fig(m):
            f = re.search(r'<figure class="gfig" id="g-' + m.group(1) + r'">.*?</figure>', figs, re.S)
            assert f, "no fig " + m.group(1)
            return f.group(0)
        s = re.sub(r"%%FIG:([a-z]+)%%", fig, s)
    if "%%INCLUDE_MINI:" in s:
        minis = open(os.path.join(HERE, "learn-minis.html")).read()
        def mini(m):
            f = re.search(r'(<!--[^>]*-->\s*)?<figure class="mini" id="mini-' + m.group(1) + r'">.*?</figure>', minis, re.S)
            assert f, "no mini " + m.group(1)
            return f.group(0)
        s = re.sub(r"%%INCLUDE_MINI:([a-z]+)%%", mini, s)
    return s


def render_template(name):
    s = includes(open(os.path.join(HERE, name)).read())
    for k, v in THERMO.items():
        s = s.replace("%%" + k + "%%", v)
    if name == "glossary.tpl.html":
        import gen_glossary
        bar, body, n = gen_glossary.render()
        s = s.replace("%%GL_BAR%%", bar).replace("%%GL_BODY%%", body).replace("%%GL_COUNT%%", str(n)).replace("%%GL_IMGS%%", str(gen_glossary.image_count()))
    if name == "cutlist.tpl.html":
        from build import runs_json
        s = s.replace("%%RUNS%%", runs_json())
    s = s.replace("%%BASECSS%%", open(os.path.join(HERE, "base.css")).read())
    if "%%TEST_QUESTIONS%%" in s:
        # the Test yourself questions, without the fact-check notes (src), and what their review links need
        from build import check_index
        qs = [{k: v for k, v in q.items() if k != "src"} for q in json.load(open(os.path.join(HERE, "test-questions.json")))]
        s = s.replace("%%TEST_QUESTIONS%%", json.dumps(qs, ensure_ascii=False, separators=(",", ":")))
        s = s.replace("%%CHECK_INDEX%%", check_index())
    if "%%GLOSSARY_INDEX%%" in s:
        import gen_glossary
        s = s.replace("%%GLOSSARY_INDEX%%", json.dumps({gen_glossary.slug(e[0]): e[0] for e in gen_glossary.E}, ensure_ascii=False))
    if "%%STORY%%" in s:
        s = s.replace("%%STORY%%", open(os.path.join(HERE, "story.tpl.html")).read())
    s = s.replace("%%NCHECKS%%", str(n_checks()))
    if "%%GL_N%%" in s:
        import gen_glossary
        s = s.replace("%%GL_N%%", str(len(gen_glossary.E)))
    return s


def main():
    if os.path.exists(OUT):
        shutil.rmtree(OUT)
    os.makedirs(os.path.join(OUT, "docs"))
    import build as B
    gen_by_src = {v[1]: k for k, v in B.FILES.items()}
    for aid, src, dst, _, _ in PAGES:
        if src in gen_by_src:
            html = B.render(gen_by_src[src], "site")
        elif aid:
            html = open(page_src(src)).read()
        else:
            html = render_template(src)
        open(os.path.join(OUT, dst), "w").write(wrap(html, dst))
    open(os.path.join(OUT, "index.html"), "w").write(wrap(render_template("index.tpl.html"), "index.html"))
    for src, dst, kind in DOCS:
        open(os.path.join(OUT, dst), "w").write(wrap(render_doc(src, kind), dst))
    for f in ("README.md", "LICENSE", "CONTRIBUTING.md"):
        s = open(os.path.join(HERE, "site-" + f)).read().replace("%%SITE_URL%%", SITE_URL or "(site url)").replace("%%REPO_URL%%", REPO_URL or "(repo url)").replace("%%NCHECKS%%", str(n_checks())).replace("%%GL_N%%", str(__import__("gen_glossary").E.__len__()))
        open(os.path.join(OUT, f), "w").write(s)
    for f in ("silvia-specifics.md", "discord-notes.md"):
        shutil.copy(os.path.join(HERE, "docs-" + f), os.path.join(OUT, "docs", f))
    open(os.path.join(OUT, ".nojekyll"), "w").write("")
    if os.path.isdir(os.path.join(HERE, "img")):
        shutil.copytree(os.path.join(HERE, "img"), os.path.join(OUT, "img"))
    gen = os.path.join(OUT, "build")
    os.makedirs(gen)
    for f in sorted(os.listdir(HERE)):
        if f.endswith((".py", ".js", ".css", ".tpl.html", ".md", ".json")) or f == "site-LICENSE" or (f.startswith("learn-") and f.endswith(".html")):
            if f.startswith(("t-", "chk-", "test-", "shot", "svgtest", "gen-pdf", "story-shots", "page-shot", "toolkit-shot", "smoke", "sheet", "fontroute", "mobile-", "nav-shots", "el-shot", "cut-", "_", "ls-", "slice", "budget-test", "tracker-", "led-test", "edit_")) or f in ("runs.json", "wrap.py", "links.json", "chk.js"):
                continue
            shutil.copy(os.path.join(HERE, f), gen)
    if os.path.isdir(os.path.join(HERE, "img")):
        shutil.copytree(os.path.join(HERE, "img"), os.path.join(gen, "img"))
    os.makedirs(os.path.join(gen, "pages"))
    for aid, src, _, _, _ in PAGES:
        if aid and src not in gen_by_src:
            shutil.copy(page_src(src), os.path.join(gen, "pages", src))
    left = [f for f in os.listdir(OUT) if f.endswith(".html") and "%%" in open(os.path.join(OUT, f)).read()]
    assert not left, f"unreplaced tokens in {left}"
    print("site written to", OUT, f"({n_checks()} checks)")


if __name__ == "__main__":
    main()
