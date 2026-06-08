import React from 'react';
import {
    FaLocationDot, FaWrench, FaMessage,
    FaUserTie, FaRegClock, FaCircleExclamation
} from 'react-icons/fa6';
import './inProgressCard.css';
import type {InProgressOrder} from "../../types/InProgressOrder.ts";
import { useNavigate } from 'react-router-dom';
import { navigateToChat } from '../../utils/chatNavigation';

interface InProgressCardProps {
    data: InProgressOrder;
    onViewDetail: (id: string) => void;
}

export const InProgressCard: React.FC<InProgressCardProps> = ({data, onViewDetail}) => {
    const navigate = useNavigate();

    const handleChatClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigateToChat(navigate, 'customer', {
            technicianId: data.technicianId,
            orderId: data.id,
        });
    };

    return (
        <div className={`ip-list-card ${data.isWaitingApproval ? 'needs-action' : ''}`}
             onClick={() => onViewDetail(data.id)}>
            <div className="ip-card-main">
                <div className="ip-card-header">
                    {/* Đổi màu Badge tùy thuộc vào việc có đang chờ khách xác nhận không */}
                    <span className={`ip-status-badge ${data.isWaitingApproval ? 'warning' : 'active'}`}>
                        {data.statusText}
                    </span>
                    <span className="ip-id">#{data.id}</span>
                </div>

                <h3 className="ip-title">{data.serviceName}</h3>
                <p className="ip-subtitle">{data.subService}</p>

                <div className="ip-info-grid">
                    <div className="info-item">
                        <FaUserTie className="icon"/>
                        <span>Thợ: <strong>{data.technicianName}</strong></span>
                    </div>
                    <div className="info-item">
                        <FaRegClock className="icon"/>
                        <span>Bắt đầu lúc: {data.startTime}</span>
                    </div>
                    <div className="info-item full-width">
                        <FaLocationDot className="icon"/>
                        <span>{data.address}</span>
                    </div>
                </div>

                {/* Hiển thị cảnh báo nếu có phát sinh chi phí */}
                {data.isWaitingApproval && (
                    <div className="ip-alert-msg">
                        <FaCircleExclamation/> Thợ vừa cập nhật chi phí phát sinh. Vui lòng kiểm tra!
                    </div>
                )}
            </div>

            <div className="ip-card-actions" onClick={(e) => e.stopPropagation()}>
                <div className="price-display">
                    <span className="price-label">Chi phí hiện tại</span>
                    <span className={`price-value ${data.isWaitingApproval ? 'text-warning' : ''}`}>
                        {data.currentPrice.toLocaleString('vi-VN')}đ
                    </span>
                </div>

                <button className="btn-primary" onClick={() => onViewDetail(data.id)}>
                    <FaWrench/> Xem tiến độ
                </button>
                <button type="button" className="btn-secondary" onClick={handleChatClick}>
                    <FaMessage/> Chat với thợ
                </button>
            </div>
        </div>
    );
};

export default InProgressCard; 