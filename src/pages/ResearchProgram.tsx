import { useParams, Link } from 'react-router-dom';
import researchData from '../content/research.json';
import pubData from '../content/publications.json';

const THEME_ACCENT: Record<string, string> = {
  'blue-pulse': '#3a6fa8',
  amber:        '#c87832',
  violet:       '#7a5ac8',
};

export function ResearchProgram() {
  const { programId } = useParams<{ programId: string }>();
  const prog = researchData.programs.find(p => p.id === programId);

  if (!prog) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--muted)' }}>
        <h2 style={{ color: 'var(--text)' }}>Program not found</h2>
        <Link to="/research" style={{ color: 'var(--accent)' }}>← All Research</Link>
      </div>
    );
  }

  const accent = THEME_ACCENT[prog.theme] ?? 'var(--accent)';
  const programPubs = pubData.publications.filter(p => p.program === prog.id);

  return (
    <div style={{ minHeight: 'calc(100vh - 3.5rem)', background: '#060f16' }}>

      {/* Header bar */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--line)', background: 'var(--panel)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/research" style={{ fontSize: '.78rem', color: 'var(--muted)', textDecoration: 'none' }}>Research</Link>
        <span style={{ color: 'var(--line)' }}>/</span>
        <span style={{ fontSize: '.78rem', fontWeight: 700, color: accent }}>{prog.title}</span>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>

        {/* Title block */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: accent, marginBottom: 8 }}>
            {prog.title}
          </div>
          <h1 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)', fontWeight: 600, color: 'var(--text)', margin: '0 0 16px' }}>
            {prog.subtitle}
          </h1>
          <p style={{ fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.75, maxWidth: 720, margin: 0 }}>
            {prog.description}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 36 }}>

          {/* Research questions */}
          <div style={{ padding: '20px 22px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--panel)' }}>
            <h3 style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', margin: '0 0 14px', fontWeight: 700 }}>
              Research Questions
            </h3>
            <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {prog.research_questions.map((q, i) => (
                <li key={i} style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.55 }}>{q}</li>
              ))}
            </ul>
          </div>

          {/* Tools & AI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '20px 22px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--panel)' }}>
              <h3 style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', margin: '0 0 12px', fontWeight: 700 }}>
                Simulation Tools
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {prog.tools.map(t => (
                  <span key={t} style={{ fontSize: '.72rem', padding: '3px 10px', borderRadius: 999, background: `${accent}15`, border: `1px solid ${accent}30`, color: accent }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ padding: '16px 20px', borderRadius: 12, border: '1px solid rgba(58,143,168,0.25)', background: 'rgba(58,143,168,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: '.75rem', color: 'var(--accent)', fontWeight: 700 }}>⟳ AI Integration</span>
              </div>
              <p style={{ fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>{prog.ai_use}</p>
            </div>
          </div>
        </div>

        {/* CTA: open simulator */}
        <div style={{ marginBottom: 40, padding: '20px 24px', borderRadius: 12, border: `1px solid ${accent}35`, background: `${accent}08`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Interactive Simulator</div>
            <p style={{ fontSize: '.83rem', color: 'var(--muted)', margin: 0 }}>
              Explore this research program's simulation environment — adjust parameters, run scenarios, and inspect individual outcomes.
            </p>
          </div>
          <Link to={prog.simulator_path}
            style={{ padding: '10px 22px', borderRadius: 10, background: accent, color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '.88rem', flexShrink: 0, whiteSpace: 'nowrap' }}>
            Open Simulator →
          </Link>
        </div>

        {/* Publications for this program */}
        <div>
          <h2 style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--muted)', fontWeight: 700, margin: '0 0 16px' }}>
            Publications
          </h2>
          {programPubs.length === 0 ? (
            <p style={{ fontSize: '.85rem', color: 'var(--muted)', fontStyle: 'italic' }}>Publications in preparation. <Link to="/publications" style={{ color: 'var(--accent)' }}>View all publications →</Link></p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {programPubs.map(pub => <PubCard key={pub.id} pub={pub} />)}
              <div style={{ marginTop: 4 }}>
                <Link to="/publications" style={{ fontSize: '.82rem', color: 'var(--accent)' }}>View all ISRD publications →</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PubCard({ pub }: { pub: typeof pubData.publications[0] }) {
  const statusColor: Record<string, string> = {
    'In Preparation': 'var(--muted)',
    'Forthcoming':    '#c87832',
    'Published':      '#50c090',
  };
  return (
    <div style={{ padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--panel)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
        <h3 style={{ fontSize: '.92rem', fontWeight: 600, color: 'var(--text)', margin: 0, lineHeight: 1.35 }}>{pub.title}</h3>
        <span style={{ fontSize: '.68rem', fontWeight: 600, color: statusColor[pub.status] ?? 'var(--muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>{pub.status}</span>
      </div>
      <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: 7 }}>
        {pub.authors.join(', ')} · {pub.year} · {pub.type}
      </div>
      <p style={{ fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.55, margin: '0 0 8px' }}>{pub.abstract}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {pub.tags.map(t => (
          <span key={t} style={{ fontSize: '.62rem', padding: '1px 7px', borderRadius: 999, background: 'rgba(58,143,168,0.1)', border: '1px solid rgba(58,143,168,0.2)', color: 'var(--muted)' }}>{t}</span>
        ))}
      </div>
    </div>
  );
}
