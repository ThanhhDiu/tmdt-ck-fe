import axiosClient from '../api/axiosClient';

export const uploadImages = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file); // Backend dùng tên parameter là 'files'
  });
  formData.append('folder', 'general'); // Backend bắt buộc có tham số folder

  return await axiosClient.post('/upload/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
