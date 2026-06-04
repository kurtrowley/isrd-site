import { Link } from 'react-router-dom';
import { NodeGraph } from '../components/NodeGraph';
import articlesData from '../content/articles.json';

const articles = articlesData.articles as Array<{
  slug: string; title: string; subtitle: string; description: string;
  tag: string; starred?: boolean; pinned?: boolean; author: string; date: string; file: string;
}>;

// Pinned always first, then remaining starred, then unstarred
const pinned    = articles.filter(a => a.pinned);
const starred   = articles.filter(a => a.starred && !a.pinned);
const unstarred = articles.filter(a => !a.starred);

const TAG_COLORS: Record<string, string> = {
  Foundations: '#d4a847',
  Theory:      '#3a8fa8',
  Engineering: '#7a5ac8',
  Research:    '#c87832',
};

export function Articles() {
  return (
    <div style={{ minHeight: 'calc(100vh - 3.5rem)', background: '#060f16' }}>

      {/* Hero strip */}
      <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--line)' }}>
        <NodeGraph />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '48px 24px 36px' }}>
          <div style={{ fontSize: '.68rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, fontWeight: 600 }}>
            ISRD · Articles
          </div>
          <h1 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontWeight: 600, color: 'var(--text)', margin: '0 0 10px' }}>
            Articles & Theory
          </h1>
          <p style={{ fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.6, maxWidth: 560, margin: 0 }}>
            Foundational thinking on systemic synthesis, feedback dynamics, and AI integration theory.
          </p>
        </div>
      </div>

      {/* Articles */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

        {(pinned.length > 0 || starred.length > 0) && (
          <div style={{ marginBottom: 36 }}>
            <SectionDivider label="★ Core Articles" gold />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pinned.map(a => <ArticleCard key={a.slug} article={a} pinned />)}
              {starred.map(a => <ArticleCard key={a.slug} article={a} pinned />)}
            </div>
          </div>
        )}

        {unstarred.length > 0 && (
          <div>
            <SectionDivider label="Further Reading" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {unstarred.map(a => <ArticleCard key={a.slug} article={a} />)}
            </div>
          </div>
        )}

        {articles.length === 0 && (
          <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Articles coming soon.</p>
        )}
      </div>
    </div>
  );
}

function SectionDivider({ label, gold = false }: { label: string; gold?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <span style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: gold ? 'var(--gold)' : 'var(--muted)', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
    </div>
  );
}

function ArticleCard({ article, pinned = false }: { article: typeof articles[0]; pinned?: boolean }) {
  const accent = TAG_COLORS[article.tag] ?? 'var(--accent)';
  return (
    <Link to={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
      <div className="article-card" style={{
        padding: '18px 22px', borderRadius: 12, cursor: 'pointer', transition: 'all .18s',
        border: `1px solid ${pinned ? 'rgba(212,168,71,0.3)' : 'var(--line)'}`,
        background: pinned ? 'rgba(212,168,71,0.04)' : 'var(--panel)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              {pinned && <span style={{ fontSize: '.75rem', color: 'var(--gold)' }}>★</span>}
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>{article.title}</h3>
            </div>
            {article.subtitle && (
              <p style={{ fontSize: '.82rem', color: 'var(--muted)', fontStyle: 'italic', margin: '0 0 8px', lineHeight: 1.4 }}>
                {article.subtitle}
              </p>
            )}
            <p style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.55, margin: '0 0 10px' }}>
              {article.description}
            </p>
            <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>
              {article.author} · {article.date}
            </span>
          </div>
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <span style={{ fontSize: '.65rem', fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}>
              {article.tag}
            </span>
            <span style={{ fontSize: '.78rem', color: accent, fontWeight: 600 }}>Read →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
