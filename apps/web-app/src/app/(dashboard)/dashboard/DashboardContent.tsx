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

function StatCard({ label, value, icon, sub, colorClass = "text-ink" }: { label: string; value: string; icon: string; sub?: string; colorClass?: string }) {
  return (
    <div className="bg-surface-1 border border-hairline rounded-[14px] p-5 flex items-center gap-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all hover:border-hairline-strong hover:bg-surface-2 group">
      <div className="text-4xl transform transition-transform group-hover:scale-110 group-hover:-rotate-3">{icon}</div>
      <div>
        <div className={`text-[26px] font-bold tracking-tight leading-none ${colorClass}`}>{value}</div>
        <div className="text-xs text-ink-subtle font-medium mt-1">{label}</div>
        {sub && <div className="text-[11px] text-success font-semibold mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const color = value >= 80 ? 'bg-success' : value >= 50 ? 'bg-primary' : 'bg-warning';
  return (
    <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-500 ease-out`} style={{ width: `${value}%` }} />
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="text-warning text-[11px] font-semibold ml-1">{rating}</span>
    </span>
  );
}

function HoverCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`transition-all duration-200 hover:-translate-y-0.5 hover:border-hairline-strong hover:shadow-lg hover:shadow-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${className}`}>
      {children}
    </div>
  );
}

function ScaleCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`transition-all duration-200 hover:scale-[1.02] hover:border-hairline-strong ${className}`}>
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
    <div className="max-w-[1200px] mx-auto w-full">
      {/* ─── Welcome Banner ─── */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0d0e1a] via-[#1a1040] to-[#0d1a2a] border border-hairline p-6 md:p-8 mb-8 relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
        {/* Ambient glows */}
        <div className="absolute -top-10 -right-20 w-[220px] h-[220px] rounded-full bg-[rgba(94,106,210,0.18)] blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-10 right-20 w-[160px] h-[160px] rounded-full bg-[rgba(166,130,255,0.12)] blur-[50px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="text-xs font-semibold text-primary tracking-widest uppercase mb-2">
              {greeting} ✦
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
              Welcome back, {firstName}!
            </h1>
            <p className="text-sm text-ink-muted max-w-[460px] leading-relaxed">
              {isInstructor
                ? "Your courses are ready. Here's a snapshot of your teaching platform."
                : "You're on a learning streak! Pick up where you left off or explore new courses. 🔥"}
            </p>
          </div>
          <div className="shrink-0">
            {isInstructor ? (
              <Link
                href="/courses/create"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold shadow-[0_4px_16px_rgba(94,106,210,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-primary-light hover:-translate-y-[1px] transition-all"
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
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-2 border border-hairline text-white text-sm font-semibold hover:bg-surface-3 transition-colors"
              >
                🧭 Browse Catalog
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
        {isInstructor ? (
          <>
            <StatCard icon="👨‍🎓" label="Total Students" value="0" sub="All time" />
            <StatCard icon="📚" label="Active Courses" value={myCourses.length.toString()} />
            <StatCard icon="💰" label="Total Revenue" value="$0" colorClass="text-success" />
            <StatCard icon="⭐" label="Avg. Rating" value="4.8" sub="Across all courses" colorClass="text-warning" />
          </>
        ) : (
          <>
            <StatCard icon="📖" label="Courses Enrolled" value={stats ? stats.coursesEnrolled?.toString() : myCourses.length.toString()} />
            <StatCard icon="⏱️" label="Hours Learned" value={stats ? `${stats.hoursLearned || 0}h` : '0h'} sub="This month" />
            <StatCard icon="🔥" label="Day Streak" value={stats ? stats.dayStreak?.toString() : '1'} sub="Keep it up!" colorClass="text-warning" />
            <StatCard icon="🏆" label="Certificates" value={stats ? stats.certificates?.toString() : '0'} />
          </>
        )}
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-8 min-w-0">
          {/* Continue Learning / Your Courses */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-bold text-ink tracking-tight">
                {isInstructor ? 'Your Courses' : 'Continue Learning'}
              </h2>
              <Link href="/courses" className="text-[13px] text-primary font-medium hover:underline">
                View all →
              </Link>
            </div>

            {myCourses.length === 0 ? (
              <div className="p-9 bg-surface-1 border border-dashed border-hairline-strong rounded-xl text-center text-ink-subtle">
                <div className="text-4xl mb-3">{isInstructor ? '📚' : '🎓'}</div>
                <div className="text-[15px] font-bold text-ink mb-1.5">
                  {isInstructor ? 'No courses created yet' : 'No courses in progress'}
                </div>
                <p className="text-[13px] text-ink-muted mb-5 max-w-[300px] mx-auto">
                  {isInstructor
                    ? 'Start teaching today by creating your first course curriculum.'
                    : 'Explore our catalog and enroll in courses to start learning.'}
                </p>
                <Link
                  href={isInstructor ? '/courses/create' : '/catalog'}
                  className="inline-block px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-bold hover:bg-primary-light transition-colors shadow-glow"
                >
                  {isInstructor ? 'Create Course' : 'Browse Catalog'}
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {myCourses.map((course: any) => (
                  <HoverCard
                    key={course.id}
                    className="flex flex-col sm:flex-row gap-4 items-center bg-surface-1 border border-hairline rounded-xl p-3.5 cursor-pointer"
                  >
                    <Link href={`/courses/${course.id}${!isInstructor ? '/learn' : ''}`} className="flex flex-col sm:flex-row gap-4 items-center flex-1 min-w-0 w-full">
                      <div className="w-full sm:w-[120px] aspect-video sm:h-[68px] rounded-lg overflow-hidden shrink-0 bg-[#111] relative">
                        <Image src={course.thumbnail} alt={course.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 120px" />
                      </div>
                      <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                        <div className="text-sm font-bold text-ink mb-1 truncate">
                          {course.title}
                        </div>
                        {isInstructor ? (
                          <div className="flex items-center justify-center sm:justify-start gap-4">
                            <span className="text-xs text-ink-subtle">📚 {course.totalLectures} lectures</span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${course.status === 'Published' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                              {course.status}
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="text-[11px] text-ink-subtle mb-2">
                              {course.completedLectures}/{course.totalLectures} lectures completed
                            </div>
                            <ProgressBar value={course.progress} />
                            <div className="text-[11px] text-ink-subtle mt-1.5 font-medium">{course.progress}% complete</div>
                          </>
                        )}
                      </div>
                    </Link>
                    <Link
                      href={isInstructor ? `/courses/${course.id}` : `/courses/${course.id}/learn`}
                      className={`shrink-0 w-full sm:w-auto text-center px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${isInstructor ? 'bg-surface-2 border border-hairline text-ink hover:bg-surface-3' : 'bg-primary text-white hover:bg-primary-light shadow-glow hover:shadow-[0_0_0_4px_var(--primary-glow)]'}`}
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-[17px] font-bold text-ink tracking-tight">Recommended For You</h2>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary/15 text-primary tracking-wider uppercase">
                    Curated Picks
                  </span>
                </div>
                <Link href="/catalog" className="text-[13px] text-primary font-medium hover:underline">
                  Browse all →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {catalogPicks.map((course) => (
                  <Link key={course.id} href={`/courses/${course.id}`} className="block h-full group">
                    <ScaleCard className="bg-surface-1 border border-hairline rounded-xl overflow-hidden cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] h-full flex flex-col bg-surface-1/50 backdrop-blur-sm group-hover:bg-surface-2 transition-colors">
                      <div className="w-full aspect-video relative bg-[#111]">
                        <Image
                          src={
                            course.thumbnailUrl && typeof course.thumbnailUrl === 'string' && !course.thumbnailUrl.startsWith('[object')
                              ? course.thumbnailUrl
                              : '/thumbnails/thumb_react.jpg'
                          }
                          alt={course.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                        />
                        {course.category && (
                          <div className="absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full bg-black/70 text-ink-muted backdrop-blur-md tracking-wider uppercase border border-white/10 shadow-lg">
                            {course.category}
                          </div>
                        )}
                      </div>
                      <div className="p-3.5 flex flex-col flex-1">
                        <div className="text-[13px] font-bold text-ink mb-1 leading-snug line-clamp-2">{course.title}</div>
                        <div className="text-[11px] text-ink-subtle mb-2">NexusEd Instructor</div>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <Stars rating={4.8} />
                          <span className="text-[13px] font-extrabold text-primary">
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
        <aside className="shrink-0 w-full lg:w-[300px]">
          <h2 className="text-[15px] font-bold text-ink tracking-tight mb-3.5">Recent Activity</h2>
          <div className="bg-surface-1 border border-hairline rounded-xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            {ACTIVITY.map((item, i) => (
              <div key={i} className={`flex gap-3 p-3.5 items-start transition-colors hover:bg-surface-2 ${i < ACTIVITY.length - 1 ? 'border-b border-hairline' : ''}`}>
                <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-base shrink-0 shadow-sm">
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs text-ink-muted leading-relaxed font-medium">{item.text}</div>
                  <div className="text-[11px] text-ink-subtle mt-1 font-medium">{item.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-surface-1 border border-hairline rounded-xl p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary-bg rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-[13px] font-bold text-ink mb-3 relative z-10">This Week</h3>
            <div className="flex flex-col gap-0 relative z-10">
              {[
                { label: 'Study time', value: '4h 20m' },
                { label: 'Lectures watched', value: '12' },
                { label: 'Notes taken', value: '8' },
              ].map((item, i) => (
                <div key={i} className={`flex justify-between items-center py-2 ${i < 2 ? 'border-b border-hairline' : ''}`}>
                  <span className="text-xs text-ink-subtle font-medium">{item.label}</span>
                  <span className="text-[13px] font-bold text-ink">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
