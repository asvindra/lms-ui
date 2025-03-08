import { useMutation, useQuery } from '@tanstack/react-query';
import { payFee, approveAdmin, getDashboard } from '../api/adminApi';

export const usePayFee = () => {
  return useMutation({
    mutationFn: payFee,
  });
};

export const useApproveAdmin = () => {
  return useMutation({
    mutationFn: approveAdmin,
  });
};

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};