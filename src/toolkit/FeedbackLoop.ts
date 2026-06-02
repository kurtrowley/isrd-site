// FeedbackLoop — directed graph primitive for systemic simulation.
// Nodes represent state variables; edges represent causal influence (feedback weights).

import type { FeedbackGraph, SimNode, SimEdge } from './types';

export class FeedbackLoop {
  private graph: FeedbackGraph;

  constructor() {
    this.graph = { nodes: new Map(), edges: [] };
  }

  addNode(node: SimNode): this {
    this.graph.nodes.set(node.id, { ...node });
    return this;
  }

  addEdge(edge: SimEdge): this {
    this.graph.edges.push({ ...edge });
    return this;
  }

  removeNode(id: string): this {
    this.graph.nodes.delete(id);
    this.graph.edges = this.graph.edges.filter(e => e.from !== id && e.to !== id);
    return this;
  }

  setNodeValue(id: string, value: number): this {
    const node = this.graph.nodes.get(id);
    if (node) node.value = Math.max(node.min, Math.min(node.max, value));
    return this;
  }

  getNodeValue(id: string): number {
    return this.graph.nodes.get(id)?.value ?? 0;
  }

  getGraph(): FeedbackGraph {
    return this.graph;
  }

  // Returns nodes that feed into a given node (its inputs).
  getInputNodes(id: string): SimNode[] {
    return this.graph.edges
      .filter(e => e.to === id)
      .map(e => this.graph.nodes.get(e.from))
      .filter((n): n is SimNode => n !== undefined);
  }

  // Returns nodes a given node feeds into (its outputs).
  getOutputNodes(id: string): SimNode[] {
    return this.graph.edges
      .filter(e => e.from === id)
      .map(e => this.graph.nodes.get(e.to))
      .filter((n): n is SimNode => n !== undefined);
  }

  // Net feedback score for a node: sum of (source_value * edge_weight) for all inputs.
  netFeedback(id: string): number {
    return this.graph.edges
      .filter(e => e.to === id)
      .reduce((sum, e) => {
        const src = this.graph.nodes.get(e.from);
        if (!src) return sum;
        const norm = (src.value - src.min) / (src.max - src.min || 1);
        return sum + norm * e.weight;
      }, 0);
  }

  clone(): FeedbackLoop {
    const copy = new FeedbackLoop();
    for (const node of this.graph.nodes.values()) copy.addNode({ ...node });
    for (const edge of this.graph.edges) copy.addEdge({ ...edge });
    return copy;
  }

  snapshot(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const [id, node] of this.graph.nodes) out[id] = node.value;
    return out;
  }

  restore(snapshot: Record<string, number>): void {
    for (const [id, value] of Object.entries(snapshot)) this.setNodeValue(id, value);
  }
}
