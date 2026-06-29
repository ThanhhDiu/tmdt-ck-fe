import { orderService } from '../../services/order/orderService';
import type {
    OrderListQuery,
    OrderPageResponse,
    OrderResponse,
    OrderPaymentMethod,
    OrderPaymentResult,
} from '../../types/order/order';

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

    selectPaymentMethod: async (id: string, method: OrderPaymentMethod): Promise<OrderResult<OrderPaymentResult>> => {
        try {
            const data = await orderService.selectPaymentMethod(id, method);
            return { success: true, data };
        } catch (error) {
            return resolveErrorMessage(error, 'Không thể xử lý thanh toán');
        }
    },

    confirmCashPayment: async (id: string): Promise<OrderResult<OrderResponse>> => {
        try {
            const data = await orderService.confirmCashPayment(id);
            return { success: true, data };
        } catch (error) {
            return resolveErrorMessage(error, 'Không thể xác nhận đã nhận tiền');
        }
    },

    cancelOrder: async (orderId: string, reason: string): Promise<{ success: boolean; message: string }> => {
        try {
            if (!reason.trim()) {
                return { success: false, message: 'Vui lòng nhập lý do cụ thể.' };
            }
            await orderService.cancelOrder(orderId, reason);
            return { success: true, message: 'Xử lý yêu cầu thành công.' };
        } catch (error) {
            console.error('[OrderController] Lỗi hủy đơn:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Không thể kết nối đến máy chủ.',
            };
        }
    },
    requestPriceAdjustment: async (id: string, payload: any) => {
        try {
            const data = await orderService.requestPriceAdjustment(id, payload);
            return { success: true, data };
        } catch (e) { return { success: false, message: 'Lỗi gửi yêu cầu' }; }
    },
    approvePriceAdjustment: async (id: string) => {
        try {
            const data = await orderService.approvePriceAdjustment(id);
            return { success: true, data };
        } catch (e) { return { success: false, message: 'Lỗi xác nhận' }; }
    },
    rejectPriceAdjustment: async (id: string, reason: string) => {
        try {
            const data = await orderService.rejectPriceAdjustment(id, reason);
            return { success: true, data };
        } catch (e) { return { success: false, message: 'Lỗi từ chối' }; }
    },

    completeOrder: async (orderId: string, finalPrice?: number, images?: string[]) => {
        try {
            const data = await orderService.completeOrder(orderId, { 
                finalPrice, 
                images: images || [] 
            });
            return { success: true, data };
        } catch (e) {
            return { success: false, message: 'Lỗi khi hoàn thành đơn' };
        }
    },

    submitWarranty: async (orderId: string, payload: { description: string; images: string[]; scheduledAt: string }) => {
        try {
            const data = await orderService.submitWarranty(orderId, payload);
            return { success: true, data };
        } catch (e) {
            return { success: false, message: 'Lỗi khi gửi yêu cầu bảo hành' };
        }
    },

    updateWarrantyStatus: async (warrantyId: string, status: 'in_progress' | 'rejected') => {
        try {
            const data = await orderService.updateWarrantyStatus(warrantyId, status);
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error instanceof Error ? error.message : 'Lỗi khi cập nhật trạng thái bảo hành' };
        }
    },

    getWarrantyInfo: async (orderId: string) => {
        try {
            const data = await orderService.getWarrantyInfo(orderId);
            return { success: true, data };
        } catch (error) {
            return { success: false, data: null };
        }
    },
};
