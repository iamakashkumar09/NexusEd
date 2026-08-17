'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Profile {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, icon, sub, color }: { label: string; value: string; icon: string; sub?: string; color?: string }) {
  return (
    <div
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--hairline)',
        borderRadius: 14,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ fontSize: 36 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: color || 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-subtle)', fontWeight: 500, marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const color = value >= 80 ? '#27a644' : value >= 50 ? '#5e6ad2' : '#d0a020';
  return (
    <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 999 }} />
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span style={{ color: '#f59e0b', fontSize: 11, fontWeight: 600, marginLeft: 3 }}>{rating}</span>
    </span>
  );
}

function HoverCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...style,
        transform: hovered ? 'translateY(-2px)' : 'none',
        borderColor: hovered ? 'var(--hairline-strong)' : 'var(--hairline)',
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.4)' : 'inset 0 1px 0 rgba(255,255,255,0.04)',
        transition: 'transform 0.15s, border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}

function ScaleCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...style,
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        borderColor: hovered ? 'var(--hairline-strong)' : 'var(--hairline)',
        transition: 'transform 0.2s, border-color 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}

const ACTIVITY = [
  { icon: '📖', text: 'Completed lecture "React Hooks Deep Dive"', time: '2h ago' },
  { icon: '🏆', text: 'Earned certificate in System Design', time: '1d ago' },
  { icon: '⭐', text: 'Rated "Machine Learning & AI" course', time: '2d ago' },
  { icon: '📝', text: 'Started "Data Science" chapter 4', time: '3d ago' },
];

// ─── Main Export ──────────────────────────────────────────────────────────────

export function DashboardContent({ profile }: { profile: Profile | null }) {
  const isInstructor = profile?.role === 'INSTRUCTOR' || profile?.role === 'instructor';
  const firstName = profile?.firstName || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const [stats, setStats] = useState<any>(null);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [catalogPicks, setCatalogPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isInstructor) {
      fetch('/api/courses/student/stats')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setStats(data);
        })
        .catch(console.error);

      fetch('/api/courses/student/my-courses')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.courses) {
            setMyCourses(
              data.courses.map((c: any) => {
                const totalLectures = c.sections?.reduce((acc: number, s: any) => acc + (s.lectures?.length || 0), 0) || 0;
                const progress = Math.round(c.progress || 0);
                return {
                  id: c.id,
                  title: c.title,
                  instructor: 'NexusEd Instructor',
                  progress,
                  thumbnail:
                    c.thumbnailUrl && typeof c.thumbnailUrl === 'string' && !c.thumbnailUrl.startsWith('[object')
                      ? c.thumbnailUrl
                      : '/thumbnails/thumb_react.jpg',
                  category: c.category || 'Development',
                  totalLectures,
                  completedLectures: Math.round((progress / 100) * totalLectures) || 0,
                };
              })
            );
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));

      // Fetch recommended / catalog picks
      fetch('/api/courses/catalog')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.courses) {
            setCatalogPicks(data.courses.slice(0, 3));
          }
        })
        .catch(console.error);
    } else {
      fetch('/api/courses/instructor/my-courses')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.courses) {
            setMyCourses(
              data.courses.map((c: any) => ({
                id: c.id,
                title: c.title,
                thumbnail:
                  c.thumbnailUrl && typeof c.thumbnailUrl === 'string' && !c.thumbnailUrl.startsWith('[object')
                    ? c.thumbnailUrl
                    : '/thumbnails/thumb_react.jpg',
                students: 0,
                rating: 4.8,
                revenue: '$0',
                status: c.status === 'PUBLISHED' ? 'Published' : 'Draft',
                totalLectures: c.sections?.reduce((acc: number, s: any) => acc + (s.lectures?.length || 0), 0) || 0,
              }))
            );
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isInstructor]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* ─── Welcome Banner ─── */}
      <div
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #0d0e1a 0%, #1a1040 50%, #0d1a2a 100%)',
          border: '1px solid var(--hairline)',
          padding: '32px 36px',
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
        }}
      >
        <div style={{ position: 'absolute', top: -40, right: 80, width: 220, height: 220, borderRadius: '50%', background: 'rgba(94,106,210,0.18)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, right: 200, width: 160, height: 160, borderRadius: '50%', background: 'rgba(166,130,255,0.12)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              {greeting} ✦
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.04em', marginBottom: 8 }}>
              Welcome back, {firstName}!
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-muted)', maxWidth: 460 }}>
              {isInstructor
                ? "Your courses are ready. Here's a snapshot of your teaching platform."
                : "You're on a learning streak! Pick up where you left off or explore new courses. 🔥"}
            </p>
          </div>
          {isInstructor ? (
            <Link
              href="/courses/create"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 22px',
                borderRadius: 10,
                background: 'var(--primary)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(94,106,210,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                letterSpacing: '-0.01em',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Course
            </Link>
          ) : (
            <Link
              href="/catalog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 22px',
                borderRadius: 10,
                background: 'var(--surface-2)',
                border: '1px solid var(--hairline)',
                color: 'var(--ink)',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              🧭 Browse Catalog
            </Link>
          )}
        </div>
      </div>

      {/* ─── Stats Row ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
        {isInstructor ? (
          <>
            <StatCard icon="👨‍🎓" label="Total Students" value="0" sub="All time" />
            <StatCard icon="📚" label="Active Courses" value={myCourses.length.toString()} />
            <StatCard icon="💰" label="Total Revenue" value="$0" color="#27a644" />
            <StatCard icon="⭐" label="Avg. Rating" value="4.8" sub="Across all courses" color="#f59e0b" />
          </>
        ) : (
          <>
            <StatCard icon="📖" label="Courses Enrolled" value={stats ? stats.coursesEnrolled?.toString() : myCourses.length.toString()} />
            <StatCard icon="⏱️" label="Hours Learned" value={stats ? `${stats.hoursLearned || 0}h` : '0h'} sub="This month" />
            <StatCard icon="🔥" label="Day Streak" value={stats ? stats.dayStreak?.toString() : '1'} sub="Keep it up!" color="#f59e0b" />
            <StatCard icon="🏆" label="Certificates" value={stats ? stats.certificates?.toString() : '0'} />
          </>
        )}
      </div>

      {/* ─── Main Content Grid ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Continue Learning / Your Courses */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                {isInstructor ? 'Your Courses' : 'Continue Learning'}
              </h2>
              <Link href="/courses" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                View all →
              </Link>
            </div>

            {myCourses.length === 0 ? (
              <div
                style={{
                  padding: '36px 24px',
                  background: 'var(--surface-1)',
                  border: '1px dashed var(--hairline-strong)',
                  borderRadius: 14,
                  textAlign: 'center',
                  color: 'var(--ink-subtle)',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{isInstructor ? '📚' : '🎓'}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>
                  {isInstructor ? 'No courses created yet' : 'No courses in progress'}
                </div>
                <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 16 }}>
                  {isInstructor
                    ? 'Start teaching today by creating your first course curriculum.'
                    : 'Explore our catalog and enroll in courses to start learning.'}
                </p>
                <Link
                  href={isInstructor ? '/courses/create' : '/catalog'}
                  style={{
                    display: 'inline-block',
                    padding: '8px 18px',
                    borderRadius: 8,
                    background: 'var(--primary)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  {isInstructor ? 'Create Course' : 'Browse Catalog'}
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {myCourses.map((course: any) => (
                  <HoverCard
                    key={course.id}
                    style={{
                      display: 'flex',
                      gap: 16,
                      alignItems: 'center',
                      background: 'var(--surface-1)',
                      border: '1px solid var(--hairline)',
                      borderRadius: 12,
                      padding: 14,
                      cursor: 'pointer',
                    }}
                  >
                    <Link href={`/courses/${course.id}/learn`} style={{ display: 'flex', gap: 16, alignItems: 'center', flex: 1, textDecoration: 'none', minWidth: 0 }}>
                      <div style={{ width: 100, height: 58, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#111', position: 'relative' }}>
                        <Image src={course.thumbnail} alt={course.title} fill style={{ objectFit: 'cover' }} sizes="100px" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: 'var(--ink)',
                            marginBottom: 4,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {course.title}
                        </div>
                        {isInstructor ? (
                          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: 'var(--ink-subtle)' }}>📚 {course.totalLectures} lectures</span>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: 999,
                                background: course.status === 'Published' ? 'rgba(39,166,68,0.15)' : 'rgba(208,160,32,0.15)',
                                color: course.status === 'Published' ? 'var(--success)' : '#d0a020',
                              }}
                            >
                              {course.status}
                            </span>
                          </div>
                        ) : (
                          <>
                            <div style={{ fontSize: 12, color: 'var(--ink-subtle)', marginBottom: 8 }}>
                              {course.completedLectures}/{course.totalLectures} lectures completed
                            </div>
                            <ProgressBar value={course.progress} />
                            <div style={{ fontSize: 11, color: 'var(--ink-subtle)', marginTop: 4 }}>{course.progress}% complete</div>
                          </>
                        )}
                      </div>
                    </Link>
                    <Link
                      href={isInstructor ? `/courses/${course.id}` : `/courses/${course.id}/learn`}
                      style={{
                        flexShrink: 0,
                        padding: '8px 16px',
                        borderRadius: 8,
                        background: isInstructor ? 'var(--surface-2)' : 'var(--primary)',
                        border: isInstructor ? '1px solid var(--hairline)' : 'none',
                        color: isInstructor ? 'var(--ink)' : '#fff',
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      {isInstructor ? 'Manage' : '▶ Resume'}
                    </Link>
                  </HoverCard>
                ))}
              </div>
            )}
          </section>

          {/* Recommended Courses (students only) */}
          {!isInstructor && catalogPicks.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>Recommended For You</h2>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: 'rgba(94,106,210,0.15)',
                      color: 'var(--primary)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Curated Picks
                  </span>
                </div>
                <Link href="/catalog" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                  Browse all →
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {catalogPicks.map((course) => (
                  <Link key={course.id} href={`/courses/${course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <ScaleCard
                      style={{
                        background: 'var(--surface-1)',
                        border: '1px solid var(--hairline)',
                        borderRadius: 12,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative', background: '#111' }}>
                        <Image
                          src={
                            course.thumbnailUrl && typeof course.thumbnailUrl === 'string' && !course.thumbnailUrl.startsWith('[object')
                              ? course.thumbnailUrl
                              : '/thumbnails/thumb_react.jpg'
                          }
                          alt={course.title}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="200px"
                        />
                        {course.category && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 999,
                              background: 'rgba(0,0,0,0.7)',
                              color: 'var(--ink-muted)',
                              backdropFilter: 'blur(4px)',
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                            }}
                          >
                            {course.category}
                          </div>
                        )}
                      </div>
                      <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4, lineHeight: 1.3 }}>{course.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-subtle)', marginBottom: 6 }}>NexusEd Instructor</div>
                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Stars rating={4.8} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                            {course.price === 0 || !course.price ? 'Free' : `₹${course.price}`}
                          </span>
                        </div>
                      </div>
                    </ScaleCard>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right: Activity Feed */}
        <aside>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 14 }}>Recent Activity</h2>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--hairline)', borderRadius: 12, overflow: 'hidden', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
            {ACTIVITY.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 16px', borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--hairline)' : 'none', alignItems: 'flex-start' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.4 }}>{item.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-subtle)', marginTop: 3 }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, background: 'var(--surface-1)', border: '1px solid var(--hairline)', borderRadius: 12, padding: 16, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>This Week</h3>
            {[
              { label: 'Study time', value: '4h 20m' },
              { label: 'Lectures watched', value: '12' },
              { label: 'Notes taken', value: '8' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < 2 ? '1px solid var(--hairline)' : 'none' }}>
                <span style={{ fontSize: 12, color: 'var(--ink-subtle)' }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
