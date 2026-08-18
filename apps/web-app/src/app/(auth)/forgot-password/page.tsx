'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OtpInput } from '@/components/OtpInput';

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)', marginBottom: 6 }}>
        {label}
      </label>
      {children}
      {error && <div style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>{error}</div>}
    </div>
  );
}

function PremiumInput({ type, placeholder, value, onChange, name, autoComplete }: {
  type: string; placeholder: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; name: string;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} name={name} placeholder={placeholder} value={value}
      onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      autoComplete={autoComplete}
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
        letterSpacing: type === 'text' && name === 'otp' ? '4px' : 'normal',
        textAlign: name === 'otp' ? 'center' : 'left',
      }}
    />
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to request OTP');
      setStep(2);
      setSuccessMsg(data.message);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to reset password');
      
      // Successfully reset, redirect to login
      router.push('/login?reset=true');
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
          {step === 1 ? 'Reset password' : 'Enter security code'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-subtle)' }}>
          {step === 1 
            ? "Enter your email and we'll send you a code to reset it." 
            : successMsg || `We sent a 6-digit code to ${email}`}
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

      {step === 1 ? (
        <form onSubmit={handleRequestOtp} autoComplete="off">
          <Field label="Email address">
            <PremiumInput type="email" name="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          </Field>
          
          <button
            type="submit" disabled={loading || !email}
            style={{
              width: '100%', padding: '12px 0', marginTop: 8,
              borderRadius: 'var(--r-md)', border: 'none', cursor: (loading || !email) ? 'not-allowed' : 'pointer',
              background: (loading || !email) ? 'var(--surface-3)' : 'var(--primary)', color: (loading || !email) ? 'var(--ink-subtle)' : '#fff',
              fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: (loading || !email) ? 'none' : '0 4px 20px rgba(94,106,210,0.35)', transition: 'all 0.15s',
            }}
          >
            {loading ? (
              <><span style={{ width: 16, height: 16, border: '2px solid var(--hairline-strong)', borderTopColor: 'var(--primary)', borderRadius: '50%', display: 'inline-block' }} className="animate-spin" /> Sending...</>
            ) : 'Send Reset Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetSubmit} autoComplete="off">
          <Field label="6-Digit OTP">
            <OtpInput value={otp} onChange={setOtp} />
          </Field>
          <Field label="New Password">
            <PremiumInput type="password" name="newPassword" placeholder="Min. 8 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" />
          </Field>
          
          <button
            type="submit" disabled={loading || otp.length < 6 || newPassword.length < 8}
            style={{
              width: '100%', padding: '12px 0', marginTop: 8,
              borderRadius: 'var(--r-md)', border: 'none', cursor: (loading || otp.length < 6 || newPassword.length < 8) ? 'not-allowed' : 'pointer',
              background: (loading || otp.length < 6 || newPassword.length < 8) ? 'var(--surface-3)' : 'var(--primary)', color: (loading || otp.length < 6 || newPassword.length < 8) ? 'var(--ink-subtle)' : '#fff',
              fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: (loading || otp.length < 6 || newPassword.length < 8) ? 'none' : '0 4px 20px rgba(94,106,210,0.35)', transition: 'all 0.15s',
            }}
          >
            {loading ? (
              <><span style={{ width: 16, height: 16, border: '2px solid var(--hairline-strong)', borderTopColor: 'var(--primary)', borderRadius: '50%', display: 'inline-block' }} className="animate-spin" /> Resetting...</>
            ) : 'Reset Password'}
          </button>
        </form>
      )}

      <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--ink-subtle)' }}>
        Remember your password?{' '}
        <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Sign in →
        </Link>
      </div>
    </div>
  );
}
