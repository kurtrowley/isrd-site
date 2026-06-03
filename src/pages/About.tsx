import siteContent from '../content/site.json';

const { about } = siteContent;

export function About() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>

      {/* Header */}
      <div style={{ fontSize: '.72rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>
        {about.eyebrow}
      </div>
      <h1 style={{ fontFamily: 'Lora,Georgia,serif', fontSize: 'clamp(1.6rem,4vw,2.5rem)', color: 'var(--text)', marginBottom: 24, fontWeight: 600 }}>
        {about.heading}
      </h1>
      <p style={{ color: 'var(--muted)', lineHeight: 1.75, fontSize: '.95rem', marginBottom: 20 }}
        dangerouslySetInnerHTML={{ __html: about.intro }} />
      <p style={{ color: 'var(--muted)', lineHeight: 1.75, fontSize: '.95rem', marginBottom: 20 }}>
        {about.body}
      </p>

      {/* Core Principles */}
      <h2 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', margin: '40px 0 16px', fontWeight: 700 }}>
        {about.principles_heading}
      </h2>
      {about.principles.map(p => (
        <div key={p.title} style={{ marginBottom: 16, padding: '14px 16px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--panel)' }}>
          <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 5 }}>{p.title}</div>
          <div style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.55 }}>{p.desc}</div>
        </div>
      ))}

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--line)', margin: '48px 0 40px' }} />

      {/* People */}
      <h2 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', margin: '0 0 8px', fontWeight: 700 }}>
        {about.people_heading}
      </h2>
      <p style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 28px', fontStyle: 'italic' }}>
        {about.people_note}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {about.people.map(person => (
          <div key={person.name} style={{ padding: '22px 24px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--panel)', display: 'flex', gap: 22, flexWrap: 'wrap' }}>

            {/* Avatar placeholder */}
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--panel-b)', border: '2px solid var(--line)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.3rem', color: 'var(--muted)' }}>
                {person.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>
                {person.name}
              </div>
              <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--accent)', letterSpacing: '.03em', marginBottom: 12 }}>
                {person.title}
              </div>
              <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.65, margin: '0 0 14px' }}>
                {person.bio}
              </p>
              {/* Focus areas */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {person.areas.map(area => (
                  <span key={area} style={{ fontSize: '.65rem', padding: '2px 9px', borderRadius: 999, background: 'rgba(58,143,168,0.1)', border: '1px solid rgba(58,143,168,0.22)', color: 'var(--muted)' }}>
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
