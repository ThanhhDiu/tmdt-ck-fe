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

type OrderWithReviewState = OrderResponse & {
    review?: unknown;
    customerReview?: unknown;
    reviewId?: string | null;
    reviewed?: boolean;
    hasReview?: boolean;
    rating?: number | null;
};

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
const reviewedOrderKey = (orderId: string) => `glowup_reviewed_order_${orderId}`;

const getLocalReviewedState = (orderId: string) => {
    try {
        return localStorage.getItem(reviewedOrderKey(orderId)) === 'true';
    } catch {
        return false;
    }
};

const setLocalReviewedState = (orderId: string) => {
    try {
        localStorage.setItem(reviewedOrderKey(orderId), 'true');
    } catch {
        // UI state is still updated even when storage is unavailable.
    }
};

const hasOrderReview = (order: OrderResponse) => {
    const data = order as OrderWithReviewState;
    return Boolean(
        data.review ||
        data.customerReview ||
        data.reviewId ||
        data.reviewed ||
        data.hasReview ||
        data.rating
    );
};

export const OrderDetailPanel: React.FC<OrderDetailPanelProps> = ({ order, role, onBack, onCancel, onPay, onConfirmCash }) => {
    const [reviewOpen, setReviewOpen] = React.useState(false);
    const [reportOpen, setReportOpen] = React.useState(false);
    const [reviewSubmitted, setReviewSubmitted] = React.useState(() => getLocalReviewedState(order.id));

    React.useEffect(() => {
        setReviewSubmitted(getLocalReviewedState(order.id));
    }, [order.id]);

    const handleReviewSubmitted = React.useCallback(() => {
        setReviewSubmitted(true);
        setReviewOpen(false);
        setLocalReviewedState(order.id);
        window.alert('Đã gửi đánh giá. Cảm ơn bạn!');
    }, [order.id]);

    const partner = role === 'technician' ? order.customer : order.technician;
    const normalizedStatus = order.status.toLowerCase();
    const canCancel = !['completed', 'cancelled'].includes(normalizedStatus);
    const awaitingPayment = normalizedStatus.includes('await') || normalizedStatus.includes('payment');
    const isCash = (order.paymentMethod || '').toLowerCase() === 'cash';
    const canPay = role === 'customer' && awaitingPayment && !isCash && Boolean(onPay);
    const customerCashNote = role === 'customer' && awaitingPayment && isCash;
    const canConfirmCash = role === 'technician' && awaitingPayment && isCash && Boolean(onConfirmCash);
    const hasImages = (order.images?.length ?? 0) > 0;
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

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
                    <div className="images-block">
                        <div className="image-grid">
                            {order.images?.map((img, idx) => (
                                <img 
                                    key={idx} 
                                    src={resolveMediaUrl(img) || ""}
                                    alt={`Ảnh thiết bị ${idx + 1}`} 
                                    className="req-image" 
                                    onClick={() => setFullScreenImage(resolveMediaUrl(img))} // THÊM SỰ KIỆN CLICK
                                />
                            ))}
                        </div>
                    </div>                

                ) : (
                    <div className="detail-empty-state">
                        <FaImage /> Chưa có hình ảnh đính kèm.
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

            {canReviewOrReport && (
                <div className="detail-card mt-24">
                    <span className="detail-label">Đánh giá & báo cáo</span>
                    <p className="detail-description">
                        Gửi đánh giá chất lượng hoặc báo cáo vi phạm sau khi đơn hàng hoàn tất.
                    </p>
                    <div className="detail-footer" style={{ justifyContent: 'flex-start', padding: 0, marginTop: 16 }}>
                        {canReview && (
                            <button className="btn-large-primary" onClick={() => setReviewOpen(true)}>
                                Gửi đánh giá
                            </button>
                        )}
                        <button className="btn-large-primary danger-button" onClick={() => setReportOpen(true)}>
                            Báo cáo sự cố
                        </button>
                    </div>
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
                {canCancel && (
                    <button className="btn-large-primary danger-button" onClick={() => onCancel(order.id)}>
                        Hủy đơn
                    </button>
                )}
            </div>

            {order.technician?.id && (
                <>
                    <ReviewModal
                        open={reviewOpen}
                        orderId={order.id}
                        onClose={() => setReviewOpen(false)}
                        onSubmitted={handleReviewSubmitted}
                    />
                    <ReportModal
                        open={reportOpen}
                        orderId={order.id}
                        orderCode={order.id}
                        onClose={() => setReportOpen(false)}
                        onSubmitted={() => window.alert('Đã gửi khiếu nại. GlowUp sẽ xử lý trong thời gian sớm nhất.')}
                    />
                </>
            )}
        </div>
    );
};

export default OrderDetailPanel;
