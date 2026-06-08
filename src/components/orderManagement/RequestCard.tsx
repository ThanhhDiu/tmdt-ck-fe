import React from 'react';
import type {RequestData} from "../../types/RequestData.ts";
import type {UserRole} from "../../types/UserRole.ts";
import "./requestCard.css"

import {FaLocationDot, FaCreditCard} from 'react-icons/fa6';
import {useNavigate} from "react-router-dom";
import { navigateToChat } from "../../utils/chatNavigation";

interface RequestCardProps {
    data: RequestData;
    role: UserRole;
    onViewDetail: (id: string) => void;
    onCancel?: (id: string) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({data, role, onViewDetail, onCancel}) => {
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

    return (
        <div className="request-card" onClick={() => onViewDetail(data.id)}>

            <div className="card-content">
                <div className="card-header">
                    <h3 className="person-name">
                        {role === 'technician' ? data.customerName : (data.technicianName || 'Chưa có thợ nhận')}
                    </h3>
                    <span className="time-badge">{data.timeAgo}</span>
                </div>
                <p className="device-name">{data.deviceName}</p>
                <p className="description-snippet">{data.description}</p>

                <div className="card-meta">
                    <span><FaLocationDot/> {data.address}</span>
                    <span><FaCreditCard/> Ước tính: {data.estPrice.toLocaleString('vi-VN')} VND</span>
                </div>
            </div>

            <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                {role === 'technician' ? (
                    <>
                        <button className="btn-primary" onClick={handleChatClick}>
                            Chat & Báo giá
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCancel?.(data.id);
                            }}
                        >
                            Từ chối
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className="btn-secondary"
                            onClick={(e) => { e.stopPropagation(); onCancel?.(data.id); }}
                        >
                            Hủy yêu cầu
                        </button>
                        <button className="btn-primary" onClick={() => onViewDetail(data.id)}>Xem chi tiết</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default RequestCard;