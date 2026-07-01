import React from 'react';
import type { UserRole } from '../../types/UserRole';
import { FaBan, FaRegCalendarXmark } from 'react-icons/fa6';
import './cancelledCard.css';
import type {CancelledOrder} from "../../types/CancelledOrder.ts";

interface CancelledCardProps {
    data: CancelledOrder;
    role: UserRole;
    onViewDetail: (id: string) => void;
}

export const CancelledCard: React.FC<CancelledCardProps> = ({ data, role, onViewDetail }) => {
    // Render text xem ai là người hủy
    const getCancelledByText = () => {
        if (data.cancelledBy === 'system') return 'Hệ thống tự động hủy';
        if (data.cancelledBy === role) return 'Bạn đã hủy đơn này';
        return role === 'technician' ? 'Khách hàng đã hủy' : 'Thợ đã từ chối/hủy';
    };

    return (
        <div className="cnc-list-card" onClick={() => onViewDetail(data.id)}>
            <div className="cnc-icon-box">
                <FaBan />
            </div>

            <div className="cnc-card-main">
                <div className="cnc-header">
                    <span className="cnc-status-badge">ĐÃ HỦY</span>
                    <span className="cnc-id">#{data.id}</span>
                </div>

                <h3 className="cnc-service-name">{data.serviceName}</h3>

                <div className="cnc-meta-row">
                    <span className="cnc-date">
                        <FaRegCalendarXmark /> Đã hủy vào: {data.cancelDate}
                    </span>
                    <span className="cnc-who-cancelled">• {getCancelledByText()}</span>
                </div>

                {/* Hiển thị lý do hủy */}
                <div className="cnc-reason-box">
                    <strong>Lý do:</strong> {data.cancelReason}
                </div>
            </div>
        </div>
    );
};