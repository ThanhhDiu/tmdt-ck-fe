import type { CancelledOrder } from '../types/CancelledOrder.ts';
import type { CompletedOrder } from '../types/CompletedOrder.ts';
import type { InProgressOrder } from '../types/InProgressOrder.ts';
import type { RequestData } from '../types/RequestData.ts';
import type { ScheduledOrder } from '../types/ScheduledOrder.ts';
import type { UserRole } from '../types/UserRole.ts';
import type { OrderResponse } from '../types/order/order';

export type OrderTabId = 'new' | 'scheduled' | 'in-progress' | 'completed' | 'warranty' | 'cancelled';

export interface OrderManagementState {
    activeTab: OrderTabId;
    page: number;
    pageSize: number;
    search: string;
    orders: OrderResponse[];
    selectedOrderId: string | null;
    selectedOrder: OrderResponse | null;
    loadingList: boolean;
    loadingDetail: boolean;
    error: string | null;
    detailError: string | null;
    totalPages: number;
    totalElements: number;
    optimisticOrdersById: Record<string, OrderResponse>;
    showCancelModal: boolean;
    orderToCancelId: string | null;
    cancelReason: string;
}

export const initialOrderManagementState: OrderManagementState = {
    activeTab: 'new',
    page: 0,
    pageSize: 10,
    search: '',
    orders: [],
    selectedOrderId: null,
    selectedOrder: null,
    loadingList: false,
    loadingDetail: false,
    error: null,
    detailError: null,
    totalPages: 0,
    totalElements: 0,
    optimisticOrdersById: {},
    showCancelModal: false,
    orderToCancelId: null,
    cancelReason: '',
};

export type OrderManagementAction =
    | { type: 'SET_ACTIVE_TAB'; tab: OrderTabId }
    | { type: 'SET_PAGE'; page: number }
    | { type: 'SET_PAGE_SIZE'; pageSize: number }
    | { type: 'SET_SEARCH'; search: string }
    | { type: 'LOAD_LIST_START' }
    | { type: 'LOAD_LIST_SUCCESS'; payload: { orders: OrderResponse[]; totalPages: number; totalElements: number } }
    | { type: 'LOAD_LIST_ERROR'; message: string }
    | { type: 'LOAD_DETAIL_START'; orderId: string }
    | { type: 'LOAD_DETAIL_SUCCESS'; order: OrderResponse }
    | { type: 'LOAD_DETAIL_ERROR'; message: string }
    | { type: 'OPEN_CANCEL_MODAL'; orderId: string }
    | { type: 'CLOSE_CANCEL_MODAL' }
    | { type: 'SET_CANCEL_REASON'; cancelReason: string }
    | { type: 'CONFIRM_CANCEL'; role: UserRole }
    | { type: 'CLEAR_SELECTED_ORDER' }
    | { type: 'RESET_DETAIL_ERROR' };

export const orderManagementReducer = (
    state: OrderManagementState,
    action: OrderManagementAction,
): OrderManagementState => {
    switch (action.type) {
        case 'SET_ACTIVE_TAB':
            return {
                ...state,
                activeTab: action.tab,
                page: 0,
                selectedOrderId: null,
                selectedOrder: null,
                detailError: null,
            };

        case 'SET_PAGE':
            return {
                ...state,
                page: Math.max(0, action.page),
                selectedOrderId: null,
                selectedOrder: null,
            };

        case 'SET_PAGE_SIZE':
            return {
                ...state,
                pageSize: Math.max(1, action.pageSize),
                page: 0,
            };

        case 'SET_SEARCH':
            return {
                ...state,
                search: action.search,
                page: 0,
            };

        case 'LOAD_LIST_START':
            return {
                ...state,
                loadingList: true,
                error: null,
            };

        case 'LOAD_LIST_SUCCESS':
            return {
                ...state,
                loadingList: false,
                error: null,
                orders: action.payload.orders,
                totalPages: action.payload.totalPages,
                totalElements: action.payload.totalElements,
            };

        case 'LOAD_LIST_ERROR':
            return {
                ...state,
                loadingList: false,
                error: action.message,
            };

        case 'LOAD_DETAIL_START':
            return {
                ...state,
                loadingDetail: true,
                detailError: null,
                selectedOrderId: action.orderId,
            };

        case 'LOAD_DETAIL_SUCCESS':
            return {
                ...state,
                loadingDetail: false,
                detailError: null,
                selectedOrderId: action.order.id,
                selectedOrder: action.order,
                optimisticOrdersById: {
                    ...state.optimisticOrdersById,
                    [action.order.id]: action.order,
                },
            };

        case 'LOAD_DETAIL_ERROR':
            return {
                ...state,
                loadingDetail: false,
                detailError: action.message,
            };

        case 'OPEN_CANCEL_MODAL':
            return {
                ...state,
                showCancelModal: true,
                orderToCancelId: action.orderId,
                cancelReason: '',
            };

        case 'CLOSE_CANCEL_MODAL':
            return {
                ...state,
                showCancelModal: false,
                orderToCancelId: null,
                cancelReason: '',
            };

        case 'SET_CANCEL_REASON':
            return {
                ...state,
                cancelReason: action.cancelReason,
            };

        case 'CONFIRM_CANCEL': {
            if (!state.orderToCancelId) {
                return state;
            }

            const existingOrder = state.optimisticOrdersById[state.orderToCancelId] ?? state.orders.find((item) => item.id === state.orderToCancelId);

            if (!existingOrder) {
                return {
                    ...state,
                    showCancelModal: false,
                    orderToCancelId: null,
                    cancelReason: '',
                };
            }

            const cancelledOrder: OrderResponse = {
                ...existingOrder,
                status: 'CANCELLED',
                cancelledBy: action.role,
                cancelReason: state.cancelReason,
                cancelledAt: new Date().toISOString(),
            };

            return {
                ...state,
                showCancelModal: false,
                orderToCancelId: null,
                cancelReason: '',
                activeTab: 'cancelled',
                page: 0,
                selectedOrderId: cancelledOrder.id,
                selectedOrder: cancelledOrder,
                optimisticOrdersById: {
                    ...state.optimisticOrdersById,
                    [cancelledOrder.id]: cancelledOrder,
                },
            };
        }

        case 'CLEAR_SELECTED_ORDER':
            return {
                ...state,
                selectedOrderId: null,
                selectedOrder: null,
                detailError: null,
            };

        case 'RESET_DETAIL_ERROR':
            return {
                ...state,
                detailError: null,
            };

        default:
            return state;
    }
};

const trimText = (value?: string): string => value?.trim() ?? '';

const formatDateTime = (value?: string): string => {
    if (!value) return 'Chưa cập nhật';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatTimeAgo = (value?: string): string => {
    if (!value) return 'Vừa tạo';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Vừa tạo';

    const deltaMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
    if (deltaMinutes < 1) return 'Vừa tạo';
    if (deltaMinutes < 60) return `${deltaMinutes} phút trước`;

    const deltaHours = Math.round(deltaMinutes / 60);
    if (deltaHours < 24) return `${deltaHours} giờ trước`;

    const deltaDays = Math.round(deltaHours / 24);
    return `${deltaDays} ngày trước`;
};

const formatMoney = (value?: number): number => value ?? 0;

const pickPersonName = (primary?: { fullName?: string }, fallback = 'Chưa cập nhật'): string => {
    const name = trimText(primary?.fullName);
    return name || fallback;
};

const normalizeStatus = (status: string): string => status.trim().toLowerCase();

export const getOrderTab = (order: OrderResponse): OrderTabId => {
    const normalized = normalizeStatus(order.status);

    if (normalized.includes('cancel')) return 'cancelled';
    if (normalized.includes('complete')) return 'completed';
    if (normalized.includes('progress') || normalized.includes('working') || normalized.includes('repair')) return 'in-progress';
    if (normalized.includes('schedule') || normalized.includes('confirm') || normalized.includes('assigned')) return 'scheduled';
    if (normalized.includes('warranty')) return 'warranty';

    return 'new';
};

export const getOrderStatusLabel = (order: OrderResponse): string => {
    const tab = getOrderTab(order);

    switch (tab) {
        case 'new':
            return 'Yêu cầu mới';
        case 'scheduled':
            return 'Đã xác nhận';
        case 'in-progress':
            return 'Đang xử lý';
        case 'completed':
            return 'Hoàn thành';
        case 'cancelled':
            return 'Đã hủy';
        case 'warranty':
            return 'Bảo hành';
        default:
            return order.status;
    }
};

export const mergeOrders = (orders: OrderResponse[], optimisticOrders: Record<string, OrderResponse>): OrderResponse[] => {
    const mergedMap = new Map<string, OrderResponse>();

    orders.forEach((order) => mergedMap.set(order.id, order));
    Object.values(optimisticOrders).forEach((order) => mergedMap.set(order.id, order));

    return Array.from(mergedMap.values());
};

export const filterOrdersByTab = (orders: OrderResponse[], tab: OrderTabId): OrderResponse[] => {
    return orders.filter((order) => getOrderTab(order) === tab);
};

export const filterOrdersBySearch = (orders: OrderResponse[], search: string): OrderResponse[] => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return orders;

    return orders.filter((order) => {
        const values = [
            order.id,
            order.serviceName,
            order.subService,
            order.serviceCategory,
            order.deviceName,
            order.description,
            order.address,
            order.customer?.fullName,
            order.technician?.fullName,
            order.status,
        ];

        return values.some((value) => trimText(value).toLowerCase().includes(keyword));
    });
};

export const getMergedVisibleOrders = (orders: OrderResponse[], optimisticOrders: Record<string, OrderResponse>, tab: OrderTabId, search: string): OrderResponse[] => {
    return filterOrdersBySearch(filterOrdersByTab(mergeOrders(orders, optimisticOrders), tab), search);
};

export const mapOrderToRequestData = (order: OrderResponse): RequestData => ({
    id: order.id,
    customerName: pickPersonName(order.customer, 'Khách hàng'),
    technicianName: order.technician?.fullName,
    timeAgo: formatTimeAgo(order.createdAt),
    deviceName: order.deviceName ?? order.serviceName ?? 'Chưa có tên dịch vụ',
    description: order.description ?? 'Không có mô tả',
    address: order.address ?? 'Chưa cập nhật địa chỉ',
    estPrice: formatMoney(order.estimatedPrice ?? order.finalPrice),
    expectedTime: formatDateTime(order.expectedTime ?? order.scheduledAt),
    images: order.images ?? [],
});

export const mapOrderToScheduledOrder = (order: OrderResponse): ScheduledOrder => ({
    id: order.id,
    serviceName: order.serviceName ?? order.deviceName ?? 'Đơn hàng',
    subService: order.subService ?? order.serviceCategory ?? order.description ?? 'Chưa có mô tả',
    customerName: pickPersonName(order.customer, 'Khách hàng'),
    technicianName: pickPersonName(order.technician, 'Chưa phân công'),
    time: formatDateTime(order.scheduledAt ?? order.expectedTime),
    address: order.address ?? 'Chưa cập nhật địa chỉ',
    statusText: getOrderStatusLabel(order),
    estPrice: formatMoney(order.estimatedPrice ?? order.finalPrice),
    note: order.description,
});

export const mapOrderToInProgressOrder = (order: OrderResponse): InProgressOrder => ({
    id: order.id,
    serviceName: order.serviceName ?? order.deviceName ?? 'Đơn hàng',
    subService: order.subService ?? order.serviceCategory ?? order.description ?? 'Chưa có mô tả',
    technicianName: pickPersonName(order.technician, 'Chưa phân công'),
    startTime: formatDateTime(order.startedAt ?? order.scheduledAt),
    address: order.address ?? 'Chưa cập nhật địa chỉ',
    statusText: getOrderStatusLabel(order),
    currentPrice: formatMoney(order.finalPrice ?? order.estimatedPrice),
    isWaitingApproval: order.priceAdjustment?.status?.toLowerCase() === 'pending',
});

export const mapOrderToCompletedOrder = (order: OrderResponse): CompletedOrder => ({
    id: order.id,
    serviceName: order.serviceName ?? order.deviceName ?? 'Đơn hàng',
    subService: order.subService ?? order.serviceCategory ?? order.description ?? 'Chưa có mô tả',
    customerName: pickPersonName(order.customer, 'Khách hàng'),
    technicianName: pickPersonName(order.technician, 'Chưa phân công'),
    completionDate: formatDateTime(order.completedAt ?? order.updatedAt ?? order.createdAt),
    totalPrice: formatMoney(order.finalPrice ?? order.estimatedPrice),
    rating: 0,
});

export const mapOrderToCancelledOrder = (order: OrderResponse): CancelledOrder => ({
    id: order.id,
    serviceName: order.serviceName ?? order.deviceName ?? 'Đơn hàng',
    subService: order.subService ?? order.serviceCategory ?? order.description ?? 'Chưa có mô tả',
    customerName: pickPersonName(order.customer, 'Khách hàng'),
    technicianName: pickPersonName(order.technician, 'Chưa phân công'),
    cancelDate: formatDateTime(order.cancelledAt ?? order.updatedAt ?? order.createdAt),
    cancelledBy: (order.cancelledBy as 'customer' | 'technician' | 'system') ?? 'system',
    cancelReason: order.cancelReason ?? 'Không có lý do được ghi nhận',
});
