import { useMutation, useQuery } from '@tanstack/react-query';
import { signup, login, } from '../api/authApi';

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

