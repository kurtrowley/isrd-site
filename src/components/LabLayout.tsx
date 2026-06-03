// LabLayout — standard wrapper for every lab page.
// Desktop: side-by-side canvas + sidebar.
// Mobile: canvas fills screen, bottom toggle bar switches to controls panel.

import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LabConfig } from '../toolkit/types';
import { THEME_ACCENTS } from '../labs/registry';

interface Props {
  lab: LabConfig;
  simArea: ReactNode;
  sidebarContent?: ReactNode;
  children?: ReactNode;
  // Optional controlled mobile panel (lets parent drive switching via canvas events)
  mobilePanel?: 'sim' | 'controls';
  onMobilePanelChange?: (v: 'sim' | 'controls') => void;
}

export function LabLayout({ lab, simArea, sidebarContent, children, mobilePanel: mobilePanelProp, onMobilePanelChange }: Props) {
  const accent = THEME_ACCENTS[lab.theme] ?? 'var(--accent)';
  const [mobilePanelLocal, setMobilePanelLocal] = useState<'sim' | 'controls'>('sim');

  // Use controlled value if provided, otherwise use local state
  const mobilePanel = mobilePanelProp ?? mobilePanelLocal;
  const setMobilePanel = (v: 'sim' | 'controls') => {
    setMobilePanelLocal(v);
    onMobilePanelChange?.(v);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 3.5rem)' }}>
      {/* Lab header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 16px', borderBottom:'1px solid var(--line)', background:'var(--panel)', flexShrink:0 }}>
        <Link to="/" style={{ fontSize:'.75rem', color:'var(--muted)', textDecoration:'none' }}>ISRD</Link>
        <span style={{ color:'var(--line)' }}>/</span>
        <span style={{ fontSize:'.75rem', fontWeight:700, letterSpacing:'.04em', color: accent }}>{lab.title}</span>
        {lab.ai_enabled && (
          <span style={{ marginLeft:'auto', fontSize:'.62rem', padding:'2px 8px', borderRadius:999, border:`1px solid ${accent}`, color: accent, opacity:.7 }}>
            AI-enabled
          </span>
        )}
      </div>

      {/* ── Desktop layout ── */}
      <div className="lab-desktop" style={{ flex:1, display:'flex', overflow:'hidden', minHeight:0 }}>
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', borderRight:'1px solid var(--line)' }}>
          {simArea}
        </div>
        <div style={{ width:320, flexShrink:0, display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--panel)' }}>
          {sidebarContent ?? <DefaultSidebar lab={lab} accent={accent} />}
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="lab-mobile" style={{ flex:1, display:'none', flexDirection:'column', overflow:'hidden', minHeight:0 }}>
        {/* Active panel */}
        <div style={{ flex:1, overflow:'hidden', minHeight:0 }}>
          {mobilePanel === 'sim'
            ? simArea
            : <div style={{ height:'100%', overflowY:'auto', background:'var(--panel)' }}>
                {sidebarContent ?? <DefaultSidebar lab={lab} accent={accent} />}
              </div>
          }
        </div>

        {/* Bottom toggle bar */}
        <div style={{ display:'flex', borderTop:'1px solid var(--line)', background:'var(--panel)', flexShrink:0 }}>
          <button
            onClick={() => setMobilePanel('sim')}
            style={{
              flex:1, padding:'12px 8px', fontSize:'.8rem', fontWeight:700,
              border:'none', cursor:'pointer', transition:'all .15s',
              borderBottom: `3px solid ${mobilePanel === 'sim' ? accent : 'transparent'}`,
              background: mobilePanel === 'sim' ? `${accent}18` : 'transparent',
              color: mobilePanel === 'sim' ? accent : 'var(--muted)',
            }}>
            ▶ Simulator
          </button>
          <button
            onClick={() => setMobilePanel('controls')}
            style={{
              flex:1, padding:'12px 8px', fontSize:'.8rem', fontWeight:700,
              border:'none', cursor:'pointer', transition:'all .15s',
              borderBottom: `3px solid ${mobilePanel === 'controls' ? accent : 'transparent'}`,
              background: mobilePanel === 'controls' ? `${accent}18` : 'transparent',
              color: mobilePanel === 'controls' ? accent : 'var(--muted)',
            }}>
            ☰ Controls
          </button>
        </div>
      </div>

      {children}

      <style>{`
        @media (max-width: 768px) {
          .lab-desktop { display: none !important; }
          .lab-mobile  { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

function DefaultSidebar({ lab, accent }: { lab: LabConfig; accent: string }) {
  return (
    <div style={{ padding:16 }}>
      <h3 style={{ fontSize:'.72rem', textTransform:'uppercase', letterSpacing:'.1em', color:'var(--muted)', marginBottom:10 }}>
        Research & Theory
      </h3>
      <p style={{ fontSize:'.85rem', color:'var(--muted)', lineHeight:1.6, margin:'0 0 16px' }}>{lab.description}</p>
      <Link to="/lab/foundations" style={{ fontSize:'.8rem', color: accent, textDecoration:'none' }}>
        ↗ Foundations Lab
      </Link>
    </div>
  );
}
