'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RegisterRequest } from '@nexus-ed/shared-types';

function Field({ label, children, half }: { label: string; children: React.ReactNode; half?: boolean }) {
  return (
    <div style={{ marginBottom: 14, flex: half ? 1 : undefined }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function PremiumInput({ type, placeholder, value, onChange, name }: {
  type: string; placeholder: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; name: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} name={name} placeholder={placeholder} value={value}
      onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      required
      style={{
        width: '100%', padding: '11px 14px',
        background: 'var(--surface-2)',
        border: `1px solid ${focused ? 'var(--primary)' : 'var(--hairline-strong)'}`,
        borderRadius: 'var(--r-md)',
        color: 'var(--ink)', fontSize: 14, outline: 'none',
        boxSizing: 'border-box',
        boxShadow: focused ? 'var(--shadow-glow)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    />
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterRequest>({ email: '', password: '', firstName: '', lastName: '', role: 'STUDENT' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Registration failed');
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 6 }}>
          Create your account
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-subtle)' }}>
          Join NexusEd — free forever for students
        </p>
      </div>

      {error && (
        <div style={{
          padding: '10px 14px', borderRadius: 'var(--r-md)',
          background: 'var(--error-bg)', border: '1px solid rgba(248,113,113,0.25)',
          color: 'var(--error)', fontSize: 13, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* Role selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {([
          { role: 'STUDENT', label: 'Student', icon: '🎓', desc: 'Learn from experts' },
          { role: 'INSTRUCTOR', label: 'Instructor', icon: '📡', desc: 'Share your knowledge' },
        ] as const).map(({ role, label, icon, desc }) => {
          const active = formData.role === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role }))}
              style={{
                padding: '14px 12px', borderRadius: 'var(--r-md)', cursor: 'pointer',
                background: active ? 'rgba(94,106,210,0.12)' : 'var(--surface-2)',
                border: `1.5px solid ${active ? 'var(--primary)' : 'var(--hairline-strong)'}`,
                textAlign: 'left', transition: 'all 0.15s',
                boxShadow: active ? '0 0 0 3px rgba(94,106,210,0.12)' : 'none',
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: active ? 'var(--primary-light)' : 'var(--ink)', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-subtle)' }}>{desc}</div>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="First name" half>
            <PremiumInput type="text" name="firstName" placeholder="Jane" value={formData.firstName} onChange={handleChange} />
          </Field>
          <Field label="Last name" half>
            <PremiumInput type="text" name="lastName" placeholder="Doe" value={formData.lastName || ''} onChange={handleChange} />
          </Field>
        </div>

        <Field label="Email address">
          <PremiumInput type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} />
        </Field>

        <Field label="Password">
          <PremiumInput type="password" name="password" placeholder="Min. 8 characters" value={formData.password} onChange={handleChange} />
        </Field>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '12px 0', marginTop: 8,
            borderRadius: 'var(--r-md)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? 'var(--surface-3)' : 'var(--primary)',
            color: loading ? 'var(--ink-subtle)' : '#fff',
            fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: loading ? 'none' : '0 4px 20px rgba(94,106,210,0.35)',
            transition: 'all 0.15s',
          }}
        >
          {loading ? (
            <>
              <span style={{ width: 16, height: 16, border: '2px solid var(--hairline-strong)', borderTopColor: 'var(--primary)', borderRadius: '50%', display: 'inline-block' }} className="animate-spin" />
              Creating account...
            </>
          ) : 'Create Free Account →'}
        </button>
      </form>

      <p style={{ marginTop: 14, fontSize: 11, color: 'var(--ink-ghost)', textAlign: 'center', lineHeight: 1.5 }}>
        By signing up, you agree to our{' '}
        <Link href="#" style={{ color: 'var(--ink-subtle)' }}>Terms of Service</Link>
        {' '}and{' '}
        <Link href="#" style={{ color: 'var(--ink-subtle)' }}>Privacy Policy</Link>.
      </p>

      <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--ink-subtle)' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Sign in →
        </Link>
      </div>
    </div>
  );
}
