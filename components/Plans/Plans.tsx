"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  useCreateSubscription,
  usePlans,
  useSubscriptionStatus,
} from "@/lib/hooks/usePlans";

export default function AdminPlansPage() {
  const { data: plans = [], isLoading, error } = usePlans();
  const { data: subscriptionStatus, isLoading: statusLoading } =
    useSubscriptionStatus();
  const createSubscription = useCreateSubscription();
  const router = useRouter();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);

  // Load Razorpay checkout script
  useEffect(() => {
    if ((window as any).Razorpay) {
      console.log("Razorpay already loaded");
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      setScriptError("Failed to load payment gateway");
      toast.error("Unable to load payment gateway. Please try again.");
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (!scriptLoaded || !(window as any).Razorpay) {
      toast.error("Payment gateway not loaded. Please refresh and try again.");
      return;
    }

    try {
      const userEmail = localStorage.getItem("userEmail") || "admin@gmail.com"; // Replace with auth
      const userPhone = localStorage.getItem("userPhone") || "1234567890"; // Replace with auth
      console.log(
        "Initiating subscription for plan:",
        planId,
        "Email:",
        userEmail
      );

      const { subscription_id, razorpay_key_id } =
        await createSubscription.mutateAsync({
          plan_id: planId,
          customer_email: userEmail,
          customer_phone: userPhone,
        });

      if (!subscription_id || !razorpay_key_id) {
        throw new Error("Invalid subscription or key ID from server");
      }

      console.log("Razorpay options:", { subscription_id, razorpay_key_id });

      const options = {
        key: razorpay_key_id,
        subscription_id,
        name: "LMS Subscription",
        description: "Subscribe to LMS plan",
        handler: function (response: any) {
          console.log("Payment successful:", response);
          toast.success("Payment successful! Subscription is being processed.");
          router.push("/payments/success");
        },
        prefill: {
          email: userEmail,
          contact: userPhone,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response);
        toast.error(
          `Payment failed: ${response.error?.description || "Unknown error"}`
        );
        router.push("/payments/cancel");
      });
      rzp.open();
    } catch (err: any) {
      console.error("Subscription error:", err);
      toast.error(
        `Failed to initiate subscription: ${err.message || "Unknown error"}`
      );
    }
  };

  if (isLoading || statusLoading) return <CircularProgress />;
  if (error)
    return <Typography>Error loading plans: {error.message}</Typography>;
  if (scriptError) return <Typography>{scriptError}</Typography>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Subscription Plans
      </Typography>
      <Typography variant="body1" gutterBottom>
        {subscriptionStatus?.is_subscribed
          ? "You are currently subscribed!"
          : "Choose a plan to subscribe."}
      </Typography>
      <Grid container spacing={3}>
        {plans.map((plan: any) => (
          <Grid item xs={12} sm={6} md={4} key={plan.id}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  {plan.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {plan.description}
                </Typography>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  ₹{plan.amount / 100}{" "}
                  {plan.billing_cycle === "lifetime"
                    ? ""
                    : `/${plan.billing_cycle}`}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={
                    createSubscription.isPending ||
                    !scriptLoaded ||
                    subscriptionStatus?.is_subscribed
                  }
                >
                  {createSubscription.isPending ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
