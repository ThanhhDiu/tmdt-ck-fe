import apiClient from '../api/config';

const unwrap = <T,>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'success' in payload && (payload as { success?: boolean }).success && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export const uploadService = {
  //upload 1 ảnh
  uploadImage: async (file: File, folder = 'evidence'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await apiClient.post('/api/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const data = unwrap<{ url: string }>(response.data);
    return data.url;
  },

  //upload nhiều ảnh
  uploadImages: async (files: File[], folder = 'orders'): Promise<string[]> => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });
        formData.append('folder', folder);

        const response = await apiClient.post('/api/upload/images', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        const data = unwrap<{ urls: string[] }>(response.data);
        return data.urls;
    },
};
