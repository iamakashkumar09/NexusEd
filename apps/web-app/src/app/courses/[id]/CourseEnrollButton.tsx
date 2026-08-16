'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CourseEnrollButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetch('/api/courses/student/my-courses')
      .then((res) => {
        if (res.status === 401) {
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data) => {
        if (data?.courses?.some((c: any) => c.id === courseId)) {
          setEnrolled(true);
        }
      })
      .catch((err) => {
        console.error('Error checking enrollment status:', err);
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success || data.message === 'Successfully enrolled' || data.message === 'Already enrolled')) {
        setEnrolled(true);
        router.push(`/courses/${courseId}/learn`);
      } else {
        alert(data.message || 'Failed to enroll in this course.');
      }
    } catch (e) {
      console.error('Enrollment error:', e);
      alert('An unexpected error occurred while enrolling. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'block',
          width: '100%',
          padding: '14px 0',
          borderRadius: 10,
          background: 'var(--surface-3)',
          color: 'var(--ink-muted)',
          fontSize: 15,
          fontWeight: 700,
          marginBottom: 10,
          textAlign: 'center',
        }}
      >
        Checking enrollment...
      </div>
    );
  }

  if (enrolled) {
    return (
      <Link
        href={`/courses/${courseId}/learn`}
        style={{
          display: 'block',
          width: '100%',
          padding: '14px 0',
          borderRadius: 10,
          background: 'var(--primary)',
          color: '#fff',
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
          marginBottom: 10,
          letterSpacing: '-0.01em',
          textAlign: 'center',
          textDecoration: 'none',
          boxShadow: '0 4px 20px rgba(94,106,210,0.4)',
        }}
      >
        Continue Learning →
      </Link>
    );
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={enrolling}
      style={{
        display: 'block',
        width: '100%',
        padding: '14px 0',
        borderRadius: 10,
        background: '#4ade80',
        color: '#000',
        fontSize: 15,
        fontWeight: 700,
        cursor: enrolling ? 'not-allowed' : 'pointer',
        marginBottom: 10,
        letterSpacing: '-0.01em',
        textAlign: 'center',
        textDecoration: 'none',
        border: 'none',
        boxShadow: '0 4px 20px rgba(74,222,128,0.4)',
        transition: 'all 0.15s ease',
        opacity: enrolling ? 0.7 : 1,
      }}
    >
      {enrolling ? 'Enrolling...' : 'Enroll for Free'}
    </button>
  );
}
