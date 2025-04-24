import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
  Box,
} from "@mui/material";
import axios from "axios";
import { useToast } from "../../lib/context/ToastContext";

export const SubscriptionPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => console.log("Razorpay SDK loaded");
    script.onerror = () => toastError("Failed to load Razorpay SDK");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [toastError]);
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get("/api/subscriptions/plans", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setPlans(response.data.plans);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch plans");
        setLoading(false);
        toastError("Failed to fetch plans");
      }
    };
    fetchPlans();
  }, [toastError]);

  const handleSubscribe = async (planId: string) => {
    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      toastError("Razorpay SDK not loaded. Please try again.");
      return;
    }

    try {
      const response = await axios.post(
        "/api/subscriptions",
        { planId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const { subscriptionId, razorpayOptions } = response.data;

      const razorpay = new window.Razorpay({
        ...razorpayOptions,
        handler: async (paymentResponse) => {
          try {
            await axios.post(
              "/api/subscriptions/verify",
              { subscriptionId, paymentResponse },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            toastSuccess("Subscription successful! You now have admin access.");
            window.location.href = "/profile";
          } catch (err) {
            toastError("Subscription verification failed");
          }
        },
      });
      razorpay.open();
    } catch (err) {
      toastError("Failed to initiate subscription");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", py: 8 }}>
      <Grid container spacing={3} sx={{ maxWidth: 1200, mx: "auto", px: 2 }}>
        <Grid item xs={12}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#1976d2" }}
          >
            Choose Your Subscription Plan
          </Typography>
        </Grid>
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.id}>
            <Card
              sx={{
                boxShadow: 3,
                "&:hover": { boxShadow: 6 },
                transition: "box-shadow 0.3s",
              }}
            >
              <CardContent>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "medium", color: "#1976d2" }}
                >
                  {plan.name}
                </Typography>
                <Typography variant="h6" sx={{ my: 2 }}>
                  ₹{plan.amount / 100}/month
                </Typography>
                <Typography sx={{ color: "#424242", mb: 4 }}>
                  {plan.description}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleSubscribe(plan.id)}
                  sx={{ bgcolor: "#1976d2", "&:hover": { bgcolor: "#1565c0" } }}
                >
                  Subscribe
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
