import { Link } from 'react-router-dom';
import { NodeGraph } from '../components/NodeGraph';
import siteContent from '../content/site.json';
import articlesData from '../content/articles.json';
import simContent from '../content/simulations.json';
import researchData from '../content/research.json';

const { hero, mission } = siteContent;

// Featured article = pinned or first starred
const featuredArticle = (articlesData.articles as any[]).find(a => a.pinned) ?? articlesData.articles[0];

const SECTION_CARDS = [
  {
    id: 'articles',
    label: 'Articles',
    accent: '#d4a847',
    path: '/articles',
    title: featuredArticle?.title ?? 'Articles & Theory',
    body: featuredArticle?.description ?? 'Foundational thinking on systemic synthesis, feedback dynamics, and AI integration theory.',
    cta: 'Read articles →',
    tag: featuredArticle?.tag,
  },
  {
    id: 'simulations',
    label: 'Simulations',
    accent: '#3a8fa8',
    path: '/simulations',
    title: 'Foundry Simulations',
    body: 'Interactive demonstrations of core systemic concepts — Emergence, Feedback Loops, and Chaos Theory. Run them in your browser.',
    cta: 'Try a simulation →',
    items: simContent.simulations.filter((s: any) => !s.type || s.type !== 'research').map(s => s.title),
  },
  {
    id: 'research',
    label: 'Research',
    accent: '#7a5ac8',
    path: '/research',
    title: 'Research Programs',
    body: 'Active ISRD research programs using systemic simulation and AI-integrated analysis across health, writing, and macro-systems.',
    cta: 'View programs →',
    items: researchData.programs.map(p => p.title),
  },
  {
    id: 'media',
    label: 'Media',
    accent: '#c87832',
    path: '/media',
    title: 'Media & Systems Science',
    body: 'How systems thinking appears in visual art, music, film, and literature — and what those works reveal about complexity.',
    cta: 'Explore media →',
  },
];

export function Home() {
  return (
    <div>
      {/* ── Hero ── */}
      <section style={{ position:'relative', overflow:'hidden', background:'#060f16' }}>
        <NodeGraph />
        <div style={{ position:'relative', zIndex:1, maxWidth:1280, margin:'0 auto', padding:'80px 24px 64px', textAlign:'center' }}>
          <div style={{ maxWidth:680, margin:'0 auto' }}>
            <div style={{ fontSize:'.72rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--gold)', marginBottom:16, fontWeight:600 }}>
              {hero.eyebrow}
            </div>
            <h1 style={{ fontFamily:'Lora,Georgia,serif', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:600, color:'var(--text)', lineHeight:1.15, margin:'0 0 20px' }}>
              {hero.headline_prefix}<br />
              <span style={{ color:'var(--accent2)' }}>{hero.headline_accent}</span>
            </h1>
            <p style={{ fontSize:'1.05rem', color:'var(--muted)', lineHeight:1.7, margin:'0 0 32px' }}>
              {hero.body}
            </p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
              <Link to={hero.cta_primary.href}
                style={{ padding:'10px 24px', borderRadius:10, background:'var(--accent)', color:'#fff', textDecoration:'none', fontWeight:600, fontSize:'.9rem' }}>
                {hero.cta_primary.label}
              </Link>
              <Link to={hero.cta_secondary.href}
                style={{ padding:'10px 24px', borderRadius:10, border:'1px solid var(--line)', color:'var(--text)', textDecoration:'none', fontWeight:500, fontSize:'.9rem', background:'var(--panel)' }}>
                {hero.cta_secondary.label}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section cards ── */}
      <section style={{ maxWidth:1100, margin:'0 auto', padding:'60px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:20 }}>
          {SECTION_CARDS.map(card => (
            <Link key={card.id} to={card.path} style={{ textDecoration:'none' }}>
              <div className="section-card" style={{
                padding:'22px 24px', borderRadius:14, height:'100%',
                border:`1px solid var(--line)`, background:'var(--panel)',
                transition:'all .2s', cursor:'pointer', display:'flex', flexDirection:'column',
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <span style={{ fontSize:'.7rem', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:card.accent }}>
                    {card.label}
                  </span>
                  {card.tag && (
                    <span style={{ fontSize:'.6rem', padding:'1px 7px', borderRadius:999, background:`${card.accent}18`, border:`1px solid ${card.accent}35`, color:card.accent }}>
                      {card.tag}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize:'.95rem', fontWeight:700, color:'var(--text)', margin:'0 0 8px', lineHeight:1.3 }}>{card.title}</h3>
                <p style={{ fontSize:'.8rem', color:'var(--muted)', lineHeight:1.6, margin:'0 0 14px', flex:1 }}>{card.body}</p>
                {card.items && (
                  <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:14 }}>
                    {card.items.slice(0,3).map(item => (
                      <div key={item} style={{ fontSize:'.72rem', color:'var(--muted)', display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ width:4, height:4, borderRadius:'50%', background:card.accent, flexShrink:0 }} />
                        {item}
                      </div>
                    ))}
                  </div>
                )}
                <span style={{ fontSize:'.78rem', color:card.accent, fontWeight:600, marginTop:'auto' }}>{card.cta}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Mission ── */}
      <section style={{ borderTop:'1px solid var(--line)', background:'var(--panel)', padding:'48px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <h2 style={{ fontFamily:'Lora,Georgia,serif', fontSize:'1.4rem', color:'var(--text)', margin:'0 0 16px' }}>
            {mission.heading}
          </h2>
          <p style={{ color:'var(--muted)', lineHeight:1.75, fontSize:'.95rem', maxWidth:700 }}
            dangerouslySetInnerHTML={{ __html: mission.body }} />
        </div>
      </section>

      <style>{`
        .section-card:hover { border-color: var(--accent) !important; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
        .showcase-cta:hover { color: var(--text) !important; border-color: var(--accent) !important; }
      `}</style>
    </div>
  );
}
