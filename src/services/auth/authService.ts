import apiClient from '../../api/config';
import type {
    LoginRequest,
    LoginApiResponse,
    RegisterRequest,
    AuthUser,
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

    /**
         * POST /api/auth/forgot-password
         * Khôi phục mật khẩu – gửi yêu cầu đặt lại qua email/SĐT
         */
    forgotPassword: async (identifier: string): Promise<{ success: boolean; message?: string }> => {
        const response = await apiClient.post<{ success: boolean; message?: string }>(
            '/api/auth/forgot-password',
            { identifier },
        );
        return response.data;
    },


    /**
     * POST /api/auth/reset-password
     * Đặt lại mật khẩu qua token (quên mật khẩu)
     */
    resetPassword: async (token: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; message?: string }> => {
        const response = await apiClient.post<{ success: boolean; message?: string }>(
            '/api/auth/reset-password',
            { token, newPassword, confirmPassword },
        );
        return response.data;
    },

    /**
     * GET /api/auth/me
     * Lấy thông tin user hiện tại từ token
     */
    getMe: async (): Promise<{ success: boolean; data: AuthUser }> => {
        const response = await apiClient.get<{ success: boolean; data: AuthUser }>(
            '/api/auth/me',
        );
        return response.data;
    },

    /**
     * Đăng xuất: xóa token khỏi storage
     */
    logout: (): void => {
        // Có thể gọi clearAllTokens từ token.ts hoặc xóa thủ công
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('auth_remember');
    }
};