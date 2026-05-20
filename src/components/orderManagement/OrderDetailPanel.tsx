import React from 'react';
import { FaArrowLeft, FaCalendarCheck, FaClock, FaMoneyBillWave, FaUser, FaUsers, FaImage, FaLocationDot } from 'react-icons/fa6';
import type { UserRole } from '../../types/UserRole.ts';
import type { OrderResponse } from '../../types/order/order';
import { getOrderStatusLabel } from '../../stores/orderStore';

interface OrderDetailPanelProps {
    order: OrderResponse;
    role: UserRole;
    onBack: () => void;
    onCancel: (id: string) => void;
}

const formatDateTime = (value?: string): string => {
    if (!value) return 'Chưa cập nhật';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatMoney = (value?: number): string => (value ?? 0).toLocaleString('vi-VN');

export const OrderDetailPanel: React.FC<OrderDetailPanelProps> = ({ order, role, onBack, onCancel }) => {
    const partner = role === 'technician' ? order.customer : order.technician;
    const canCancel = !['completed', 'cancelled'].includes(order.status.toLowerCase());
    const hasImages = (order.images?.length ?? 0) > 0;

    return (
        <div className="order-detail-panel">
            <div className="detail-header">
                <button className="back-btn" onClick={onBack}>
                    <FaArrowLeft /> CHI TIẾT ĐƠN HÀNG
                </button>
                <span className="req-id">#{order.id}</span>
            </div>

            <div className="detail-summary-grid">
                <section className="detail-card">
                    <div className="detail-card-header">
                        <span className="detail-label">Trạng thái</span>
                        <span className="detail-status-pill">{getOrderStatusLabel(order)}</span>
                    </div>
                    <h2>{order.serviceName ?? order.deviceName ?? 'Đơn hàng'}</h2>
                    <p>{order.subService ?? order.serviceCategory ?? order.description ?? 'Không có mô tả'}</p>

                    <div className="detail-meta-list">
                        <div className="detail-meta-item"><FaLocationDot /> {order.address ?? 'Chưa cập nhật địa chỉ'}</div>
                        <div className="detail-meta-item"><FaClock /> {formatDateTime(order.scheduledAt ?? order.expectedTime)}</div>
                        <div className="detail-meta-item"><FaMoneyBillWave /> {formatMoney(order.finalPrice ?? order.estimatedPrice)} VND</div>
                    </div>
                </section>

                <section className="detail-card">
                    <span className="detail-label">{role === 'technician' ? 'Khách hàng' : 'Thợ phụ trách'}</span>
                    <div className="detail-profile-row">
                        <div className="detail-avatar"><FaUser /></div>
                        <div>
                            <h3>{partner?.fullName ?? 'Chưa cập nhật'}</h3>
                            <p>{partner?.phone ?? partner?.email ?? 'Chưa có liên hệ'}</p>
                        </div>
                    </div>

                    <div className="detail-meta-list mt-16">
                        <div className="detail-meta-item"><FaUsers /> {order.customer?.fullName ?? 'Khách hàng'}</div>
                        <div className="detail-meta-item"><FaCalendarCheck /> {formatDateTime(order.createdAt)}</div>
                    </div>
                </section>
            </div>

            <div className="detail-card mt-24">
                <span className="detail-label">Mô tả & ghi chú</span>
                <p className="detail-description">{order.description ?? 'Đơn hàng chưa có mô tả chi tiết.'}</p>

                {order.priceAdjustment && (
                    <div className="detail-adjustment-box">
                        <strong>Điều chỉnh giá:</strong>
                        <div>Trạng thái: {order.priceAdjustment.status ?? 'Chưa cập nhật'}</div>
                        <div>Từ: {formatMoney(order.priceAdjustment.beforePrice)} VND</div>
                        <div>Đến: {formatMoney(order.priceAdjustment.afterPrice)} VND</div>
                    </div>
                )}
            </div>

            <div className="detail-card mt-24">
                <div className="detail-card-header">
                    <span className="detail-label">Hình ảnh</span>
                    <span className="detail-count">{order.images?.length ?? 0} ảnh</span>
                </div>

                {hasImages ? (
                    <div className="detail-image-grid">
                        {order.images?.map((image, index) => (
                            <img key={`${order.id}-${index}`} src={image} alt={`Order ${order.id} ${index + 1}`} />
                        ))}
                    </div>
                ) : (
                    <div className="detail-empty-state">
                        <FaImage /> Chưa có hình ảnh đính kèm.
                    </div>
                )}
            </div>

            {order.cancelReason && (
                <div className="detail-card mt-24 danger-border">
                    <span className="detail-label">Lý do hủy</span>
                    <p className="detail-description">{order.cancelReason}</p>
                </div>
            )}

            <div className="detail-footer">
                <button className="btn-large-secondary" onClick={onBack}>
                    Quay lại
                </button>
                {canCancel && (
                    <button className="btn-large-primary danger-button" onClick={() => onCancel(order.id)}>
                        Hủy đơn
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderDetailPanel;
