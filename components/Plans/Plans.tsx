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
  Alert,
} from "@mui/material";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateSubscription,
  usePlans,
  useSubscriptionStatus,
} from "@/lib/hooks/usePlans";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPlansPage() {
  const { data: plans = [], isLoading, error } = usePlans();
  const { data: subscriptionStatus, isLoading: statusLoading } =
    useSubscriptionStatus();
  const createSubscription = useCreateSubscription();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [showProcessing, setShowProcessing] = useState(false);

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

    console.log("Starting subscription for plan:", planId);
    setLoadingPlanId(planId);
    setShowProcessing(false);

    try {
      const userEmail = localStorage.getItem("userEmail") || "admin@gmail.com";
      const userPhone = localStorage.getItem("userPhone") || "1234567890";
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
        handler: async (response: any) => {
          console.log("Payment successful:", response);
          toast.success("Payment successful! Processing your subscription...");
          setShowProcessing(true);
          await queryClient.invalidateQueries({
            queryKey: ["subscriptionStatus"],
          });
          await queryClient.invalidateQueries({
            queryKey: ["adminSubscription"],
          });
          setTimeout(() => {
            console.log("Redirecting to /dashboard/subscription");
            router.push("/dashboard/subscription");
          }, 5000);
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
      rzp.on("payment.failed", (response: any) => {
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
    } finally {
      console.log("Clearing loading state for plan:", planId);
      setLoadingPlanId(null);
    }
  };

  if (isLoading || statusLoading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CircularProgress />
        </motion.div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ p: 4 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Typography color="error">
            Error loading plans: {error.message}
          </Typography>
        </motion.div>
      </Container>
    );
  }

  if (scriptError) {
    return (
      <Container sx={{ p: 4 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Typography color="error">{scriptError}</Typography>
        </motion.div>
      </Container>
    );
  }

  const hasPendingSubscription =
    subscriptionStatus?.pending_subscriptions?.length > 0;
  const isSubscribed = subscriptionStatus?.is_subscribed;

  return (
    <Container>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Typography variant="h4" gutterBottom>
          Subscription Plans
        </Typography>
        <Typography variant="body1" gutterBottom>
          {isSubscribed
            ? "You are currently subscribed!"
            : hasPendingSubscription
            ? "Your subscription is under processing."
            : "Choose a plan to subscribe."}
        </Typography>
        <AnimatePresence>
          {(showProcessing || hasPendingSubscription) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert severity="info" sx={{ mb: 2 }}>
                {showProcessing
                  ? "Your subscription is being processed. This may take a few seconds. You will be redirected to the subscription status page shortly."
                  : "Your subscription is under processing. Please wait until it is completed or canceled before subscribing again."}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
        <Grid container spacing={3}>
          {plans.map((plan: any) => (
            <Grid item xs={12} sm={6} md={4} key={plan.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * plans.indexOf(plan) }}
              >
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
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={
                          loadingPlanId !== null ||
                          !scriptLoaded ||
                          isSubscribed ||
                          hasPendingSubscription
                        }
                        sx={{ minWidth: 100 }}
                      >
                        <AnimatePresence mode="wait">
                          {loadingPlanId === plan.id ? (
                            <motion.div
                              key="loading"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <CircularProgress size={24} />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="subscribe"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              Subscribe
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </motion.div>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Container>
  );
}
