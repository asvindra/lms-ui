"use client";

import { Typography, Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <Typography variant="h2" gutterBottom>
        Welcome to the Admin Dashboard
      </Typography>
      <Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push("/auth/signup")}
          sx={{ mr: 2, py: 1.5 }}
        >
          Sign Up
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => router.push("/auth/login")}
          sx={{ py: 1.5 }}
        >
          Log In
        </Button>
      </Box>
    </Box>
  );
}
