import { useState } from 'react';
import { Link } from 'react-router-dom';

// ── Tier definitions ──────────────────────────────────────────────────────────

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    priceSub: 'always free',
    accent: '#50c090',
    description: 'Embed complexity demonstration sims in your Markdown documents.',
    cta: 'Get Started',
    ctaHref: '#md-creator',
    features: [
      'isrd-sim Markdown syntax',
      'Era 3, 4 & 5 demo sim types',
      'Parameter and label configuration',
      'Copy-paste embed code generator',
      'Play/pause + 2–3 parameter sliders',
      'ISRD-hosted sim engine (no install)',
    ],
    note: 'Sims render in any Markdown viewer with the ISRD plugin. No account required.',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    priceSub: 'per month',
    accent: '#c87832',
    description: 'AI-configured custom sims embedded in AI-assisted Markdown documents.',
    cta: 'Join Waitlist',
    ctaHref: '#waitlist',
    badge: 'Coming Soon',
    features: [
      'Everything in Free',
      'AI dialogue → sim parameter mapping',
      'Domain labelling (map your system onto sim concepts)',
      'AI-assisted Markdown document writing',
      'Multiple sim types per document',
      'Scenario comparison across runs',
      'Export: .md file with embedded sims',
    ],
    note: 'The AI configures an existing demo sim class to match your domain — no new sim code generated.',
  },
  {
    id: 'expert',
    name: 'Expert',
    price: 'Contact us',
    priceSub: 'research & consultancy',
    accent: '#7a5ac8',
    description: 'Full agent-based custom sims with AI-constructed domain schemas. Standalone .html output plus auto-generated .md summary.',
    cta: 'Get in Touch',
    ctaHref: '/about',
    badge: 'In Development',
    features: [
      'Everything in Pro',
      'AI dialogue → full domain schema construction',
      'Agent-based simulation with 20+ custom risk factors',
      'YOU character — map yourself onto the simulation',
      'Outbreak / scenario presets',
      'Standalone .html export (zero dependencies)',
      'Auto-generated .md tldr embed version',
      'Session persistence and export/import',
      'Consultancy onboarding and model review',
    ],
    note: 'Designed for researchers, clinicians, policy analysts, and organisational consultants using systems science methods.',
  },
];

// ── Tool sections ─────────────────────────────────────────────────────────────

const TOOL_SECTIONS = [
  {
    id: 'md-creator',
    label: 'Free .md Sim Creator',
    icon: '{ }',
    status: 'Active' as const,
    statusColor: '#50c090',
    description: 'Generate isrd-sim Markdown code blocks. Pick a sim type, set parameters and labels, copy the embed code into your .md document.',
    items: [
      { name: 'Era 3 — Emergence / Flocking', desc: 'Boids model with custom agent count, separation, alignment, cohesion, and speed.', status: 'Active' as const },
      { name: 'Era 3 — Feedback Loops', desc: 'Reinforcing and balancing loop dynamics with configurable node values.', status: 'Active' as const },
      { name: 'Era 3 — Lorenz Attractor', desc: 'Chaos attractor with σ, ρ, β parameter configuration.', status: 'Active' as const },
      { name: 'Era 4 — Network Diffusion', desc: 'Small-world network SIR model with transmission, recovery, and rewiring parameters.', status: 'Active' as const },
      { name: 'Era 5 — Backroom Dynamics', desc: 'Dual-layer formal/informal network with configurable influence weighting.', status: 'Active' as const },
    ],
  },
  {
    id: 'html-creator',
    label: 'Expert .html Sim Creator',
    icon: '⟳',
    status: 'Coming Soon' as const,
    statusColor: '#7a5ac8',
    description: 'AI dialogue constructs a full domain-specific simulation from your description. Output is a self-contained .html file — email it, publish it, archive it.',
    items: [
      { name: 'AI Domain Intake', desc: 'Structured conversation: describe your system, the AI asks diagnostic questions, extracts agent properties and risk weights.', status: 'Coming Soon' as const },
      { name: 'Domain Schema Builder', desc: 'Visual schema preview — inspect and adjust what the AI constructed before running the sim.', status: 'Coming Soon' as const },
      { name: 'Standalone .html Export', desc: 'All sim logic, domain schema, and session data inlined. Zero external dependencies. Works offline.', status: 'Coming Soon' as const },
      { name: 'Auto .md tldr Generator', desc: 'Produces a demo-tier .md embed version of your full sim automatically.', status: 'Coming Soon' as const },
    ],
  },
  {
    id: 'sdk',
    label: 'Sim-Toolkit SDK',
    icon: '⬡',
    status: 'Active' as const,
    statusColor: '#50c090',
    description: 'The React/TypeScript library powering the ISRD simulation engine. Build custom sim labs using the same engine that runs this site.',
    items: [
      { name: 'useSystemicSimulation', desc: 'Core hook: manages attractor states, feedback graph, and simulation tick loop.', status: 'Active' as const },
      { name: 'FeedbackLoop', desc: 'Directed graph of SimNodes and SimEdges. Foundation for all lab simulations.', status: 'Active' as const },
      { name: 'AttractorBasin', desc: 'Models stable states. Computes basin classification, energy, and stability from a FeedbackGraph.', status: 'Active' as const },
      { name: 'DomainSchema interface', desc: 'TypeScript interface for AI-constructable simulation domains. The contract the AI dialogue produces.', status: 'Active' as const },
    ],
  },
];

const STATUS_COLOR: Record<string, string> = {
  'Active':      '#50c090',
  'Coming Soon': '#c87832',
  'Beta':        '#3a8fa8',
};

// ── Component ─────────────────────────────────────────────────────────────────

export function Tools() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div style={{ minHeight: 'calc(100vh - 3.5rem)', background: '#060f16' }}>

      {/* ── Hero ── */}
      <div style={{ borderBottom: '1px solid var(--line)', background: 'var(--panel)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 36px' }}>
          <div style={{ fontSize: '.68rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, fontWeight: 600 }}>
            ISRD · Tools
          </div>
          <h1 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 600, color: 'var(--text)', margin: '0 0 14px' }}>
            Build simulations from your domain knowledge
          </h1>
          <p style={{ fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.75, maxWidth: 640, margin: '0 0 28px' }}>
            Three steps: describe your system, let the AI ask diagnostic questions, run the simulation.
            The engine handles rendering, persistence, and export — you bring the domain knowledge.
          </p>

          {/* How it works */}
          <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap', marginBottom: 8 }}>
            {[
              { n: '1', label: 'Describe', desc: 'Explain your system and the problem it keeps producing.' },
              { n: '2', label: 'Dialogue', desc: 'The AI asks targeted questions and maps your domain onto a sim schema.' },
              { n: '3', label: 'Simulate', desc: 'Run your simulation. Adjust parameters. Discover leverage points.' },
            ].map((step, i) => (
              <div key={step.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 20px 12px 0', flex: '1 1 200px' }}>
                {i > 0 && <div style={{ width: 1, height: 40, background: 'var(--line)', marginRight: 20, alignSelf: 'center', display: 'none' }} />}
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(58,143,168,0.15)', border: '1px solid rgba(58,143,168,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
                  {step.n}
                </div>
                <div>
                  <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{step.label}</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.45 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Pricing tiers ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 0' }}>
        <div style={{ fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.15em', color: 'var(--muted)', fontWeight: 700, marginBottom: 20 }}>
          Tiers
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 48 }}>
          {TIERS.map(tier => (
            <div key={tier.id} style={{
              borderRadius: 14, border: `1px solid ${tier.accent}40`,
              background: `linear-gradient(160deg, ${tier.accent}08 0%, var(--panel) 60%)`,
              padding: '24px 22px', display: 'flex', flexDirection: 'column',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>{tier.name}</span>
                {tier.badge && (
                  <span style={{ fontSize: '.58rem', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase',
                    padding: '2px 8px', borderRadius: 999, background: tier.accent + '20', border: `1px solid ${tier.accent}50`, color: tier.accent }}>
                    {tier.badge}
                  </span>
                )}
              </div>

              {/* Price */}
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: tier.accent }}>{tier.price}</span>
                <span style={{ fontSize: '.76rem', color: 'var(--muted)', marginLeft: 6 }}>{tier.priceSub}</span>
              </div>

              <p style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.55, margin: '0 0 18px' }}>
                {tier.description}
              </p>

              {/* Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px', flex: 1 }}>
                {tier.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '.8rem', color: 'var(--muted)', marginBottom: 7, lineHeight: 1.4 }}>
                    <span style={{ color: tier.accent, flexShrink: 0, marginTop: 1 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <p style={{ fontSize: '.72rem', color: 'var(--muted)', fontStyle: 'italic', margin: '0 0 16px', lineHeight: 1.4, opacity: .75 }}>
                {tier.note}
              </p>

              {/* CTA */}
              <Link to={tier.ctaHref.startsWith('/') ? tier.ctaHref : '#'}
                onClick={tier.ctaHref.startsWith('#') ? (e) => { e.preventDefault(); const el = document.getElementById(tier.ctaHref.slice(1)); el?.scrollIntoView({ behavior: 'smooth' }); } : undefined}
                style={{
                  display: 'block', textAlign: 'center', padding: '9px 16px', borderRadius: 9,
                  background: tier.accent + '22', border: `1px solid ${tier.accent}60`, color: tier.accent,
                  fontSize: '.82rem', fontWeight: 700, textDecoration: 'none', transition: 'all .15s',
                }}>
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* ── Tool sections ── */}
        <div style={{ fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.15em', color: 'var(--muted)', fontWeight: 700, marginBottom: 20 }}>
          Tools & SDK
        </div>

        {TOOL_SECTIONS.map(section => (
          <div key={section.id} id={section.id} style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: '1rem', color: 'var(--accent2)', fontFamily: 'monospace' }}>{section.icon}</span>
              <h2 style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{section.label}</h2>
              <span style={{ fontSize: '.62rem', fontWeight: 600, color: section.statusColor }}>
                {section.status}
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>
            <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 14px', maxWidth: 680 }}>
              {section.description}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {section.items.map(item => (
                <div key={item.name} style={{
                  padding: '14px 16px', borderRadius: 10, border: '1px solid var(--line)',
                  background: 'var(--panel)', opacity: item.status === 'Coming Soon' ? 0.72 : 1,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 7 }}>
                    <span style={{ fontSize: '.88rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{item.name}</span>
                    <span style={{ fontSize: '.6rem', fontWeight: 600, color: STATUS_COLOR[item.status] ?? 'var(--muted)', flexShrink: 0 }}>
                      {item.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* ── Waitlist / Contact strip ── */}
        <div id="waitlist" style={{ margin: '40px 0 48px', padding: '28px 28px', borderRadius: 14, border: '1px solid rgba(58,143,168,0.25)', background: 'rgba(58,143,168,0.04)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ maxWidth: 560 }}>
              <h3 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: '1.1rem', color: 'var(--text)', margin: '0 0 8px', fontWeight: 600 }}>
                Building something with complex systems?
              </h3>
              <p style={{ fontSize: '.85rem', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                Pro and Expert tiers are in development. If you're a researcher, clinician, policy analyst, or consultant
                working with problems that resist standard analysis — get in touch. Early-access pricing and
                consultancy onboarding available.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <Link to="/simulations" style={{ padding: '10px 18px', borderRadius: 9, border: '1px solid var(--line)', background: 'var(--panel-b)', color: 'var(--text)', fontSize: '.84rem', fontWeight: 600, textDecoration: 'none' }}>
                View Simulations
              </Link>
              <Link to="/about" style={{ padding: '10px 18px', borderRadius: 9, border: '1px solid rgba(58,143,168,0.5)', background: 'rgba(58,143,168,0.1)', color: 'var(--accent)', fontSize: '.84rem', fontWeight: 700, textDecoration: 'none' }}>
                Contact ISRD →
              </Link>
            </div>
          </div>
        </div>

        {/* ── Era context strip ── */}
        <div style={{ marginBottom: 48, padding: '22px 24px', borderRadius: 12, background: 'var(--panel)', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--muted)', fontWeight: 700, marginBottom: 14 }}>
            What we mean by Era
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {[
              { era: 3, color: '#7a5ac8', label: 'Era 3 — Complexity & Chaos', desc: 'Agent behaviour, attractor dynamics, sensitive dependence on initial conditions. Lorenz, emergence, feedback.' },
              { era: 4, color: '#c87832', label: 'Era 4 — Networked Complexity', desc: 'Network topology determines outcomes. Small-world graphs, hub dynamics, cascade propagation.' },
              { era: 5, color: '#3a8fa8', label: 'Era 5 — Entanglement', desc: 'Formal and informal networks co-determine behaviour. The relevant network is often invisible to the model.' },
            ].map(e => (
              <div key={e.era} style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 3, background: e.color, borderRadius: 3, flexShrink: 0, minHeight: 24 }} />
                <div>
                  <div style={{ fontSize: '.78rem', fontWeight: 700, color: e.color, marginBottom: 4 }}>{e.label}</div>
                  <div style={{ fontSize: '.76rem', color: 'var(--muted)', lineHeight: 1.5 }}>{e.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, fontSize: '.76rem', color: 'var(--muted)', lineHeight: 1.6 }}>
            Read the full history in{' '}
            <Link to="/articles/systems-science-eras" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
              The Four Eras of Systems Science →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
