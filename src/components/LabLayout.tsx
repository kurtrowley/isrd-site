// LabLayout — standard wrapper for every lab page.
// Desktop: side-by-side canvas + sidebar.
// Mobile: canvas always runs (never unmounts), right-edge drawer slides over it.

import { useState, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LabConfig } from '../toolkit/types';
import { THEME_ACCENTS } from '../labs/registry';

interface Props {
  lab: LabConfig;
  simArea: ReactNode;
  sidebarContent?: ReactNode;
  children?: ReactNode;
  // Parent can drive drawer open/closed (e.g. auto-open on person click)
  mobilePanel?: 'sim' | 'controls';
  onMobilePanelChange?: (v: 'sim' | 'controls') => void;
}

export function LabLayout({ lab, simArea, sidebarContent, children, mobilePanel: mobilePanelProp, onMobilePanelChange }: Props) {
  const accent = THEME_ACCENTS[lab.theme] ?? 'var(--accent)';
  const [drawerOpenLocal, setDrawerOpenLocal] = useState(false);

  // Treat 'controls' = drawer open, 'sim' = drawer closed
  const drawerOpen = mobilePanelProp === 'controls' ? true
                   : mobilePanelProp === 'sim'      ? false
                   : drawerOpenLocal;

  const setDrawerOpen = (open: boolean) => {
    setDrawerOpenLocal(open);
    onMobilePanelChange?.(open ? 'controls' : 'sim');
  };

  // Touch swipe-to-close
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd   = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 60) setDrawerOpen(false); // swipe right → close
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

      {/* ── Mobile layout ── sim always mounted, drawer slides over ── */}
      <div className="lab-mobile" style={{ flex:1, position:'relative', overflow:'hidden', minHeight:0, display:'none' }}>

        {/* Canvas — always in DOM, never unmounts, sim keeps running */}
        <div style={{ position:'absolute', inset:0 }}>
          {simArea}
        </div>

        {/* Backdrop — tap to close drawer */}
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position:'absolute', inset:0, zIndex:10,
            background:'rgba(0,0,0,0.45)',
            opacity: drawerOpen ? 1 : 0,
            pointerEvents: drawerOpen ? 'auto' : 'none',
            transition:'opacity .25s',
          }}
        />

        {/* Slide-out drawer from the right */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            position:'absolute', top:0, right:0, height:'100%',
            width:'88%', maxWidth:340,
            background:'var(--panel)',
            borderLeft:'1px solid var(--line)',
            transform: `translateX(${drawerOpen ? '0' : '100%'})`,
            transition:'transform 0.26s cubic-bezier(0.4,0,0.2,1)',
            zIndex:20,
            display:'flex', flexDirection:'column',
            willChange:'transform',
          }}
        >
          {/* Drawer header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', borderBottom:'1px solid var(--line)', flexShrink:0 }}>
            <span style={{ fontSize:'.72rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--muted)' }}>
              Controls
            </span>
            <button
              onClick={() => setDrawerOpen(false)}
              style={{ background:'none', border:'none', color:'var(--muted)', fontSize:'1.1rem', cursor:'pointer', padding:'2px 4px', lineHeight:1 }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Drawer content — scrollable */}
          <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
            {sidebarContent ?? <DefaultSidebar lab={lab} accent={accent} />}
          </div>
        </div>

        {/* Pull-tab — always visible on right edge, opens drawer */}
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open controls"
          style={{
            position:'absolute', right:0, top:'50%', transform:'translateY(-50%)',
            width:26, height:68,
            background:'var(--panel)',
            border:'1px solid var(--line)',
            borderRight:'none',
            borderRadius:'8px 0 0 8px',
            zIndex:15,
            cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            opacity: drawerOpen ? 0 : 1,
            pointerEvents: drawerOpen ? 'none' : 'auto',
            transition:'opacity .2s',
            padding:0,
          }}
        >
          <span style={{ fontSize:'.85rem', color:'var(--muted)', lineHeight:1 }}>☰</span>
        </button>
      </div>

      {children}

      <style>{`
        @media (max-width: 768px) {
          .lab-desktop { display: none !important; }
          .lab-mobile  { display: block !important; }
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
