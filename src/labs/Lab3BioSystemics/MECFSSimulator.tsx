// ME/CFS Population Outbreak Simulator — React component.
// Canvas rendering + tabbed control panel, ported from systemic_writer-site.

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Person, STATUS, STATUS_LABEL, STATUS_RGB,
  OUTBREAK_PRESETS, type SimEnv, type OutbreakPreset,
} from './mecfs-engine';

const COLS = 10, ROWS = 10;

// ── Brainstem diagram (canvas) ─────────────────────────────────────────────────
function drawBrainstemDiagram(canvas: HTMLCanvasElement, symptoms: NonNullable<Person['symptoms']>) {
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const node = (x: number, y: number, r: number, act: number, label: string, sub = '') => {
    const col = act > 0.3
      ? `rgba(${Math.round(180+act*60)},${Math.round(40-act*20)},40,0.9)`
      : act < -0.3 ? `rgba(40,80,${Math.round(160+(-act)*80)},0.9)` : 'rgba(40,120,140,0.85)';
    const grd = ctx.createRadialGradient(x-r*0.3, y-r*0.3, r*0.05, x, y, r);
    grd.addColorStop(0, col); grd.addColorStop(1, col);
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.lineWidth=1; ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.font=`bold ${Math.round(r*0.55)}px Inter,sans-serif`;
    ctx.fillText(label, x, sub ? y-3 : y);
    if (sub) { ctx.font=`${Math.round(r*0.42)}px Inter,sans-serif`; ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.fillText(sub,x,y+9); }
    ctx.textBaseline='alphabetic';
  };
  const conn = (x1:number,y1:number,x2:number,y2:number,disrupted=false,a=0.4) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
    ctx.strokeStyle=`rgba(140,180,190,${a})`; ctx.lineWidth=disrupted?1:1.5;
    ctx.setLineDash(disrupted?[3,4]:[]);  ctx.stroke(); ctx.setLineDash([]);
  };
  const s = symptoms;
  const dvcAct=s.brainstem*0.9, hpaAct=-s.hpa*0.8, lcAct=s.autonomic*0.5, ntsAct=s.brainstem*0.6, vagalAct=s.vagal*0.7;
  const cx=W/2, hypoY=28, brainstemY=82, midY=120, lowY=158, bodyY=192;
  conn(cx,hypoY+14,cx,brainstemY-14,s.hpa>0.4,0.35);
  conn(cx-28,brainstemY+12,cx-35,midY-10,s.brainstem>0.4,0.4);
  conn(cx+5,brainstemY+12,cx+5,midY-10,s.brainstem>0.3,0.4);
  conn(cx+35,brainstemY+12,cx+40,midY-10,s.autonomic>0.3,0.4);
  conn(cx-35,midY+10,cx-35,lowY-10,s.vagal>0.4,0.4);
  conn(cx-35,lowY+12,cx-15,bodyY-4,s.vagal>0.5,0.35);
  conn(cx+40,midY+10,cx+40,lowY-10,s.autonomic>0.4,0.35);
  node(cx,hypoY,22,hpaAct,'HPA','cortisol');
  node(cx,brainstemY,22,(dvcAct+lcAct)/2*0.5,'BStem','core');
  node(cx-35,midY,16,ntsAct,'NTS'); node(cx+5,midY,16,dvcAct,'DVC'); node(cx+40,midY,16,lcAct,'LC');
  node(cx-35,lowY,14,vagalAct,'Vagus');
  ctx.beginPath(); ctx.arc(cx-15,bodyY,10,0,Math.PI*2); ctx.fillStyle='rgba(30,50,60,0.7)'; ctx.fill();
  ctx.fillStyle='rgba(120,160,170,0.6)'; ctx.font='9px Inter,sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('Body',cx-15,bodyY); ctx.textBaseline='alphabetic';
  [['Hyperactive','rgba(220,60,60,0.8)'],['Normal','rgba(40,120,140,0.8)'],['Blunted','rgba(60,100,200,0.8)']].forEach(([lbl,col],i)=>{
    ctx.fillStyle=col as string; ctx.fillRect(4,H-14-i*14,8,8);
    ctx.fillStyle='rgba(180,200,210,0.7)'; ctx.font='9px Inter,sans-serif';
    ctx.textAlign='left'; ctx.textBaseline='alphabetic'; ctx.fillText(lbl as string,16,H-7-i*14);
  });
  ctx.textAlign='start';
}

// Grid layout helper — reserves 50px at top for the Day/Phase/Outbreak labels.
// Used in draw, spread, and mouse hit-testing so all are consistent.
const TOP_PAD = 50;
function gridLayout(W: number, H: number) {
  const gridH = H - TOP_PAD;
  const cs = Math.min(W, gridH) / Math.max(COLS, ROWS);
  const ox = (W - COLS * cs) / 2;
  const oy = TOP_PAD + (gridH - ROWS * cs) / 2;
  return { cs, ox, oy };
}

// ── Main component ─────────────────────────────────────────────────────────────
interface MECFSSimProps {
  outbreak?: OutbreakPreset;
  onStatsUpdate?: (stats: Record<string, number>) => void;
  onSelectionChange?: (p: Person | null) => void;
}

export function MECFSSimulator({
  outbreak: outbreakProp,
  onStatsUpdate,
  onSelectionChange,
}: MECFSSimProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const bsCanvasRef  = useRef<HTMLCanvasElement>(null);
  const simRef       = useRef<{
    population: Person[]; day: number; running: boolean; speed: number;
    env: SimEnv; selected: number|null; flashes: Array<{x1:number;y1:number;x2:number;y2:number;t:number}>;
    frameId: number; lastMs: number; accumMs: number;
  } | null>(null);

  const [day,       setDay]       = useState(0);
  const [running,   setRunning]   = useState(false);
  const [speed,     setSpeed]     = useState(3);
  const [timeLimit, setTimeLimit] = useState(2920);
  const [stats,     setStats]     = useState<Record<string, number>>({});
  const [selected,  setSelected]  = useState<Person | null>(null);
  const [activeGroup,  setActiveGroup]  = useState<'status'|'settings'|'about'>('status');
  const [activeTab,    setActiveTab]    = useState('stats');
  const [outbreak, setOutbreak] = useState(outbreakProp ?? OUTBREAK_PRESETS[0]);

  // Sync outbreak from parent when it changes
  useEffect(() => {
    if (outbreakProp) setOutbreak(outbreakProp);
  }, [outbreakProp]);

  // ── Init sim state ────────────────────────────────────────────────────
  const initSim = useCallback((env: SimEnv) => {
    const population: Person[] = [];
    const vpRow = 4, vpCol = 4;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const id = r * COLS + c;
        population.push(new Person(id, r, c, r === vpRow && c === vpCol));
      }
    }
    const candidates = population.filter(p => !p.isViewpoint);
    const pz = candidates[Math.floor(Math.random() * candidates.length)];
    pz.status = STATUS.INFECTIOUS; pz.infectDay = 0;
    pz.acuteEndDay = 12 + Math.floor(Math.random() * 6);
    pz.illnessSeverity = 0.5 + Math.random() * 0.5;
    pz.cfsRisk = pz.computeCFSRisk(pz.illnessSeverity, env);
    pz._transitionColor();
    return population;
  }, []);

  // ── Canvas drawing ────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const s = simRef.current;
    const canvas = canvasRef.current;
    if (!s || !canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#060f16'; ctx.fillRect(0,0,W,H);

    const { cs, ox, oy } = gridLayout(W, H);
    const personPos = (p: Person) => ({
      x: ox + p.col * cs + cs / 2,
      y: oy + p.row * cs + cs / 2,
      r: cs * 0.36,
    });

    // Flashes
    for (const f of s.flashes) {
      const a = f.t / 18;
      ctx.beginPath(); ctx.moveTo(f.x1,f.y1); ctx.lineTo(f.x2,f.y2);
      ctx.strokeStyle = `rgba(220,100,30,${a*0.95})`; ctx.lineWidth = 2.2; ctx.stroke();
    }

    const t = performance.now() / 1000;
    for (const p of s.population) {
      const pos = personPos(p);
      const { x, y, r } = pos;
      const pulse = p.isContagious ? 1 + Math.sin(t * 4 + p.pulseOffset) * 0.12
                  : p.status === STATUS.EXPOSED ? 1 + Math.sin(t * 2.5 + p.pulseOffset) * 0.07 : 1;
      const dr = r * pulse;

      if (p.isViewpoint) {
        ctx.beginPath(); ctx.arc(x,y,dr+6,0,Math.PI*2);
        ctx.strokeStyle='rgba(255,220,80,0.7)'; ctx.lineWidth=2; ctx.stroke();
      }
      if (p.id === s.selected) {
        ctx.beginPath(); ctx.arc(x,y,dr+4,0,Math.PI*2);
        ctx.strokeStyle='rgba(100,200,255,0.9)'; ctx.lineWidth=2.5; ctx.stroke();
      }
      if (p.hovered || p.id === s.selected) {
        ctx.beginPath(); ctx.arc(x,y,dr+8,0,Math.PI*2);
        const [r2,g2,b2] = p.lerpedColor();
        const grd = ctx.createRadialGradient(x,y,dr,x,y,dr+8);
        grd.addColorStop(0,`rgba(${r2},${g2},${b2},0.3)`); grd.addColorStop(1,'transparent');
        ctx.fillStyle=grd; ctx.fill();
      }
      const [rc,gc,bc] = p.lerpedColor();
      const grd = ctx.createRadialGradient(x-dr*0.3,y-dr*0.3,dr*0.05,x,y,dr);
      grd.addColorStop(0,`rgb(${Math.min(255,rc+55)},${Math.min(255,gc+55)},${Math.min(255,bc+55)})`);
      grd.addColorStop(1,`rgb(${rc},${gc},${bc})`);
      ctx.beginPath(); ctx.arc(x,y,dr,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill();
      if (p.hasCFS) {
        const m = dr * 0.45; ctx.strokeStyle='rgba(255,180,180,0.55)'; ctx.lineWidth=1.2;
        ctx.beginPath(); ctx.moveTo(x-m,y); ctx.lineTo(x+m,y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x,y-m); ctx.lineTo(x,y+m); ctx.stroke();
      }
      if (p.isViewpoint) {
        ctx.fillStyle='rgba(255,220,80,0.9)'; ctx.font=`bold ${Math.round(r*0.55)}px Inter,sans-serif`;
        ctx.textAlign='center'; ctx.fillText('YOU',x,y+r+12); ctx.textAlign='start';
      }
      if (p.hovered && !p.isViewpoint) {
        ctx.fillStyle='rgba(200,225,235,0.85)'; ctx.font=`${Math.round(r*0.5)}px Inter,sans-serif`;
        ctx.textAlign='center'; ctx.fillText(p.name,x,y-r-5); ctx.textAlign='start';
      }
    }

    const fs = Math.round(W * 0.028);
    ctx.fillStyle='rgba(180,210,220,0.55)'; ctx.font=`bold ${fs}px Inter,sans-serif`; ctx.textAlign='left';
    const yearStr = s.day >= 365 ? `  ·  Yr ${(s.day/365).toFixed(1)}` : '';
    ctx.fillText(`Day ${s.day}${yearStr}`, 12, 22);
    const phase = s.day===0?'Pre-outbreak':s.day<30?'Acute spread':s.day<90?'Resolving':s.day<180?'Post-viral window':'Chronic phase';
    ctx.fillStyle='rgba(140,185,200,0.45)'; ctx.font=`${Math.round(W*0.02)}px Inter,sans-serif`; ctx.fillText(phase,12,38);
    const simState = s.day===0&&!s.running?'Waiting to start':s.running?'Running':'Paused';
    const stateColor = s.running?'rgba(80,210,130,0.85)':s.day===0?'rgba(160,185,200,0.55)':'rgba(220,170,60,0.85)';
    ctx.textAlign='right';
    ctx.fillStyle='rgba(180,210,220,0.70)'; ctx.font=`bold ${fs}px Inter,sans-serif`;
    ctx.fillText(s.env.outbreakLabel||'—', W-12, 22);
    ctx.fillStyle=stateColor; ctx.font=`${Math.round(W*0.02)}px Inter,sans-serif`;
    ctx.fillText(simState, W-12, 38); ctx.textAlign='start';
  }, []);

  // ── Step simulation ────────────────────────────────────────────────────
  const stepDay = useCallback(() => {
    const s = simRef.current;
    if (!s) return;
    s.day++;
    // Spread
    const mode = s.env.transmission || 'respiratory';
    if (mode === 'environmental') {
      if (s.day <= 3) {
        const pE = Math.min(0.95, 0.55 + s.env.pollution * 0.25);
        for (const p of s.population) if (p.status === STATUS.HEALTHY && Math.random() < pE) p.expose(s.day);
      }
    } else {
      if (mode === 'mixed' && s.day <= 2)
        for (const p of s.population) if (p.status === STATUS.HEALTHY && Math.random() < 0.45) p.expose(s.day);
      const contagious = s.population.filter(p => p.isContagious);
      if (contagious.length) {
        const pPerContact = (s.env.r0 || 3) / (8 * 11);
        const socialF = (s.env.socialContactLevel ?? 0.6) / 0.6;
        const sanitF  = (1 - (s.env.sanitationLevel ?? 0.5) * 0.8) / 0.6;
        for (const inf of contagious) {
          for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
            if (!dr && !dc) continue;
            const nr = inf.row+dr, nc = inf.col+dc;
            if (nr<0||nr>=ROWS||nc<0||nc>=COLS) continue;
            const nb = s.population[nr*COLS+nc];
            if (nb.status !== STATUS.HEALTHY) continue;
            const pT = pPerContact * (1.5 - nb.immuneFunction*0.6) * (1+s.env.pollution*0.1) * socialF * sanitF;
            if (Math.random() < pT && nb.expose(s.day)) {
              const { cs, ox, oy } = gridLayout(canvasRef.current!.width, canvasRef.current!.height);
              const ax = ox+inf.col*cs+cs/2, ay = oy+inf.row*cs+cs/2;
              const bx = ox+nb.col*cs+cs/2,  by = oy+nb.row*cs+cs/2;
              s.flashes.push({x1:ax,y1:ay,x2:bx,y2:by,t:18});
            }
          }
        }
      }
    }
    s.flashes = s.flashes.filter(f => f.t-- > 0);
    for (const p of s.population) p.update(s.day, s.env);
    updateStats();
  }, []);

  const onStatsRef = useRef(onStatsUpdate);
  onStatsRef.current = onStatsUpdate;
  const onSelectRef = useRef(onSelectionChange);
  onSelectRef.current = onSelectionChange;

  const updateStats = useCallback(() => {
    const s = simRef.current;
    if (!s) return;
    const count = (st: string) => s.population.filter(p => p.status === st).length;
    const cfsTotal = count(STATUS.CFS) + count(STATUS.SEVERE_CFS);
    const resolved = s.population.filter(p => p.status !== STATUS.HEALTHY && !p.isInfected).length;
    const next = {
      day: s.day,
      healthy: count(STATUS.HEALTHY),
      active: s.population.filter(p => p.isInfected).length,
      recovered: count(STATUS.RECOVERED),
      long_covid: count(STATUS.LONG_COVID),
      cfs: cfsTotal,
      severe_cfs: count(STATUS.SEVERE_CFS),
      cfs_rate_num: resolved > 0 ? cfsTotal : -1,
      cfs_rate_den: resolved,
    };
    setStats(next);
    setDay(s.day);
    onStatsRef.current?.(next);
  }, []);

  // ── Animation loop ────────────────────────────────────────────────────
  const loop = useCallback((nowMs: number) => {
    const s = simRef.current;
    if (!s) return;
    const elapsed = nowMs - (s.lastMs ?? nowMs);
    s.lastMs = nowMs;
    s.accumMs = (s.accumMs ?? 0) + elapsed;
    const msPerDay = 1000 / s.speed;
    while (s.accumMs >= msPerDay && s.running) {
      if (s.day >= timeLimit) { s.running = false; setRunning(false); break; }
      stepDay(); s.accumMs -= msPerDay;
    }
    draw();
    s.frameId = requestAnimationFrame(loop);
  }, [draw, stepDay, timeLimit]);

  // ── Init on mount / outbreak change ────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current!;
    const resize = () => {
      const parent = canvas.parentElement!;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w > 0 && h > 0) {
        canvas.width  = w;
        canvas.height = h;
      }
    };
    resize();
    window.addEventListener('resize', resize);
    // ResizeObserver catches mobile layout shifts (e.g. container was display:none on mount)
    const ro = new ResizeObserver(() => resize());
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const env: SimEnv = {
      r0: outbreak.r0, pathogenSeverity: outbreak.pathogenSeverity,
      economicStress: 0.3, pollution: 0.3, healthcareAccess: 0.5,
      socialInfrastructure: 0.5, socialContactLevel: 0.6, sanitationLevel: 0.5,
      transmission: outbreak.transmission, outbreakId: outbreak.id, outbreakLabel: outbreak.label,
    };
    const population = initSim(env);
    simRef.current = { population, day: 0, running: false, speed, env,
      selected: null, flashes: [], frameId: 0, lastMs: 0, accumMs: 0 };
    setDay(0); setRunning(false);
    // Defer so simRef.current is committed before updateStats reads it
    setTimeout(() => updateStats(), 0);

    const id = requestAnimationFrame(loop);
    simRef.current.frameId = id;

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', resize);
      ro.disconnect();
      cancelAnimationFrame(simRef.current?.frameId ?? 0);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [outbreak]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const s = simRef.current; const canvas = canvasRef.current;
    if (!s || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top)  * (canvas.height / rect.height);
    const { cs, ox, oy } = gridLayout(canvas.width, canvas.height);
    for (const p of s.population) {
      const x = ox+p.col*cs+cs/2, y = oy+p.row*cs+cs/2, r = cs*0.36;
      p.hovered = Math.hypot(mx-x, my-y) < r;
    }
  }, []);

  const handleClick = useCallback((e: MouseEvent) => {
    const s = simRef.current; const canvas = canvasRef.current;
    if (!s || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top)  * (canvas.height / rect.height);
    const { cs, ox, oy } = gridLayout(canvas.width, canvas.height);
    let hit: Person | null = null;
    for (const p of s.population) {
      const x = ox+p.col*cs+cs/2, y = oy+p.row*cs+cs/2, r = cs*0.36;
      if (Math.hypot(mx-x, my-y) < r) { hit = p; break; }
    }
    s.selected = hit?.id ?? null;
    setSelected(hit);
    onSelectRef.current?.(hit);
    setActiveGroup('status'); setActiveTab('person');
  }, []);

  // Draw brainstem diagram when selected person changes
  useEffect(() => {
    if (selected?.symptoms && bsCanvasRef.current) {
      drawBrainstemDiagram(bsCanvasRef.current, selected.symptoms);
    }
  }, [selected]);

  const togglePlay = () => {
    const s = simRef.current;
    if (!s) return;
    s.running = !s.running;
    setRunning(s.running);
    if (s.running) { s.accumMs = 0; }
  };

  const reset = () => {
    const s = simRef.current;
    if (!s) return;
    const population = initSim(s.env);
    s.population = population; s.day = 0; s.running = false; s.selected = null; s.flashes = [];
    s.accumMs = 0;
    setRunning(false); setSelected(null); setDay(0); updateStats();
  };

  const handleSpeedChange = (v: number) => {
    setSpeed(v);
    if (simRef.current) simRef.current.speed = v;
  };

  const handleEnvChange = (key: keyof SimEnv, val: number) => {
    if (simRef.current) (simRef.current.env as any)[key] = val;
  };

  const statusColor = (s: string) => {
    const rgb = STATUS_RGB[s as keyof typeof STATUS_RGB];
    if (!rgb) return 'var(--muted)';
    const [r,g,b] = rgb;
    return `rgb(${Math.min(255,r+80)},${Math.min(255,g+80)},${Math.min(255,b+80)})`;
  };

  // ── Tab content ────────────────────────────────────────────────────────
  const groups: Array<{ id: 'status'|'settings'|'about'; label: string }> = [
    { id:'status',   label:'Status' },
    { id:'settings', label:'Settings' },
    { id:'about',    label:'About' },
  ];

  const tabsByGroup: Record<string, Array<{id:string;label:string}>> = {
    status:   [{ id:'stats', label:'Population' }, { id:'person', label:'Person' }],
    settings: [{ id:'env',      label:'Environment' }, { id:'outbreak', label:'Outbreak' }],
    about:    [{ id:'about-sim', label:'The Sim' }, { id:'about-mecfs', label:'ME/CFS' }],
  };

  const defaultTabByGroup: Record<string, string> = {
    status:'stats', settings:'env', about:'about-sim',
  };

  const handleGroupChange = (g: 'status'|'settings'|'about') => {
    setActiveGroup(g);
    setActiveTab(defaultTabByGroup[g]);
  };

  const cfsRatePct = stats.cfs_rate_den > 0
    ? ((stats.cfs / stats.cfs_rate_den) * 100).toFixed(1) + '%'
    : '—';

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Canvas area */}
      <div style={{ flex:1, background:'#060f16', position:'relative', overflow:'hidden', minHeight:0 }}>
        <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', cursor:'crosshair', display:'block' }} />
      </div>

      {/* Toolbar */}
      <div className="sim-toolbar" style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', padding:'8px 14px', background:'var(--panel)', borderTop:'1px solid var(--line)', flexShrink:0 }}>
        <button className="tb-btn" onClick={togglePlay} style={{ background: running ? 'var(--accent)' : 'var(--panel-b)' }}>
          {running ? '⏸ Pause' : '▶ Play'}
        </button>
        <button className="tb-btn" onClick={reset}>↺ Reset</button>
        <div style={{ width:1, height:20, background:'var(--line)', margin:'0 2px', flexShrink:0 }} />
        <div style={{ display:'flex', alignItems:'center', gap:6, color:'var(--muted)', fontSize:'.8rem' }}>
          Speed
          <input type="range" min={1} max={20} step={1} value={speed}
            onChange={e => handleSpeedChange(+e.target.value)} style={{ width:70 }} />
          <span style={{ color:'var(--accent2)' }}>{speed} d/s</span>
        </div>
        <div style={{ width:1, height:20, background:'var(--line)', margin:'0 2px' }} />
        <div style={{ display:'flex', alignItems:'center', gap:6, color:'var(--muted)', fontSize:'.8rem' }}>
          Limit
          <select value={timeLimit} onChange={e => setTimeLimit(+e.target.value)}
            style={{ background:'var(--panel-b)', color:'var(--text)', border:'1px solid var(--line)', borderRadius:6, padding:'2px 6px', fontSize:'.8rem', cursor:'pointer' }}>
            {[[365,'1 yr'],[730,'2 yr'],[1460,'4 yr'],[2920,'8 yr'],[4380,'12 yr']].map(([v,l]) =>
              <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div style={{ width:1, height:20, background:'var(--line)', margin:'0 2px' }} />
        <span style={{ fontSize:'.76rem', color:'var(--muted)' }}>
          Click any person to inspect · Yellow ring = You
        </span>
      </div>

      <style>{`
        .tb-btn {
          padding:6px 14px; border-radius:8px; border:1px solid var(--line);
          background:var(--panel-b); color:var(--text); font-size:.82rem; font-weight:600;
          cursor:pointer; transition:all .15s;
        }
        .tb-btn:hover { background:var(--accent); color:#fff; border-color:var(--accent); }
      `}</style>
    </div>
  );
}

// ── Sidebar panel for the ME/CFS lab ────────────────────────────────────────────
export function MECFSSidebar({
  stats, selected, outbreak, onOutbreakChange, onEnvChange,
  activeGroup, activeTab, onGroupChange, onTabChange,
}: {
  stats: Record<string, number>;
  selected: Person | null;
  outbreak: OutbreakPreset;
  onOutbreakChange: (ob: OutbreakPreset) => void;
  onEnvChange: (key: string, val: number) => void;
  // Controlled tab state (driven by canvas click in parent)
  activeGroup?: 'status'|'settings'|'about';
  activeTab?: string;
  onGroupChange?: (g: 'status'|'settings'|'about', defaultTab: string) => void;
  onTabChange?: (tab: string) => void;
}) {
  const [groupLocal, setGroupLocal] = useState<'status'|'settings'|'about'>('status');
  const [tabLocal,   setTabLocal]   = useState('stats');
  const group = activeGroup ?? groupLocal;
  const tab   = activeTab   ?? tabLocal;
  const bsRef = useRef<HTMLCanvasElement>(null);

  const setGroup = (g: 'status'|'settings'|'about', dt: string) => {
    setGroupLocal(g); onGroupChange?.(g, dt);
  };
  const setTab = (t: string) => {
    setTabLocal(t); onTabChange?.(t);
  };

  const tabsByGroup: Record<string, Array<{id:string;label:string}>> = {
    status:   [{ id:'stats', label:'Population' }, { id:'person', label:'Person' }],
    settings: [{ id:'outbreak', label:'Outbreak' }, { id:'env', label:'Environment' }],
    about:    [{ id:'about-sim', label:'The Sim' }, { id:'about-mecfs', label:'ME/CFS' }],
  };
  const defaultTab: Record<string, string> = { status:'stats', settings:'outbreak', about:'about-sim' };

  useEffect(() => {
    if (selected?.symptoms && bsRef.current) drawBrainstemDiagram(bsRef.current, selected.symptoms);
  }, [selected]);

  const statusColor = (s: string) => {
    const rgb = STATUS_RGB[s as keyof typeof STATUS_RGB];
    if (!rgb) return 'var(--muted)';
    const [r,g,b] = rgb;
    return `rgb(${Math.min(255,r+80)},${Math.min(255,g+80)},${Math.min(255,b+80)})`;
  };

  const cfsRatePct = stats.cfs_rate_den > 0
    ? ((stats.cfs / stats.cfs_rate_den)*100).toFixed(1)+'%' : '—';

  const bar = (val: number, color='#3a8fa8') => (
    <div style={{ flex:1, height:5, background:'var(--line)', borderRadius:3, overflow:'hidden' }}>
      <div style={{ height:'100%', borderRadius:3, width:`${(val*100).toFixed(0)}%`, background:color, transition:'width .4s' }} />
    </div>
  );

  const ENV_CONTROLS = [
    { key:'r0',                  label:'Transmission R₀',    min:0.5, max:8,   step:0.1, default:3.0 },
    { key:'pathogenSeverity',    label:'Pathogen severity',   min:0,   max:1,   step:0.05 },
    { key:'socialContactLevel',  label:'Social contact level',min:0,   max:1,   step:0.05 },
    { key:'sanitationLevel',     label:'Sanitation level',    min:0,   max:1,   step:0.05 },
    { key:'economicStress',      label:'Economic stress',     min:0,   max:1,   step:0.05 },
    { key:'pollution',           label:'Pollution',           min:0,   max:1,   step:0.05 },
    { key:'healthcareAccess',    label:'Healthcare access',   min:0,   max:1,   step:0.05 },
    { key:'socialInfrastructure',label:'Social infrastructure',min:0,  max:1,   step:0.05 },
  ];

  const [envVals, setEnvVals] = useState<Record<string,number>>({
    r0:3.0, pathogenSeverity:0.5, socialContactLevel:0.6, sanitationLevel:0.5,
    economicStress:0.3, pollution:0.3, healthcareAccess:0.5, socialInfrastructure:0.5,
  });

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Group tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--line)', flexShrink:0, background:'var(--panel)' }}>
        {(['status','settings','about'] as const).map(g => (
          <button key={g} onClick={() => { setGroup(g, defaultTab[g]); setTab(defaultTab[g]); }}
            style={{ flex:1, padding:'8px 4px', fontSize:'.72rem', fontWeight:700, letterSpacing:'.05em',
              textTransform:'uppercase', cursor:'pointer', border:'none',
              borderBottom:`2px solid ${group===g?'var(--accent)':'transparent'}`,
              background: group===g ? 'rgba(58,143,168,0.06)' : 'transparent',
              color: group===g ? 'var(--accent)' : 'var(--muted)', transition:'all .15s' }}>
            {g}
          </button>
        ))}
      </div>

      {/* Sub-tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--line)', flexShrink:0, background:'var(--panel-b)', overflowX:'auto' }}>
        {tabsByGroup[group].map(t => (
          <div key={t.id} onClick={() => setTab(t.id)}
            style={{ flex:1, padding:'7px 6px', textAlign:'center', fontSize:'.7rem', fontWeight:600,
              cursor:'pointer', borderBottom:`2px solid ${tab===t.id?'var(--accent)':'transparent'}`,
              color: tab===t.id?'var(--accent)':'var(--muted)', transition:'all .15s',
              letterSpacing:'.03em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
            {t.label}
          </div>
        ))}
      </div>

      {/* Panel body */}
      <div style={{ flex:1, overflowY:'auto', padding:14, scrollbarWidth:'thin', scrollbarColor:'var(--line) transparent' }}>

        {/* ── Population stats ── */}
        {tab === 'stats' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
              {[
                { label:'Day',       val:stats.day ?? 0 },
                { label:'Healthy',   val:stats.healthy ?? 0 },
                { label:'Active',    val:stats.active ?? 0 },
                { label:'Recovered', val:stats.recovered ?? 0 },
                { label:'Post-Viral',val:stats.long_covid ?? 0 },
                { label:'ME/CFS',    val:stats.cfs ?? 0,       color:'#e05070' },
                { label:'CFS rate',  val:cfsRatePct,           color:'#e05070' },
                { label:'Severe CFS',val:stats.severe_cfs ?? 0,color:'#c03050' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ display:'flex', flexDirection:'column', background:'var(--panel-b)', border:'1px solid var(--line)', borderRadius:10, padding:'9px 12px' }}>
                  <span style={{ fontSize:'.68rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em' }}>{label}</span>
                  <span style={{ fontSize:'1.1rem', fontWeight:700, color: color ?? 'var(--accent2)', marginTop:2 }}>{val}</span>
                </div>
              ))}
            </div>
            {/* Legend */}
            <div style={{ fontSize:'.7rem', textTransform:'uppercase', letterSpacing:'.08em', color:'var(--muted)', marginBottom:5 }}>Status key</div>
            {Object.entries(STATUS_LABEL).map(([key, label]) => {
              const rgb = STATUS_RGB[key as keyof typeof STATUS_RGB];
              const [r,g,b] = rgb;
              return (
                <div key={key} style={{ display:'flex', alignItems:'center', gap:8, fontSize:'.8rem', color:'var(--muted)', marginBottom:4 }}>
                  <div style={{ width:11, height:11, borderRadius:'50%', flexShrink:0, background:`rgb(${r+30},${g+30},${b+30})` }} />
                  {key === 'long_covid' ? (outbreak.id === 'covid19' ? 'Long COVID' : 'Post-Viral Syndrome') : label}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Profile ── */}
        {tab === 'person' && (
          <div>
            {!selected ? (
              <p style={{ color:'var(--muted)', fontSize:'.86rem', lineHeight:1.5, margin:0 }}>
                Click any person in the simulation to see their risk profile.
              </p>
            ) : (
              <div>
                <div style={{ fontSize:'1.15rem', fontWeight:700, marginBottom:3, color: selected.isViewpoint ? '#ffd850' : 'var(--text)' }}>
                  {selected.name}
                </div>
                <div style={{ fontSize:'.86rem', fontWeight:600, marginBottom:9, color: statusColor(selected.status) }}>
                  {STATUS_LABEL[selected.status]}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7, marginBottom:12 }}>
                  {[
                    { label:'Age', val: selected.age },
                    { label:'Sex', val: selected.sex === 'F' ? 'Female' : 'Male' },
                    { label:'Prior EBV', val: selected.priorEBV ? 'Yes' : 'No' },
                    { label:'CFS risk', val: selected.cfsRisk > 0 ? (selected.cfsRisk*100).toFixed(0)+'%' : 'Pending',
                      color: selected.hasCFS ? '#e05070' : '#7aab8a' },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ background:'var(--panel-b)', border:'1px solid var(--line)', borderRadius:8, padding:'7px 10px' }}>
                      <span style={{ display:'block', fontSize:'.68rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:2 }}>{label}</span>
                      <span style={{ color: color ?? 'var(--text)' }}>{val}</span>
                    </div>
                  ))}
                </div>

                {/* Risk factors */}
                {[
                  { heading: 'Core', rows: [
                    ['Genetic susceptibility',   selected.susceptibility],
                    ['Chronic stress / trauma',  selected.baselineStress],
                    ['Pre-existing conditions',  selected.priorConditions,  '#9a5030'],
                    ['Immune function (low)',     1-selected.immuneFunction, '#c06030'],
                    ['Poor sleep quality',       1-selected.sleepQuality,   '#c06030'],
                  ]},
                  { heading: 'Neurological', rows: [
                    ['Neurodivergence',          selected.neurodivergence,           '#6a50a0'],
                    ['Emotional stress load',    selected.emotionalStressLoad,       '#8a5080'],
                    ['Brainstem load (structural)',selected.mechanicalBrainstemLoad, '#a04060'],
                  ]},
                ].map(sec => (
                  <div key={sec.heading}>
                    <div style={{ fontSize:'.7rem', textTransform:'uppercase', letterSpacing:'.08em', color:'var(--muted)', marginBottom:7, marginTop:10 }}>{sec.heading}</div>
                    {sec.rows.map(([lbl, val, col]) => (
                      <div key={lbl as string} style={{ display:'flex', alignItems:'center', gap:7, fontSize:'.76rem', color:'var(--muted)', marginBottom:5 }}>
                        <span style={{ flex:'0 0 130px', lineHeight:1.3 }}>{lbl as string}</span>
                        {bar(val as number, (col as string) ?? '#3a8fa8')}
                      </div>
                    ))}
                  </div>
                ))}

                {selected.autonomicAcute > 0 && (
                  <div>
                    <div style={{ fontSize:'.7rem', textTransform:'uppercase', letterSpacing:'.08em', color:'var(--muted)', marginBottom:7, marginTop:10 }}>Acute phase markers</div>
                    {[['Autonomic involvement', selected.autonomicAcute,'#c03060'],['Illness severity',selected.illnessSeverity,'#a04020']].map(([lbl,val,col])=>(
                      <div key={lbl as string} style={{ display:'flex', alignItems:'center', gap:7, fontSize:'.76rem', color:'var(--muted)', marginBottom:5 }}>
                        <span style={{ flex:'0 0 130px', lineHeight:1.3 }}>{lbl as string}</span>
                        {bar(val as number, col as string)}
                      </div>
                    ))}
                  </div>
                )}

                {selected.symptoms && (
                  <div style={{ marginTop:14 }}>
                    <div style={{ fontSize:'.7rem', textTransform:'uppercase', letterSpacing:'.08em', color:'var(--muted)', marginBottom:7 }}>Symptom profile</div>
                    {[
                      ['Fatigue / energy envelope', selected.symptoms.fatigue],
                      ['Post-exertional malaise',   selected.symptoms.pem,       '#d44'],
                      ['Cognitive / brain fog',     selected.symptoms.cognitive],
                      ['Autonomic dysregulation',   selected.symptoms.autonomic],
                      ['Pain',                      selected.symptoms.pain],
                      ['Sleep disruption',          selected.symptoms.sleep],
                    ].map(([lbl,val,col])=>(
                      <div key={lbl as string} style={{ display:'flex', alignItems:'center', gap:7, fontSize:'.76rem', color:'var(--muted)', marginBottom:5 }}>
                        <span style={{ flex:'0 0 130px', lineHeight:1.3 }}>{lbl as string}</span>
                        {bar(val as number, (col as string) ?? '#3a8fa8')}
                      </div>
                    ))}
                    <div style={{ fontSize:'.7rem', textTransform:'uppercase', letterSpacing:'.08em', color:'var(--muted)', marginTop:14, marginBottom:4 }}>Brainstem / ANS disruption</div>
                    <canvas ref={bsRef} width={240} height={200}
                      style={{ display:'block', borderRadius:8, border:'1px solid var(--line)', background:'#060f16', marginTop:4, width:'100%', height:'auto' }} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Outbreak selector ── */}
        {tab === 'outbreak' && (
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {OUTBREAK_PRESETS.map(ob => (
              <div key={ob.id} onClick={() => onOutbreakChange(ob)}
                style={{ padding:'10px 12px', borderRadius:12, cursor:'pointer', transition:'all .15s',
                  border: `1px solid ${outbreak.id === ob.id ? 'var(--accent)' : 'var(--line)'}`,
                  background: outbreak.id === ob.id ? 'rgba(58,143,168,0.10)' : 'var(--panel-b)' }}>
                <div style={{ fontSize:'.9rem', fontWeight:700, color:'var(--text)', marginBottom:3 }}>{ob.label}</div>
                <div style={{ display:'inline-block', fontSize:'.65rem', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase',
                  color:'#c0d8e0', padding:'2px 7px', borderRadius:999, marginBottom:5, opacity:.85, background:'#2a5a6a' }}>{ob.category}</div>
                <div style={{ fontSize:'.76rem', color:'var(--muted)', lineHeight:1.45 }}>{ob.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Environment controls ── */}
        {tab === 'env' && (
          <div>
            {ENV_CONTROLS.map(ctrl => (
              <div key={ctrl.key} style={{ marginBottom:10 }}>
                <label style={{ display:'flex', justifyContent:'space-between', fontSize:'.8rem', color:'var(--muted)', marginBottom:3 }}>
                  {ctrl.label}
                  <span style={{ color:'var(--accent2)', fontWeight:600 }}>{(envVals[ctrl.key] ?? ctrl.default ?? 0).toFixed(2)}</span>
                </label>
                <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step}
                  value={envVals[ctrl.key] ?? ctrl.default ?? 0}
                  onChange={e => {
                    const v = +e.target.value;
                    setEnvVals(ev => ({ ...ev, [ctrl.key]: v }));
                    onEnvChange(ctrl.key, v);
                  }}
                  style={{ width:'100%' }} />
              </div>
            ))}
          </div>
        )}

        {/* ── About tabs ── */}
        {tab === 'about-sim' && (
          <div style={{ fontSize:'.83rem', color:'var(--muted)', lineHeight:1.65 }}>
            <h3 style={{ color:'var(--text)', fontSize:'.92rem', margin:'0 0 8px' }}>About This Simulator</h3>
            <p>Models a viral outbreak through a 10×10 community grid, tracking post-viral ME/CFS development using epidemiological risk factors.</p>
            <p>Each person has ~25 individual risk factors drawn from published research. CFS probability is computed via an additive weighted risk score calibrated to known study benchmarks.</p>
            <h3 style={{ color:'var(--text)', fontSize:'.92rem', margin:'12px 0 6px' }}>Calibration targets</h3>
            <ul style={{ paddingLeft:16, margin:'0 0 9px' }}>
              <li>Influenza: ~2–3% CFS rate</li>
              <li>EBV/COVID moderate: ~11–12%</li>
              <li>SARS Hong Kong (4-year): ~24–27%</li>
            </ul>
            <p style={{ fontSize:'.73rem', opacity:.7 }}>
              Wessely et al. (1995) · Jason et al. · Carruthers et al. (2011) · Tomas &amp; Newton (2018) · Chicago mono study
            </p>
          </div>
        )}

        {tab === 'about-mecfs' && (
          <div style={{ fontSize:'.83rem', color:'var(--muted)', lineHeight:1.65 }}>
            <h3 style={{ color:'var(--text)', fontSize:'.92rem', margin:'0 0 8px' }}>ME/CFS Overview</h3>
            <p>Myalgic Encephalomyelitis / Chronic Fatigue Syndrome is a complex, multi-system neuroimmune disease often triggered by viral infections.</p>
            <p>Hallmark symptom: post-exertional malaise (PEM) — worsening of symptoms after minimal physical or cognitive exertion that would not cause problems in healthy people.</p>
            <h3 style={{ color:'var(--text)', fontSize:'.92rem', margin:'12px 0 6px' }}>Key mechanisms modelled</h3>
            <ul style={{ paddingLeft:16, margin:'0 0 9px' }}>
              <li>Brainstem / ANS dysregulation (Porges polyvagal theory)</li>
              <li>HPA axis blunting (cortisol hypo-response)</li>
              <li>Dorsal vagal shutdown (Naviaux cell danger response)</li>
              <li>Autonomic involvement during acute phase as primary predictor</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
