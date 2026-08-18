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
        <div className="w-9 h-9 rounded-full border-4 border-hairline border-t-primary animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-error p-8 font-semibold">Failed to load profile.</div>;
  }

  const isInstructor = profile.role === 'INSTRUCTOR' || profile.role === 'instructor';
  const initials = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || profile.email?.[0]?.toUpperCase() || 'U';
  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Unnamed User';

  return (
    <div className="max-w-[900px] mx-auto w-full font-sans">
      
      {/* Hero Card */}
      <div className="bg-surface-1 border border-hairline rounded-2xl overflow-hidden mb-6 shadow-sm relative">
        {/* Banner */}
        <div className="h-[120px] sm:h-[160px] bg-gradient-to-br from-[#1a1b2e] via-[#16213e] to-[#533483] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(94,106,210,0.25)_0%,transparent_60%),radial-gradient(ellipse_at_80%_20%,rgba(166,130,255,0.15)_0%,transparent_50%)]" />
        </div>

        {/* Profile info row */}
        <div className="px-5 sm:px-8 pb-8 relative flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="w-[88px] sm:w-[104px] h-[88px] sm:h-[104px] rounded-full bg-gradient-to-br from-primary to-[#a682ff] flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-white border-4 border-canvas -mt-11 sm:-mt-14 shadow-lg shrink-0">
            {initials}
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-start justify-between w-full gap-4 mt-2 sm:mt-4 text-center sm:text-left">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-1">{displayName}</h1>
              {isInstructor && profile.headline && (
                <p className="text-ink-muted text-sm mb-2">{profile.headline}</p>
              )}
              <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap mt-2">
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase border ${isInstructor ? 'bg-primary/10 text-primary border-primary/20' : 'bg-success/10 text-success border-success/20'}`}>
                  {isInstructor ? 'Instructor' : 'Student'}
                </span>
                <span className="text-ink-subtle text-[13px] font-medium">{profile.email}</span>
              </div>
            </div>
            
            <Link href="/settings" className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-2 border border-hairline rounded-xl text-ink-muted text-[13px] font-semibold hover:bg-surface-3 hover:text-ink hover:border-hairline-strong transition-all shrink-0 w-full sm:w-auto justify-center sm:justify-start shadow-sm hover:shadow-md">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left: About / Bio */}
        <div className="flex flex-col gap-6 w-full md:flex-1">
          {/* About section */}
          <div className="bg-surface-1 border border-hairline rounded-2xl p-6 shadow-sm">
            <h2 className="text-[15px] font-bold text-ink tracking-tight mb-4">About</h2>
            {isInstructor ? (
              <p className="text-ink-muted text-sm leading-relaxed">
                {profile.biography || (
                  <span className="text-ink-subtle italic">No biography added yet. <Link href="/settings" className="text-primary no-underline font-semibold hover:underline">Add one →</Link></span>
                )}
              </p>
            ) : (
              <p className="text-ink-muted text-sm leading-relaxed">
                {profile.bio || (
                  <span className="text-ink-subtle italic">No bio added yet. <Link href="/settings" className="text-primary no-underline font-semibold hover:underline">Add one →</Link></span>
                )}
              </p>
            )}
          </div>

          {/* Student: Learning Goals */}
          {!isInstructor && (
            <div className="bg-surface-1 border border-hairline rounded-2xl p-6 shadow-sm">
              <h2 className="text-[15px] font-bold text-ink tracking-tight mb-4">Learning Goals</h2>
              <p className="text-ink-muted text-sm leading-relaxed">
                {profile.learningGoals || (
                  <span className="text-ink-subtle italic">No goals set yet. <Link href="/settings" className="text-primary no-underline font-semibold hover:underline">Add some →</Link></span>
                )}
              </p>
            </div>
          )}

          {/* Courses Placeholder */}
          <div className="bg-surface-1 border border-hairline rounded-2xl p-6 shadow-sm">
            <h2 className="text-[15px] font-bold text-ink tracking-tight mb-4">{isInstructor ? 'My Courses' : 'Enrolled Courses'}</h2>
            <div className="flex flex-col items-center justify-center py-10 gap-3 border border-dashed border-hairline-strong rounded-xl bg-surface-2/50">
              <div className="text-4xl">📚</div>
              <p className="text-sm font-semibold text-ink-subtle">No courses yet</p>
            </div>
          </div>
        </div>

        {/* Right: Details Sidebar */}
        <div className="flex flex-col gap-6 w-full md:w-[320px] shrink-0">
          
          {/* Interests (student) */}
          {!isInstructor && profile.interests && (
            <div className="bg-surface-1 border border-hairline rounded-2xl p-6 shadow-sm">
              <h2 className="text-[15px] font-bold text-ink tracking-tight mb-4">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.split(',').map((interest: string, i: number) => (
                  <span key={i} className="bg-surface-2 border border-hairline rounded-full px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-surface-3 transition-colors cursor-default">
                    {interest.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Instructor: Links */}
          {isInstructor && (profile.website || profile.socialLinks) && (
            <div className="bg-surface-1 border border-hairline rounded-2xl p-6 shadow-sm">
              <h2 className="text-[15px] font-bold text-ink tracking-tight mb-4">Links</h2>
              <div className="flex flex-col gap-3">
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="text-primary text-sm font-medium flex items-center gap-2 hover:underline">
                    <span className="text-base shrink-0">🌐</span> <span className="truncate">{profile.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
                {profile.socialLinks && (
                  <a href={profile.socialLinks} target="_blank" rel="noreferrer" className="text-primary text-sm font-medium flex items-center gap-2 hover:underline">
                    <span className="text-base shrink-0">💼</span> <span className="truncate">{profile.socialLinks.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Account info */}
          <div className="bg-surface-1 border border-hairline rounded-2xl p-6 shadow-sm">
            <h2 className="text-[15px] font-bold text-ink tracking-tight mb-4">Account</h2>
            <div className="flex flex-col gap-3">
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
    <div className="bg-surface-1 border border-hairline rounded-2xl p-5 sm:p-6 flex items-center gap-4 shadow-sm hover:border-hairline-strong transition-colors group">
      <div className="text-3xl shrink-0 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <div className="min-w-0">
        <div className="text-2xl font-extrabold text-ink tracking-tight leading-none mb-1.5 truncate">{value}</div>
        <div className="text-xs font-semibold text-ink-subtle truncate">{label}</div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-[13px] font-semibold text-ink-subtle shrink-0">{label}</span>
      <span className="text-[13px] font-bold text-ink-muted text-right truncate">{value}</span>
    </div>
  );
}
