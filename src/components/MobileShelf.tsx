// MobileShelf — reusable split-panel layout.
// Desktop: side-by-side (main content left, shelf right).
// Mobile: main fills screen, shelf slides in from right as a drawer.
// Used by the embedded research simulators, Simulations, and any future split-panel page.

import { useState, useRef, type ReactNode } from 'react';

interface Props {
  main:         ReactNode;
  shelf:        ReactNode;
  shelfTitle?:  string;
  accent?:      string;
  // Controlled open state (parent can force-open on events like person-click)
  shelfOpen?:   boolean;
  onShelfChange?: (open: boolean) => void;
  // Desktop sidebar width (default 320)
  sidebarWidth?: number;
}

export function MobileShelf({
  main, shelf, shelfTitle = 'Controls', accent = 'var(--accent)',
  shelfOpen: shelfOpenProp, onShelfChange,
  sidebarWidth = 320,
}: Props) {
  const [openLocal, setOpenLocal] = useState(false);
  const touchStartX = useRef(0);

  const open   = shelfOpenProp ?? openLocal;
  const setOpen = (v: boolean) => { setOpenLocal(v); onShelfChange?.(v); };

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (e.changedTouches[0].clientX - touchStartX.current > 60) setOpen(false);
  };

  return (
    <>
      {/* ── Desktop: side-by-side ── */}
      <div className="shelf-desktop" style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--line)' }}>
          {main}
        </div>
        <div style={{ width: sidebarWidth, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--panel)' }}>
          {shelf}
        </div>
      </div>

      {/* ── Mobile: canvas always mounted, shelf slides over ── */}
      <div className="shelf-mobile" style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0, display: 'none' }}>

        {/* Main content — always in DOM, never unmounts */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {main}
        </div>

        {/* Backdrop */}
        <div onClick={() => setOpen(false)} style={{
          position: 'absolute', inset: 0, zIndex: 10,
          background: 'rgba(0,0,0,0.45)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity .25s',
        }} />

        {/* Slide-out drawer */}
        <div
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
          style={{
            position: 'absolute', top: 0, right: 0, height: '100%',
            width: '88%', maxWidth: 340,
            background: 'var(--panel)',
            borderLeft: '1px solid var(--line)',
            transform: `translateX(${open ? '0' : '100%'})`,
            transition: 'transform 0.26s cubic-bezier(0.4,0,0.2,1)',
            zIndex: 20, display: 'flex', flexDirection: 'column', willChange: 'transform',
          }}
        >
          {/* Drawer header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
            <span style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              {shelfTitle}
            </span>
            <button onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1.1rem', cursor: 'pointer', padding: '2px 6px', lineHeight: 1 }}
              aria-label="Close">✕</button>
          </div>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {shelf}
          </div>
        </div>

        {/* Pull-tab handle */}
        <button onClick={() => setOpen(true)} aria-label="Open panel"
          style={{
            position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
            width: 26, height: 68, background: 'var(--panel)',
            border: '1px solid var(--line)', borderRight: 'none',
            borderRadius: '8px 0 0 8px', zIndex: 15, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: open ? 0 : 1, pointerEvents: open ? 'none' : 'auto',
            transition: 'opacity .2s', padding: 0,
          }}>
          <span style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1 }}>☰</span>
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .shelf-desktop { display: none !important; }
          .shelf-mobile  { display: block !important; }
        }
      `}</style>
    </>
  );
}
