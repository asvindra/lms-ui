"use client";

import React from "react";
import { Container, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";

export default function CancelPage() {
  const router = useRouter();

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Subscription Cancelled
      </Typography>
      <Typography variant="body1">
        Your subscription was not completed. Please try again.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => router.push("/admin/plans")}
        sx={{ mt: 2 }}
      >
        Back to Plans
      </Button>
    </Container>
  );
}
