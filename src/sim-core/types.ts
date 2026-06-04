// ISRD Unified Sim Engine — core type definitions.
// All sim tiers (Demo and Agent) share this contract.
// The Sim interface is the universal canvas-based execution contract.
// AgentSim extends it for discrete-time, agent-based, schema-driven sims.
// DomainSchema is what the AI dialogue produces for Expert-tier sims.

// ── Era metadata ─────────────────────────────────────────────────────────────

export type Era = 1 | 2 | 3 | 4 | 5;

export const ERA_LABEL: Record<Era, string> = {
  1: 'Era 1 — General Systems',
  2: 'Era 2 — Cybernetics',
  3: 'Era 3 — Complexity & Chaos',
  4: 'Era 4 — Networked Complexity',
  5: 'Era 5 — Entanglement',
};

export const ERA_COLOR: Record<Era, string> = {
  1: '#6a8a6a',
  2: '#8a7a4a',
  3: '#7a5ac8',
  4: '#c87832',
  5: '#3a8fa8',
};

export const ERA_SHORT: Record<Era, string> = {
  1: 'Era 1',
  2: 'Era 2',
  3: 'Era 3',
  4: 'Era 4',
  5: 'Era 5',
};

// ── Sim tier ──────────────────────────────────────────────────────────────────

export type SimTier = 'demo' | 'agent';

// ── Topology ──────────────────────────────────────────────────────────────────
// Determines how agents relate spatially and how spread is computed.

export type SimTopology = 'continuous' | 'grid' | 'network' | 'multilayer';

// ── Base Sim interface ────────────────────────────────────────────────────────
// Implemented by ALL sims. SimRunner renders any Sim via this contract.

export interface SimParam {
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface Sim {
  id: string;
  label: string;
  description: string;
  era: Era;
  tier: SimTier;
  topology: SimTopology;
  params: Record<string, SimParam>;
  init(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void;
  step(): void;
  draw(ctx: CanvasRenderingContext2D): void;
  resize(w: number, h: number): void;
  setParam(key: string, value: number): void;
  stats(): Record<string, string | number>;
}

// ── DomainSchema ──────────────────────────────────────────────────────────────
// The AI dialogue produces a DomainSchema for Expert-tier sims.
// AgentSimRunner interprets it — the AI never outputs executable code.

export interface AgentPropertyDef {
  key: string;
  label: string;
  type: 'boolean' | 'range';
  min?: number;
  max?: number;
  defaultValue: number | boolean;
  riskWeight: number;
  group?: string;
  description?: string;
}

export interface OutcomeStateDef {
  key: string;
  label: string;
  rgb: [number, number, number];
  terminal?: boolean;
  severity?: number;  // 0 = mild, 1 = severe
}

export interface EnvControlDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  description?: string;
}

export interface DomainSchema {
  id: string;
  name: string;
  era: Era;
  topology: SimTopology;
  renderer: 'grid' | 'force-graph' | 'attractor' | 'multilayer' | 'custom';
  agentProperties: AgentPropertyDef[];
  outcomeStates: OutcomeStateDef[];
  envControls: EnvControlDef[];
  outbreakPresets?: Array<{
    id: string;
    label: string;
    category: string;
    desc: string;
    params: Record<string, number>;
    transmission?: string;
  }>;
  // Core domain formula — receives agent state + env, returns risk probability 0–1
  computeRisk(agent: Record<string, number | boolean>, env: Record<string, number>): number;
  // Optional: domain-specific canvas additions (brainstem diagram, etc.)
  canvasExtras?: (ctx: CanvasRenderingContext2D, state: unknown) => void;
  // Lite-mode: which 2-3 env controls the .md embed exposes
  liteControls?: string[];
  aboutSim?: string;
  aboutDomain?: string;
}

// ── AgentSim interface ────────────────────────────────────────────────────────
// Extends Sim for discrete-time, schema-driven, agent-based sims (Expert tier).
// ME/CFS is the first implementation; future AI-constructed domains follow the same shape.

export interface SidebarData {
  stats: Record<string, number>;
  selectedAgent: Record<string, unknown> | null;
  schema: DomainSchema;
}

export interface AgentSim extends Sim {
  tier: 'agent';
  schema: DomainSchema;
  speed: number;
  timeLimit: number;
  setSpeed(v: number): void;
  setTimeLimit(v: number): void;
  stepDay(): void;
  getDay(): number;
  isComplete(): boolean;
  getSidebarData(): SidebarData;
  onAgentSelect?: (agentId: number | null) => void;
}
