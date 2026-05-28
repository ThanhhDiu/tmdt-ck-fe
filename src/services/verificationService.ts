import axiosClient from '../api/axiosClient';
import type { VerificationStatus } from '../types/VerificationRequest';

// Helper function formatting date if needed by components
export const formatDate = (iso: string): string => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const verificationStatusLabel: Record<VerificationStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã phê duyệt',
  rejected: 'Từ chối',
  needs_resubmit: 'Yêu cầu bổ sung',
};

export const verificationStatusColor: Record<VerificationStatus, { color: string; bg: string }> = {
  pending: { color: '#a16207', bg: '#fff7e8' },
  approved: { color: '#15803d', bg: '#ecfdf3' },
  rejected: { color: '#b91c1c', bg: '#fee2e2' },
  needs_resubmit: { color: '#334155', bg: '#e2e8f0' },
};

// API calls
export const submitVerification = async (formData: FormData) => {
  return await axiosClient.post('/verifications', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getVerificationById = async (id: string | number) => {
  return await axiosClient.get(`/verifications/${id}`);
};

// Assuming backend provides an endpoint to get all verifications or tech status
export const getTechnicianVerificationStatus = async (technicianId: string | number) => {
    return await axiosClient.get(`/verifications/status/${technicianId}`); // Thay đổi endpoint tương ứng với BE nếu cần
}

export const getVerificationRequests = async (params?: Record<string, unknown>) => {
  return await axiosClient.get(`/verifications`, { params });
}

export const updateVerificationRequestStatus = async (id: string | number, payload: Record<string, unknown>) => {
  return await axiosClient.patch(`/verifications/${id}/status`, payload);
}
