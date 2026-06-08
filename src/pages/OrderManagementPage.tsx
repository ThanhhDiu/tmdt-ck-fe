import React from 'react';
import './orderManagementPage.css';

import type { UserRole } from '../types/UserRole.ts';
import type { OrderResponse } from '../types/order/order';

import OrderTabs from '../components/orderManagement/OrderTabs.tsx';
import RequestCard from '../components/orderManagement/RequestCard.tsx';
import { ScheduledCard } from '../components/orderManagement/ScheduledCard.tsx';
import { InProgressCard } from '../components/orderManagement/InProgressCard.tsx';
import { CompletedCard } from '../components/orderManagement/CompletedCard.tsx';
import { CancelledCard } from '../components/orderManagement/CancelledCard.tsx';
import OrderDetailPanel from '../components/orderManagement/OrderDetailPanel.tsx';
import { OrderManagementProvider } from '../contexts/OrderManagementContext';
import { useOrderManagement } from '../hooks/useOrderManagement';
import {
    getOrderTab,
    mapOrderToCancelledOrder,
    mapOrderToCompletedOrder,
    mapOrderToInProgressOrder,
    mapOrderToRequestData,
    mapOrderToScheduledOrder,
} from '../stores/orderStore';

interface OrderPageProps {
    role: UserRole;
}

const OrderManagementContent: React.FC<OrderPageProps> = ({ role }) => {
    const {
        state,
        visibleOrders,
        selectOrder,
        setActiveTab,
        setPage,
        setSearch,
        openCancelModal,
        closeCancelModal,
        setCancelReason,
        confirmCancel,
        clearSelectedOrder,
    } = useOrderManagement();

    const handleTabChange = (tab: string) => {
        setActiveTab(tab as typeof state.activeTab);
        clearSelectedOrder();
    };

    const renderOrderCard = (order: OrderResponse) => {
        const tab = getOrderTab(order);

        switch (tab) {
            case 'new':
                return (
                    <RequestCard
                        key={order.id}
                        data={mapOrderToRequestData(order)}
                        role={role}
                        onViewDetail={selectOrder}
                        onCancel={openCancelModal}
                    />
                );

            case 'scheduled':
            case 'warranty':
                return (
                    <ScheduledCard
                        key={order.id}
                        data={mapOrderToScheduledOrder(order)}
                        role={role}
                        onViewDetail={selectOrder}
                        onCancel={openCancelModal}
                    />
                );

            case 'in-progress':
                return <InProgressCard key={order.id} data={mapOrderToInProgressOrder(order)} onViewDetail={selectOrder} />;

            case 'completed':
                return <CompletedCard key={order.id} data={mapOrderToCompletedOrder(order)} role={role} onViewDetail={selectOrder} />;

            case 'cancelled':
                return <CancelledCard key={order.id} data={mapOrderToCancelledOrder(order)} role={role} onViewDetail={selectOrder} />;

            default:
                return null;
        }
    };

    return (
        <div className="layout-wrapper">
            <div className="main-content">
                <main className="page-body bg-plate-white">
                    <div className="orders-container">
                        {state.selectedOrder ? (
                            state.loadingDetail ? (
                                <div className="order-alert loading">Đang tải chi tiết đơn hàng...</div>
                            ) : state.detailError ? (
                                <div className="order-alert error">{state.detailError}</div>
                            ) : (
                                <OrderDetailPanel
                                    order={state.selectedOrder}
                                    role={role}
                                    onBack={clearSelectedOrder}
                                    onCancel={openCancelModal}
                                />
                            )
                        ) : (
                            <>
                                <div className="page-header order-page-header">
                                    <div>
                                        <h2>Quản lý đơn hàng</h2>
                                        <p className="order-page-subtitle">
                                            Dữ liệu được lấy từ API và phân nhóm theo trạng thái.
                                        </p>
                                    </div>
                                    <div className="search-bar">
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm mã đơn, khách hàng, thợ..."
                                            value={state.search}
                                            onChange={(event) => setSearch(event.target.value)}
                                        />
                                    </div>
                                </div>

                                <OrderTabs activeTab={state.activeTab} onChangeTab={handleTabChange} />

                                {state.error && <div className="order-alert error">{state.error}</div>}

                                {state.loadingList && <div className="order-alert loading">Đang tải danh sách đơn hàng...</div>}

                                <div className="request-list">
                                    {visibleOrders.length > 0 ? (
                                        visibleOrders.map(renderOrderCard)
                                    ) : (
                                        !state.loadingList && (
                                            <div className="order-empty-state">
                                                Không có đơn hàng phù hợp với bộ lọc hiện tại.
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="order-pagination">
                                    <button
                                        className="btn-secondary"
                                        disabled={state.page <= 0 || state.loadingList}
                                        onClick={() => setPage(state.page - 1)}
                                    >
                                        Trang trước
                                    </button>
                                    <span>
                                        Trang {state.page + 1} / {Math.max(state.totalPages, 1)}
                                    </span>
                                    <button
                                        className="btn-secondary"
                                        disabled={state.loadingList || (state.totalPages > 0 && state.page >= state.totalPages - 1)}
                                        onClick={() => setPage(state.page + 1)}
                                    >
                                        Trang sau
                                    </button>
                                </div>
                            </>
                        )}

                        {state.showCancelModal && (
                            <div className="modal-overlay order-cancel-modal-overlay" style={{ zIndex: 9999 }}>
                                <div className="modal-content order-cancel-modal-content" style={{ width: '500px' }}>
                                    <div className="modal-header order-cancel-modal-header">
                                        <h2 style={{ color: '#ef4444' }}>
                                            {role === 'technician' ? 'Từ chối yêu cầu' : 'Xác nhận hủy đơn'}
                                        </h2>
                                    </div>
                                    <div className="modal-body order-cancel-modal-body">
                                        <p style={{ fontSize: '14px', color: 'var(--stem-grey)', marginBottom: '16px' }}>
                                            Vui lòng cho biết lý do bạn muốn {role === 'technician' ? 'từ chối' : 'hủy'} đơn hàng <strong>{state.orderToCancelId}</strong>.
                                        </p>
                                        <textarea
                                            className="reason-input order-cancel-reason-input"
                                            placeholder="Nhập lý do chi tiết..."
                                            value={state.cancelReason}
                                            onChange={(event) => setCancelReason(event.target.value)}
                                            style={{ minHeight: '120px' }}
                                        />
                                    </div>
                                    <div className="modal-footer order-cancel-modal-footer">
                                        <button className="btn-outline order-cancel-btn-back" onClick={closeCancelModal}>
                                            Quay lại
                                        </button>
                                        <button className="btn-solid order-cancel-btn-confirm" style={{ background: '#ef4444', color: '#fff' }} onClick={confirmCancel}>
                                            Xác nhận
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export const OrderManagementPage: React.FC<OrderPageProps> = ({ role }) => {
    return (
        <OrderManagementProvider role={role}>
            <OrderManagementContent role={role} />
        </OrderManagementProvider>
    );
};

export default OrderManagementPage;
