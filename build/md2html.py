"""Small Markdown-to-HTML converter for the docs pages (standard library only).

Handles what docs-*.md use: headings, paragraphs, bulleted and numbered lists (nested by two-space indents),
tables, fenced code (also inside a list item), horizontal rules, **bold**, [links](https://...), bare URLs and `code`.
A code span naming a site page (e.g. `which-silvia.html`) becomes a link to it.
"""
import html
import re

PAGES = set()


def inline(text):
    out = []
    for part in re.split(r"(`[^`]+`)", text):
        if len(part) > 1 and part.startswith("`") and part.endswith("`"):
            c = part[1:-1]
            code = "<code>" + html.escape(c, quote=False) + "</code>"
            out.append(f'<a href="{c}">{code}</a>' if c in PAGES else code)
            continue
        p = html.escape(part, quote=False)
        p = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", p)
        p = re.sub(r"\[([^\]]+)\]\((https?://[^)\s]+)\)", r'<a href="\2">\1</a>', p)
        # links to this site's own pages, such as [wiring map](wiring.html#map?part=ssr)
        p = re.sub(r"\[([^\]]+)\]\(([a-z0-9-]+\.html(?:#[^)\s]*)?)\)", r'<a href="\2">\1</a>', p)
        # bare URLs become links that show without the scheme (and never swallow a sentence's closing punctuation)
        p = re.sub(r'(?<!href=")(?<!">)(https?://[^\s<]*[^\s<.,;:)])', lambda m: f'<a href="{m.group(1)}">{re.sub(r"^https?://(www\.)?", "", m.group(1))}</a>', p)
        out.append(p)
    return "".join(out)


def table(rows):
    cells = [[c.strip() for c in r.strip().strip("|").split("|")] for r in rows]
    head, body = cells[0], [r for r in cells[2:]]
    h = "".join(f"<th>{inline(c)}</th>" for c in head)
    b = "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in body)
    return f'<div class="tablewrap"><table><thead><tr>{h}</tr></thead><tbody>{b}</tbody></table></div>'


def convert(md):
    lines = md.split("\n")
    out, para, stack = [], [], []          # stack of open lists: (tag, indent)

    def flush():
        if para:
            out.append("<p>" + inline(" ".join(para)) + "</p>")
            para.clear()

    def close_lists(to=-1):
        while stack and stack[-1][1] > to:
            out.append(f"</li></{stack.pop()[0]}>")

    i = 0
    while i < len(lines):
        line = lines[i]
        s = line.strip()
        fence = re.match(r"^(\s*)```", line)
        if fence:
            code, i = [], i + 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code.append(lines[i][len(fence.group(1)):] if lines[i].startswith(fence.group(1)) else lines[i])
                i += 1
            flush()
            if not fence.group(1):
                close_lists()
            out.append("<pre><code>" + html.escape("\n".join(code), quote=False) + "</code></pre>")
            i += 1
            continue
        if not s:
            flush()
            close_lists()
            i += 1
            continue
        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            flush()
            close_lists()
            n = len(m.group(1))
            out.append(f"<h{n}>{inline(m.group(2))}</h{n}>")
            i += 1
            continue
        if re.match(r"^-{3,}$", s):
            flush()
            close_lists()
            out.append("<hr>")
            i += 1
            continue
        if s.startswith("|"):
            flush()
            close_lists()
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append(lines[i])
                i += 1
            out.append(table(rows))
            continue
        m = re.match(r"^(\s*)([-*]|\d+\.)\s+(.*)$", line)
        if m:
            flush()
            indent = len(m.group(1)) // 2
            tag = "ol" if m.group(2)[0].isdigit() else "ul"
            close_lists(indent)
            if stack and stack[-1][1] == indent:
                if stack[-1][0] == tag:
                    out.append("</li>")
                else:
                    close_lists(indent - 1)
            if not stack or stack[-1][1] < indent:
                out.append(f"<{tag}>")
                stack.append((tag, indent))
            out.append("<li>" + inline(m.group(3)))
            i += 1
            continue
        if stack and line.startswith("  "):
            out.append(" " + inline(s))       # continuation of the open list item
            i += 1
            continue
        close_lists()
        para.append(s)
        i += 1
    flush()
    close_lists()
    return "\n".join(out)


def title_and_body(md):
    """The first '# ' heading becomes the page title; the rest is the body."""
    m = re.match(r"^#\s+(.*)\n", md)
    if not m:
        return "", convert(md)
    return m.group(1).strip(), convert(md[m.end():])
