import apiClient from '../api/config';

const unwrap = <T,>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && (payload as { success?: boolean }).success === false) {
    throw new Error((payload as { message?: string; error?: string }).message || (payload as { error?: string }).error || 'Không thể gửi báo cáo');
  }
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export interface SubmitReportPayload {
  orderId: string;
  reason: string;
  description: string;
  evidenceImages?: string[];
}

export const reportService = {
  submitReport: async ({ orderId, ...payload }: SubmitReportPayload) => {
    const response = await apiClient.post(
      `/api/orders/${encodeURIComponent(orderId)}/reports`,
      payload
    );
    return unwrap<unknown>(response.data);
  },
};
