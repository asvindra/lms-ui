import { FORGOT_PASSWORD } from "../constants/endpoints";
import apiClient from "./apiClient";

interface ForgotPasswordResponse {}
export const forgotPassword = (data: any) =>
  apiClient.post<ForgotPasswordResponse>(FORGOT_PASSWORD, data).then((res) => {
    return res.data;
  });
