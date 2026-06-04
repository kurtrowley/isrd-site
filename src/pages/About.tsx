import siteContent from '../content/site.json';

const { about } = siteContent;

export function About() {
  return (
    <div style={{ minHeight: 'calc(100vh - 3.5rem)', background: '#060f16' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--line)', background: 'var(--panel)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 36px' }}>
          <div style={{ fontSize: '.68rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>
            {about.eyebrow}
          </div>
          <h1 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', color: 'var(--text)', marginBottom: 20, fontWeight: 600, lineHeight: 1.2 }}>
            {about.heading}
          </h1>
          <p style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '.95rem', margin: 0 }}
            dangerouslySetInnerHTML={{ __html: about.intro }} />
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* What ISRD does */}
        <p style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '.95rem', marginBottom: 32 }}>
          {about.body}
        </p>

        {/* What we build */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 40 }}>
          {[
            { label: 'Simulations', desc: 'Interactive models that make complex systems tangible — from viral outbreaks to civilizational attractors.', color: '#3a8fa8' },
            { label: 'Research', desc: 'Active programs investigating complex adaptive systems in health, writing, and macro-systems using systemic methodology.', color: '#7a5ac8' },
            { label: 'Articles', desc: 'Long-form theoretical and applied writing grounded in systems science — designed to shift mental models, not just inform.', color: '#d4a847' },
            { label: 'Education', desc: 'Learner-First Systemic Education — a framework for designing instruction that produces genuine attractor-shifting transfer.', color: '#c87832' },
          ].map(item => (
            <div key={item.label} style={{ padding: '16px 18px', borderRadius: 10, border: `1px solid ${item.color}30`, background: `${item.color}08` }}>
              <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: item.color, marginBottom: 6 }}>
                {item.label}
              </div>
              <p style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.55, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--line)', margin: '40px 0' }} />

        {/* People */}
        <h2 style={{ fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--muted)', fontWeight: 700, margin: '0 0 8px' }}>
          {about.people_heading}
        </h2>
        <p style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 28px', fontStyle: 'italic' }}>
          {about.people_note}
        </p>

        {about.people.map(person => (
          <div key={person.name} style={{ padding: '22px 24px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--panel)', display: 'flex', gap: 22, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--panel-b)', border: '2px solid var(--line)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.2rem', color: 'var(--muted)', fontFamily: 'Lora, serif', fontWeight: 600 }}>
                {person.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: 'Lora, Georgia, serif', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>
                {person.name}
              </div>
              <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--accent)', letterSpacing: '.03em', marginBottom: 12 }}>
                {person.title}
              </div>
              <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.7, margin: '0 0 14px' }}>
                {person.bio}
              </p>
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
