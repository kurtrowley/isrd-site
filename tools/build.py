#!/usr/bin/env python3
"""Builds the content pages (articles, research, courses, media, simulations) from content/ into plain HTML.

    python3 tools/build.py            # writes into the site root, next to index.html
    SIM_BASE=http://localhost:8092 python3 tools/build.py     # point simulation links at a local copy of sim/

Needs the `markdown` package (pip install markdown). Output is ordinary static files; commit them.
"""
import ast, html, json, os, re, shutil
from pathlib import Path
import markdown

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
SIM_BASE = os.environ.get("SIM_BASE", "https://sim.isrd.com").rstrip("/")
CONTACT_EMAIL = os.environ.get("CONTACT_EMAIL", "kurt@isrd.com")        # set when decided; the About page shows a mailto link once it is
WRITER_URL = "https://writer.isrd.com"
MERMAID = "https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"
e = html.escape


def data(name):
    return json.loads((CONTENT / "data" / f"{name}.json").read_text(encoding="utf-8"))


ARTICLES, READINGS, PROGRAMS = data("articles"), data("course_readings"), data("programs")
COURSES, MEDIA, REPORTS, SIMS = data("courses"), data("media"), data("reports"), data("simulations")
PROGRAM_TITLE = {p["id"]: p["title"] for p in PROGRAMS}
READING_BY_SLUG = {r["slug"]: r for r in READINGS}

# ---- shared page frame -------------------------------------------------------------------------------
NAV = [("Research", "/research/"), ("Articles", "/articles/"), ("Courses", "/courses/"), ("Simulations", "/simulations/"), ("Media", "/media/")]


def page(path, title, body, desc="", mermaid=False, section=""):
    nav = "".join(f'<a href="{h}"{" aria-current=\"page\"" if h.strip("/") == section else ""}>{n}</a>' for n, h in NAV)
    doc = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)} | ISRD</title>
<meta name="description" content="{e(desc or title)}">
<meta name="theme-color" content="#0f6b5c">
<link rel="stylesheet" href="/style.css">
<script src="/theme.js"></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site"><div class="wrap">
  <a class="brand" href="/">IS<span>R</span>D</a>
  <nav aria-label="Main">{nav}<a href="{WRITER_URL}">Writing Studio</a><button class="icon-btn" id="themeBtn" type="button" aria-label="Switch color theme">☾</button></nav>
</div></header>
<main id="main">
{body}
</main>
<footer><div class="wrap">
  <div><strong>ISRD</strong><br>Interdisciplinary Systems R&amp;D</div>
  <div><a href="/research/">Research</a> · <a href="/articles/">Articles</a><br><a href="/courses/">Courses</a> · <a href="/simulations/">Simulations</a><br><a href="/about/">About</a></div>
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
def fix_links(text):
    text = re.sub(r"\]\(/simulations/([a-z0-9-]+)\)", lambda m: f"](/simulations/{m.group(1)}/)", text)
    text = re.sub(r"\]\(/publications/reports/([a-z0-9-]+)\)", r"](/research/papers/\1/)", text)
    text = re.sub(r"\]\(/media/([a-z0-9-]+)\)", r"](/media/#\1)", text)
    text = re.sub(r"\]\(/(courses|articles|research)/([a-z0-9_-]+)\)", r"](/\1/\2/)", text)
    text = re.sub(r"\]\(/simulations\)", "](/simulations/)", text)
    text = re.sub(r"!\[[^\]]*\]\(/articles/learner_first_header\.png\)\n*", "", text)   # a broken image on the old site too
    return text


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


# ---- articles -----------------------------------------------------------------------------------------
def build_articles():
    items = sorted(ARTICLES, key=lambda a: (not a.get("pinned"), -int(a.get("date") or 0)))
    cards = "".join(
        f'<a class="card" href="/articles/{a["slug"]}/"><span class="meta">{e(a.get("tag", ""))} · {e(str(a.get("date", "")))}</span>'
        f'<h3>{e(a["title"])}</h3><p><em>{e(a.get("subtitle", ""))}</em></p><p>{e(a["description"])}</p><span class="go">Read →</span></a>'
        for a in items)
    page("/articles/", "Articles", head("Publications", "Articles", "Long-form theoretical and applied writing.") +
         f'<section><div class="wrap"><div class="grid">{cards}</div></div></section>', "Long-form theoretical and applied writing from ISRD.", section="articles")
    for a in ARTICLES:
        body, m = render(f"articles/{a['file']}", subtitle=a.get("subtitle", ""))
        top = head("Article · " + a.get("tag", ""), a["title"], a.get("subtitle", ""), crumbs(("Articles", "/articles/"))) \
            .replace("</div></div>", f'<p class="muted byline">{e(a.get("author", ""))} · {e(str(a.get("date", "")))}</p></div></div>', 1)
        page(f"/articles/{a['slug']}/", a["title"], top + prose(body), a["description"], m, "articles")


# ---- research -----------------------------------------------------------------------------------------
def build_research():
    progs = ""
    for p in PROGRAMS:
        progs += (f'<a class="card" href="/research/{p["id"]}/"><h3>{e(p["title"])}</h3><p><em>{e(p["subtitle"])}</em></p>'
                  f'<p>{e(p["description"][:240].rsplit(" ", 1)[0])}…</p><span class="go">Program →</span></a>')
    papers = "".join(
        f'<li><a href="/research/papers/{r["slug"]}/"><strong>{e(r["title"])}</strong></a>'
        f'{f"<br><span class=muted>{e(r.get("description", ""))}</span>" if r.get("description") else ""}</li>' for r in REPORTS)
    intro = ("ISRD investigates complex adaptive systems through Cross-System Synthesis, a non-linear, attractor-based methodology. "
             "Each program uses interactive simulators, feedback-graph modeling and AI-assisted interpretation to generate and test hypotheses.")
    page("/research/", "Research", head("ISRD Research", "Complex systems research", intro) +
         f'<section><div class="wrap"><h2>Programs</h2><div class="grid">{progs}</div></div></section>'
         f'<section class="alt"><div class="wrap"><h2>Research reports</h2><ul class="rows">{papers}</ul>'
         '<p style="margin-top:1.4em"><a href="/research/methodology-and-publications/">Research methodology and publications →</a></p>'
         '<p class="muted">All programs are AI-integrated: language models help interpret simulation runs and surface non-obvious relationships. AI is a standard analytical tool here.</p></div></section>',
         intro, section="research")
    for p in PROGRAMS:
        qs = "".join(f"<li>{e(q)}</li>" for q in p["research_questions"])
        tools = "".join(f"<li>{e(t)}</li>" for t in p["tools"])
        sims = "".join(f'<li><a href="/simulations/{s["path"].rsplit("/", 1)[-1]}/">{e(s["label"])}</a>{" <span class=chip>In development</span>" if s.get("status") else ""}</li>'
                       for s in p.get("related_simulators", []))
        rel = "".join(f'<li><a href="/research/papers/{r["slug"]}/">{e(r["title"])}</a></li>' for r in REPORTS if r.get("program") == p["id"])
        if p.get("report_slug") and not rel:
            rel = f'<li><a href="/research/papers/{p["report_slug"]}/">Read the report</a></li>'
        product = f'<p><a class="btn primary" href="{WRITER_URL}">{e(p.get("product_label") or "Visit ISRD Writing Studio →")}</a></p>' if p.get("product_url") else ""
        related = "".join(f'<li><a href="{r["href"]}">{e(r["label"])}</a></li>' for r in p.get("related", []))
        body = (head("Research program", p["title"], p["subtitle"], crumbs(("Research", "/research/"))) +
                f'<section><div class="wrap two"><div class="prose"><p>{e(p["description"])}</p>'
                f'{f"<h2>Research questions</h2><ol>{qs}</ol>" if qs else ""}'
                f'{f"<h2>How AI is used</h2><p>{e(p["ai_use"])}</p>" if p.get("ai_use") else ""}{product}</div>'
                f'<aside>{f"<div class=card><h3>Tools</h3><ul>{tools}</ul></div>" if tools else ""}'
                f'{f"<div class=card><h3>Read next</h3><ul>{related}</ul></div>" if related else ""}'
                f'{f"<div class=card><h3>Simulations</h3><ul>{sims}</ul></div>" if sims else ""}'
                f'{f"<div class=card><h3>Reports</h3><ul>{rel}</ul></div>" if rel else ""}</aside></div></section>')
        page(f"/research/{p['id']}/", p["title"], body, p["description"][:200], section="research")
    body, m = render("research/methodology-and-publications.md")
    page("/research/methodology-and-publications/", "Research methodology and publications",
         head("ISRD Research", "Research methodology and publications", "Design-based research, and the studies and papers behind it.",
              crumbs(("Research", "/research/"))) + prose(body),
         "ISRD's design-based research methodology, with publications and papers.", section="research")
    for r in REPORTS:
        body, m = render(f"research/{r['file']}")
        top = head("Research report" + (" · " + PROGRAM_TITLE.get(r.get("program"), r.get("program").replace("-", " ").title()) if r.get("program") else ""), r["title"], r.get("description", ""), crumbs(("Research", "/research/")))
        page(f"/research/papers/{r['slug']}/", r["title"], top + prose(body), r.get("description", ""), m, "research")


# ---- courses ------------------------------------------------------------------------------------------
def build_courses():
    cards = ""
    for c in COURSES:
        link = f'<p><a href="{c["article_link"]}/">Background article →</a></p>' if c.get("article_link") else ""
        cards += (f'<div class="card"><span class="tag soon">{e(c["status"])}</span><span class="meta">{e(c["code"])} · {e(c["level"])} · {c["modules"]} modules · about {c["estimated_hours"]} hours</span>'
                  f'<h3>{e(c["title"])}</h3><p><em>{e(c["subtitle"])}</em></p><p>{e(c["description"])}</p><div>{tags(c.get("tags"))}</div>{link}</div>')
    groups = {}
    for r in sorted(READINGS, key=lambda r: (r["seriesLabel"], r["order"])):
        groups.setdefault(r["seriesLabel"], []).append(r)
    reads = "".join(f'<h3>{e(g)}</h3><ul class="rows">' + "".join(
        f'<li><a href="/courses/{r["slug"]}/"><strong>{e(r["title"])}</strong></a><br><span class="muted">{e(r["description"])}</span></li>' for r in rs) + "</ul>"
        for g, rs in groups.items())
    page("/courses/", "Courses", head("Publications", "Courses", "A structured systems-science curriculum, with the readings available now.") +
         f'<section><div class="wrap"><h2>Courses</h2><div class="grid">{cards}</div></div></section>'
         f'<section class="alt"><div class="wrap"><h2>Readings</h2>{reads}</div></section>', "ISRD systems-science courses and readings.", section="courses")
    for r in READINGS:
        body, m = render(f"courses/{r['file']}")
        top = head(f"Reading · {r['seriesLabel']}", r["title"], r["description"], crumbs(("Courses", "/courses/")))
        page(f"/courses/{r['slug']}/", r["title"], top + prose(body), r["description"], m, "courses")


# ---- media --------------------------------------------------------------------------------------------
def build_media():
    out = ""
    for g in MEDIA:
        out += f'<section><div class="wrap"><h2>{e(g["title"])}</h2><p class="lede">{e(g["description"])}</p>'
        for it in g["items"]:
            els = "".join(f"<h4>{e(x['title'])}</h4><p>{e(x['body'])}</p>" for x in it["analysis"].get("elements", []))
            link = f'<p><a href="{it["article_link"]}/">Related article →</a></p>' if it.get("article_link") else ""
            out += (f'<figure class="art" id="{it["slug"]}"><img src="{it["image"]}" alt="{e(it["title"])}" loading="lazy">'
                    f'<figcaption>{e(it.get("caption", "")).lstrip("🎨 ")}</figcaption></figure>'
                    f'<div class="prose"><h3>{e(it["title"])}</h3><p><em>{e(it["subtitle"])}</em></p><p>{e(it["analysis"]["overview"])}</p>{els}{link}<div>{tags(it.get("tags"))}</div></div>')
        out += "</div></section>"
    page("/media/", "Media", head("Media", "Systems science as visual art", "Images that make attractors and feedback visible.") + out,
         "Visual arts from ISRD.", section="media")


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
         '<p class="muted" style="margin-top:1.6em">Systems games are the next step: these models grow into scenarios you play.</p></div></section>',
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


def build_about():
    a = data("about")
    what = "".join(f'<a class="card" href="{w["href"]}"><h3>{e(w["title"])}</h3><p>{e(w["text"])}</p><span class="go">Explore →</span></a>' for w in a["what"])
    princ = "".join(f'<li><strong>{e(x["title"])}</strong><span>{e(x["text"])}</span></li>' for x in a["principles"])
    pr = a["person"]
    contact = (f'<p><a class="btn primary" href="mailto:{e(CONTACT_EMAIL)}">{e(CONTACT_EMAIL)}</a></p>' if CONTACT_EMAIL
               else '<p class="muted">Contact details are coming soon.</p>')
    top = head("About", "A creative lab for research and tools that help people shape the future", a["intro"]).replace(
        "</div></div>", f'<p class="lede">{e(a["aim"])}</p></div></div>', 1)
    body = (top +
            f'<section><div class="wrap"><h2>What we do</h2><div class="grid">{what}</div></div></section>'
            f'<section class="alt"><div class="wrap"><h2>How we work</h2><p class="lede">{e(a["principles_intro"])}</p><ul class="principles">{princ}</ul></div></section>'
            f'<section><div class="wrap two"><div><p class="eyebrow">Mission</p><h2>{e(a["mission_title"])}</h2></div>'
            f'<div><blockquote class="mission">{e(a["mission"].split(". ", 1)[0])}.</blockquote><p class="muted" style="margin-top:1.2em">{e(a["mission"].split(". ", 1)[1])}</p></div></div></section>'
            f'<section class="alt"><div class="wrap two"><div><p class="eyebrow">The researcher</p><h2>{e(pr["name"])}</h2><p class="muted">{e(pr["title"])}</p></div>'
            f'<div class="prose"><p>{e(pr["bio"])}</p><div>{tags(pr["areas"])}</div><p style="margin-top:1.2em">{e(pr["collab"])}</p></div></div></section>'
            f'<section><div class="wrap"><h2>Contact</h2>{contact}</div></section>')
    page("/about/", "About", body, a["intro"][:200], section="about")


def build_404():
    body = (head("Not found", "That page has moved or does not exist", "Try one of the sections below.") +
            '<section><div class="wrap"><div class="cta"><a class="btn primary" href="/">Home</a><a class="btn ghost" href="/research/">Research</a>'
            '<a class="btn ghost" href="/articles/">Articles</a><a class="btn ghost" href="/simulations/">Simulations</a></div></div></section>')
    page("/__404__/", "Page not found", body, "Page not found")
    out = ROOT / "__404__" / "index.html"
    (ROOT / "404.html").write_text(out.read_text(encoding="utf-8"), encoding="utf-8")
    shutil.rmtree(ROOT / "__404__")


if __name__ == "__main__":
    for fn in (build_articles, build_research, build_courses, build_media, build_simulations, build_sim_pages, build_postviral, build_about, build_404):
        fn()
    print("built; simulation links use", SIM_BASE)
