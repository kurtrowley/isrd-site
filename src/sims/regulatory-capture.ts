// Era 3 — The Latched Loop (Regulatory Capture)
// A bistable attractor-basin model of a closed regulatory feedback loop that can
// settle into either a healthy "Regulated" state or a self-sustaining "Captured"
// state — with different thresholds for entering and leaving each (hysteresis).
//
// Modeled on the causal architecture proposed in Kurt Rowley's RPND (Respiratory
// Pacemaker Network Disruption) hypothesis for a subset of ME/CFS: sustained
// cortical/limbic override reaches PAST the brainstem pacemaker (it is not itself
// damaged, just displaced) -> chronic mild hypocapnia -> impaired tissue oxygen
// delivery -> a protective Cell Danger Response. Two reinforcing loops feed that
// override, not one: CDR signals directly, and an interoceptive alarm node
// aggregates distress from the entrained downstream systems (cardiac, cognitive,
// sleep, gut) and feeds that back too — the "downstream double-feedback loop"
// the source paper's scope note flags as sustaining the captured state once
// established. The brainstem itself sits to one side, off the captured path,
// with its own short branch down to what breathing and energy look like when
// it — not the cortex — is in control; that branch recovers on its own as
// override eases, unlike the latched main path.
//
// Two independently adjustable inputs: Cumulative Pressure (the chronic
// baseline) and Exertion (an acute, momentary load). The same exertion level
// produces a mild response at low pressure and a delayed, disproportionate one
// at high pressure — post-exertional malaise as demand meeting an already-
// reduced supply ceiling. Click any node for a short explainer.

import type { Sim, SimParam } from '../sim-core/types';
import { FeedbackLoop } from '../toolkit/FeedbackLoop';
import { AttractorBasin } from '../toolkit/AttractorBasin';

const ERA_COLOR = '#7a5ac8';
const REGULATED_COLOR: [number, number, number] = [70, 160, 190];
const CAPTURED_COLOR:  [number, number, number] = [210, 90, 60];
const PULSE_COLOR:     [number, number, number] = [230, 210, 140];
const WAVE_COLOR:      [number, number, number] = [255, 140, 60];
const ENERGY_COLOR:    [number, number, number] = [110, 200, 140];
const BASE_RGB:        [number, number, number] = [28, 55, 72];

type Shape = 'brain' | 'stem' | 'lungs' | 'blood' | 'hub' | 'heart' | 'gut' | 'moon' | 'cloud' | 'radar' | 'spark';

// The captured path — the main causal chain, drawn top-to-bottom. The cortex
// reaches past the brainstem directly; the brainstem itself is NOT on this path
// (see HEALTHY_BRANCH below).
const SPINE: Array<{ id: string; label: string; shape: Shape }> = [
  { id: 'corticalDrive', label: 'Cortical / Limbic Override', shape: 'brain' },
  { id: 'hypocapnia',    label: 'Hypocapnia (↓CO₂)',          shape: 'lungs' },
  { id: 'hypoxia',       label: 'Tissue O₂ Deficit',          shape: 'blood' },
  { id: 'cdr',           label: 'Cell Danger Response',       shape: 'hub'   },
];

// The brainstem sits beside cortical override, not in its path — its own short
// branch shows what breathing and energy look like when it, not the cortex,
// is in control. Recovers on its own as override eases.
const HEALTHY_BRANCH: Array<{ id: string; label: string; shape: Shape }> = [
  { id: 'brainstem',        label: 'Brainstem Pacemaker (preBötC)', shape: 'stem'  },
  { id: 'healthyBreathing', label: 'Healthy Breathing',             shape: 'lungs' },
  { id: 'regularEnergy',    label: 'Regular Energy',                shape: 'spark' },
];

// Downstream entrained organs — one upstream node, many unrelated systems
// drifting together (§2.3: "one upstream failure, many downstream symptoms").
const DOWNSTREAM: Array<{ id: string; label: string; shape: Shape }> = [
  { id: 'cardiac',   label: 'Cardiac Rhythm',      shape: 'heart' },
  { id: 'cognition', label: 'Cognitive Function',  shape: 'cloud' },
  { id: 'sleep',     label: 'Sleep Architecture',  shape: 'moon'  },
  { id: 'gut',       label: 'Gut Motility',        shape: 'gut'   },
];

const INTEROCEPTION = { id: 'interoception', label: 'Interoceptive Alarm', shape: 'radar' as Shape };

const NODE_EXPLAINERS: Record<string, { title: string; body: string }> = {
  corticalDrive: {
    title: 'Cortical / Limbic Override',
    body: 'The cortex can reach past the brainstem and drive breathing directly — normally brief and voluntary (speech, effort), sustained here instead. The amygdala’s direct inhibitory projection to the respiratory pacemaker is the anatomically documented route this model uses.',
  },
  hypocapnia: {
    title: 'Hypocapnia (↓CO₂)',
    body: 'Sustained override produces mild, chronic under-breathing relative to metabolic need — blood CO₂ lower than the body is tuned to run on.',
  },
  hypoxia: {
    title: 'Tissue O₂ Deficit',
    body: 'Low CO₂ makes hemoglobin hold oxygen too tightly (the Bohr effect) and independently causes vasoconstriction — two separate routes to the same result: less oxygen reaching tissue than exertion demands.',
  },
  cdr: {
    title: 'Cell Danger Response',
    body: 'A protective, evolutionarily old metabolic shutdown, triggered when cells sense they can’t safely meet demand with the oxygen available. Proposed here as the mechanism underlying post-exertional malaise.',
  },
  cardiac: {
    title: 'Cardiac Rhythm',
    body: 'Breathing paces heart rhythm directly through respiratory sinus arrhythmia — pacemaker disruption is expected to show up here early.',
  },
  cognition: {
    title: 'Cognitive Function',
    body: 'Cortical, hippocampal, and limbic oscillations are directly paced by respiration; a disrupted breathing rhythm is proposed to degrade the oscillations cognition depends on — "brain fog."',
  },
  sleep: {
    title: 'Sleep Architecture',
    body: 'The brainstem normally regains full control of breathing every night in NREM sleep. Chronic override is proposed to interfere with that nightly reset.',
  },
  gut: {
    title: 'Gut Motility',
    body: 'The gut runs on its own pacemaker cells, but is heavily modulated by autonomic tone — which breathing also paces.',
  },
  interoception: {
    title: 'Interoceptive Alarm',
    body: 'The brain continuously monitors signals of the body’s own distress — cardiac, cognitive, gastrointestinal. Sustained distress across several systems at once can itself be read as ongoing threat, a second, independent route reinforcing the same override.',
  },
  brainstem: {
    title: 'Brainstem Pacemaker (preBötC)',
    body: 'The body’s normal, automatic breathing controller. Not damaged in this model — just displaced by sustained override, the way it briefly is whenever you hold your breath on purpose. Left alone, it recovers immediately.',
  },
  healthyBreathing: {
    title: 'Healthy Breathing',
    body: 'What breathing looks like when the brainstem, not the cortex, is in control — the default state the pacemaker returns to as soon as override eases.',
  },
  regularEnergy: {
    title: 'Regular Energy',
    body: 'The downstream outcome of a brainstem left in control: no chronic CO₂ deficit, no standing oxygen debt, ordinary energy availability.',
  },
};

// Hysteresis: the CDR level needed to enter the Captured basin is higher than
// the level needed to leave it once there (§2.3: "the system latches").
const ENTER_THRESHOLD = 0.55;
const EXIT_THRESHOLD  = 0.22;
const BASE_GAIN = 0.28;      // cdr -> corticalDrive
const ALARM_GAIN = 0.28;     // interoception -> corticalDrive (the second loop)
const HISTORY_LEN = 180;
const WAVE_PATH = ['hypoxia', 'cdr', 'cardiac', 'cognition', 'sleep', 'gut', 'interoception', 'corticalDrive'];
const WAVE_DURATION = 100; // frames

interface HistorySample { pressure: number; cdr: number; energy: number; captured: boolean; }
interface Pt { x: number; y: number; }

function cubicPoint(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const mt = 1 - t;
  return {
    x: mt*mt*mt*p0.x + 3*mt*mt*t*p1.x + 3*mt*t*t*p2.x + t*t*t*p3.x,
    y: mt*mt*mt*p0.y + 3*mt*mt*t*p1.y + 3*mt*t*t*p2.y + t*t*t*p3.y,
  };
}

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
    'post-exertional malaise in an ME/CFS regulatory-capture hypothesis. Click any ' +
    'node for a short explainer.';

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
  private pemDebt = 0;
  private deficit = 0;
  private demandExceeded = false;
  private waves: Array<{ startT: number }> = [];
  private autoPhase = 0;
  private corticalPhase = 0;
  private breathBuffer: number[] = [];
  private history: HistorySample[] = [];
  private selectedNodeId: string | null = null;

  private positions: Record<string, Pt> = {};

  private layout(): void {
    if (Object.keys(this.positions).length === 0 && this.loop.getGraph().nodes.size === 0) return;
    const w = this.w, h = this.h;
    const cx = w * 0.26;
    const top = h * 0.09, bottom = h * 0.66;
    const step = (bottom - top) / (SPINE.length - 1);
    SPINE.forEach((n, i) => { this.positions[n.id] = { x: cx, y: top + step * i }; });

    // Brainstem sits to the left of cortical override, out of the main path,
    // with its own short vertical branch below it.
    const hx = w * 0.07;
    this.positions['brainstem']        = { x: hx, y: h * 0.17 };
    this.positions['healthyBreathing'] = { x: hx, y: h * 0.38 };
    this.positions['regularEnergy']    = { x: hx, y: h * 0.57 };

    this.positions['cardiac']       = { x: w * 0.58, y: h * 0.22 };
    this.positions['cognition']     = { x: w * 0.80, y: h * 0.24 };
    this.positions['sleep']         = { x: w * 0.82, y: h * 0.40 };
    this.positions['gut']           = { x: w * 0.60, y: h * 0.40 };
    // Above the downstream cluster, per the layout note.
    this.positions['interoception'] = { x: w * 0.70, y: h * 0.06 };
  }

  init(canvas: HTMLCanvasElement): void {
    this.w = canvas.width; this.h = canvas.height;
    this.p = Object.fromEntries(Object.entries(this.params).map(([k, v]) => [k, v.default]));
    this.t = 0;
    this.captured = false;
    this.pemDebt = 0;
    this.deficit = 0;
    this.demandExceeded = false;
    this.waves = [];
    this.autoPhase = 0;
    this.corticalPhase = 0;
    this.breathBuffer = new Array(90).fill(0);
    this.history = [];
    this.selectedNodeId = null;
    this.basin.reset();

    this.loop = new FeedbackLoop();
    this.loop.addNode({ id: 'pressure', label: 'Cumulative Pressure', value: 0, min: 0, max: 1 });
    for (const n of SPINE) this.loop.addNode({ id: n.id, label: n.label, value: 0, min: 0, max: 1 });
    for (const n of DOWNSTREAM) this.loop.addNode({ id: n.id, label: n.label, value: 0, min: 0, max: 1 });
    this.loop.addNode({ id: INTEROCEPTION.id, label: INTEROCEPTION.label, value: 0, min: 0, max: 1 });
    // Healthy-branch nodes start "fully in control" — they're tracked manually
    // in step(), not via graph edges (see below).
    for (const n of HEALTHY_BRANCH) this.loop.addNode({ id: n.id, label: n.label, value: 1, min: 0, max: 1 });

    // The captured path — override reaches past the brainstem directly.
    this.loop.addEdge({ from: 'pressure',      to: 'corticalDrive', weight: 0.8 });
    this.loop.addEdge({ from: 'corticalDrive', to: 'hypocapnia',    weight: 0.8 });
    this.loop.addEdge({ from: 'hypocapnia',    to: 'hypoxia',       weight: 0.75 });
    this.loop.addEdge({ from: 'hypoxia',       to: 'cdr',           weight: 0.8 });
    // Loop 1: CDR signals distress directly back to the override.
    this.loop.addEdge({ from: 'cdr', to: 'corticalDrive', weight: BASE_GAIN });
    // Downstream entrainment — one-directional out of CDR.
    for (const n of DOWNSTREAM) this.loop.addEdge({ from: 'cdr', to: n.id, weight: 0.55 });
    // Loop 2: the downstream systems' distress is itself sensed and interpreted
    // as threat, reinforcing the override a second, independent way.
    for (const n of DOWNSTREAM) this.loop.addEdge({ from: n.id, to: 'interoception', weight: 0.4 });
    this.loop.addEdge({ from: 'interoception', to: 'corticalDrive', weight: ALARM_GAIN });

    this.layout();
  }

  step(): void {
    this.t++;
    const graph = this.loop.getGraph();

    this.loop.setNodeValue('pressure', this.p.pressure);
    this.basin.step(graph);

    const corticalLevel = this.loop.getNodeValue('corticalDrive');

    // The brainstem's own control is displaced by override, not damaged by it
    // — it drifts back toward full control on its own as override eases,
    // unlike the captured path, which requires crossing back below its exit
    // threshold. The two downstream branch nodes just cascade that recovery.
    const brainstemNode = graph.nodes.get('brainstem')!;
    const healthyBreathingNode = graph.nodes.get('healthyBreathing')!;
    const regularEnergyNode = graph.nodes.get('regularEnergy')!;
    const targetBrainstem = Math.max(0, 1 - corticalLevel * 1.15);
    brainstemNode.value += (targetBrainstem - brainstemNode.value) * 0.05;
    healthyBreathingNode.value += (brainstemNode.value - healthyBreathingNode.value) * 0.06;
    regularEnergyNode.value += (healthyBreathingNode.value - regularEnergyNode.value) * 0.06;

    // Post-exertional malaise mechanic: exertion raises O2 demand; chronic
    // hypoxia (from sustained pressure) lowers the supply ceiling. The gap
    // accumulates into a slow-building, slow-decaying debt that drives CDR
    // directly, so the same exertion is well tolerated at a low pressure
    // baseline and produces a delayed, disproportionate response at a high one.
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

    // Fire a traveling wave burst the moment demand outstrips supply — a
    // one-shot pass through the whole causal path, not the ambient pulses.
    if (!this.demandExceeded && this.deficit > 0.05) {
      this.demandExceeded = true;
      this.waves.push({ startT: this.t });
    } else if (this.demandExceeded && this.deficit <= 0.02) {
      this.demandExceeded = false;
    }
    this.waves = this.waves.filter(wv => this.t - wv.startT < WAVE_DURATION);

    // Brainstem breathing rhythm: steady and autonomic at rest, progressively
    // taken over by an irregular cortical pattern as override rises.
    this.autoPhase += 0.22;
    this.corticalPhase += 0.22 + Math.sin(this.t * 0.05) * 0.12;
    const autoWave = Math.sin(this.autoPhase);
    const corticalWave = Math.sin(this.corticalPhase * 1.7) * (0.55 + 0.45 * Math.sin(this.t * 0.09));
    const sample = autoWave * (1 - corticalLevel) + corticalWave * corticalLevel;
    this.breathBuffer.push(sample);
    if (this.breathBuffer.length > 90) this.breathBuffer.shift();

    if (this.t % 4 === 0) {
      const energy = Math.max(0, 1 - cdr * 0.6 - this.pemDebt * 0.6);
      this.history.push({ pressure: this.p.pressure, cdr, energy, captured: this.captured });
      if (this.history.length > HISTORY_LEN) this.history.shift();
    }
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (line && ctx.measureText(test).width > maxWidth) { lines.push(line); line = word; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { w, h } = this;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#060f16'; ctx.fillRect(0, 0, w, h);
    this.layout();

    const graph = this.loop.getGraph();
    const stateColor = this.captured ? CAPTURED_COLOR : REGULATED_COLOR;
    const val = (id: string) => graph.nodes.get(id)?.value ?? 0;
    const pos = (id: string) => this.positions[id];

    // ── Edges (with traveling ambient pulses) ───────────────────────────────
    const edge = (aId: string, bId: string, act: number, cp1?: Pt, cp2?: Pt) => {
      const a = pos(aId), b = pos(bId);
      if (!a || !b) return;
      ctx.beginPath();
      if (cp1 && cp2) {
        ctx.moveTo(a.x, a.y);
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, b.x, b.y);
      } else {
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      }
      ctx.strokeStyle = `rgba(${stateColor.join(',')},${(0.12 + act * 0.5).toFixed(2)})`;
      ctx.lineWidth = 1.2 + act * 2;
      if (cp1) ctx.setLineDash([2, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      if (act < 0.04) return;
      const pulses = 3;
      for (let i = 0; i < pulses; i++) {
        const frac = ((this.t * 0.012 + i / pulses) % 1);
        const p = cp1 && cp2 ? cubicPoint(a, cp1, cp2, b, frac) : { x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac };
        const glow = act * Math.sin(frac * Math.PI);
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.3 + act * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${PULSE_COLOR.join(',')},${Math.max(0, glow).toFixed(2)})`;
        ctx.fill();
      }
    };

    // Captured path
    edge('corticalDrive', 'hypocapnia', val('hypocapnia'));
    edge('hypocapnia', 'hypoxia', val('hypoxia'));
    edge('hypoxia', 'cdr', val('cdr'));
    for (const n of DOWNSTREAM) edge('cdr', n.id, val('cdr'));
    for (const n of DOWNSTREAM) edge(n.id, 'interoception', val('interoception'));

    // Cortex -> brainstem: not a signal traveling toward capture, but the
    // override reaching sideways to displace the pacemaker.
    edge('corticalDrive', 'brainstem', val('corticalDrive') * 0.7);
    // The brainstem's own short healthy-outcome branch.
    edge('brainstem', 'healthyBreathing', val('healthyBreathing'));
    edge('healthyBreathing', 'regularEnergy', val('regularEnergy'));

    // Loop 1 — CDR back to the override, arcing left.
    {
      const a = pos('cdr'), b = pos('corticalDrive');
      const armX = Math.max(16, a.x - w * 0.16);
      edge('cdr', 'corticalDrive', val('cdr') * 0.9, { x: armX, y: a.y }, { x: armX, y: b.y });
    }
    // Loop 2 — the interoceptive alarm, now above everything else, arcs
    // gently across the top back down to the override.
    {
      const a = pos('interoception'), b = pos('corticalDrive');
      const midY = Math.max(4, Math.min(a.y, b.y) - h * 0.03);
      const cp1: Pt = { x: a.x - (a.x - b.x) * 0.3, y: midY };
      const cp2: Pt = { x: a.x - (a.x - b.x) * 0.7, y: midY };
      edge('interoception', 'corticalDrive', val('interoception') * 0.9, cp1, cp2);
    }

    // ── Wave bursts — a one-shot marker tracing the whole path when exertion
    // outstrips the O2 supply ceiling ──────────────────────────────────────
    for (const wv of this.waves) {
      const prog = Math.min(1, (this.t - wv.startT) / WAVE_DURATION);
      const segF = prog * (WAVE_PATH.length - 1);
      const segI = Math.min(WAVE_PATH.length - 2, Math.floor(segF));
      const segT = segF - segI;
      const a = pos(WAVE_PATH[segI]), b = pos(WAVE_PATH[segI + 1]);
      if (!a || !b) continue;
      const px = a.x + (b.x - a.x) * segT, py = a.y + (b.y - a.y) * segT;
      const alpha = 1 - Math.abs(prog - 0.5) * 0.6;
      ctx.beginPath(); ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${WAVE_COLOR.join(',')},${alpha.toFixed(2)})`;
      ctx.shadowColor = `rgb(${WAVE_COLOR.join(',')})`; ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    if (this.deficit > 0.02) {
      const a = pos('hypoxia'), b = pos('cdr');
      const frac = (this.t * 0.03) % 1;
      const px = a.x + (b.x - a.x) * frac, py = a.y + (b.y - a.y) * frac;
      ctx.beginPath(); ctx.arc(px, py, 2 + this.deficit * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230,120,60,${Math.min(0.9, this.deficit * 2).toFixed(2)})`;
      ctx.fill();
    }

    // ── Input arrows ─────────────────────────────────────────────────────────
    const drawInputArrow = (toId: string, label: string, value: number, fromDx: number, fromDy: number) => {
      const to = pos(toId);
      if (!to) return;
      const from = { x: to.x + fromDx, y: to.y + fromDy };
      const dx = to.x - from.x, dy = to.y - from.y;
      const dist = Math.hypot(dx, dy) || 1;
      const endX = to.x - (dx / dist) * 16, endY = to.y - (dy / dist) * 16;
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
    drawInputArrow('corticalDrive', 'Pressure', this.p.pressure, w * 0.12, -8);
    drawInputArrow('hypoxia', 'Exertion', this.p.exertion, -w * 0.12, 6);

    // ── Anatomical nodes ─────────────────────────────────────────────────────
    const nodeColor = (act: number, target: [number, number, number]): [number, number, number] => [
      Math.round(BASE_RGB[0] + (target[0] - BASE_RGB[0]) * act),
      Math.round(BASE_RGB[1] + (target[1] - BASE_RGB[1]) * act),
      Math.round(BASE_RGB[2] + (target[2] - BASE_RGB[2]) * act),
    ];

    const drawShape = (shape: Shape, x: number, y: number, r: number, act: number, pulse: number, target: [number, number, number]) => {
      const [cr, cg, cb] = nodeColor(act, target);
      const glow = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.05, x, y, r * pulse);
      glow.addColorStop(0, `rgb(${Math.min(255, cr + 60)},${Math.min(255, cg + 60)},${Math.min(255, cb + 60)})`);
      glow.addColorStop(1, `rgb(${cr},${cg},${cb})`);
      ctx.fillStyle = glow;
      ctx.strokeStyle = `rgba(${target.join(',')},0.65)`;
      ctx.lineWidth = 1.2;

      switch (shape) {
        case 'brain':
          ctx.beginPath(); ctx.ellipse(x, y, r * pulse, r * pulse * 0.8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x, y - r * 0.7); ctx.lineTo(x, y + r * 0.7);
          ctx.strokeStyle = 'rgba(6,15,22,0.4)'; ctx.lineWidth = 1; ctx.stroke();
          break;
        case 'stem':
          ctx.beginPath();
          ctx.ellipse(x, y, r * pulse * 0.4, r * pulse * 1.05, 0, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
          break;
        case 'lungs':
          ctx.beginPath(); ctx.ellipse(x - r * 0.55, y, r * 0.55 * pulse, r * 0.8 * pulse, -0.15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.ellipse(x + r * 0.55, y, r * 0.55 * pulse, r * 0.8 * pulse, 0.15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          break;
        case 'blood':
          ctx.beginPath(); ctx.arc(x, y, r * pulse, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x - r * 0.6, y);
          ctx.lineTo(x - r * 0.25, y); ctx.lineTo(x - r * 0.1, y - r * 0.5);
          ctx.lineTo(x + r * 0.1, y + r * 0.5); ctx.lineTo(x + r * 0.25, y);
          ctx.lineTo(x + r * 0.6, y);
          ctx.strokeStyle = 'rgba(6,15,22,0.45)'; ctx.lineWidth = 1; ctx.stroke();
          break;
        case 'hub':
          if (act > 0.15) {
            ctx.beginPath(); ctx.arc(x, y, r * pulse * 1.6, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${CAPTURED_COLOR.join(',')},${(act * 0.3).toFixed(2)})`;
            ctx.lineWidth = 1.5; ctx.stroke();
          }
          ctx.beginPath(); ctx.arc(x, y, r * pulse, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          break;
        case 'radar':
          if (act > 0.1) {
            for (const mul of [1.5, 2.1]) {
              ctx.beginPath(); ctx.arc(x, y, r * pulse * mul, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(${WAVE_COLOR.join(',')},${(act * (0.28 / mul)).toFixed(2)})`;
              ctx.lineWidth = 1; ctx.stroke();
            }
          }
          ctx.beginPath(); ctx.arc(x, y, r * pulse, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          break;
        case 'heart':
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
        case 'gut':
          ctx.beginPath(); ctx.ellipse(x, y, r * pulse, r * pulse * 0.85, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = 'rgba(6,15,22,0.4)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(x - r * 0.2, y, r * 0.45, 0.6, Math.PI * 1.4); ctx.stroke();
          ctx.beginPath(); ctx.arc(x + r * 0.2, y, r * 0.4, Math.PI * 1.6, Math.PI * 0.4); ctx.stroke();
          break;
        case 'moon':
          ctx.beginPath(); ctx.arc(x, y, r * pulse, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.arc(x + r * 0.42, y - r * 0.1, r * 0.85 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = '#060f16'; ctx.fill();
          break;
        case 'cloud':
          ctx.beginPath();
          ctx.arc(x - r * 0.4, y + r * 0.15, r * 0.55 * pulse, 0, Math.PI * 2);
          ctx.arc(x + r * 0.05, y - r * 0.15, r * 0.65 * pulse, 0, Math.PI * 2);
          ctx.arc(x + r * 0.5, y + r * 0.1, r * 0.5 * pulse, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
          break;
        case 'spark':
          ctx.beginPath(); ctx.arc(x, y, r * pulse * 0.55, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = `rgba(${target.join(',')},0.75)`; ctx.lineWidth = 1.4;
          for (let i = 0; i < 6; i++) {
            const a2 = (i / 6) * Math.PI * 2;
            const r1 = r * pulse * 0.75, r2 = r * pulse * 1.15;
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(a2) * r1, y + Math.sin(a2) * r1);
            ctx.lineTo(x + Math.cos(a2) * r2, y + Math.sin(a2) * r2);
            ctx.stroke();
          }
          break;
      }
    };

    const drawNode = (id: string, label: string, shape: Shape, r: number, labelSide: 'left' | 'right', colorTarget: [number, number, number]) => {
      const p = pos(id);
      const node = graph.nodes.get(id);
      if (!p || !node) return;
      const act = node.value;
      const pulse = 1 + Math.sin(this.t * 0.07 + p.x * 0.05) * (this.captured ? 0.09 : 0.03);
      drawShape(shape, p.x, p.y, r, act, pulse, colorTarget);

      if (id === this.selectedNodeId) {
        ctx.beginPath(); ctx.arc(p.x, p.y, r * pulse + 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.3; ctx.stroke();
      }

      ctx.fillStyle = 'rgba(220,230,235,0.85)'; ctx.font = '9px Inter,sans-serif';
      ctx.textAlign = labelSide === 'left' ? 'right' : 'left';
      ctx.fillText(label, labelSide === 'left' ? p.x - r - 8 : p.x + r + 8, p.y + 3);
      ctx.textAlign = 'start';
    };

    for (const n of SPINE) drawNode(n.id, n.label, n.shape, n.id === 'cdr' ? 15 : 12, 'right', stateColor);
    for (const n of HEALTHY_BRANCH) drawNode(n.id, n.label, n.shape, 11, 'right', ENERGY_COLOR);
    for (const n of DOWNSTREAM) drawNode(n.id, n.label, n.shape, 11, 'right', stateColor);
    drawNode(INTEROCEPTION.id, INTEROCEPTION.label, INTEROCEPTION.shape, 10, 'right', stateColor);

    // ── Brainstem breathing waveform ─────────────────────────────────────────
    {
      const bs = pos('brainstem');
      const spineX = pos('corticalDrive')?.x ?? w * 0.5;
      if (bs) {
        const bx = bs.x + 22;
        const bw = Math.max(60, spineX - bx - 30);
        const by = pos('healthyBreathing')?.y ?? bs.y + 60;
        const midY = (bs.y + by) / 2;
        const bh = 22;
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
        ctx.strokeRect(bx, midY - bh / 2, bw, bh);
        const corticalLevel = val('corticalDrive');
        const waveColor = [
          Math.round(REGULATED_COLOR[0] + (240 - REGULATED_COLOR[0]) * corticalLevel),
          Math.round(REGULATED_COLOR[1] + (150 - REGULATED_COLOR[1]) * corticalLevel),
          Math.round(REGULATED_COLOR[2] + (60  - REGULATED_COLOR[2]) * corticalLevel),
        ];
        ctx.beginPath();
        this.breathBuffer.forEach((s, i) => {
          const x = bx + (i / (this.breathBuffer.length - 1)) * bw;
          const y = midY - s * (bh / 2 - 2);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = `rgba(${waveColor.join(',')},0.85)`; ctx.lineWidth = 1.4; ctx.stroke();

        ctx.font = '8px Inter,sans-serif'; ctx.fillStyle = 'rgba(150,165,175,0.55)';
        ctx.fillText(corticalLevel < 0.35 ? 'Autonomic rhythm' : corticalLevel < 0.65 ? 'Rhythm destabilizing' : 'Cortical override dominant', bx, midY - bh / 2 - 4);
      }
    }

    // ── Energy / PEM-debt bar chart ─────────────────────────────────────────
    {
      const energy = Math.max(0, 1 - val('cdr') * 0.6 - this.pemDebt * 0.6);
      const bx = w - 92, by = 34, barW = 16, barH = 64;
      const bars: Array<[string, number, [number, number, number]]> = [
        ['Energy', energy, ENERGY_COLOR],
        ['PEM debt', Math.min(1, this.pemDebt), WAVE_COLOR],
      ];
      bars.forEach(([label, v, color], i) => {
        const x = bx + i * (barW + 22);
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
        ctx.strokeRect(x, by, barW, barH);
        const fillH = barH * Math.max(0, Math.min(1, v));
        ctx.fillStyle = `rgba(${color.join(',')},0.75)`;
        ctx.fillRect(x, by + barH - fillH, barW, fillH);
        ctx.font = '8px Inter,sans-serif'; ctx.fillStyle = 'rgba(170,185,195,0.6)';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + barW / 2, by + barH + 12);
        ctx.fillText((v * 100).toFixed(0) + '%', x + barW / 2, by - 4);
        ctx.textAlign = 'start';
      });
    }

    // ── History sparkline ────────────────────────────────────────────────────
    {
      const sx = 14, sw = w - 28, sy = h - 30, sh = 16;
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
      ctx.strokeRect(sx, sy, sw, sh);
      if (this.history.length > 1) {
        this.history.forEach((s, i) => {
          if (!s.captured) return;
          const x = sx + (i / (HISTORY_LEN - 1)) * sw;
          ctx.fillStyle = `rgba(${CAPTURED_COLOR.join(',')},0.18)`;
          ctx.fillRect(x, sy, sw / HISTORY_LEN + 1, sh);
        });
        const line = (key: 'pressure' | 'cdr' | 'energy', color: string, width: number) => {
          ctx.beginPath();
          this.history.forEach((s, i) => {
            const x = sx + (i / (HISTORY_LEN - 1)) * sw;
            const y = sy + sh - s[key] * sh;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          });
          ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
        };
        line('pressure', 'rgba(160,170,180,0.5)', 1);
        line('energy', `rgba(${ENERGY_COLOR.join(',')},0.8)`, 1.2);
        line('cdr', `rgba(${stateColor.join(',')},0.95)`, 1.6);
      }
      ctx.font = '8px Inter,sans-serif'; ctx.fillStyle = 'rgba(150,165,175,0.5)';
      ctx.fillText('Pressure (grey) · Energy (green) · CDR (bright) over time', sx, sy - 4);
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

    // ── Node explainer popup (drawn last, on top of everything) ────────────
    if (this.selectedNodeId) {
      const info = NODE_EXPLAINERS[this.selectedNodeId];
      const anchor = pos(this.selectedNodeId);
      if (info && anchor) {
        const boxW = 208;
        ctx.font = '10px Inter,sans-serif';
        const lines = this.wrapText(ctx, info.body, boxW - 20);
        const boxH = 30 + lines.length * 13 + 12;
        let bx = anchor.x + 22, by = anchor.y - boxH / 2;
        bx = Math.min(Math.max(8, bx), w - boxW - 8);
        by = Math.min(Math.max(8, by), h - boxH - 8);

        ctx.fillStyle = 'rgba(9,18,26,0.96)';
        ctx.strokeStyle = `rgba(${stateColor.join(',')},0.55)`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.rect(bx, by, boxW, boxH); ctx.fill(); ctx.stroke();

        ctx.fillStyle = 'rgba(230,238,242,0.95)'; ctx.font = 'bold 11px Inter,sans-serif';
        ctx.fillText(info.title, bx + 10, by + 18);
        ctx.fillStyle = 'rgba(190,205,215,0.85)'; ctx.font = '10px Inter,sans-serif';
        lines.forEach((ln, i) => ctx.fillText(ln, bx + 10, by + 34 + i * 13));
        ctx.fillStyle = 'rgba(140,155,165,0.5)'; ctx.font = '8px Inter,sans-serif';
        ctx.fillText('click node to close', bx + 10, by + boxH - 6);
      }
    }
  }

  resize(w: number, h: number): void {
    this.w = w; this.h = h;
    this.layout();
  }

  setParam(key: string, value: number): void {
    this.p[key] = value;
  }

  onClick(x: number, y: number): void {
    const ids = [
      ...SPINE.map(n => n.id),
      ...HEALTHY_BRANCH.map(n => n.id),
      ...DOWNSTREAM.map(n => n.id),
      INTEROCEPTION.id,
    ];
    let hit: string | null = null;
    let bestDist = 18;
    for (const id of ids) {
      const p = this.positions[id];
      if (!p) continue;
      const d = Math.hypot(x - p.x, y - p.y);
      if (d < bestDist) { bestDist = d; hit = id; }
    }
    this.selectedNodeId = hit && hit === this.selectedNodeId ? null : hit;
  }

  stats(): Record<string, string | number> {
    const cdr = this.loop.getNodeValue('cdr');
    const energy = Math.max(0, 1 - cdr * 0.6 - this.pemDebt * 0.6);
    return {
      State: this.captured ? 'Captured' : 'Regulated',
      Energy: (energy * 100).toFixed(0) + '%',
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
