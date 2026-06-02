import { Link } from 'react-router-dom';
import { NodeGraph } from '../components/NodeGraph';
import { LAB_REGISTRY, THEME_ACCENTS } from '../labs/registry';

export function Home() {
  return (
    <div>
      {/* Hero */}
      <section style={{ position:'relative', minHeight:'60vh', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', overflow:'hidden', background:'#060f16', padding:'80px 24px 60px' }}>
        <NodeGraph />
        <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:700 }}>
          <div style={{ fontSize:'.72rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--gold)', marginBottom:16, fontWeight:600 }}>
            Institute for Systemic Research & Design
          </div>
          <h1 style={{ fontFamily:'Lora,Georgia,serif', fontSize:'clamp(2rem, 5vw, 3.5rem)', fontWeight:600, color:'var(--text)', lineHeight:1.15, margin:'0 0 20px' }}>
            A Foundry for<br />
            <span style={{ color:'var(--accent2)' }}>Systemic Engineering</span>
          </h1>
          <p style={{ fontSize:'1.05rem', color:'var(--muted)', lineHeight:1.7, maxWidth:560, margin:'0 auto 32px' }}>
            Model feedback loops, attractor basins, and bifurcations across diverse domains. From bio-systemics to global futurism — one shared toolkit for complex system simulators.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/lab/bio-systemics"
              style={{ padding:'10px 24px', borderRadius:10, background:'var(--accent)', color:'#fff', textDecoration:'none', fontWeight:600, fontSize:'.9rem', transition:'all .15s' }}>
              Launch ME/CFS Simulator
            </Link>
            <Link to="/lab/foundry"
              style={{ padding:'10px 24px', borderRadius:10, border:'1px solid var(--line)', color:'var(--text)', textDecoration:'none', fontWeight:500, fontSize:'.9rem', background:'var(--panel)' }}>
              Explore the Toolkit
            </Link>
          </div>
        </div>
      </section>

      {/* Lab grid */}
      <section style={{ maxWidth:1100, margin:'0 auto', padding:'60px 24px' }}>
        <h2 style={{ fontSize:'1rem', textTransform:'uppercase', letterSpacing:'.12em', color:'var(--muted)', marginBottom:32, fontWeight:600 }}>
          The 5-Lab Ecosystem
        </h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:20 }}>
          {LAB_REGISTRY.map(lab => {
            const accent = THEME_ACCENTS[lab.theme] ?? 'var(--accent)';
            return (
              <Link key={lab.id} to={lab.path} style={{ textDecoration:'none' }}>
                <div style={{ padding:20, borderRadius:14, border:`1px solid var(--line)`, background:'var(--panel)', transition:'all .2s', cursor:'pointer' }}
                  className="lab-card">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <span style={{ fontSize:'.72rem', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:accent }}>
                      {lab.shortTitle}
                    </span>
                    {lab.ai_enabled && (
                      <span style={{ fontSize:'.6rem', padding:'2px 6px', borderRadius:999, border:`1px solid ${accent}`, color:accent, opacity:.7 }}>AI</span>
                    )}
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
          })}
        </div>
      </section>

      {/* Mission strip */}
      <section style={{ borderTop:'1px solid var(--line)', background:'var(--panel)', padding:'48px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <h2 style={{ fontFamily:'Lora,Georgia,serif', fontSize:'1.4rem', color:'var(--text)', margin:'0 0 16px' }}>
            Beyond Reductionism
          </h2>
          <p style={{ color:'var(--muted)', lineHeight:1.75, fontSize:'.95rem', maxWidth:700 }}>
            ISRD moves from traditional reductionist systems analysis to <strong style={{ color:'var(--text)' }}>Systemic Engineering</strong> — where users (writers, scientists, policy makers) use a shared toolkit to build and publish their own complex system simulators. Every gauge is a node in a directed feedback graph. Every intervention propagates.
          </p>
        </div>
      </section>

      <style>{`
        .lab-card:hover {
          border-color: var(--accent) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
      `}</style>
    </div>
  );
}
