import labsData from '../content/labs.json';

export interface LabConfig {
  id: string;
  type: 'core' | 'lab';
  title: string;
  shortTitle: string;
  description: string;
  components: string[];
  theme: string;
  ai_enabled: boolean;
  author: string;
  path: string;
  whitepapers?: Array<{ title: string; desc: string; tag: string }>;
  api_docs?: Array<{ name: string; sig: string; desc: string }>;
  learning_paths?: Array<{ title: string; modules: number; tag: string }>;
}

export const LAB_REGISTRY: LabConfig[] = labsData.labs as LabConfig[];

export const THEME_ACCENTS: Record<string, string> = {
  gold:        '#d4a847',
  cyan:        '#3a8fa8',
  'blue-pulse':'#3a6fa8',
  amber:       '#c87832',
  violet:      '#7a5ac8',
};

// Background shades for card types
export const TYPE_BG: Record<string, string> = {
  core: '#0e1f2e',  // slightly lighter/different from standard panel
  lab:  'var(--panel)',
};

export const TYPE_BORDER: Record<string, string> = {
  core: '#1e3a50',
  lab:  'var(--line)',
};
