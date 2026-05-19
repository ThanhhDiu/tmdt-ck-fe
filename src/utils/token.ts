// src/utils/token.ts
// Web-compatible storage (replaces React Native AsyncStorage)

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// ─── Access Token ────────────────────────────────────────────────────────────

export const saveToken = (token: string, remember = true): void => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(ACCESS_TOKEN_KEY, token);
};

export const loadTokenFromStorage = (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY) ?? sessionStorage.getItem(ACCESS_TOKEN_KEY);
};

export const removeToken = (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
};

// ─── Refresh Token ───────────────────────────────────────────────────────────

export const saveRefreshToken = (token: string, remember = true): void => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(REFRESH_TOKEN_KEY, token);
};

export const loadRefreshToken = (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY) ?? sessionStorage.getItem(REFRESH_TOKEN_KEY);
};

export const removeRefreshToken = (): void => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

// ─── Clear all ───────────────────────────────────────────────────────────────

export const clearAllTokens = (): void => {
    removeToken();
    removeRefreshToken();
};
