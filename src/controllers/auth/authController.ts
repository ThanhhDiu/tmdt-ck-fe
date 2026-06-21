import { authService } from '../../services/auth/authService';
import {
    saveToken,
    saveRefreshToken,
    saveRememberMe,
    clearAllTokens,
} from '../../utils/token';
import type {
    LoginRequest,
    RegisterRequest,
    AuthUser,
} from '../../types/auth/auth';


export interface AuthSuccess {
    success: true;
    user: AuthUser;
}

export interface AuthFailure {
    success: false;
    code: string;
    message: string;
    fields?: Record<string, string>;   // chỉ dùng cho register
}

export type AuthResult = AuthSuccess | AuthFailure;

export const authController = {

    /**
     * Đăng nhập bằng JWT
     * Gọi POST /api/auth/login
     *
     * @param identifier - Số điện thoại hoặc email
     * @param password   - Mật khẩu
     * @param role       - 'customer' | 'technician'
     * @param remember   - Lưu token vào localStorage (true) hoặc sessionStorage (false)
     */
    handleLogin: async (
        identifier: string,
        password: string,
        remember = true,
    ): Promise<AuthResult> => {
        try {
            const payload: LoginRequest = { identifier, password };
            const res = await authService.login(payload);

            if (!res.success) {
                // Response 401: INVALID_CREDENTIALS
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const errorRes = res as any;
                return {
                    success: false,
                    code: errorRes.code || 'INVALID_CREDENTIALS',
                    message: errorRes.message || 'Đăng nhập thất bại',
                };
            }

            // Lưu cả access token & refresh token vào localStorage
            const { accessToken, refreshToken, user } = res.data;
            saveRememberMe(remember);
            saveToken(accessToken);
            saveRefreshToken(refreshToken);

            return { success: true, user };

        } catch (error: unknown) {
            // Xử lý lỗi HTTP (401, network error, ...)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const apiError = (error as any)?.response?.data;

            if (apiError && !apiError.success) {
                return {
                    success: false,
                    code: apiError.error?.code ?? 'UNKNOWN_ERROR',
                    message: apiError.error?.message ?? 'Đăng nhập thất bại',
                };
            }

            return {
                success: false,
                code: 'NETWORK_ERROR',
                message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.',
            };
        }
    },


    handleRegister: async (
        payload: RegisterRequest,
    ): Promise<AuthResult> => {
        try {
            const res = await authService.register(payload);

            if (!res.success) {
                // Response 422: VALIDATION_ERROR (email/phone đã tồn tại, ...)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const errorRes = res as any;
                return {
                    success: false,
                    code: errorRes.code || 'VALIDATION_ERROR',
                    message: errorRes.message || 'Đăng ký thất bại',
                    fields: errorRes.fields as Record<string, string> | undefined,
                };
            }

            const { accessToken, refreshToken, user } = res.data;
            saveToken(accessToken);
            saveRefreshToken(refreshToken);

            return { success: true, user };

        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const apiError = (error as any)?.response?.data;

            if (apiError && !apiError.success) {
                return {
                    success: false,
                    code: apiError.error?.code ?? 'UNKNOWN_ERROR',
                    message: apiError.error?.message ?? 'Đăng ký thất bại',
                    fields: apiError.error?.fields,
                };
            }

            return {
                success: false,
                code: 'NETWORK_ERROR',
                message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.',
            };
        }
    },

    /**
     * Đăng xuất – xóa toàn bộ token khỏi storage
     */
    handleLogout: (): void => {
        clearAllTokens();
    },
};