import React from 'react';
import type { OrderResponse } from '../../types/order/order';
import styles from './Chat.module.css';
import { resolveMediaUrl } from '../../utils/mediaUrl';

type RepairRequestCardProps = {
  order: OrderResponse;
  /** When provided, shows a "Gửi báo giá" action (technician side). */
  onQuote?: () => void;
};

export const RepairRequestCard: React.FC<RepairRequestCardProps> = ({ order, onQuote }) => {
  const formatPrice = (value?: number) =>
    new Intl.NumberFormat('vi-VN').format(value ?? 0);
  const resolvedImages = (order.images ?? []).map((src) => resolveMediaUrl(src) ?? src);

  return (
    <div className={styles.repairRequestCard}>
      <span className={styles.repairRequestBadge}>YÊU CẦU SỬA CHỮA</span>
      <h3 className={styles.repairRequestTitle}>
        {order.deviceName ?? order.serviceName ?? 'Yêu cầu sửa chữa'}
      </h3>
      <div className={styles.repairRequestMeta}>
        <span>Mã đơn: <strong>{order.id}</strong></span>
        {order.description && <span>{order.description}</span>}
        {order.address && <span>Địa chỉ: {order.address}</span>}
        {order.estimatedPrice != null && order.estimatedPrice > 0 && (
          <span>Ước tính: {formatPrice(order.estimatedPrice)} VNĐ</span>
        )}
      </div>
      {resolvedImages.length > 0 && (
        <div className={styles.repairRequestImages}>
          {resolvedImages.slice(0, 3).map((src) => (
            <img key={src} src={src} alt="Ảnh yêu cầu" />
          ))}
        </div>
      )}
      {onQuote && (
        <button type="button" className={styles.btnPrimary} onClick={onQuote}>
          Gửi báo giá & xác nhận
        </button>
      )}
    </div>
  );
};
