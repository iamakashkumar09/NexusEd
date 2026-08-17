'use client';

import React from 'react';

export default function MessagesPage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.04em', marginBottom: 6 }}>
          Messages
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-subtle)' }}>
          Communicate with your students and instructors.
        </p>
      </div>

      {/* Coming soon card */}
      <div style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--hairline)',
        borderRadius: 16,
        padding: 48,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        minHeight: 320,
        textAlign: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: 'rgba(94,106,210,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Messages Coming Soon</div>
          <div style={{ fontSize: 14, color: 'var(--ink-subtle)', maxWidth: 420, lineHeight: 1.6 }}>
            Real-time messaging between students and instructors will be available here soon. Stay connected with your learning community.
          </div>
        </div>
        <div style={{
          padding: '6px 16px', borderRadius: 999,
          background: 'rgba(94,106,210,0.1)',
          color: 'var(--primary)', fontSize: 12, fontWeight: 700,
          letterSpacing: '0.04em',
        }}>
          COMING SOON
        </div>
      </div>
    </div>
  );
}
