// Era 4 — Network Diffusion
// Demonstrates networked complexity: how topology (not just transmission rate)
// determines the shape and speed of spread through a population.
// SIR contagion on a Watts-Strogatz small-world graph, force-directed layout.

import type { Sim, SimParam } from '../sim-core/types';

interface NetNode {
  id: number;
  x: number; y: number;
  vx: number; vy: number;
  degree: number;
  adj: number[];
  state: 'S' | 'I' | 'R';
  colorT: number;
  prevRGB: [number, number, number];
  currRGB: [number, number, number];
  pulseT: number;
}

const STATE_RGB: Record<string, [number, number, number]> = {
  S: [35, 85, 115],
  I: [200, 75, 28],
  R: [45, 140, 95],
};

const N = 55;
const ERA_COLOR = '#c87832';

class NetworkDiffusionSimClass implements Sim {
  id       = 'era4-network';
  label    = 'Network Diffusion';
  era      = 4 as const;
  tier     = 'demo' as const;
  topology = 'network' as const;
  description =
    'A contagion spreads through a small-world network. Highly connected hubs ' +
    'drive early cascades; local clusters slow full saturation. Network topology ' +
    '— not just transmission rate — determines the shape of spread. Era 4 insight: ' +
    'the architecture of connections is the primary variable.';

  params: Record<string, SimParam> = {
    transmission: { label: 'Transmission β', min: 0.02, max: 0.5,  step: 0.01,  default: 0.14 },
    recovery:     { label: 'Recovery γ',     min: 0.01, max: 0.15, step: 0.005, default: 0.04 },
    rewiring:     { label: 'Rewiring p',     min: 0,    max: 0.9,  step: 0.05,  default: 0.15 },
  };

  private w = 600; private h = 400;
  private nodes: NetNode[] = [];
  private edges: [number, number][] = [];
  private p: Record<string, number> = {};
  private t = 0;

  private buildWattsStrogatz(k = 6): void {
    // Ring lattice + rewire
    const adj: Set<number>[] = Array.from({ length: N }, () => new Set<number>());
    for (let i = 0; i < N; i++) {
      for (let j = 1; j <= k / 2; j++) {
        const nb = (i + j) % N;
        adj[i].add(nb); adj[nb].add(i);
      }
    }
    const beta = this.p.rewiring ?? 0.15;
    for (let i = 0; i < N; i++) {
      for (let j = 1; j <= k / 2; j++) {
        if (Math.random() < beta) {
          const old = (i + j) % N;
          adj[i].delete(old); adj[old].delete(i);
          let nb: number;
          let tries = 0;
          do { nb = Math.floor(Math.random() * N); tries++; }
          while ((nb === i || adj[i].has(nb)) && tries < 20);
          if (tries < 20) { adj[i].add(nb); adj[nb].add(i); }
        }
      }
    }
    this.edges = [];
    for (let i = 0; i < N; i++) {
      this.nodes[i].adj = [...adj[i]];
      this.nodes[i].degree = adj[i].size;
      for (const j of adj[i]) {
        if (j > i) this.edges.push([i, j]);
      }
    }
  }

  private settleLayout(iterations = 280): void {
    const repulse = 3200;
    const springK = 0.06;
    const targetLen = Math.min(this.w, this.h) * 0.12;
    const damp = 0.82;
    const cx = this.w / 2, cy = this.h / 2;

    for (let iter = 0; iter < iterations; iter++) {
      for (const n of this.nodes) {
        let fx = (cx - n.x) * 0.004, fy = (cy - n.y) * 0.004;
        for (const m of this.nodes) {
          if (m === n) continue;
          const dx = n.x - m.x, dy = n.y - m.y;
          const d2 = Math.max(dx * dx + dy * dy, 1);
          const d = Math.sqrt(d2);
          fx += (dx / d) * repulse / d2;
          fy += (dy / d) * repulse / d2;
        }
        for (const nb of n.adj) {
          const m = this.nodes[nb];
          const dx = m.x - n.x, dy = m.y - n.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const f = (d - targetLen) * springK;
          fx += (dx / d) * f; fy += (dy / d) * f;
        }
        n.vx = (n.vx + fx) * damp;
        n.vy = (n.vy + fy) * damp;
      }
      for (const n of this.nodes) {
        n.x = Math.max(28, Math.min(this.w - 28, n.x + n.vx));
        n.y = Math.max(28, Math.min(this.h - 28, n.y + n.vy));
      }
    }
    // Zero velocities after settle
    for (const n of this.nodes) { n.vx = 0; n.vy = 0; }
  }

  init(canvas: HTMLCanvasElement): void {
    this.w = canvas.width; this.h = canvas.height;
    this.p = Object.fromEntries(Object.entries(this.params).map(([k, v]) => [k, v.default]));
    this.t = 0;

    // Place nodes on a circle initially
    const r0 = Math.min(this.w, this.h) * 0.36;
    this.nodes = Array.from({ length: N }, (_, i) => {
      const a = (i / N) * Math.PI * 2;
      return {
        id: i,
        x: this.w / 2 + Math.cos(a) * r0 + (Math.random() - 0.5) * 12,
        y: this.h / 2 + Math.sin(a) * r0 + (Math.random() - 0.5) * 12,
        vx: 0, vy: 0, degree: 0, adj: [],
        state: 'S' as const,
        colorT: 1,
        prevRGB: [...STATE_RGB.S] as [number, number, number],
        currRGB: [...STATE_RGB.S] as [number, number, number],
        pulseT: Math.random() * Math.PI * 2,
      };
    });

    this.buildWattsStrogatz();
    this.settleLayout();

    // Seed 2 infectious nodes — prefer hubs
    const sorted = [...this.nodes].sort((a, b) => b.degree - a.degree);
    for (let i = 0; i < 2; i++) {
      sorted[i].state = 'I';
      sorted[i].currRGB = [...STATE_RGB.I];
      sorted[i].prevRGB = [...STATE_RGB.I];
    }
  }

  step(): void {
    this.t++;
    const β = this.p.transmission;
    const γ = this.p.recovery;
    const next = this.nodes.map(n => n.state);

    for (const n of this.nodes) {
      if (n.state === 'S') {
        for (const nb of n.adj) {
          if (this.nodes[nb].state === 'I' && Math.random() < β) {
            next[n.id] = 'I'; break;
          }
        }
      } else if (n.state === 'I') {
        if (Math.random() < γ) next[n.id] = 'R';
      }
    }

    for (const n of this.nodes) {
      if (next[n.id] !== n.state) {
        n.prevRGB = [...n.currRGB];
        n.state = next[n.id];
        n.currRGB = [...STATE_RGB[n.state]];
        n.colorT = 0;
      }
      if (n.colorT < 1) n.colorT = Math.min(1, n.colorT + 0.07);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { w, h } = this;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#060f16'; ctx.fillRect(0, 0, w, h);

    // Edges
    for (const [a, b] of this.edges) {
      const na = this.nodes[a], nb = this.nodes[b];
      const hot = na.state === 'I' || nb.state === 'I';
      ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y);
      ctx.strokeStyle = hot ? 'rgba(200,80,30,0.38)' : 'rgba(60,110,140,0.18)';
      ctx.lineWidth = hot ? 1.4 : 0.7;
      ctx.stroke();
    }

    // Nodes
    const t = performance.now() / 1000;
    for (const n of this.nodes) {
      const [r0, g0, b0] = n.prevRGB;
      const [r1, g1, b1] = n.currRGB;
      const lp = n.colorT;
      const rc = Math.round(r0 + (r1 - r0) * lp);
      const gc = Math.round(g0 + (g1 - g0) * lp);
      const bc = Math.round(b0 + (b1 - b0) * lp);

      // Hub size: base 4px + degree scaling
      const radius = Math.max(4, 3.5 + n.degree * 0.55);
      const pulse = n.state === 'I'
        ? 1 + Math.sin(t * 4 + n.pulseT) * 0.14
        : 1;
      const dr = radius * pulse;

      const grd = ctx.createRadialGradient(n.x - dr * 0.3, n.y - dr * 0.3, dr * 0.05, n.x, n.y, dr);
      grd.addColorStop(0, `rgb(${Math.min(255, rc + 55)},${Math.min(255, gc + 55)},${Math.min(255, bc + 55)})`);
      grd.addColorStop(1, `rgb(${rc},${gc},${bc})`);
      ctx.beginPath(); ctx.arc(n.x, n.y, dr, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();

      if (n.state === 'I') {
        ctx.strokeStyle = 'rgba(255,120,50,0.55)'; ctx.lineWidth = 1.5; ctx.stroke();
      }
    }

    // HUD
    const fs = Math.max(11, Math.round(w * 0.026));
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(180,210,220,0.55)';
    ctx.font = `bold ${fs}px Inter,sans-serif`;
    ctx.fillText('Network Diffusion', 12, 22);
    ctx.font = `${Math.round(w * 0.019)}px Inter,sans-serif`;
    ctx.fillStyle = 'rgba(140,185,200,0.42)';
    ctx.fillText(`Step ${this.t}  ·  ${N} nodes`, 12, 38);

    // Era badge
    drawEraBadge(ctx, w, 'Era 4', ERA_COLOR);

    // State legend
    const legend: [string, string][] = [
      ['Susceptible', `rgb(${STATE_RGB.S.join(',')})`],
      ['Infectious',  `rgb(${STATE_RGB.I.join(',')})`],
      ['Recovered',   `rgb(${STATE_RGB.R.join(',')})`],
    ];
    let ly = h - 12;
    ctx.font = '10px Inter,sans-serif';
    for (const [lbl, col] of [...legend].reverse()) {
      ctx.fillStyle = col; ctx.fillRect(12, ly - 8, 8, 8);
      ctx.fillStyle = 'rgba(160,190,200,0.65)';
      ctx.textAlign = 'left'; ctx.fillText(lbl, 26, ly);
      ly -= 16;
    }
    ctx.textAlign = 'start';
  }

  resize(w: number, h: number): void {
    if (!this.w || !this.h) { this.w = w; this.h = h; return; }
    const sx = w / this.w, sy = h / this.h;
    for (const n of this.nodes) { n.x *= sx; n.y *= sy; }
    this.w = w; this.h = h;
  }

  setParam(key: string, value: number): void {
    this.p[key] = value;
    // Rewiring change requires rebuilding the graph
    if (key === 'rewiring') {
      this.buildWattsStrogatz();
      this.settleLayout(150);
    }
  }

  stats(): Record<string, string | number> {
    const s = this.nodes.filter(n => n.state === 'S').length;
    const i = this.nodes.filter(n => n.state === 'I').length;
    const r = this.nodes.filter(n => n.state === 'R').length;
    const pct = N > 0 ? ((r / N) * 100).toFixed(0) + '%' : '—';
    return { S: s, I: i, R: r, 'Resolved': pct, Step: this.t };
  }
}

function drawEraBadge(ctx: CanvasRenderingContext2D, w: number, label: string, color: string): void {
  ctx.font = 'bold 10px Inter,sans-serif';
  const tw = ctx.measureText(label).width;
  const bw = tw + 14, bh = 17;
  const bx = w - bw - 10, by = 8;
  ctx.fillStyle = color + '22';
  ctx.strokeStyle = color + '88';
  ctx.lineWidth = 1;
  ctx.beginPath();
  // Manual rounded rect for TS compat
  const r = 4;
  ctx.moveTo(bx + r, by);
  ctx.lineTo(bx + bw - r, by); ctx.arcTo(bx + bw, by, bx + bw, by + r, r);
  ctx.lineTo(bx + bw, by + bh - r); ctx.arcTo(bx + bw, by + bh, bx + bw - r, by + bh, r);
  ctx.lineTo(bx + r, by + bh); ctx.arcTo(bx, by + bh, bx, by + bh - r, r);
  ctx.lineTo(bx, by + r); ctx.arcTo(bx, by, bx + r, by, r);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(label, bx + bw / 2, by + 12);
  ctx.textAlign = 'start';
}

export const Era4NetworkSim: Sim = new NetworkDiffusionSimClass();
