import React from 'react';
import { cookies } from 'next/headers';

async function getProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  try {
    const res = await fetch('http://localhost:3000/api/user/profile', {
      headers: { Cookie: `token=${token}` },
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export default async function DashboardPage() {
  const profile = await getProfile();

  if (!profile) {
    return <div className="p-8">Please log in to view the dashboard.</div>;
  }

  const isInstructor = profile.role === 'INSTRUCTOR';

  return (
    <div className="max-w-[1200px] mx-auto">
      <h1 className="font-sans text-[32px] font-semibold text-ink tracking-tighter mb-2">
        Welcome back, {profile.firstName || 'User'}!
      </h1>
      <p className="font-sans text-base text-ink-muted mb-10">
        {isInstructor ? "Here's how your courses are performing today." : "Ready to continue learning?"}
      </p>

      {/* Metrics Section */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mb-12">
        {isInstructor ? (
          <>
            <div className="bg-surface-1 border border-solid border-hairline rounded-xl p-6 flex flex-col gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="font-sans text-sm font-medium text-ink-muted">Total Students</div>
              <div className="font-sans text-4xl font-semibold text-ink tracking-tighter">1,248</div>
            </div>
            <div className="bg-surface-1 border border-solid border-hairline rounded-xl p-6 flex flex-col gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="font-sans text-sm font-medium text-ink-muted">Active Courses</div>
              <div className="font-sans text-4xl font-semibold text-ink tracking-tighter">3</div>
            </div>
            <div className="bg-surface-1 border border-solid border-hairline rounded-xl p-6 flex flex-col gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="font-sans text-sm font-medium text-ink-muted">Total Revenue</div>
              <div className="font-sans text-4xl font-semibold text-ink tracking-tighter">$4,500</div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-surface-1 border border-solid border-hairline rounded-xl p-6 flex flex-col gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="font-sans text-sm font-medium text-ink-muted">Courses Enrolled</div>
              <div className="font-sans text-4xl font-semibold text-ink tracking-tighter">4</div>
            </div>
            <div className="bg-surface-1 border border-solid border-hairline rounded-xl p-6 flex flex-col gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="font-sans text-sm font-medium text-ink-muted">Hours Learned</div>
              <div className="font-sans text-4xl font-semibold text-ink tracking-tighter">24h 30m</div>
            </div>
            <div className="bg-surface-1 border border-solid border-hairline rounded-xl p-6 flex flex-col gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="font-sans text-sm font-medium text-ink-muted">Certificates</div>
              <div className="font-sans text-4xl font-semibold text-ink tracking-tighter">1</div>
            </div>
          </>
        )}
      </div>

      {/* Courses / Activity Grid */}
      <h2 className="font-sans text-xl font-semibold text-ink mb-6">
        {isInstructor ? "Recent Course Engagement" : "Continue Watching"}
      </h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex flex-col gap-3 cursor-pointer transition-transform duration-200 hover:scale-[1.02]">
            <div className="w-full aspect-[16/9] bg-surface-2 rounded-lg border border-solid border-hairline overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #18191a, #23252a)' }}></div>
            <div className="flex flex-col gap-1">
              <div className="font-sans text-base font-semibold text-ink">Advanced System Design</div>
              <div className="font-sans text-sm text-ink-subtle">
                {isInstructor ? "120 active students" : "65% completed"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
