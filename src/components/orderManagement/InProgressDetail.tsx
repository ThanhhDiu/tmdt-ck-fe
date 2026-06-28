import React, { useState } from 'react';
import type { UserRole } from '../../types/UserRole';
import type { OrderResponse } from '../../types/order/order';
import { orderController } from '../../controllers/order/orderController';
import {
    FaArrowLeft, FaCircleExclamation, FaLocationDot, 
    FaPlus, FaCheck, FaScrewdriverWrench, FaTruckFast, FaCheckDouble
} from 'react-icons/fa6';
import { AdjustmentModal } from '../modal/AdjustmentModal.tsx';
import { ImageUploader } from '../common/ImageUploader'; // Bổ sung Image Uploader
import { resolveMediaUrl } from '../../utils/mediaUrl.ts';
import './inProgressDetail.css';

interface InProgressProps {
    order: OrderResponse;
    role: UserRole;
    onBack: () => void;
    onRefreshOrder: () => void; 
}

export const InProgressDetail: React.FC<InProgressProps> = ({ order, role, onBack, onRefreshOrder }) => {
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [loading, setLoading] = useState(false);
    
    // State lưu ảnh hoàn thành do thợ tải lên
    const [completionImages, setCompletionImages] = useState<string[]>([]);

    // --- XỬ LÝ DỮ LIỆU TỪ BACKEND ---
    const currentPrice = order.finalPrice ?? order.estimatedPrice ?? 0;
    
    const adj = order.priceAdjustment;
    const isPendingApproval = adj?.status?.toUpperCase() === 'PENDING';
    const proposedPrice = adj?.newPrice ?? 0;

    // Map Thông tin Đối tác (Thợ/Khách)
    const partner = role === 'technician' ? order.customer : order.technician;
    const partnerName = partner?.fullName || 'Chưa cập nhật';
    const partnerPhone = partner?.phone || partner?.email || 'Chưa cập nhật';
    const partnerAvatar = resolveMediaUrl(partner?.avatar) || 'https://i.pravatar.cc/150?u=default';

    // Map Danh sách Vật tư
    const partsList = adj?.parts || [];

    const displayImages = adj?.evidenceImages?.length ? adj.evidenceImages : (order.images || []);

    // --- HÀM GỌI API ---

    const handleSumbitAdjustment = async (payload: any) => {
        setLoading(true);
        const res = await orderController.requestPriceAdjustment(order.id, payload);
        setLoading(false);
        setShowAdjustModal(false);
        if (res.success) {
            window.alert('Đã gửi yêu cầu điều chỉnh giá cho khách hàng!');
            onRefreshOrder(); 
        } else {
            window.alert(res.message);
        }
    };

    const handleApproveAdjustment = async () => {
        setLoading(true);
        const res = await orderController.approvePriceAdjustment(order.id);
        setLoading(false);
        if (res.success) {
            window.alert('Bạn đã chấp nhận chi phí mới!');
            onRefreshOrder();
        }
    };

    const handleRejectAdjustment = async () => {
        if (!rejectReason.trim()) return window.alert("Vui lòng nhập lý do từ chối!");
        setLoading(true);
        const res = await orderController.rejectPriceAdjustment(order.id, rejectReason);
        setLoading(false);
        if (res.success) {
            window.alert('Đã từ chối chi phí phát sinh!');
            onRefreshOrder();
        }
    };

    const handleCompleteOrder = async () => {
        // Thêm logic chặn: Bắt buộc thợ phải up ít nhất 1 ảnh nghiệm thu
        if (role === 'technician' && completionImages.length === 0) {
            window.alert("Vui lòng tải lên ít nhất 1 hình ảnh minh chứng sau khi sửa xong để hoàn tất đơn hàng!");
            return; 
        }

        if (window.confirm("Xác nhận đã sửa xong và gửi yêu cầu thanh toán cho khách?")) {
            setLoading(true);
            const res = await orderController.completeOrder(order.id, currentPrice, completionImages);
            setLoading(false);
            if (res.success) {
                window.alert('Đã hoàn tất! Chờ khách hàng thanh toán.');
                onRefreshOrder(); 
            } else {
                window.alert(res.message || 'Có lỗi xảy ra');
            }
        }
    };

    // --- GIAO DIỆN ---
    return (
        <div className="ipv-container">
            {/* Header */}
            <div className="ipv-header">
                <div className="detail-header">
                    <button className="back-btn" onClick={onBack}>
                        <FaArrowLeft /> CHI TIẾT ĐANG SỬA
                    </button>
                    <div className="header-right-actions">
                        <span className="req-id">#{order.id}</span>
                    </div>
                </div>
            </div>

            {/* Banner Cảnh báo Điều chỉnh giá */}
            {isPendingApproval && (
                <div className="ipv-alert-banner" style={{ background: '#fffbeb', border: '1px solid #f59e0b', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                    <div className="alert-content" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <FaCircleExclamation color="#d97706" size={24}/>
                        <div>
                            <p style={{ margin: 0, fontWeight: 'bold', color: '#b45309' }}>
                                {role === 'technician' 
                                    ? 'Đang chờ khách hàng xác nhận chi phí phát sinh.' 
                                    : `Thợ yêu cầu điều chỉnh giá lên ${proposedPrice.toLocaleString('vi-VN')}đ.`}
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#b45309' }}>Lý do: {adj?.reason}</p>
                        </div>
                    </div>
                    
                    {role === 'customer' && (
                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                            <button className="btn-solid" style={{ background: '#113bc6' }} onClick={handleApproveAdjustment} disabled={loading}>
                                Đồng ý giá mới
                            </button>
                            <input 
                                type="text" 
                                placeholder="Lý do từ chối..." 
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                            <button className="btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={handleRejectAdjustment} disabled={loading}>
                                Từ chối
                            </button>
                        </div>
                    )}
                </div>
            )}

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
                <div className="step active">
                    <div className="step-icon"><FaScrewdriverWrench /></div>
                    <span>Đang sửa</span>
                </div>
                <div className="step-line"></div>
                <div className="step">
                    <div className="step-icon"><FaCheckDouble /></div>
                    <span>Hoàn thành</span>
                </div>
            </div>

            {/* Thông tin Khách hàng / Thợ */}
            <div className="ipv-card">
                <div className="card-header-split">
                    <h3>{role === 'technician' ? 'Thông tin khách hàng' : 'Thông tin Thợ'}</h3>
                    <button className="btn-chat-mini">💬 Chat</button>
                </div>
                <div className="user-profile-row">
                    <img src={partnerAvatar} alt="Avatar" className="avatar" />
                    <div className="info">
                        <h4>{partnerName}</h4>
                        <p>{partnerPhone}</p>
                    </div>
                </div>
                <div className="location-row">
                    <FaLocationDot className="loc-icon"/>
                    <p>{order.address || 'Chưa cập nhật địa chỉ'}</p>
                </div>
            </div>

            {/* Vật tư & Linh kiện */}
            <div className="ipv-card">
                <div className="card-header-split">
                    <h3>Vật tư & Linh kiện {partsList.length > 0 ? `(${partsList.length})` : ''}</h3>
                </div>
                <table className="parts-table">
                    <thead>
                    <tr>
                        <th>TÊN LINH KIỆN</th>
                        <th className="text-right">ĐƠN GIÁ</th>
                    </tr>
                    </thead>
                    <tbody>
                        {partsList.length > 0 ? (
                            partsList.map((part, index) => (
                                <tr key={index}>
                                    <td>{part.name}</td>
                                    <td className="text-right">{(part.price || 0).toLocaleString('vi-VN')}đ</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={2} style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>
                                    Không có linh kiện phát sinh
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Bằng chứng hình ảnh */}
            <div className="ipv-card">
                <h3>Bằng chứng hình ảnh</h3>
                
                {/* Nếu là thợ, cho phép upload ảnh nghiệm thu để chốt đơn */}
                {role === 'technician' ? (
                    <div style={{ marginTop: '12px' }}>
                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                            Vui lòng tải lên hình ảnh sau khi sửa xong để hoàn tất đơn hàng:
                        </p>
                        <ImageUploader 
                            folder="orders"
                            urls={completionImages}
                            onChange={setCompletionImages}
                            maxImages={3}
                        />
                    </div>
                ) : (
                    <div className="photo-grid" style={{ marginTop: '12px' }}>
                        {displayImages.map((url, idx) => (
                            <img 
                                key={idx} 
                                src={resolveMediaUrl(url) || ""} 
                                alt="Ev" 
                                className="photo-item" 
                                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} 
                            />
                        ))}
                        {displayImages.length === 0 && <p style={{ color: '#64748b', fontSize: '14px' }}>Chưa có hình ảnh</p>}
                    </div>
                )}
            </div>

            {/* Tổng chi phí */}
            <div className="ipv-total-card">
                <p>TỔNG CHI PHÍ {isPendingApproval ? '(CHỜ XÁC NHẬN)' : '(HIỆN TẠI)'}</p>
                <div className="total-row">
                    <h1>{(isPendingApproval ? proposedPrice : currentPrice).toLocaleString('vi-VN')}đ</h1>
                </div>
            </div>

            {/* Actions */}
            <div className="ipv-actions">
                {role === 'technician' ? (
                    <>
                        <button
                            className="btn-outline"
                            onClick={() => setShowAdjustModal(true)}
                            disabled={isPendingApproval || loading}
                        >
                            Điều chỉnh chi phí
                        </button>
                        <button
                            className={`btn-solid ${(isPendingApproval || loading) ? 'disabled' : ''}`}
                            disabled={isPendingApproval || loading}
                            onClick={handleCompleteOrder}
                        >
                            {loading ? 'Đang xử lý...' : 'Hoàn tất & Quyết toán'}
                        </button>
                    </>
                ) : (
                    <button className="btn-solid" onClick={onBack}>Quay lại</button>
                )}
            </div>

            {/* Modal Điều chỉnh giá */}
            {showAdjustModal && (
                <AdjustmentModal
                    currentPrice={currentPrice}
                    onClose={() => setShowAdjustModal(false)}
                    onSubmit={handleSumbitAdjustment}
                />
            )}
        </div>
    );
};

export default InProgressDetail;