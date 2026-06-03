import { useParams, Link } from 'react-router-dom';
import mediaData from '../content/media.json';

// Flatten all items across sections for lookup
const allItems = mediaData.sections.flatMap(s =>
  s.items.map(item => ({ ...item, sectionTitle: s.title, sectionId: s.id }))
) as Array<any>;

const TAG_COLORS: Record<string, string> = {
  'Visual Arts':          '#c87832',
  'General Systems Theory':'#d4a847',
  'Isomorphism':          '#7a5ac8',
  'Emergence':            '#3a8fa8',
  'Fractal':              '#50c090',
  'Generative':           '#3a6fa8',
};

export function MediaViewer() {
  const { slug } = useParams<{ slug: string }>();
  const item = allItems.find(i => i.slug === slug);

  if (!item) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--muted)' }}>
        <h2 style={{ color: 'var(--text)' }}>Not found</h2>
        <Link to="/media" style={{ color: 'var(--accent)' }}>← Media</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 3.5rem)', background: '#060f16' }}>

      {/* Breadcrumb */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--line)', background: 'var(--panel)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/media" style={{ fontSize: '.78rem', color: 'var(--muted)', textDecoration: 'none' }}>Media</Link>
        <span style={{ color: 'var(--line)' }}>/</span>
        <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{item.sectionTitle}</span>
        <span style={{ color: 'var(--line)' }}>/</span>
        <span style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--accent2)' }}>{item.title}</span>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Caption label */}
        {item.caption && (
          <div style={{ fontSize: '.8rem', color: 'var(--gold)', marginBottom: 16, fontWeight: 600 }}>
            {item.caption}
          </div>
        )}

        {/* Title */}
        <h1 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 600, color: 'var(--text)', margin: '0 0 8px', lineHeight: 1.25 }}>
          {item.title}
        </h1>
        <p style={{ fontSize: '.95rem', color: 'var(--muted)', fontStyle: 'italic', margin: '0 0 24px', lineHeight: 1.5 }}>
          {item.subtitle}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 32 }}>
          {item.tags?.map((tag: string) => {
            const color = TAG_COLORS[tag] ?? 'var(--accent)';
            return (
              <span key={tag} style={{ fontSize: '.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: `${color}18`, border: `1px solid ${color}40`, color }}>
                {tag}
              </span>
            );
          })}
        </div>

        {/* Main image — large, prominent */}
        {item.image && (
          <div style={{ marginBottom: 40, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)', background: 'var(--panel-b)' }}>
            <img
              src={item.image}
              alt={item.title}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        )}

        {/* Analysis section */}
        {item.analysis && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>

            {/* Overview */}
            <div>
              <h2 style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--muted)', fontWeight: 700, margin: '0 0 14px' }}>
                Thematic Overview
              </h2>
              <p style={{ fontSize: '.92rem', color: 'var(--muted)', lineHeight: 1.75, margin: 0 }}>
                {item.analysis.overview}
              </p>
            </div>

            {/* Visual elements breakdown */}
            <div>
              <h2 style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--muted)', fontWeight: 700, margin: '0 0 14px' }}>
                Behind the Art — Visual Elements & Design Decisions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {item.analysis.elements?.map((el: any, i: number) => (
                  <div key={i} style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--panel)' }}>
                    <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                      {el.title}
                    </div>
                    <p style={{ fontSize: '.83rem', color: 'var(--muted)', lineHeight: 1.65, margin: 0 }}>
                      {el.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer links */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Link to="/media" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '.85rem' }}>
            ← Back to Media
          </Link>
          {item.article_link && (
            <Link to={item.article_link} style={{ color: 'var(--accent2)', textDecoration: 'none', fontSize: '.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '.7rem', padding: '2px 8px', borderRadius: 999, background: 'rgba(122,204,224,0.12)', border: '1px solid rgba(122,204,224,0.3)' }}>Article</span>
              Read the related article →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
