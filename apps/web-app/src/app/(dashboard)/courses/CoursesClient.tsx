'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// ─── Shared Primitives ────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  if (!rating) return <span style={{ fontSize: 11, color: 'var(--ink-ghost)' }}>No ratings yet</span>;
  return (
    <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? '#f59e0b' : 'none'}
          stroke="#f59e0b"
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span style={{ color: '#f59e0b', fontSize: 11, fontWeight: 700, marginLeft: 3 }}>{rating}</span>
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  const color = value >= 100 ? 'var(--success)' : value >= 60 ? 'var(--primary)' : 'var(--warning)';
  return (
    <div style={{ height: 5, background: 'var(--surface-4)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 999, transition: 'width 0.4s ease' }} />
    </div>
  );
}

function FilterPill({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count?: number }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: 999,
        cursor: 'pointer',
        background: active ? 'var(--primary)' : 'var(--surface-2)',
        color: active ? '#fff' : 'var(--ink-subtle)',
        fontSize: 13,
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.15s',
        boxShadow: active ? '0 2px 12px rgba(94,106,210,0.4)' : 'none',
        border: active ? 'none' : '1px solid var(--hairline)',
      }}
    >
      {label}
      {count !== undefined && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '1px 6px',
            borderRadius: 999,
            background: active ? 'rgba(255,255,255,0.2)' : 'var(--surface-3)',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Student View ─────────────────────────────────────────────────────────────

function StudentCourses() {
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [hovered, setHovered] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses/student/my-courses')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.courses) {
          setCourses(
            data.courses.map((c: any) => {
              const totalLectures = c.sections?.reduce((acc: number, s: any) => acc + (s.lectures?.length || 0), 0) || 0;
              const progress = Math.round(c.progress || 0);

              return {
                id: c.id,
                title: c.title,
                instructor: 'NexusEd Instructor',
                progress: progress,
                thumbnail:
                  c.thumbnailUrl && typeof c.thumbnailUrl === 'string' && !c.thumbnailUrl.startsWith('[object')
                    ? c.thumbnailUrl
                    : '/thumbnails/thumb_react.jpg',
                category: c.category || 'Development',
                rating: 4.8,
                totalLectures: totalLectures,
                completedLectures: Math.round((progress / 100) * totalLectures) || 0,
                status: progress >= 100 ? 'completed' : 'in-progress',
              };
            })
          );
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 220, gap: 12, color: 'var(--ink-subtle)' }}>
        <div style={{ width: 24, height: 24, border: '2px solid var(--hairline-strong)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} className="animate-spin" />
        Loading your enrolled courses...
      </div>
    );
  }

  return (
    <div>
      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        <FilterPill label="All Courses" active={filter === 'all'} onClick={() => setFilter('all')} count={courses.length} />
        <FilterPill
          label="In Progress"
          active={filter === 'in-progress'}
          onClick={() => setFilter('in-progress')}
          count={courses.filter((c) => c.status === 'in-progress').length}
        />
        <FilterPill
          label="Completed"
          active={filter === 'completed'}
          onClick={() => setFilter('completed')}
          count={courses.filter((c) => c.status === 'completed').length}
        />
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {filtered.map((course) => {
          const isHovered = hovered === course.id;
          return (
            <div
              key={course.id}
              onMouseEnter={() => setHovered(course.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: 'var(--surface-1)',
                border: `1px solid ${isHovered ? 'var(--hairline-strong)' : 'var(--hairline)'}`,
                borderRadius: 16,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transform: isHovered ? 'translateY(-4px)' : 'none',
                boxShadow: isHovered ? '0 16px 48px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s, border-color 0.15s, box-shadow 0.2s',
              }}
            >
              {/* Thumbnail with direct link to player */}
              <Link href={`/courses/${course.id}/learn`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative', background: 'var(--surface-3)', cursor: 'pointer' }}>
                  <Image src={course.thumbnail} alt={course.title} fill style={{ objectFit: 'cover' }} sizes="380px" />

                  {/* Category chip */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 999,
                      background: 'rgba(0,0,0,0.75)',
                      color: '#fff',
                      backdropFilter: 'blur(8px)',
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {course.category}
                  </div>

                  {/* Completed badge */}
                  {course.status === 'completed' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: 999,
                        background: 'rgba(74,222,128,0.9)',
                        color: '#000',
                        letterSpacing: '0.04em',
                      }}
                    >
                      ✓ Completed
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: isHovered ? 1 : 0,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        background: 'rgba(94,106,210,0.95)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 0 8px rgba(94,106,210,0.2)',
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Body */}
              <div style={{ padding: '18px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Link href={`/courses/${course.id}/learn`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--ink)',
                      marginBottom: 6,
                      lineHeight: 1.35,
                      cursor: 'pointer',
                    }}
                  >
                    {course.title}
                  </div>
                </Link>

                <div style={{ fontSize: 12, color: 'var(--ink-subtle)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{course.instructor}</span>
                  <span style={{ color: 'var(--hairline-strong)' }}>·</span>
                  <Stars rating={course.rating} />
                </div>

                {/* Progress */}
                <ProgressBar value={course.progress} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 12, color: 'var(--ink-subtle)' }}>
                    {course.completedLectures}/{course.totalLectures} lectures
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: course.progress === 100 ? 'var(--success)' : 'var(--primary)' }}>
                    {course.progress}%
                  </span>
                </div>

                {/* Actions */}
                <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
                  <Link
                    href={`/courses/${course.id}/learn`}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      borderRadius: 10,
                      background: course.status === 'completed' ? 'var(--surface-3)' : 'var(--primary)',
                      color: course.status === 'completed' ? 'var(--ink-muted)' : '#fff',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      letterSpacing: '-0.01em',
                      textAlign: 'center',
                      textDecoration: 'none',
                      boxShadow: course.status === 'completed' ? 'none' : '0 2px 12px rgba(94,106,210,0.3)',
                    }}
                  >
                    {course.status === 'completed' ? '↺ Review Lectures' : '▶ Watch Lectures'}
                  </Link>
                  <Link
                    href={`/courses/${course.id}`}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid var(--hairline)',
                      background: 'var(--surface-2)',
                      color: 'var(--ink-muted)',
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Course Overview & Curriculum"
                  >
                    📖 Details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.02em' }}>No courses here yet</div>
            <div style={{ fontSize: 14, color: 'var(--ink-subtle)' }}>
              <Link href="/catalog" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Browse the catalog
              </Link>{' '}
              to find and enroll in your next course.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Instructor View ──────────────────────────────────────────────────────────

function InstructorCourses() {
  const [filter, setFilter] = useState<'all' | 'Published' | 'Draft'>('all');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/courses/instructor/my-courses')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.courses) {
          setCourses(
            data.courses.map((c: any) => ({
              id: c.id,
              title: c.title,
              thumbnail:
                c.thumbnailUrl && typeof c.thumbnailUrl === 'string' && !c.thumbnailUrl.startsWith('[object')
                  ? c.thumbnailUrl
                  : '/thumbnails/thumb_react.jpg',
              category: c.category || 'Development',
              students: 0,
              rating: 4.8,
              revenue: '$0',
              status: c.status === 'PUBLISHED' ? 'Published' : 'Draft',
              sections: c.sections?.length || 0,
              lectures: c.sections?.reduce((acc: number, s: any) => acc + (s.lectures?.length || 0), 0) || 0,
            }))
          );
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? courses : courses.filter((c) => c.status === filter);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 220, gap: 12, color: 'var(--ink-subtle)' }}>
        <div style={{ width: 24, height: 24, border: '2px solid var(--hairline-strong)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} className="animate-spin" />
        Loading your courses...
      </div>
    );
  }

  return (
    <div>
      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        <FilterPill label="All" active={filter === 'all'} onClick={() => setFilter('all')} count={courses.length} />
        <FilterPill label="Published" active={filter === 'Published'} onClick={() => setFilter('Published')} count={courses.filter((c) => c.status === 'Published').length} />
        <FilterPill label="Drafts" active={filter === 'Draft'} onClick={() => setFilter('Draft')} count={courses.filter((c) => c.status === 'Draft').length} />
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {/* Create card */}
        <Link href="/courses/create" style={{ textDecoration: 'none' }}>
          <div
            style={{
              height: '100%',
              minHeight: 280,
              border: '2px dashed var(--hairline-strong)',
              borderRadius: 16,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              color: hovered === 'create' ? 'var(--primary)' : 'var(--ink-subtle)',
              borderColor: hovered === 'create' ? 'var(--primary)' : 'var(--hairline-strong)',
              background: hovered === 'create' ? 'rgba(94,106,210,0.05)' : 'transparent',
              transition: 'all 0.15s',
            }}
            onMouseEnter={() => setHovered('create')}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Create New Course</div>
            <div style={{ fontSize: 12, color: 'var(--ink-subtle)', textAlign: 'center', maxWidth: 180, lineHeight: 1.5 }}>
              Upload videos, organize curriculum and publish
            </div>
          </div>
        </Link>

        {/* Course cards */}
        {filtered.map((course) => (
          <div
            key={course.id}
            onMouseEnter={() => setHovered(course.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: 'var(--surface-1)',
              border: `1px solid ${hovered === course.id ? 'var(--hairline-strong)' : 'var(--hairline)'}`,
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transform: hovered === course.id ? 'translateY(-4px)' : 'none',
              boxShadow: hovered === course.id ? '0 16px 48px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
              transition: 'all 0.2s',
            }}
          >
            {/* Thumbnail */}
            <Link href={`/courses/${course.id}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative', background: 'var(--surface-3)', cursor: 'pointer' }}>
                <Image src={course.thumbnail} alt={course.title} fill style={{ objectFit: 'cover' }} sizes="350px" />
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 999,
                    background: course.status === 'Published' ? 'rgba(74,222,128,0.9)' : 'rgba(251,191,36,0.9)',
                    color: '#000',
                    letterSpacing: '0.04em',
                  }}
                >
                  {course.status === 'Published' ? '● Published' : '○ Draft'}
                </div>
              </div>
            </Link>

            {/* Body */}
            <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Link href={`/courses/${course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 12, cursor: 'pointer' }}>
                  {course.title}
                </div>
              </Link>

              {/* Metric chips */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                <div style={{ background: 'var(--surface-2)', border: '1px solid var(--hairline)', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>{course.sections} Sec · {course.lectures} Lec</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-subtle)', marginTop: 2, fontWeight: 500 }}>Curriculum</div>
                </div>
                <div style={{ background: 'var(--surface-2)', border: '1px solid var(--hairline)', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--success)', letterSpacing: '-0.03em' }}>{course.status}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-subtle)', marginTop: 2, fontWeight: 500 }}>Visibility</div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
                <Link
                  href={`/courses/${course.id}`}
                  style={{
                    flex: 1,
                    padding: '9px 0',
                    borderRadius: 10,
                    border: '1px solid var(--hairline)',
                    background: 'var(--surface-2)',
                    color: 'var(--ink)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'center',
                    textDecoration: 'none',
                  }}
                >
                  Manage Details
                </Link>
                <Link
                  href={`/courses/${course.id}/learn`}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    boxShadow: '0 2px 12px rgba(94,106,210,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  ▶ Player
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state for filtered */}
        {filtered.length === 0 && courses.length > 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'var(--ink-subtle)', fontSize: 14 }}>
            No {filter === 'Draft' ? 'draft' : 'published'} courses yet.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function CoursesClient({ role }: { role: string }) {
  const isInstructor = role === 'INSTRUCTOR' || role === 'instructor';

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.04em', marginBottom: 6 }}>
            {isInstructor ? 'My Courses' : 'My Learning'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-subtle)' }}>
            {isInstructor ? 'Manage and track all your published and draft courses.' : 'Pick up where you left off and watch your lectures.'}
          </p>
        </div>
        {isInstructor ? (
          <Link
            href="/courses/create"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 10,
              background: 'var(--primary)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
              letterSpacing: '-0.01em',
              boxShadow: '0 4px 20px rgba(94,106,210,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
              flexShrink: 0,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Course
          </Link>
        ) : (
          <Link
            href="/catalog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 10,
              background: 'var(--surface-2)',
              border: '1px solid var(--hairline)',
              color: 'var(--ink)',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            🧭 Browse More Courses
          </Link>
        )}
      </div>

      {isInstructor ? <InstructorCourses /> : <StudentCourses />}
    </div>
  );
}
