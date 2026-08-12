import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-canvas">
      {/* Atmospheric Glow Background */}
      <div 
        className="absolute w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" 
        style={{ background: 'radial-gradient(circle, rgba(94, 106, 210, 0.15) 0%, rgba(0, 0, 0, 0) 70%)' }}
      />
      <div className="relative z-10 w-full max-w-[420px] p-10 bg-surface-1 border border-solid border-hairline rounded-xl shadow-[0px_4px_24px_rgba(0,0,0,0.4)]">
        {children}
      </div>
    </div>
  );
}
