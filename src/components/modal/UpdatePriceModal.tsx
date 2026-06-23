import React, { useState } from "react";
import Modal from "../common/Modal";
import type { OrderPriceAdjustmentResponse } from "../../types/order/order";
import "./css/updatePriceModal.css";

interface UpdatePriceModalProps {
    open: boolean;
    onClose: () => void;
    adjustment: OrderPriceAdjustmentResponse;
    onConfirm: () => Promise<void>;
    onReject?: () => Promise<void>;
}

const UpdatePriceModal: React.FC<UpdatePriceModalProps> = ({
    open,
    onClose,
    adjustment,
    onConfirm,
    onReject,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const original = adjustment.originalPrice ?? adjustment.beforePrice ?? 0;
    const updated = adjustment.newPrice ?? adjustment.afterPrice ?? 0;
    const diff = updated - original;
    const images = adjustment.evidenceImages ?? [];

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            await onConfirm();
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!onReject) return;
        setIsSubmitting(true);
        try {
            await onReject();
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <div className="update-modal">
                <header className="update-header">
                    <h2 className="update-title">CẬP NHẬT CHI PHÍ THỰC TẾ</h2>
                    <p className="update-sub">
                        Vui lòng kiểm tra và xác nhận thay đổi chi phí sửa chữa
                    </p>
                </header>

                <div className="update-body">
                    <div className="price-section">
                        <div className="price-old">
                            <span className="label">GIÁ DỰ KIẾN BAN ĐẦU</span>
                            <div className="price-row">
                                <span className="price">{original.toLocaleString('vi-VN')}</span>
                                <span className="currency">VNĐ</span>
                            </div>
                        </div>

                        <div className="price-new">
                            <span className="label gold">GIÁ THỰC TẾ MỚI</span>
                            <div className="price-row">
                                <span className="price big">{updated.toLocaleString('vi-VN')}</span>
                                <span className="currency">VNĐ</span>
                            </div>
                            {diff > 0 && (
                                <div className="badge">TĂNG {diff.toLocaleString('vi-VN')} VNĐ</div>
                            )}
                        </div>
                    </div>

                    {adjustment.reason && (
                        <div className="reason-section">
                            <h3 className="section-title">LÝ DO ĐIỀU CHỈNH</h3>
                            <div className="reason-box">{adjustment.reason}</div>
                        </div>
                    )}

                    {adjustment.parts && adjustment.parts.length > 0 && (
                        <div className="reason-section">
                            <h3 className="section-title">LINH KIỆN PHÁT SINH</h3>
                            {adjustment.parts.map((part, index) => (
                                <div key={`${part.name}-${index}`} className="reason-box">
                                    {part.name} — {(part.price ?? 0).toLocaleString('vi-VN')}đ
                                </div>
                            ))}
                        </div>
                    )}

                    {images.length > 0 && (
                        <div className="image-section">
                            <div className="image-header">
                                <h3 className="section-title">HÌNH ẢNH LINH KIỆN HƯ HỎNG</h3>
                                <span className="image-count">{images.length} ảnh đính kèm</span>
                            </div>
                            <div className="image-list">
                                {images.map((src) => (
                                    <img key={src} src={src} alt="Minh chứng hỏng hóc" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <footer className="update-footer">
                    {onReject && (
                        <button
                            type="button"
                            className="btn-outline"
                            onClick={handleReject}
                            disabled={isSubmitting}
                        >
                            Từ chối
                        </button>
                    )}
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang xử lý...' : 'Xác nhận giá mới'}
                    </button>
                </footer>
            </div>
        </Modal>
    );
};

export default UpdatePriceModal;
