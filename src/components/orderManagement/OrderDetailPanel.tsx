import React, { useState } from 'react';
import { FaArrowLeft, FaCalendarCheck, FaClock, FaMoneyBillWave, FaUser, FaUsers, FaImage, FaLocationDot } from 'react-icons/fa6';
import type { UserRole } from '../../types/UserRole.ts';
import type { OrderResponse } from '../../types/order/order';
import { getOrderStatusLabel } from '../../stores/orderStore';
import { resolveMediaUrl } from '../../utils/mediaUrl.ts';

interface OrderDetailPanelProps {
    order: OrderResponse;
    role: UserRole;
    onBack: () => void;
    onCancel: (id: string) => void;
    onPay?: (order: OrderResponse) => void;
    onConfirmCash?: (id: string) => void;
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

export const OrderDetailPanel: React.FC<OrderDetailPanelProps> = ({ order, role, onBack, onCancel, onPay, onConfirmCash }) => {
    const partner = role === 'technician' ? order.customer : order.technician;
    const normalizedStatus = order.status.toLowerCase();
    const canCancel = !['completed', 'cancelled'].includes(normalizedStatus);
    const awaitingPayment = normalizedStatus.includes('await') || normalizedStatus.includes('payment');
    const method = (order.paymentMethod || '').toLowerCase();
    const isCash = method === 'cash';
    const isVnpay = method === 'vnpay';
    const canPay = role === 'customer' && awaitingPayment && !isCash && Boolean(onPay);
    const customerCashNote = role === 'customer' && awaitingPayment && isCash;
    // Technician can confirm cash unless the customer explicitly chose VNPay.
    const canConfirmCash = role === 'technician' && awaitingPayment && !isVnpay && Boolean(onConfirmCash);
    const hasImages = (order.images?.length ?? 0) > 0;
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

    // Lấy ảnh vật tư (nếu có)
    const adjImages = order.priceAdjustment?.evidenceImages || [];

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
                        {/* Lưu ý: Nếu báo lỗi beforePrice/afterPrice không tồn tại, bạn đổi thành originalPrice/newPrice nhé */}
                        <div>Từ: {formatMoney((order.priceAdjustment as any).beforePrice ?? order.priceAdjustment.originalPrice)} VND</div>
                        <div>Đến: {formatMoney((order.priceAdjustment as any).afterPrice ?? order.priceAdjustment.newPrice)} VND</div>
                    </div>
                )}
            </div>

            {/* --- KHỐI HÌNH ẢNH MỚI ĐÃ ĐỒNG BỘ --- */}
            <div className="detail-card mt-24">
                <div className="detail-card-header">
                    <span className="detail-label">Hình ảnh đính kèm</span>
                    <span className="detail-count">{order.images?.length ?? 0} ảnh</span>
                </div>

                {hasImages ? (
                    <div className="images-block">
                        <div className="image-grid">
                            {order.images?.map((image, index) => {
                                const resolvedImage = resolveMediaUrl(image);
                                return (
                                    <img
                                        key={`${order.id}-${index}`}
                                        src={resolvedImage || ''}
                                        alt={`Ảnh thiết bị ${index + 1}`}
                                        className="req-image"
                                        onClick={() => setFullScreenImage(resolvedImage)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="detail-empty-state">
                        <FaImage /> Chưa có hình ảnh đính kèm.
                    </div>
                )}

                {/* --- ẢNH VẬT TƯ NẰM RIÊNG BIỆT --- */}
                {adjImages.length > 0 && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                        <div className="detail-card-header">
                            <span className="detail-label" style={{ color: '#d97706' }}>Ảnh vật tư phát sinh</span>
                            <span className="detail-count" style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>{adjImages.length} ảnh</span>
                        </div>
                        <div className="images-block" style={{ marginTop: '12px' }}>
                            <div className="image-grid">
                                {adjImages.map((image, index) => {
                                    const resolvedImage = resolveMediaUrl(image);
                                    return (
                                        <img
                                            key={`adj-${index}`}
                                            src={resolvedImage || ''}
                                            alt={`Ảnh vật tư ${index + 1}`}
                                            className="req-image"
                                            style={{ border: '2px solid #f59e0b' }}
                                            onClick={() => setFullScreenImage(resolvedImage)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {fullScreenImage && (
                    <div className="lightbox-overlay" onClick={() => setFullScreenImage(null)}>
                        <img src={fullScreenImage} alt="Phóng to" className="lightbox-image" />
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
                {canPay && (
                    <button className="btn-large-primary" onClick={() => onPay?.(order)}>
                        Thanh toán {formatMoney(order.finalPrice ?? order.estimatedPrice)} VND
                    </button>
                )}
                {customerCashNote && (
                    <span className="detail-cash-note">Vui lòng thanh toán trực tiếp cho thợ</span>
                )}
                {canConfirmCash && (
                    <button className="btn-large-primary" onClick={() => onConfirmCash?.(order.id)}>
                        Đã nhận tiền
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderDetailPanel;