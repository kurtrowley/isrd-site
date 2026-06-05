import { Routes, Route } from 'react-router-dom';
import { GlobalNav } from './components/GlobalNav';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Publications } from './pages/Publications';
import { ArticleViewer } from './pages/ArticleViewer';
import { MediaViewer } from './pages/MediaViewer';
import { Simulations } from './pages/Simulations';
import { Research } from './pages/Research';
import { ResearchProgram } from './pages/ResearchProgram';
import { BioSystemicsLab } from './labs/Lab3BioSystemics';
import { LiterarySysLab } from './labs/Lab4Literary';
import { GlobalFuturismLab } from './labs/Lab5GlobalFuturism';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <GlobalNav />
      <Routes>
        <Route path="/"                         element={<Home />} />
        <Route path="/about"                    element={<About />} />

        {/* Publications hub + individual viewers */}
        <Route path="/publications"             element={<Publications />} />
        <Route path="/articles"                 element={<Publications />} />
        <Route path="/articles/:slug"           element={<ArticleViewer />} />
        <Route path="/media"                    element={<Publications />} />
        <Route path="/media/:slug"              element={<MediaViewer />} />

        {/* Simulations */}
        <Route path="/simulations"              element={<Simulations />} />
        <Route path="/simulations/:simId"       element={<Simulations />} />

        {/* Research */}
        <Route path="/research"                 element={<Research />} />
        <Route path="/research/:programId"      element={<ResearchProgram />} />

        {/* Simulators */}
        <Route path="/lab/bio-systemics"        element={<BioSystemicsLab />} />
        <Route path="/lab/literary-systemics"   element={<LiterarySysLab />} />
        <Route path="/lab/global-futurism"      element={<GlobalFuturismLab />} />

        {/* Legacy redirects */}
        <Route path="/lab/foundations"          element={<Publications />} />

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
