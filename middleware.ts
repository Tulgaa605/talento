import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';


export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  const { pathname } = request.nextUrl;

  const publicRoutes = [
    '/employer/login',
    '/employer/register',
    '/admin/login',
    '/jobseeker/login',
    '/jobseeker/register',
  ];

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const createRedirectUrl = (path: string) => {
    const baseUrl = request.nextUrl.clone();
    baseUrl.pathname = path;
    baseUrl.search = '';
    return baseUrl;
  };

  if (pathname.startsWith('/employer/hr')) {
    if (!token) {
      const loginUrl = createRedirectUrl('/employer/login');
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== 'EMPLOYER' && token.role !== 'ADMIN') {
      const loginUrl = createRedirectUrl('/employer/login');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Admin routes access control
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = createRedirectUrl('/admin/login');
      return NextResponse.redirect(loginUrl);
    }
    if (token.role !== 'ADMIN') {
      const loginUrl = createRedirectUrl('/admin/login');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Employer routes access control
  if (pathname.startsWith('/employer')) {
    if (!token) {
      const loginUrl = createRedirectUrl('/employer/login');
      return NextResponse.redirect(loginUrl);
    }
    if (token.role !== 'EMPLOYER' && token.role !== 'ADMIN') {
      const loginUrl = createRedirectUrl('/employer/login');
      return NextResponse.redirect(loginUrl);
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
