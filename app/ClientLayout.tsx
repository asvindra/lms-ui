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

const protectedRoutes = PROTECTED_ROUTES; // Admin routes
const publicRoutes = PUBLIC_ROUTES;
const studentRoutes = STUDENT_ROUTES; // Student routes

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

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    setToken(currentToken);

    if (currentToken) {
      try {
        const decoded = decodeJwt(currentToken) as JwtPayload;
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
          localStorage.removeItem("token");
          document.cookie = "token=; path=/; max-age=0";
          router.push("/auth/login");
          return;
        }
        setRole(decoded.role);
        console.log("Decoded role:", decoded.role);

        // Fetch profile image based on role
        if (decoded.role === "admin") {
          getAdminProfile()
            .then((data: any) => {
              console.log("data", data);
              const { admin } = data;

              if (admin.profile_photo) {
                setProfileImage(admin.profile_photo);
                localStorage.setItem("profileImage", admin.profile_photo); // Optional caching
              }
            })
            .catch((err: any) => {
              console.error("Failed to fetch admin profile:", err);
            });
        }
        // For students, you might need a similar API (e.g., getStudentProfile)
        // else if (decoded.role === "student") { ... }
      } catch (err) {
        console.error("Token decode error:", err);
        localStorage.removeItem("token");
        document.cookie = "token=; path=/; max-age=0";
        router.push("/auth/login");
        return;
      }
    }

    setIsLoading(false);

    // Redirect logic based on role and token
    if (currentToken && role) {
      if (publicRoutes.includes(pathname)) {
        router.push(role === "student" ? "/student" : "/dashboard");
        return;
      }
      if (
        protectedRoutes.some((route) => pathname.startsWith(route)) &&
        role !== "admin"
      ) {
        router.push(role === "student" ? "/student" : "/auth/login");
        return;
      }
      if (
        studentRoutes.some((route) => pathname.startsWith(route)) &&
        role !== "student"
      ) {
        router.push(role === "admin" ? "/dashboard" : "/auth/login");
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
      router.push(redirectUrl);
    }
  }, [pathname, router, role]);

  const isProtectedRoute =
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    role === "admin";
  const isStudentRoute =
    studentRoutes.some((route) => pathname.startsWith(route)) &&
    role === "student";
  const showLayout = (isProtectedRoute || isStudentRoute) && !!token;

  console.log("showLayout", showLayout);

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
