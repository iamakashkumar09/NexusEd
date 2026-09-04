import { cookies } from 'next/headers';
import { DashboardContent } from './DashboardContent';

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
  } catch { return null; }
}

export default async function DashboardPage() {
  const profile = await getProfile();
  return <DashboardContent profile={profile} />;
}
