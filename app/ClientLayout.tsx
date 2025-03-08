"use client";

import { ReactNode, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { QueryProvider } from "@/lib/providers/QueryProviders";
import { theme } from "@/lib/mui-theme";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Sync localStorage with cookies on mount
    const cookieToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (cookieToken && !localStorage.getItem("token")) {
      localStorage.setItem("token", cookieToken);
    } else if (!cookieToken && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [router]);

  return (
    <QueryProvider>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </QueryProvider>
  );
}
