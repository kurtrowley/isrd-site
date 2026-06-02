import siteContent from '../content/site.json';

const { about } = siteContent;

export function About() {
  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'60px 24px' }}>
      <div style={{ fontSize:'.72rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--gold)', marginBottom:16 }}>
        {about.eyebrow}
      </div>
      <h1 style={{ fontFamily:'Lora,Georgia,serif', fontSize:'clamp(1.6rem,4vw,2.5rem)', color:'var(--text)', marginBottom:24, fontWeight:600 }}>
        {about.heading}
      </h1>
      <p style={{ color:'var(--muted)', lineHeight:1.75, fontSize:'.95rem', marginBottom:20 }}
        dangerouslySetInnerHTML={{ __html: about.intro }} />
      <p style={{ color:'var(--muted)', lineHeight:1.75, fontSize:'.95rem', marginBottom:20 }}>
        {about.body}
      </p>
      <h2 style={{ fontSize:'1rem', textTransform:'uppercase', letterSpacing:'.1em', color:'var(--muted)', margin:'40px 0 16px', fontWeight:700 }}>
        {about.principles_heading}
      </h2>
      {about.principles.map(p => (
        <div key={p.title} style={{ marginBottom:16, padding:'14px 16px', borderRadius:10, border:'1px solid var(--line)', background:'var(--panel)' }}>
          <div style={{ fontWeight:600, color:'var(--text)', marginBottom:5 }}>{p.title}</div>
          <div style={{ fontSize:'.85rem', color:'var(--muted)', lineHeight:1.55 }}>{p.desc}</div>
        </div>
      ))}
    </div>
  );
}
