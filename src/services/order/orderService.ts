import apiClient from '../../api/config';
import type {
    OrderListQuery,
    OrderPageResponse,
    OrderResponse,
    CreateOrderPayload,
    OrderPaymentMethod,
    OrderPaymentResult,
} from '../../types/order/order';

type ApiPageLike = {
    content?: OrderResponse[];
    items?: OrderResponse[];
    data?: OrderResponse[] | { content?: OrderResponse[] };
    page?: number;
    limit?: number;
    size?: number;
    total?: number;
    totalPages?: number;
    totalElements?: number;
    first?: boolean;
    last?: boolean;
    number?: number;
    numberOfElements?: number;
    pagination?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
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
            first: fallbackQuery.page <= 1,
            last: true,
        };
    }

    const items = resolved?.content ?? resolved?.items ?? (Array.isArray(resolved?.data) ? resolved.data : []) ?? [];
    const page = resolved?.page ?? resolved?.pagination?.page ?? resolved?.number ?? resolved?.pageable?.pageNumber ?? fallbackQuery.page;
    const size = resolved?.size ?? resolved?.limit ?? resolved?.pagination?.limit ?? resolved?.pageable?.pageSize ?? fallbackQuery.size;
    const totalElements = resolved?.totalElements ?? resolved?.total ?? resolved?.pagination?.total ?? resolved?.numberOfElements ?? items.length;
    const totalPages = resolved?.totalPages ?? resolved?.pagination?.totalPages ?? Math.max(1, Math.ceil(totalElements / Math.max(1, size)));

    return {
        items,
        page,
        size,
        totalPages,
        totalElements,
        first: resolved?.first ?? page <= 1,
        last: resolved?.last ?? totalPages <= 1,
    };
};

const normalizeOrder = (payload: unknown): OrderResponse => unwrap<OrderResponse>(payload);

export const orderService = {
    listOrders: async (query: OrderListQuery = {}): Promise<OrderPageResponse> => {
        const page = query.page ?? 1;
        const size = query.size ?? 10;

        const response = await apiClient.get('/api/orders', {
            params: {
                page,
                size,
                limit: size,
                status: query.status,
                keyword: query.keyword,
            },
        });

        return normalizePage(response.data, { page, size });
    },

    listTechnicianOrders: async (technicianId: string, query: OrderListQuery = {}): Promise<OrderResponse[]> => {
        const page = query.page ?? 1;
        const size = query.size ?? 100;

        const response = await apiClient.get('/api/orders', {
            params: {
                technician: technicianId,
                page,
                size,
            },
        });

        return normalizePage(response.data, { page, size }).items;
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

    createOrder: async (payload: CreateOrderPayload): Promise<OrderResponse> => {
        const response = await apiClient.post('/api/orders', payload);
        return normalizeOrder(response.data);
    },

    acceptOrder: async (orderId: string): Promise<OrderResponse> => {
        const response = await apiClient.post(`/api/orders/${orderId}/accept`);
        unwrap(response.data);
        return orderService.getOrderById(orderId);
    },

    cancelOrder: async (orderId: string, reason: string): Promise<OrderResponse> => {
        const response = await apiClient.post(`/api/orders/${orderId}/cancel`, { reason });
        unwrap(response.data);
        return orderService.getOrderById(orderId);
    },

    selectPaymentMethod: async (orderId: string, method: OrderPaymentMethod): Promise<OrderPaymentResult> => {
        const response = await apiClient.post(`/api/orders/${orderId}/payment`, { method });
        return unwrap<OrderPaymentResult>(response.data);
    },

    confirmCashPayment: async (orderId: string): Promise<OrderResponse> => {
        const response = await apiClient.post(`/api/orders/${orderId}/payment/cash-confirm`);
        unwrap(response.data);
        return orderService.getOrderById(orderId);
    },

    updateOrderStatus: async (orderId: string, status: string): Promise<OrderResponse> => {
        const response = await apiClient.patch(`/api/orders/${orderId}/status`, { status });
        unwrap(response.data);
        return orderService.getOrderById(orderId);
    },

    completeOrder: async (orderId: string, payload: { finalPrice?: number; images: string[] }): Promise<OrderResponse> => {
        const response = await apiClient.post(`/api/orders/${orderId}/complete`, payload);
        unwrap(response.data);
        return orderService.getOrderById(orderId);
    },

    submitWarranty: async (orderId: string, payload: { description: string; images: string[]; scheduledAt: string }) => {
        const response = await apiClient.post(`/api/orders/${orderId}/warranty`, payload);
        return unwrap(response.data);
    },

    getWarrantyInfo: async (orderId: string) => {
        const response = await apiClient.get(`/api/orders/${orderId}/warranty`);
        return unwrap(response.data);
    },

    updateWarrantyStatus: async (warrantyId: string, status: 'in_progress' | 'rejected') => {
        const response = await apiClient.patch(`/api/orders/warranty/${warrantyId}/status?status=${status}`);
        return unwrap(response.data);
    },
};
