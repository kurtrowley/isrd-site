export function About() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
      <div style={{ fontSize:'.72rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--gold)', marginBottom:16 }}>
        About ISRD
      </div>
      <h1 style={{ fontFamily:'Lora,Georgia,serif', fontSize:'clamp(1.6rem,4vw,2.5rem)', color:'var(--text)', marginBottom:24, fontWeight:600 }}>
        Institute for Systemic Research & Design
      </h1>
      <p style={{ color:'var(--muted)', lineHeight:1.75, fontSize:'.95rem', marginBottom:20 }}>
        ISRD is the parent lab and publishing portal for <strong style={{ color:'var(--text)' }}>Systemic Synthesis</strong> — a non-linear, holistic approach to understanding and designing complex systems.
      </p>
      <p style={{ color:'var(--muted)', lineHeight:1.75, fontSize:'.95rem', marginBottom:20 }}>
        Our Sim-Toolkit allows users to model feedback loops, attractor basins, and bifurcations across diverse domains. We believe that every complex phenomenon — from ME/CFS to civilizational dynamics — can be better understood through the lens of systemic engineering.
      </p>
      <h2 style={{ fontSize:'1rem', textTransform:'uppercase', letterSpacing:'.1em', color:'var(--muted)', margin:'40px 0 16px', fontWeight:700 }}>
        Core Principles
      </h2>
      {[
        ['Systemic Synthesis Priority', 'Gauges are not independent variables — they are nodes in a directed graph with edges representing feedback weights.'],
        ['Modular Architecture', 'Every lab is pluggable. New simulations are created by dropping in a new configuration file for the toolkit.'],
        ['AI Integration Hooks', 'Components expose hooks that allow AI services to ingest simulation state and suggest Systemic Adjustments.'],
      ].map(([title, desc]) => (
        <div key={title as string} style={{ marginBottom:16, padding:'14px 16px', borderRadius:10, border:'1px solid var(--line)', background:'var(--panel)' }}>
          <div style={{ fontWeight:600, color:'var(--text)', marginBottom:5 }}>{title as string}</div>
          <div style={{ fontSize:'.85rem', color:'var(--muted)', lineHeight:1.55 }}>{desc as string}</div>
        </div>
      ))}
    </div>
  );
}
