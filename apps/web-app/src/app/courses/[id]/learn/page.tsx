import React from 'react';
import { notFound } from 'next/navigation';
import { CoursePlayer } from './CoursePlayer';

async function getCourse(id: string) {
  try {
    const res = await fetch(`http://localhost:3000/api/courses/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lecture?: string }>;
}) {
  const { id } = await params;
  const { lecture: activeLectureId } = await searchParams;
  const course = await getCourse(id);

  if (!course) notFound();

  return (
    <CoursePlayer
      course={course}
      initialLectureId={activeLectureId || null}
    />
  );
}
