// ClientLayout.tsx
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

const publicRoutes = ["/", "/auth/login", "/auth/signup", "/auth/verify"];
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/settings",
  "/analytics",
  "/students",
  "/settings/shifts",
];

export default function ClientLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentToken = localStorage.getItem("token"); // Default token for testing
    setToken(currentToken);
    console.log(
      `[ClientLayout] Pathname: ${pathname}, Token: ${currentToken || "none"}`
    );

    if (protectedRoutes.includes(pathname) && !currentToken) {
      setIsLoading(true);
      const redirectUrl = `/auth/login?redirect=${encodeURIComponent(
        pathname
      )}`;
      console.log(`[ClientLayout] Redirecting to: ${redirectUrl}`);
      router.push(redirectUrl);
    } else {
      setIsLoading(false);
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
          <CssBaseline /> {/* Normalize browser styles */}
          {showLayout ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh", // Full viewport height
                bgcolor: "grey.100", // Subtle background for depth
              }}
            >
              <Header />
              <Box
                sx={{
                  display: "flex",
                  flexGrow: 1,
                  overflow: "hidden", // Prevent outer scrolling
                }}
              >
                <Sidebar />
                <Box
                  component="main"
                  sx={{
                    flexGrow: 1,
                    ml: { xs: "80px", sm: "240px" }, // Sidebar offset
                    mt: "64px", // Header offset
                    p: 4, // Generous padding for a spacious feel
                    minHeight: "calc(100vh - 64px)", // Fit remaining space
                    bgcolor: "background.paper", // White content area
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)", // Subtle elevation
                    borderRadius: 2, // Rounded corners for modern look
                    display: "flex",
                    flexDirection: "column",
                    overflowY: "hidden", // No scrolling until content overflows
                    transition: "margin-left 0.3s ease",
                  }}
                >
                  {isLoading && <Loader />}
                  {children}
                </Box>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                minHeight: "100vh",
                bgcolor: "grey.100", // Consistent background
                display: "flex",
                flexDirection: "column",
                overflowY: "hidden", // No scrolling until content overflows
              }}
            >
              {isLoading && <Loader />}
              {children}
            </Box>
          )}
        </ThemeProvider>
      </QueryProvider>
    </StudentProvider>
  );
}
