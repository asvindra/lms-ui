import apiClient from './apiClient';

interface SignupRequest {
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupResponse {
  message: string;
  admin: { id: string; email: string; pending_approval: boolean };
  token: string;
}

interface LoginResponse {
  message: string;
  admin: { id: string; email: string; is_master: boolean };
  token: string;
}

interface VerifyResponse {
  message: string;
  user: { id: string; email: string };
}

export const signup = (data: SignupRequest) =>
  apiClient.post<SignupResponse>('/auth/signup', data).then((res) => res.data);

export const login = (data: LoginRequest) =>
  apiClient.post<LoginResponse>('/auth/login', data).then((res) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', res.data.token);
    }
    return res.data;
  });

export const sendVerificationEmail = () =>
  apiClient.post<{ message: string }>('/auth/send-verification').then((res) => res.data);

export const verifyEmail = (token: string) =>
  apiClient.get<VerifyResponse>(`/auth/verify?token=${token}`).then((res) => res.data);

export const getVerifyStatus = () =>
  apiClient.get<{
    message: string;
    status: { email_verified: boolean; fee_paid: boolean; approved_by_master: boolean; is_master: boolean };
  }>('/auth/verify-status').then((res) => res.data);