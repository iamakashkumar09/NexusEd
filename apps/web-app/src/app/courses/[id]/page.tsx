import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CourseEnrollButton from './CourseEnrollButton';

async function getCourse(id: string) {
  try {
    const res = await fetch(`${process.env.API_GATEWAY_URL}/api/courses/${id}`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

export default async function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getCourse(id);

  if (!course) {
    notFound();
  }

  const totalLectures = course.sections?.reduce((acc: number, s: any) => acc + (s.lectures?.length || 0), 0) || 0;
  const totalSections = course.sections?.length || 0;
  const thumbnailUrl = course.thumbnailUrl && typeof course.thumbnailUrl === 'string' && !course.thumbnailUrl.startsWith('[object') ? course.thumbnailUrl : null;

  return (
    <div className="min-h-screen bg-canvas font-sans selection:bg-primary-bg selection:text-ink">

      {/* ── Hero / Header Banner ────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0a0a14] via-[#0f0f1e] to-[#0a0a0a] border-b border-hairline">
        {/* Ambient glow */}
        <div className="absolute -top-[120px] left-[20%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(94,106,210,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 right-[10%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(130,143,255,0.07)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-12 md:py-20 flex flex-col lg:flex-row gap-10 lg:gap-14 items-start lg:items-center relative z-10">
          
          {/* Left: Course Info */}
          <div className="flex-1 min-w-0 order-2 lg:order-1">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 mb-6 text-[13px] text-ink-subtle overflow-hidden whitespace-nowrap">
              <Link href="/dashboard" className="text-ink-subtle hover:text-ink transition-colors">Dashboard</Link>
              <span className="shrink-0">›</span>
              <Link href="/courses" className="text-ink-subtle hover:text-ink transition-colors">Courses</Link>
              <span className="shrink-0">›</span>
              <span className="text-ink-muted truncate">{course.title}</span>
            </div>

            {/* Category + Level badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              {course.category && (
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                  {course.category}
                </span>
              )}
              {course.level && (
                <span className="inline-flex items-center gap-1.5 bg-success/10 text-success border border-success/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                  {course.level}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-[32px] sm:text-[40px] md:text-[48px] font-extrabold tracking-tight leading-[1.1] mb-5 text-white">
              {course.title}
            </h1>

            {/* Subtitle */}
            {course.subtitle && (
              <p className="text-base sm:text-lg text-ink-muted mb-7 leading-relaxed max-w-[580px]">
                {course.subtitle}
              </p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap gap-4 sm:gap-6 items-center text-sm text-ink-subtle mb-8">
              <div className="flex items-center gap-1.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span>⭐ 4.8</span>
                <span className="text-hairline-strong">·</span>
                <span>1,240 students</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
                <span>{totalSections} sections</span>
                <span className="text-hairline-strong">·</span>
                <span>{totalLectures} lectures</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>{course.language || 'English'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Status badge */}
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold tracking-widest uppercase ${course.status === 'PUBLISHED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {course.status || 'DRAFT'}
                </span>
              </div>
            </div>

            {/* Instructor tag */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-[#828fff] text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                IN
              </div>
              <div>
                <div className="text-[11px] text-ink-subtle tracking-widest uppercase font-bold mb-0.5">Instructor</div>
                <div className="text-[13px] text-ink-muted font-bold">NexusEd Instructor</div>
              </div>
            </div>
          </div>

          {/* Right: Thumbnail Preview Card */}
          <div className="w-full lg:w-[380px] shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] bg-surface-1 aspect-video relative order-1 lg:order-2 group cursor-pointer">
            {thumbnailUrl ? (
              <Image src={thumbnailUrl} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 1024px) 100vw, 380px" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(94,106,210,0.4)" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
                <span className="text-primary/50 text-xs font-semibold">No Thumbnail</span>
              </div>
            )}
            {/* Play overlay */}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
              <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.4)] group-hover:scale-110 transition-transform">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--primary)" stroke="var(--primary)" strokeWidth="1.5" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content + Sidebar ───────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-10 md:py-12 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

        {/* Main Content Column */}
        <div className="flex-1 min-w-0 order-2 lg:order-1 w-full">

          {/* What you'll learn */}
          {course.objectives && course.objectives.length > 0 && (
            <section className="bg-surface-1 border border-hairline rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold text-ink tracking-tight mb-5 flex items-center gap-2.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                What you'll learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {course.objectives.map((obj: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-ink-muted leading-relaxed">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" className="shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {obj}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Description */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-ink tracking-tight mb-4">About this course</h2>
            <div className="text-[15px] text-ink-muted leading-relaxed border-l-2 border-hairline-strong pl-5">
              {course.description || 'No description provided.'}
            </div>
          </section>

          {/* Curriculum */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <h2 className="text-xl font-bold text-ink tracking-tight">
                Course Curriculum
              </h2>
              <div className="text-[13px] text-ink-subtle font-medium">
                {totalSections} sections <span className="text-hairline-strong px-1">·</span> {totalLectures} lectures
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {course.sections && course.sections.length > 0 ? (
                course.sections.map((section: any, index: number) => (
                  <div key={section.id} className="bg-surface-1 border border-hairline rounded-xl overflow-hidden transition-all hover:border-hairline-strong">
                    {/* Section Header */}
                    <div className={`p-4 bg-surface-2 flex items-center justify-between ${section.lectures?.length > 0 ? 'border-b border-hairline' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-md bg-primary/15 text-primary flex items-center justify-center text-[11px] font-extrabold shrink-0">
                          {index + 1}
                        </div>
                        <span className="font-semibold text-ink text-sm sm:text-[15px]">{section.title}</span>
                      </div>
                      <span className="text-xs text-ink-subtle font-semibold bg-surface-3 px-2.5 py-1 rounded-full shrink-0">
                        {section.lectures?.length || 0} lectures
                      </span>
                    </div>

                    {/* Lectures */}
                    {section.lectures && section.lectures.length > 0 && (
                      <div className="flex flex-col">
                        {section.lectures.map((lecture: any, lIdx: number) => (
                          <div key={lecture.id} className={`flex items-center gap-3.5 p-3 sm:px-5 border-b border-hairline last:border-b-0 hover:bg-surface-2/50 transition-colors`}>
                            {/* Lecture type icon */}
                            <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${lecture.videoUrl ? 'bg-primary/10' : 'bg-white/5'}`}>
                              {lecture.videoUrl ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--primary)" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                              ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-ink-subtle" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[13px] sm:text-sm text-ink-muted font-medium truncate block">
                                <span className="text-ink-subtle mr-2">{lIdx + 1}.</span>
                                {lecture.title}
                              </span>
                            </div>
                            {lecture.videoUrl && (
                              <span className="hidden sm:inline-flex text-[11px] text-primary font-bold bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 shrink-0">
                                Preview
                              </span>
                            )}
                            {lecture.videoDuration > 0 && (
                              <span className="text-xs text-ink-subtle shrink-0 font-medium">
                                {Math.floor(lecture.videoDuration / 60)}:{String(lecture.videoDuration % 60).padStart(2, '0')}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-12 text-center bg-surface-1 rounded-xl border border-dashed border-hairline-strong text-ink-subtle">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-20"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/></svg>
                  <p className="m-0 text-sm font-medium">No curriculum added yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* Requirements */}
          {course.requirements && course.requirements.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-bold text-ink tracking-tight mb-4">Requirements</h2>
              <ul className="flex flex-col gap-2.5">
                {course.requirements.map((req: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-ink-muted">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink-subtle)" strokeWidth="2" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {req}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* ── Sticky Sidebar ──────────────────────────────────────────────── */}
        <div className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-8 order-1 lg:order-2">
          <div className="bg-surface-1 border border-hairline rounded-2xl p-6 sm:p-8 shadow-[0_20px_48px_rgba(0,0,0,0.4)]">

            {/* Price */}
            <div className="mb-5">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none flex items-baseline flex-wrap gap-2">
                {course.price === 0 ? (
                  <span className="text-success">Free</span>
                ) : (
                  <>
                    <span>₹{course.price}</span>
                    <span className="text-[15px] font-medium text-ink-subtle line-through">₹{(course.price * 2).toFixed(0)}</span>
                    <span className="text-[13px] font-bold text-warning">50% OFF</span>
                  </>
                )}
              </div>
            </div>

            {/* CTA Button */}
            <CourseEnrollButton courseId={course.id} />

            <p className="text-xs text-center text-ink-subtle mb-6 mt-3 font-medium">
              30-Day Money-Back Guarantee · No Questions Asked
            </p>

            {/* Divider */}
            <div className="h-px bg-hairline mb-5" />

            {/* Includes */}
            <div className="text-[13px] font-bold text-ink mb-3.5 tracking-widest uppercase">This course includes:</div>
            <div className="flex flex-col gap-3">
              {[
                { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>, text: `${totalLectures} video lectures` },
                { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, text: 'Downloadable resources' },
                { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>, text: 'Full lifetime access' },
                { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" width="16" height="16" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>, text: 'Certificate of completion' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-[13px] text-ink-muted font-medium">
                  <span className="text-primary shrink-0">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-hairline my-5" />

            {/* Share */}
            <div className="flex gap-2.5">
              <button className="flex-1 py-2 rounded-lg border border-hairline bg-transparent text-ink-subtle text-xs font-semibold hover:bg-surface-2 hover:text-ink transition-colors flex items-center justify-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                Share
              </button>
              <button className="flex-1 py-2 rounded-lg border border-hairline bg-transparent text-ink-subtle text-xs font-semibold hover:bg-surface-2 hover:text-ink transition-colors flex items-center justify-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                Wishlist
              </button>
            </div>
          </div>

          {/* Trust badge */}
          <div className="mt-4 bg-success/5 border border-success/15 rounded-xl p-3.5 flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <div>
              <div className="text-xs font-bold text-success mb-0.5">Trusted Platform</div>
              <div className="text-[11px] text-success/70 font-medium">Payments are 100% secured</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
