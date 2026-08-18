import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// All routes that require authentication
const PROTECTED_PATHS = [
  '/dashboard',
  '/courses',
  '/catalog',
  '/profile',
  '/settings',
  '/analytics',
  '/messages',
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Protect authenticated routes
  const isProtected = PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Handle logout route to clear cookies and break redirect loops
  if (pathname === '/logout') {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    response.cookies.delete('refreshToken');
    return response;
  }

  // Prevent logged-in users from seeing login/register
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/courses/:path*',
    '/catalog/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/analytics/:path*',
    '/messages/:path*',
    '/login',
    '/register',
  ],
};
