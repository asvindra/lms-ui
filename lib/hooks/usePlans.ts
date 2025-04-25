import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiClient from "../api/apiClient";
import {
  CREATE_PLANS,
  CREATE_SUBSCRIPTION,
  DELETE_PLANS,
  GET_PLANS,
  GET_SUBSCRIPTION_STATUS,
  UPDATE_PLANS,
} from "../constants/endpoints";

// Get Plans
export const usePlans = () => {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await apiClient.get(GET_PLANS);
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to fetch plans");
    },
  });
};

// Create Plan
export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (plan: {
      name: string;
      description: string;
      amount: number;
      billing_cycle: "monthly" | "yearly" | "lifetime";
      interval_count: number;
    }) => {
      const response = await apiClient.post(CREATE_PLANS, plan);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to create plan");
    },
  });
};

// Update Plan
export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      plan,
    }: {
      id: string;
      plan: {
        name: string;
        description: string;
        amount: number;
        billing_cycle: "monthly" | "yearly" | "lifetime";
        interval_count: number;
      };
    }) => {
      const response = await apiClient.put(`${UPDATE_PLANS}/${id}`, plan);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to update plan");
    },
  });
};

// Delete Plan
export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${DELETE_PLANS}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to delete plan");
    },
  });
};

// Create Subscription
export const useCreateSubscription = () => {
  return useMutation({
    mutationFn: async ({
      plan_id,
      customer_email,
      customer_phone,
    }: {
      plan_id: string;
      customer_email: string;
      customer_phone: string;
    }) => {
      const response = await apiClient.post(`${CREATE_SUBSCRIPTION}`, {
        plan_id,
        customer_email,
        customer_phone,
      });
      return response.data;
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || "Failed to create subscription"
      );
    },
  });
};

export const useSubscriptionStatus = () => {
  return useQuery({
    queryKey: ["subscriptionStatus"],
    queryFn: async () => {
      const response = await apiClient.get(`${GET_SUBSCRIPTION_STATUS}`);
      return response.data;
    },
    retry: 3, // Retry if webhook is delayed
    retryDelay: 1000,
  });
};
