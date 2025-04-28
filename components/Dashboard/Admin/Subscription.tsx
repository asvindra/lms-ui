"use client";

import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getPlans, getSubscriptionStatus } from "@/lib/api/adminApi";

export default function AdminSubscriptionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: subscriptionData,
    isLoading: subLoading,
    error: subError,
    isFetching,
  } = useQuery({
    queryKey: ["adminSubscription"],
    queryFn: getSubscriptionStatus,
    retry: 2, // Retry failed queries twice
    refetchInterval: (data: any) =>
      data?.pending_subscriptions?.length > 0 ? 3000 : false, // Poll every 3 seconds if pending
  });

  const {
    data: plans = [],
    isLoading: plansLoading,
    error: plansError,
  } = useQuery({
    queryKey: ["plans"],
    queryFn: getPlans,
    retry: 2,
  });

  // Invalidate related queries when subscription becomes active
  useEffect(() => {
    if (
      subscriptionData?.subscription &&
      !subscriptionData?.pending_subscriptions?.length
    ) {
      queryClient.invalidateQueries({ queryKey: ["subscriptionStatus"] });
    }
  }, [subscriptionData, queryClient]);

  if (subLoading || plansLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (subError || plansError) {
    toast.error("Failed to load subscription or plans");
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">
          Error loading subscription or plans
        </Typography>
      </Box>
    );
  }

  const {
    subscription,
    pending_subscriptions = [],
    is_master,
  } = subscriptionData || {};

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Subscription
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Subscription Status
          </Typography>
          {is_master ? (
            <Typography color="primary">
              You are a Master Admin. No subscription required.
            </Typography>
          ) : (
            <>
              {pending_subscriptions.length > 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Checking subscription status... This may take a few seconds.
                  {isFetching && <CircularProgress size={16} sx={{ ml: 1 }} />}
                </Alert>
              )}
              {subscription ? (
                <>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Active Subscription
                  </Typography>
                  <Typography>Plan: {subscription.plan_name}</Typography>
                  <Typography>
                    Status:{" "}
                    {subscription.status.charAt(0).toUpperCase() +
                      subscription.status.slice(1)}
                  </Typography>
                  <Typography>Amount: ₹{subscription.amount / 100}</Typography>
                  <Typography>
                    Started:{" "}
                    {new Date(subscription.created_at).toLocaleDateString()}
                  </Typography>
                  {subscription.status === "pending" && (
                    <Typography color="warning.main" sx={{ mt: 1 }}>
                      Your subscription is being processed. This may take a few
                      seconds.
                    </Typography>
                  )}
                </>
              ) : (
                <Typography>No active subscription</Typography>
              )}
              {pending_subscriptions.length > 0 && (
                <>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mt: 2 }}
                  >
                    Pending Subscriptions
                  </Typography>
                  {pending_subscriptions.map((pending: any) => (
                    <Box key={pending.id} sx={{ mt: 1 }}>
                      <Typography>Plan: {pending.plan_name}</Typography>
                      <Typography>Status: {pending.status}</Typography>
                      <Typography>Amount: ₹{pending.amount / 100}</Typography>
                      <Typography color="warning.main">
                        Processing payment. Please wait a few seconds.
                      </Typography>
                    </Box>
                  ))}
                </>
              )}
              {!subscription && !is_master && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => router.push("/plans")}
                  sx={{ mt: 2 }}
                >
                  View Subscription Plans
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
      {plans.length > 0 && !is_master && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Available Plans
          </Typography>
          {plans.map((plan: any) => (
            <Card
              key={plan.id}
              sx={{
                mb: 2,
                bgcolor:
                  subscription?.plan_id === plan.id ? "grey.100" : "white",
              }}
            >
              <CardContent>
                <Typography variant="h6">{plan.name}</Typography>
                <Typography>
                  ₹{plan.amount / 100} /{plan.billing_cycle}
                </Typography>
                <Typography color="text.secondary">
                  {plan.description}
                </Typography>
                {subscription?.plan_id === plan.id && (
                  <Typography color="success.main" sx={{ mt: 1 }}>
                    This is your active plan
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
