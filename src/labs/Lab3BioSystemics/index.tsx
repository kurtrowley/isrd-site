import { useState, useCallback } from 'react';
import { MobileShelf } from '../../components/MobileShelf';
import { MECFSSimulator, MECFSSidebar } from './MECFSSimulator';
import { OUTBREAK_PRESETS, type OutbreakPreset, type Person } from './mecfs-engine';

export const BIO_SYSTEMICS_ACCENT = '#3a6fa8';

// Lifts all the sim state and returns the raw main/shelf pieces, so callers can
// feed them into their OWN MobileShelf instead of nesting one inside another
// (MobileShelf mounts `main` in both its desktop and mobile branches, so nesting
// it inside another MobileShelf's `main` slot quadruples the live sim instances).
export function useBioSystemicsSim() {
  const [stats,    setStats]    = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<Person | null>(null);
  const [outbreak, setOutbreak] = useState<OutbreakPreset>(OUTBREAK_PRESETS[0]);

  // Default to Settings / Outbreak so the outbreak selector is visible up front.
  const [sidebarGroup, setSidebarGroup] = useState<'status'|'settings'|'about'>('settings');
  const [sidebarTab,   setSidebarTab]   = useState('outbreak');

  // Mobile panel state — lifted here so canvas clicks can switch to Controls
  const [mobilePanel, setMobilePanel] = useState<'sim'|'controls'>('sim');

  const handleSelectionChange = useCallback((p: Person | null) => {
    setSelected(p);
    if (p) {
      setSidebarGroup('status');
      setSidebarTab('person');      // auto-switch to Person tab
      setMobilePanel('controls');   // auto-switch mobile to Controls
    }
  }, []);

  const handleOutbreakChange = useCallback((ob: OutbreakPreset) => {
    setOutbreak(ob);
  }, []);

  const handleEnvChange = useCallback((_key: string, _val: number) => {}, []);

  const main = (
    <MECFSSimulator
      outbreak={outbreak}
      onStatsUpdate={setStats}
      onSelectionChange={handleSelectionChange}
    />
  );

  const shelf = (
    <MECFSSidebar
      stats={stats}
      selected={selected}
      outbreak={outbreak}
      onOutbreakChange={handleOutbreakChange}
      onEnvChange={handleEnvChange}
      activeGroup={sidebarGroup}
      activeTab={sidebarTab}
      onGroupChange={(g, defaultTab) => { setSidebarGroup(g); setSidebarTab(defaultTab); }}
      onTabChange={setSidebarTab}
    />
  );

  return {
    main, shelf,
    accent: BIO_SYSTEMICS_ACCENT,
    mobilePanel,
    shelfOpen: mobilePanel === 'controls',
    onShelfChange: (open: boolean) => setMobilePanel(open ? 'controls' : 'sim'),
  };
}

export function BioSystemicsPanel() {
  const { main, shelf, accent, shelfOpen, onShelfChange } = useBioSystemicsSim();
  return (
    <MobileShelf
      accent={accent}
      shelfTitle="Controls"
      shelfOpen={shelfOpen}
      onShelfChange={onShelfChange}
      main={main}
      shelf={shelf}
    />
  );
}
