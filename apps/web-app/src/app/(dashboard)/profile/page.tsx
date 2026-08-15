'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/profile')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setProfile(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div style={{ width: 36, height: 36, border: '3px solid var(--hairline)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!profile) {
    return <div style={{ color: 'var(--error)', padding: 32 }}>Failed to load profile.</div>;
  }

  const isInstructor = profile.role === 'INSTRUCTOR' || profile.role === 'instructor';
  const initials = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || profile.email?.[0]?.toUpperCase() || 'U';
  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Unnamed User';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Hero Card */}
      <div style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--hairline)',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}>
        {/* Banner */}
        <div style={{
          height: 140,
          background: 'linear-gradient(135deg, #1a1b2e 0%, #16213e 40%, #0f3460 70%, #533483 100%)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(ellipse at 30% 50%, rgba(94,106,210,0.25) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(166,130,255,0.15) 0%, transparent 50%)',
          }} />
        </div>

        {/* Profile info row */}
        <div style={{ padding: '0 32px 32px', position: 'relative' }}>
          {/* Avatar */}
          <div style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), #a682ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 700,
            color: '#fff',
            border: '4px solid var(--canvas)',
            marginTop: -44,
            marginBottom: 16,
            letterSpacing: '-0.02em',
            flexShrink: 0,
          }}>
            {initials}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 4 }}>
                {displayName}
              </h1>
              {isInstructor && profile.headline && (
                <p style={{ color: 'var(--ink-muted)', fontSize: 14, marginBottom: 4 }}>{profile.headline}</p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                <span style={{
                  background: isInstructor ? 'rgba(94,106,210,0.15)' : 'rgba(39,166,68,0.12)',
                  color: isInstructor ? 'var(--primary)' : 'var(--success)',
                  border: `1px solid ${isInstructor ? 'rgba(94,106,210,0.3)' : 'rgba(39,166,68,0.3)'}`,
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}>
                  {isInstructor ? 'Instructor' : 'Student'}
                </span>
                <span style={{ color: 'var(--ink-subtle)', fontSize: 13 }}>{profile.email}</span>
              </div>
            </div>
            <Link href="/settings" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              background: 'var(--surface-2)',
              border: '1px solid var(--hairline)',
              borderRadius: 8,
              color: 'var(--ink-muted)',
              fontSize: 13,
              fontWeight: 500,
              transition: 'all 0.15s',
              cursor: 'pointer',
              textDecoration: 'none',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--hairline-strong)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink-muted)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--hairline)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {isInstructor ? (
          <>
            <StatCard label="Students Taught" value="0" icon="👨‍🎓" />
            <StatCard label="Courses Created" value="0" icon="📚" />
            <StatCard label="Total Revenue" value="$0" icon="💰" />
          </>
        ) : (
          <>
            <StatCard label="Courses Enrolled" value="0" icon="📖" />
            <StatCard label="Hours Learned" value="0h" icon="⏱️" />
            <StatCard label="Certificates" value="0" icon="🏆" />
          </>
        )}
      </div>

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>

        {/* Left: About / Bio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* About section */}
          <div style={cardStyle}>
            <h2 style={sectionHeadingStyle}>About</h2>
            {isInstructor ? (
              <p style={{ color: 'var(--ink-muted)', fontSize: 14, lineHeight: 1.7 }}>
                {profile.biography || (
                  <span style={{ color: 'var(--ink-subtle)', fontStyle: 'italic' }}>No biography added yet. <Link href="/settings" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Add one →</Link></span>
                )}
              </p>
            ) : (
              <p style={{ color: 'var(--ink-muted)', fontSize: 14, lineHeight: 1.7 }}>
                {profile.bio || (
                  <span style={{ color: 'var(--ink-subtle)', fontStyle: 'italic' }}>No bio added yet. <Link href="/settings" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Add one →</Link></span>
                )}
              </p>
            )}
          </div>

          {/* Student: Learning Goals & Interests */}
          {!isInstructor && (
            <div style={cardStyle}>
              <h2 style={sectionHeadingStyle}>Learning Goals</h2>
              <p style={{ color: 'var(--ink-muted)', fontSize: 14, lineHeight: 1.7 }}>
                {profile.learningGoals || (
                  <span style={{ color: 'var(--ink-subtle)', fontStyle: 'italic' }}>No goals set yet. <Link href="/settings" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Add some →</Link></span>
                )}
              </p>
            </div>
          )}

          {/* Courses Placeholder */}
          <div style={cardStyle}>
            <h2 style={sectionHeadingStyle}>{isInstructor ? 'My Courses' : 'Enrolled Courses'}</h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 0',
              gap: 12,
              color: 'var(--ink-subtle)',
            }}>
              <div style={{ fontSize: 40 }}>📚</div>
              <p style={{ fontSize: 14, color: 'var(--ink-subtle)' }}>No courses yet</p>
            </div>
          </div>
        </div>

        {/* Right: Details Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Interests (student) */}
          {!isInstructor && profile.interests && (
            <div style={cardStyle}>
              <h2 style={sectionHeadingStyle}>Interests</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {profile.interests.split(',').map((interest: string, i: number) => (
                  <span key={i} style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--hairline)',
                    borderRadius: 999,
                    padding: '4px 12px',
                    fontSize: 12,
                    color: 'var(--ink-muted)',
                  }}>
                    {interest.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Instructor: Links */}
          {isInstructor && (profile.website || profile.socialLinks) && (
            <div style={cardStyle}>
              <h2 style={sectionHeadingStyle}>Links</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🌐</span> {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {profile.socialLinks && (
                  <a href={profile.socialLinks} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>💼</span> {profile.socialLinks.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Member since / account info */}
          <div style={cardStyle}>
            <h2 style={sectionHeadingStyle}>Account</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <InfoRow label="Role" value={profile.role || 'Student'} />
              <InfoRow label="Email" value={profile.email || '—'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div style={{
      background: 'var(--surface-1)',
      border: '1px solid var(--hairline)',
      borderRadius: 12,
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
    }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-subtle)', marginTop: 4, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 13, color: 'var(--ink-subtle)' }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--ink-muted)', fontWeight: 500, textAlign: 'right', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'var(--surface-1)',
  border: '1px solid var(--hairline)',
  borderRadius: 12,
  padding: 24,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
};

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--ink)',
  marginBottom: 16,
  letterSpacing: '-0.01em',
};
