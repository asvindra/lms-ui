"use client";

import React, { useEffect } from "react";
import { Container, Typography, Button } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const razorpay_payment_id = searchParams.get("razorpay_payment_id");
    const razorpay_subscription_id = searchParams.get(
      "razorpay_subscription_id"
    );
    if (razorpay_payment_id && razorpay_subscription_id) {
      toast.success("Subscription activated!");
    }
  }, [searchParams]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Subscription Successful
      </Typography>
      <Typography variant="body1">
        Thank you for subscribing! You now have access to premium features.
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
