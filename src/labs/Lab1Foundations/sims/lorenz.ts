import type { Sim, SimParam } from './types';

class LorenzSimClass implements Sim {
  id    = 'lorenz';
  label = 'Lorenz Attractor';
  description = 'A hallmark of chaos theory. Three linked differential equations produce a trajectory that never repeats — yet stays bounded in a butterfly-shaped region of phase space. Tiny differences in starting position lead to completely different futures.';
  params: Record<string, SimParam> = {
    sigma: { label: 'σ (Prandtl)',  min: 1,   max: 28, step: 0.1, default: 10    },
    rho:   { label: 'ρ (Rayleigh)', min: 1,   max: 60, step: 0.1, default: 28    },
    beta:  { label: 'β (aspect)',   min: 0.1, max: 5,  step: 0.1, default: 2.667 },
    speed: { label: 'Speed',        min: 0.1, max: 5,  step: 0.1, default: 1     },
  };

  private w = 0; private h = 0;
  private x = 0.1;  private y = 0;  private z = 0;
  private x2 = 0.1001; private y2 = 0; private z2 = 0;
  private trail:  [number, number][] = [];
  private trail2: [number, number][] = [];
  private t = 0;
  private angle = 0;
  private p: Record<string, number> = {};

  // Throttled display values — only update every 100 steps
  private _dispDiv = '0.0px';
  private _dispSteps = 0;

  init(canvas: HTMLCanvasElement): void {
    this.w = canvas.width; this.h = canvas.height;
    this.p = Object.fromEntries(Object.entries(this.params).map(([k, v]) => [k, v.default]));
    this.reset();
  }

  private reset(): void {
    this.x=0.1; this.y=0; this.z=0;
    this.x2=0.1001; this.y2=0; this.z2=0;
    this.trail=[]; this.trail2=[]; this.t=0; this.angle=0;
    this._dispDiv = '—'; this._dispSteps = 0;
  }

  step(): void {
    const { sigma, rho, beta, speed } = this.p;
    const dt = 0.005 * speed;
    const steps = Math.ceil(speed * 2);
    for (let i = 0; i < steps; i++) {
      const dx  = sigma*(this.y  - this.x);
      const dy  = this.x *(rho - this.z)  - this.y;
      const dz  = this.x *this.y  - beta*this.z;
      this.x += dx*dt; this.y += dy*dt; this.z += dz*dt;
      const dx2 = sigma*(this.y2 - this.x2);
      const dy2 = this.x2*(rho - this.z2) - this.y2;
      const dz2 = this.x2*this.y2 - beta*this.z2;
      this.x2 += dx2*dt; this.y2 += dy2*dt; this.z2 += dz2*dt;
    }
    this.angle += 0.002;
    const pt = this.project(this.x,  this.y,  this.z);
    const pt2 = this.project(this.x2, this.y2, this.z2);
    this.trail.push(pt);   if (this.trail.length  > 1800) this.trail.shift();
    this.trail2.push(pt2); if (this.trail2.length > 1800) this.trail2.shift();
    this.t++;

    // Throttle slow-changing display values
    if (this.t % 100 === 0) {
      const d = Math.hypot(pt[0]-pt2[0], pt[1]-pt2[1]);
      this._dispDiv   = d.toFixed(1) + 'px';
      this._dispSteps = this.t;
    }
  }

  private project(x: number, y: number, z: number): [number, number] {
    const ca = Math.cos(this.angle), sa = Math.sin(this.angle);
    const rx = x*ca - z*sa;
    const scale = Math.min(this.w, this.h) / 80;
    return [this.w/2 + rx*scale, this.h/2 + (y - 25)*scale*-1];
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(4,14,20,0.18)'; ctx.fillRect(0, 0, this.w, this.h);
    const drawTrail = (trail: [number,number][], hue: number) => {
      for (let i = 1; i < trail.length; i++) {
        const a = i / trail.length;
        ctx.beginPath(); ctx.moveTo(trail[i-1][0], trail[i-1][1]); ctx.lineTo(trail[i][0], trail[i][1]);
        ctx.strokeStyle = `hsla(${hue},80%,65%,${a*0.9})`; ctx.lineWidth = a*1.4; ctx.stroke();
      }
    };
    drawTrail(this.trail, 190); drawTrail(this.trail2, 38);
    if (this.trail.length && this.trail2.length) {
      const p1 = this.trail[this.trail.length-1], p2 = this.trail2[this.trail2.length-1];
      ctx.beginPath(); ctx.arc(p1[0], p1[1], 3, 0, Math.PI*2); ctx.fillStyle='hsl(190,90%,75%)'; ctx.fill();
      ctx.beginPath(); ctx.arc(p2[0], p2[1], 3, 0, Math.PI*2); ctx.fillStyle='hsl(38,90%,70%)';  ctx.fill();
    }
  }

  resize(w: number, h: number): void { this.w = w; this.h = h; }
  setParam(k: string, v: number): void { this.p[k] = v; if (k !== 'speed') this.reset(); }

  stats(): Record<string, string | number> {
    return {
      'σ': this.p.sigma?.toFixed(1) ?? '10.0',
      'ρ': this.p.rho?.toFixed(1) ?? '28.0',
      Divergence: this._dispDiv,
      Steps: this._dispSteps,
    };
  }
}

export const LorenzSim: Sim = new LorenzSimClass();
