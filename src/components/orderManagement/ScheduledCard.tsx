import React from 'react';
import type { UserRole } from '../../types/UserRole';
import { FaLocationDot, FaClock, FaUser, FaPhone, FaMessage, FaShieldHalved } from 'react-icons/fa6';
import './scheduledCard.css';
import type { ScheduledOrder } from "../../types/ScheduledOrder.ts";
import { useNavigate } from "react-router-dom";
import { navigateToChat } from "../../utils/chatNavigation";

// (Giả định ScheduledOrder của bạn đã được map thêm isWarranty và description từ store)
interface ScheduledCardProps {
    data: ScheduledOrder & { isWarranty?: boolean; description?: string };
    role: UserRole;
    onViewDetail: (id: string) => void;
    onCancel?: (id: string) => void;
}

export const ScheduledCard: React.FC<ScheduledCardProps> = ({ data, role, onViewDetail, onCancel }) => {
    const navigate = useNavigate();
    
    const handleChatClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (role === 'customer' && data.technicianId) {
            navigateToChat(navigate, role, { technicianId: data.technicianId, orderId: data.id });
            return;
        }
        navigateToChat(navigate, role, { orderId: data.id, customerId: data.customerId });
    };

    const isWarranty = data.isWarranty === true;

    return (
        <div className="sched-card" onClick={() => onViewDetail(data.id)}>
            <div className="sched-card-main">
                <div className="sched-header">
                    {/* --- ĐỔI TAG NẾU LÀ ĐƠN BẢO HÀNH --- */}
                    {isWarranty ? (
                        <span className="sched-badge" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaShieldHalved /> BẢO HÀNH MIỄN PHÍ
                        </span>
                    ) : (
                        <span className="sched-badge">{data.statusText}</span>
                    )}
                    <span className="sched-id">#{data.id}</span>
                </div>

                <h3 className="sched-title">{data.serviceName}</h3>
                
                {/* --- HIỆN LỖI ĐỂ THỢ BIẾT CHUẨN BỊ ĐỒ NGHỀ --- */}
                {isWarranty && data.description && (
                    <p style={{ color: '#ef4444', fontSize: '13px', margin: '4px 0 12px 0', lineHeight: '1.4' }}>
                        <strong>Lỗi báo cáo:</strong> {data.description}
                    </p>
                )}

                <div className="sched-info-grid">
                    <div className="info-item">
                        <FaUser className="icon" />
                        <span>{role === 'technician' ? data.customerName : data.technicianName}</span>
                    </div>
                    <div className="info-item">
                        <FaClock className="icon" />
                        <span>{data.time}</span>
                    </div>
                    <div className="info-item full-width">
                        <FaLocationDot className="icon" />
                        <span>{data.address}</span>
                    </div>
                </div>
            </div>

            <div className="sched-card-actions" onClick={(e) => e.stopPropagation()}>
                {role === 'technician' ? (
                    <>
                        <button className="btn-secondary" onClick={handleChatClick}>
                            <FaPhone /> Liên hệ khách
                        </button>
                        <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); onCancel?.(data.id); }}>
                            Hủy đơn
                        </button>
                    </>
                ) : (
                    <>
                        <button className="btn-primary" onClick={handleChatClick}>
                            <FaMessage /> Chat với thợ
                        </button>
                        <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); onCancel?.(data.id); }}>
                            Hủy đơn
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};