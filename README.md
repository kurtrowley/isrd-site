# ISRD website

Interdisciplinary Systemics R&D. A static site: plain HTML, one stylesheet, a little JavaScript. The text lives in files you can edit; GitHub rebuilds and publishes the site whenever you save a change.

## How to make an edit (no installs needed)
1. Go to **github.com/kurtrowley/isrd-site** and sign in.
2. Open the file you want (see the table below) and click the **pencil** icon (Edit this file).
3. Make your change, then click **Commit changes**, then **Commit changes** again.
4. Wait a minute or two. The live site at isrd.com updates by itself. Progress shows in the **Actions** tab.

If the Actions tab shows a red X, the edit contained a mistake (the usual one is a missing comma or quote in a `.json` file). The live site stays as it was. Click the failed run to see the message, then fix the file and commit again. Any earlier version of a file can be restored from its **History** button.

## Which file changes what
| To change | Edit this file |
|---|---|
| Colors, fonts, spacing (light and dark) | `style.css`, the settings at the top under `:root` |
| Home page words and layout | `index.html` |
| About page words | `content/data/about.json` |
| Contact address | `CONTACT_EMAIL` near the top of `tools/build.py` |
| Article text | `content/articles/*.md` (titles and summaries: `content/data/articles.json`) |
| Research reports | `content/research/*.md` (list: `content/data/reports.json`; programs: `content/data/programs.json`) |
| Course readings | `content/courses/*.md` (list: `content/data/course_readings.json`) |
| Simulation titles and descriptions | `content/data/simulations.json` |
| Menu links, footer | `NAV` and the page template in `tools/build.py` (the home page keeps its own copy in `index.html`) |

Do not edit the generated pages (`about/index.html`, everything inside `articles/`, `research/`, `courses/`, `media/`, `simulations/` except the `js` folders): they are rewritten from the files above on every publish.
Markdown files use `#` for headings, `**bold**`, `*italic*`, `[text](link)` for links, and `-` for bullets.

## Editing on your computer instead
    pip install markdown
    python3 tools/build.py            # rebuilds the pages from content/
    python3 -m http.server 8080       # preview at http://localhost:8080
then commit and push (GitHub Desktop works well for this).

## Publish (GitHub Pages, repo kurtrowley/isrd-site)
This folder is a git repo on top of the old site's history. The old React site is kept on branch `archive/react-site-2026-10` (tag `react-site-final`). Pushing `main` runs `.github/workflows/deploy.yml`, which publishes the static files; `CNAME` keeps isrd.com, so the domain host needs no change.

    git push origin archive/react-site-2026-10     # first: keep the old site safe on GitHub
    git push origin main                           # then: publish (the site updates in a minute or two)

To roll back, redeploy the old site: `git push origin react-site-final:refs/heads/main --force-with-lease` restores the old source and its workflow.
After the first deploy, GitHub Settings > Pages should show source "GitHub Actions" (it already was).
Later updates: edit `content/`, run `python3 tools/build.py`, commit, push.

Keep real secrets out of this repo either way: a static site's files are public to anyone who visits.

## Content (brought over from the old sites)
Source lives in `content/` (Markdown plus JSON records); `python3 tools/build.py` turns it into the pages below. Edit the source, rebuild, commit.

| Section | Pages | Source |
|---|---|---|
| Research | 4 programs, 9 reports | `content/data/programs.json`, `reports.json`, `content/research/` |
| Articles | 7 | `content/data/articles.json`, `content/articles/` |
| Courses | 3 course descriptions, 10 readings | `content/data/courses.json`, `course_readings.json`, `content/courses/` |
| Media | 2 artworks with analysis | `content/data/media.json`, `media/` |
| Simulations | index and 8 pages | `content/data/simulations.json`, `simulations/` |

`pip install markdown` is needed to rebuild. Articles with diagrams load Mermaid from jsDelivr.

## Simulations (native, plain JavaScript)
All 8 are ported from the original TypeScript and plain-JS source into `simulations/`: no framework, no build step, no separate host.
- `simulations/js/engine.js` and `runner.js`: the shared canvas engine and page boot. Controls are generated from each sim's own `params`.
- `simulations/js/sims/`: Lorenz, boids, feedback, network diffusion, backroom dynamics, the latched loop. `toolkit/` holds the feedback-loop and attractor-basin helpers the latter uses.
- `simulations/postviral/`: the ME/CFS population simulator, with its own panels and `mecfs-sim.json` content.
- The Privileged Node is a placeholder page: the old site had no working version either.
The TypeScript was converted with a small script, then checked in a browser: every page starts, draws and shows live stats.

## Compared with the old sites
- **nonlinearsystemics.com:** every article, course reading and research report is the same document as one already here (94 to 100% match; the differences are only the old "Nonlinear Systemics" name). Two things were unique and are now brought over: the methodology and publications page (`content/research/methodology-and-publications.md`) and the Reader-First Writing System program.
- **systemicwriter.com** ("Integrated Systemics") held 4 simulations, all now native here. Retire the domain with a redirect to writer.isrd.com.
- **Not brought over (needs a decision):** the About text ("the practice", consulting) and contact emails on nonlinearsystemics.com, and the About page with people and principles in the isrd-site repo (`src/content/site.json`). The new site's About page (`content/data/about.json`) is a draft.
- One image (`learner_first_header.png`) is missing on the old site too, so it is omitted.

## Open decisions
- Contact address is kurt@isrd.com (set in `tools/build.py`; override with `CONTACT_EMAIL=... python3 tools/build.py`)
- Which old articles and simulations move first
- Subdomain list and launch order (writer is live; press and sim next)
