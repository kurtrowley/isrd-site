import { Link } from 'react-router-dom';
import labsData from '../content/labs.json';

const apiDocs = (labsData.labs.find(l => l.id === 'academy') as any)?.api_docs ?? [];

const TOOL_CATEGORIES = [
  {
    id: 'software',
    label: 'Software',
    icon: '⬡',
    description: 'Open-source simulation tools, libraries, and utilities built on the ISRD Sim-Toolkit.',
    items: [
      { name: 'Sim-Toolkit SDK', desc: 'The core React/TypeScript library for building systemic simulations. FeedbackLoop, AttractorBasin, and useSystemicSimulation hook.', status: 'Active' },
      { name: 'LabConfig Registry', desc: 'Drop-in configuration format for spinning up new simulation labs without writing engine code.', status: 'Active' },
    ],
    api: apiDocs,
  },
  {
    id: 'ai-prompts',
    label: 'AI Prompts',
    icon: '⟳',
    description: 'Structured prompt libraries for using AI tools in systemic research, writing, and simulation analysis.',
    items: [
      { name: 'Systemic Analysis Prompt Pack', desc: 'Prompts for identifying feedback loops, attractor states, and leverage points in any domain.', status: 'Coming Soon' },
      { name: 'Simulation Interpretation Kit', desc: 'AI prompt sequences for extracting hypotheses and research insights from simulation run data.', status: 'Coming Soon' },
      { name: 'Reader-First Writing Prompts', desc: 'Prompt sequences applying systemic synthesis to narrative structure and manuscript critique.', status: 'Coming Soon' },
    ],
  },
  {
    id: 'templates',
    label: 'Templates & Frameworks',
    icon: '◈',
    description: 'Reusable frameworks and templates for systemic research, writing, and modelling projects.',
    items: [
      { name: 'Research Program Template', desc: 'Standard structure for setting up a new ISRD-style research program with simulation, publications, and AI integration hooks.', status: 'Coming Soon' },
      { name: 'Systemic Writing Canvas', desc: 'A working canvas for applying the Reader-First framework to long-form writing projects.', status: 'Coming Soon' },
    ],
  },
];

const STATUS_COLOR: Record<string, string> = {
  'Active':      '#50c090',
  'Coming Soon': '#c87832',
  'Beta':        '#3a8fa8',
};

export function Tools() {
  return (
    <div style={{ minHeight: 'calc(100vh - 3.5rem)', background: '#060f16' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--line)', background: 'var(--panel)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 32px' }}>
          <div style={{ fontSize: '.68rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, fontWeight: 600 }}>
            ISRD · Tools
          </div>
          <h1 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 600, color: 'var(--text)', margin: '0 0 14px' }}>
            Tools
          </h1>
          <p style={{ fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 640, margin: '0 0 16px' }}>
            Software, AI prompt libraries, and frameworks built around the ISRD Systemic Synthesis methodology. Everything here is designed to lower the barrier to building, analysing, and communicating complex system models.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'rgba(58,143,168,0.05)', fontSize: '.8rem', color: 'var(--muted)', fontStyle: 'italic' }}>
            🔧 This section is actively being built. Check back for releases, or <Link to="/about" style={{ color: 'var(--accent)', marginLeft: 4 }}>get in touch</Link> to access early builds.
          </div>
        </div>
      </div>

      {/* Tool categories */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        {TOOL_CATEGORIES.map(cat => (
          <div key={cat.id} style={{ marginBottom: 44 }}>
            {/* Category header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <span style={{ fontSize: '1.1rem', color: 'var(--accent2)' }}>{cat.icon}</span>
              <h2 style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{cat.label}</h2>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>
            <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 16px', maxWidth: 680 }}>
              {cat.description}
            </p>

            {/* Tool cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: (cat as any).api?.length ? 20 : 0 }}>
              {cat.items.map(item => (
                <div key={item.name} style={{ padding: '16px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--panel)', opacity: item.status === 'Coming Soon' ? 0.75 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{item.name}</span>
                    <span style={{ fontSize: '.62rem', fontWeight: 600, color: STATUS_COLOR[item.status] ?? 'var(--muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                      {item.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Sim-Toolkit API reference (Software section only) */}
            {(cat as any).api?.length > 0 && (
              <div>
                <div style={{ fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', fontWeight: 700, margin: '4px 0 12px' }}>
                  API Reference
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(cat as any).api.map((api: any) => (
                    <div key={api.name} style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--panel-b)' }}>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '.78rem', color: 'var(--accent2)', marginBottom: 5 }}>{api.sig}</div>
                      <p style={{ fontSize: '.78rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>{api.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
