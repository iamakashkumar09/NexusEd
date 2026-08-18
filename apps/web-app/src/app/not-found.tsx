'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas p-6 overflow-hidden relative font-sans">
      {/* Ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(94,106,210,0.08)_0%,transparent_60%)] pointer-events-none" />
      
      <div className="relative z-10 text-center max-w-md w-full animate-fade-up">
        {/* Error Code */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-surface-1 border border-hairline-strong flex items-center justify-center shadow-[0_0_24px_rgba(94,106,210,0.15)] relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
             <span className="text-2xl font-extrabold text-primary relative z-10">404</span>
          </div>
        </div>

        {/* Messaging */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
          Page not found
        </h1>
        <p className="text-[15px] text-ink-muted leading-relaxed mb-8">
          The page you are looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary text-white text-[14px] font-bold shadow-glow hover:bg-primary-light hover:-translate-y-[1px] transition-all"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-surface-2 border border-hairline text-ink text-[14px] font-bold hover:bg-surface-3 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
