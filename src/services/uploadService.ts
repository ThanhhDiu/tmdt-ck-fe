import apiClient from '../api/config';
import { resolveMediaUrl } from '../utils/mediaUrl';

const unwrap = <T,>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && (payload as { success?: boolean }).success === false) {
    throw new Error((payload as { message?: string; error?: string }).message || (payload as { error?: string }).error || 'Upload ảnh thất bại');
  }
  if (payload && typeof payload === 'object' && 'success' in payload && (payload as { success?: boolean }).success && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export const uploadService = {
  uploadImage: async (file: File, folder = 'evidence'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await apiClient.post('/api/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const data = unwrap<{ url: string }>(response.data);
    if (!data.url) {
      throw new Error('Upload ảnh không trả về URL hợp lệ');
    }
    return resolveMediaUrl(data.url) ?? data.url;
  },
};
