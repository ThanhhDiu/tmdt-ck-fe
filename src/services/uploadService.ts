import apiClient from '../api/config';
import { resolveMediaUrl } from '../utils/mediaUrl';

type UploadFolder = 'avatars' | 'orders' | 'verifications' | 'categories' | 'reports';

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

const uploadToFolder = async (file: File, folder: UploadFolder): Promise<string> => {
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
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    const responseData = (error as { response?: { data?: unknown } }).response?.data;
    if (responseData && typeof responseData === 'object') {
      const data = responseData as {
        message?: string;
        error?: string;
        code?: string;
        errorCode?: string;
      };
      return [data.code, data.errorCode, data.message, data.error].filter(Boolean).join(' ');
    }
  }
  return '';
};

const isInvalidFolderError = (error: unknown) => {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes('invalid_file_folder') || message.includes('thư mục upload không hợp lệ');
};

export const uploadService = {
  uploadAvatar: (file: File) => uploadToFolder(file, 'avatars'),
  uploadOrderImage: (file: File) => uploadToFolder(file, 'orders'),
  uploadVerificationImage: (file: File) => uploadToFolder(file, 'verifications'),
  uploadCategoryImage: (file: File) => uploadToFolder(file, 'categories'),
  // uploadReportImage: async (file: File) => {
  //   try {
  //     return await uploadToFolder(file, 'reports');
  //   } catch (error) {
  //     if (isInvalidFolderError(error)) {
  //       return uploadToFolder(file, 'orders');
  //     }
  //     throw error;
  //   }
  // },
};
