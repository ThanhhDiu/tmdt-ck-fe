import apiClient from '../../api/config';
import type {
    LoginRequest,
    LoginApiResponse,
    RegisterRequest,
    RegisterApiResponse,
} from '../../types/auth/auth';

// ─── Auth Service ─────────────────────────────────────────────────────────────
// Chịu trách nhiệm giao tiếp trực tiếp với REST API.
// Không xử lý business logic hay lưu token – đó là việc của Controller/Store.

export const authService = {
    /**
     * POST /api/auth/login
     * Đăng nhập bằng số điện thoại / email + password + role
     */
    login: async (payload: LoginRequest): Promise<LoginApiResponse> => {
        const response = await apiClient.post<LoginApiResponse>(
            '/api/auth/login',
            payload,
        );
        return response.data;
    },

    /**
     * POST /api/auth/register
     * Đăng ký tài khoản mới
     */
    register: async (payload: RegisterRequest): Promise<RegisterApiResponse> => {
        const response = await apiClient.post<RegisterApiResponse>(
            '/api/auth/register',
            payload,
        );
        return response.data;
    },
};