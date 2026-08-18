import React from 'react';
import { CatalogClient } from './CatalogClient';

async function getCatalogCourses() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/courses/catalog`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.courses || [];
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return [];
  }
}

export default async function CatalogPage() {
  const courses = await getCatalogCourses();
  return <CatalogClient initialCourses={courses} />;
}
