import React, { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardShell } from './DashboardShell';
import { PageSkeleton } from '@/components/PageSkeleton';

async function getProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  try {
    const res = await fetch(`${process.env.API_GATEWAY_URL}/api/user/profile`, {
      headers: { Cookie: `token=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  if (!profile) {
    redirect('/login');
  }

  return (
    <DashboardShell profile={profile}>
      <Suspense fallback={<PageSkeleton />}>
        {children}
      </Suspense>
    </DashboardShell>
  );
}
