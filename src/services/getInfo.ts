import axiosClient from '../api/config';
import { getAccessToken } from './auth';

export async function getInfo() {
    const accessToken = getAccessToken()
    if (accessToken) {
        try {
            const data: any = await axiosClient.get('/api/auth/me');
            return data.data; // Assuming your API returns { success: true, data: { ...user } }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin user:", error);
            window.location.href = '/auth/login';
        }
    } else {
        window.location.href = '/auth/login';
    }
}