"use client";

import { ReactNode, useEffect, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@/lib/mui-theme";
import { QueryProvider } from "@/lib/providers/QueryProviders";
import { useRouter, usePathname } from "next/navigation";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import Loader from "@/components/Loader/Loader";
import { Box } from "@mui/material";

const publicRoutes = ["/", "/auth/login", "/auth/signup", "/auth/verify"];
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/settings",
  "/analytics",
  "/profile",
  "/settings",
];

export default function ClientLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentToken = localStorage.getItem("token") || "jws";
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
    <QueryProvider>
      <ThemeProvider theme={theme}>
        {showLayout ? (
          <>
            <Header />
            <Sidebar />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                mt: "64px",
                ml: { xs: "80px", sm: "240px" },
                transition: "margin-left 0.3s ease",
                height: "calc(100vh - 64px)", // Fit viewport minus Header
                overflowY: "auto", // Scroll within content if needed
              }}
            >
              {isLoading && <Loader />}
              {children}
            </Box>
          </>
        ) : (
          <Box sx={{ minHeight: "100vh", position: "relative" }}>
            {isLoading && <Loader />}
            {children}
          </Box>
        )}
      </ThemeProvider>
    </QueryProvider>
  );
}
