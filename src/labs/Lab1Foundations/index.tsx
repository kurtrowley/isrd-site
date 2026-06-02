import { useState } from 'react';
import { LAB_REGISTRY } from '../registry';
import { LabLayout } from '../../components/LabLayout';
import { SimRunner } from './SimRunner';
import { BoidsSim } from './sims/boids';
import { FeedbackSim } from './sims/feedback';
import { LorenzSim } from './sims/lorenz';
import type { Sim } from './sims/types';
import labsData from '../../content/labs.json';

const LAB      = LAB_REGISTRY.find(l => l.id === 'foundations')!;
const content  = labsData.labs.find(l => l.id === 'foundations')!;
const PAPERS   = (content as any).whitepapers ?? [];

const SIMS: Sim[] = [BoidsSim, FeedbackSim, LorenzSim];

export function FoundationsLab() {
  const [activeSim, setActiveSim] = useState<Sim>(SIMS[0]);

  return (
    <LabLayout
      lab={LAB}
      simArea={
        <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
          {/* Sim tab bar */}
          <div style={{ display:'flex', borderBottom:'1px solid var(--line)', background:'var(--panel)', flexShrink:0 }}>
            {SIMS.map(s => (
              <button key={s.id} onClick={() => setActiveSim(s)}
                style={{
                  padding:'8px 18px', fontSize:'.78rem', fontWeight:600, cursor:'pointer',
                  border:'none', borderBottom:`2px solid ${activeSim.id === s.id ? 'var(--accent)' : 'transparent'}`,
                  background: activeSim.id === s.id ? 'rgba(58,143,168,0.08)' : 'transparent',
                  color: activeSim.id === s.id ? 'var(--accent2)' : 'var(--muted)',
                  transition:'all .15s', whiteSpace:'nowrap',
                }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Description strip */}
          <div style={{ padding:'8px 16px', borderBottom:'1px solid var(--line)', background:'var(--panel-b)', flexShrink:0 }}>
            <p style={{ margin:0, fontSize:'.78rem', color:'var(--muted)', lineHeight:1.5 }}>
              {activeSim.description}
            </p>
          </div>

          {/* Canvas + controls */}
          <div style={{ flex:1, minHeight:0 }}>
            <SimRunner key={activeSim.id} sim={activeSim} />
          </div>
        </div>
      }
      sidebarContent={
        <div style={{ flex:1, overflowY:'auto', padding:16 }}>
          <div style={{ fontSize:'.7rem', textTransform:'uppercase', letterSpacing:'.1em', color:'var(--muted)', marginBottom:12 }}>
            Whitepapers & Theory
          </div>
          {PAPERS.map((wp: any) => (
            <div key={wp.title} className="hover-card"
              style={{ marginBottom:12, padding:'12px 14px', borderRadius:10, border:'1px solid var(--line)', background:'var(--panel-b)', cursor:'pointer' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:5, gap:8 }}>
                <span style={{ fontSize:'.88rem', fontWeight:600, color:'var(--text)', lineHeight:1.3 }}>{wp.title}</span>
                <span style={{ fontSize:'.62rem', padding:'2px 7px', borderRadius:999, background:'rgba(212,168,71,0.15)', color:'var(--gold)', border:'1px solid rgba(212,168,71,0.3)', whiteSpace:'nowrap', flexShrink:0 }}>{wp.tag}</span>
              </div>
              <p style={{ fontSize:'.78rem', color:'var(--muted)', lineHeight:1.5, margin:0 }}>{wp.desc}</p>
            </div>
          ))}

          <div style={{ marginTop:8, padding:'12px 14px', borderRadius:10, border:'1px solid rgba(58,143,168,0.25)', background:'rgba(58,143,168,0.04)' }}>
            <div style={{ fontSize:'.68rem', textTransform:'uppercase', letterSpacing:'.08em', color:'var(--accent)', marginBottom:8, fontWeight:700 }}>
              Demo Simulations
            </div>
            {SIMS.map(s => (
              <button key={s.id} onClick={() => setActiveSim(s)}
                style={{ display:'block', width:'100%', textAlign:'left', marginBottom:6, padding:'7px 10px', borderRadius:8, cursor:'pointer', transition:'all .15s',
                  border:`1px solid ${activeSim.id === s.id ? 'var(--accent)' : 'var(--line)'}`,
                  background: activeSim.id === s.id ? 'rgba(58,143,168,0.12)' : 'var(--panel-b)',
                  color: activeSim.id === s.id ? 'var(--accent2)' : 'var(--muted)',
                  fontSize:'.8rem', fontWeight:600,
                }}>
                {s.label}
              </button>
            ))}
          </div>

          <style>{`.hover-card:hover { border-color:var(--accent) !important; }`}</style>
        </div>
      }
    />
  );
}
