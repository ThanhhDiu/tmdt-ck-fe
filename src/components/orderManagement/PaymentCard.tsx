import React from 'react';
import { FaRegCalendar, FaWrench, FaMoneyBillWave } from 'react-icons/fa6';
import type { UserRole } from '../../types/UserRole';
import type { CompletedOrder } from '../../types/CompletedOrder';
import './paymentCard.css';

interface PaymentCardProps {
    data: CompletedOrder;
    role: UserRole;
    onViewDetail: (id: string) => void;
    onPay: (id: string) => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({ data, role, onViewDetail, onPay }) => {
    const isCustomer = role === 'customer';

    return (
        <div className="pay-list-card" onClick={() => onViewDetail(data.id)}>
            <div className="pay-icon-box">
                <FaWrench />
            </div>

            <div className="pay-card-main">
                <div className="pay-card-header">
                    <span className="pay-status-badge">Chờ thanh toán</span>
                    <span className="pay-id">#{data.id}</span>
                </div>
                <h3 className="pay-person-name">
                    {role === 'technician' ? data.customerName : data.technicianName}
                </h3>
                <p className="pay-service-name">{data.serviceName} - {data.subService}</p>
                <span className="pay-date">
                    <FaRegCalendar /> {data.completionDate}
                </span>
            </div>

            <div className="pay-card-actions" onClick={(e) => e.stopPropagation()}>
                <div className="pay-price-block">
                    <span className="price-label">TỔNG TIỀN CẦN THANH TOÁN</span>
                    <span className="price-value">{data.totalPrice.toLocaleString('vi-VN')} VND</span>
                </div>

                {isCustomer ? (
                    <button className="btn-primary pay-btn" onClick={() => onPay(data.id)}>
                        <FaMoneyBillWave /> Thanh toán
                    </button>
                ) : (
                    <span className="pay-waiting-note">Đang chờ khách thanh toán</span>
                )}
            </div>
        </div>
    );
};

export default PaymentCard;
