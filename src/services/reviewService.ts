import apiClient from '../api/config';

const unwrap = <T,>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && (payload as { success?: boolean }).success === false) {
    throw new Error(
      (payload as { message?: string; error?: string }).message ||
        (payload as { error?: string }).error ||
        'Không thể gửi đánh giá'
    );
  }
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export interface SubmitReviewPayload {
  orderId: string;
  rating: number;
  content?: string;
  attachedImages?: string[];
}

export const reviewService = {
  submitReview: async ({ orderId, ...payload }: SubmitReviewPayload) => {
    const response = await apiClient.post(
      `/api/orders/${encodeURIComponent(orderId)}/reviews`,
      payload
    );
    return unwrap<unknown>(response.data);
  },
};
