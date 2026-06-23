import React, { useState } from 'react';
import { FaMoneyBillWave, FaCreditCard, FaXmark } from 'react-icons/fa6';
import { orderController } from '../../controllers/order/orderController';
import type { OrderPaymentMethod } from '../../types/order/order';
import './paymentModal.css';

interface PaymentModalProps {
    orderId: string;
    amount: number;
    onClose: () => void;
    /** Called after a cash payment settles successfully (so the list can refresh). */
    onPaid: () => void;
}

const METHODS: Array<{ id: OrderPaymentMethod; label: string; desc: string; icon: React.ReactNode }> = [
    { id: 'cash', label: 'Tiền mặt', desc: 'Thanh toán trực tiếp cho thợ', icon: <FaMoneyBillWave /> },
    { id: 'vnpay', label: 'VNPay', desc: 'Thanh toán online qua cổng VNPay', icon: <FaCreditCard /> },
];

export const PaymentModal: React.FC<PaymentModalProps> = ({ orderId, amount, onClose, onPaid }) => {
    const [method, setMethod] = useState<OrderPaymentMethod>('cash');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        setSubmitting(true);
        setError(null);

        const result = await orderController.selectPaymentMethod(orderId, method);

        if (!result.success) {
            setError(result.message);
            setSubmitting(false);
            return;
        }

        // VNPay: redirect the customer to the gateway checkout page.
        if (result.data.checkoutUrl) {
            window.location.href = result.data.checkoutUrl;
            return;
        }

        // Cash: settled immediately.
        onPaid();
    };

    return (
        <div className="payment-modal-overlay" onClick={onClose}>
            <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                <div className="payment-modal-header">
                    <h2>Thanh toán đơn hàng</h2>
                    <button className="payment-modal-close" onClick={onClose} aria-label="Đóng">
                        <FaXmark />
                    </button>
                </div>

                <div className="payment-modal-body">
                    <div className="payment-amount-box">
                        <span className="payment-amount-label">Tổng tiền cần thanh toán</span>
                        <span className="payment-amount-value">{amount.toLocaleString('vi-VN')} VND</span>
                        <span className="payment-order-code">Đơn #{orderId}</span>
                    </div>

                    <p className="payment-methods-title">Chọn phương thức thanh toán</p>
                    <div className="payment-methods">
                        {METHODS.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                className={`payment-method-option ${method === item.id ? 'selected' : ''}`}
                                onClick={() => setMethod(item.id)}
                            >
                                <span className="payment-method-icon">{item.icon}</span>
                                <span className="payment-method-text">
                                    <strong>{item.label}</strong>
                                    <small>{item.desc}</small>
                                </span>
                                <span className="payment-method-radio" aria-hidden />
                            </button>
                        ))}
                    </div>

                    {error && <div className="payment-modal-error">{error}</div>}
                </div>

                <div className="payment-modal-footer">
                    <button className="btn-outline" onClick={onClose} disabled={submitting}>
                        Hủy
                    </button>
                    <button className="btn-solid payment-confirm-btn" onClick={handleConfirm} disabled={submitting}>
                        {submitting
                            ? 'Đang xử lý...'
                            : method === 'vnpay'
                                ? 'Tiếp tục với VNPay'
                                : 'Xác nhận thanh toán'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
