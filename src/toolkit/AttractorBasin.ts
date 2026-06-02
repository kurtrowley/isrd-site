// AttractorBasin — models stable states in a feedback graph.
// A basin is a region of state space where the system tends to settle.
// Multiple basins represent alternative stable states (bifurcation points).

import type { FeedbackGraph, AttractorState } from './types';

export interface BasinConfig {
  numBasins: number;
  thresholds: number[];  // energy thresholds separating basins
  dampening: number;     // 0–1, how quickly system settles
}

const DEFAULT_CONFIG: BasinConfig = {
  numBasins: 3,
  thresholds: [0.33, 0.66],
  dampening: 0.08,
};

export class AttractorBasin {
  private config: BasinConfig;
  private history: number[] = [];

  constructor(config: Partial<BasinConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Compute system energy from all node values weighted by feedback edges.
  computeEnergy(graph: FeedbackGraph): number {
    let energy = 0;
    let totalWeight = 0;

    for (const node of graph.nodes.values()) {
      const norm = (node.value - node.min) / (node.max - node.min || 1);
      // Each node contributes energy based on its outgoing edge weights
      const outgoing = graph.edges.filter(e => e.from === node.id);
      const selfWeight = outgoing.reduce((sum, e) => sum + Math.abs(e.weight), 0.5);
      energy += norm * selfWeight;
      totalWeight += selfWeight;
    }

    return totalWeight > 0 ? energy / totalWeight : 0;
  }

  // Determine which attractor basin the system is in.
  classifyBasin(energy: number): number {
    for (let i = this.config.thresholds.length - 1; i >= 0; i--) {
      if (energy >= this.config.thresholds[i]) return i + 1;
    }
    return 0;
  }

  // Compute local stability: variance of recent energy history.
  // Low variance = high stability.
  computeStability(): number {
    if (this.history.length < 5) return 0.5;
    const mean = this.history.reduce((a, b) => a + b, 0) / this.history.length;
    const variance = this.history.reduce((sum, v) => sum + (v - mean) ** 2, 0) / this.history.length;
    return Math.max(0, 1 - variance * 20);
  }

  // Apply one step of attractor dynamics — nudges node values toward basin floor.
  step(graph: FeedbackGraph): AttractorState {
    const energy = this.computeEnergy(graph);
    this.history.push(energy);
    if (this.history.length > 20) this.history.shift();

    // Propagate feedback: each node receives influence from upstream nodes
    const updates = new Map<string, number>();
    for (const edge of graph.edges) {
      const src = graph.nodes.get(edge.from);
      const dst = graph.nodes.get(edge.to);
      if (!src || !dst) continue;
      const srcNorm = (src.value - src.min) / (src.max - src.min || 1);
      const influence = srcNorm * edge.weight * this.config.dampening;
      updates.set(edge.to, (updates.get(edge.to) ?? 0) + influence);
    }

    for (const [id, delta] of updates) {
      const node = graph.nodes.get(id)!;
      node.value = Math.max(node.min, Math.min(node.max, node.value + delta));
    }

    return {
      basin: this.classifyBasin(energy),
      stability: this.computeStability(),
      energy,
    };
  }

  reset() {
    this.history = [];
  }
}
