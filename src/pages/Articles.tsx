import { NodeGraph } from '../components/NodeGraph';
import labsData from '../content/labs.json';

const foundationsContent = labsData.labs.find(l => l.id === 'foundations')!;
const articles = (foundationsContent as any).whitepapers as Array<{
  title: string; desc: string; tag: string; starred?: boolean;
}>;

const starred   = articles.filter(a => a.starred);
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
      {/* Hero strip with node graph */}
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

        {/* Starred / pinned */}
        {starred.length > 0 && (
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                ★ Core Articles
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {starred.map(a => <ArticleCard key={a.title} article={a} pinned />)}
            </div>
          </div>
        )}

        {/* All other articles */}
        {unstarred.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Further Reading
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {unstarred.map(a => <ArticleCard key={a.title} article={a} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleCard({ article, pinned = false }: { article: { title: string; desc: string; tag: string }; pinned?: boolean }) {
  const accent = TAG_COLORS[article.tag] ?? 'var(--accent)';
  return (
    <div
      className="article-card"
      style={{
        padding: '16px 20px',
        borderRadius: 12,
        border: `1px solid ${pinned ? 'rgba(212,168,71,0.3)' : 'var(--line)'}`,
        background: pinned ? 'rgba(212,168,71,0.04)' : 'var(--panel)',
        cursor: 'pointer',
        transition: 'all .18s',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 16,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          {pinned && <span style={{ fontSize: '.75rem', color: 'var(--gold)' }}>★</span>}
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>{article.title}</h3>
        </div>
        <p style={{ fontSize: '.83rem', color: 'var(--muted)', lineHeight: 1.55, margin: 0 }}>{article.desc}</p>
      </div>
      <span style={{
        flexShrink: 0,
        fontSize: '.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999,
        background: `${accent}18`, border: `1px solid ${accent}40`, color: accent,
        letterSpacing: '.04em',
      }}>
        {article.tag}
      </span>
    </div>
  );
}
