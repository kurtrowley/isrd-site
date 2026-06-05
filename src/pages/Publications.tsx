import { Link } from 'react-router-dom';
import { NodeGraph } from '../components/NodeGraph';
import articlesData from '../content/articles.json';
import mediaData from '../content/media.json';

// ── Data ──────────────────────────────────────────────────────────────────────

const articles = articlesData.articles as Array<{
  slug: string; title: string; subtitle: string; description: string;
  tag: string; starred?: boolean; pinned?: boolean; author: string; date: string;
}>;

const pinned    = articles.filter(a => a.pinned);
const otherArticles = articles.filter(a => !a.pinned);

const ARTICLE_TAG_COLORS: Record<string, string> = {
  Foundations: '#d4a847',
  Theory:      '#3a8fa8',
  Engineering: '#7a5ac8',
  Research:    '#c87832',
  Methodology: '#50c090',
};

const MEDIA_TAG_COLORS: Record<string, string> = {
  'Visual Arts':            '#c87832',
  'General Systems Theory': '#d4a847',
  'Isomorphism':            '#7a5ac8',
  'Emergence':              '#3a8fa8',
  'Systems History':        '#c87832',
  'Paradigm Shift':         '#7a5ac8',
  'Complexity':             '#3a8fa8',
};

// Flatten all media items
const allMediaItems = mediaData.sections.flatMap(s =>
  (s.items as any[]).map(item => ({ ...item, sectionTitle: s.title }))
);

// Books placeholder
const BOOKS_PLACEHOLDER = {
  note: "ISRD's first titles are in development — applying systems methodology to complex domains in health, organisation, and learning.",
  upcoming: [
    { title: 'The Attractor Approach', subtitle: 'Systems-based intervention design for treatment-resistant conditions', status: 'In Development' },
    { title: 'Learner-First', subtitle: 'A practitioner guide to designing instruction that shifts mental models', status: 'In Development' },
  ],
};

// Coming soon media types (from media.json + additions)
const COMING_SOON = [
  { title: 'Music', desc: 'Harmony, rhythm, and the feedback structures of musical form.' },
  { title: 'Film', desc: 'Narrative systems, nonlinear storytelling, and emergent meaning.' },
  { title: 'Literature', desc: 'Language as a complex adaptive system — and the novels that know it.' },
  { title: 'Architecture', desc: 'Built environments as systemic interventions in human behavior.' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function Publications() {
  return (
    <div style={{ minHeight: 'calc(100vh - 3.5rem)', background: '#060f16' }}>

      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--line)' }}>
        <NodeGraph />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '48px 24px 36px' }}>
          <div style={{ fontSize: '.68rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, fontWeight: 600 }}>
            ISRD · Publications
          </div>
          <h1 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontWeight: 600, color: 'var(--text)', margin: '0 0 12px' }}>
            Publications
          </h1>
          <p style={{ fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 620, margin: 0 }}>
            Articles, books, and media from ISRD — theoretical writing, applied methodology, and systemic approaches to understanding complexity in art, science, and human systems.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '44px 24px 80px' }}>

        {/* ── Articles ── */}
        <Section label="Articles" color="#d4a847" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 52 }}>
          {[...pinned, ...otherArticles].map(article => {
            const accent = ARTICLE_TAG_COLORS[article.tag] ?? 'var(--accent)';
            return (
              <Link key={article.slug} to={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
                <div className="pub-card" style={{ padding: '16px 20px', borderRadius: 12, border: `1px solid ${article.pinned ? 'rgba(212,168,71,0.25)' : 'var(--line)'}`, background: article.pinned ? 'rgba(212,168,71,0.04)' : 'var(--panel)', transition: 'all .18s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        {article.pinned && <span style={{ fontSize: '.72rem', color: 'var(--gold)' }}>★</span>}
                        <h3 style={{ fontSize: '.95rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>{article.title}</h3>
                      </div>
                      {article.subtitle && <p style={{ fontSize: '.8rem', color: 'var(--muted)', fontStyle: 'italic', margin: '0 0 6px', lineHeight: 1.4 }}>{article.subtitle}</p>}
                      <p style={{ fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.55, margin: '0 0 6px' }}>{article.description}</p>
                      <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{article.author} · {article.date}</span>
                    </div>
                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <span style={{ fontSize: '.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}>{article.tag}</span>
                      <span style={{ fontSize: '.75rem', color: accent, fontWeight: 600 }}>Read →</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── Books ── */}
        <Section label="Books" color="#7a5ac8" />
        <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.65, maxWidth: 680, margin: '0 0 18px', fontStyle: 'italic' }}>
          {BOOKS_PLACEHOLDER.note}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 52 }}>
          {BOOKS_PLACEHOLDER.upcoming.map(book => (
            <div key={book.title} style={{ padding: '16px 18px', borderRadius: 10, border: '1px dashed rgba(122,90,200,0.4)', background: 'rgba(122,90,200,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                <h3 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{book.title}</h3>
                <span style={{ fontSize: '.62rem', color: '#7a5ac8', fontStyle: 'italic', flexShrink: 0 }}>{book.status}</span>
              </div>
              <p style={{ fontSize: '.78rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>{book.subtitle}</p>
            </div>
          ))}
        </div>

        {/* ── Visual Arts ── */}
        {mediaData.sections.map(section => (
          <div key={section.id} style={{ marginBottom: 52 }}>
            <Section label={section.title} color="#c87832" />
            <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.65, maxWidth: 780, margin: '0 0 20px' }}>
              {section.description}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {(section.items as any[]).map(item => {
                const card = (
                  <div className="pub-card" style={{ borderRadius: 12, border: '1px solid var(--line)', background: 'var(--panel)', overflow: 'hidden', transition: 'all .2s', cursor: item.slug ? 'pointer' : 'default' }}>
                    {item.image && (
                      <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: 'var(--panel-b)' }}>
                        <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                    )}
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 5 }}>
                        <h3 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text)', margin: 0, lineHeight: 1.3 }}>{item.title}</h3>
                        {item.slug && <span style={{ fontSize: '.72rem', color: 'var(--accent)', flexShrink: 0, fontWeight: 600 }}>View →</span>}
                      </div>
                      {item.subtitle && <p style={{ fontSize: '.77rem', color: 'var(--muted)', fontStyle: 'italic', margin: '0 0 7px', lineHeight: 1.35 }}>{item.subtitle}</p>}
                      <p style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.55, margin: '0 0 10px' }}>{item.description}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {item.tags?.map((tag: string) => {
                          const c = MEDIA_TAG_COLORS[tag] ?? 'var(--accent)';
                          return <span key={tag} style={{ fontSize: '.6rem', padding: '1px 7px', borderRadius: 999, background: `${c}18`, border: `1px solid ${c}35`, color: c }}>{tag}</span>;
                        })}
                      </div>
                    </div>
                  </div>
                );
                return item.slug
                  ? <Link key={item.id} to={`/media/${item.slug}`} style={{ textDecoration: 'none' }}>{card}</Link>
                  : <div key={item.id}>{card}</div>;
              })}
            </div>
          </div>
        ))}

        {/* ── Coming Soon ── */}
        <Section label="Coming Soon" color="var(--muted)" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {COMING_SOON.map(item => (
            <div key={item.title} style={{ padding: '14px 16px', borderRadius: 10, border: '1px dashed var(--line)', background: 'rgba(255,255,255,0.01)', opacity: .7 }}>
              <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>{item.title}</div>
              <p style={{ fontSize: '.76rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>

      </div>

      <style>{`.pub-card:hover { border-color: var(--accent) !important; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(0,0,0,0.3); }`}</style>
    </div>
  );
}

function Section({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <h2 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>{label}</h2>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${color}60, transparent)` }} />
    </div>
  );
}
