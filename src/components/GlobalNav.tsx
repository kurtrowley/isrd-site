import { useState, useRef, type MutableRefObject } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSimStore } from '../store/useSimStore';
import siteContent from '../content/site.json';
import simContent from '../content/simulations.json';
import researchData from '../content/research.json';

export function GlobalNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
  const [simsOpen,     setSimsOpen]     = useState(false);
  const researchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const simsTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { theme, toggleTheme } = useSimStore();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const openMenu  = (set: (v:boolean)=>void, timer: MutableRefObject<ReturnType<typeof setTimeout>|null>) =>
    () => { if (timer.current) clearTimeout(timer.current); set(true); };
  const closeMenu = (set: (v:boolean)=>void, timer: MutableRefObject<ReturnType<typeof setTimeout>|null>) =>
    () => { timer.current = setTimeout(() => set(false), 120); };

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{ background: 'rgba(6,15,22,0.92)', backdropFilter: 'blur(12px)', borderColor: 'var(--line)' }}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-4">
        {/* Brand */}
        <Link to="/" className="flex flex-col leading-tight shrink-0" style={{ textDecoration: 'none', marginRight: 8 }}>
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gold)' }}>{siteContent.nav.brand}</span>
          <span className="text-[10px] tracking-wider" style={{ color: 'var(--muted)' }}>{siteContent.nav.brand_sub}</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-4 text-sm flex-1">

          {/* Articles */}
          <Link to="/articles" className={`nav-link ${isActive('/articles') ? 'active' : ''}`}>Articles</Link>

          {/* Media */}
          <Link to="/media" className={`nav-link ${isActive('/media') ? 'active' : ''}`}>Media</Link>

          {/* Simulations dropdown */}
          <div className="relative" onMouseEnter={openMenu(setSimsOpen, simsTimer)} onMouseLeave={closeMenu(setSimsOpen, simsTimer)}>
            <button className={`nav-link flex items-center gap-1 ${isActive('/simulations') ? 'active' : ''}`}>
              Simulations <span className="text-[10px]">▾</span>
            </button>
            {simsOpen && (
              <div
                onMouseEnter={openMenu(setSimsOpen, simsTimer)}
                onMouseLeave={closeMenu(setSimsOpen, simsTimer)}
                className="absolute top-full left-0 w-72 rounded-xl border py-2 shadow-2xl"
                style={{ background: 'var(--panel)', borderColor: 'var(--line)', marginTop: 2 }}
              >
                <Link to="/simulations" onClick={() => setSimsOpen(false)}
                  className="block px-4 py-2 text-sm hover:bg-white/5"
                  style={{ color: location.pathname === '/simulations' ? 'var(--accent2)' : 'var(--muted)', textDecoration: 'none', fontStyle: 'italic' }}>
                  View all simulations
                </Link>
                <div style={{ height: 1, background: 'var(--line)', margin: '4px 12px' }} />
                {simContent.simulations.map((sim: any) => (
                  <Link key={sim.id} to={sim.path} onClick={() => setSimsOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-white/5"
                    style={{ color: isActive(sim.path) ? 'var(--accent2)' : 'var(--text)', textDecoration: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <span className="font-semibold">{sim.title}</span>
                      {sim.status && (
                        <span style={{ fontSize: '.6rem', color: '#c87832', fontStyle: 'italic', flexShrink: 0, marginTop: 2 }}>
                          {sim.status}
                        </span>
                      )}
                    </div>
                    <span className="block text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{sim.concept}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Research dropdown */}
          <div className="relative" onMouseEnter={openMenu(setResearchOpen, researchTimer)} onMouseLeave={closeMenu(setResearchOpen, researchTimer)}>
            <button className={`nav-link flex items-center gap-1 ${isActive('/research') ? 'active' : ''}`}>
              Research <span className="text-[10px]">▾</span>
            </button>
            {researchOpen && (
              <div
                onMouseEnter={openMenu(setResearchOpen, researchTimer)}
                onMouseLeave={closeMenu(setResearchOpen, researchTimer)}
                className="absolute top-full left-0 w-72 rounded-xl border py-2 shadow-2xl"
                style={{ background: 'var(--panel)', borderColor: 'var(--line)', marginTop: 2 }}
              >
                <Link to="/research" onClick={() => setResearchOpen(false)}
                  className="block px-4 py-2 text-sm hover:bg-white/5"
                  style={{ color: location.pathname === '/research' ? 'var(--accent2)' : 'var(--muted)', textDecoration: 'none', fontStyle: 'italic' }}>
                  All Research Programs
                </Link>
                <div style={{ height: 1, background: 'var(--line)', margin: '4px 12px' }} />
                {researchData.programs.map(prog => (
                  <Link key={prog.id} to={prog.path} onClick={() => setResearchOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-white/5"
                    style={{ color: isActive(prog.path) ? 'var(--accent2)' : 'var(--text)', textDecoration: 'none' }}>
                    <span className="font-semibold">{prog.title}</span>
                    <span className="block text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{prog.subtitle}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>About</Link>

          {/* Theme toggle — desktop, inline with nav links */}
          <button onClick={toggleTheme} className="nav-link" style={{ marginLeft: 8, opacity: .65 }}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>

        <div className="flex-1 md:flex-none" />

        {/* Mobile toggle */}
        <button className="md:hidden flex flex-col gap-1.5 p-1" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle navigation">
          {[0,1,2].map(i => <span key={i} className="block w-5 h-px" style={{ background: 'var(--muted)' }} />)}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t px-4 py-3 flex flex-col gap-2" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
          <Link to="/articles"   className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Articles</Link>
          <Link to="/media"      className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Media</Link>
          <div style={{ fontSize: '.72rem', color: 'var(--muted)', padding: '4px 0 2px', textTransform: 'uppercase', letterSpacing: '.08em' }}>Simulations</div>
          <Link to="/simulations" className="mobile-nav-link" style={{ paddingLeft: 12 }} onClick={() => setMobileOpen(false)}>All Simulations</Link>
          {simContent.simulations.map(sim => (
            <Link key={sim.id} to={sim.path} className="mobile-nav-link" style={{ paddingLeft: 12 }} onClick={() => setMobileOpen(false)}>
              {sim.title}
            </Link>
          ))}
          <div style={{ fontSize: '.72rem', color: 'var(--muted)', padding: '4px 0 2px', textTransform: 'uppercase', letterSpacing: '.08em' }}>Research</div>
          <Link to="/research" className="mobile-nav-link" style={{ paddingLeft: 12 }} onClick={() => setMobileOpen(false)}>All Programs</Link>
          {researchData.programs.map(prog => (
            <Link key={prog.id} to={prog.path} className="mobile-nav-link" style={{ paddingLeft: 12 }} onClick={() => setMobileOpen(false)}>
              {prog.title}
            </Link>
          ))}
          <Link to="/about" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>About</Link>
          <button onClick={toggleTheme}
            style={{ marginTop: 6, padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '.88rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
            {theme === 'dark' ? '☀ Switch to Light mode' : '☾ Switch to Dark mode'}
          </button>
        </div>
      )}

      <style>{`
        .nav-link { color:var(--muted); text-decoration:none; font-weight:500; transition:color .15s;
          background:none; border:none; cursor:pointer; padding:0; font-size:.875rem; }
        .nav-link:hover, .nav-link.active { color:var(--text); }
        .mobile-nav-link { color:var(--muted); text-decoration:none; font-size:.9rem;
          padding:6px 0; border-bottom:1px solid var(--line); display:block; }
        .mobile-nav-link:last-child { border-bottom:none; }
      `}</style>
    </nav>
  );
}
