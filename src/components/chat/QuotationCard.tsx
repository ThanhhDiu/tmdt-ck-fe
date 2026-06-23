import React from 'react';
import styles from './Chat.module.css';

interface QuotationCardProps {
    serviceName?: string;
    description?: string;
    price?: number;
    scheduledAt?: string;
    status?: string;
    isCustomer?: boolean;
    previewMode?: boolean;
    onAccept?: () => void;
    onReject?: () => void;
}

export const QuotationCard: React.FC<QuotationCardProps> = ({
    serviceName = "Dịch vụ sửa chữa",
    description = "Chưa có mô tả chi tiết.",
    price = 0,
    scheduledAt,
    status = 'pending',
    isCustomer = false,
    previewMode = false,
    onAccept,
    onReject
}) => {
    const formatPrice = (value: number) =>
        new Intl.NumberFormat('vi-VN').format(value);

    const formatSchedule = () => {
        if (!scheduledAt) return "Chưa có lịch hẹn";
        const date = new Date(scheduledAt);
        if (Number.isNaN(date.getTime())) return scheduledAt;
        const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const day = date.toLocaleDateString('vi-VN');
        return `${time} - ${day}`;
    };

    const normalizedStatus = status.toLowerCase();
    const isPending = normalizedStatus === 'pending';
    const isAccepted = normalizedStatus === 'accepted';
    const isRejected = normalizedStatus === 'rejected';

    return (
        <div className={styles.quotationCard}>
            <div className={styles.quotationHeaderLine} />
            <div className={styles.quotationBody}>
                <div className={styles.quotationTop}>
                    <div>
                        <p className={styles.labelCaps}>BÁO GIÁ DỊCH VỤ</p>
                        <h3 className={styles.serviceTitle}>{serviceName}</h3>
                    </div>
                    <div>🛠️</div>
                </div>

                <div className={styles.descriptionSection}>
                    <p className={styles.labelCaps}>MÔ TẢ TÌNH TRẠNG</p>
                    <p className={styles.descriptionText}>{description}</p>
                </div>

                <div className={`${styles.scheduleBox} ${styles.disabled}`}>
                    <div className={styles.scheduleContent}>
                        <p className={styles.scheduleLabel}>Lịch hẹn dự kiến</p>
                        <p className={styles.scheduleValue}>{formatSchedule()}</p>
                    </div>
                </div>

                <div className={styles.quotationFooter}>
                    <div>
                        <p className={styles.labelCaps}>CHI PHÍ DỰ KIẾN</p>
                        <p className={styles.priceDisplay}>
                            <span className={styles.currency}>{formatPrice(price)} VNĐ</span>
                            <span className={styles.note}> * Đã bao gồm vật tư</span>
                        </p>
                    </div>

                    {previewMode && null}

                    {!previewMode && isCustomer && isPending && (
                        <div className={styles.actionGroup}>
                            <button
                                type="button"
                                className={styles.btnSecondary}
                                onClick={onReject}
                            >
                                Từ chối
                            </button>
                            <button
                                type="button"
                                className={styles.btnPrimary}
                                onClick={onAccept}
                            >
                                Đồng ý & Đặt đơn
                            </button>
                        </div>
                    )}

                    {!previewMode && isAccepted && (
                        <p className={styles.chatStatusRejected}>Đã chấp nhận — đơn hàng đã được tạo</p>
                    )}

                    {!previewMode && isRejected && (
                        <p className={styles.chatStatusRejected}>Báo giá đã bị từ chối</p>
                    )}

                    {!previewMode && !isCustomer && isPending && (
                        <p className={styles.chatStatusRejected}>Đang chờ khách xác nhận</p>
                    )}
                </div>
            </div>
        </div>
    );
};
