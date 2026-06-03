import { useParams, useNavigate } from 'react-router-dom';
import { SimRunner } from '../labs/Lab1Foundations/SimRunner';
import { BoidsSim } from '../labs/Lab1Foundations/sims/boids';
import { FeedbackSim } from '../labs/Lab1Foundations/sims/feedback';
import { LorenzSim } from '../labs/Lab1Foundations/sims/lorenz';
import type { Sim } from '../labs/Lab1Foundations/sims/types';
import simContent from '../content/simulations.json';

const SIM_MAP: Record<string, Sim> = {
  boids:    BoidsSim,
  feedback: FeedbackSim,
  lorenz:   LorenzSim,
};

const CONCEPT_COLORS: Record<string, string> = {
  'Emergence':       '#3a8fa8',
  'Systems Dynamics':'#c87832',
  'Chaos Theory':    '#7a5ac8',
};

export function Simulations() {
  const { simId } = useParams<{ simId?: string }>();
  const navigate  = useNavigate();
  const activeSim = simId ? SIM_MAP[simId] : null;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 3.5rem)', overflow: 'hidden' }}>

      {/* ── Left: canvas area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--line)' }}>
        {activeSim ? (
          <SimRunner key={simId} sim={activeSim} />
        ) : (
          <BlankCanvas />
        )}
      </div>

      {/* ── Right: simulation list ── */}
      <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--panel)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
          <div style={{ fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--muted)', fontWeight: 700 }}>
            Foundry Simulations
          </div>
          <p style={{ fontSize: '.78rem', color: 'var(--muted)', margin: '5px 0 0', lineHeight: 1.4 }}>
            Interactive demonstrations of core systemic concepts.
          </p>
        </div>

        {/* Sim cards */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {simContent.simulations.map(sim => {
            const isActive = sim.id === simId;
            const accent   = CONCEPT_COLORS[sim.concept] ?? 'var(--accent)';
            return (
              <div
                key={sim.id}
                onClick={() => navigate(`/simulations/${sim.id}`)}
                style={{
                  marginBottom: 10,
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: `1px solid ${isActive ? accent : 'var(--line)'}`,
                  background: isActive ? `${accent}12` : 'var(--panel-b)',
                  cursor: 'pointer',
                  transition: 'all .15s',
                }}
                className="sim-card"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ fontSize: '.9rem', fontWeight: 700, color: isActive ? accent : 'var(--text)' }}>
                    {sim.title}
                  </span>
                  <span style={{ fontSize: '.62rem', padding: '2px 8px', borderRadius: 999, background: `${accent}18`, border: `1px solid ${accent}40`, color: accent, flexShrink: 0, marginLeft: 8 }}>
                    {sim.concept}
                  </span>
                </div>
                <p style={{ fontSize: '.78rem', color: 'var(--muted)', margin: 0, lineHeight: 1.45 }}>
                  {sim.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .sim-card:hover { border-color: var(--accent) !important; }
      `}</style>
    </div>
  );
}

function BlankCanvas() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#060f16', padding: 32, textAlign: 'center' }}>
      {/* Subtle node-link background hint */}
      <div style={{ marginBottom: 28, opacity: .25 }}>
        <svg width={80} height={80} viewBox="0 0 80 80">
          <circle cx={20} cy={20} r={5} fill="#3a8fa8" />
          <circle cx={60} cy={25} r={5} fill="#3a8fa8" />
          <circle cx={40} cy={60} r={5} fill="#3a8fa8" />
          <line x1={20} y1={20} x2={60} y2={25} stroke="#3a8fa8" strokeWidth={1} opacity={.6} />
          <line x1={60} y1={25} x2={40} y2={60} stroke="#3a8fa8" strokeWidth={1} opacity={.6} />
          <line x1={40} y1={60} x2={20} y2={20} stroke="#3a8fa8" strokeWidth={1} opacity={.6} />
        </svg>
      </div>
      <h2 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: '1.3rem', color: 'var(--text)', margin: '0 0 12px', fontWeight: 600 }}>
        {simContent.blank_hint}
      </h2>
      <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.6, maxWidth: 360, margin: 0 }}>
        {simContent.blank_sub}
      </p>
    </div>
  );
}
