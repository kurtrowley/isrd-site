import { useEffect, useRef, useState } from 'react';
import { MobileShelf } from '../../components/MobileShelf';
import { FeedbackLoop } from '../../toolkit/FeedbackLoop';
import { AttractorBasin } from '../../toolkit/AttractorBasin';

const ACCENT = '#7a5ac8';

export function GlobalFuturismPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loopRef   = useRef(new FeedbackLoop());
  const basinRef  = useRef(new AttractorBasin({ numBasins:4, thresholds:[0.25,0.50,0.75], dampening:0.04 }));
  const [basinState, setBasinState] = useState({ basin:0, energy:0, stability:0 });
  const [params, setParams] = useState({ inequality:0.6, techAccel:0.5, climateStress:0.55, cooperation:0.4 });

  useEffect(() => {
    const L = loopRef.current;
    L.addNode({ id:'inequality',   label:'Inequality',      value:params.inequality,   min:0, max:1 });
    L.addNode({ id:'techAccel',    label:'Tech Acceleration',value:params.techAccel,   min:0, max:1 });
    L.addNode({ id:'climateStress',label:'Climate Stress',  value:params.climateStress,min:0, max:1 });
    L.addNode({ id:'cooperation',  label:'Cooperation',     value:params.cooperation,  min:0, max:1 });
    L.addNode({ id:'instability',  label:'Instability',     value:0.5,                 min:0, max:1 });
    L.addEdge({ from:'inequality',   to:'instability',  weight: 0.5 });
    L.addEdge({ from:'climateStress',to:'instability',  weight: 0.4 });
    L.addEdge({ from:'techAccel',    to:'inequality',   weight: 0.3 });
    L.addEdge({ from:'cooperation',  to:'instability',  weight:-0.6 });
    L.addEdge({ from:'instability',  to:'cooperation',  weight:-0.3 });
  }, []);

  useEffect(() => {
    for (const [k, v] of Object.entries(params)) loopRef.current.setNodeValue(k, v);
  }, [params]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf: number;

    const draw = (t: number) => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0,0,W,H); ctx.fillStyle='#060f16'; ctx.fillRect(0,0,W,H);

      const state = basinRef.current.step(loopRef.current.getGraph());
      setBasinState({ basin:state.basin, energy:state.energy, stability:state.stability });

      const graph = loopRef.current.getGraph();
      const nodes = [...graph.nodes.values()];
      const cx=W/2, cy=H/2, orbR=Math.min(W,H)*0.36;

      // Basin rings
      [0.25,0.50,0.75].forEach((thresh, i) => {
        ctx.beginPath(); ctx.arc(cx,cy,(thresh)*orbR*1.5+40,0,Math.PI*2);
        ctx.strokeStyle=`rgba(122,90,200,${0.08+i*0.04})`; ctx.lineWidth=1; ctx.stroke();
      });

      for (const edge of graph.edges) {
        const si=nodes.findIndex(n=>n.id===edge.from), di=nodes.findIndex(n=>n.id===edge.to);
        if(si<0||di<0) continue;
        const sx=cx+Math.cos(si/nodes.length*Math.PI*2)*orbR;
        const sy=cy+Math.sin(si/nodes.length*Math.PI*2)*orbR;
        const dx=cx+Math.cos(di/nodes.length*Math.PI*2)*orbR;
        const dy=cy+Math.sin(di/nodes.length*Math.PI*2)*orbR;
        ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(dx,dy);
        ctx.strokeStyle=edge.weight>0?`rgba(200,80,80,${Math.abs(edge.weight)*0.5})`:`rgba(80,180,120,${Math.abs(edge.weight)*0.6})`;
        ctx.lineWidth=Math.abs(edge.weight)*1.5; ctx.stroke();
      }

      nodes.forEach((node,i) => {
        const angle=i/nodes.length*Math.PI*2;
        const x=cx+Math.cos(angle)*orbR, y=cy+Math.sin(angle)*orbR;
        const r=15+node.value*18;
        const pulse=1+Math.sin(t*0.0008+i*1.8)*0.07;
        const isInstability = node.id==='instability';
        ctx.beginPath(); ctx.arc(x,y,r*pulse,0,Math.PI*2);
        ctx.fillStyle=isInstability?`rgba(200,60,60,${0.15+node.value*0.5})`:`rgba(122,90,200,${0.15+node.value*0.4})`; ctx.fill();
        ctx.strokeStyle=isInstability?'rgba(220,100,100,0.7)':'rgba(160,130,220,0.7)'; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle='rgba(220,210,240,0.9)'; ctx.font='bold 10px Inter,sans-serif';
        ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(node.label,x,y);
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const BASINS = ['Stable Cooperation', 'Managed Tension', 'Rising Disorder', 'Civilizational Crisis'];

  return (
    <MobileShelf
      accent={ACCENT}
      shelfTitle="Controls"
      main={
        <div style={{ flex:1, position:'relative', overflow:'hidden', minHeight:0, background:'#060f16' }}>
          <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', display:'block' }} />
        </div>
      }
      shelf={
        <div style={{ flex:1, overflowY:'auto', padding:16 }}>
          <div style={{ fontSize:'.7rem', textTransform:'uppercase', letterSpacing:'.1em', color:'var(--muted)', marginBottom:12 }}>
            Macro-Systemic Inputs
          </div>
          {[
            { label:'Inequality',     key:'inequality',    color:'#e05050' },
            { label:'Tech Acceleration', key:'techAccel', color:'#5090e0' },
            { label:'Climate Stress', key:'climateStress', color:'#70b050' },
            { label:'Cooperation',    key:'cooperation',   color:'#50c090' },
          ].map(ctrl => (
            <div key={ctrl.key} style={{ marginBottom:14 }}>
              <label style={{ display:'flex', justifyContent:'space-between', fontSize:'.82rem', color:'var(--muted)', marginBottom:3 }}>
                {ctrl.label}
                <span style={{ color:ctrl.color, fontWeight:600 }}>{(params[ctrl.key as keyof typeof params]*100).toFixed(0)}%</span>
              </label>
              <input type="range" min={0} max={1} step={0.01}
                value={params[ctrl.key as keyof typeof params]}
                onChange={e => setParams(p => ({ ...p, [ctrl.key]: +e.target.value }))}
                style={{ width:'100%', accentColor:ctrl.color }} />
            </div>
          ))}
          <div style={{ marginTop:16, padding:'12px 14px', borderRadius:10, border:'1px solid rgba(122,90,200,0.4)', background:'rgba(122,90,200,0.07)' }}>
            <div style={{ fontSize:'.72rem', color:'rgba(180,160,230,0.9)', fontWeight:600, marginBottom:6 }}>Attractor Basin</div>
            <div style={{ fontSize:'1rem', fontWeight:700, color:'rgba(200,180,240,0.95)', marginBottom:4 }}>
              {BASINS[Math.min(basinState.basin, 3)]}
            </div>
            <div style={{ fontSize:'.75rem', color:'var(--muted)' }}>
              Energy: <span style={{ color:'var(--accent2)' }}>{(basinState.energy*100).toFixed(0)}%</span>
            </div>
            <div style={{ fontSize:'.75rem', color:'var(--muted)' }}>
              Stability: <span style={{ color:'var(--accent2)' }}>{(basinState.stability*100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      }
    />
  );
}
