'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const STUDENT_COURSES = [
  { id: 1, title: 'React & Next.js Masterclass', instructor: 'Sarah Chen', progress: 65, thumbnail: '/thumbnails/thumb_react.jpg', category: 'Web Dev', rating: 4.8, totalLectures: 48, completedLectures: 31, status: 'in-progress' },
  { id: 2, title: 'Machine Learning & AI', instructor: 'Dr. James Liu', progress: 32, thumbnail: '/thumbnails/thumb_ml.jpg', category: 'AI/ML', rating: 4.9, totalLectures: 62, completedLectures: 20, status: 'in-progress' },
  { id: 3, title: 'System Design & Architecture', instructor: 'Alex Morgan', progress: 89, thumbnail: '/thumbnails/thumb_sysdesign.jpg', category: 'Backend', rating: 4.7, totalLectures: 35, completedLectures: 31, status: 'in-progress' },
  { id: 4, title: 'UI/UX Design Masterclass', instructor: 'Priya Nair', progress: 100, thumbnail: '/thumbnails/thumb_uiux.jpg', category: 'Design', rating: 4.8, totalLectures: 40, completedLectures: 40, status: 'completed' },
];

const INSTRUCTOR_COURSES = [
  { id: 1, title: 'React & Next.js Masterclass', instructor: 'You', thumbnail: '/thumbnails/thumb_react.jpg', category: 'Web Dev', students: 1248, rating: 4.8, revenue: '$4,512', status: 'Published' },
  { id: 2, title: 'System Design & Architecture', instructor: 'You', thumbnail: '/thumbnails/thumb_sysdesign.jpg', category: 'Backend', students: 894, rating: 4.7, revenue: '$2,890', status: 'Published' },
  { id: 3, title: 'Node.js Advanced Patterns', instructor: 'You', thumbnail: '/thumbnails/thumb_nodejs.jpg', category: 'Backend', students: 0, rating: 0, revenue: '$0', status: 'Draft' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1, alignItems: 'center' }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span style={{ color: '#f59e0b', fontSize: 11, fontWeight: 600, marginLeft: 3 }}>{rating > 0 ? rating : '—'}</span>
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  const color = value >= 100 ? '#27a644' : value >= 60 ? '#5e6ad2' : '#d0a020';
  return (
    <div style={{ height: 5, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 999 }} />
    </div>
  );
}

function FilterTab({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count?: number }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
      background: active ? 'var(--primary)' : 'var(--surface-2)',
      color: active ? '#fff' : 'var(--ink-muted)',
      fontSize: 13, fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: 6,
      transition: 'all 0.15s',
      boxShadow: active ? '0 2px 8px rgba(94,106,210,0.35)' : 'none',
    }}>
      {label}
      {count !== undefined && (
        <span style={{ fontSize: 11, background: active ? 'rgba(255,255,255,0.2)' : 'var(--surface-3)', padding: '1px 6px', borderRadius: 999, fontWeight: 700 }}>
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Student View ────────────────────────────────────────────────────────────

function StudentCourses() {
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed' | 'bookmarked'>('all');

  const filtered = STUDENT_COURSES.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'in-progress') return c.status === 'in-progress';
    if (filter === 'completed') return c.status === 'completed';
    return false;
  });

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <FilterTab label="All" active={filter === 'all'} onClick={() => setFilter('all')} count={STUDENT_COURSES.length} />
        <FilterTab label="In Progress" active={filter === 'in-progress'} onClick={() => setFilter('in-progress')} count={STUDENT_COURSES.filter(c => c.status === 'in-progress').length} />
        <FilterTab label="Completed" active={filter === 'completed'} onClick={() => setFilter('completed')} count={STUDENT_COURSES.filter(c => c.status === 'completed').length} />
        <FilterTab label="Bookmarked" active={filter === 'bookmarked'} onClick={() => setFilter('bookmarked')} count={0} />
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
        {filtered.map(course => (
          <div key={course.id} style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--hairline)',
            borderRadius: 14, overflow: 'hidden',
            cursor: 'pointer',
            transition: 'transform 0.2s, border-color 0.15s, box-shadow 0.2s',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.transform = 'translateY(-3px) scale(1.01)';
            el.style.borderColor = 'var(--hairline-strong)';
            el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.transform = 'translateY(0) scale(1)';
            el.style.borderColor = 'var(--hairline)';
            el.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05)';
          }}
          >
            {/* Thumbnail */}
            <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative', background: '#111' }}>
              <Image src={course.thumbnail} alt={course.title} fill style={{ objectFit: 'cover' }} sizes="300px" />
              {/* Category chip */}
              <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: 'rgba(0,0,0,0.75)', color: 'var(--ink)', backdropFilter: 'blur(6px)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                {course.category}
              </div>
              {/* Completed badge */}
              {course.status === 'completed' && (
                <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: 'rgba(39,166,68,0.85)', color: '#fff', backdropFilter: 'blur(6px)' }}>
                  ✓ Completed
                </div>
              )}
              {/* Hover overlay with play button */}
              <div className="card-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(94,106,210,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div style={{ padding: '14px 16px 16px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 4, lineHeight: 1.3 }}>
                {course.title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-subtle)', marginBottom: 10 }}>
                {course.instructor} · <Stars rating={course.rating} />
              </div>
              <ProgressBar value={course.progress} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--ink-subtle)' }}>
                  {course.completedLectures}/{course.totalLectures} lectures
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: course.progress === 100 ? 'var(--success)' : 'var(--primary)' }}>
                  {course.progress}%
                </span>
              </div>
              <button style={{
                width: '100%', marginTop: 14, padding: '9px 0',
                borderRadius: 8, border: '1px solid var(--hairline)',
                background: 'var(--surface-2)', color: 'var(--ink)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s', letterSpacing: '-0.01em',
              }}
              onMouseEnter={(e) => { (e.currentTarget).style.background = 'var(--primary)'; (e.currentTarget).style.borderColor = 'var(--primary)'; (e.currentTarget).style.color = '#fff'; }}
              onMouseLeave={(e) => { (e.currentTarget).style.background = 'var(--surface-2)'; (e.currentTarget).style.borderColor = 'var(--hairline)'; (e.currentTarget).style.color = 'var(--ink)'; }}
              >
                {course.status === 'completed' ? 'Review Course' : 'Continue Learning'}
              </button>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: 'var(--ink-subtle)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-muted)', marginBottom: 6 }}>No courses here yet</div>
            <div style={{ fontSize: 13 }}>
              <Link href="/catalog" style={{ color: 'var(--primary)' }}>Browse the catalog</Link> to find your next course
            </div>
          </div>
        )}
      </div>

      <style>{`.card-overlay { opacity: 0 !important; } div:hover > .card-overlay { opacity: 1 !important; }`}</style>
    </div>
  );
}

// ─── Instructor View ──────────────────────────────────────────────────────────

function InstructorCourses() {
  const [filter, setFilter] = useState<'all' | 'Published' | 'Draft'>('all');

  const filtered = INSTRUCTOR_COURSES.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <FilterTab label="All" active={filter === 'all'} onClick={() => setFilter('all')} count={INSTRUCTOR_COURSES.length} />
        <FilterTab label="Published" active={filter === 'Published'} onClick={() => setFilter('Published')} count={INSTRUCTOR_COURSES.filter(c => c.status === 'Published').length} />
        <FilterTab label="Drafts" active={filter === 'Draft'} onClick={() => setFilter('Draft')} count={INSTRUCTOR_COURSES.filter(c => c.status === 'Draft').length} />
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
        {/* Create new course card */}
        <Link href="/courses/create" style={{
          background: 'transparent',
          border: '2px dashed var(--hairline-strong)',
          borderRadius: 14, overflow: 'hidden',
          cursor: 'pointer', textDecoration: 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: 280, gap: 12,
          transition: 'border-color 0.15s, background 0.15s',
          color: 'var(--ink-subtle)',
        }}
        onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'var(--primary)'; el.style.background = 'rgba(94,106,210,0.05)'; el.style.color = 'var(--primary)'; }}
        onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'var(--hairline-strong)'; el.style.background = 'transparent'; el.style.color = 'var(--ink-subtle)'; }}
        >
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Create New Course</div>
          <div style={{ fontSize: 12, color: 'var(--ink-subtle)', textAlign: 'center', maxWidth: 140 }}>
            Share your expertise with students worldwide
          </div>
        </Link>

        {/* Course cards */}
        {filtered.map(course => (
          <div key={course.id} style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--hairline)',
            borderRadius: 14, overflow: 'hidden',
            transition: 'transform 0.2s, border-color 0.15s',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-3px)'; el.style.borderColor = 'var(--hairline-strong)'; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'none'; el.style.borderColor = 'var(--hairline)'; }}
          >
            <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative', background: '#111' }}>
              <Image src={course.thumbnail} alt={course.title} fill style={{ objectFit: 'cover' }} sizes="300px" />
              <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: course.status === 'Published' ? 'rgba(39,166,68,0.85)' : 'rgba(208,160,32,0.85)', color: '#fff' }}>
                {course.status}
              </div>
            </div>
            <div style={{ padding: '14px 16px 16px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 10, lineHeight: 1.3 }}>
                {course.title}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{course.students.toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-subtle)', marginTop: 1 }}>Students</div>
                </div>
                <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--success)' }}>{course.revenue}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-subtle)', marginTop: 1 }}>Revenue</div>
                </div>
              </div>
              {course.rating > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <Stars rating={course.rating} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid var(--hairline)', background: 'var(--surface-2)', color: 'var(--ink)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Manage
                </button>
                <button style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Analytics
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CoursesPage() {
  // NOTE: In a real app, we'd fetch role from context. Using localStorage workaround for now.
  // The actual role comes from the server-side profile — for client component we check via API.
  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => setRole(data?.role || 'STUDENT'))
      .catch(() => setRole('STUDENT'));
  }, []);

  const isInstructor = role === 'INSTRUCTOR' || role === 'instructor';

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.04em', marginBottom: 4 }}>
            {isInstructor ? 'My Courses' : 'My Learning'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-subtle)' }}>
            {isInstructor
              ? 'Manage and track all your published and draft courses.'
              : 'Pick up where you left off and continue your learning journey.'}
          </p>
        </div>
        {isInstructor && (
          <Link href="/courses/create" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10,
            background: 'var(--primary)', color: '#fff',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(94,106,210,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Course
          </Link>
        )}
      </div>

      {/* Role-aware content */}
      {role === null ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--hairline)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : isInstructor ? (
        <InstructorCourses />
      ) : (
        <StudentCourses />
      )}
    </div>
  );
}
