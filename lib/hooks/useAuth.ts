import { useMutation, useQuery } from '@tanstack/react-query';
import { signup, login, sendVerificationEmail, verifyEmail, getVerifyStatus } from '../api/authApi';

export const useSignup = () => {
  return useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
      }
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: login,
  });
};

export const useSendVerificationEmail = () => {
  return useMutation({
    mutationFn: sendVerificationEmail,
  });
};

export const useVerifyEmail = (token: string) => {
  return useQuery({
    queryKey: ['verifyEmail', token],
    queryFn: () => verifyEmail(token),
    enabled: !!token,
    retry:false
  });
};

export const useVerifyStatus = () => {
  return useQuery({
    queryKey: ['verifyStatus'],
    queryFn: getVerifyStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};