"use client";

import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function Unauthorized() {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 64px)",
        bgcolor: "grey.100",
        p: 4,
        textAlign: "center",
      }}
    >
      <Typography variant="h4" color="error" gutterBottom>
        Unauthorized Access
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        You need an active subscription to access this page. Please subscribe to
        a plan to unlock all features.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => router.push("/dashboard/subscription")}
      >
        Go to Subscription
      </Button>
    </Box>
  );
}
