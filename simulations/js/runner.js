// Boots one simulation page: loads the sim module named in data-sim, builds its controls from sim.params,
// and runs it on the shared SimEngine. Every sim implements { params, init, step, draw, resize, setParam, stats }.
import { SimEngine } from './engine.js';

const MODULES = {
  boids: ['./sims/boids.js', 'BoidsSim'],
  feedback: ['./sims/feedback.js', 'FeedbackSim'],
  lorenz: ['./sims/lorenz.js', 'LorenzSim'],
  'era4-network': ['./sims/era4-network.js', 'Era4NetworkSim'],
  'era5-entanglement': ['./sims/era5-entanglement.js', 'Era5EntanglementSim'],
  'regulatory-capture': ['./sims/regulatory-capture.js', 'RegulatoryCaptureSim'],
};

const root = document.getElementById('sim-app');
const id = root.dataset.sim;
const el = (tag, attrs = {}, kids = []) => {
  const n = Object.assign(document.createElement(tag), attrs);
  kids.forEach((k) => n.append(k));
  return n;
};

async function boot() {
  const [path, exportName] = MODULES[id];
  const sim = (await import(path))[exportName];
  const stage = el('div', { className: 'simstage' }, [el('canvas', { id: 'simCanvas', 'aria-label': sim.label + ' simulation' })]);
  const stats = el('div', { className: 'simstats', role: 'status' });
  const playBtn = el('button', { className: 'btn primary', type: 'button', textContent: 'Pause' });
  const resetBtn = el('button', { className: 'btn ghost', type: 'button', textContent: 'Reset' });
  const sliders = el('div', { className: 'simparams' });
  root.replaceChildren(stats, stage, el('div', { className: 'simbar' }, [playBtn, resetBtn]), sliders);

  const engine = new SimEngine('simCanvas');
  engine.register(id, sim);
  engine.onStats((s) => {
    stats.replaceChildren(...Object.entries(s).map(([k, v]) => el('span', { className: 'chip', textContent: `${k}: ${v}` })));
  });

  const inputs = {};
  for (const [key, p] of Object.entries(sim.params || {})) {
    const out = el('output', { textContent: String(p.default) });
    const input = el('input', { type: 'range', min: p.min, max: p.max, step: p.step, value: p.default, id: 'p-' + key });
    input.addEventListener('input', () => { out.textContent = input.value; engine.setParam(key, +input.value); });
    inputs[key] = { input, out, p };
    sliders.append(el('label', { htmlFor: 'p-' + key }, [el('span', { textContent: p.label }), out, input]));
  }

  engine.load(id);
  playBtn.onclick = () => {
    if (engine.isRunning) { engine.pause(); playBtn.textContent = 'Play'; } else { engine.play(); playBtn.textContent = 'Pause'; }
  };
  resetBtn.onclick = () => {
    for (const { input, out, p } of Object.values(inputs)) { input.value = p.default; out.textContent = String(p.default); }
    engine.reset(); playBtn.textContent = 'Pause';
  };
}

boot().catch((err) => {
  root.replaceChildren(el('p', { className: 'muted', textContent: 'This simulation could not start in your browser.' }));
  console.error(err);
});
