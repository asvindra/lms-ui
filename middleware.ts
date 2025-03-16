import { NextRequest, NextResponse } from "next/server";
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from "./lib/constants/constants";
import { jwtVerify } from "jose";

const publicRoutes = PUBLIC_ROUTES;
const protectedRoutes = PROTECTED_ROUTES;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  console.log(`rq`, request);

  if (pathname.startsWith("/auth/verify") && request.nextUrl.search) {
    return NextResponse.next();
  }

  let isValidToken = false;
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret); // No crypto needed
      isValidToken = true;
      console.log("Token is valid");
    } catch (err) {
      console.log("Token is invalid or expired:", (err as Error).message);
      isValidToken = false;
    }
  }

  if (isValidToken && publicRoutes.includes(pathname)) {
    console.log("Valid token, redirecting to dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !isValidToken
  ) {
    console.log("No valid token, redirecting to login");
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set("token", "", { maxAge: -1 });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
