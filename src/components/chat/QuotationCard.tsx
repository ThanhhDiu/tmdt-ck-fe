import React from 'react';
import {
    BadgeDollarSign,
    CalendarClock,
    CheckCircle2,
    ClipboardList,
    Clock3,
    XCircle,
} from 'lucide-react';
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
    serviceName = 'Dịch vụ sửa chữa',
    description = 'Chưa có mô tả chi tiết.',
    price = 0,
    scheduledAt,
    status = 'pending',
    isCustomer = false,
    previewMode = false,
    onAccept,
    onReject,
}) => {
    const formatPrice = (value: number) =>
        new Intl.NumberFormat('vi-VN').format(value);

    const formatSchedule = () => {
        if (!scheduledAt) return 'Chưa có lịch hẹn';
        const date = new Date(scheduledAt);
        if (Number.isNaN(date.getTime())) return scheduledAt;
        const time = date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
        const day = date.toLocaleDateString('vi-VN');
        return `${time} - ${day}`;
    };

    const normalizedStatus = status.toLowerCase();
    const isPending = normalizedStatus === 'pending';
    const isAccepted = normalizedStatus === 'accepted';
    const isRejected = normalizedStatus === 'rejected';
    const statusLabel = isAccepted
        ? 'Đã chấp nhận'
        : isRejected
            ? 'Đã từ chối'
            : 'Chờ xác nhận';
    const StatusIcon = isAccepted ? CheckCircle2 : isRejected ? XCircle : Clock3;

    return (
        <article className={`${styles.quotationCard} ${previewMode ? styles.quotationPreview : ''}`}>
            <div className={styles.quotationHeaderLine} />
            <div className={styles.quotationBody}>
                <div className={styles.quotationTop}>
                    <div className={styles.quotationTitleGroup}>
                        <span className={styles.quotationIcon}>
                            <ClipboardList size={18} />
                        </span>
                        <div>
                            <p className={styles.labelCaps}>Báo giá dịch vụ</p>
                            <h3 className={styles.serviceTitle}>{serviceName}</h3>
                        </div>
                    </div>
                    <div
                        className={`${styles.quoteStatusPill} ${
                            isAccepted
                                ? styles.quoteStatusAccepted
                                : isRejected
                                    ? styles.quoteStatusRejected
                                    : styles.quoteStatusPending
                        }`}
                    >
                        <StatusIcon size={13} />
                        {statusLabel}
                    </div>
                </div>

                <div className={styles.quotationInfoBlock}>
                    <div className={styles.quotationInfoIcon}>
                        <CalendarClock size={16} />
                    </div>
                    <div>
                        <p className={styles.labelCaps}>Lịch hẹn dự kiến</p>
                        <p className={styles.scheduleValue}>{formatSchedule()}</p>
                    </div>
                </div>

                <div className={styles.descriptionSection}>
                    <p className={styles.labelCaps}>Mô tả tình trạng</p>
                    <p className={styles.descriptionText}>{description}</p>
                </div>

                <div className={styles.quotePriceBox}>
                    <div className={styles.quotationInfoIcon}>
                        <BadgeDollarSign size={18} />
                    </div>
                    <div>
                        <p className={styles.labelCaps}>Chi phí dự kiến</p>
                        <div className={styles.priceDisplay}>
                            <span className={styles.currency}>{formatPrice(price)} VND</span>
                            <span className={styles.note}>Đã bao gồm vật tư nếu có</span>
                        </div>
                    </div>
                </div>

                <div className={styles.quotationFooter}>
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
                                Đồng ý & đặt đơn
                            </button>
                        </div>
                    )}

                    {!previewMode && isAccepted && (
                        <p className={styles.chatStatusAccepted}>
                            Đơn hàng đã được tạo từ báo giá này.
                        </p>
                    )}

                    {!previewMode && isRejected && (
                        <p className={styles.chatStatusRejected}>Báo giá đã bị từ chối.</p>
                    )}

                    {!previewMode && !isCustomer && isPending && (
                        <p className={styles.chatStatusPending}>Đang chờ khách xác nhận báo giá.</p>
                    )}
                </div>
            </div>
        </article>
    );
};
