import axiosClient from '../api/axiosClient';
import { getAccessToken } from './auth';

export async function getInfo() {
    const accessToken = getAccessToken()
    if (accessToken) {
        try {
            const data: any = await axiosClient.get('/auth/me');
            return data.data; // Assuming your API returns { success: true, data: { ...user } }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin user:", error);
            window.location.href = '/login';
        }
    } else {
        window.location.href = '/login';
    }
}