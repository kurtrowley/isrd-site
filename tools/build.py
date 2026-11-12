#!/usr/bin/env python3
"""Builds the whole site from content/ into plain HTML: the home page, the Publications list and its pages,
the Software page, and the simulations.

    python3 tools/build.py            # writes into the site root

Needs the `markdown` package (pip install markdown). Output is ordinary static files; commit them.
"""
import html, json, os, re, shutil
from pathlib import Path
import markdown

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
CONTACT_EMAIL = os.environ.get("CONTACT_EMAIL", "kurt@isrd.com")
NAME = "Interdisciplinary Systems Research and Development"
TAGLINE = "We develop tools to support systems thinking and systemic change."
PURPOSE = ("ISRD is a research and development firm. We support the people who work on systemic change: writers and other creatives, "
           "researchers and scientists, educators, consultants and thought leaders, and anyone who wants to understand how systems change. "
           "We also provide end-user products consistent with our mission, including games.")
CATEGORY = "Article"       # every publication has this category unless its record sets "category"
MERMAID = "https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"
e = html.escape


def data(name):
    return json.loads((CONTENT / "data" / f"{name}.json").read_text(encoding="utf-8"))


ARTICLES, READINGS, PROGRAMS = data("articles"), data("course_readings"), data("programs")
MEDIA, REPORTS, SIMS, SOFTWARE = data("media"), data("reports"), data("simulations"), data("software")
PROGRAM_TITLE = {p["id"]: p["title"] for p in PROGRAMS}
WRITER_URL = next(s["url"] for s in SOFTWARE if s["id"] == "writer")
PUBS = []       # every publication, filled in by the build_* functions below, then listed by build_publications


def pub(slug, title, kind, desc="", year="", detail="", rec=None):
    PUBS.append({"slug": slug, "title": title, "kind": kind, "desc": desc, "year": str(year or ""), "detail": detail,
                 "category": (rec or {}).get("category", CATEGORY), "pinned": bool((rec or {}).get("pinned"))})


def soft_href(s):
    return f'/software/{s["id"]}/'


def contact_line():
    return (f'For information about software or access to the beta, contact <a href="mailto:{e(CONTACT_EMAIL)}">{e(CONTACT_EMAIL)}</a>.')


# Old addresses (the previous section layout) are sent to their new home. Used by the 404 page.
REDIRECT = r"""<script>
(function () {
  var p = location.pathname, m, to = "";
  if ((m = p.match(/^\/(?:articles|courses|research\/papers|research)\/([\w-]+)\/?$/))) to = "/publications/" + m[1] + "/";
  else if (/^\/(articles|courses|research)\/?$/.test(p)) to = "/publications/";
  else if (/^\/media\/?$/.test(p)) to = "/publications/visual-arts/";
  else if (/^\/about\/?$/.test(p)) to = "/";
  if (to && !/[?&]moved=1/.test(location.search)) location.replace(to + "?moved=1");
})();
</script>"""

# Older still: the React site used links like /#/simulations/lorenz. Used by the home page.
HASH_REDIRECT = r"""<script>
(function () {
  var h = location.hash, m, to = "";
  if (h.indexOf("#/") !== 0) return;
  if ((m = h.match(/^#\/simulations\/([\w-]+)/))) to = "/simulations/" + m[1] + "/";
  else if ((m = h.match(/^#\/(?:articles|courses|research|publications\/reports)\/([\w-]+)/))) to = "/publications/" + m[1] + "/";
  else if (/^#\/simulations\b/.test(h)) to = "/simulations/";
  else if (/^#\/media\b/.test(h)) to = "/publications/visual-arts/";
  else if (/^#\/(publications|articles|courses|research)\b/.test(h)) to = "/publications/";
  if (to) location.replace(to);
})();
</script>"""


# ---- shared page frame -------------------------------------------------------------------------------
def page(path, title, body, desc="", mermaid=False, section="", full_title="", head_extra=""):
    cur = lambda s: ' aria-current="page"' if s == section else ""
    drop = "".join(f'<a href="{soft_href(s)}">{e(s["title"])}</a>' for s in SOFTWARE)
    doc = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(full_title or title + " | ISRD")}</title>
<meta name="description" content="{e(desc or title)}">
<meta name="theme-color" content="#0f6b5c">
<link rel="stylesheet" href="/style.css">
<script src="/theme.js"></script>
{head_extra}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site"><div class="wrap">
  <a class="brand" href="/">IS<span>R</span>D</a>
  <nav aria-label="Main"><a href="/publications/"{cur("publications")}>Publications</a><a href="/simulations/"{cur("simulations")}>Simulations</a><details class="menu{" current" if section == "software" else ""}"><summary>Software</summary><div class="drop">{drop}</div></details><button class="icon-btn" id="themeBtn" type="button" aria-label="Switch color theme">☾</button></nav>
</div></header>
<main id="main">
{body}
</main>
<footer><div class="wrap">
  <div><strong>ISRD</strong><br>{e(NAME)}</div>
  <div><a href="/publications/">Publications</a> · <a href="/software/">Software</a> · <a href="/simulations/">Simulations</a>{f'<br><a href="mailto:{e(CONTACT_EMAIL)}">{e(CONTACT_EMAIL)}</a>' if CONTACT_EMAIL else ""}</div>
  <div>© ISRD. All rights reserved.</div>
</div></footer>
{f'<script src="{MERMAID}"></script><script>mermaid.initialize({{startOnLoad:true,theme:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"default"}});</script>' if mermaid else ""}
</body>
</html>
"""
    out = ROOT / path.strip("/") / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(doc, encoding="utf-8")


def head(eyebrow, title, lede="", crumbs=""):
    return f'<div class="pagehead"><div class="wrap">{crumbs}<p class="eyebrow">{e(eyebrow)}</p><h1>{e(title)}</h1>{f"<p class=lede>{e(lede)}</p>" if lede else ""}</div></div>'


def crumbs(*items):
    return '<nav class="crumbs" aria-label="Breadcrumb">' + " / ".join(f'<a href="{h}">{e(n)}</a>' for n, h in items) + "</nav>"


def tags(ts):
    return "".join(f'<span class="chip">{e(t)}</span>' for t in ts or [])


# ---- markdown ---------------------------------------------------------------------------------------
PUBS_CRUMB = ("Publications", "/publications/")


def href(h):
    """Turns an address from the old section layout into its place under /publications/."""
    h = h.rstrip("/")
    m = re.fullmatch(r"/(?:publications/reports|research/papers|articles|courses|research)/([A-Za-z0-9_-]+)", h)
    if m:
        return f"/publications/{m.group(1)}/"
    m = re.fullmatch(r"/media/([a-z0-9-]+)", h)
    if m:
        return f"/publications/visual-arts/#{m.group(1)}"
    return h + "/" if h.startswith("/") and "." not in h.rsplit("/", 1)[-1] else h


def fix_links(text):
    text = re.sub(r"!\[[^\]]*\]\(/articles/learner_first_header\.png\)\n*", "", text)   # a broken image on the old site too
    text = text.replace("](/articles/systems_science_eras-graphic.png)", "](/media/systems_science_eras-graphic.png)")
    return re.sub(r"\]\((/[^)#\s]*)\)", lambda m: f"]({href(m.group(1))})", text)


def render(md_path, drop_title=True, subtitle=""):
    text = (CONTENT / md_path).read_text(encoding="utf-8")
    if drop_title:
        text = re.sub(r"\A\s*# .*\n", "", text, count=1)
    if subtitle:      # the page header already shows it; the source repeats it as an italic first line
        text = re.sub(r"\A\s*\*" + re.escape(subtitle) + r"\*\s*\n", "", text, count=1)
    text = fix_links(text)
    out = markdown.markdown(text, extensions=["tables", "fenced_code", "sane_lists", "toc"],
                            extension_configs={"toc": {"toc_depth": "2-3"}})
    has_mermaid = 'class="language-mermaid"' in out
    out = re.sub(r'<pre><code class="language-mermaid">(.*?)</code></pre>',
                 lambda m: f'<pre class="mermaid">{m.group(1)}</pre>', out, flags=re.S)
    return out, has_mermaid


def prose(inner):
    return f'<div class="wrap"><article class="prose">{inner}</article></div>'


def byline(top, rec):
    return top.replace("</div></div>", f'<p class="muted byline">{e(rec.get("author", ""))} · {e(str(rec.get("date", "")))}</p></div></div>', 1)


# ---- publications: every kind of writing becomes one page under /publications/ ---------------------------
def build_articles():
    for a in ARTICLES:
        body, m = render(f"articles/{a['file']}", subtitle=a.get("subtitle", ""))
        top = byline(head(f"Article", a["title"], a.get("subtitle", ""), crumbs(PUBS_CRUMB)), a)
        page(f"/publications/{a['slug']}/", a["title"], top + prose(body), a["description"], m, "publications")
        pub(a["slug"], a["title"], "Article", a["description"], a.get("date"), a.get("tag", ""), a)


def build_reports():
    for r in REPORTS:
        body, m = render(f"research/{r['file']}")
        prog = PROGRAM_TITLE.get(r.get("program"), "")
        top = byline(head(f"Research report" + (f" · {prog}" if prog else ""), r["title"], r.get("description", ""), crumbs(PUBS_CRUMB)), r)
        page(f"/publications/{r['slug']}/", r["title"], top + prose(body), r.get("description", ""), m, "publications")
        pub(r["slug"], r["title"], "Research report", r.get("description", ""), r.get("date"), prog, r)
    body, m = render("research/methodology-and-publications.md")
    title, desc = "Research methodology and publications", "Design-based research, and the studies and papers behind it."
    page("/publications/methodology-and-publications/", title, head(f"Research summary", title, desc, crumbs(PUBS_CRUMB)) + prose(body), desc, m, "publications")
    pub("methodology-and-publications", title, "Research summary", desc)


def build_programs():
    for p in PROGRAMS:
        qs = "".join(f"<li>{e(q)}</li>" for q in p["research_questions"])
        tools = "".join(f"<li>{e(t)}</li>" for t in p["tools"])
        sims = "".join(f'<li><a href="/simulations/{s["path"].rsplit("/", 1)[-1]}/">{e(s["label"])}</a>{" <span class=chip>In development</span>" if s.get("status") else ""}</li>'
                       for s in p.get("related_simulators", []))
        rel = "".join(f'<li><a href="/publications/{r["slug"]}/">{e(r["title"])}</a></li>' for r in REPORTS if r.get("program") == p["id"])
        if p.get("report_slug") and not rel:
            rel = f'<li><a href="/publications/{p["report_slug"]}/">Read the report</a></li>'
        product = f'<p><a class="btn primary" href="{WRITER_URL}">{e(p.get("product_label") or "Visit ISRD Writing Studio →")}</a></p>' if p.get("product_url") else ""
        related = "".join(f'<li><a href="{href(r["href"])}">{e(r["label"])}</a></li>' for r in p.get("related", []))
        body = (head(f"Research summary", p["title"], p["subtitle"], crumbs(PUBS_CRUMB)) +
                f'<section><div class="wrap two"><div class="prose"><p>{e(p["description"])}</p>'
                f'{f"<h2>Research questions</h2><ol>{qs}</ol>" if qs else ""}'
                f'{f"<h2>How AI is used</h2><p>{e(p["ai_use"])}</p>" if p.get("ai_use") else ""}{product}</div>'
                f'<aside>{f"<div class=card><h3>Tools</h3><ul>{tools}</ul></div>" if tools else ""}'
                f'{f"<div class=card><h3>Read next</h3><ul>{related}</ul></div>" if related else ""}'
                f'{f"<div class=card><h3>Simulations</h3><ul>{sims}</ul></div>" if sims else ""}'
                f'{f"<div class=card><h3>Reports</h3><ul>{rel}</ul></div>" if rel else ""}</aside></div></section>')
        page(f"/publications/{p['id']}/", p["title"], body, p["description"][:200], section="publications")
        pub(p["id"], p["title"], "Research summary", p["subtitle"], rec=p)


def build_readings():
    for r in sorted(READINGS, key=lambda r: (r["seriesLabel"], r["order"])):
        body, m = render(f"courses/{r['file']}")
        top = byline(head(f"Course reading · {r['seriesLabel']}", r["title"], r["description"], crumbs(PUBS_CRUMB)), r)
        page(f"/publications/{r['slug']}/", r["title"], top + prose(body), r["description"], m, "publications")
        pub(r["slug"], r["title"], "Course reading", r["description"], r.get("date"), r["seriesLabel"], r)


def build_media():
    for g in MEDIA:
        out = f'<section><div class="wrap"><p class="lede">{e(g["description"])}</p>'
        for it in g["items"]:
            els = "".join(f"<h4>{e(x['title'])}</h4><p>{e(x['body'])}</p>" for x in it["analysis"].get("elements", []))
            link = f'<p><a href="{href(it["article_link"])}">Related article →</a></p>' if it.get("article_link") else ""
            out += (f'<figure class="art" id="{it["slug"]}"><img src="{it["image"]}" alt="{e(it["title"])}" loading="lazy">'
                    f'<figcaption>{e(it.get("caption", "")).lstrip("🎨 ")}</figcaption></figure>'
                    f'<div class="prose"><h3>{e(it["title"])}</h3><p><em>{e(it["subtitle"])}</em></p><p>{e(it["analysis"]["overview"])}</p>{els}{link}<div>{tags(it.get("tags"))}</div></div>')
        out += "</div></section>"
        title, desc = "Systems science as visual art", "Images that make attractors and feedback visible, with an analysis of each."
        page(f"/publications/{g['id']}/", title, head(f"Visual essay", title, "", crumbs(PUBS_CRUMB)) + out, desc, section="publications")
        pub(g["id"], title, "Visual essay", desc, rec=g)


def pub_rows(items):
    return '<ul class="rows">' + "".join(
        f'<li><span class="meta">{e(" · ".join(x for x in (p["kind"], p["detail"], p["year"]) if x))}</span>'
        f'<a href="/publications/{p["slug"]}/"><strong>{e(p["title"])}</strong></a>'
        f'{f"<span class=muted>{e(p["desc"])}</span>" if p["desc"] else ""}</li>' for p in items) + "</ul>"


def pubs_sorted():
    return sorted(PUBS, key=lambda p: (not p["pinned"], -int(p["year"] or 0)))      # a stable sort: otherwise the order they were built in


def build_publications():
    groups = {}
    for p in pubs_sorted():
        groups.setdefault(p["category"], []).append(p)
    body = "".join(f'<section><div class="wrap"><h2>{e(c)}s</h2>{pub_rows(ps)}</div></section>' for c, ps in groups.items())
    page("/publications/", "Publications", head("ISRD", "Publications", "Articles, research reports and summaries, and course readings.") + body,
         "ISRD publications: articles, research reports and summaries, and course readings.", section="publications")


# ---- software -----------------------------------------------------------------------------------------
def soft_cards():
    out = ""
    for s in SOFTWARE:
        tag = '<span class="tag live">Live</span>' if s.get("live") else '<span class="tag soon">Moving to a new server</span>'
        out += (f'<a class="card" id="{s["id"]}" href="{soft_href(s)}">{tag}<span class="meta">{e(s["url"].split("//", 1)[-1])}</span>'
                f'<h3>{e(s["title"])}</h3><p>{e(s["description"])}</p><span class="go">About it →</span></a>')
    return f'<div class="grid">{out}</div>'


def build_software():
    crumb = crumbs(("Software", "/software/"))
    page("/software/", "Software", head("ISRD", "Software", "The apps we build, each on its own site.") +
         f'<section><div class="wrap">{soft_cards()}<p class="muted" style="margin-top:1.6em">{contact_line()}</p></div></section>',
         "ISRD software: the Writing Studio and Bison Island Studios.", section="software")
    for s in SOFTWARE:
        host = s["url"].split("//", 1)[-1]
        body, m = render(f"software/{s['file']}")
        if s.get("live"):
            access = f'<p><a class="btn primary" href="{s["url"]}">Open {e(s["title"])} →</a></p><p class="muted">{contact_line()}</p>'
        else:       # the stub: shown until the app is being served at its address
            access = (f'<p><span class="tag soon">Moving to a new server</span></p><p>It will open at {e(host)} once the move is finished.</p>'
                      f'<p class="muted">{contact_line()}</p>')
        page(soft_href(s), s["title"], head("Software · " + host, s["title"], s.get("tagline", ""), crumb) +
             prose(body + f'<h2>Access</h2>{access}'), s["description"], m, "software")


def game_cta():
    """The home page button for the game. It opens the game itself once it is live; until then, its landing page."""
    g = next(s for s in SOFTWARE if s["id"] == "games")
    return (f'<div class="cta"><a class="btn primary" href="{g["url"] if g.get("live") else soft_href(g)}">Writing game at {e(g["title"])} →</a></div>'
            f'<p class="purpose contact">{e(g["title"])} is a subsidiary of ISRD.</p>')


# ---- home ---------------------------------------------------------------------------------------------
def build_home():
    body = (f'<div class="hero"><div class="wrap"><p class="eyebrow">ISRD</p><h1 class="name">{e(NAME)}</h1><p class="lede">{e(TAGLINE)}</p><p class="purpose">{e(PURPOSE)}</p><p class="purpose contact">{contact_line()}</p>{game_cta()}</div></div>'
            f'<section class="alt"><div class="wrap"><h2>{e(CATEGORY)}s</h2>{pub_rows(pubs_sorted()[:8])}'
            f'<p style="margin-top:1.4em"><a href="/publications/">All {len(PUBS)} publications →</a></p></div></section>'
            f'<section><div class="wrap"><h2>Software</h2>{soft_cards()}</div></section>')
    page("/", NAME, body, f"ISRD: {NAME}. {TAGLINE}", full_title=f"ISRD: {NAME}", head_extra=HASH_REDIRECT)


# ---- simulations --------------------------------------------------------------------------------------
def build_simulations():
    cards = ""
    for s in SIMS:
        dev = s.get("status")
        tag = f'<span class="tag soon">{e(dev)}</span>' if dev else '<span class="tag live">Interactive</span>'
        cards += (f'<a class="card" href="/simulations/{s["id"]}/">{tag}<span class="meta">{e(s["concept"])}</span><h3>{e(s["title"])}</h3>'
                  f'<p>{e(s["description"])}</p><span class="go">Run it →</span></a>')
    page("/simulations/", "Simulations", head("ISRD Simulations", "Systems you can run",
         "Interactive models of feedback, emergence, chaos, network spread and regulatory capture. Change a parameter and watch the system respond.") +
         f'<section><div class="wrap"><div class="grid">{cards}</div>'
         '</div></section>',
         "Interactive systems-science simulations.", section="simulations")


ERA = {3: "Era 3: Complexity and chaos", 4: "Era 4: Networked complexity", 5: "Era 5: Entanglement"}
NATIVE = {"boids", "feedback", "lorenz", "era4-network", "era5-entanglement", "regulatory-capture"}


def build_postviral():
    s = next(x for x in SIMS if x["id"] == "postviral")
    body = (head("Simulation · " + f'{ERA.get(s["era"], "")} · {s["concept"]}', s["title"], "", crumbs(("Simulations", "/simulations/")))
            + (CONTENT / "postviral-body.html").read_text(encoding="utf-8"))
    page("/simulations/postviral/", s["title"], body, s["description"][:200], section="simulations")


def build_sim_pages():
    for s in SIMS:
        if s["id"] == "postviral":
            continue
        meta = f'{ERA.get(s["era"], "")} · {s["concept"]}'
        crumb = crumbs(("Simulations", "/simulations/"))
        if s["id"] in NATIVE:
            stage = ('<section><div class="wrap"><div id="sim-app" data-sim="%s"><p class="muted">Loading the simulation…</p></div>'
                     '<noscript><p>This simulation needs JavaScript.</p></noscript>'
                     '<div class="prose simnote"><h2>About this model</h2><p>%s</p></div></div></section>'
                     '<script type="module" src="/simulations/js/runner.js"></script>') % (s["id"], e(s["description"]))
        else:
            stage = ('<section><div class="wrap"><div class="prose simnote"><p>%s</p><p class="muted">This model is still in development.</p></div></div></section>'
                     % e(s["description"]))
        page(f"/simulations/{s['id']}/", s["title"], head("Simulation · " + meta, s["title"], "", crumb) + stage, s["description"][:200], section="simulations")


def build_404():
    body = (head("Not found", "That page has moved or does not exist", "Try one of these.") +
            '<section><div class="wrap"><div class="cta"><a class="btn primary" href="/">Home</a><a class="btn ghost" href="/publications/">Publications</a>'
            '<a class="btn ghost" href="/software/">Software</a></div></div></section>')
    page("/__404__/", "Page not found", body, "Page not found", head_extra=REDIRECT)
    out = ROOT / "__404__" / "index.html"
    (ROOT / "404.html").write_text(out.read_text(encoding="utf-8"), encoding="utf-8")
    shutil.rmtree(ROOT / "__404__")


if __name__ == "__main__":
    shutil.rmtree(ROOT / "publications", ignore_errors=True)      # so a removed publication does not leave its page behind
    for fn in (build_articles, build_reports, build_programs, build_readings, build_media, build_publications, build_software,
               build_home, build_simulations, build_sim_pages, build_postviral, build_404):
        fn()
    print(f"built {len(PUBS)} publications, {len(SOFTWARE)} software entries, {len(SIMS)} simulations")
