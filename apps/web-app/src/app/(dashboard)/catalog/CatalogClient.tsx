'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  level?: string;
  price?: number;
  thumbnailUrl?: string;
  instructorId?: string;
  sections?: any[];
}

const CATEGORIES = ['All', 'Web Development', 'AI / ML', 'Backend', 'Design', 'Mobile', 'Data Science'];

export function CatalogClient({ initialCourses }: { initialCourses: Course[] }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);

  const filtered = initialCourses.filter((course) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (course.category && course.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (selectedCategory === 'Web Development' && course.category?.toLowerCase().includes('web')) ||
      (selectedCategory === 'AI / ML' && (course.category?.toLowerCase().includes('ai') || course.category?.toLowerCase().includes('machine')));

    const matchesSearch =
      !search ||
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      (course.subtitle && course.subtitle.toLowerCase().includes(search.toLowerCase())) ||
      (course.category && course.category.toLowerCase().includes(search.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* ─── Hero / Header ─── */}
      <div
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #0d0e1a 0%, #151238 50%, #0d1a2a 100%)',
          border: '1px solid var(--hairline)',
          padding: '32px 36px',
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: 60,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'rgba(94,106,210,0.2)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -40,
            right: 180,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(166,130,255,0.15)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', maxWidth: 640 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--primary)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>🧭</span> Course Catalog
          </div>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: 'var(--ink)',
              letterSpacing: '-0.04em',
              marginBottom: 10,
              lineHeight: 1.15,
            }}
          >
            Explore & Master New Skills
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6 }}>
            Browse through expertly crafted interactive courses. Learn real-world development, machine learning, system architecture, and UI/UX design.
          </p>
        </div>
      </div>

      {/* ─── Controls: Search & Category Pills ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 999,
                    cursor: 'pointer',
                    background: active ? 'var(--primary)' : 'var(--surface-1)',
                    color: active ? '#fff' : 'var(--ink-subtle)',
                    fontSize: 13,
                    fontWeight: 600,
                    border: active ? '1px solid transparent' : '1px solid var(--hairline)',
                    transition: 'all 0.15s ease',
                    boxShadow: active ? '0 2px 12px rgba(94,106,210,0.4)' : 'none',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', width: 260, minWidth: 200 }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--ink-ghost)"
              strokeWidth="2"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: 10,
                background: 'var(--surface-1)',
                border: '1px solid var(--hairline)',
                color: 'var(--ink)',
                fontSize: 13,
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--ink-subtle)',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Counter summary */}
        <div style={{ fontSize: 13, color: 'var(--ink-subtle)', fontWeight: 500 }}>
          Showing <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{filtered.length}</span> course{filtered.length === 1 ? '' : 's'}
          {selectedCategory !== 'All' && <span> in <strong style={{ color: 'var(--primary)' }}>{selectedCategory}</strong></span>}
          {search && <span> matching "<strong style={{ color: 'var(--ink)' }}>{search}</strong>"</span>}
        </div>
      </div>

      {/* ─── Course Grid ─── */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 0',
            background: 'var(--surface-1)',
            borderRadius: 16,
            border: '1px dashed var(--hairline-strong)',
            color: 'var(--ink-subtle)',
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 14 }}>🔍</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>No courses found</h2>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)', maxWidth: 360, margin: '0 auto 16px' }}>
            Try adjusting your search criteria or category filter.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearch('');
            }}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              background: 'var(--surface-2)',
              border: '1px solid var(--hairline)',
              color: 'var(--ink)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24,
            marginBottom: 48,
          }}
        >
          {filtered.map((course) => {
            const isHovered = hoveredCourseId === course.id;
            const validThumb =
              course.thumbnailUrl &&
              typeof course.thumbnailUrl === 'string' &&
              !course.thumbnailUrl.startsWith('[object')
                ? course.thumbnailUrl
                : '/thumbnails/thumb_react.jpg';

            const totalLectures = course.sections?.reduce((acc: number, s: any) => acc + (s.lectures?.length || 0), 0) || 0;

            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
                onMouseEnter={() => setHoveredCourseId(course.id)}
                onMouseLeave={() => setHoveredCourseId(null)}
              >
                <div
                  style={{
                    background: 'var(--surface-1)',
                    border: `1px solid ${isHovered ? 'var(--hairline-strong)' : 'var(--hairline)'}`,
                    borderRadius: 16,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    transform: isHovered ? 'translateY(-4px)' : 'none',
                    boxShadow: isHovered ? '0 16px 48px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.25)',
                    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.15s, box-shadow 0.2s',
                  }}
                >
                  {/* Thumbnail Banner */}
                  <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative', background: 'var(--surface-3)', overflow: 'hidden' }}>
                    <Image
                      src={validThumb}
                      alt={course.title}
                      fill
                      sizes="380px"
                      style={{
                        objectFit: 'cover',
                        transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                        transition: 'transform 0.4s ease',
                      }}
                    />

                    {/* Category Chip */}
                    {course.category && (
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
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        {course.category}
                      </div>
                    )}

                    {/* Level / Status */}
                    {course.level && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 999,
                          background: 'rgba(39,166,68,0.2)',
                          color: '#4ade80',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(39,166,68,0.3)',
                        }}
                      >
                        {course.level}
                      </div>
                    )}

                    {/* Hover Play Button */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'rgba(94,106,210,0.95)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 0 0 6px rgba(94,106,210,0.25)',
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: 2 }}>
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '18px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: 'var(--ink)',
                        letterSpacing: '-0.02em',
                        marginBottom: 6,
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {course.title}
                    </h3>

                    <p
                      style={{
                        fontSize: 13,
                        color: 'var(--ink-subtle)',
                        marginBottom: 16,
                        lineHeight: 1.45,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {course.subtitle || 'Learn complete fundamentals with step-by-step hands-on tutorials and projects.'}
                    </p>

                    {/* Metadata summary */}
                    <div
                      style={{
                        marginTop: 'auto',
                        paddingTop: 14,
                        borderTop: '1px solid var(--hairline)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-subtle)' }}>
                        <span>⭐ 4.8</span>
                        <span>·</span>
                        <span>{totalLectures > 0 ? `${totalLectures} lectures` : 'Interactive'}</span>
                      </div>

                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: course.price === 0 || !course.price ? '#4ade80' : 'var(--ink)',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {course.price === 0 || !course.price ? 'Free' : `₹${course.price}`}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
