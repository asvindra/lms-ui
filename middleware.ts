import { NextRequest, NextResponse } from 'next/server';
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from './lib/constants/constants';

const publicRoutes = PUBLIC_ROUTES
const protectedRoutes = PROTECTED_ROUTES

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value  // Default for testing

  console.log(`[Middleware] Pathname: ${pathname}, Token: ${token}`);

  if (publicRoutes.includes(pathname) || pathname.startsWith('/auth/verify?')) {
    console.log(`[Middleware] Allowing public route: ${pathname}`);
    return NextResponse.next();
  }

  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      console.log(`[Middleware] Redirecting to: ${loginUrl}`);
      return NextResponse.redirect(loginUrl);
    }
    console.log(`[Middleware] Allowing protected route: ${pathname}`);
    return NextResponse.next();
  }

  console.log(`[Middleware] Passing to Next.js: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};