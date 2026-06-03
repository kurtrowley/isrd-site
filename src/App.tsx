import { Routes, Route } from 'react-router-dom';
import { GlobalNav } from './components/GlobalNav';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Articles } from './pages/Articles';
import { Simulations } from './pages/Simulations';
import { AcademyLab } from './labs/Lab2Academy';
import { BioSystemicsLab } from './labs/Lab3BioSystemics';
import { LiterarySysLab } from './labs/Lab4Literary';
import { GlobalFuturismLab } from './labs/Lab5GlobalFuturism';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <GlobalNav />
      <Routes>
        {/* Top-level */}
        <Route path="/"                       element={<Home />} />
        <Route path="/about"                  element={<About />} />
        <Route path="/articles"               element={<Articles />} />

        {/* Simulations — blank or with active sim */}
        <Route path="/simulations"            element={<Simulations />} />
        <Route path="/simulations/:simId"     element={<Simulations />} />

        {/* Core (top nav) */}
        <Route path="/lab/academy"            element={<AcademyLab />} />

        {/* Labs */}
        <Route path="/lab/bio-systemics"      element={<BioSystemicsLab />} />
        <Route path="/lab/literary-systemics" element={<LiterarySysLab />} />
        <Route path="/lab/global-futurism"    element={<GlobalFuturismLab />} />

        {/* Legacy redirects */}
        <Route path="/lab/foundations"        element={<Articles />} />
        <Route path="/lab/foundry"            element={<AcademyLab />} />

        <Route path="*" element={
          <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--muted)' }}>
            <h2 style={{ color: 'var(--text)' }}>404 — Page not found</h2>
            <a href="#/" style={{ color: 'var(--accent)' }}>Return to ISRD</a>
          </div>
        } />
      </Routes>
    </div>
  );
}
