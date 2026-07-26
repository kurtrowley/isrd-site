import { Routes, Route, Navigate } from 'react-router-dom';
import { GlobalNav } from './components/GlobalNav';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Publications } from './pages/Publications';
import { ArticleViewer } from './pages/ArticleViewer';
import { ReportViewer } from './pages/ReportViewer';
import { MediaViewer } from './pages/MediaViewer';
import { CourseCatalog } from './pages/CourseCatalog';
import { CourseViewer } from './pages/CourseViewer';
import { Simulations } from './pages/Simulations';
import { Research } from './pages/Research';
import { ResearchProgram } from './pages/ResearchProgram';

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
        <Route path="/publications/reports/:slug" element={<ReportViewer />} />
        <Route path="/media"                    element={<Publications />} />
        <Route path="/media/:slug"              element={<MediaViewer />} />

        {/* Courses */}
        <Route path="/courses"                  element={<CourseCatalog />} />
        <Route path="/courses/:slug"            element={<CourseViewer />} />

        {/* Simulations */}
        <Route path="/simulations"              element={<Simulations />} />
        <Route path="/simulations/:simId"       element={<Simulations />} />

        {/* Research */}
        <Route path="/research"                 element={<Research />} />
        <Route path="/research/:programId"      element={<ResearchProgram />} />

        {/* Legacy redirects — the old "Labs" section merged into Research */}
        <Route path="/lab/*"                    element={<Navigate to="/research" replace />} />

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
