import React from 'react';
import type { UserRole } from '../../types/UserRole';
import { FaRegCalendar, FaStar, FaWrench, FaShieldHalved, FaTriangleExclamation } from 'react-icons/fa6';
import './completedCard.css';

export interface CompletedOrder {
    id: string;
    serviceName: string;
    subService: string;
    customerName: string;
    technicianName: string;
    completionDate: string;
    totalPrice: number;
    rating: number;
    warrantyTicket?: { status: string }; 
}

interface CompletedCardProps {
    data: CompletedOrder;
    role: UserRole;
    onViewDetail: (id: string) => void;
}

export const CompletedCard: React.FC<CompletedCardProps> = ({ data, role, onViewDetail }) => {
    // Đọc trạng thái bảo hành
   const ticketStatus = data.warrantyTicket?.status?.toLowerCase();
    const isPending = ticketStatus === 'pending';
    const isApproved = ticketStatus === 'in_progress' || ticketStatus === 'approved';

    return (
        <div className="cmp-list-card" onClick={() => onViewDetail(data.id)}>
            <div className="cmp-icon-box">
                <FaWrench />
            </div>

            <div className="cmp-card-main">
                {/* --- HIỂN THỊ TAG BẢO HÀNH --- */}
                {(isPending || isApproved) && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                        {isPending && (
                            <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px', background: '#fef3c7', color: '#d97706', border: '1px solid #fcd34d', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                <FaTriangleExclamation /> Chờ duyệt bảo hành
                            </span>
                        )}
                        {isApproved && (
                            <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px', background: '#ecfdf5', color: '#059669', border: '1px solid #6ee7b7', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                <FaShieldHalved /> Đang bảo hành
                            </span>
                        )}
                    </div>
                )}
                {/* ------------------------------ */}

                <h3 className="cmp-person-name">
                    {role === 'technician' ? data.customerName : data.technicianName}
                </h3>
                <p className="cmp-service-name">{data.serviceName} - {data.subService}</p>

                <div className="cmp-meta-row">
                    <span className="cmp-date">
                        <FaRegCalendar /> {data.completionDate}
                    </span>
                    {data.rating > 0 && (
                        <div className="cmp-stars">
                            {[...Array(5)].map((_, i) => (
                                <FaStar key={i} className={i < data.rating ? 'star-filled' : 'star-empty'} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="cmp-card-actions">
                <div className="cmp-price-block">
                    <span className="price-label">TỔNG CHI PHÍ</span>
                    <span className="price-value">{data.totalPrice.toLocaleString('vi-VN')} VND</span>
                </div>
            </div>
        </div>
    );
};