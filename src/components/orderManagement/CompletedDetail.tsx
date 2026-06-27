import React, {useState} from 'react';
import type { UserRole } from '../../types/UserRole';
import {
    FaCheck, FaWallet, FaShieldHalved, FaStar,
    FaDownload, FaMessage, FaTriangleExclamation,
    FaArrowLeft, FaTruckFast, FaWrench, FaCheckDouble
} from 'react-icons/fa6';
import './completedDetail.css';
import WarrantyModal from '../modal/WarrantyModal';
import ReportModal from '../modal/ReportModal';

interface CompletedDetailProps {
    role: UserRole;
    onBack: () => void;
    onOpenRating?: () => void;
}

export const CompletedDetail: React.FC<CompletedDetailProps> = ({ role, onBack, onOpenRating }) => {
    const [showWarrantyModal, setShowWarrantyModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const orderData = {
        id: '#GU-99210',
        completedAt: '14:30, Ngày 24 Tháng 5, 2024',
        baseFee: 150000,
        parts: [
            { name: 'Thay tụ quạt dàn lạnh', price: 150000 },
            { name: 'Vệ sinh máy lạnh (nạp gas)', price: 300000 }
        ],
        total: 600000,
        paymentMethod: 'Ví GlowUp',
        isRated: false,
        ratingGiven: 5,
        warrantyValid: true
    };

    return (
        <div className="cmp-detail-container">

            <div className="detail-header">
                <button className="back-btn" onClick={onBack}>
                    <FaArrowLeft /> CHI TIẾT HOÀN THÀNH
                </button>
                <span className="req-id">{orderData.id}</span>
            </div>

            <div className="stepper-container">
                <div className="step completed">
                    <div className="step-icon"><FaCheck /></div>
                    <span>Đã nhận đơn</span>
                </div>
                <div className="step-line completed"></div>
                <div className="step completed">
                    <div className="step-icon"><FaTruckFast /></div>
                    <span>Thợ đang đến</span>
                </div>
                <div className="step-line completed"></div>
                <div className="step completed">
                    <div className="step-icon"><FaWrench /></div>
                    <span>Bắt đầu sửa</span>
                </div>
                <div className="step-line completed"></div>
                <div className="step active">
                    <div className="step-icon"><FaCheckDouble /></div>
                    <span>Hoàn thành</span>
                </div>
            </div>

            <div className="cmp-header-row">
                <div className="header-info">
                    <p>Hoàn thành vào {orderData.completedAt}</p>
                </div>
            </div>

            <div className="cmp-grid-layout">
                {/* --- CỘT TRÁI --- */}
                <div className="cmp-col-main">

                    {/* Chi tiết thanh toán (Hóa đơn) */}
                    <div className="cmp-card">
                        <h3>Chi tiết thanh toán</h3>
                        <div className="invoice-rows">
                            <div className="inv-row">
                                <span>Phí dịch vụ ban đầu</span>
                                <span>{orderData.baseFee.toLocaleString('vi-VN')}đ</span>
                            </div>
                            {orderData.parts.map((part, idx) => (
                                <div className="inv-row" key={idx}>
                                    <span>{part.name}</span>
                                    <span>{part.price.toLocaleString('vi-VN')}đ</span>
                                </div>
                            ))}
                        </div>
                        <div className="inv-total-row">
                            <span className="total-label">Tổng thanh toán</span>
                            <span className="total-price">{orderData.total.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="payment-method-box">
                            <FaWallet className="wallet-icon"/>
                            <div>
                                <span className="pm-label">Phương thức thanh toán</span>
                                <strong className="pm-value">{orderData.paymentMethod}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Bằng chứng hình ảnh nghiệm thu */}
                    <div className="cmp-card">
                        <div className="card-header-flex">
                            <h3>Hình ảnh nghiệm thu</h3>
                            <span className="photo-count">3 ẢNH</span>
                        </div>
                        <div className="photo-grid-row">
                            <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=200" alt="Nghiệm thu 1" />
                            <img src="https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=200" alt="Nghiệm thu 2" />
                            <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200" alt="Nghiệm thu 3" />
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI --- */}
                <div className="cmp-col-side">

                    {/* Khối Đánh Giá (Rating Box) */}
                    <div className="cmp-card rating-card">
                        <h3>Đánh giá dịch vụ</h3>
                        {role === 'customer' ? (
                            !orderData.isRated ? (
                                <>
                                    <p className="rating-desc">Trải nghiệm của bạn giúp thợ và cộng đồng GlowUp tốt hơn.</p>
                                    <div className="rating-stars-input">
                                        {[...Array(5)].map((_, i) => <FaStar key={i} className="star-empty" />)}
                                    </div>
                                    <div className="rating-placeholder" onClick={onOpenRating}>
                                        Chia sẻ cảm nghĩ của bạn về chất lượng sửa chữa...
                                    </div>
                                    <button className="btn-solid-dark w-100" onClick={onOpenRating}>
                                        Gửi đánh giá
                                    </button>
                                </>
                            ) : (
                                <div className="rated-success">
                                    <div className="cmp-stars justify-center mb-2">
                                        {[...Array(5)].map((_, i) => <FaStar key={i} className="star-filled" />)}
                                    </div>
                                    <p>Bạn đã đánh giá dịch vụ này.</p>
                                </div>
                            )
                        ) : (
                            /* Góc nhìn của Thợ: Xem đánh giá khách chấm */
                            <div className="tech-received-rating">
                                {orderData.isRated ? (
                                    <>
                                        <div className="cmp-stars mb-2">
                                            {[...Array(5)].map((_, i) => <FaStar key={i} className={i < orderData.ratingGiven ? 'star-filled' : 'star-empty'} />)}
                                        </div>
                                        <p className="rating-comment">"Thợ làm rất nhiệt tình, dọn dẹp sạch sẽ sau khi xong."</p>
                                    </>
                                ) : (
                                    <p className="rating-desc">Khách hàng chưa để lại đánh giá.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Khối Hỗ trợ & Bảo hành (Chỉ Khách hàng thao tác) */}
                    {role === 'customer' && (
                        <div className="cmp-card warranty-card">
                            <h3>Hỗ trợ & Bảo hành</h3>
                            <div className="warranty-status">
                                <FaShieldHalved className="shield-icon" />
                                <div>
                                    <strong>Thời hạn bảo hành</strong>
                                    <p>Sản phẩm/dịch vụ này còn thời hạn bảo hành 3 tháng.</p>
                                </div>
                            </div>
                            <button
                                className="btn-outline-dark w-100 mb-3"
                                onClick={() => setShowWarrantyModal(true)}
                            >
                                Yêu cầu bảo hành
                            </button>
                            <button
                                className="btn-text-danger w-100 text-center"
                                onClick={() => setShowReportModal(true)}
                            >
                                <FaTriangleExclamation /> Báo cáo sự cố
                            </button>
                        </div>
                    )}

                    {/* Khối Profile Thợ (Chỉ hiển thị cho Khách xem) */}
                    {role === 'customer' && (
                        <div className="cmp-card dark-profile-card">
                            <div className="tech-brief">
                                <img src="https://i.pravatar.cc/150?img=11" alt="Thợ" className="tech-avatar" />
                                <div>
                                    <h4>Nguyễn Văn Nam</h4>
                                    <span className="tech-rating"><FaStar className="star-filled"/> 4.9 (230 đánh giá)</span>
                                </div>
                            </div>
                            <div className="tech-bio">
                                Thợ bậc 5/5 với hơn 10 năm kinh nghiệm điện lạnh dân dụng. Chuyên gia đào tạo nội bộ GlowUp.
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <WarrantyModal
                open={showWarrantyModal}
                onClose={() => setShowWarrantyModal(false)}
            />

            <ReportModal
                open={showReportModal}
                onClose={() => setShowReportModal(false)}
            />

        </div>
    );
};