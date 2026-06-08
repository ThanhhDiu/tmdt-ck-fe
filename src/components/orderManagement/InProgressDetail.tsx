import React, { useState } from 'react';
import type { UserRole } from '../../types/UserRole';
import {
    FaLocationDot,
    FaPlus, FaCloudArrowUp, FaCheck, FaScrewdriverWrench, FaArrowLeft, FaTruckFast, FaCheckDouble
} from 'react-icons/fa6';
import { AdjustmentModal } from '../modal/AdjustmentModal.tsx';
import './inProgressDetail.css';

interface InProgressProps {
    role: UserRole;
    onBack: () => void;
}

export const InProgressDetail: React.FC<InProgressProps> = ({ role, onBack }) => {
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [isPendingApproval, setIsPendingApproval] = useState(false);
    const [currentTotal, setCurrentTotal] = useState(450000);
    const [proposedTotal, setProposedTotal] = useState(0);

    const handleSumbitAdjustment = async (payload: { newPrice: number }) => {
        const newPrice = payload.newPrice;
        setProposedTotal(newPrice);
        setIsPendingApproval(true);
        setShowAdjustModal(false);
    };

    // Xử lý khi khách hàng đồng ý giá mới
    const handleApproveAdjustment = () => {
        setCurrentTotal(proposedTotal);
        setIsPendingApproval(false);
    };

    return (
        <div className="ipv-container">
            {/* Header */}
            <div className="ipv-header">
                <div className="detail-header">
                    <button className="back-btn" onClick={onBack}>
                        <FaArrowLeft /> CHI TIẾT ĐANG SỬA
                    </button>
                    <div className="header-right-actions">
                        <span className="req-id">#GU-99210</span>
                    </div>
                </div>
            </div>

            {/* Banner Cảnh báo (Chỉ hiện khi có yêu cầu điều chỉnh giá) */}
            {isPendingApproval && (
                <div className="ipv-alert-banner">
                    <div className="alert-content">
                        <span className="alert-icon">i</span>
                        <p>
                            {role === 'technician'
                                ? 'Đang chờ khách hàng xác nhận chi phí điều chỉnh'
                                : 'Thợ vừa cập nhật chi phí thực tế. Vui lòng xác nhận'}
                        </p>
                    </div>
                    {role === 'customer' && (
                        <button className="btn-approve-alert" onClick={handleApproveAdjustment}>
                            Xác nhận giá mới
                        </button>
                    )}
                </div>
            )}

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
                    <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Avatar" className="avatar" />
                    <div className="info">
                        <h4>Nguyễn Văn Minh</h4>
                        <p>0901 234 567</p>
                    </div>
                </div>
                <div className="location-row">
                    <FaLocationDot className="loc-icon"/>
                    <p>123 Nguyễn Hữu Cảnh, P.22, Q. Bình Thạnh, TP. Hồ Chí Minh</p>
                </div>
            </div>

            {/* Vật tư & Linh kiện */}
            <div className="ipv-card">
                <div className="card-header-split">
                    <h3>Vật tư & Linh kiện</h3>
                    {role === 'technician' && <button className="btn-circle"><FaPlus /></button>}
                </div>
                <table className="parts-table">
                    <thead>
                    <tr>
                        <th>TÊN LINH KIỆN</th>
                        <th className="text-right">ĐƠN GIÁ</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>Thay tụ quạt dàn lạnh</td>
                        <td className="text-right">150.000đ</td>
                    </tr>
                    <tr>
                        <td>Vệ sinh máy lạnh (nạp gas)</td>
                        <td className="text-right">300.000đ</td>
                    </tr>
                    </tbody>
                </table>
            </div>

            {/* Bằng chứng hình ảnh */}
            <div className="ipv-card">
                <h3>Bằng chứng hình ảnh</h3>
                <div className="photo-grid">
                    <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=150" alt="Ev" className="photo-item" />
                    <img src="https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=150" alt="Ev" className="photo-item" />
                    {role === 'technician' && (
                        <div className="upload-box">
                            <FaCloudArrowUp className="up-icon"/>
                            <span>UPLOAD ẢNH MỚI</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tổng chi phí */}
            <div className="ipv-total-card">
                <p>TỔNG CHI PHÍ DỰ KIẾN</p>
                <div className="total-row">
                    <h1>{currentTotal.toLocaleString('vi-VN')}đ</h1>
                    <span className="payment-method">THANH TOÁN BẰNG TIỀN MẶT</span>
                </div>
            </div>

            <div className="ipv-actions">
                {role === 'technician' ? (
                    <>
                        <button
                            className="btn-outline"
                            onClick={() => setShowAdjustModal(true)}
                            disabled={isPendingApproval}
                        >
                            Điều chỉnh chi phí
                        </button>
                        <button
                            className={`btn-solid ${isPendingApproval ? 'disabled' : ''}`}
                            disabled={isPendingApproval}
                        >
                            Hoàn tất & Quyết toán
                        </button>
                    </>
                ) : (
                    <button className="btn-solid" onClick={onBack}>Quay lại</button>
                )}
            </div>

            {/* Modal Điều chỉnh giá */}
            {showAdjustModal && (
                <AdjustmentModal
                    currentPrice={currentTotal}
                    onClose={() => setShowAdjustModal(false)}
                    onSubmit={handleSumbitAdjustment}
                />
            )}
        </div>
    );
};

export default InProgressDetail;