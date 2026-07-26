// Era 5 — Backroom Dynamics (Entanglement)
// Demonstrates the invisible informal network that runs beneath every formal system.
// Two overlapping layers: formal hierarchy (solid edges) + informal relationships
// (dashed edges). A decision cascades through both simultaneously.
// Outcome is driven more by the informal layer than the org chart suggests.
// Directly models the Era 5 concept from "The Four Eras of Systems Science."

import type { Sim, SimParam } from '../sim-core/types';

interface BiNode {
  id: number;
  level: number;        // hierarchy depth 0–3
  formalParent: number | null;
  // Formal (hierarchical) canvas position
  fx: number; fy: number;
  // Informal (force-directed overlay) canvas position
  ix: number; iy: number;
  formalAdj: number[];
  informalAdj: number[];
  // Activation state: 0 = unactivated, 1 = fully active
  formalAct: number;
  informalAct: number;
  prevFormal: number;
  prevInformal: number;
  colorT: number;
}

// 20-node org: 1 → 3 → 7 → 9
const HIERARCHY = [
  [0],                                  // level 0
  [1, 2, 3],                            // level 1
  [4, 5, 6, 7, 8, 9, 10],              // level 2
  [11, 12, 13, 14, 15, 16, 17, 18, 19], // level 3
];
const PARENTS: (number | null)[] = [
  null,          // 0 root
  0, 0, 0,       // level 1
  1, 1, 2, 2, 3, 3, 3,  // level 2
  4, 4, 5, 6, 7, 8, 9, 10, 10, // level 3
];
const TOTAL = PARENTS.length; // 20

const ERA_COLOR = '#3a8fa8';
const FORMAL_COLOR: [number, number, number]   = [58, 143, 168];
const INFORMAL_COLOR: [number, number, number] = [200, 120, 50];
const NEUTRAL_RGB: [number, number, number]    = [28, 55, 72];

class BackroomDynamicsSimClass implements Sim {
  id       = 'era5-entanglement';
  label    = 'Backroom Dynamics';
  era      = 5 as const;
  tier     = 'demo' as const;
  topology = 'multilayer' as const;
  description =
    'Two networks overlay the same population: the formal hierarchy (what the org chart shows) ' +
    'and the informal relationship network (what actually drives decisions). A decision introduced ' +
    'at the top propagates through both layers simultaneously — the informal layer redistributes ' +
    'influence in ways the formal structure cannot predict. Era 5: the relevant network is often invisible.';

  params: Record<string, SimParam> = {
    formalWeight:    { label: 'Formal influence',   min: 0, max: 1,   step: 0.05, default: 0.35 },
    informalDensity: { label: 'Informal density',   min: 0, max: 1,   step: 0.05, default: 0.45 },
    propagation:     { label: 'Propagation speed',  min: 0.005, max: 0.08, step: 0.005, default: 0.025 },
  };

  private w = 600; private h = 400;
  private nodes: BiNode[] = [];
  private informalEdges: [number, number][] = [];
  private p: Record<string, number> = {};
  private t = 0;
  private pulse = 0;

  private computeHierarchyPositions(): void {
    const pad = 40;
    const levelH = (this.h - pad * 2) / (HIERARCHY.length - 1);
    for (let lvl = 0; lvl < HIERARCHY.length; lvl++) {
      const ids = HIERARCHY[lvl];
      const rowW = this.w * 0.55; // left 55% for formal
      const spacing = rowW / (ids.length + 1);
      ids.forEach((id, i) => {
        this.nodes[id].fx = this.w * 0.02 + spacing * (i + 1);
        this.nodes[id].fy = pad + lvl * levelH;
      });
    }
  }

  private buildInformalNetwork(): void {
    const density = this.p.informalDensity ?? 0.45;
    // Random connections weighted to cross hierarchy levels
    this.informalEdges = [];
    const adj: Set<number>[] = Array.from({ length: TOTAL }, () => new Set<number>());
    for (let i = 0; i < TOTAL; i++) {
      for (let j = i + 1; j < TOTAL; j++) {
        // Prefer cross-level connections (the interesting ones)
        const levelDiff = Math.abs(this.nodes[i].level - this.nodes[j].level);
        const basePr = density * (levelDiff >= 2 ? 1.4 : levelDiff === 1 ? 0.6 : 0.2);
        // Skip formal parent-child (already shown as formal)
        if (this.nodes[i].formalAdj.includes(j)) continue;
        if (Math.random() < Math.min(0.85, basePr)) {
          adj[i].add(j); adj[j].add(i);
          this.informalEdges.push([i, j]);
        }
      }
    }
    for (let i = 0; i < TOTAL; i++) {
      this.nodes[i].informalAdj = [...adj[i]];
    }

    // Place informal positions: force-directed within right 45% of canvas
    const rxStart = this.w * 0.58;
    const rxEnd = this.w - 20;
    const rxMid = (rxStart + rxEnd) / 2;
    const ryMid = this.h / 2;

    // Initial positions: circle in right panel
    const rPanel = (rxEnd - rxStart) * 0.4;
    for (let i = 0; i < TOTAL; i++) {
      const a = (i / TOTAL) * Math.PI * 2;
      this.nodes[i].ix = rxMid + Math.cos(a) * rPanel + (Math.random() - 0.5) * 10;
      this.nodes[i].iy = ryMid + Math.sin(a) * rPanel + (Math.random() - 0.5) * 10;
    }

    // Settle informal positions within right panel
    const repulse = 800;
    const springK = 0.04;
    const tgt = 35;
    const vx = new Float32Array(TOTAL);
    const vy = new Float32Array(TOTAL);
    for (let iter = 0; iter < 200; iter++) {
      const damp = 0.8;
      for (let i = 0; i < TOTAL; i++) {
        let fx = (rxMid - this.nodes[i].ix) * 0.006;
        let fy = (ryMid - this.nodes[i].iy) * 0.006;
        for (let j = 0; j < TOTAL; j++) {
          if (j === i) continue;
          const dx = this.nodes[i].ix - this.nodes[j].ix;
          const dy = this.nodes[i].iy - this.nodes[j].iy;
          const d2 = Math.max(dx * dx + dy * dy, 1);
          const d = Math.sqrt(d2);
          fx += (dx / d) * repulse / d2;
          fy += (dy / d) * repulse / d2;
        }
        for (const nb of this.nodes[i].informalAdj) {
          const dx = this.nodes[nb].ix - this.nodes[i].ix;
          const dy = this.nodes[nb].iy - this.nodes[i].iy;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const f = (d - tgt) * springK;
          fx += (dx / d) * f; fy += (dy / d) * f;
        }
        vx[i] = (vx[i] + fx) * damp;
        vy[i] = (vy[i] + fy) * damp;
      }
      for (let i = 0; i < TOTAL; i++) {
        this.nodes[i].ix = Math.max(rxStart + 12, Math.min(rxEnd - 12, this.nodes[i].ix + vx[i]));
        this.nodes[i].iy = Math.max(16, Math.min(this.h - 16, this.nodes[i].iy + vy[i]));
      }
    }
  }

  init(canvas: HTMLCanvasElement): void {
    this.w = canvas.width; this.h = canvas.height;
    this.p = Object.fromEntries(Object.entries(this.params).map(([k, v]) => [k, v.default]));
    this.t = 0; this.pulse = 0;

    // Build nodes
    this.nodes = Array.from({ length: TOTAL }, (_, id) => {
      const level = HIERARCHY.findIndex(row => row.includes(id));
      const formalParent = PARENTS[id];
      const formalAdj: number[] = [];
      if (formalParent !== null) formalAdj.push(formalParent);
      for (let c = 0; c < TOTAL; c++) {
        if (PARENTS[c] === id) formalAdj.push(c);
      }
      return {
        id, level, formalParent, formalAdj, informalAdj: [],
        fx: 0, fy: 0, ix: 0, iy: 0,
        formalAct: 0, informalAct: 0,
        prevFormal: 0, prevInformal: 0,
        colorT: 1,
      };
    });

    this.computeHierarchyPositions();
    this.buildInformalNetwork();
  }

  step(): void {
    this.t++;
    this.pulse = performance.now() / 1000;
    const speed = this.p.propagation;
    const fw = this.p.formalWeight;

    // Root node receives a sustained pulse
    this.nodes[0].formalAct = Math.min(1, this.nodes[0].formalAct + speed * 2.5);
    this.nodes[0].informalAct = Math.min(1, this.nodes[0].informalAct + speed * 1.2);

    // Propagate formal: parent → children (top-down cascade)
    for (const n of this.nodes) {
      n.prevFormal = n.formalAct;
      n.prevInformal = n.informalAct;
    }
    for (const n of this.nodes) {
      if (n.formalParent !== null) {
        const parent = this.nodes[n.formalParent];
        if (parent.formalAct > 0.05) {
          n.formalAct = Math.min(1, n.formalAct + parent.formalAct * speed * fw * 1.8);
        }
      }
    }

    // Propagate informal: peer influence (bidirectional, slower attenuation)
    for (const n of this.nodes) {
      const infW = 1 - fw;
      for (const nb of n.informalAdj) {
        const peer = this.nodes[nb];
        if (peer.informalAct > 0.05 || peer.formalAct > 0.1) {
          const signal = Math.max(peer.informalAct, peer.formalAct * 0.6);
          n.informalAct = Math.min(1, n.informalAct + signal * speed * infW * 1.4);
        }
      }
    }

    // Slow decay at leaves to keep dynamics visible
    for (const n of this.nodes) {
      if (n.level === 3) {
        n.formalAct   = Math.max(0, n.formalAct   - 0.002);
        n.informalAct = Math.max(0, n.informalAct - 0.003);
      }
    }

    for (const n of this.nodes) {
      if (Math.abs(n.formalAct - n.prevFormal) > 0.01 || Math.abs(n.informalAct - n.prevInformal) > 0.01) {
        n.colorT = 0;
      }
      if (n.colorT < 1) n.colorT = Math.min(1, n.colorT + 0.06);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { w, h } = this;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#060f16'; ctx.fillRect(0, 0, w, h);

    // Panel divider
    const divX = w * 0.565;
    ctx.strokeStyle = 'rgba(58,143,168,0.12)'; ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.moveTo(divX, 10); ctx.lineTo(divX, h - 10); ctx.stroke();
    ctx.setLineDash([]);

    // Panel labels
    ctx.font = 'bold 10px Inter,sans-serif';
    ctx.fillStyle = 'rgba(58,143,168,0.45)'; ctx.textAlign = 'center';
    ctx.fillText('FORMAL STRUCTURE', divX * 0.5, 14);
    ctx.fillStyle = 'rgba(200,120,50,0.45)';
    ctx.fillText('INFORMAL NETWORK', divX + (w - divX) * 0.5, 14);
    ctx.textAlign = 'start';

    // ── Formal edges (left panel) ──
    ctx.setLineDash([]);
    for (const n of this.nodes) {
      if (n.formalParent === null) continue;
      const parent = this.nodes[n.formalParent];
      const act = (n.formalAct + parent.formalAct) / 2;
      const a = 0.12 + act * 0.55;
      ctx.beginPath(); ctx.moveTo(parent.fx, parent.fy); ctx.lineTo(n.fx, n.fy);
      ctx.strokeStyle = `rgba(${FORMAL_COLOR.join(',')},${a.toFixed(2)})`;
      ctx.lineWidth = 1 + act * 1.5;
      ctx.stroke();
    }

    // ── Informal edges (right panel) ──
    ctx.setLineDash([3, 4]);
    for (const [a, b] of this.informalEdges) {
      const na = this.nodes[a], nb = this.nodes[b];
      const act = (na.informalAct + nb.informalAct) / 2;
      const alpha = 0.08 + act * 0.5;
      ctx.beginPath(); ctx.moveTo(na.ix, na.iy); ctx.lineTo(nb.ix, nb.iy);
      ctx.strokeStyle = `rgba(${INFORMAL_COLOR.join(',')},${alpha.toFixed(2)})`;
      ctx.lineWidth = 0.8 + act;
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // ── Cross-panel ghost links (same node, two positions) ──
    for (const n of this.nodes) {
      const act = Math.max(n.formalAct, n.informalAct);
      if (act < 0.08) continue;
      ctx.beginPath(); ctx.moveTo(n.fx, n.fy); ctx.lineTo(n.ix, n.iy);
      ctx.strokeStyle = `rgba(120,160,180,${(act * 0.18).toFixed(2)})`;
      ctx.lineWidth = 0.6; ctx.setLineDash([2, 8]);
      ctx.stroke(); ctx.setLineDash([]);
    }

    // ── Nodes ──
    const drawNode = (x: number, y: number, fAct: number, iAct: number, isRoot: boolean) => {
      const r = isRoot ? 10 : 6.5;
      const dominant = fAct >= iAct ? 'formal' : 'informal';
      const [fr, fg, fb] = FORMAL_COLOR;
      const [ir, ig, ib] = INFORMAL_COLOR;
      const [nr, ng, nb2] = NEUTRAL_RGB;
      const blendF = fAct;
      const blendI = iAct;
      const totalAct = Math.min(1, fAct * this.p.formalWeight + iAct * (1 - this.p.formalWeight));

      // Base color: blend formal + informal + neutral
      const rc = Math.round(nr + (fr - nr) * blendF * 0.7 + (ir - nr) * blendI * 0.6);
      const gc = Math.round(ng + (fg - ng) * blendF * 0.7 + (ig - ng) * blendI * 0.6);
      const bc = Math.round(nb2 + (fb - nb2) * blendF * 0.7 + (ib - nb2) * blendI * 0.6);

      const grd = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.05, x, y, r);
      grd.addColorStop(0, `rgb(${Math.min(255, rc + 50)},${Math.min(255, gc + 50)},${Math.min(255, bc + 50)})`);
      grd.addColorStop(1, `rgb(${rc},${gc},${bc})`);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();

      // Outer ring shows dominant influence
      if (totalAct > 0.1) {
        const ringCol = dominant === 'formal'
          ? `rgba(${FORMAL_COLOR.join(',')},${(totalAct * 0.7).toFixed(2)})`
          : `rgba(${INFORMAL_COLOR.join(',')},${(totalAct * 0.7).toFixed(2)})`;
        ctx.strokeStyle = ringCol; ctx.lineWidth = 1.5; ctx.stroke();
      }

      // Left/right split indicator for activated nodes
      if (totalAct > 0.15) {
        // Left half: formal
        if (fAct > 0.05) {
          ctx.beginPath(); ctx.arc(x, y, r * 0.45, -Math.PI / 2, Math.PI / 2, true);
          ctx.fillStyle = `rgba(${FORMAL_COLOR.join(',')},${(fAct * 0.6).toFixed(2)})`; ctx.fill();
        }
        // Right half: informal
        if (iAct > 0.05) {
          ctx.beginPath(); ctx.arc(x, y, r * 0.45, -Math.PI / 2, Math.PI / 2, false);
          ctx.fillStyle = `rgba(${INFORMAL_COLOR.join(',')},${(iAct * 0.6).toFixed(2)})`; ctx.fill();
        }
      }
    };

    // Draw formal-panel nodes
    for (const n of this.nodes) {
      drawNode(n.fx, n.fy, n.formalAct, n.informalAct, n.id === 0);
    }
    // Draw informal-panel nodes
    for (const n of this.nodes) {
      drawNode(n.ix, n.iy, n.formalAct, n.informalAct, n.id === 0);
    }

    // HUD
    const fs = Math.max(11, Math.round(w * 0.026));
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(180,210,220,0.55)';
    ctx.font = `bold ${fs}px Inter,sans-serif`;
    ctx.fillText('Backroom Dynamics', 12, 26);
    ctx.font = `${Math.round(w * 0.019)}px Inter,sans-serif`;
    ctx.fillStyle = 'rgba(140,185,200,0.42)';
    ctx.fillText(`${TOTAL} nodes · formal vs informal`, 12, 40);

    // Era badge
    drawEraBadge(ctx, w, 'Era 5', ERA_COLOR);

    // Legend
    const legendItems: [string, string][] = [
      ['Formal layer',   `rgba(${FORMAL_COLOR.join(',')},0.8)`],
      ['Informal layer', `rgba(${INFORMAL_COLOR.join(',')},0.8)`],
    ];
    let ly = h - 12;
    ctx.font = '10px Inter,sans-serif';
    for (const [lbl, col] of [...legendItems].reverse()) {
      ctx.fillStyle = col; ctx.fillRect(12, ly - 8, 8, 8);
      ctx.fillStyle = 'rgba(160,190,200,0.65)';
      ctx.textAlign = 'left'; ctx.fillText(lbl, 26, ly);
      ly -= 16;
    }
    ctx.textAlign = 'start';
  }

  resize(w: number, h: number): void {
    this.w = w; this.h = h;
    // SimRunner calls resize() once before the first init() to size the canvas —
    // nodes don't exist yet, so skip rebuilding positions; init() will lay them
    // out using the dimensions just stored above.
    if (this.nodes.length === 0) return;
    this.computeHierarchyPositions();
    this.buildInformalNetwork();
  }

  setParam(key: string, value: number): void {
    this.p[key] = value;
    if (key === 'informalDensity') {
      this.buildInformalNetwork();
    }
  }

  stats(): Record<string, string | number> {
    const activated = this.nodes.filter(n => Math.max(n.formalAct, n.informalAct) > 0.2).length;
    const infDriven = this.nodes.filter(n => n.informalAct > n.formalAct && n.informalAct > 0.2).length;
    const fmlDriven = activated - infDriven;
    return {
      'Activated': activated,
      'Formal-driven': fmlDriven,
      'Informal-driven': infDriven,
      Step: this.t,
    };
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

export const Era5EntanglementSim: Sim = new BackroomDynamicsSimClass();
