import apiClient from '../api/config';

const API_ORIGIN =
    (apiClient.defaults.baseURL || 'http://localhost:8080/').replace(/\/api\/?$/, '').replace(/\/$/, '');

/**
 * Chuyển URL tương đối từ backend (/uploads/...) thành URL đầy đủ để hiển thị trên frontend.
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (/^(https?:|blob:|data:)/i.test(url)) return url;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${API_ORIGIN}${path}`;
}
