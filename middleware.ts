import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/', '/auth/login', '/auth/signup', '/auth/verify'];
const protectedRoutes = ['/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  console.log(`[Middleware] Pathname: ${pathname}, Token: ${token || 'none'}`);

  // Allow public routes without authentication
  if (publicRoutes.includes(pathname) || pathname.startsWith('/auth/verify?')) {
    console.log(`[Middleware] Allowing public route: ${pathname}`);
    return NextResponse.next();
  }

  // Protect authenticated routes
  if (protectedRoutes.includes(pathname)) {
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url); // Updated to /auth/login
      loginUrl.searchParams.set('redirect', pathname);
      console.log(`[Middleware] Redirecting to: ${loginUrl}`);
      return NextResponse.redirect(loginUrl);
    }
    console.log(`[Middleware] Allowing protected route: ${pathname}`);
    return NextResponse.next();
  }

  // For any other route, let Next.js handle it (404 if not defined)
  console.log(`[Middleware] Passing to Next.js: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};


