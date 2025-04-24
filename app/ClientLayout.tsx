"use client";

import { ReactNode, useEffect, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@/lib/mui-theme";
import { QueryProvider } from "@/lib/providers/QueryProviders";
import { useRouter, usePathname } from "next/navigation";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import Loader from "@/components/Loader/Loader";
import { Box, CssBaseline } from "@mui/material";
import { StudentProvider } from "@/lib/context/StudentContext";
import {
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
  STUDENT_ROUTES,
} from "@/lib/constants/constants";
import { ToastProvider } from "@/lib/context/ToastContext";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { decodeJwt } from "jose";
import { getAdminProfile } from "@/lib/api/adminApi";

const protectedRoutes = PROTECTED_ROUTES;
const publicRoutes = PUBLIC_ROUTES;
const studentRoutes = STUDENT_ROUTES;

interface JwtPayload {
  role: string;
  exp: number;
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  // Force navigation synchronization with hard navigation fallback
  useEffect(() => {
    console.log("ClientLayout: Navigation sync, pathname:", pathname);
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (currentPath !== pathname) {
        console.log("ClientLayout: Forcing hard navigation to:", pathname);
        window.location.assign(pathname); // Hard navigation fallback
      }
    }
  }, [pathname]);

  useEffect(() => {
    console.log("ClientLayout: useEffect triggered, pathname:", pathname);
    console.log("ClientLayout: Environment:", {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "Not set",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "Not set",
    });

    // Temporary token clear (remove after testing)
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0";
    console.log("ClientLayout: Cleared tokens on load for testing");

    const cookieToken = getCookie("token");
    const localStorageToken = localStorage.getItem("token");
    let currentToken = cookieToken || localStorageToken;
    console.log("ClientLayout: Cookie token:", cookieToken ? "Yes" : "No");
    console.log(
      "ClientLayout: LocalStorage token:",
      localStorageToken ? "Yes" : "No"
    );

    // Sync tokens
    if (cookieToken && !localStorageToken) {
      localStorage.setItem("token", cookieToken);
      currentToken = cookieToken;
    } else if (localStorageToken && !cookieToken) {
      document.cookie = `token=${localStorageToken}; path=/; max-age=3600`;
      currentToken = localStorageToken;
    }

    console.log("ClientLayout: Token found:", currentToken ? "Yes" : "No");
    setToken(currentToken);

    if (pathname === "/auth/login" || pathname === "/auth/signup") {
      console.log(`ClientLayout: Skipping redirect for ${pathname}`);
      setIsLoading(false);
      return;
    }

    if (currentToken) {
      try {
        const decoded = decodeJwt(currentToken) as JwtPayload;
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
          console.log(
            "ClientLayout: Token expired, redirecting to /auth/login"
          );
          localStorage.removeItem("token");
          document.cookie = "token=; path=/; max-age=0";
          router.push("/auth/login");
          return;
        }
        setRole(decoded.role);
        console.log("ClientLayout: Decoded role:", decoded.role);

        if (decoded.role === "admin") {
          console.log("ClientLayout: Fetching admin profile");
          getAdminProfile()
            .then((data: any) => {
              console.log("ClientLayout: Admin profile data:", data);
              const { admin } = data;
              if (admin.profile_photo) {
                setProfileImage(admin.profile_photo);
                localStorage.setItem("profileImage", admin.profile_photo);
              }
            })
            .catch((err: any) => {
              console.error(
                "ClientLayout: Failed to fetch admin profile:",
                err
              );
            });
        }
      } catch (err) {
        console.error("ClientLayout: Token decode error:", err);
        localStorage.removeItem("token");
        document.cookie = "token=; path=/; max-age=0";
        router.push("/auth/login");
        return;
      }
    }

    setIsLoading(false);

    if (currentToken && role) {
      console.log("ClientLayout: Token and role present, checking redirects");
      if (publicRoutes.includes(pathname)) {
        const redirectTo = role === "student" ? "/student" : "/dashboard";
        console.log(
          `ClientLayout: Redirecting from public route ${pathname} to ${redirectTo}`
        );
        router.push(redirectTo);
        return;
      }
      if (
        protectedRoutes.some((route) => pathname.startsWith(route)) &&
        role !== "admin"
      ) {
        const redirectTo = role === "student" ? "/student" : "/auth/login";
        console.log(
          `ClientLayout: Redirecting from protected route ${pathname} to ${redirectTo}`
        );
        router.push(redirectTo);
        return;
      }
      if (
        studentRoutes.some((route) => pathname.startsWith(route)) &&
        role !== "student"
      ) {
        const redirectTo = role === "admin" ? "/dashboard" : "/auth/login";
        console.log(
          `ClientLayout: Redirecting from student route ${pathname} to ${redirectTo}`
        );
        router.push(redirectTo);
        return;
      }
    } else if (
      (protectedRoutes.some((route) => pathname.startsWith(route)) ||
        studentRoutes.some((route) => pathname.startsWith(route))) &&
      !currentToken
    ) {
      const redirectUrl = `/auth/login?redirect=${encodeURIComponent(
        pathname
      )}`;
      console.log(
        `ClientLayout: No token, redirecting from ${pathname} to ${redirectUrl}`
      );
      router.push(redirectUrl);
    } else {
      console.log(`ClientLayout: Allowing navigation to ${pathname}`);
    }
  }, [pathname, router, role]);

  const isProtectedRoute =
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    role === "admin";
  const isStudentRoute =
    studentRoutes.some((route) => pathname.startsWith(route)) &&
    role === "student";
  const showLayout = (isProtectedRoute || isStudentRoute) && !!token;

  console.log("ClientLayout: showLayout:", showLayout);
  console.log("ClientLayout: Rendering children for pathname:", pathname);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <StudentProvider>
      <QueryProvider>
        <ThemeProvider theme={theme}>
          <ToastProvider>
            <ToastContainer />
            <CssBaseline />
            {showLayout ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "100vh",
                  bgcolor: "grey.100",
                }}
              >
                <Header profileImage={profileImage} role={role} />
                <Box
                  sx={{
                    display: "flex",
                    flexGrow: 1,
                    overflow: "hidden",
                  }}
                >
                  <Sidebar role={role} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      ml: { xs: "80px", sm: "240px" },
                      mt: "64px",
                      p: 4,
                      minHeight: "calc(100vh - 64px)",
                      bgcolor: "background.paper",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      overflowY: "hidden",
                      transition: "margin-left 0.3s ease",
                    }}
                  >
                    {children}
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box
                key={pathname}
                sx={{
                  minHeight: "100vh",
                  bgcolor: "grey.100",
                  display: "flex",
                  flexDirection: "column",
                  overflowY: "hidden",
                }}
              >
                {children}
              </Box>
            )}
          </ToastProvider>
        </ThemeProvider>
      </QueryProvider>
    </StudentProvider>
  );
}
