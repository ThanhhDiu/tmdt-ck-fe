import axios from 'axios';
import { loadTokenFromStorage } from '../utils/token';

export const BASE_URL = 'http://localhost:8080/';

const apiClient = axios.create({
    // Đổi từ IP nội bộ sang localhost + thêm tiền tố /api
    baseURL: 'http://localhost:8080/', 
    timeout: 30000, // Tăng từ 10s lên 30s để tránh timeout
    headers: {
        'Content-Type': 'application/json',
    },
});




// ─── Request interceptor: gắn JWT Bearer token ───────────────────────────────
apiClient.interceptors.request.use(
    (config) => {
        const token = loadTokenFromStorage();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// ─── Response interceptor: xử lý lỗi toàn cục ───────────────────────────────
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token hết hạn hoặc không hợp lệ → có thể redirect về login
            console.warn('[API] Unauthorized – session expired or invalid token');
        }
        return Promise.reject(error);
    },
);

export default apiClient;