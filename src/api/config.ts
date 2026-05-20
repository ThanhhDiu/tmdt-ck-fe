import axios from 'axios';
import { loadTokenFromStorage } from '../utils/token';

const apiClient = axios.create({
    // baseURL: 'http://192.168.88.251:8080/api/',
    // baseURL: 'http://10.0.2.2:8080/',
    baseURL: 'http://localhost:8080/',
    // baseURL: 'http://192.168.1.191:8080/',
    timeout: 10000,
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