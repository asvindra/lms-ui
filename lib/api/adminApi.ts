import apiClient from './apiClient';

interface PayFeeResponse {
  message: string;
  admin: { id: string; email: string; fee_paid: boolean; approved_by_master: boolean };
}

interface ApproveAdminResponse {
  message: string;
  admin: { id: string; email: string; approved_by_master: boolean; fee_paid: boolean };
}

interface DashboardResponse {
  message: string;
  user: any;
  verification_needed: boolean;
}

export const payFee = () =>
  apiClient.post<PayFeeResponse>('/admin/pay-fee').then((res) => res.data);

export const approveAdmin = (adminId: string) =>
  apiClient.post<ApproveAdminResponse>(`/admin/approve/${adminId}`).then((res) => res.data);

export const getDashboard = () =>
  apiClient.get<DashboardResponse>('/admin/dashboard').then((res) => res.data);