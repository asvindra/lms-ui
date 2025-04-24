import { NextRequest, NextResponse } from "next/server";
import {
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
  STUDENT_ROUTES,
} from "./lib/constants/constants";
import { jwtVerify } from "jose";

const publicRoutes = PUBLIC_ROUTES;
const protectedRoutes = PROTECTED_ROUTES; // Admin routes
const studentRoutes = STUDENT_ROUTES; // Student routes

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  console.log(`Middleware: Processing request for ${pathname}`);
  console.log(`Environment:`, {
    JWT_SECRET: process.env.JWT_SECRET ? "Set" : "Not set",
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "Not set",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "Not set",
  });

  // Allow /auth/verify with query params to proceed
  if (pathname.startsWith("/auth/verify") && request.nextUrl.search) {
    console.log("Allowing /auth/verify with query params");
    return NextResponse.next();
  }

  // Explicitly allow /auth/login and /auth/signup
  if (pathname === "/auth/login" || pathname === "/auth/signup") {
    console.log(`Allowing public route: ${pathname}`);
    return NextResponse.next();
  }

  // Validate token and extract role
  let isValidToken = false;
  let role: string | undefined;
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined");
        throw new Error("JWT_SECRET is not defined");
      }
      const { payload } = await jwtVerify(token, secret);
      isValidToken = true;
      role = payload.role as string; // Assumes token has 'role' field
      console.log("Token is valid, role:", role);
    } catch (err) {
      console.error("Token verification failed:", (err as Error).message);
      isValidToken = false;
    }
  } else {
    console.log("No token found");
  }

  // If no valid token, redirect to login for protected or student routes
  if (!isValidToken) {
    if (
      protectedRoutes.some((route) => pathname.startsWith(route)) ||
      studentRoutes.some((route) => pathname.startsWith(route))
    ) {
      console.log(
        `No valid token, redirecting to /auth/login from ${pathname}`
      );
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set("token", "", { maxAge: -1 });
      return response;
    }
    console.log(`Allowing non-protected route: ${pathname}`);
    return NextResponse.next();
  }

  // Redirect from public routes based on role
  if (publicRoutes.includes(pathname)) {
    if (role === "admin") {
      console.log("Admin token, redirecting to /dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else if (role === "student") {
      console.log("Student token, redirecting to /student");
      return NextResponse.redirect(new URL("/student", request.url));
    }
  }

  // Protect admin routes from students
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (role !== "admin") {
      console.log(`Non-admin attempting admin route ${pathname}, redirecting`);
      const redirectUrl = role === "student" ? "/student" : "/auth/login";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  // Protect student routes from admins
  if (studentRoutes.some((route) => pathname.startsWith(route))) {
    if (role !== "student") {
      console.log(
        `Non-student attempting student route ${pathname}, redirecting`
      );
      const redirectUrl = role === "admin" ? "/dashboard" : "/auth/login";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  console.log(`Allowing valid request to proceed: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
