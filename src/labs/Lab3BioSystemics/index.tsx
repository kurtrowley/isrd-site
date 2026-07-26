import { useState, useCallback } from 'react';
import { MobileShelf } from '../../components/MobileShelf';
import { MECFSSimulator, MECFSSidebar } from './MECFSSimulator';
import { OUTBREAK_PRESETS, type OutbreakPreset, type Person } from './mecfs-engine';

const ACCENT = '#3a6fa8';

export function BioSystemicsPanel() {
  const [stats,    setStats]    = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<Person | null>(null);
  const [outbreak, setOutbreak] = useState<OutbreakPreset>(OUTBREAK_PRESETS[0]);

  // Sidebar tab state — lifted here so canvas clicks can drive it
  const [sidebarGroup, setSidebarGroup] = useState<'status'|'settings'|'about'>('status');
  const [sidebarTab,   setSidebarTab]   = useState('stats');

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

  const shelfOpen = mobilePanel === 'controls';

  return (
    <MobileShelf
      accent={ACCENT}
      shelfTitle="Controls"
      shelfOpen={shelfOpen}
      onShelfChange={open => setMobilePanel(open ? 'controls' : 'sim')}
      main={
        <MECFSSimulator
          outbreak={outbreak}
          onStatsUpdate={setStats}
          onSelectionChange={handleSelectionChange}
        />
      }
      shelf={
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
      }
    />
  );
}
