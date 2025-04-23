"use client";

import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

const fetchAdminSubscription = async () => {
  const res = await fetch("/api/admin/subscription", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch subscription");
  return res.json();
};

const createAdminSubscription = async () => {
  const res = await fetch("/api/admin/subscription", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) throw new Error("Failed to initiate subscription");
  return res.json();
};

export default function AdminSubscriptionPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminSubscription"],
    queryFn: fetchAdminSubscription,
  });

  const mutation = useMutation({
    mutationFn: createAdminSubscription,
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to initiate subscription");
      }
    },
    onError: (err: any) => {
      console.error("Error initiating subscription:", err);
      toast.error(err.message || "Failed to initiate subscription");
    },
  });

  //   if (isLoading) return <Typography>Loading...</Typography>;
  //   if (error) {
  //     toast.error("Failed to load subscription");
  //     return <Typography>Error loading subscription</Typography>;
  //   }

  const subscription = data?.subscription;
  const isMaster = data?.is_master;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Subscription
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6">Subscription Status</Typography>
          {isMaster ? (
            <Typography>
              You are a Master Admin. No subscription required.
            </Typography>
          ) : subscription ? (
            <>
              <Typography>Plan: {subscription.plan_name}</Typography>
              <Typography>Status: {subscription.status}</Typography>
              <Typography>Amount: ${subscription.amount}</Typography>
              <Typography>
                Started:{" "}
                {new Date(subscription.created_at).toLocaleDateString()}
              </Typography>
            </>
          ) : (
            <>
              <Typography>No active subscription</Typography>
              <Button
                variant="contained"
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                sx={{ mt: 2 }}
              >
                Subscribe to Master Admin Services
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
