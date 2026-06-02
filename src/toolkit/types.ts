// Core types for the Sim-Toolkit — shared across all labs.

export interface SimNode {
  id: string;
  label: string;
  value: number;       // current state: 0–1 normalized
  min: number;
  max: number;
}

export interface SimEdge {
  from: string;
  to: string;
  weight: number;      // positive = reinforcing, negative = inhibiting
}

export interface FeedbackGraph {
  nodes: Map<string, SimNode>;
  edges: SimEdge[];
}

export interface AttractorState {
  basin: number;       // which basin (0-indexed)
  stability: number;   // 0=unstable, 1=stable
  energy: number;      // system energy level
}

export interface SimulationState {
  graph: FeedbackGraph;
  attractor: AttractorState;
  tick: number;
  running: boolean;
}

export interface LabConfig {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  components: string[];
  theme: string;
  ai_enabled: boolean;
  author: string;
  path: string;
}

export type SimAdjustment = {
  nodeId: string;
  delta: number;
  reason: string;
};
