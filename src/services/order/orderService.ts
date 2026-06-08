import apiClient from '../../api/config';
import type { OrderListQuery, OrderPageResponse, OrderResponse } from '../../types/order/order';

type ApiPageLike = {
    content?: OrderResponse[];
    items?: OrderResponse[];
    data?: OrderResponse[] | { content?: OrderResponse[] };
    page?: number;
    size?: number;
    totalPages?: number;
    totalElements?: number;
    first?: boolean;
    last?: boolean;
    number?: number;
    numberOfElements?: number;
    pageable?: {
        pageNumber?: number;
        pageSize?: number;
    };
};

const unwrap = <T,>(payload: unknown): T => {
    if (payload && typeof payload === 'object' && 'success' in payload && (payload as { success?: boolean }).success && 'data' in payload) {
        return (payload as { data: T }).data;
    }

    if (payload && typeof payload === 'object' && 'data' in payload) {
        return (payload as { data: T }).data;
    }

    return payload as T;
};

const normalizePage = (payload: unknown, fallbackQuery: Required<OrderListQuery>): OrderPageResponse => {
    const resolved = unwrap<ApiPageLike | OrderResponse[] | null>(payload);

    if (Array.isArray(resolved)) {
        return {
            items: resolved,
            page: fallbackQuery.page,
            size: fallbackQuery.size,
            totalPages: 1,
            totalElements: resolved.length,
            first: fallbackQuery.page <= 0,
            last: true,
        };
    }

    const items = resolved?.content ?? resolved?.items ?? (Array.isArray(resolved?.data) ? resolved.data : []) ?? [];
    const page = resolved?.page ?? resolved?.number ?? resolved?.pageable?.pageNumber ?? fallbackQuery.page;
    const size = resolved?.size ?? resolved?.pageable?.pageSize ?? fallbackQuery.size;
    const totalPages = resolved?.totalPages ?? 1;
    const totalElements = resolved?.totalElements ?? resolved?.numberOfElements ?? items.length;

    return {
        items,
        page,
        size,
        totalPages,
        totalElements,
        first: resolved?.first ?? page <= 0,
        last: resolved?.last ?? totalPages <= 1,
    };
};

const normalizeOrder = (payload: unknown): OrderResponse => unwrap<OrderResponse>(payload);

export const orderService = {
    listOrders: async (query: OrderListQuery = {}): Promise<OrderPageResponse> => {
        const page = query.page ?? 0;
        const size = query.size ?? 10;

        const response = await apiClient.get('/api/orders', {
            params: {
                page,
                size,
            },
        });

        return normalizePage(response.data, { page, size });
    },

    getOrderById: async (id: string): Promise<OrderResponse> => {
        const response = await apiClient.get(`/api/orders/${id}`);
        return normalizeOrder(response.data);
    },

    requestPriceAdjustment: async (
        orderId: string,
        payload: {
            newPrice: number;
            reason: string;
            parts?: { name: string; price: number; partCode?: string }[];
            evidenceImages?: string[];
        }
    ): Promise<OrderResponse> => {
        await apiClient.patch(`/api/orders/${orderId}/price`, payload);
        return orderService.getOrderById(orderId);
    },

    approvePriceAdjustment: async (orderId: string): Promise<OrderResponse> => {
        const response = await apiClient.post(`/api/orders/${orderId}/price/approve`);
        unwrap(response.data);
        return orderService.getOrderById(orderId);
    },

    rejectPriceAdjustment: async (orderId: string, reason: string): Promise<OrderResponse> => {
        const response = await apiClient.post(`/api/orders/${orderId}/price/reject`, { reason });
        unwrap(response.data);
        return orderService.getOrderById(orderId);
    },
};
