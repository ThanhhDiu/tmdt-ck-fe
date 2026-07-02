import React from 'react';
import { FaRegCalendar, FaWrench, FaMoneyBillWave, FaHandHoldingDollar } from 'react-icons/fa6';
import type { UserRole } from '../../types/UserRole';
import type { CompletedOrder } from '../../types/CompletedOrder';
import './paymentCard.css';

interface PaymentCardProps {
    data: CompletedOrder;
    role: UserRole;
    /** Order payment method once chosen ('cash' | 'vnpay'), else undefined. */
    paymentMethod?: string;
    onViewDetail: (id: string) => void;
    onPay: (id: string) => void;
    onConfirmCash: (id: string) => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
    data,
    role,
    paymentMethod,
    onViewDetail,
    onPay,
    onConfirmCash,
}) => {
    const isCustomer = role === 'customer';
    const method = (paymentMethod || '').toLowerCase();
    const isCash = method === 'cash';
    const isVnpay = method === 'vnpay';

    const renderActions = () => {
        if (isCustomer) {
            // Customer chose cash: pay the technician in person (Task-28).
            if (isCash) {
                return (
                    <span className="pay-cash-note">
                        <FaHandHoldingDollar /> Vui lòng thanh toán trực tiếp cho thợ
                    </span>
                );
            }
            return (
                <button className="btn-primary pay-btn" onClick={() => onPay(data.id)}>
                    <FaMoneyBillWave /> Thanh toán
                </button>
            );
        }

        // Technician side: confirm cash received unless the customer explicitly
        // opted for online payment (VNPay) — that must settle through the gateway.
        if (isVnpay) {
            return <span className="pay-waiting-note">Đang chờ khách thanh toán online</span>;
        }
        return (
            <button className="btn-primary pay-btn" onClick={() => onConfirmCash(data.id)}>
                <FaHandHoldingDollar /> Đã nhận tiền
            </button>
        );
    };

    return (
        <div className="pay-list-card" onClick={() => onViewDetail(data.id)}>
            <div className="pay-icon-box">
                <FaWrench />
            </div>

            <div className="pay-card-main">
                <div className="pay-card-header">
                    <span className="pay-status-badge">Chờ thanh toán</span>
                    {isCash && <span className="pay-method-badge">Tiền mặt</span>}
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

                {renderActions()}
            </div>
        </div>
    );
};

export default PaymentCard;
