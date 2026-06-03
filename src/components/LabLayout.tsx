import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LabConfig } from '../toolkit/types';
import { THEME_ACCENTS } from '../labs/registry';
import { MobileShelf } from './MobileShelf';

interface Props {
  lab: LabConfig;
  simArea: ReactNode;
  sidebarContent?: ReactNode;
  children?: ReactNode;
  mobilePanel?: 'sim' | 'controls';
  onMobilePanelChange?: (v: 'sim' | 'controls') => void;
}

export function LabLayout({ lab, simArea, sidebarContent, children, mobilePanel, onMobilePanelChange }: Props) {
  const accent = THEME_ACCENTS[lab.theme] ?? 'var(--accent)';

  // Map sim/controls ↔ open/closed for MobileShelf
  const shelfOpen = mobilePanel === 'controls' ? true : mobilePanel === 'sim' ? false : undefined;
  const handleShelfChange = (open: boolean) => onMobilePanelChange?.(open ? 'controls' : 'sim');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 3.5rem)' }}>
      {/* Lab header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderBottom: '1px solid var(--line)', background: 'var(--panel)', flexShrink: 0 }}>
        <Link to="/" style={{ fontSize: '.75rem', color: 'var(--muted)', textDecoration: 'none' }}>ISRD</Link>
        <span style={{ color: 'var(--line)' }}>/</span>
        <span style={{ fontSize: '.75rem', fontWeight: 700, letterSpacing: '.04em', color: accent }}>{lab.title}</span>
        {lab.ai_enabled && (
          <span style={{ marginLeft: 'auto', fontSize: '.62rem', padding: '2px 8px', borderRadius: 999, border: `1px solid ${accent}`, color: accent, opacity: .7 }}>
            AI-enabled
          </span>
        )}
      </div>

      <MobileShelf
        main={simArea}
        shelf={sidebarContent ?? <DefaultSidebar lab={lab} accent={accent} />}
        shelfTitle="Controls"
        accent={accent}
        shelfOpen={shelfOpen}
        onShelfChange={handleShelfChange}
      />

      {children}
    </div>
  );
}

function DefaultSidebar({ lab, accent }: { lab: LabConfig; accent: string }) {
  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 10 }}>
        Research & Theory
      </h3>
      <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 16px' }}>{lab.description}</p>
      <Link to="/lab/foundations" style={{ fontSize: '.8rem', color: accent, textDecoration: 'none' }}>
        ↗ Foundations Lab
      </Link>
    </div>
  );
}
