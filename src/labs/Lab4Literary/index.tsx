import { useEffect, useRef, useState } from 'react';
import { MobileShelf } from '../../components/MobileShelf';
import { FeedbackLoop } from '../../toolkit/FeedbackLoop';
import { AttractorBasin } from '../../toolkit/AttractorBasin';

const ACCENT = '#c87832';

export function LiterarySystemicsPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loopRef   = useRef(new FeedbackLoop());
  const basinRef  = useRef(new AttractorBasin());
  const [impact,  setImpact]  = useState(0);
  const [clarity, setClarity] = useState(0.5);
  const [tension, setTension] = useState(0.5);

  useEffect(() => {
    const L = loopRef.current;
    L.addNode({ id:'clarity',    label:'Reader Clarity',  value:clarity, min:0, max:1 });
    L.addNode({ id:'tension',    label:'Narrative Tension',value:tension, min:0, max:1 });
    L.addNode({ id:'engagement', label:'Engagement',       value:0.5,     min:0, max:1 });
    L.addNode({ id:'impact',     label:'Story Impact',     value:0.5,     min:0, max:1 });
    L.addEdge({ from:'clarity',    to:'engagement', weight: 0.5 });
    L.addEdge({ from:'tension',    to:'engagement', weight: 0.4 });
    L.addEdge({ from:'engagement', to:'impact',     weight: 0.6 });
    L.addEdge({ from:'impact',     to:'clarity',    weight:-0.15 }); // complexity reduces clarity
  }, []);

  useEffect(() => {
    loopRef.current.setNodeValue('clarity', clarity);
    loopRef.current.setNodeValue('tension', tension);
  }, [clarity, tension]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf: number;

    const draw = (t: number) => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0,0,W,H); ctx.fillStyle='#060f16'; ctx.fillRect(0,0,W,H);

      basinRef.current.step(loopRef.current.getGraph());
      const graph = loopRef.current.getGraph();
      const nodes = [...graph.nodes.values()];
      const cx=W/2, cy=H/2, orbR=Math.min(W,H)*0.33;

      for (const edge of graph.edges) {
        const si=nodes.findIndex(n=>n.id===edge.from), di=nodes.findIndex(n=>n.id===edge.to);
        if(si<0||di<0) continue;
        const sx=cx+Math.cos(si/nodes.length*Math.PI*2-Math.PI/2)*orbR;
        const sy=cy+Math.sin(si/nodes.length*Math.PI*2-Math.PI/2)*orbR;
        const dx=cx+Math.cos(di/nodes.length*Math.PI*2-Math.PI/2)*orbR;
        const dy=cy+Math.sin(di/nodes.length*Math.PI*2-Math.PI/2)*orbR;
        ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(dx,dy);
        ctx.strokeStyle=edge.weight>0?`rgba(200,120,50,${Math.abs(edge.weight)*0.6})`:`rgba(100,140,200,${Math.abs(edge.weight)*0.5})`;
        ctx.lineWidth=Math.abs(edge.weight)*2; ctx.stroke();
      }

      nodes.forEach((node,i) => {
        const angle=i/nodes.length*Math.PI*2-Math.PI/2;
        const x=cx+Math.cos(angle)*orbR, y=cy+Math.sin(angle)*orbR;
        const r=16+node.value*18;
        const pulse=1+Math.sin(t*0.001+i*1.5)*0.06;
        ctx.beginPath(); ctx.arc(x,y,r*pulse,0,Math.PI*2);
        ctx.fillStyle=`rgba(200,120,50,${0.15+node.value*0.4})`; ctx.fill();
        ctx.strokeStyle='rgba(220,160,80,0.7)'; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle='rgba(240,210,160,0.9)'; ctx.font=`bold 10px Inter,sans-serif`;
        ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(node.label,x,y);
        if (node.id==='impact') setImpact(node.value);
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

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
            Writing System Controls
          </div>
          {[
            { label: 'Reader Clarity', key:'clarity', value:clarity, set:setClarity },
            { label: 'Narrative Tension', key:'tension', value:tension, set:setTension },
          ].map(ctrl => (
            <div key={ctrl.key} style={{ marginBottom:16 }}>
              <label style={{ display:'flex', justifyContent:'space-between', fontSize:'.82rem', color:'var(--muted)', marginBottom:4 }}>
                {ctrl.label}
                <span style={{ color:'var(--accent2)', fontWeight:600 }}>{ctrl.value.toFixed(2)}</span>
              </label>
              <input type="range" min={0} max={1} step={0.01} value={ctrl.value}
                onChange={e => ctrl.set(+e.target.value)} style={{ width:'100%' }} />
            </div>
          ))}
          <div style={{ padding:'12px 14px', borderRadius:10, border:'1px solid rgba(200,120,50,0.4)', background:'rgba(200,120,50,0.07)', marginTop:8 }}>
            <div style={{ fontSize:'.72rem', color:'rgba(220,160,80,0.9)', fontWeight:600, marginBottom:4 }}>Story Impact Score</div>
            <div style={{ fontSize:'1.8rem', fontWeight:700, color:'rgba(220,160,80,0.95)' }}>{(impact*100).toFixed(0)}</div>
            <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:4 }}>Systemic attractor strength</div>
          </div>
          <div style={{ marginTop:16, fontSize:'.78rem', color:'var(--muted)', lineHeight:1.6 }}>
            <p>Adjust Reader Clarity and Narrative Tension to see how they cascade through the feedback graph into Story Impact.</p>
            <p>High tension with low clarity creates engagement spikes but unsustainable narrative energy.</p>
          </div>
        </div>
      }
    />
  );
}
