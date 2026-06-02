import type { Sim, SimParam } from './types';

interface Boid { x: number; y: number; vx: number; vy: number; }

class BoidsSimClass implements Sim {
  id    = 'boids';
  label = 'Emergence / Flocking';
  description = 'Each agent follows three simple local rules: avoid neighbours, align with nearby headings, and move toward nearby centres. No agent sees the global pattern — the flock emerges from purely local interactions. A model for how complex order arises without central control.';
  params: Record<string, SimParam> = {
    count:      { label: 'Agents',     min: 20,  max: 300, step: 10,   default: 120 },
    separation: { label: 'Separation', min: 0.1, max: 5,   step: 0.1,  default: 1.5 },
    alignment:  { label: 'Alignment',  min: 0,   max: 2,   step: 0.05, default: 0.9 },
    cohesion:   { label: 'Cohesion',   min: 0,   max: 2,   step: 0.05, default: 0.8 },
    speed:      { label: 'Speed',      min: 0.5, max: 4,   step: 0.1,  default: 2   },
  };

  private w = 0; private h = 0;
  private boids: Boid[] = [];
  private t = 0;
  private p: Record<string, number> = {};
  private _dispAvg = '0.00';
  private _dispSteps = 0;

  init(canvas: HTMLCanvasElement): void {
    this.w = canvas.width; this.h = canvas.height;
    this.p = Object.fromEntries(Object.entries(this.params).map(([k, v]) => [k, v.default]));
    this.spawn();
  }

  private spawn(): void {
    const n = Math.round(this.p.count);
    this.boids = Array.from({ length: n }, () => ({
      x: Math.random() * this.w, y: Math.random() * this.h,
      vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
    }));
    this.t = 0;
  }

  step(): void {
    const { separation, alignment, cohesion, speed } = this.p;
    const SEP_R = 28, VIS_R = 80;
    for (const b of this.boids) {
      let sx=0, sy=0, ax=0, ay=0, cx=0, cy=0, near=0, vis=0;
      for (const o of this.boids) {
        if (o === b) continue;
        const dx = o.x-b.x, dy = o.y-b.y, d2 = dx*dx+dy*dy;
        if (d2 < SEP_R*SEP_R) { const d = Math.sqrt(d2)||1; sx -= dx/d; sy -= dy/d; near++; }
        if (d2 < VIS_R*VIS_R) { ax += o.vx; ay += o.vy; cx += o.x; cy += o.y; vis++; }
      }
      if (near) { b.vx += sx/near*separation*0.1; b.vy += sy/near*separation*0.1; }
      if (vis)  { b.vx += (ax/vis-b.vx)*alignment*0.05; b.vy += (ay/vis-b.vy)*alignment*0.05;
                  b.vx += (cx/vis-b.x)*cohesion*0.001;  b.vy += (cy/vis-b.y)*cohesion*0.001; }
      const spd = Math.hypot(b.vx, b.vy) || 1;
      b.vx = b.vx/spd*speed; b.vy = b.vy/spd*speed;
      b.x = (b.x + b.vx + this.w) % this.w;
      b.y = (b.y + b.vy + this.h) % this.h;
    }
    this.t++;
    if (this.t % 100 === 0) {
      const speeds = this.boids.map(b => Math.hypot(b.vx, b.vy));
      this._dispAvg   = (speeds.reduce((a, b) => a + b, 0) / speeds.length).toFixed(2);
      this._dispSteps = this.t;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(4,14,20,0.35)';
    ctx.fillRect(0, 0, this.w, this.h);
    for (const b of this.boids) {
      const angle = Math.atan2(b.vy, b.vx);
      const spd   = Math.hypot(b.vx, b.vy);
      ctx.save();
      ctx.translate(b.x, b.y); ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(7,0); ctx.lineTo(-5,3); ctx.lineTo(-3,0); ctx.lineTo(-5,-3);
      ctx.closePath();
      ctx.fillStyle = `hsl(${160 + spd*30},70%,65%)`; ctx.fill();
      ctx.restore();
    }
  }

  resize(w: number, h: number): void { this.w = w; this.h = h; }

  setParam(k: string, v: number): void {
    this.p[k] = v;
    if (k === 'count') this.spawn();
  }

  stats(): Record<string, string | number> {
    if (!this.boids.length) return {};
    return { Agents: this.boids.length, 'Avg speed': this._dispAvg, Steps: this._dispSteps };
  }
}

export const BoidsSim: Sim = new BoidsSimClass();
