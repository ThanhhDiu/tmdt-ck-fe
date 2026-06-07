import React from 'react';
import type { OrderResponse } from '../../types/order/order';
import styles from './Chat.module.css';

type RepairRequestCardProps = {
  order: OrderResponse;
};

export const RepairRequestCard: React.FC<RepairRequestCardProps> = ({ order }) => {
  const formatPrice = (value?: number) =>
    new Intl.NumberFormat('vi-VN').format(value ?? 0);

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
        {order.estimatedPrice != null && (
          <span>Ước tính: {formatPrice(order.estimatedPrice)} VNĐ</span>
        )}
      </div>
      {order.images && order.images.length > 0 && (
        <div className={styles.repairRequestImages}>
          {order.images.slice(0, 3).map((src) => (
            <img key={src} src={src} alt="Ảnh yêu cầu" />
          ))}
        </div>
      )}
    </div>
  );
};
