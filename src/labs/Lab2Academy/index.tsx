import { LAB_REGISTRY } from '../registry';
import { LabLayout } from '../../components/LabLayout';
import { useRef, useEffect } from 'react';
import labsData from '../../content/labs.json';

const LAB = LAB_REGISTRY.find(l => l.id === 'academy')!;
const content = labsData.labs.find(l => l.id === 'academy')!;

const API_DOCS    = (content as any).api_docs    ?? [];
const LEARNING    = (content as any).learning_paths ?? [];

export function AcademyLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;

    const nodes: Array<{x:number;y:number;vx:number;vy:number;label:string;active:boolean}> = [
      { x:0.2, y:0.3, vx:.0004, vy:.0003, label:'FeedbackLoop',         active:true },
      { x:0.5, y:0.2, vx:-.0003, vy:.0004, label:'AttractorBasin',      active:true },
      { x:0.8, y:0.4, vx:.0002, vy:-.0003, label:'useSystemic\nSimulation', active:true },
      { x:0.35, y:0.7, vx:-.0003, vy:-.0002, label:'SimNode',           active:false },
      { x:0.65, y:0.75, vx:.0003, vy:.0002, label:'SimEdge',            active:false },
      { x:0.15, y:0.6, vx:.0002, vy:.0003, label:'LabConfig',           active:false },
    ];

    const draw = (t: number) => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#060f16'; ctx.fillRect(0,0,W,H);

      const px = (n: typeof nodes[0]) => ({ x:n.x*W, y:n.y*H });

      for (let i=0;i<nodes.length;i++) for (let j=i+1;j<nodes.length;j++) {
        const a = px(nodes[i]), b = px(nodes[j]);
        const d = Math.hypot(a.x-b.x, a.y-b.y);
        if (d > W*0.45) continue;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=`rgba(58,143,168,${0.12*(1-d/(W*0.45))})`;
        ctx.lineWidth=1; ctx.stroke();
      }

      nodes.forEach(n => {
        const { x, y } = px(n);
        n.x = ((n.x + n.vx) % 1 + 1) % 1;
        n.y = ((n.y + n.vy) % 1 + 1) % 1;
        const r = n.active ? 28 : 18;
        const pulse = 1 + Math.sin(t*0.001 + nodes.indexOf(n)*1.2) * 0.08;
        ctx.beginPath(); ctx.arc(x,y,r*pulse,0,Math.PI*2);
        ctx.fillStyle = n.active ? 'rgba(58,143,168,0.25)' : 'rgba(58,143,168,0.1)'; ctx.fill();
        ctx.strokeStyle = n.active ? 'rgba(122,204,224,0.7)' : 'rgba(58,143,168,0.4)';
        ctx.lineWidth = n.active ? 1.5 : 1; ctx.stroke();
        ctx.fillStyle=n.active?'rgba(200,230,240,0.9)':'rgba(140,185,200,0.6)';
        ctx.font=`${n.active?'bold ':' '}${n.active?11:9}px JetBrains Mono,monospace`;
        ctx.textAlign='center'; ctx.textBaseline='middle';
        const lines = n.label.split('\n');
        lines.forEach((line,li) => ctx.fillText(line, x, y + (li - (lines.length-1)/2)*13));
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

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
          <div style={{ fontSize:'.7rem', textTransform:'uppercase', letterSpacing:'.1em', color:'var(--muted)', marginBottom:10 }}>
            Sim-Toolkit API
          </div>
          {API_DOCS.map((api: any) => (
            <div key={api.name} style={{ marginBottom:12, padding:'10px 12px', borderRadius:10, border:'1px solid var(--line)', background:'var(--panel-b)' }}>
              <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'.75rem', color:'var(--accent2)', marginBottom:4 }}>{api.sig}</div>
              <p style={{ fontSize:'.77rem', color:'var(--muted)', margin:0, lineHeight:1.45 }}>{api.desc}</p>
            </div>
          ))}
          <div style={{ fontSize:'.7rem', textTransform:'uppercase', letterSpacing:'.1em', color:'var(--muted)', margin:'16px 0 10px' }}>
            Learning Paths
          </div>
          {LEARNING.map((path: any) => (
            <div key={path.title} style={{ marginBottom:8, padding:'9px 12px', borderRadius:8, border:'1px solid var(--line)', background:'var(--panel-b)', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:'.82rem', fontWeight:600, color:'var(--text)' }}>{path.title}</div>
                <div style={{ fontSize:'.72rem', color:'var(--muted)' }}>{path.modules} modules</div>
              </div>
              <span style={{ fontSize:'.65rem', padding:'2px 8px', borderRadius:999, background:'rgba(58,143,168,0.15)', color:'var(--accent)', border:'1px solid rgba(58,143,168,0.3)' }}>{path.tag}</span>
            </div>
          ))}
        </div>
      }
    />
  );
}
