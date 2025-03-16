import { NextRequest, NextResponse } from "next/server";
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from "./lib/constants/constants";

const publicRoutes = PUBLIC_ROUTES; // e.g., ["/auth/login", "/auth/signup", "/auth/verify", "/auth/forgot-password", "/auth/confirm-password"]
const protectedRoutes = PROTECTED_ROUTES; // e.g., ["/dashboard", "/profile"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  console.log(`rq`, request);

  // Allow /auth/verify with query params (e.g., /auth/verify?email=...) to proceed
  if (pathname.startsWith("/auth/verify") && request.nextUrl.search) {
    return NextResponse.next();
  }

  // If user has a token and tries to access a public route, redirect to dashboard
  if (token && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user tries to access a protected route without a token, redirect to login
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow all other requests to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
