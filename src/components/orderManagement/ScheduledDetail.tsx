import React, { useState } from 'react';
import type { UserRole } from '../../types/UserRole';
import {
    FaCheck, FaTruckFast, FaWrench, FaCheckDouble,
    FaPhone, FaMessage, FaLocationDot, FaUser, FaArrowLeft
} from 'react-icons/fa6';
import './scheduledDetail.css';
import type {ScheduledOrder} from "../../types/ScheduledOrder.ts";
import { navigateToChat } from "../../utils/chatNavigation";
import {useNavigate} from "react-router-dom";

interface ScheduledDetailProps {
    data: ScheduledOrder;
    role: UserRole;
    onBack: () => void;
    onCancel?: (id: string) => void;
}

export const ScheduledDetail: React.FC<ScheduledDetailProps> = ({ data, role, onBack, onCancel }) => {
    const navigate = useNavigate();
    const handleChatClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (role === 'customer' && data.technicianId) {
            navigateToChat(navigate, role, {
                technicianId: data.technicianId,
                orderId: data.id,
            });
            return;
        }
        navigateToChat(navigate, role, {
            orderId: data.id,
            customerId: data.customerId,
        });
    };
    const [techStatus, setTechStatus] = useState<'moving' | 'arrived'>('moving');

    return (
        <div className="sched-detail">
            {/* Header chi tiết */}
            <div className="detail-header">
                <button className="back-btn" onClick={onBack}>
                    <FaArrowLeft /> CHI TIẾT SẮP HẸN
                </button>
                <span className="req-id">#{data.id}</span>
            </div>

            {/* Stepper (Thanh tiến độ) */}
            <div className="stepper-container">
                <div className="step completed">
                    <div className="step-icon"><FaCheck /></div>
                    <span>Đã nhận đơn</span>
                </div>
                <div className="step-line completed"></div>
                <div className="step active">
                    <div className="step-icon"><FaTruckFast /></div>
                    <span>Thợ đang đến</span>
                </div>
                <div className="step-line"></div>
                <div className="step">
                    <div className="step-icon"><FaWrench /></div>
                    <span>Bắt đầu sửa</span>
                </div>
                <div className="step-line"></div>
                <div className="step">
                    <div className="step-icon"><FaCheckDouble /></div>
                    <span>Hoàn thành</span>
                </div>
            </div>

            {/* Khối Thông tin dịch vụ */}
            <div className="sched-box service-box">
                <div className="box-header-row">
                    <span className="label">DỊCH VỤ SỬA CHỮA</span>
                    <span className="premium-tag">⭐ PREMIUM</span>
                </div>
                <h2>{data.serviceName}</h2>
                <div className="service-meta">
                    <div className="meta-block">
                        <span className="label">Chi phí chốt</span>
                        <p className="price">{data.estPrice.toLocaleString('vi-VN')}đ</p>
                    </div>
                    <div className="meta-block">
                        <span className="label">Thời gian hẹn</span>
                        <p>{data.time}</p>
                    </div>
                </div>
            </div>

            {/* Khối Thông tin Đối tác / Khách hàng */}
            <div className="sched-box profile-box">
                <div className="profile-left">
                    <div className="avatar-placeholder">
                        <FaUser />
                    </div>
                    <div className="profile-info">
                        <h3>{role === 'technician' ? data.customerName : data.technicianName}</h3>
                        <p><FaLocationDot /> {data.address}</p>
                    </div>
                </div>
                <div className="profile-actions">
                    <button className="circle-btn"><FaPhone /></button>
                    <button className="circle-btn"><FaMessage /></button>
                </div>
            </div>

            {/* Khối Ghi chú */}
            <div className="sched-box note-box">
                <span className="label">📝 Ghi chú từ khách hàng</span>
                <div className="note-content">"{data.note}"</div>
            </div>

            {/* Khối Bản đồ (Placeholder) */}
            <div className="map-placeholder">
                <div className="pulse-dot"></div>
            </div>

            {/* Footer Actions (Đa luồng) */}
            <div className="detail-footer">
                <button
                    className="btn-secondary"
                    onClick={(e) => {
                        e.stopPropagation();
                        onCancel?.(data.id);
                    }}
                >
                    Hủy đơn
                </button>

                {role === 'technician' ? (
                    techStatus === 'moving' ? (
                        <button
                            className="btn-large-primary"
                            onClick={() => setTechStatus('arrived')}
                        >
                            Tôi đã đến nơi
                        </button>
                    ) : (
                        <button className="btn-large-primary" style={{ backgroundColor: '#10b981' }}>
                            Bắt đầu sửa (Chuyển tab)
                        </button>
                    )
                ) : (
                    <button className="btn-large-primary" onClick={handleChatClick}>Chat với thợ</button>
                )}
            </div>
        </div>
    );
};