import apiClient from '../../api/config';

export const uploadService = {
    /**
     * POST /api/upload/image
     * Upload ảnh avatar, CCCD, banner (1 file)
     * @param file - File ảnh cần upload
     * @param folder - Thư mục lưu trữ (avatars, banners, cccd, ...)
     */
    uploadImage: async (
        file: File,
        folder = 'avatars'
    ): Promise<{ success: boolean; data: { url: string }; message?: string }> => {
        const formData = new FormData();
        // Backend nhận @RequestParam("file") MultipartFile file
        formData.append('file', file);
        // Backend nhận @RequestParam("folder") String folder
        formData.append('folder', folder);

        // Vì apiClient mặc định để application/json, ta phải set thành multipart/form-data
        const response = await apiClient.post<{ success: boolean; data: { url: string }; message?: string }>(
            '/api/upload/image',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    },

    /**
     * POST /api/upload/images
     * Upload nhiều ảnh
     * @param files - Danh sách file ảnh
     * @param folder - Thư mục lưu trữ
     */
    uploadImages: async (
        files: File[],
        folder = 'images'
    ): Promise<{ success: boolean; data: { urls: string[] }; message?: string }> => {
        const formData = new FormData();
        // Backend nhận @RequestParam("files") List<MultipartFile> files
        files.forEach((file) => formData.append('files', file));
        formData.append('folder', folder);

        const response = await apiClient.post<{ success: boolean; data: { urls: string[] }; message?: string }>(
            '/api/upload/images',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    },
};
