// Zustand global store — cross-lab simulation state and UI state.

import { create } from 'zustand';
import type { LabConfig } from '../toolkit/types';

interface SimStore {
  // Active lab
  activeLabId: string | null;
  setActiveLab: (id: string | null) => void;

  // Global theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Cross-lab shared simulation parameters (AI adjustment queue)
  aiQueue: Array<{ labId: string; message: string; timestamp: number }>;
  pushAIMessage: (labId: string, message: string) => void;
  clearAIQueue: () => void;

  // Lab registry
  labs: LabConfig[];
  setLabs: (labs: LabConfig[]) => void;
}

export const useSimStore = create<SimStore>((set, get) => ({
  activeLabId: null,
  setActiveLab: (id) => set({ activeLabId: id }),

  theme: (localStorage.getItem('isrd-theme') as 'dark' | 'light') ?? 'dark',
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('isrd-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    set({ theme: next });
  },

  aiQueue: [],
  pushAIMessage: (labId, message) =>
    set(s => ({ aiQueue: [...s.aiQueue, { labId, message, timestamp: Date.now() }] })),
  clearAIQueue: () => set({ aiQueue: [] }),

  labs: [],
  setLabs: (labs) => set({ labs }),
}));
