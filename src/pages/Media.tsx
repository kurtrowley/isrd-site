import { Link } from 'react-router-dom';
import { NodeGraph } from '../components/NodeGraph';
import mediaData from '../content/media.json';

const TAG_COLORS: Record<string, string> = {
  'Visual Arts':           '#c87832',
  'General Systems Theory':'#d4a847',
  'Isomorphism':           '#7a5ac8',
  'Emergence':             '#3a8fa8',
  'Fractal':               '#50c090',
  'Generative':            '#3a6fa8',
  'Music':                 '#d4a847',
  'Film':                  '#3a6fa8',
  'Literature':            '#c87832',
  'Architecture':          '#6a9aaa',
};

export function Media() {
  const { page, sections, coming_soon } = mediaData;

  return (
    <div style={{ minHeight: 'calc(100vh - 3.5rem)', background: '#060f16' }}>

      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--line)' }}>
        <NodeGraph />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '48px 24px 36px' }}>
          <div style={{ fontSize: '.68rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, fontWeight: 600 }}>
            {page.eyebrow}
          </div>
          <h1 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontWeight: 600, color: 'var(--text)', margin: '0 0 14px' }}>
            {page.title}
          </h1>
          <p style={{ fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 680, margin: 0 }}>
            {page.intro}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>

        {/* Active sections */}
        {sections.map(section => (
          <div key={section.id} style={{ marginBottom: 56 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h2 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: '1.4rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                {section.title}
              </h2>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>
            <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.65, maxWidth: 780, margin: '0 0 28px' }}>
              {section.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
              {(section.items as any[]).map(item => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}

        {/* Coming soon */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
              Coming Soon
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {coming_soon.map(item => (
              <div key={item.title} style={{ padding: '16px 18px', borderRadius: 10, border: '1px dashed var(--line)', background: 'rgba(255,255,255,0.01)', opacity: .7 }}>
                <div style={{ fontSize: '.88rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 5 }}>{item.title}</div>
                <p style={{ fontSize: '.78rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`.media-card:hover { border-color: var(--accent) !important; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.4); }`}</style>
    </div>
  );
}

function MediaCard({ item }: { item: any }) {
  const card = (
    <div className="media-card"
      style={{ borderRadius: 14, border: '1px solid var(--line)', background: 'var(--panel)', overflow: 'hidden', transition: 'all .2s', cursor: item.slug ? 'pointer' : 'default', height: '100%' }}>

      {item.image && (
        <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: 'var(--panel-b)' }}>
          <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5, gap: 10 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: 0, lineHeight: 1.3 }}>{item.title}</h3>
          {item.slug && <span style={{ fontSize: '.75rem', color: 'var(--accent)', flexShrink: 0, fontWeight: 600 }}>View →</span>}
        </div>
        {item.subtitle && (
          <p style={{ fontSize: '.8rem', color: 'var(--muted)', fontStyle: 'italic', margin: '0 0 10px', lineHeight: 1.4 }}>{item.subtitle}</p>
        )}
        <p style={{ fontSize: '.83rem', color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 14px' }}>{item.description}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {item.tags?.map((tag: string) => {
            const color = TAG_COLORS[tag] ?? 'var(--accent)';
            return (
              <span key={tag} style={{ fontSize: '.62rem', padding: '2px 8px', borderRadius: 999, background: `${color}18`, border: `1px solid ${color}35`, color }}>
                {tag}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );

  return item.slug
    ? <Link to={`/media/${item.slug}`} style={{ textDecoration: 'none', display: 'block' }}>{card}</Link>
    : card;
}
