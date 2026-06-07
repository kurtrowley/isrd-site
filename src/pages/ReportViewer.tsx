import { useParams, Link } from 'react-router-dom';
import { useMemo, useEffect, useRef } from 'react';
import { marked } from 'marked';
import mermaid from '../lib/mermaidTheme';
import reportsIndex from '../content/reports.json';
import researchData from '../content/research.json';
import { getContentByFile } from '../lib/content';

const TAG_COLORS: Record<string, string> = {
  'Case Study':  '#c87832',
  Methodology:   '#50c090',
  Research:      '#3a8fa8',
};

export function ReportViewer() {
  const { slug } = useParams<{ slug: string }>();
  const bodyRef = useRef<HTMLDivElement>(null);
  const meta = reportsIndex.reports.find(r => r.slug === slug);
  const program = meta ? researchData.programs.find(p => p.id === (meta as any).program) : undefined;

  const html = useMemo(() => {
    if (!meta) return '';
    const raw = getContentByFile(meta.file) ?? '';
    // Strip the leading H1, bold byline, and first HR — rendered in the hero
    const stripped = raw
      .replace(/^#[^\n]+\n/, '')
      .replace(/\*\*[^\n*]+\*\*\s*\n/, '')
      .replace(/^[^\n]*\|[^\n]*\n/, '')
      .replace(/^\s*---\n/, '')
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
        const id = `mermaid-report-${slug}-${i}`;
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
        <h2 style={{ color: 'var(--text)' }}>Report not found</h2>
        <Link to="/publications" style={{ color: 'var(--accent)' }}>← Publications</Link>
      </div>
    );
  }

  const accent = TAG_COLORS[meta.tag] ?? 'var(--accent)';

  // Related — other research reports, then fall back to articles sharing the program
  const otherReports = reportsIndex.reports.filter(r => r.slug !== meta.slug);

  return (
    <div style={{ minHeight: 'calc(100vh - 3.5rem)', background: '#060f16' }}>

      {/* Report hero */}
      <div style={{ borderBottom: '1px solid var(--line)', background: 'var(--panel)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 36px' }}>
          <Link to="/publications" style={{ fontSize: '.78rem', color: 'var(--muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            ← Publications
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: '.65rem', fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}>
              {meta.tag}
            </span>
            <span style={{ fontSize: '.65rem', fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: 'rgba(58,143,168,0.12)', border: '1px solid rgba(58,143,168,0.3)', color: 'var(--accent)' }}>
              Research Report
            </span>
            {(meta as any).starred && <span style={{ fontSize: '.75rem', color: 'var(--gold)' }}>★ Featured</span>}
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

      {/* Report body */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div ref={bodyRef} className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      {/* Related research program */}
      {program && (
        <div style={{ borderTop: '1px solid var(--line)', background: 'var(--panel)' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
            <h3 style={{ fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', margin: '0 0 18px' }}>
              From the research program
            </h3>
            <Link to={program.path} style={{ display: 'block', padding: '16px 20px', border: '1px solid var(--line)', borderRadius: 10, textDecoration: 'none', background: 'var(--bg)' }}>
              <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 4 }}>{program.title}</div>
              <div style={{ fontSize: '.95rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{program.subtitle}</div>
              <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>View program →</div>
            </Link>
          </div>
        </div>
      )}

      {/* More reports */}
      {otherReports.length > 0 && (
        <div style={{ borderTop: '1px solid var(--line)' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
            <h3 style={{ fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', margin: '0 0 18px' }}>
              More Research Reports
            </h3>
            <div style={{ display: 'grid', gap: 14 }}>
              {otherReports.slice(0, 3).map(r => (
                <Link key={r.slug} to={`/publications/reports/${r.slug}`} style={{ display: 'block', padding: '14px 18px', border: '1px solid var(--line)', borderRadius: 10, textDecoration: 'none', background: 'var(--bg)' }}>
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
        <Link to="/publications" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '.85rem' }}>
          ← Back to Publications
        </Link>
      </div>

      <style>{`
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
        .article-body hr { border: none; border-top: 1px solid var(--line); margin: 2.8em 0; }
        .article-body strong { color: var(--text); font-weight: 600; }
        .article-body em { color: var(--muted); font-style: italic; }
        .article-body blockquote {
          border-left: 3px solid var(--accent);
          margin: 1.8em 0;
          padding: 0.5em 0 0.5em 1.4em;
          color: var(--muted);
          font-style: italic;
        }
        .article-body ul, .article-body ol { margin: 0 0 1.5em 1.4em; padding: 0; }
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
        .article-body img {
          max-width: 100%;
          height: auto;
          border-radius: 10px;
          border: 1px solid var(--line);
          display: block;
          margin: 1.8em auto 0.6em;
        }
        .mermaid-diagram {
          margin: 2em 0;
          padding: 20px 16px;
          background: #040e16;
          border: 1px solid var(--line);
          border-radius: 12px;
          overflow-x: auto;
        }
        .mermaid-diagram svg { display: block; margin: 0 auto; max-width: 100%; height: auto; }
        .mermaid-diagram .label { color: #c8dfe8 !important; }
        .mermaid-diagram .nodeLabel { color: #c8dfe8 !important; }
      `}</style>
    </div>
  );
}
