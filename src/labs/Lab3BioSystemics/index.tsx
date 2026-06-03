import { useState, useCallback } from 'react';
import { LabLayout } from '../../components/LabLayout';
import { LAB_REGISTRY } from '../registry';
import { MECFSSimulator, MECFSSidebar } from './MECFSSimulator';
import { OUTBREAK_PRESETS, type OutbreakPreset, type Person } from './mecfs-engine';

const LAB = LAB_REGISTRY.find(l => l.id === 'bio-systemics')!;

export function BioSystemicsLab() {
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

  return (
    <LabLayout
      lab={LAB}
      mobilePanel={mobilePanel}
      onMobilePanelChange={setMobilePanel}
      simArea={
        <MECFSSimulator
          outbreak={outbreak}
          onStatsUpdate={setStats}
          onSelectionChange={handleSelectionChange}
        />
      }
      sidebarContent={
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
