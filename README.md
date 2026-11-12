# ISRD website

Interdisciplinary Systems R&D. A static site: plain HTML, one stylesheet, a little JavaScript. The text lives in files you can edit; GitHub rebuilds and publishes the site whenever you save a change.

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
| Home page name, one-line description and purpose statement | `NAME`, `TAGLINE` and `PURPOSE` near the top of `tools/build.py` |
| Contact address (footer) | `CONTACT_EMAIL` near the top of `tools/build.py` |
| Article text | `content/articles/*.md` (titles and summaries: `content/data/articles.json`) |
| Research reports and summaries | `content/research/*.md` (list: `content/data/reports.json`; summaries: `content/data/programs.json`) |
| Course readings | `content/courses/*.md` (list: `content/data/course_readings.json`) |
| Software menu, Software page and each app's landing page | `content/data/software.json`; landing page text: `content/software/*.md` |
| Simulation titles and descriptions | `content/data/simulations.json` |
| Menu, footer | the page template in `tools/build.py` |

Every piece of writing appears in one list at `/publications/`, each on its own page at `/publications/<slug>/`. All are categorized "Article" (the list heading reads "Articles"); to give one a different category later, add `"category": "..."` to its record in the `.json` list.

Do not edit the generated pages (`index.html`, `404.html`, everything inside `publications/`, `software/`, and `simulations/` except the `js` folders): they are rewritten from the files above on every publish.
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

## Software and hosting
The website itself is served by GitHub Pages. The two apps are separate sites on their own subdomains, listed in `content/data/software.json`:

| App | Address |
|---|---|
| ISRD Writing Studio | writer.isrd.com |
| Bison Island Studios | games.isrd.com |

The apps are moving off DigitalOcean to a Lubuntu server at home, reached through a Cloudflare Tunnel. This is a stub until the server's local IP is known:

    tunnel origin (local IP and ports): TO BE FILLED IN
    writer.isrd.com -> http://<local-ip>:<port>
    games.isrd.com  -> http://<local-ip>:<port>

The local IP belongs in the tunnel's own config on the server (`cloudflared`), not in this website: the site only links to the two addresses above, which stay the same after the move. In `software.json`, an app with `"live": false` shows as a "Moving to a new server" card with no link; set it to `"live": true` once the app answers at its address.

## Content
Source lives in `content/` (Markdown plus JSON records); `python3 tools/build.py` turns it into the pages. Edit the source, rebuild, commit.

| Section | Pages | Source |
|---|---|---|
| Publications | 33: 7 articles, 9 research reports, 6 research summaries, 10 course readings, 1 visual essay | `content/data/*.json`, `content/articles/`, `content/research/`, `content/courses/`, `media/` |
| Software | 1 page, 2 apps | `content/data/software.json` |
| Simulations | index and 8 pages (linked from the footer and from publications) | `content/data/simulations.json`, `simulations/` |

Old addresses (`/articles/...`, `/research/...`, `/courses/...`, `/media/`, `/about/`) are redirected by a small script in the 404 page. `content/data/about.json` and `courses.json` are kept as source but no page is built from them now.

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
- Local IP and ports for the Cloudflare Tunnel (see Software and hosting)
- Whether the simulations stay on this site, move under Software, or go
