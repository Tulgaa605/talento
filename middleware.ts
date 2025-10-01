import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // HR routes access control - restrict to EMPLOYER and ADMIN only
  if (pathname.startsWith('/employer/hr')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token.role !== 'EMPLOYER' && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Admin routes access control
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Employer routes access control
  if (pathname.startsWith('/employer')) {
    if (!token) {
      return NextResponse.redirect(new URL('/employer/login', request.url));
    }
    if (token.role !== 'EMPLOYER' && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/employer/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/employer/hr/:path*',
    '/admin/:path*',
    '/employer/:path*',
  ],
};
