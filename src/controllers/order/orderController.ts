import { orderService } from '../../services/order/orderService';
import type { OrderListQuery, OrderPageResponse, OrderResponse } from '../../types/order/order';

export interface OrderSuccess<T> {
    success: true;
    data: T;
}

export interface OrderFailure {
    success: false;
    code: string;
    message: string;
}

export type OrderResult<T> = OrderSuccess<T> | OrderFailure;

const resolveErrorMessage = (error: unknown, fallback: string): OrderFailure => {
    const apiError = (error as { response?: { data?: { success?: boolean; error?: { code?: string; message?: string } } } })?.response?.data;

    if (apiError && apiError.success === false) {
        return {
            success: false,
            code: apiError.error?.code ?? 'UNKNOWN_ERROR',
            message: apiError.error?.message ?? fallback,
        };
    }

    return {
        success: false,
        code: 'NETWORK_ERROR',
        message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.',
    };
};

export const orderController = {
    loadOrders: async (query: OrderListQuery = {}): Promise<OrderResult<OrderPageResponse>> => {
        try {
            const data = await orderService.listOrders(query);
            return { success: true, data };
        } catch (error) {
            return resolveErrorMessage(error, 'Không tải được danh sách đơn hàng');
        }
    },

    loadOrderById: async (id: string): Promise<OrderResult<OrderResponse>> => {
        try {
            const data = await orderService.getOrderById(id);
            return { success: true, data };
        } catch (error) {
            return resolveErrorMessage(error, 'Không tải được chi tiết đơn hàng');
        }
    },
};
