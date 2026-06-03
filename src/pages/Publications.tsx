import { Link } from 'react-router-dom';
import pubData from '../content/publications.json';
import researchData from '../content/research.json';

const STATUS_COLOR: Record<string, string> = {
  'In Preparation': 'var(--muted)',
  'Forthcoming':    '#c87832',
  'Published':      '#50c090',
};

const TYPE_COLOR: Record<string, string> = {
  'Methodology':    '#d4a847',
  'Research Report':'#3a6fa8',
  'Working Paper':  '#7a5ac8',
};

const PROGRAM_LABEL: Record<string, string> = Object.fromEntries(
  researchData.programs.map(p => [p.id, p.title])
);

export function Publications() {
  const { page, publications } = pubData;
  const methodologyPubs = publications.filter(p => !p.program);
  const programPubs     = publications.filter(p => p.program);

  return (
    <div style={{ minHeight: 'calc(100vh - 3.5rem)', background: '#060f16' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--line)', background: 'var(--panel)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 32px' }}>
          <div style={{ fontSize: '.68rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, fontWeight: 600 }}>
            {page.eyebrow}
          </div>
          <h1 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 600, color: 'var(--text)', margin: '0 0 14px' }}>
            {page.title}
          </h1>
          <p style={{ fontSize: '.92rem', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 680, margin: '0 0 14px' }}>
            {page.intro}
          </p>
          <p style={{ fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.5, fontStyle: 'italic', margin: 0 }}>
            {page.status_note}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

        {/* Methodology */}
        <SectionHeader label="Methodology" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
          {methodologyPubs.map(pub => <PubCard key={pub.id} pub={pub} />)}
        </div>

        {/* By program */}
        <SectionHeader label="By Research Program" />
        {researchData.programs.map(prog => {
          const pubs = programPubs.filter(p => p.program === prog.id);
          if (!pubs.length) return null;
          return (
            <div key={prog.id} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Link to={prog.path} style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--accent2)', textDecoration: 'none' }}>
                  {prog.title}
                </Link>
                <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pubs.map(pub => <PubCard key={pub.id} pub={pub} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <span style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
    </div>
  );
}

function PubCard({ pub }: { pub: typeof pubData.publications[0] }) {
  const typeAccent = TYPE_COLOR[pub.type] ?? 'var(--muted)';
  return (
    <div style={{ padding: '18px 22px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--panel)', transition: 'border-color .15s' }}
      className="pub-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 7, flexWrap: 'wrap' }}>
        <h3 style={{ fontSize: '.95rem', fontWeight: 600, color: 'var(--text)', margin: 0, lineHeight: 1.35, flex: 1, minWidth: 200 }}>
          {pub.title}
        </h3>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
          <span style={{ fontSize: '.68rem', padding: '2px 8px', borderRadius: 999, background: `${typeAccent}18`, border: `1px solid ${typeAccent}35`, color: typeAccent }}>
            {pub.type}
          </span>
          <span style={{ fontSize: '.72rem', fontWeight: 600, color: STATUS_COLOR[pub.status] ?? 'var(--muted)' }}>
            {pub.status}
          </span>
        </div>
      </div>
      <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: 10 }}>
        {pub.authors.join(', ')} · {pub.year}
        {pub.program && (
          <> · <Link to={`/research/${pub.program}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{PROGRAM_LABEL[pub.program]}</Link></>
        )}
      </div>
      <p style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 10px' }}>{pub.abstract}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {pub.tags.map(t => (
          <span key={t} style={{ fontSize: '.62rem', padding: '1px 7px', borderRadius: 999, background: 'rgba(58,143,168,0.08)', border: '1px solid rgba(58,143,168,0.18)', color: 'var(--muted)' }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
