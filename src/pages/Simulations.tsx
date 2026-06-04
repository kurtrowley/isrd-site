import { useParams, useNavigate } from 'react-router-dom';
import { MobileShelf } from '../components/MobileShelf';
import { SimRunner } from '../labs/Lab1Foundations/SimRunner';

// Era 3 — existing demo sims
import { BoidsSim }    from '../labs/Lab1Foundations/sims/boids';
import { FeedbackSim } from '../labs/Lab1Foundations/sims/feedback';
import { LorenzSim }   from '../labs/Lab1Foundations/sims/lorenz';

// Era 4 + Era 5 — new demo sims
import { Era4NetworkSim }      from '../sims/era4-network';
import { Era5EntanglementSim } from '../sims/era5-entanglement';

import type { Sim } from '../labs/Lab1Foundations/sims/types';
import simContent from '../content/simulations.json';

// ── Era metadata ──────────────────────────────────────────────────────────────

const ERA_COLOR: Record<number, string> = {
  3: '#7a5ac8',
  4: '#c87832',
  5: '#3a8fa8',
};

const ERA_LABEL: Record<number, string> = {
  3: 'Era 3 — Complexity & Chaos',
  4: 'Era 4 — Networked Complexity',
  5: 'Era 5 — Entanglement',
};

const ERA_DESC: Record<number, string> = {
  3: 'Agent behaviour, attractor dynamics, sensitive dependence on initial conditions.',
  4: 'Network topology determines outcomes. Small-world graphs, hub dynamics, cascade propagation.',
  5: 'Formal and informal layers co-determine system behaviour. The relevant network is often invisible.',
};

// ── Sim registry ──────────────────────────────────────────────────────────────
// Maps sim id → Sim implementation.
// Agent-tier sims (ME/CFS) open their dedicated lab page.

const SIM_MAP: Record<string, Sim> = {
  boids:            BoidsSim,
  feedback:         FeedbackSim,
  lorenz:           LorenzSim,
  'era4-network':   Era4NetworkSim    as unknown as Sim,
  'era5-entanglement': Era5EntanglementSim as unknown as Sim,
};

// ── Component ─────────────────────────────────────────────────────────────────

export function Simulations() {
  const { simId } = useParams<{ simId?: string }>();
  const navigate  = useNavigate();

  const activeSim     = simId ? SIM_MAP[simId] ?? null : null;
  const activeSimMeta = simContent.simulations.find((s: any) => s.id === simId) ?? null;

  // Group sims by era for the sidebar
  const demoSims    = simContent.simulations.filter((s: any) => s.tier === 'demo' || !s.tier);
  const researchSims = simContent.simulations.filter((s: any) => s.tier === 'agent' || s.type === 'research');

  const eras = [3, 4, 5] as const;
  const simsByEra: Record<number, typeof demoSims> = {};
  for (const era of eras) {
    simsByEra[era] = demoSims.filter((s: any) => s.era === era);
  }

  const shelfPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
        <div style={{ fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--muted)', fontWeight: 700 }}>
          Simulations
        </div>
        <p style={{ fontSize: '.76rem', color: 'var(--muted)', margin: '4px 0 0', lineHeight: 1.4 }}>
          Structural concepts in systems science — interactive, parameter-tunable.
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 16px' }}>

        {/* Demo sims grouped by era */}
        {eras.map(era => {
          const sims = simsByEra[era];
          if (!sims?.length) return null;
          const color = ERA_COLOR[era];
          return (
            <div key={era} style={{ marginBottom: 16 }}>
              {/* Era header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 6px 2px' }}>
                <span style={{
                  fontSize: '.6rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                  padding: '2px 8px', borderRadius: 999,
                  background: color + '18', border: `1px solid ${color}50`, color,
                }}>
                  {ERA_LABEL[era]}
                </span>
              </div>
              <p style={{ fontSize: '.7rem', color: 'var(--muted)', margin: '0 2px 8px', lineHeight: 1.4, opacity: .75 }}>
                {ERA_DESC[era]}
              </p>
              {sims.map((sim: any) => (
                <SimCard key={sim.id} sim={sim} isActive={sim.id === simId}
                  accent={color} onClick={() => navigate(`/simulations/${sim.id}`)} />
              ))}
            </div>
          );
        })}

        {/* Research / Expert sims divider */}
        {researchSims.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 8px' }}>
              <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                Expert Simulations
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>
            <p style={{ fontSize: '.7rem', color: 'var(--muted)', margin: '0 2px 8px', lineHeight: 1.4, opacity: .75 }}>
              Full agent-based sims with domain-specific risk formulas and YOU character.
            </p>
            {researchSims.map((sim: any) => {
              const color = ERA_COLOR[sim.era as number] ?? 'var(--accent)';
              return (
                <SimCard key={sim.id} sim={sim} isActive={false} accent={color}
                  onClick={() => navigate(sim.path)} isExternal />
              );
            })}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 3.5rem)' }}>
      <MobileShelf
        main={
          activeSim
            ? <SimRunner key={simId} sim={activeSim} eraColor={ERA_COLOR[activeSimMeta?.era as number] ?? '#7a5ac8'} eraLabel={activeSimMeta ? ERA_LABEL[activeSimMeta.era as number] : undefined} />
            : <BlankCanvas />
        }
        shelf={shelfPanel}
        shelfTitle="Simulations"
        sidebarWidth={310}
      />
      <style>{`.sim-card:hover { border-color: var(--accent) !important; }`}</style>
    </div>
  );
}

// ── SimCard ───────────────────────────────────────────────────────────────────

function SimCard({ sim, isActive, accent, onClick, isExternal = false }: {
  sim: any; isActive: boolean; accent: string; onClick: () => void; isExternal?: boolean;
}) {
  return (
    <div onClick={onClick} className="sim-card"
      style={{
        marginBottom: 7, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', transition: 'all .15s',
        border: `1px solid ${isActive ? accent : 'var(--line)'}`,
        background: isActive ? `${accent}14` : 'var(--panel-b)',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3, gap: 8 }}>
        <span style={{ fontSize: '.86rem', fontWeight: 700, color: isActive ? accent : 'var(--text)', lineHeight: 1.2 }}>
          {sim.title}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
          {sim.status && (
            <span style={{ fontSize: '.58rem', color: accent, fontWeight: 600, whiteSpace: 'nowrap',
              padding: '1px 6px', borderRadius: 999, background: accent + '18', border: `1px solid ${accent}40` }}>
              {isExternal ? '↗ ' : ''}{sim.status}
            </span>
          )}
        </div>
      </div>
      <p style={{ fontSize: '.73rem', color: 'var(--muted)', margin: 0, lineHeight: 1.4 }}>
        {sim.description}
      </p>
    </div>
  );
}

// ── BlankCanvas ───────────────────────────────────────────────────────────────

function BlankCanvas() {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', background: '#060f16', padding: 32, textAlign: 'center',
    }}>
      <div style={{ marginBottom: 28, opacity: .2 }}>
        {/* Multi-era network icon */}
        <svg width={90} height={72} viewBox="0 0 90 72">
          {/* Era 3 — grid nodes */}
          <circle cx={12} cy={36} r={4} fill="#7a5ac8" />
          <circle cx={28} cy={22} r={4} fill="#7a5ac8" />
          <circle cx={28} cy={50} r={4} fill="#7a5ac8" />
          <line x1={12} y1={36} x2={28} y2={22} stroke="#7a5ac8" strokeWidth={1} />
          <line x1={12} y1={36} x2={28} y2={50} stroke="#7a5ac8" strokeWidth={1} />
          {/* Era 4 — network hub */}
          <circle cx={50} cy={36} r={6} fill="#c87832" />
          <circle cx={68} cy={18} r={3} fill="#c87832" />
          <circle cx={68} cy={36} r={3} fill="#c87832" />
          <circle cx={68} cy={54} r={3} fill="#c87832" />
          <line x1={50} y1={36} x2={68} y2={18} stroke="#c87832" strokeWidth={1} />
          <line x1={50} y1={36} x2={68} y2={36} stroke="#c87832" strokeWidth={1} />
          <line x1={50} y1={36} x2={68} y2={54} stroke="#c87832" strokeWidth={1} />
          <line x1={28} y1={22} x2={50} y2={36} stroke="#3a8fa8" strokeWidth={1} strokeDasharray="3,3" />
          <line x1={28} y1={50} x2={50} y2={36} stroke="#3a8fa8" strokeWidth={1} strokeDasharray="3,3" />
        </svg>
      </div>
      <h2 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: '1.25rem', color: 'var(--text)', margin: '0 0 10px', fontWeight: 600 }}>
        {simContent.blank_hint}
      </h2>
      <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.65, maxWidth: 360, margin: '0 0 24px' }}>
        {simContent.blank_sub}
      </p>
      {/* Era key */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {([3, 4, 5] as const).map(era => (
          <div key={era} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: ERA_COLOR[era] }} />
            <span style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{ERA_LABEL[era].split('—')[0].trim()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
