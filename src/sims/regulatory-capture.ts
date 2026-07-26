// Era 3 — The Latched Loop (Regulatory Capture)
// A bistable attractor-basin model of a closed regulatory feedback loop that can
// settle into either a healthy "Regulated" state or a self-sustaining "Captured"
// state — with different thresholds for entering and leaving each (hysteresis).
//
// Modeled on the causal architecture proposed in Kurt Rowley's RPND (Respiratory
// Pacemaker Network Disruption) hypothesis for a subset of ME/CFS: sustained
// cortical/limbic override of the brainstem respiratory pacemaker -> chronic mild
// hypocapnia -> impaired tissue oxygen delivery -> a protective Cell Danger
// Response -> a reinforcing signal back onto cortical/limbic drive that helps the
// captured state outlast the pressure that triggered it, while entraining several
// unrelated downstream systems (cardiac rhythm, sleep, gut motility, cognition).
//
// Two independently adjustable inputs: Cumulative Pressure (the chronic baseline
// — infection, chronic threat state, structural injury — that sets how close the
// system sits to its threshold) and Exertion (an acute, momentary load). The same
// exertion level produces a mild response at low pressure and a disproportionate,
// delayed one at high pressure — a direct model of post-exertional malaise as
// "demand meeting an already-reduced supply ceiling," not exertion alone.
//
// The body diagram is a schematic, not an illustration — simple anatomical icons
// standing in for each node so the causal chain reads as a physical pathway
// (brain -> brainstem -> lungs -> bloodstream -> cell) rather than an abstract
// graph. See the research note "Regulatory Capture" for the full explanation and
// the isomorphism to emergent flocking (boids) and sensitive-dependence (Lorenz)
// dynamics used elsewhere on this site.

import type { Sim, SimParam } from '../sim-core/types';
import { FeedbackLoop } from '../toolkit/FeedbackLoop';
import { AttractorBasin } from '../toolkit/AttractorBasin';

const ERA_COLOR = '#7a5ac8';
const REGULATED_COLOR: [number, number, number] = [70, 160, 190];
const CAPTURED_COLOR:  [number, number, number] = [210, 90, 60];
const PULSE_COLOR:     [number, number, number] = [230, 210, 140];

// Central causal spine, drawn as a simple top-to-bottom anatomical pathway.
const SPINE: Array<{ id: string; label: string; shape: 'brain' | 'lungs' | 'blood' | 'hub' }> = [
  { id: 'corticalDrive', label: 'Cortical / Limbic Override', shape: 'brain' },
  { id: 'hypocapnia',    label: 'Hypocapnia (↓CO₂)',          shape: 'lungs' },
  { id: 'hypoxia',       label: 'Tissue O₂ Deficit',          shape: 'blood' },
  { id: 'cdr',           label: 'Cell Danger Response',       shape: 'hub'   },
];

// Downstream entrained organs — one upstream node, many unrelated systems
// drifting together, matching §2.3's "one upstream failure, many downstream
// symptoms."
const DOWNSTREAM: Array<{ id: string; label: string; shape: 'heart' | 'gut' | 'moon' | 'cloud' }> = [
  { id: 'cardiac',   label: 'Cardiac Rhythm',      shape: 'heart' },
  { id: 'cognition', label: 'Cognitive Function',  shape: 'cloud' },
  { id: 'sleep',     label: 'Sleep Architecture',  shape: 'moon'  },
  { id: 'gut',       label: 'Gut Motility',        shape: 'gut'   },
];

// Hysteresis: the CDR level needed to enter the Captured basin is higher than
// the level needed to leave it once there — this asymmetry is the whole point
// of the demonstration (§2.3: "the system latches").
const ENTER_THRESHOLD = 0.55;
const EXIT_THRESHOLD  = 0.22;
const BASE_GAIN = 0.35; // fixed weight of the cdr -> corticalDrive feedback edge
const HISTORY_LEN = 180;

interface HistorySample { pressure: number; cdr: number; captured: boolean; }

class RegulatoryCaptureSimClass implements Sim {
  id       = 'regulatory-capture';
  label    = 'The Latched Loop';
  era      = 3 as const;
  tier     = 'demo' as const;
  topology = 'continuous' as const;
  description =
    'A closed feedback loop can settle into two different stable states — and the ' +
    'pressure needed to enter the unhealthy one is lower than the pressure needed to ' +
    'leave it. Raise Exertion at different Pressure baselines to see the same effort ' +
    'produce a mild response or a delayed, disproportionate one — a model of ' +
    'post-exertional malaise in an ME/CFS regulatory-capture hypothesis.';

  params: Record<string, SimParam> = {
    pressure: { label: 'Cumulative pressure (infection · stress · injury)', min: 0, max: 1, step: 0.01, default: 0.15 },
    exertion: { label: 'Exertion (physical / cognitive effort right now)',  min: 0, max: 1, step: 0.01, default: 0 },
  };

  private w = 600; private h = 400;
  private loop = new FeedbackLoop();
  private basin = new AttractorBasin({ numBasins: 2, thresholds: [0.4], dampening: 0.05 });
  private p: Record<string, number> = {};
  private t = 0;
  private captured = false;
  private pemDebt = 0;     // slow-building, slow-decaying exertion-vs-supply deficit
  private deficit = 0;     // instantaneous demand-over-supply gap, for the pulse overlay
  private history: HistorySample[] = [];

  private positions: Record<string, { x: number; y: number }> = {};

  private layout(): void {
    if (Object.keys(this.positions).length === 0 && this.loop.getGraph().nodes.size === 0) return;
    const w = this.w, h = this.h;
    const cx = w * 0.30;
    const top = h * 0.12, bottom = h * 0.60;
    const step = (bottom - top) / (SPINE.length - 1);
    SPINE.forEach((n, i) => { this.positions[n.id] = { x: cx, y: top + step * i }; });

    this.positions['cardiac']   = { x: w * 0.66, y: h * 0.20 };
    this.positions['cognition'] = { x: w * 0.82, y: h * 0.34 };
    this.positions['sleep']     = { x: w * 0.82, y: h * 0.52 };
    this.positions['gut']       = { x: w * 0.66, y: h * 0.64 };
  }

  init(canvas: HTMLCanvasElement): void {
    this.w = canvas.width; this.h = canvas.height;
    this.p = Object.fromEntries(Object.entries(this.params).map(([k, v]) => [k, v.default]));
    this.t = 0;
    this.captured = false;
    this.pemDebt = 0;
    this.deficit = 0;
    this.history = [];
    this.basin.reset();

    this.loop = new FeedbackLoop();
    this.loop.addNode({ id: 'pressure', label: 'Cumulative Pressure', value: 0, min: 0, max: 1 });
    for (const n of SPINE) this.loop.addNode({ id: n.id, label: n.label, value: 0, min: 0, max: 1 });
    for (const n of DOWNSTREAM) this.loop.addNode({ id: n.id, label: n.label, value: 0, min: 0, max: 1 });

    this.loop.addEdge({ from: 'pressure',      to: 'corticalDrive', weight: 0.8 });
    this.loop.addEdge({ from: 'corticalDrive', to: 'hypocapnia',    weight: 0.8 });
    this.loop.addEdge({ from: 'hypocapnia',    to: 'hypoxia',       weight: 0.75 });
    this.loop.addEdge({ from: 'hypoxia',       to: 'cdr',           weight: 0.8 });
    // The reinforcing loop that makes the system bistable rather than merely proportional.
    this.loop.addEdge({ from: 'cdr',           to: 'corticalDrive', weight: BASE_GAIN });
    // Downstream entrainment — one-directional, no feedback.
    for (const n of DOWNSTREAM) this.loop.addEdge({ from: 'cdr', to: n.id, weight: 0.55 });

    this.layout();
  }

  step(): void {
    this.t++;
    const graph = this.loop.getGraph();

    this.loop.setNodeValue('pressure', this.p.pressure);
    this.basin.step(graph);

    // Post-exertional malaise mechanic: exertion raises O2 demand; chronic
    // hypoxia (from sustained pressure) lowers the supply ceiling. The gap
    // between them accumulates into a slow-building, slow-decaying debt that
    // drives CDR directly — so the same exertion is well tolerated at a low
    // pressure baseline and produces a delayed, disproportionate response at
    // a high one.
    const hypoxia = this.loop.getNodeValue('hypoxia');
    const supplyCeiling = 1 - hypoxia * 0.9;
    const demand = 0.12 + this.p.exertion * 0.9;
    this.deficit = Math.max(0, demand - supplyCeiling);
    this.pemDebt = this.pemDebt * 0.985 + this.deficit * 0.05;
    const cdrNode = graph.nodes.get('cdr')!;
    cdrNode.value = Math.min(1, cdrNode.value + this.pemDebt * 0.05);

    const cdr = cdrNode.value;
    if (!this.captured && cdr >= ENTER_THRESHOLD) this.captured = true;
    else if (this.captured && cdr <= EXIT_THRESHOLD) this.captured = false;

    if (this.t % 4 === 0) {
      this.history.push({ pressure: this.p.pressure, cdr, captured: this.captured });
      if (this.history.length > HISTORY_LEN) this.history.shift();
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { w, h } = this;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#060f16'; ctx.fillRect(0, 0, w, h);
    this.layout();

    const graph = this.loop.getGraph();
    const stateColor = this.captured ? CAPTURED_COLOR : REGULATED_COLOR;
    const val = (id: string) => graph.nodes.get(id)?.value ?? 0;

    // ── Edges (with traveling pulses) ──────────────────────────────────────
    const edge = (aId: string, bId: string, act: number, curveX?: number) => {
      const a = this.positions[aId], b = this.positions[bId];
      if (!a || !b) return;
      ctx.beginPath();
      if (curveX != null) {
        ctx.moveTo(a.x, a.y);
        ctx.bezierCurveTo(curveX, a.y, curveX, b.y, b.x, b.y);
      } else {
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      }
      ctx.strokeStyle = `rgba(${stateColor.join(',')},${(0.12 + act * 0.5).toFixed(2)})`;
      ctx.lineWidth = 1.2 + act * 2;
      if (curveX != null) ctx.setLineDash([2, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      if (act < 0.04) return;
      const pulses = 3;
      for (let i = 0; i < pulses; i++) {
        const frac = ((this.t * 0.012 + i / pulses) % 1);
        let px: number, py: number;
        if (curveX != null) {
          const mt = 1 - frac;
          // Cubic bezier with control points (curveX, a.y) and (curveX, b.y).
          px = mt*mt*mt*a.x + 3*mt*mt*frac*curveX + 3*mt*frac*frac*curveX + frac*frac*frac*b.x;
          py = mt*mt*mt*a.y + 3*mt*mt*frac*a.y + 3*mt*frac*frac*b.y + frac*frac*frac*b.y;
        } else {
          px = a.x + (b.x - a.x) * frac; py = a.y + (b.y - a.y) * frac;
        }
        const glow = act * Math.sin(frac * Math.PI);
        ctx.beginPath(); ctx.arc(px, py, 1.3 + act * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${PULSE_COLOR.join(',')},${Math.max(0, glow).toFixed(2)})`;
        ctx.fill();
      }
    };

    edge('corticalDrive', 'hypocapnia', val('hypocapnia'));
    edge('hypocapnia', 'hypoxia', val('hypoxia'));
    edge('hypoxia', 'cdr', val('cdr'));
    edge('cdr', 'corticalDrive', val('cdr') * 0.9, Math.max(20, this.positions['cdr'].x - w * 0.20));
    for (const n of DOWNSTREAM) edge('cdr', n.id, val('cdr'));

    // Deficit pulse: exertion meeting a reduced supply ceiling, shown as an
    // extra hot pulse from the bloodstream node straight to the CDR hub.
    if (this.deficit > 0.02) {
      const a = this.positions['hypoxia'], b = this.positions['cdr'];
      const frac = (this.t * 0.03) % 1;
      const px = a.x + (b.x - a.x) * frac, py = a.y + (b.y - a.y) * frac;
      ctx.beginPath(); ctx.arc(px, py, 2 + this.deficit * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230,120,60,${Math.min(0.9, this.deficit * 2).toFixed(2)})`;
      ctx.fill();
    }

    // ── Input arrows ────────────────────────────────────────────────────────
    const drawInputArrow = (toId: string, label: string, value: number, fromDx: number, fromDy: number) => {
      const to = this.positions[toId];
      if (!to) return;
      const from = { x: to.x + fromDx, y: to.y + fromDy };
      const dx = to.x - from.x, dy = to.y - from.y;
      const dist = Math.hypot(dx, dy) || 1;
      const stopShort = 16;
      const endX = to.x - (dx / dist) * stopShort;
      const endY = to.y - (dy / dist) * stopShort;
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(endX, endY);
      ctx.strokeStyle = `rgba(200,200,210,${(0.15 + value * 0.45).toFixed(2)})`;
      ctx.lineWidth = 1 + value * 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(190,200,210,0.6)';
      ctx.font = '9px Inter,sans-serif';
      ctx.textAlign = fromDx < 0 ? 'right' : 'left';
      ctx.fillText(`${label} ${(value * 100).toFixed(0)}%`, from.x, from.y - 5);
      ctx.textAlign = 'start';
    };
    drawInputArrow('corticalDrive', 'Pressure', this.p.pressure, -w * 0.14, -6);
    drawInputArrow('hypoxia', 'Exertion', this.p.exertion, -w * 0.14, 4);

    // ── Anatomical nodes ─────────────────────────────────────────────────────
    const BASE_RGB: [number, number, number] = [28, 55, 72];
    const nodeColor = (act: number): [number, number, number] => [
      Math.round(BASE_RGB[0] + (stateColor[0] - BASE_RGB[0]) * act),
      Math.round(BASE_RGB[1] + (stateColor[1] - BASE_RGB[1]) * act),
      Math.round(BASE_RGB[2] + (stateColor[2] - BASE_RGB[2]) * act),
    ];

    const drawShape = (shape: string, x: number, y: number, r: number, act: number, pulse: number) => {
      const [cr, cg, cb] = nodeColor(act);
      const glow = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.05, x, y, r * pulse);
      glow.addColorStop(0, `rgb(${Math.min(255, cr + 60)},${Math.min(255, cg + 60)},${Math.min(255, cb + 60)})`);
      glow.addColorStop(1, `rgb(${cr},${cg},${cb})`);
      ctx.fillStyle = glow;
      ctx.strokeStyle = `rgba(${stateColor.join(',')},0.65)`;
      ctx.lineWidth = 1.2;

      switch (shape) {
        case 'brain': {
          ctx.beginPath(); ctx.ellipse(x, y, r * pulse, r * pulse * 0.8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x, y - r * 0.7); ctx.lineTo(x, y + r * 0.7);
          ctx.strokeStyle = 'rgba(6,15,22,0.4)'; ctx.lineWidth = 1; ctx.stroke();
          break;
        }
        case 'lungs': {
          ctx.beginPath(); ctx.ellipse(x - r * 0.55, y, r * 0.55 * pulse, r * 0.8 * pulse, -0.15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.ellipse(x + r * 0.55, y, r * 0.55 * pulse, r * 0.8 * pulse, 0.15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          break;
        }
        case 'blood': {
          ctx.beginPath(); ctx.arc(x, y, r * pulse, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x - r * 0.6, y);
          ctx.lineTo(x - r * 0.25, y); ctx.lineTo(x - r * 0.1, y - r * 0.5);
          ctx.lineTo(x + r * 0.1, y + r * 0.5); ctx.lineTo(x + r * 0.25, y);
          ctx.lineTo(x + r * 0.6, y);
          ctx.strokeStyle = 'rgba(6,15,22,0.45)'; ctx.lineWidth = 1; ctx.stroke();
          break;
        }
        case 'hub': {
          if (act > 0.15) {
            ctx.beginPath(); ctx.arc(x, y, r * pulse * 1.6, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${CAPTURED_COLOR.join(',')},${(act * 0.3).toFixed(2)})`;
            ctx.lineWidth = 1.5; ctx.stroke();
          }
          ctx.beginPath(); ctx.arc(x, y, r * pulse, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          break;
        }
        case 'heart': {
          ctx.beginPath();
          for (let i = 0; i <= 40; i++) {
            const tt = (i / 40) * Math.PI * 2;
            const hx = 16 * Math.pow(Math.sin(tt), 3);
            const hy = -(13 * Math.cos(tt) - 5 * Math.cos(2*tt) - 2 * Math.cos(3*tt) - Math.cos(4*tt));
            const px = x + hx * (r * pulse) / 16, py = y + hy * (r * pulse) / 16;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath(); ctx.fill(); ctx.stroke();
          break;
        }
        case 'gut': {
          ctx.beginPath(); ctx.ellipse(x, y, r * pulse, r * pulse * 0.85, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = 'rgba(6,15,22,0.4)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(x - r * 0.2, y, r * 0.45, 0.6, Math.PI * 1.4); ctx.stroke();
          ctx.beginPath(); ctx.arc(x + r * 0.2, y, r * 0.4, Math.PI * 1.6, Math.PI * 0.4); ctx.stroke();
          break;
        }
        case 'moon': {
          ctx.beginPath(); ctx.arc(x, y, r * pulse, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.arc(x + r * 0.42, y - r * 0.1, r * 0.85 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = '#060f16'; ctx.fill();
          break;
        }
        case 'cloud': {
          ctx.beginPath();
          ctx.arc(x - r * 0.4, y + r * 0.15, r * 0.55 * pulse, 0, Math.PI * 2);
          ctx.arc(x + r * 0.05, y - r * 0.15, r * 0.65 * pulse, 0, Math.PI * 2);
          ctx.arc(x + r * 0.5, y + r * 0.1, r * 0.5 * pulse, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
          break;
        }
      }
    };

    const drawNode = (id: string, label: string, shape: string, r: number, labelSide: 'left' | 'right') => {
      const pos = this.positions[id];
      const node = graph.nodes.get(id);
      if (!pos || !node) return;
      const act = node.value;
      const pulse = 1 + Math.sin(this.t * 0.07 + pos.x * 0.05) * (this.captured ? 0.09 : 0.03);
      drawShape(shape, pos.x, pos.y, r, act, pulse);

      ctx.fillStyle = 'rgba(220,230,235,0.85)'; ctx.font = '9px Inter,sans-serif';
      ctx.textAlign = labelSide === 'left' ? 'right' : 'left';
      ctx.fillText(label, labelSide === 'left' ? pos.x - r - 8 : pos.x + r + 8, pos.y + 3);
      ctx.textAlign = 'start';
    };

    for (const n of SPINE) drawNode(n.id, n.label, n.shape, n.id === 'cdr' ? 15 : 13, 'left');
    for (const n of DOWNSTREAM) drawNode(n.id, n.label, n.shape, 11, 'right');

    // ── History sparkline ────────────────────────────────────────────────────
    {
      const sx = 14, sw = w - 28, sy = h - 30, sh = 16;
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
      ctx.strokeRect(sx, sy, sw, sh);
      if (this.history.length > 1) {
        // Captured-state background bands
        this.history.forEach((s, i) => {
          if (!s.captured) return;
          const x = sx + (i / (HISTORY_LEN - 1)) * sw;
          ctx.fillStyle = `rgba(${CAPTURED_COLOR.join(',')},0.18)`;
          ctx.fillRect(x, sy, sw / HISTORY_LEN + 1, sh);
        });
        const line = (key: 'pressure' | 'cdr', color: string, width: number) => {
          ctx.beginPath();
          this.history.forEach((s, i) => {
            const x = sx + (i / (HISTORY_LEN - 1)) * sw;
            const y = sy + sh - s[key] * sh;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          });
          ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
        };
        line('pressure', 'rgba(160,170,180,0.55)', 1);
        line('cdr', `rgba(${stateColor.join(',')},0.95)`, 1.6);
      }
      ctx.font = '8px Inter,sans-serif'; ctx.fillStyle = 'rgba(150,165,175,0.5)';
      ctx.fillText('Pressure (thin) · CDR level (bright) over time', sx, sy - 4);
    }

    // ── State banner ─────────────────────────────────────────────────────────
    const bannerText = this.captured ? 'CAPTURED — self-sustaining' : 'REGULATED — healthy basin';
    ctx.font = 'bold 12px Inter,sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(${stateColor.join(',')},0.9)`;
    ctx.fillText(bannerText, w / 2, h - 44);
    ctx.textAlign = 'start';

    // ── HUD ──────────────────────────────────────────────────────────────────
    const fs = Math.max(11, Math.round(w * 0.024));
    ctx.fillStyle = 'rgba(180,210,220,0.55)'; ctx.font = `bold ${fs}px Inter,sans-serif`;
    ctx.fillText('The Latched Loop', 12, 22);
    ctx.font = `${Math.round(w * 0.016)}px Inter,sans-serif`;
    ctx.fillStyle = 'rgba(140,185,200,0.42)';
    ctx.fillText('Bistable regulatory capture — an ME/CFS hypothesis, modeled', 12, 36);

    drawEraBadge(ctx, w, 'Era 3', ERA_COLOR);
  }

  resize(w: number, h: number): void {
    this.w = w; this.h = h;
    this.layout();
  }

  setParam(key: string, value: number): void {
    this.p[key] = value;
  }

  stats(): Record<string, string | number> {
    const cdr = this.loop.getNodeValue('cdr');
    return {
      State: this.captured ? 'Captured' : 'Regulated',
      'CDR level': cdr.toFixed(2),
      Pressure: (this.p.pressure ?? 0).toFixed(2),
      Exertion: (this.p.exertion ?? 0).toFixed(2),
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

export const RegulatoryCaptureSim: Sim = new RegulatoryCaptureSimClass();
