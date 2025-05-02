import {
  CONFIRM,
  FORGOT_PASSWORD,
  LOGIN,
  SIGNUP,
  VERIFICATION,
} from "../constants/endpoints";
import apiClient from "./apiClient";

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

interface ForgotPasswordRequest {
  email: string;
}
interface ForgotPasswordResponse {
  message: string;
}
interface ConfirmPasswordResponse {
  message: string;
}

interface VerificationRequest {
  email: string;
  otp: number;
}

export const signup = (data: SignupRequest) =>
  apiClient.post<SignupResponse>(SIGNUP, data).then((res) => res.data);

export const login = (data: LoginRequest) =>
  apiClient.post<LoginResponse>(LOGIN, data).then((res: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("isSubscribed", res.data.user.is_subscribed);
      localStorage.setItem("role", res.data.user.role);
    }
    return res.data;
  });

export const forgotPassword = (data: ForgotPasswordRequest) =>
  apiClient.post<ForgotPasswordResponse>(FORGOT_PASSWORD, data).then((res) => {
    return res.data;
  });

export const verifyOtp = (data: VerificationRequest) =>
  apiClient.post<ForgotPasswordResponse>(VERIFICATION, data).then((res) => {
    return res.data;
  });

export const resendOtp = (data: any) =>
  apiClient.post<ForgotPasswordResponse>(FORGOT_PASSWORD, data).then((res) => {
    return res.data;
  });

export const confirmPassword = (data: any) =>
  apiClient.post<ConfirmPasswordResponse>(CONFIRM, data).then((res) => {
    return res.data;
  });
