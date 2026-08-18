'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// ─── Shared Primitives ────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  if (!rating) return <span className="text-[11px] text-ink-ghost">No ratings yet</span>;
  return (
    <span className="inline-flex gap-0.5 items-center">
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
      <span className="text-[#f59e0b] text-[11px] font-bold ml-1">{rating}</span>
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  const color = value >= 100 ? 'bg-success' : value >= 60 ? 'bg-primary' : 'bg-warning';
  return (
    <div className="h-1.5 bg-surface-4 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-500 ease-out`} style={{ width: `${value}%` }} />
    </div>
  );
}

function FilterPill({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count?: number }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3.5 py-1.5 rounded-full cursor-pointer text-[13px] font-semibold inline-flex items-center gap-1.5 transition-all
        ${active 
          ? 'bg-primary text-white shadow-[0_2px_12px_rgba(94,106,210,0.4)] border border-transparent' 
          : 'bg-surface-2 text-ink-subtle border border-hairline hover:bg-surface-3 hover:text-ink'}
      `}
    >
      {label}
      {count !== undefined && (
        <span
          className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-surface-3'}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function CourseSkeleton() {
  return (
    <div className="bg-surface-1 border border-hairline rounded-2xl overflow-hidden flex flex-col h-[360px] animate-pulse">
      <div className="w-full aspect-video bg-surface-3" />
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="h-5 bg-surface-3 rounded-md w-3/4" />
        <div className="h-3 bg-surface-3 rounded-md w-1/3" />
        <div className="mt-4 h-2 bg-surface-3 rounded-full w-full" />
        <div className="flex justify-between">
          <div className="h-3 bg-surface-3 rounded-md w-1/4" />
          <div className="h-3 bg-surface-3 rounded-md w-1/6" />
        </div>
        <div className="mt-auto flex gap-2">
          <div className="h-9 bg-surface-3 rounded-lg flex-1" />
          <div className="h-9 bg-surface-3 rounded-lg w-20" />
        </div>
      </div>
    </div>
  );
}

// ─── Student View ─────────────────────────────────────────────────────────────

function StudentCourses() {
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
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

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-2 mb-7 flex-wrap">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <>
            <CourseSkeleton />
            <CourseSkeleton />
            <CourseSkeleton />
            <CourseSkeleton />
          </>
        ) : filtered.length > 0 ? (
          filtered.map((course) => (
            <div
              key={course.id}
              className="group bg-surface-1 border border-hairline rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 hover:border-hairline-strong hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)] transition-all duration-200"
            >
              {/* Thumbnail with direct link to player */}
              <Link href={`/courses/${course.id}/learn`} className="block relative w-full aspect-video bg-surface-3 cursor-pointer overflow-hidden">
                <Image src={course.thumbnail} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 380px" />
                
                {/* Category chip */}
                <div className="absolute top-2.5 left-2.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-black/75 text-white backdrop-blur-md tracking-wider uppercase">
                  {course.category}
                </div>

                {/* Completed badge */}
                {course.status === 'completed' && (
                  <div className="absolute top-2.5 right-2.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-success/90 text-black tracking-widest uppercase">
                    ✓ Completed
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-12 h-12 rounded-full bg-primary/95 flex items-center justify-center shadow-[0_0_0_6px_rgba(94,106,210,0.2)]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" className="ml-1">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col">
                <Link href={`/courses/${course.id}/learn`} className="text-base font-bold text-ink mb-1.5 leading-snug hover:text-primary transition-colors line-clamp-2">
                  {course.title}
                </Link>

                <div className="text-xs text-ink-subtle mb-3.5 flex items-center gap-2">
                  <span>{course.instructor}</span>
                  <span className="text-hairline-strong">·</span>
                  <Stars rating={course.rating} />
                </div>

                {/* Progress */}
                <ProgressBar value={course.progress} />
                <div className="flex justify-between items-center mt-2 mb-4">
                  <span className="text-xs text-ink-subtle">
                    {course.completedLectures}/{course.totalLectures} lectures
                  </span>
                  <span className={`text-xs font-bold ${course.progress === 100 ? 'text-success' : 'text-primary'}`}>
                    {course.progress}%
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-auto flex gap-2">
                  <Link
                    href={`/courses/${course.id}/learn`}
                    className={`
                      flex-1 py-2 rounded-lg text-[13px] font-bold text-center transition-all
                      ${course.status === 'completed' 
                        ? 'bg-surface-3 text-ink-muted hover:bg-surface-4' 
                        : 'bg-primary text-white shadow-glow hover:bg-primary-light hover:-translate-y-0.5'}
                    `}
                  >
                    {course.status === 'completed' ? '↺ Review' : '▶ Watch'}
                  </Link>
                  <Link
                    href={`/courses/${course.id}`}
                    className="px-3.5 py-2 rounded-lg border border-hairline bg-surface-2 text-ink-muted text-[13px] font-semibold flex items-center justify-center hover:bg-surface-3 transition-colors"
                    title="Course Overview"
                  >
                    📖
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <div className="text-5xl mb-4">📚</div>
            <div className="text-lg font-bold text-ink mb-2 tracking-tight">No courses here yet</div>
            <div className="text-sm text-ink-subtle">
              <Link href="/catalog" className="text-primary font-semibold hover:underline">
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

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-2 mb-7 flex-wrap">
        <FilterPill label="All" active={filter === 'all'} onClick={() => setFilter('all')} count={courses.length} />
        <FilterPill label="Published" active={filter === 'Published'} onClick={() => setFilter('Published')} count={courses.filter((c) => c.status === 'Published').length} />
        <FilterPill label="Drafts" active={filter === 'Draft'} onClick={() => setFilter('Draft')} count={courses.filter((c) => c.status === 'Draft').length} />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Create card - always visible for instructor */}
        <Link href="/courses/create" className="group h-full min-h-[300px] border-2 border-dashed border-hairline-strong rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary transition-all p-6 text-center">
          <div className="w-14 h-14 rounded-full border-2 border-ink-subtle group-hover:border-primary text-ink-subtle group-hover:text-primary flex items-center justify-center transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <div className="text-[15px] font-bold text-ink-subtle group-hover:text-primary transition-colors">Create New Course</div>
          <div className="text-xs text-ink-muted max-w-[180px] leading-relaxed">
            Upload videos, organize curriculum and publish
          </div>
        </Link>

        {loading ? (
          <>
            <CourseSkeleton />
            <CourseSkeleton />
          </>
        ) : (
          filtered.map((course) => (
            <div
              key={course.id}
              className="group bg-surface-1 border border-hairline rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 hover:border-hairline-strong hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)] transition-all duration-200"
            >
              {/* Thumbnail */}
              <Link href={`/courses/${course.id}`} className="block relative w-full aspect-video bg-surface-3 cursor-pointer overflow-hidden">
                <Image src={course.thumbnail} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 380px" />
                <div className={`
                  absolute top-2.5 right-2.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full text-black tracking-widest uppercase
                  ${course.status === 'Published' ? 'bg-success/90' : 'bg-warning/90'}
                `}>
                  {course.status === 'Published' ? '● Published' : '○ Draft'}
                </div>
              </Link>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col">
                <Link href={`/courses/${course.id}`} className="text-[15px] font-bold text-ink leading-snug mb-3 hover:text-primary transition-colors line-clamp-2">
                  {course.title}
                </Link>

                {/* Metric chips */}
                <div className="grid grid-cols-2 gap-2 mb-3.5">
                  <div className="bg-surface-2 border border-hairline rounded-xl p-2.5">
                    <div className="text-[15px] font-extrabold text-ink tracking-tight">{course.sections} Sec · {course.lectures} Lec</div>
                    <div className="text-[11px] text-ink-subtle mt-0.5 font-medium">Curriculum</div>
                  </div>
                  <div className="bg-surface-2 border border-hairline rounded-xl p-2.5">
                    <div className="text-[15px] font-extrabold text-success tracking-tight">{course.status}</div>
                    <div className="text-[11px] text-ink-subtle mt-0.5 font-medium">Visibility</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto flex gap-2">
                  <Link
                    href={`/courses/${course.id}`}
                    className="flex-1 py-2 rounded-lg border border-hairline bg-surface-2 text-ink text-[13px] font-semibold text-center hover:bg-surface-3 transition-colors"
                  >
                    Manage Details
                  </Link>
                  <Link
                    href={`/courses/${course.id}/learn`}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-bold flex items-center justify-center shadow-glow hover:bg-primary-light transition-colors gap-1.5"
                  >
                    ▶ Player
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Empty state for filtered */}
        {!loading && filtered.length === 0 && courses.length > 0 && (
          <div className="col-span-full sm:col-span-1 lg:col-span-2 xl:col-span-3 text-center py-16 text-ink-subtle text-sm flex items-center justify-center border border-dashed border-hairline rounded-2xl">
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
    <div className="max-w-[1200px] mx-auto w-full">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight mb-1.5">
            {isInstructor ? 'My Courses' : 'My Learning'}
          </h1>
          <p className="text-sm text-ink-subtle">
            {isInstructor ? 'Manage and track all your published and draft courses.' : 'Pick up where you left off and watch your lectures.'}
          </p>
        </div>
        {isInstructor ? (
          <Link
            href="/courses/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-glow hover:bg-primary-light hover:-translate-y-0.5 transition-all self-start"
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
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-2 border border-hairline text-ink text-[13px] font-semibold hover:bg-surface-3 transition-colors self-start"
          >
            🧭 Browse More Courses
          </Link>
        )}
      </div>

      {isInstructor ? <InstructorCourses /> : <StudentCourses />}
    </div>
  );
}
