import { useParams, useNavigate, Link } from 'react-router-dom';
import { MobileShelf } from '../components/MobileShelf';
import { SimRunner } from '../labs/Lab1Foundations/SimRunner';
import { useBioSystemicsSim, BIO_SYSTEMICS_ACCENT } from '../labs/Lab3BioSystemics';

// Era 3 — existing demo sims
import { BoidsSim }    from '../labs/Lab1Foundations/sims/boids';
import { FeedbackSim } from '../labs/Lab1Foundations/sims/feedback';
import { LorenzSim }   from '../labs/Lab1Foundations/sims/lorenz';

// Era 4 + Era 5 — new demo sims
import { Era4NetworkSim }      from '../sims/era4-network';
import { Era5EntanglementSim } from '../sims/era5-entanglement';
import { RegulatoryCaptureSim } from '../sims/regulatory-capture';

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
// Maps sim id → Sim implementation. The Post-Viral Syndrome Outbreak sim doesn't
// implement the generic Sim interface (it's a custom agent-based React component
// with its own sidebar), so it's special-cased below rather than added here.

const SIM_MAP: Record<string, Sim> = {
  boids:            BoidsSim,
  feedback:         FeedbackSim,
  lorenz:           LorenzSim,
  'era4-network':   Era4NetworkSim    as unknown as Sim,
  'era5-entanglement': Era5EntanglementSim as unknown as Sim,
  'regulatory-capture': RegulatoryCaptureSim,
};

// Clusters consecutive sims sharing a `collection` tag under one sub-heading
// (e.g. the two RPND demos), leaving ungrouped sims as standalone entries.
type SimBlock =
  | { type: 'single'; sim: any }
  | { type: 'group'; label: string; sims: any[] };

function groupSims(sims: any[]): SimBlock[] {
  const blocks: SimBlock[] = [];
  for (const sim of sims) {
    if (sim.collection) {
      const last = blocks[blocks.length - 1];
      if (last && last.type === 'group' && last.label === sim.collectionLabel) {
        last.sims.push(sim);
      } else {
        blocks.push({ type: 'group', label: sim.collectionLabel ?? sim.collection, sims: [sim] });
      }
    } else {
      blocks.push({ type: 'single', sim });
    }
  }
  return blocks;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Simulations() {
  const { simId } = useParams<{ simId?: string }>();
  const navigate  = useNavigate();

  const isPostviral   = simId === 'postviral';
  const activeSim     = simId ? SIM_MAP[simId] ?? null : null;
  const activeSimMeta = simContent.simulations.find((s: any) => s.id === simId) ?? null;
  // A sim can be listed (discoverable, tagged with an era/collection) before its
  // Sim implementation exists — shown as "in development" rather than a broken canvas.
  const isPending = !!activeSimMeta && !activeSim && !isPostviral;

  // Always called (rules of hooks) — its main/shelf are only rendered below when
  // postviral is actually selected. Kept unnested from the outer MobileShelf so
  // the sim only mounts twice (desktop/mobile), the same as every other sim here,
  // instead of quadrupling from a MobileShelf nested inside a MobileShelf.
  const bioSim = useBioSystemicsSim();

  // Group all sims by era for the sidebar — same hierarchy for every entry
  const demoSims = simContent.simulations;

  const eras = [3, 4, 5] as const;
  const simsByEra: Record<number, typeof demoSims> = {};
  for (const era of eras) {
    simsByEra[era] = demoSims.filter((s: any) => s.era === era);
  }

  const simPickerPanel = (
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
              {groupSims(sims).map(block =>
                block.type === 'group' ? (
                  <div key={block.label} style={{
                    marginBottom: 10, padding: '8px 8px 2px', borderRadius: 10,
                    border: `1px solid ${color}25`, background: `${color}06`,
                  }}>
                    <div style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color, margin: '0 2px 6px' }}>
                      {block.label}
                    </div>
                    {block.sims.map(sim => (
                      <SimCard key={sim.id} sim={sim} isActive={sim.id === simId}
                        accent={color} onClick={() => navigate(`/simulations/${sim.id}`)} />
                    ))}
                  </div>
                ) : (
                  <SimCard key={block.sim.id} sim={block.sim} isActive={block.sim.id === simId}
                    accent={color} onClick={() => navigate(`/simulations/${block.sim.id}`)} />
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // While Post-Viral Syndrome Outbreak is active, its own Status/Settings/About
  // controls replace the sim-picker list in the sidebar (it needs the room) —
  // a back link keeps the other sims reachable without leaving this pane.
  const postviralShelf = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
        <Link to="/simulations" style={{ fontSize: '.76rem', color: 'var(--accent)', textDecoration: 'none' }}>
          ← All Simulations
        </Link>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {bioSim.shelf}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 3.5rem)' }}>
      <MobileShelf
        main={
          isPostviral
            ? bioSim.main
            : activeSim
              ? <SimRunner key={simId} sim={activeSim} eraColor={ERA_COLOR[activeSimMeta?.era as number] ?? '#7a5ac8'} eraLabel={activeSimMeta ? ERA_LABEL[activeSimMeta.era as number] : undefined} />
              : isPending
                ? <ComingSoon sim={activeSimMeta} accent={ERA_COLOR[activeSimMeta?.era as number] ?? '#7a5ac8'} />
                : <BlankCanvas />
        }
        shelf={isPostviral ? postviralShelf : simPickerPanel}
        shelfTitle="Simulations"
        sidebarWidth={310}
        accent={isPostviral ? BIO_SYSTEMICS_ACCENT : undefined}
        shelfOpen={isPostviral ? bioSim.shelfOpen : undefined}
        onShelfChange={isPostviral ? bioSim.onShelfChange : undefined}
      />
      <style>{`.sim-card:hover { border-color: var(--accent) !important; }`}</style>
    </div>
  );
}

// ── SimCard ───────────────────────────────────────────────────────────────────

function SimCard({ sim, isActive, accent, onClick }: {
  sim: any; isActive: boolean; accent: string; onClick: () => void;
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
              {sim.status}
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

// ── ComingSoon ────────────────────────────────────────────────────────────────

function ComingSoon({ sim, accent }: { sim: any; accent: string }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', background: '#060f16', padding: 32, textAlign: 'center',
    }}>
      <span style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
        padding: '3px 10px', borderRadius: 999, background: `${accent}18`, border: `1px solid ${accent}40`, color: accent, marginBottom: 16 }}>
        {sim?.status ?? 'In Development'}
      </span>
      <h2 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: '1.25rem', color: 'var(--text)', margin: '0 0 10px', fontWeight: 600 }}>
        {sim?.title}
      </h2>
      <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.65, maxWidth: 420, margin: 0 }}>
        {sim?.description}
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
