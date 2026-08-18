import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-canvas font-sans selection:bg-primary-bg selection:text-ink">
      
      {/* ── Left Brand Panel ─────────────────────────────────────────────── */}
      <div className="hidden md:flex w-[45%] shrink-0 relative overflow-hidden bg-gradient-to-br from-[#060612] via-[#0a0b1e] to-[#050510] border-r border-hairline flex-col justify-between px-14 py-12 dot-grid">
        
        {/* Ambient glows */}
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(94,106,210,0.18)_0%,transparent_65%)] pointer-events-none" />
        <div className="absolute bottom-[100px] -right-[60px] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(130,143,255,0.1)_0%,transparent_65%)] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-glow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
                <line x1="12" y1="2" x2="12" y2="22"/>
                <line x1="2" y1="8.5" x2="22" y2="8.5"/>
              </svg>
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">NexusEd</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-white mb-4 max-w-[360px]">
            The next-gen<br />
            <span className="bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
              learning platform
            </span>
          </h1>
          <p className="text-[15px] text-ink-muted/80 leading-relaxed max-w-[320px]">
            AI-powered courses, expert instructors, and a community built for serious learners.
          </p>
        </div>

        {/* Feature bullets */}
        <div className="relative z-10 flex flex-col gap-4">
          {[
            { icon: '⚡', title: 'AI-Personalized', desc: 'Curriculum adapts to your learning speed' },
            { icon: '🎓', title: 'Expert Instructors', desc: 'Taught by industry leaders & practitioners' },
            { icon: '🏆', title: 'Verified Certificates', desc: 'Recognized by top companies worldwide' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-base shrink-0">
                {f.icon}
              </div>
              <div>
                <div className="text-[13px] font-bold text-white mb-[1px]">{f.title}</div>
                <div className="text-xs text-ink-subtle">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom social proof */}
        <div className="relative z-10 border-t border-hairline pt-6 flex items-center gap-3">
          <div className="flex">
            {['#5e6ad2','#4ade80','#fbbf24','#f87171'].map((c,i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-canvas" style={{ background: c, marginLeft: i > 0 ? -8 : 0 }} />
            ))}
          </div>
          <div>
            <div className="text-[13px] font-bold text-ink">Join 50,000+ learners</div>
            <div className="text-[11px] text-ink-subtle">Building skills for tomorrow</div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-[30%] left-[30%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(94,106,210,0.04)_0%,transparent_70%)] pointer-events-none" />
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="absolute top-6 left-6 md:hidden flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-glow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
                <line x1="12" y1="2" x2="12" y2="22"/>
                <line x1="2" y1="8.5" x2="22" y2="8.5"/>
              </svg>
            </div>
            <span className="text-lg font-extrabold text-white tracking-tight">NexusEd</span>
        </div>

        <div className="w-full max-w-[420px] relative z-10 animate-fade-up">
          {children}
        </div>
      </div>
    </div>
  );
}
