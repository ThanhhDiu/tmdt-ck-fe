import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import './paymentResultPage.css';

/**
 * VNPay return landing page (Task-27).
 *
 * VNPay redirects the customer here after checkout with `vnp_ResponseCode`
 * ("00" = success). The order itself is finalized server-side by the IPN
 * callback; this page only reflects the outcome to the user.
 */
export const PaymentResultPage: React.FC = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const responseCode = params.get('vnp_ResponseCode');
    const orderInfo = params.get('vnp_OrderInfo') ?? '';
    const rawAmount = params.get('vnp_Amount');
    const amount = rawAmount ? Number(rawAmount) / 100 : null;

    const success = responseCode === '00';

    return (
        <div className="payment-result-page">
            <div className={`payment-result-card ${success ? 'success' : 'failed'}`}>
                <div className="payment-result-icon">
                    {success ? <FaCircleCheck /> : <FaCircleXmark />}
                </div>
                <h1>{success ? 'Thanh toán thành công' : 'Thanh toán thất bại'}</h1>
                <p className="payment-result-message">
                    {success
                        ? 'Đơn hàng của bạn đã được thanh toán và hoàn thành. Cảm ơn bạn đã sử dụng dịch vụ!'
                        : 'Giao dịch chưa hoàn tất. Bạn có thể thử lại từ trang quản lý đơn hàng.'}
                </p>

                {amount !== null && (
                    <div className="payment-result-amount">
                        Số tiền: <strong>{amount.toLocaleString('vi-VN')} VND</strong>
                    </div>
                )}
                {orderInfo && <div className="payment-result-info">{decodeURIComponent(orderInfo)}</div>}

                <button className="payment-result-btn" onClick={() => navigate('/customer/order-management')}>
                    Về trang đơn hàng
                </button>
            </div>
        </div>
    );
};

export default PaymentResultPage;
