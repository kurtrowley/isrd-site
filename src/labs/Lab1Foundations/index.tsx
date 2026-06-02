import { LAB_REGISTRY } from '../registry';
import { LabLayout } from '../../components/LabLayout';
import { useSystemicSimulation } from '../../toolkit/useSystemicSimulation';
import { useEffect, useRef, useState } from 'react';

const LAB = LAB_REGISTRY.find(l => l.id === 'foundations')!;

const WHITEPAPERS = [
  { title: 'Systemic Synthesis: A Non-Linear Approach', desc: 'Core framework for integrating feedback loops, attractor basins, and bifurcation dynamics across domains.', tag: 'Foundations' },
  { title: 'AI Integration Theory', desc: 'Dissertation-derived model for embedding AI assistance into systemic engineering workflows.', tag: 'Theory' },
  { title: 'Attractor Engineering Framework', desc: 'How to design systems that guide state toward desired basins rather than avoiding undesired ones.', tag: 'Engineering' },
  { title: 'The Pattern Is the Message', desc: 'Systemic approaches to information transfer in complex adaptive systems.', tag: 'Research' },
];

export function FoundationsLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { loop, basin, start, stop } = useSystemicSimulation({ tickMs: 80 });
  const [energy, setEnergy] = useState(0);
  const [basinNum, setBasinNum] = useState(0);

  useEffect(() => {
    // Build a minimal 3-node graph illustrating attractor dynamics
    loop.addNode({ id:'synthesis', label:'Systemic Synthesis', value:0.5, min:0, max:1 });
    loop.addNode({ id:'reductionism', label:'Reductionism', value:0.8, min:0, max:1 });
    loop.addNode({ id:'emergence', label:'Emergence', value:0.3, min:0, max:1 });
    loop.addEdge({ from:'synthesis',   to:'emergence',    weight: 0.4 });
    loop.addEdge({ from:'reductionism',to:'synthesis',    weight:-0.2 });
    loop.addEdge({ from:'emergence',   to:'reductionism', weight:-0.3 });

    start();
    return () => stop();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;

    const draw = (t: number) => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0,0,W,H);

      const graph = loop.getGraph();
      const nodes = [...graph.nodes.values()];
      const cx = W/2, cy = H/2, orbR = Math.min(W,H)*0.35;

      // Draw edges
      for (const edge of graph.edges) {
        const srcI = nodes.findIndex(n=>n.id===edge.from);
        const dstI = nodes.findIndex(n=>n.id===edge.to);
        if (srcI<0||dstI<0) continue;
        const sx = cx + Math.cos(srcI/nodes.length*Math.PI*2) * orbR;
        const sy = cy + Math.sin(srcI/nodes.length*Math.PI*2) * orbR;
        const dx = cx + Math.cos(dstI/nodes.length*Math.PI*2) * orbR;
        const dy = cy + Math.sin(dstI/nodes.length*Math.PI*2) * orbR;
        ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(dx,dy);
        ctx.strokeStyle = edge.weight > 0 ? 'rgba(58,143,168,0.4)' : 'rgba(200,80,80,0.3)';
        ctx.lineWidth = Math.abs(edge.weight) * 2; ctx.stroke();
      }

      // Draw nodes
      nodes.forEach((node, i) => {
        const angle = (i / nodes.length) * Math.PI * 2 + t * 0.0003;
        const x = cx + Math.cos(angle) * orbR;
        const y = cy + Math.sin(angle) * orbR;
        const r = 18 + node.value * 14;
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
        ctx.fillStyle = `rgba(58,143,168,${0.3+node.value*0.5})`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(122,204,224,0.6)'; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle='rgba(200,230,240,0.9)'; ctx.font=`bold 10px Inter,sans-serif`;
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(node.label, x, y);
      });

      // Energy bar
      const e = basin.computeEnergy(graph);
      setEnergy(e); setBasinNum(basin.classifyBasin(e));
      ctx.fillStyle='rgba(58,143,168,0.15)';
      ctx.fillRect(12, H-24, (W-24)*e, 8);
      ctx.strokeStyle='rgba(58,143,168,0.4)'; ctx.lineWidth=1;
      ctx.strokeRect(12,H-24,W-24,8);
      ctx.fillStyle='rgba(140,185,200,0.6)'; ctx.font='10px Inter,sans-serif';
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      ctx.fillText(`Energy: ${(e*100).toFixed(0)}%  ·  Basin: ${basinNum}`, 12, H-30);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [loop, basin]);

  return (
    <LabLayout
      lab={LAB}
      simArea={
        <div style={{ flex:1, background:'#060f16', position:'relative', overflow:'hidden', minHeight:0 }}>
          <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', display:'block' }} />
        </div>
      }
      sidebarContent={
        <div style={{ flex:1, overflowY:'auto', padding:16 }}>
          <div style={{ fontSize:'.7rem', textTransform:'uppercase', letterSpacing:'.1em', color:'var(--muted)', marginBottom:12 }}>
            Whitepapers & Theory
          </div>
          {WHITEPAPERS.map(wp => (
            <div key={wp.title} style={{ marginBottom:14, padding:'12px 14px', borderRadius:10, border:'1px solid var(--line)', background:'var(--panel-b)', cursor:'pointer' }}
              className="hover-card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:5 }}>
                <span style={{ fontSize:'.88rem', fontWeight:600, color:'var(--text)', lineHeight:1.3 }}>{wp.title}</span>
                <span style={{ fontSize:'.65rem', padding:'2px 8px', borderRadius:999, background:'rgba(212,168,71,0.15)', color:'var(--gold)', border:'1px solid rgba(212,168,71,0.3)', whiteSpace:'nowrap', marginLeft:8, flexShrink:0 }}>{wp.tag}</span>
              </div>
              <p style={{ fontSize:'.78rem', color:'var(--muted)', lineHeight:1.5, margin:0 }}>{wp.desc}</p>
            </div>
          ))}
          <div style={{ marginTop:16, padding:'12px 14px', borderRadius:10, border:'1px solid rgba(58,143,168,0.3)', background:'rgba(58,143,168,0.05)' }}>
            <div style={{ fontSize:'.72rem', color:'var(--accent2)', fontWeight:600, marginBottom:4 }}>Live attractor state</div>
            <div style={{ fontSize:'.8rem', color:'var(--muted)' }}>Energy: <span style={{ color:'var(--accent2)' }}>{(energy*100).toFixed(0)}%</span></div>
            <div style={{ fontSize:'.8rem', color:'var(--muted)' }}>Basin: <span style={{ color:'var(--accent2)' }}>{basinNum}</span></div>
          </div>
          <style>{`.hover-card:hover { border-color:var(--accent) !important; }`}</style>
        </div>
      }
    />
  );
}
