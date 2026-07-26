import { useParams, Link } from 'react-router-dom';
import { useMemo, useEffect, useRef } from 'react';
import { marked } from 'marked';
import mermaid from '../lib/mermaidTheme';
import articlesIndex from '../content/articles.json';
import { getContentByFile } from '../lib/content';

const TAG_COLORS: Record<string, string> = {
  Foundations: '#d4a847',
  Theory:      '#3a8fa8',
  Engineering: '#7a5ac8',
  Research:    '#c87832',
};

export function ArticleViewer() {
  const { slug } = useParams<{ slug: string }>();
  const bodyRef = useRef<HTMLDivElement>(null);
  const meta = articlesIndex.articles.find(a => a.slug === slug);

  const html = useMemo(() => {
    if (!meta) return '';
    const raw = getContentByFile(meta.file) ?? '';
    // Strip the leading H1, italic subtitle, and first HR — rendered in the hero.
    // Each step consumes any blank lines left behind so a later step's `^`
    // anchor still lines up with the start of the string.
    const stripped = raw
      .replace(/^#[^\n]*\n+/, '')
      .replace(/^\*[^\n*]+\*\n+/, '')
      .replace(/^---\n+/, '')
      .trimStart();
    return marked(stripped) as string;
  }, [meta]);

  // Render Mermaid diagrams after HTML is injected
  useEffect(() => {
    if (!bodyRef.current || !html) return;

    const renderMermaid = async () => {
      const codeBlocks = bodyRef.current!.querySelectorAll('code.language-mermaid');
      for (let i = 0; i < codeBlocks.length; i++) {
        const code = codeBlocks[i];
        const pre  = code.parentElement;
        if (!pre) continue;
        const definition = code.textContent ?? '';
        const id = `mermaid-${slug}-${i}`;
        try {
          const { svg } = await mermaid.render(id, definition);
          const wrapper = document.createElement('div');
          wrapper.className = 'mermaid-diagram';
          wrapper.innerHTML = svg;
          pre.replaceWith(wrapper);
        } catch (e) {
          console.warn('Mermaid render failed:', e);
        }
      }
    };
    renderMermaid();
  }, [html, slug]);

  if (!meta) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--muted)' }}>
        <h2 style={{ color: 'var(--text)' }}>Article not found</h2>
        <Link to="/articles" style={{ color: 'var(--accent)' }}>← Articles</Link>
      </div>
    );
  }

  const accent = TAG_COLORS[meta.tag] ?? 'var(--accent)';

  // Related articles — ranked by shared tag, same collection for now
  // (extends naturally once media/research/publications expose tags too).
  const others = articlesIndex.articles.filter(a => a.slug !== meta.slug);
  const sameTag = others.filter(a => a.tag === meta.tag);
  const related = (sameTag.length > 0 ? sameTag : others).slice(0, 3);

  return (
    <div style={{ minHeight: 'calc(100vh - 3.5rem)', background: '#060f16' }}>

      {/* Article hero */}
      <div style={{ borderBottom: '1px solid var(--line)', background: 'var(--panel)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 36px' }}>
          <Link to="/articles" style={{ fontSize: '.78rem', color: 'var(--muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            ← Articles
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: '.65rem', fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}>
              {meta.tag}
            </span>
            {meta.starred && <span style={{ fontSize: '.75rem', color: 'var(--gold)' }}>★ Core Article</span>}
          </div>
          <h1 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 600, color: 'var(--text)', lineHeight: 1.2, margin: '0 0 14px' }}>
            {meta.title}
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.55, margin: '0 0 20px' }}>
            {meta.subtitle}
          </p>
          <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>
            {meta.author} · {meta.date}
          </div>
        </div>
      </div>

      {/* Article body */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div ref={bodyRef} className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      {/* Related content */}
      {related.length > 0 && (
        <div style={{ borderTop: '1px solid var(--line)', background: 'var(--panel)' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
            <h3 style={{ fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', margin: '0 0 18px' }}>
              {sameTag.length > 0 ? `Related — ${meta.tag}` : 'More from ISRD'}
            </h3>
            <div style={{ display: 'grid', gap: 14 }}>
              {related.map(r => (
                <Link key={r.slug} to={`/articles/${r.slug}`} style={{ display: 'block', padding: '14px 18px', border: '1px solid var(--line)', borderRadius: 10, textDecoration: 'none', background: 'var(--bg)' }}>
                  <div style={{ fontSize: '.95rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{r.title}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{r.subtitle}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer nav */}
      <div style={{ borderTop: '1px solid var(--line)', padding: '24px', textAlign: 'center' }}>
        <Link to="/articles" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '.85rem' }}>
          ← Back to Articles
        </Link>
      </div>

      <style>{`
        /* ── Body typography ── */
        .article-body {
          font-family: 'Lora', Georgia, serif;
          font-size: 1.05rem;
          line-height: 1.85;
          color: var(--muted);
        }
        .article-body p { margin: 0 0 1.5em; }

        .article-body h2 {
          font-family: 'Inter', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text);
          margin: 2.6em 0 0.8em;
          letter-spacing: -.01em;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--line);
        }
        .article-body h3 {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: var(--text);
          margin: 2em 0 0.6em;
        }
        .article-body hr {
          border: none;
          border-top: 1px solid var(--line);
          margin: 2.8em 0;
        }
        .article-body strong { color: var(--text); font-weight: 600; }
        .article-body em { color: var(--muted); font-style: italic; }

        .article-body blockquote {
          border-left: 3px solid var(--accent);
          margin: 1.8em 0;
          padding: 0.5em 0 0.5em 1.4em;
          color: var(--muted);
          font-style: italic;
        }
        .article-body ul, .article-body ol {
          margin: 0 0 1.5em 1.4em;
          padding: 0;
        }
        .article-body li { margin-bottom: 0.5em; }
        .article-body a { color: var(--accent); }

        .article-body code {
          font-family: 'JetBrains Mono', monospace;
          font-size: .85em;
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 4px;
          padding: 1px 6px;
          color: var(--accent2);
        }

        /* ── Images ── */
        .article-body img {
          max-width: 100%;
          height: auto;
          border-radius: 10px;
          border: 1px solid var(--line);
          display: block;
          margin: 1.8em auto 0.6em;
        }
        .article-body a img { cursor: pointer; }
        .article-body a img:hover { opacity: 0.88; transform: scale(1.005); transition: opacity .2s, transform .2s; }
        .article-body img + em {
          display: block;
          text-align: center;
          font-size: .8rem;
          color: var(--muted);
          margin-bottom: 1.8em;
          font-style: italic;
          opacity: .75;
        }

        /* ── Mermaid diagrams ── */
        .mermaid-diagram {
          margin: 2em 0;
          padding: 20px 16px;
          background: #040e16;
          border: 1px solid var(--line);
          border-radius: 12px;
          overflow-x: auto;
        }
        .mermaid-diagram svg {
          display: block;
          margin: 0 auto;
          max-width: 100%;
          height: auto;
        }
        /* Override mermaid label backgrounds */
        .mermaid-diagram .label { color: #c8dfe8 !important; }
        .mermaid-diagram .nodeLabel { color: #c8dfe8 !important; }
      `}</style>
    </div>
  );
}
