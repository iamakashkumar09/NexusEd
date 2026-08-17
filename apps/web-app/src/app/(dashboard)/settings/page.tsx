'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [learningGoals, setLearningGoals] = useState('');
  const [interests, setInterests] = useState('');
  const [headline, setHeadline] = useState('');
  const [biography, setBiography] = useState('');
  const [website, setWebsite] = useState('');
  const [socialLinks, setSocialLinks] = useState('');

  useEffect(() => {
    fetch('/api/user/profile')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setProfile(data);
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setBio(data.bio || '');
          setLearningGoals(data.learningGoals || '');
          setInterests(data.interests || '');
          setHeadline(data.headline || '');
          setBiography(data.biography || '');
          setWebsite(data.website || '');
          setSocialLinks(data.socialLinks || '');
        } else {
          setError('Failed to load profile.');
        }
      })
      .catch(() => setError('An error occurred.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      firstName,
      lastName,
      ...(profile?.role === 'STUDENT' || profile?.role === 'student' ? { bio, learningGoals, interests } : {}),
      ...(profile?.role === 'INSTRUCTOR' || profile?.role === 'instructor' ? { headline, biography, website, socialLinks } : {}),
    };

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSuccess('Profile updated successfully!');
      } else {
        setError('Failed to update profile.');
      }
    } catch {
      setError('An error occurred while updating.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--hairline)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isInstructor = profile?.role === 'INSTRUCTOR' || profile?.role === 'instructor';

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 6 }}>
            Profile Settings
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-subtle)' }}>
            Manage your personal information and preferences.
          </p>
        </div>
        <Link href="/profile" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', background: 'var(--surface-2)',
          border: '1px solid var(--hairline)', borderRadius: 8,
          color: 'var(--ink-muted)', fontSize: 13, fontWeight: 500,
          textDecoration: 'none', flexShrink: 0,
        }}>
          ← View Profile
        </Link>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, background: 'rgba(238,0,0,0.08)', border: '1px solid rgba(238,0,0,0.25)', color: '#ff6b6b', fontSize: 13, fontWeight: 500 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, background: 'rgba(39,166,68,0.08)', border: '1px solid rgba(39,166,68,0.25)', color: '#4ade80', fontSize: 13, fontWeight: 500 }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Basic Info */}
        <section style={sectionStyle}>
          <h2 style={sectionHeadingStyle}>Basic Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="First Name">
              <input style={inputStyle} type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </Field>
            <Field label="Last Name">
              <input style={inputStyle} type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </Field>
          </div>
          <Field label="Email Address (Read-only)">
            <input style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} type="email" value={profile?.email || ''} disabled />
          </Field>
          <Field label="Account Role">
            <div style={{ ...inputStyle, opacity: 0.5, width: 'fit-content', textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.06em', fontWeight: 600, cursor: 'default' }}>
              {profile?.role || 'Unknown'}
            </div>
          </Field>
        </section>

        {/* Role-specific */}
        {isInstructor ? (
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>Instructor Details</h2>
            <Field label="Professional Headline">
              <input style={inputStyle} type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Senior Software Engineer at Google" />
            </Field>
            <Field label="Biography">
              <textarea style={{ ...inputStyle, resize: 'none' }} rows={4} value={biography} onChange={(e) => setBiography(e.target.value)} placeholder="Tell students about your experience..." />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Personal Website">
                <input style={inputStyle} type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
              </Field>
              <Field label="LinkedIn / Social">
                <input style={inputStyle} type="url" value={socialLinks} onChange={(e) => setSocialLinks(e.target.value)} placeholder="https://linkedin.com/in/..." />
              </Field>
            </div>
          </section>
        ) : (
          <section style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>Student Details</h2>
            <Field label="Bio">
              <textarea style={{ ...inputStyle, resize: 'none' }} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us a bit about yourself..." />
            </Field>
            <Field label="Learning Goals">
              <textarea style={{ ...inputStyle, resize: 'none' }} rows={2} value={learningGoals} onChange={(e) => setLearningGoals(e.target.value)} placeholder="What are you hoping to achieve?" />
            </Field>
            <Field label="Interests (comma-separated)">
              <input style={inputStyle} type="text" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="e.g. Web Dev, Machine Learning, Design" />
            </Field>
          </section>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
          <button
            type="button"
            onClick={async () => {
              try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
              document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
              document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
              window.location.href = '/login';
            }}
            style={{
              padding: '10px 18px', borderRadius: 8, background: 'transparent',
              color: '#ff6b6b', fontWeight: 600, fontSize: 13, border: '1px solid rgba(238,0,0,0.25)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget).style.background = 'rgba(238,0,0,0.08)'; }}
            onMouseLeave={(e) => { (e.currentTarget).style.background = 'transparent'; }}
          >
            Sign Out
          </button>
          <button type="submit" disabled={saving} style={{
            padding: '10px 24px', borderRadius: 8, background: 'var(--primary)',
            color: '#fff', fontWeight: 600, fontSize: 14, border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1,
            transition: 'all 0.15s', letterSpacing: '-0.01em',
            boxShadow: '0 2px 8px rgba(94,106,210,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-subtle)' }}>{label}</label>
      {children}
    </div>
  );
}

const sectionStyle: React.CSSProperties = {
  background: 'var(--surface-1)',
  border: '1px solid var(--hairline)',
  borderRadius: 12,
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
};

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--ink)',
  letterSpacing: '-0.01em',
  paddingBottom: 12,
  borderBottom: '1px solid var(--hairline)',
};

const inputStyle: React.CSSProperties = {
  background: 'var(--surface-2)',
  border: '1px solid var(--hairline)',
  borderRadius: 8,
  padding: '10px 14px',
  color: 'var(--ink)',
  fontSize: 14,
  outline: 'none',
  width: '100%',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};
