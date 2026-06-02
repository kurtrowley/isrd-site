import { Link } from 'react-router-dom';
import { NodeGraph } from '../components/NodeGraph';
import { LAB_REGISTRY, THEME_ACCENTS, TYPE_BG, TYPE_BORDER, type LabConfig } from '../labs/registry';
import siteContent from '../content/site.json';

const { hero, labs_section, showcase, mission } = siteContent;

export function Home() {
  const coreLabs = LAB_REGISTRY.filter(l => l.type === 'core');
  const userLabs = LAB_REGISTRY.filter(l => l.type === 'lab');

  return (
    <div>
      {/* ── Hero ── */}
      <section style={{ position:'relative', overflow:'hidden', background:'#060f16' }}>
        <NodeGraph />
        {/* Container matches nav width so section aligns with page — text is centered within */}
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

      {/* ── Lab grid ── */}
      <section style={{ maxWidth:1100, margin:'0 auto', padding:'60px 24px' }}>
        <h2 style={{ fontSize:'1rem', textTransform:'uppercase', letterSpacing:'.12em', color:'var(--muted)', marginBottom:8, fontWeight:600 }}>
          {labs_section.title}
        </h2>

        {/* Core capabilities */}
        <div style={{ marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <span style={{ fontSize:'.68rem', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', padding:'3px 10px', borderRadius:999, background:'rgba(212,168,71,0.12)', border:'1px solid rgba(212,168,71,0.3)', color:'var(--gold)' }}>
              {labs_section.core_label}
            </span>
            <span style={{ fontSize:'.78rem', color:'var(--muted)' }}>{labs_section.core_description}</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16, marginBottom:32 }}>
            {coreLabs.map(lab => <LabCard key={lab.id} lab={lab} />)}
          </div>
        </div>

        {/* User labs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
          {userLabs.map(lab => <LabCard key={lab.id} lab={lab} />)}
        </div>
      </section>

      {/* ── Client Showcase ── */}
      <section style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px 60px' }}>
        <div style={{ borderRadius:16, border:'1px dashed var(--line)', padding:'32px 36px', background:'rgba(255,255,255,0.01)' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}>
            <div style={{ flex:1, minWidth:240 }}>
              <div style={{ fontSize:'.7rem', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:8 }}>
                {showcase.title}
              </div>
              <p style={{ fontSize:'.82rem', color:'var(--muted)', margin:'0 0 16px', lineHeight:1.5 }}>
                {showcase.subtitle}
              </p>
              <h3 style={{ fontSize:'1.1rem', fontWeight:600, color:'var(--text)', margin:'0 0 10px', fontFamily:'Lora,Georgia,serif' }}>
                {showcase.placeholder.heading}
              </h3>
              <p style={{ fontSize:'.85rem', color:'var(--muted)', margin:'0 0 20px', lineHeight:1.6, maxWidth:540 }}>
                {showcase.placeholder.body}
              </p>
              <Link to={showcase.placeholder.cta.href}
                style={{ display:'inline-block', padding:'8px 20px', borderRadius:8, border:'1px solid var(--line)', color:'var(--muted)', textDecoration:'none', fontSize:'.85rem', transition:'all .15s' }}
                className="showcase-cta">
                {showcase.placeholder.cta.label} →
              </Link>
            </div>
            {/* Placeholder card slots */}
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ width:140, height:100, borderRadius:12, border:'1px dashed var(--line)', background:'rgba(255,255,255,0.015)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:'.7rem', color:'var(--line)', textAlign:'center', lineHeight:1.4 }}>Client<br />Lab {i}</span>
                </div>
              ))}
            </div>
          </div>
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
        .lab-card:hover { border-color: var(--accent) !important; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
        .showcase-cta:hover { color: var(--text) !important; border-color: var(--accent) !important; }
      `}</style>
    </div>
  );
}

function LabCard({ lab }: { lab: LabConfig }) {
  const accent = THEME_ACCENTS[lab.theme] ?? 'var(--accent)';
  const bg     = TYPE_BG[lab.type]     ?? 'var(--panel)';
  const border = TYPE_BORDER[lab.type] ?? 'var(--line)';

  return (
    <Link to={lab.path} style={{ textDecoration:'none' }}>
      <div className="lab-card" style={{ padding:20, borderRadius:14, border:`1px solid ${border}`, background:bg, transition:'all .2s', cursor:'pointer', height:'100%' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
          <span style={{ fontSize:'.72rem', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:accent }}>
            {lab.shortTitle}
          </span>
          <div style={{ display:'flex', gap:6 }}>
            {lab.type === 'core' && (
              <span style={{ fontSize:'.6rem', padding:'2px 6px', borderRadius:999, background:'rgba(212,168,71,0.12)', border:'1px solid rgba(212,168,71,0.25)', color:'var(--gold)', opacity:.8 }}>core</span>
            )}
            {lab.ai_enabled && (
              <span style={{ fontSize:'.6rem', padding:'2px 6px', borderRadius:999, border:`1px solid ${accent}`, color:accent, opacity:.7 }}>AI</span>
            )}
          </div>
        </div>
        <h3 style={{ fontSize:'1rem', fontWeight:700, color:'var(--text)', margin:'0 0 8px', lineHeight:1.3 }}>{lab.title}</h3>
        <p style={{ fontSize:'.82rem', color:'var(--muted)', margin:0, lineHeight:1.5 }}>{lab.description}</p>
        <div style={{ marginTop:14, display:'flex', flexWrap:'wrap', gap:6 }}>
          {lab.components.slice(0,3).map(c => (
            <span key={c} style={{ fontSize:'.65rem', padding:'2px 8px', borderRadius:999, background:`${accent}15`, border:`1px solid ${accent}30`, color:accent }}>
              {c}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
