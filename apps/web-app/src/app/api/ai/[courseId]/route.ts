import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/ai/[courseId]
 * Next.js API route that proxies AI query requests to the NestJS API Gateway.
 * Automatically forwards the user's JWT cookie for authentication.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  try {
    const res = await fetch(
      `http://localhost:3000/api/ai/courses/${courseId}/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || 'AI query failed' },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'AI service is temporarily unavailable.' },
      { status: 503 }
    );
  }
}
