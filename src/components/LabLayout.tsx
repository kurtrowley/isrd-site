// LabLayout — standard wrapper for every lab page.
// Provides the consistent global nav, lab header, sim-sandbox area, and theory sidebar.

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LabConfig } from '../toolkit/types';
import { THEME_ACCENTS } from '../labs/registry';

interface Props {
  lab: LabConfig;
  simArea: ReactNode;
  sidebarContent?: ReactNode;
  children?: ReactNode;
}

export function LabLayout({ lab, simArea, sidebarContent, children }: Props) {
  const accent = THEME_ACCENTS[lab.theme] ?? 'var(--accent)';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Lab header */}
      <div
        className="border-b px-4 py-3 flex items-center gap-3"
        style={{ background: 'var(--panel)', borderColor: 'var(--line)' }}
      >
        <Link to="/" className="text-xs" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
          ISRD
        </Link>
        <span style={{ color: 'var(--line)' }}>/</span>
        <span className="text-xs font-bold tracking-wide" style={{ color: accent }}>
          {lab.title}
        </span>
        {lab.ai_enabled && (
          <span
            className="ml-auto text-[10px] px-2 py-0.5 rounded-full border"
            style={{ borderColor: accent, color: accent, opacity: 0.7 }}
          >
            AI-enabled
          </span>
        )}
      </div>

      {/* Main layout: sim canvas + sidebar */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 3.5rem - 2.75rem)' }}>
        {/* Sim area */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ borderRight: `1px solid var(--line)` }}>
          {simArea}
        </div>

        {/* Sidebar */}
        <div
          className="w-80 shrink-0 flex flex-col overflow-hidden"
          style={{ background: 'var(--panel)' }}
        >
          {sidebarContent ?? (
            <div className="p-4">
              <h3 className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
                Research & Theory
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {lab.description}
              </p>
              <div className="mt-4">
                <Link
                  to="/lab/foundations"
                  className="text-xs"
                  style={{ color: accent, textDecoration: 'none' }}
                >
                  ↗ Foundations Lab
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
