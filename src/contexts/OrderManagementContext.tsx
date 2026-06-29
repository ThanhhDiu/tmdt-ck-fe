import React, { createContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { orderController } from '../controllers/order/orderController';
import { orderRealtimeClient } from '../services/order/orderRealtimeClient';
import type { UserRole } from '../types/UserRole.ts';
import type { OrderResponse } from '../types/order/order';
import {
    getMergedVisibleOrders,
    initialOrderManagementState,
    orderManagementReducer,
    type OrderManagementState,
} from '../stores/orderStore';

export interface OrderManagementContextValue {
    role: UserRole;
    state: OrderManagementState;
    selectedOrder: OrderResponse | null;
    visibleOrders: OrderResponse[];
    refreshOrders: () => Promise<void>;
    selectOrder: (orderId: string) => Promise<void>;
    setActiveTab: (tab: OrderManagementState['activeTab']) => void;
    setPage: (page: number) => void;
    setSearch: (search: string) => void;
    openCancelModal: (orderId: string) => void;
    closeCancelModal: () => void;
    setCancelReason: (reason: string) => void;
    confirmCancel: () => Promise<void>; // Cập nhật lại kiểu trả về
    clearSelectedOrder: () => void;
}

const OrderManagementContext = createContext<OrderManagementContextValue | null>(null);

interface OrderManagementProviderProps {
    role: UserRole;
    children: React.ReactNode;
}

export const OrderManagementProvider: React.FC<OrderManagementProviderProps> = ({ role, children }) => {
    const [state, dispatch] = useReducer(orderManagementReducer, initialOrderManagementState);

    const refreshOrders = async () => {
        dispatch({ type: 'LOAD_LIST_START' });

        const result = await orderController.loadOrders({
            page: state.page,
            size: state.pageSize,
        });

        if (!result.success) {
            dispatch({ type: 'LOAD_LIST_ERROR', message: result.message });
            return;
        }

        dispatch({
            type: 'LOAD_LIST_SUCCESS',
            payload: {
                orders: result.data.items,
                totalPages: result.data.totalPages,
                totalElements: result.data.totalElements,
            },
        });
    };

    const selectOrder = async (orderId: string) => {
        dispatch({ type: 'LOAD_DETAIL_START', orderId });

        const cachedOrder = state.optimisticOrdersById[orderId] ?? state.orders.find((item) => item.id === orderId);
        if (cachedOrder) {
            dispatch({ type: 'LOAD_DETAIL_SUCCESS', order: cachedOrder });
        }

        const result = await orderController.loadOrderById(orderId);

        if (!result.success) {
            if (!cachedOrder) {
                dispatch({ type: 'LOAD_DETAIL_ERROR', message: result.message });
            }
            return;
        }

        dispatch({ type: 'LOAD_DETAIL_SUCCESS', order: result.data });
    };

    const confirmCancel = async () => {
        const orderId = state.orderToCancelId;
        const reason = state.cancelReason;
        
        if (!orderId) return;
        if (!reason.trim()) {
            window.alert('Vui lòng nhập lý do cụ thể!');
            return;
        }

        const result = await orderController.cancelOrder(orderId, reason);
        if (result.success) {
            dispatch({ type: 'CONFIRM_CANCEL', role });
            dispatch({ type: 'CLOSE_CANCEL_MODAL' });
            await refreshOrders();
        } else {
            window.alert(result.message);
        }
    };

    useEffect(() => {
        void refreshOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.page, state.pageSize]);

    // --- Realtime: refresh on order status changes
    const refreshRef = useRef(refreshOrders);
    refreshRef.current = refreshOrders;
    const selectRef = useRef(selectOrder);
    selectRef.current = selectOrder;
    const selectedIdRef = useRef(state.selectedOrderId);
    selectedIdRef.current = state.selectedOrderId;

    const orderIds = useMemo(() => state.orders.map((order) => order.id), [state.orders]);

    useEffect(() => {
        orderRealtimeClient.activate();
        const off = orderRealtimeClient.onEvent((payload) => {
            void refreshRef.current();
            if (selectedIdRef.current && payload.orderId === selectedIdRef.current) {
                void selectRef.current(payload.orderId);
            }
        });

        return () => {
            off();
            orderRealtimeClient.deactivate();
        };
    }, []);

    useEffect(() => {
        orderRealtimeClient.syncSubscriptions(orderIds);
    }, [orderIds]);

    const visibleOrders = useMemo(
        () => getMergedVisibleOrders(state.orders, state.optimisticOrdersById, state.activeTab, state.search),
        [state.activeTab, state.orders, state.optimisticOrdersById, state.search],
    );

    const value = useMemo<OrderManagementContextValue>(
        () => ({
            role,
            state,
            selectedOrder: state.selectedOrder,
            visibleOrders,
            refreshOrders,
            selectOrder,
            setActiveTab: (tab) => dispatch({ type: 'SET_ACTIVE_TAB', tab }),
            setPage: (page) => dispatch({ type: 'SET_PAGE', page }),
            setSearch: (search) => dispatch({ type: 'SET_SEARCH', search }),
            openCancelModal: (orderId) => dispatch({ type: 'OPEN_CANCEL_MODAL', orderId }),
            closeCancelModal: () => dispatch({ type: 'CLOSE_CANCEL_MODAL' }),
            setCancelReason: (reason) => dispatch({ type: 'SET_CANCEL_REASON', cancelReason: reason }),
            confirmCancel, 
            clearSelectedOrder: () => dispatch({ type: 'CLEAR_SELECTED_ORDER' }),
        }),
        [role, state, visibleOrders, confirmCancel] 
    );

    return <OrderManagementContext.Provider value={value}>{children}</OrderManagementContext.Provider>;
};

export const useOrderManagementContext = () => {
    const context = React.useContext(OrderManagementContext);

    if (!context) {
        throw new Error('useOrderManagementContext must be used within OrderManagementProvider');
    }

    return context;
};