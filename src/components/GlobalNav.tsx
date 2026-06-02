import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSimStore } from '../store/useSimStore';
import { LAB_REGISTRY } from '../labs/registry';

export function GlobalNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [labsOpen,   setLabsOpen]   = useState(false);
  const { theme, toggleTheme } = useSimStore();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{ background: 'rgba(6,15,22,0.92)', backdropFilter: 'blur(12px)', borderColor: 'var(--line)' }}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-6">
        {/* Brand */}
        <Link to="/" className="flex flex-col leading-tight shrink-0" style={{ textDecoration: 'none' }}>
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gold)' }}>ISRD</span>
          <span className="text-[10px] tracking-wider" style={{ color: 'var(--muted)' }}>Foundry</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-5 text-sm flex-1">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>

          {/* Labs dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setLabsOpen(true)}
            onMouseLeave={() => setLabsOpen(false)}
          >
            <button className={`nav-link flex items-center gap-1 ${isActive('/lab') ? 'active' : ''}`}>
              Labs <span className="text-[10px]">▾</span>
            </button>
            {labsOpen && (
              <div
                className="absolute top-full left-0 mt-1 w-64 rounded-xl border py-2 shadow-2xl"
                style={{ background: 'var(--panel)', borderColor: 'var(--line)' }}
              >
                {LAB_REGISTRY.map(lab => (
                  <Link
                    key={lab.id}
                    to={lab.path}
                    className="block px-4 py-2 text-sm transition-colors hover:bg-white/5"
                    style={{ color: isActive(lab.path) ? 'var(--accent2)' : 'var(--text)', textDecoration: 'none' }}
                  >
                    <span className="font-semibold">{lab.shortTitle}</span>
                    <span className="block text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{lab.description.slice(0, 50)}…</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>About</Link>
        </div>

        <div className="flex-1 md:flex-none" />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="text-xs px-3 py-1.5 rounded-lg border transition-all"
          style={{ background: 'var(--panel-b)', borderColor: 'var(--line)', color: 'var(--muted)' }}
        >
          {theme === 'dark' ? '☀ Light' : '☾ Dark'}
        </button>

        {/* Mobile toggle */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle navigation"
        >
          {[0,1,2].map(i => (
            <span key={i} className="block w-5 h-px" style={{ background: 'var(--muted)' }} />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t px-4 py-3 flex flex-col gap-2" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
          <Link to="/" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Home</Link>
          {LAB_REGISTRY.map(lab => (
            <Link key={lab.id} to={lab.path} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
              {lab.shortTitle}
            </Link>
          ))}
          <Link to="/about" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>About</Link>
        </div>
      )}

      <style>{`
        .nav-link {
          color: var(--muted);
          text-decoration: none;
          font-weight: 500;
          transition: color .15s;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-size: .875rem;
        }
        .nav-link:hover, .nav-link.active { color: var(--text); }
        .mobile-nav-link {
          color: var(--muted); text-decoration: none; font-size: .9rem;
          padding: 6px 0; border-bottom: 1px solid var(--line);
        }
        .mobile-nav-link:last-child { border-bottom: none; }
      `}</style>
    </nav>
  );
}
