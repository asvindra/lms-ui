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
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from "@/lib/constants/constants";
import { ToastProvider } from "@/lib/context/ToastContext";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const protectedRoutes = PROTECTED_ROUTES; // e.g., ["/dashboard", "/profile"]
const publicRoutes = PUBLIC_ROUTES; // e.g., ["/auth/login", "/auth/signup", ...]

export default function ClientLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    setToken(currentToken);
    setIsLoading(false);

    // If token exists and user is on a public route, redirect to dashboard
    if (currentToken && publicRoutes.includes(pathname)) {
      router.push("/dashboard");
      return;
    }

    // If no token and user is on a protected route, redirect to login
    if (protectedRoutes.includes(pathname) && !currentToken) {
      const redirectUrl = `/auth/login?redirect=${encodeURIComponent(
        pathname
      )}`;
      router.push(redirectUrl);
    }
  }, [pathname, router]);

  const isProtectedRoute = protectedRoutes.includes(pathname);
  const showLayout = isProtectedRoute && !!token;

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
                <Header />
                <Box
                  sx={{
                    display: "flex",
                    flexGrow: 1,
                    overflow: "hidden",
                  }}
                >
                  <Sidebar />
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
