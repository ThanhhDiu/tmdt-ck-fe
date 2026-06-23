const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const REMEMBER_ME_KEY = 'auth_remember';

// ─── Access Token ─────────────────────────────────────────────────────────────

/**
 * Luôn lưu token vào localStorage.
 * Nếu remember = false, đánh dấu để xóa token khi đóng tab (xem setupSessionGuard).
 */
export const saveToken = (token: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const loadTokenFromStorage = (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const removeToken = (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
};

// ─── Refresh Token ────────────────────────────────────────────────────────────

export const saveRefreshToken = (token: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const loadRefreshToken = (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const removeRefreshToken = (): void => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// ─── Remember Me ──────────────────────────────────────────────────────────────

/**
 * Lưu tuỳ chọn "Ghi nhớ đăng nhập".
 * Nếu remember = false → token sẽ bị xóa khi đóng tab (qua setupSessionGuard).
 */
export const saveRememberMe = (remember: boolean): void => {
    localStorage.setItem(REMEMBER_ME_KEY, String(remember));
};

export const isRememberMe = (): boolean => {
    return localStorage.getItem(REMEMBER_ME_KEY) !== 'false';
};

// ─── Session Guard ────────────────────────────────────────────────────────────

/**
 * Gọi 1 lần trong App.tsx (hoặc main.tsx).
 * Nếu user không chọn "Ghi nhớ", xóa token khi đóng tab.
 */
export const setupSessionGuard = (): void => {
    window.addEventListener('beforeunload', () => {
        if (!isRememberMe()) {
            clearAllTokens();
        }
    });
};

// ─── Clear all ────────────────────────────────────────────────────────────────

export const clearAllTokens = (): void => {
    removeToken();
    removeRefreshToken();
    localStorage.removeItem(REMEMBER_ME_KEY);
};
