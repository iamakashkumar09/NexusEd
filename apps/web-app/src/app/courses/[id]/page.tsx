import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CourseEnrollButton from './CourseEnrollButton';

async function getCourse(id: string) {
  try {
    const res = await fetch(`http://localhost:3000/api/courses/${id}`, {
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
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', fontFamily: 'var(--font-sans)' }}>

      {/* ── Hero / Header Banner ────────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0a0a14 0%, #0f0f1e 40%, #0a0a0a 100%)', borderBottom: '1px solid var(--hairline)' }}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: -120, left: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(94,106,210,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(130,143,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 40px', display: 'flex', gap: 56, alignItems: 'center', position: 'relative' }}>
          {/* Left: Course Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontSize: 13, color: 'var(--ink-subtle)' }}>
              <Link href="/dashboard" style={{ color: 'var(--ink-subtle)', textDecoration: 'none' }}>Dashboard</Link>
              <span>›</span>
              <Link href="/courses" style={{ color: 'var(--ink-subtle)', textDecoration: 'none' }}>Courses</Link>
              <span>›</span>
              <span style={{ color: 'var(--ink-muted)' }}>{course.title}</span>
            </div>

            {/* Category + Level badges */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {course.category && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(94,106,210,0.15)', color: 'var(--primary)', border: '1px solid rgba(94,106,210,0.3)', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {course.category}
                </span>
              )}
              {course.level && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(39,166,68,0.12)', color: '#4ade80', border: '1px solid rgba(39,166,68,0.2)', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {course.level}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.08, marginBottom: 18, color: '#fff' }}>
              {course.title}
            </h1>

            {/* Subtitle */}
            {course.subtitle && (
              <p style={{ fontSize: 17, color: 'rgba(208,214,224,0.8)', marginBottom: 28, lineHeight: 1.6, maxWidth: 580 }}>
                {course.subtitle}
              </p>
            )}

            {/* Meta row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', fontSize: 14, color: 'var(--ink-subtle)', marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span>⭐ 4.8</span>
                <span style={{ color: 'var(--hairline-strong)' }}>·</span>
                <span>1,240 students</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
                <span>{totalSections} sections</span>
                <span style={{ color: 'var(--hairline-strong)' }}>·</span>
                <span>{totalLectures} lectures</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>{course.language || 'English'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {/* Status badge */}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: course.status === 'PUBLISHED' ? 'rgba(39,166,68,0.1)' : 'rgba(255,165,0,0.1)', color: course.status === 'PUBLISHED' ? '#4ade80' : '#fbbf24', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                  {course.status || 'DRAFT'}
                </span>
              </div>
            </div>

            {/* Instructor tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #828fff)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                IN
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--ink-subtle)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700 }}>Instructor</div>
                <div style={{ fontSize: 14, color: 'var(--ink-muted)', fontWeight: 600 }}>NexusEd Instructor</div>
              </div>
            </div>
          </div>

          {/* Right: Thumbnail Preview Card */}
          <div style={{ width: 380, flexShrink: 0, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 64px rgba(0,0,0,0.5)', background: 'var(--surface-1)', aspectRatio: '16/9', position: 'relative' }}>
            {thumbnailUrl ? (
              <Image src={thumbnailUrl} alt={course.title} fill style={{ objectFit: 'cover' }} />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(94,106,210,0.4)" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
                <span style={{ color: 'rgba(94,106,210,0.5)', fontSize: 12, fontWeight: 600 }}>No Thumbnail</span>
              </div>
            )}
            {/* Play overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--primary)" stroke="var(--primary)" strokeWidth="1.5" style={{ marginLeft: 3 }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content + Sidebar ───────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 40px', display: 'flex', gap: 48, alignItems: 'flex-start' }}>

        {/* Main Content Column */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* What you'll learn */}
          {course.objectives && course.objectives.length > 0 && (
            <section style={{ background: 'var(--surface-1)', border: '1px solid var(--hairline)', borderRadius: 16, padding: 32, marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                What you'll learn
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px 24px' }}>
                {course.objectives.map((obj: string, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.5 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}><polyline points="20 6 9 17 4 12"/></svg>
                    {obj}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Description */}
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 16 }}>About this course</h2>
            <div style={{ fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.75, borderLeft: '2px solid var(--hairline-strong)', paddingLeft: 20 }}>
              {course.description || 'No description provided.'}
            </div>
          </section>

          {/* Curriculum */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                Course Curriculum
              </h2>
              <div style={{ fontSize: 13, color: 'var(--ink-subtle)', fontWeight: 500 }}>
                {totalSections} sections · {totalLectures} lectures
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {course.sections && course.sections.length > 0 ? (
                course.sections.map((section: any, index: number) => (
                  <div key={section.id} style={{ background: 'var(--surface-1)', border: '1px solid var(--hairline)', borderRadius: 12, overflow: 'hidden' }}>
                    {/* Section Header */}
                    <div style={{ padding: '14px 20px', background: 'var(--surface-2)', borderBottom: section.lectures?.length > 0 ? '1px solid var(--hairline)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(94,106,210,0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                          {index + 1}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 14 }}>{section.title}</span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--ink-subtle)', fontWeight: 600, background: 'var(--surface-3)', padding: '3px 10px', borderRadius: 999 }}>
                        {section.lectures?.length || 0} lectures
                      </span>
                    </div>

                    {/* Lectures */}
                    {section.lectures && section.lectures.length > 0 && (
                      <div>
                        {section.lectures.map((lecture: any, lIdx: number) => (
                          <div key={lecture.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: lIdx < section.lectures.length - 1 ? '1px solid var(--hairline)' : 'none', transition: 'background 0.15s' }}>
                            {/* Lecture type icon */}
                            <div style={{ width: 28, height: 28, borderRadius: 6, background: lecture.videoUrl ? 'rgba(94,106,210,0.12)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {lecture.videoUrl ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--primary)" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                              ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink-subtle)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span style={{ fontSize: 14, color: 'var(--ink-muted)', fontWeight: 500, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                <span style={{ color: 'var(--ink-subtle)', marginRight: 8 }}>{lIdx + 1}.</span>
                                {lecture.title}
                              </span>
                            </div>
                            {lecture.videoUrl && (
                              <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, flexShrink: 0, background: 'rgba(94,106,210,0.08)', padding: '3px 10px', borderRadius: 999, border: '1px solid rgba(94,106,210,0.2)' }}>
                                Preview
                              </span>
                            )}
                            {lecture.videoDuration > 0 && (
                              <span style={{ fontSize: 12, color: 'var(--ink-subtle)', flexShrink: 0 }}>
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
                <div style={{ padding: 48, textAlign: 'center', background: 'var(--surface-1)', borderRadius: 12, border: '1px dashed var(--hairline-strong)', color: 'var(--ink-subtle)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" style={{ marginBottom: 12 }}><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/></svg>
                  <p style={{ margin: 0, color: 'var(--ink-subtle)', fontSize: 14 }}>No curriculum added yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* Requirements */}
          {course.requirements && course.requirements.length > 0 && (
            <section style={{ marginTop: 40 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 16 }}>Requirements</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {course.requirements.map((req: string, i: number) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--ink-muted)' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink-subtle)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {req}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* ── Sticky Sidebar ──────────────────────────────────────────────── */}
        <div style={{ width: 320, flexShrink: 0, position: 'sticky', top: 32 }}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--hairline)', borderRadius: 20, padding: 28, boxShadow: '0 20px 48px rgba(0,0,0,0.4)' }}>

            {/* Price */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>
                {course.price === 0 ? (
                  <span style={{ color: '#4ade80' }}>Free</span>
                ) : (
                  <>
                    <span>₹{course.price}</span>
                    <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink-subtle)', marginLeft: 8, textDecoration: 'line-through' }}>₹{(course.price * 2).toFixed(0)}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', marginLeft: 8 }}>50% OFF</span>
                  </>
                )}
              </div>
            </div>

            {/* CTA Button */}
            <CourseEnrollButton courseId={course.id} />

            <p style={{ fontSize: 12, textAlign: 'center', color: 'var(--ink-subtle)', marginBottom: 24 }}>
              30-Day Money-Back Guarantee · No Questions Asked
            </p>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--hairline)', marginBottom: 20 }} />

            {/* Includes */}
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 14, letterSpacing: '0.04em', textTransform: 'uppercase' }}>This course includes:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>, text: `${totalLectures} video lectures` },
                { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, text: 'Downloadable resources' },
                { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>, text: 'Full lifetime access' },
                { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" width="16" height="16" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>, text: 'Certificate of completion' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--ink-muted)' }}>
                  <span style={{ color: 'var(--primary)', flexShrink: 0 }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--hairline)', margin: '20px 0' }} />

            {/* Share */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid var(--hairline)', background: 'transparent', color: 'var(--ink-subtle)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                Share
              </button>
              <button style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid var(--hairline)', background: 'transparent', color: 'var(--ink-subtle)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                Wishlist
              </button>
            </div>
          </div>

          {/* Trust badge */}
          <div style={{ marginTop: 16, background: 'rgba(39,166,68,0.08)', border: '1px solid rgba(39,166,68,0.15)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>Trusted Platform</div>
              <div style={{ fontSize: 11, color: 'rgba(74,222,128,0.7)' }}>Payments are 100% secured</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
