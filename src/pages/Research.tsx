import { Link } from 'react-router-dom';
import { NodeGraph } from '../components/NodeGraph';
import researchData from '../content/research.json';

const THEME_ACCENT: Record<string, string> = {
  'blue-pulse': '#3a6fa8',
  amber:        '#c87832',
  violet:       '#7a5ac8',
};

export function Research() {
  const { page, programs } = researchData;

  return (
    <div style={{ minHeight: 'calc(100vh - 3.5rem)', background: '#060f16' }}>

      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--line)' }}>
        <NodeGraph />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '48px 24px 40px' }}>
          <div style={{ fontSize: '.68rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, fontWeight: 600 }}>
            {page.eyebrow}
          </div>
          <h1 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontWeight: 600, color: 'var(--text)', margin: '0 0 14px' }}>
            {page.title}
          </h1>
          <p style={{ fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 680, margin: '0 0 18px' }}>
            {page.intro}
          </p>
          {/* AI note */}
          <div style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(58,143,168,0.25)', background: 'rgba(58,143,168,0.06)', maxWidth: 680 }}>
            <span style={{ fontSize: '.8rem', color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}>⟳ AI</span>
            <p style={{ fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>{page.ai_note}</p>
          </div>
        </div>
      </div>

      {/* Program cards */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {programs.map(prog => {
            const accent = THEME_ACCENT[prog.theme] ?? 'var(--accent)';
            return (
              <Link key={prog.id} to={prog.path} style={{ textDecoration: 'none' }}>
                <div className="research-card" style={{
                  padding: '24px 28px', borderRadius: 14,
                  border: `1px solid var(--line)`, background: 'var(--panel)',
                  transition: 'all .2s', cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: accent, marginBottom: 5 }}>
                        {prog.title}
                      </div>
                      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{prog.subtitle}</h2>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center', marginTop: 4 }}>
                      <span style={{ fontSize: '.65rem', padding: '2px 8px', borderRadius: 999, background: 'rgba(58,143,168,0.12)', border: '1px solid rgba(58,143,168,0.25)', color: 'var(--accent)' }}>
                        AI-integrated
                      </span>
                      <span style={{ fontSize: '.82rem', color: accent, fontWeight: 600 }}>View program →</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.65, margin: '0 0 14px', maxWidth: 780 }}>
                    {prog.description}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {prog.tools.map(t => (
                      <span key={t} style={{ fontSize: '.65rem', padding: '2px 9px', borderRadius: 999, background: `${accent}15`, border: `1px solid ${accent}30`, color: accent }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`.research-card:hover { border-color: var(--accent) !important; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(0,0,0,0.35); }`}</style>
    </div>
  );
}
