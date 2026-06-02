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

  const handleOutbreakChange = useCallback((ob: OutbreakPreset) => {
    setOutbreak(ob);
  }, []);

  const handleEnvChange = useCallback((_key: string, _val: number) => {
    // env changes are handled inside MECFSSimulator via simRef
  }, []);

  return (
    <LabLayout
      lab={LAB}
      simArea={
        <MECFSSimulator
          outbreak={outbreak}
          onStatsUpdate={setStats}
          onSelectionChange={setSelected}
        />
      }
      sidebarContent={
        <MECFSSidebar
          stats={stats}
          selected={selected}
          outbreak={outbreak}
          onOutbreakChange={handleOutbreakChange}
          onEnvChange={handleEnvChange}
        />
      }
    />
  );
}
