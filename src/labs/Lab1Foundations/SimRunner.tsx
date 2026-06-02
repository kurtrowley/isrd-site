// Generic canvas sim runner — works with any Sim object (Boids, Feedback, Lorenz, etc.)
import { useEffect, useRef, useState, useCallback } from 'react';
import type { Sim } from './sims/types';

interface Props { sim: Sim; }

export function SimRunner({ sim }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const simRef    = useRef(sim);
  const [params,  setParams]  = useState<Record<string, number>>(
    () => Object.fromEntries(Object.entries(sim.params).map(([k, v]) => [k, v.default]))
  );
  const [stats,   setStats]   = useState<Record<string, string | number>>({});
  const [running, setRunning] = useState(true);
  const runningRef = useRef(true);

  // Reinit when sim changes
  useEffect(() => {
    simRef.current = sim;
    setParams(Object.fromEntries(Object.entries(sim.params).map(([k, v]) => [k, v.default])));
    setRunning(true);
    runningRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    sim.init(canvas, ctx);
  }, [sim]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      simRef.current.resize(canvas.width, canvas.height);
    };
    resize();
    simRef.current.init(canvas, ctx);
    window.addEventListener('resize', resize);

    const loop = () => {
      if (runningRef.current) {
        simRef.current.step();
        simRef.current.draw(ctx);
        setStats({ ...simRef.current.stats() });
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleParam = useCallback((key: string, val: number) => {
    simRef.current.setParam(key, val);
    setParams(p => ({ ...p, [key]: val }));
  }, []);

  const togglePlay = () => {
    runningRef.current = !runningRef.current;
    setRunning(runningRef.current);
  };

  const reset = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    simRef.current.init(canvas, ctx);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Canvas */}
      <div style={{ flex:1, position:'relative', background:'#040e14', overflow:'hidden', minHeight:0 }}>
        <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', display:'block' }} />

        {/* Stats overlay */}
        {Object.keys(stats).length > 0 && (
          <div style={{ position:'absolute', top:10, right:12, display:'flex', gap:8, flexWrap:'wrap', justifyContent:'flex-end' }}>
            {Object.entries(stats).map(([k, v]) => (
              <div key={k} style={{ background:'rgba(6,15,22,0.75)', border:'1px solid var(--line)', borderRadius:7, padding:'4px 10px', fontSize:'.72rem' }}>
                <span style={{ color:'var(--muted)' }}>{k}: </span>
                <span style={{ color:'var(--accent2)', fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ padding:'10px 14px', background:'var(--panel)', borderTop:'1px solid var(--line)', display:'flex', alignItems:'flex-start', gap:20, flexWrap:'wrap', flexShrink:0 }}>
        {/* Play/Reset */}
        <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0, paddingTop:2 }}>
          <button onClick={togglePlay} className="tb-btn" style={{ background: running ? 'var(--accent)' : 'var(--panel-b)' }}>
            {running ? '⏸' : '▶'}
          </button>
          <button onClick={reset} className="tb-btn">↺</button>
        </div>

        {/* Param sliders */}
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', flex:1 }}>
          {Object.entries(sim.params).map(([key, p]) => (
            <div key={key} style={{ minWidth:120, flex:'1 1 120px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.72rem', color:'var(--muted)', marginBottom:3 }}>
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

      <style>{`.tb-btn { padding:5px 12px; border-radius:7px; border:1px solid var(--line); background:var(--panel-b); color:var(--text); font-size:.82rem; font-weight:600; cursor:pointer; transition:all .15s; }
        .tb-btn:hover { background:var(--accent); color:#fff; border-color:var(--accent); }`}</style>
    </div>
  );
}
