import { Link } from 'react-router-dom';
import coursesData from '../content/courses.json';

const STATUS_COLOR: Record<string, string> = {
  'In Design': '#3a8fa8',
  'Planned':   '#c87832',
  'Available': '#50c090',
  'Beta':      '#7a5ac8',
};

const LEVEL_COLOR: Record<string, string> = {
  'Beginner':     '#50c090',
  'Intermediate': '#c87832',
  'Advanced':     '#7a5ac8',
};

const TRACK_COLORS: Record<string, string> = {
  foundations:   '#d4a847',
  'learner-first':'#3a8fa8',
  'bio-systemics':'#3a6fa8',
};

export function CourseCatalog() {
  const { catalog, tracks, courses } = coursesData;

  return (
    <div style={{ minHeight: 'calc(100vh - 3.5rem)', background: '#060f16' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--line)', background: 'var(--panel)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 32px' }}>
          <div style={{ fontSize: '.68rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, fontWeight: 600 }}>
            {catalog.eyebrow}
          </div>
          <h1 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 600, color: 'var(--text)', margin: '0 0 14px' }}>
            {catalog.title}
          </h1>
          <p style={{ fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 680, margin: '0 0 18px' }}>
            {catalog.intro}
          </p>
          {/* Framework callout */}
          <div style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(58,143,168,0.25)', background: 'rgba(58,143,168,0.06)', maxWidth: 680 }}>
            <span style={{ fontSize: '.8rem', color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}>◈</span>
            <div>
              <p style={{ fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.5, margin: '0 0 5px' }}>{catalog.approach_note}</p>
              <Link to="/articles/learner-first-systemic-learning" style={{ fontSize: '.78rem', color: 'var(--accent)', textDecoration: 'none' }}>
                Read: Learner-First Systemic Education →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

        {/* Track legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 36 }}>
          {tracks.map(track => (
            <div key={track.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, border: `1px solid ${track.color}35`, background: `${track.color}10` }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: track.color, flexShrink: 0 }} />
              <span style={{ fontSize: '.72rem', fontWeight: 700, color: track.color }}>{track.label}</span>
              <span style={{ fontSize: '.68rem', color: 'var(--muted)' }}>— {track.description}</span>
            </div>
          ))}
        </div>

        {/* Course cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {courses.map(course => {
            const trackColor = TRACK_COLORS[course.track] ?? 'var(--accent)';
            const isActive = course.status === 'Available' || course.status === 'Beta' || course.status === 'In Design';
            return (
              <div key={course.id}
                style={{ padding: '24px 28px', borderRadius: 14, border: `1px solid ${isActive ? trackColor + '40' : 'var(--line)'}`, background: isActive ? `${trackColor}08` : 'var(--panel)', opacity: course.status === 'Planned' ? 0.8 : 1 }}>

                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: trackColor }}>
                      {course.track_label}
                    </span>
                    <span style={{ fontSize: '.72rem', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>{course.code}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: '.65rem', fontWeight: 600, color: LEVEL_COLOR[course.level] ?? 'var(--muted)' }}>{course.level}</span>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--line)' }} />
                    <span style={{ fontSize: '.65rem', color: STATUS_COLOR[course.status] ?? 'var(--muted)', fontWeight: 600 }}>{course.status}</span>
                  </div>
                </div>

                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 5px' }}>{course.title}</h2>
                <p style={{ fontSize: '.85rem', color: 'var(--muted)', fontStyle: 'italic', margin: '0 0 12px', lineHeight: 1.4 }}>{course.subtitle}</p>
                <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.65, margin: '0 0 16px', maxWidth: 780 }}>{course.description}</p>

                {/* Meta */}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16, fontSize: '.78rem', color: 'var(--muted)' }}>
                  <span>📚 {course.modules} modules</span>
                  <span>⏱ ~{course.estimated_hours} hours</span>
                </div>

                {/* Module preview (for active courses) */}
                {(course as any).modules_preview && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', fontWeight: 700, marginBottom: 10 }}>
                      Module Outline
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
                      {(course as any).modules_preview.map((mod: any) => (
                        <div key={mod.n} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--panel-b)', display: 'flex', gap: 10 }}>
                          <span style={{ fontSize: '.72rem', fontWeight: 700, color: trackColor, flexShrink: 0, minWidth: 20 }}>{mod.n}.</span>
                          <div>
                            <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{mod.title}</div>
                            <div style={{ fontSize: '.73rem', color: 'var(--muted)', lineHeight: 1.4 }}>{mod.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags + article link */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {course.tags.map(tag => (
                      <span key={tag} style={{ fontSize: '.62rem', padding: '2px 8px', borderRadius: 999, background: `${trackColor}15`, border: `1px solid ${trackColor}30`, color: trackColor }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  {course.article_link && (
                    <Link to={course.article_link} style={{ fontSize: '.78rem', color: 'var(--accent2)', textDecoration: 'none' }}>
                      Read the framework article →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Coming soon note */}
        <div style={{ marginTop: 40, padding: '20px 24px', borderRadius: 12, border: '1px dashed var(--line)', background: 'rgba(255,255,255,0.01)', fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.65 }}>
          <strong style={{ color: 'var(--text)' }}>Building the curriculum.</strong> Courses marked <em>In Design</em> are actively being developed using the Learner-First Systemic Education framework. Courses marked <em>Planned</em> have defined outlines and will be developed as the framework and tooling mature. Each course will include interactive simulations, AI-facilitated exercises, and transfer challenges — not just content delivery.
        </div>
      </div>
    </div>
  );
}
