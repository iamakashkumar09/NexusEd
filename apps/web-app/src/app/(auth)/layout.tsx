import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--canvas)', fontFamily: 'var(--font-sans)' }}>

      {/* ── Left Brand Panel ─────────────────────────────────────────────── */}
      <div style={{
        width: '45%', flexShrink: 0, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #060612 0%, #0a0b1e 50%, #050510 100%)',
        borderRight: '1px solid var(--hairline)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 56px',
      }} className="dot-grid">

        {/* Ambient glows */}
        <div style={{ position: 'absolute', top: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(94,106,210,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 100, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(130,143,255,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #5e6ad2 0%, #828fff 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(94,106,210,0.4)',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
                <line x1="12" y1="2" x2="12" y2="22"/>
                <line x1="2" y1="8.5" x2="22" y2="8.5"/>
              </svg>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.05em' }}>NexusEd</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, color: '#fff', marginBottom: 16, maxWidth: 360 }}>
            The next-gen<br />
            <span style={{ background: 'linear-gradient(90deg, #828fff, #5e6ad2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              learning platform
            </span>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(196,202,212,0.7)', lineHeight: 1.65, maxWidth: 320 }}>
            AI-powered courses, expert instructors, and a community built for serious learners.
          </p>
        </div>

        {/* Feature bullets */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { icon: '⚡', title: 'AI-Personalized', desc: 'Curriculum adapts to your learning speed' },
            { icon: '🎓', title: 'Expert Instructors', desc: 'Taught by industry leaders & practitioners' },
            { icon: '🏆', title: 'Verified Certificates', desc: 'Recognized by top companies worldwide' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(94,106,210,0.15)', border: '1px solid rgba(94,106,210,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 1 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-subtle)' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom social proof */}
        <div style={{ position: 'relative', borderTop: '1px solid var(--hairline)', paddingTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex' }}>
            {['#5e6ad2','#4ade80','#fbbf24','#f87171'].map((c,i) => (
              <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: '2px solid var(--canvas)', marginLeft: i > 0 ? -8 : 0 }} />
            ))}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Join 50,000+ learners</div>
            <div style={{ fontSize: 11, color: 'var(--ink-subtle)' }}>Building skills for tomorrow</div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle background glow */}
        <div style={{ position: 'absolute', top: '30%', left: '30%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(94,106,210,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ width: '100%', maxWidth: 420, position: 'relative' }} className="animate-fadeUp">
          {children}
        </div>
      </div>
    </div>
  );
}
