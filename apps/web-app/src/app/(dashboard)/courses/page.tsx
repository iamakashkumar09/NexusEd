import React from 'react';
import { cookies } from 'next/headers';
import { CoursesClient } from './CoursesClient';

async function getProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return { role: 'STUDENT' };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/user/profile`, {
      headers: { Cookie: `token=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return { role: 'STUDENT' };
    return await res.json();
  } catch {
    return { role: 'STUDENT' };
  }
}

export default async function CoursesPage() {
  const profile = await getProfile();
  return <CoursesClient role={profile?.role || 'STUDENT'} />;
}
