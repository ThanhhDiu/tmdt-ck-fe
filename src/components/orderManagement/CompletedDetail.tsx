import React, { useEffect, useState } from 'react';
import type { UserRole } from '../../types/UserRole';
import type { OrderResponse } from '../../types/order/order';
import {
    FaCheck, FaWallet, FaShieldHalved, FaStar,
    FaMessage, FaTriangleExclamation,
    FaArrowLeft, FaTruckFast, FaWrench, FaCheckDouble
} from 'react-icons/fa6';
import './completedDetail.css';
import WarrantyModal from '../modal/WarrantyModal';
import ReportModal from '../modal/ReportModal';
import { resolveMediaUrl } from '../../utils/mediaUrl.ts';
import { useNavigate } from 'react-router-dom';
import { navigateToChat } from '../../utils/chatNavigation';
import { orderController } from '../../controllers/order/orderController.ts';

interface CompletedDetailProps {
    order: OrderResponse; 
    role: UserRole;
    onBack: () => void;
    onRefreshOrder: () => void;
    onOpenRating?: () => void;
}

const formatDateTime = (value?: string): string => {
    if (!value) return 'Chưa cập nhật';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}, Ngày ${date.getDate()} Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
};

export const CompletedDetail: React.FC<CompletedDetailProps> = ({ order, role, onBack, onRefreshOrder, onOpenRating}) => {
    const navigate = useNavigate();
    const [showWarrantyModal, setShowWarrantyModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    
    // --- THÊM STATE LOCAL ĐỂ LƯU THÔNG TIN BẢO HÀNH ---
    const [localWarranty, setLocalWarranty] = useState<any>(null);

    // --- HÀM TỰ ĐỘNG FETCH DATA BẢO HÀNH ---
    const fetchWarrantyData = async () => {
        if (!order?.id) return;
        const res = await orderController.getWarrantyInfo(order.id);
        if (res.success && res.data) {
            setLocalWarranty(res.data);
        }
    };

    useEffect(() => {
        fetchWarrantyData();
    }, [order?.id]);

    if (!order) {
        return <div className="order-alert error">Không tìm thấy dữ liệu đơn hàng!</div>;
    }

    const completedAt = formatDateTime(order.completedAt ?? order.updatedAt);
    const baseFee = order.priceAdjustment?.originalPrice ?? order.estimatedPrice ?? 0;
    const finalPrice = order.finalPrice ?? order.estimatedPrice ?? 0;
    const partsList = order.priceAdjustment?.parts || [];

    const getPaymentMethodLabel = (method?: string) => {
        if (!method) return 'Chưa cập nhật';
        const normalized = method.toLowerCase();
        if (normalized === 'cash') return 'Tiền mặt';
        if (normalized === 'vnpay') return 'Ví VNPay';
        return method;
    };
    const paymentMethodLabel = getPaymentMethodLabel(order.paymentMethod);

    const evidenceImages = order.priceAdjustment?.evidenceImages?.length 
        ? order.priceAdjustment.evidenceImages 
        : (order.images || []);

    const partner = role === 'technician' ? order.customer : order.technician;
    const partnerAvatar = resolveMediaUrl(partner?.avatar) || 'https://i.pravatar.cc/150?u=default';

    const warrantyMonths = order.warrantyMonths ?? 0;
    const completedDate = order.completedAt ? new Date(order.completedAt) : null;
    
    let hasWarranty = false;
    let warrantyExpireStr = '';

    if (completedDate && warrantyMonths > 0) {
        const expireDate = new Date(completedDate);
        expireDate.setMonth(expireDate.getMonth() + warrantyMonths);
        hasWarranty = expireDate > new Date(); 
        warrantyExpireStr = `${expireDate.getDate().toString().padStart(2, '0')}/${(expireDate.getMonth() + 1).toString().padStart(2, '0')}/${expireDate.getFullYear()}`;
    }

    // --- LẤY DATA BẢO HÀNH TỪ LOCAL STATE HOẶC TỪ ORDER ---
    const warrantyTicket = localWarranty || order.warrantyTicket;
    const ticketStatus = warrantyTicket?.status?.toLowerCase();
    
    const isWarrantyPending = ticketStatus === 'pending';
    const isWarrantyApproved = ticketStatus === 'in_progress' || ticketStatus === 'approved';

    const [isUpdating, setIsUpdating] = useState(false);
    const handleUpdateWarranty = async (status: 'in_progress' | 'rejected') => {
        // Có thể BE cần 'id' hoặc 'code', nếu báo lỗi bạn thay bằng warrantyTicket.code nhé
        const warrantyId = warrantyTicket?.id || warrantyTicket?.code; 
        if (!warrantyId) return; 

        const confirmMsg = status === 'in_progress' 
            ? 'Xác nhận tiếp nhận bảo hành? Hệ thống sẽ tự tạo lịch hẹn 0đ mới.'
            : 'Bạn chắc chắn muốn từ chối yêu cầu bảo hành này?';
            
        if (window.confirm(confirmMsg)) {
            setIsUpdating(true);
            const res = await orderController.updateWarrantyStatus(warrantyId, status);
            setIsUpdating(false);
            
            if (res.success) {
                window.alert('Đã xử lý yêu cầu bảo hành thành công!');
                fetchWarrantyData(); // Lấy lại trạng thái mới nhất
                onRefreshOrder(); // Báo ra cha để reload lại list nếu cần
            } else {
                window.alert(res.message || 'Lỗi xử lý');
            }
        }
    };

    const isRated = false; 
    const ratingGiven = 0; 

    const handleChatClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (role === 'customer' && order.technician?.id) {
            navigateToChat(navigate, role, { technicianId: order.technician.id, orderId: order.id });
            return;
        }
        navigateToChat(navigate, role, { orderId: order.id, customerId: order.customer?.id });
    };

    // --- GIAO DIỆN ---
    return (
        <div className="cmp-detail-container">
            {/* Header */}
            <div className="detail-header">
                <button className="back-btn" onClick={onBack}>
                    <FaArrowLeft /> CHI TIẾT HOÀN THÀNH
                </button>
                <span className="req-id">#{order.id}</span>
            </div>

            {/* Stepper */}
            <div className="stepper-container">
                <div className="step completed">
                    <div className="step-icon"><FaCheck /></div>
                    <span>Đã nhận đơn</span>
                </div>
                <div className="step-line completed"></div>
                <div className="step completed">
                    <div className="step-icon"><FaTruckFast /></div>
                    <span>Thợ đến</span>
                </div>
                <div className="step-line completed"></div>
                <div className="step completed">
                    <div className="step-icon"><FaWrench /></div>
                    <span>Bắt đầu sửa</span>
                </div>
                <div className="step-line completed"></div>
                <div className="step active">
                    <div className="step-icon"><FaCheckDouble /></div>
                    <span>Hoàn thành</span>
                </div>
            </div>

            <div className="cmp-header-row">
                <div className="header-info">
                    <p>Hoàn thành vào {completedAt}</p>
                </div>
                <div className="header-actions">
                    {role === 'customer' && (
                        <button className="btn-outline-gray" onClick={handleChatClick}>
                            <FaMessage /> Liên hệ thợ
                        </button>
                    )}
                </div>
            </div>

            <div className="cmp-grid-layout">
                {/* --- CỘT TRÁI --- */}
                <div className="cmp-col-main">

                    {/* Chi tiết thanh toán (Hóa đơn) */}
                    <div className="cmp-card">
                        <h3>Chi tiết thanh toán</h3>
                        <div className="invoice-rows">
                            <div className="inv-row">
                                <span>Phí dịch vụ ban đầu</span>
                                <span>{baseFee.toLocaleString('vi-VN')}đ</span>
                            </div>
                            {partsList.map((part, idx) => (
                                <div className="inv-row" key={idx}>
                                    <span>{part.name}</span>
                                    <span>{(part.price || 0).toLocaleString('vi-VN')}đ</span>
                                </div>
                            ))}
                        </div>
                        <div className="inv-total-row">
                            <span className="total-label">Tổng thanh toán</span>
                            <span className="total-price">{finalPrice.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="payment-method-box">
                            <FaWallet className="wallet-icon"/>
                            <div>
                                <span className="pm-label">Phương thức thanh toán</span>
                                <strong className="pm-value">{paymentMethodLabel}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Bằng chứng hình ảnh nghiệm thu */}
                    <div className="cmp-card">
                        <div className="card-header-flex">
                            <h3>Hình ảnh nghiệm thu</h3>
                            <span className="photo-count">{evidenceImages.length} ẢNH</span>
                        </div>
                        <div className="photo-grid-row">
                            {evidenceImages.length > 0 ? (
                                evidenceImages.map((url, idx) => (
                                    <img 
                                        key={idx} 
                                        src={resolveMediaUrl(url) || ""} 
                                        alt={`Nghiệm thu ${idx + 1}`} 
                                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                ))
                            ) : (
                                <p style={{ color: '#64748b', fontSize: '14px' }}>Không có hình ảnh nghiệm thu.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI --- */}
                <div className="cmp-col-side">

                    {/* Khối Đánh Giá (Rating Box) */}
                    <div className="cmp-card rating-card">
                        <h3>Đánh giá dịch vụ</h3>
                        {role === 'customer' ? (
                            !isRated ? (
                                <>
                                    <p className="rating-desc">Trải nghiệm của bạn giúp thợ và cộng đồng GlowUp tốt hơn.</p>
                                    <div className="rating-stars-input">
                                        {[...Array(5)].map((_, i) => <FaStar key={i} className="star-empty" />)}
                                    </div>
                                    <div className="rating-placeholder" onClick={onOpenRating}>
                                        Chia sẻ cảm nghĩ của bạn về chất lượng sửa chữa...
                                    </div>
                                    <button className="btn-solid-dark w-100" onClick={onOpenRating}>
                                        Gửi đánh giá
                                    </button>
                                </>
                            ) : (
                                <div className="rated-success">
                                    <div className="cmp-stars justify-center mb-2">
                                        {[...Array(5)].map((_, i) => <FaStar key={i} className="star-filled" />)}
                                    </div>
                                    <p>Bạn đã đánh giá dịch vụ này.</p>
                                </div>
                            )
                        ) : (
                            /* Góc nhìn của Thợ: Xem đánh giá khách chấm */
                            <div className="tech-received-rating">
                                {isRated ? (
                                    <>
                                        <div className="cmp-stars mb-2">
                                            {[...Array(5)].map((_, i) => <FaStar key={i} className={i < ratingGiven ? 'star-filled' : 'star-empty'} />)}
                                        </div>
                                        <p className="rating-comment">"Khách hàng đã để lại đánh giá."</p>
                                    </>
                                ) : (
                                    <p className="rating-desc">Khách hàng chưa để lại đánh giá.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Khối Hỗ trợ & Bảo hành */}
                    <div className="cmp-card warranty-card">
                        <h3>Hỗ trợ & Bảo hành</h3>

                        {isWarrantyPending ? (
                            <div className="warranty-pending-box" style={{ background: '#fffbeb', padding: '12px', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                                <p style={{ color: '#d97706', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                                    <FaTriangleExclamation /> Yêu cầu bảo hành đang chờ duyệt
                                </p>
                                <p style={{ fontSize: '14px', margin: '4px 0' }}><strong>Lỗi:</strong> {warrantyTicket.description}</p>
                                {/* Format thời gian hẹn tùy theo hàm format của bạn */}
                                <p style={{ fontSize: '14px', margin: '4px 0' }}><strong>Lịch hẹn:</strong> {new Date(warrantyTicket.scheduledAt).toLocaleString('vi-VN')}</p>
                                
                                {role === 'customer' ? (
                                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '12px', fontStyle: 'italic' }}>
                                        * Vui lòng chờ thợ xác nhận yêu cầu của bạn.
                                    </p>
                                ) : (
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                        <button 
                                            className="btn-solid" 
                                            style={{ background: '#10b981', flex: 1 }} 
                                            onClick={() => handleUpdateWarranty('in_progress')}
                                            disabled={isUpdating}
                                        >
                                            Tiếp nhận
                                        </button>
                                        <button 
                                            className="btn-outline" 
                                            style={{ color: '#ef4444', borderColor: '#ef4444', flex: 1 }} 
                                            onClick={() => handleUpdateWarranty('rejected')}
                                            disabled={isUpdating}
                                        >
                                            Từ chối
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : isWarrantyApproved ? (
                            <div className="warranty-approved-box" style={{ background: '#ecfdf5', padding: '12px', borderRadius: '8px', border: '1px solid #10b981' }}>
                                <p style={{ color: '#059669', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FaShieldHalved /> Đã tạo lịch hẹn bảo hành mới
                                </p>
                                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
                                    Vui lòng kiểm tra màn hình chính (Tab "Sắp hẹn") để theo dõi tiến độ.
                                </p>
                            </div>
                        ) : (
                            role === 'customer' && (
                                <>
                                    <div className="warranty-status">
                                        <FaShieldHalved className="shield-icon" style={{ color: hasWarranty ? '#10b981' : '#94a3b8' }} />
                                        <div>
                                            <strong>{hasWarranty ? 'Còn thời hạn bảo hành' : 'Đã hết hạn bảo hành'}</strong>
                                            {hasWarranty && <p>Bảo hành đến ngày {warrantyExpireStr}.</p>}
                                        </div>
                                    </div>
                                    <button
                                        className="btn-outline-dark w-100 mb-3"
                                        onClick={() => setShowWarrantyModal(true)}
                                        disabled={!hasWarranty}
                                        style={{ opacity: hasWarranty ? 1 : 0.5, cursor: hasWarranty ? 'pointer' : 'not-allowed' }}
                                    >
                                        Gửi yêu cầu bảo hành
                                    </button>
                                </>
                            )
                        )}

                        <button className="btn-text-danger w-100 text-center mt-3" onClick={() => setShowReportModal(true)}>
                            <FaTriangleExclamation /> Báo cáo sự cố
                        </button>
                    </div>

                </div>
            </div>

            {showWarrantyModal && (
                <WarrantyModal
                    open={showWarrantyModal}
                    orderId={order.id}
                    onClose={() => setShowWarrantyModal(false)}
                    onSuccess={() => {
                        setShowWarrantyModal(false);
                        fetchWarrantyData();
                        onRefreshOrder();
                    }}
                />
            )}

            <ReportModal
                open={showReportModal}
                onClose={() => setShowReportModal(false)}
            />

        </div>
    );
};