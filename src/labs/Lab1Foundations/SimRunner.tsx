// SimRunner — generic canvas sim runner.
// Mounts once per sim switch (key= in parent). Auto-starts on mount.
// Reset works whether paused or playing.

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Sim } from './sims/types';

interface Props { sim: Sim; }

export function SimRunner({ sim }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const ctxRef     = useRef<CanvasRenderingContext2D | null>(null);
  const rafRef     = useRef<number>(0);
  const simRef     = useRef(sim);
  const runningRef = useRef(false);

  const [running, setRunning] = useState(false);
  const [params,  setParams]  = useState<Record<string, number>>(
    () => Object.fromEntries(Object.entries(sim.params).map(([k, v]) => [k, v.default]))
  );
  const [stats, setStats] = useState<Record<string, string | number>>({});

  // Draw once without stepping — used after init/reset to show initial state
  const drawOnce = useCallback(() => {
    const ctx = ctxRef.current;
    if (ctx) {
      simRef.current.draw(ctx);
      setStats({ ...simRef.current.stats() });
    }
  }, []);

  useEffect(() => {
    simRef.current = sim;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctxRef.current = ctx;

    // RAF loop — always running for smooth rendering; only steps when unpaused
    const loop = () => {
      if (runningRef.current) {
        simRef.current.step();
        simRef.current.draw(ctx);
        setStats(s => {
          const next = simRef.current.stats();
          // Avoid re-renders when nothing changed
          const same = Object.keys(next).every(k => next[k] === s[k]);
          return same ? s : next;
        });
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      simRef.current.resize(canvas.width, canvas.height);
    };
    window.addEventListener('resize', resize);

    // Defer init one frame so canvas has proper layout dimensions
    const initId = requestAnimationFrame(() => {
      resize();
      simRef.current.init(canvas, ctx);
      simRef.current.draw(ctx);                  // Show initial frame immediately
      setStats({ ...simRef.current.stats() });
      runningRef.current = true;                 // Auto-start
      setRunning(true);
    });

    return () => {
      cancelAnimationFrame(initId);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      runningRef.current = false;
    };
  }, [sim]); // sim identity changes when parent passes a new object (also triggers on key= remount)

  const togglePlay = useCallback(() => {
    runningRef.current = !runningRef.current;
    setRunning(runningRef.current);
  }, []);

  const reset = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx    = ctxRef.current;
    if (!canvas || !ctx) return;
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    simRef.current.init(canvas, ctx);
    simRef.current.draw(ctx);    // Always redraw so canvas isn't blank after reset
    setStats({ ...simRef.current.stats() });
    // Keep whatever play/pause state the user had
  }, []);

  const handleParam = useCallback((key: string, val: number) => {
    simRef.current.setParam(key, val);
    setParams(p => ({ ...p, [key]: val }));
    drawOnce(); // Immediate visual feedback on param change while paused
  }, [drawOnce]);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Canvas */}
      <div style={{ flex:1, position:'relative', background:'#040e14', overflow:'hidden', minHeight:0 }}>
        <canvas ref={canvasRef}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', display:'block' }} />

        {/* Stats overlay */}
        {Object.keys(stats).length > 0 && (
          <div style={{ position:'absolute', top:10, right:12, display:'flex', gap:6, flexWrap:'wrap', justifyContent:'flex-end' }}>
            {Object.entries(stats).map(([k, v]) => (
              <div key={k} style={{ background:'rgba(6,15,22,0.78)', border:'1px solid var(--line)', borderRadius:7, padding:'3px 9px', fontSize:'.7rem' }}>
                <span style={{ color:'var(--muted)' }}>{k}: </span>
                <span style={{ color:'var(--accent2)', fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toolbar + param sliders */}
      <div style={{ padding:'10px 14px', background:'var(--panel)', borderTop:'1px solid var(--line)', display:'flex', alignItems:'flex-start', gap:16, flexWrap:'wrap', flexShrink:0 }}>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0, paddingTop:2 }}>
          <button onClick={togglePlay} className="tb-btn" style={{ background: running ? 'var(--accent)' : 'var(--panel-b)', minWidth:52 }}>
            {running ? '⏸' : '▶ Play'}
          </button>
          <button onClick={reset} className="tb-btn">↺ Reset</button>
        </div>

        <div style={{ display:'flex', gap:16, flexWrap:'wrap', flex:1 }}>
          {Object.entries(sim.params).map(([key, p]) => (
            <div key={key} style={{ minWidth:110, flex:'1 1 110px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.71rem', color:'var(--muted)', marginBottom:3 }}>
                <span>{p.label}</span>
                <span style={{ color:'var(--accent2)', fontWeight:600 }}>{params[key]}</span>
              </div>
              <input type="range" min={p.min} max={p.max} step={p.step} value={params[key]}
                onChange={e => handleParam(key, +e.target.value)}
                style={{ width:'100%' }} />
            </div>
          ))}
        </div>
      </div>

      <style>{`.tb-btn{padding:5px 12px;border-radius:7px;border:1px solid var(--line);background:var(--panel-b);color:var(--text);font-size:.82rem;font-weight:600;cursor:pointer;transition:all .15s}.tb-btn:hover{background:var(--accent);color:#fff;border-color:var(--accent)}`}</style>
    </div>
  );
}
