"use client";

import { useEffect, useState } from "react";
import { Typography, Box, CircularProgress, Button } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyEmail } from "@/lib/hooks/useAuth";

export default function Verify() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [message, setMessage] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useVerifyEmail(token);

  useEffect(() => {
    if (data) {
      setMessage(data.message);
      // Optionally redirect to dashboard after a delay
      setTimeout(() => router.push("/dashboard"), 3000);
    } else if (isError) {
      setMessage(
        error?.message ||
          "Failed to verify email. The token may be invalid or expired."
      );
    }
  }, [data, isError, error, router]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <Box
        sx={{
          maxWidth: 500,
          width: "100%",
          p: 4,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 6,
          textAlign: "center",
          m: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Email Verification
        </Typography>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography
              variant="body1"
              color={isError ? "error.main" : "success.main"}
              sx={{ mt: 2 }}
            >
              {message || "Verifying your email..."}
            </Typography>
            {data && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                Redirecting to dashboard in a few seconds...
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push("/dashboard")}
              sx={{ mt: 2, py: 1.5 }}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => router.push("/auth/login")}
              sx={{ mt: 2, ml: 2, py: 1.5 }}
            >
              Back to Login
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}
