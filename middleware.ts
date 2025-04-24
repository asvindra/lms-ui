import { NextRequest, NextResponse } from "next/server";
import {
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
  STUDENT_ROUTES,
} from "./lib/constants/constants";
import { jwtVerify } from "jose";

const publicRoutes = PUBLIC_ROUTES;
const protectedRoutes = PROTECTED_ROUTES;
const studentRoutes = STUDENT_ROUTES;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  console.log("middleware: Pathname:", pathname);
  console.log("middleware: Token found:", token ? "Yes" : "No");
  console.log("middleware: Environment:", {
    JWT_SECRET: process.env.JWT_SECRET ? "Set" : "Not set",
  });

  if (pathname.startsWith("/auth/verify") && request.nextUrl.search) {
    console.log("middleware: Allowing /auth/verify with query params");
    return NextResponse.next();
  }

  if (pathname === "/auth/login" || pathname === "/auth/signup") {
    console.log(`middleware: Skipping redirect for ${pathname}`);
    return NextResponse.next();
  }

  let isValidToken = false;
  let role: string | undefined;
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      isValidToken = true;
      role = payload.role as string;
      console.log("middleware: Token is valid, role:", role);
    } catch (err) {
      console.log(
        "middleware: Token is invalid or expired:",
        (err as Error).message
      );
      isValidToken = false;
    }
  }

  if (!isValidToken) {
    if (
      protectedRoutes.some((route) => pathname.startsWith(route)) ||
      studentRoutes.some((route) => pathname.startsWith(route))
    ) {
      console.log("middleware: No valid token, redirecting to login");
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set("token", "", { maxAge: -1 });
      return response;
    }
    console.log("middleware: Allowing public route:", pathname);
    return NextResponse.next();
  }

  if (publicRoutes.includes(pathname)) {
    if (role === "admin") {
      console.log("middleware: Admin token, redirecting to dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else if (role === "student") {
      console.log("middleware: Student token, redirecting to student-home");
      return NextResponse.redirect(new URL("/student", request.url));
    }
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (role !== "admin") {
      console.log("middleware: Non-admin attempting admin route, redirecting");
      const redirectUrl = role === "student" ? "/student" : "/auth/login";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  if (studentRoutes.some((route) => pathname.startsWith(route))) {
    if (role !== "student") {
      console.log(
        "middleware: Non-student attempting student route, redirecting"
      );
      const redirectUrl = role === "admin" ? "/dashboard" : "/auth/login";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  console.log("middleware: Allowing valid request to:", pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
