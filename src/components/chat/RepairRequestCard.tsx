import React from 'react';
import type { OrderResponse } from '../../types/order/order';
import styles from './Chat.module.css';

type RepairRequestCardProps = {
  order: OrderResponse;
  role?: string;
  onAccept?: () => void;
  onReject?: () => void;
};

export const RepairRequestCard: React.FC<RepairRequestCardProps> = ({ 
  order, 
  role = 'customer',
  onAccept,
  onReject
}) => {
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
      
      {role === 'technician' && order.status?.toLowerCase() === 'new' && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            onClick={onAccept}
            style={{
              flex: 1,
              padding: '8px 16px',
              backgroundColor: '#aa3bff',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'background-color 0.2s'
            }}
          >
            Chấp nhận
          </button>
          <button
            onClick={onReject}
            style={{
              flex: 1,
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'background-color 0.2s'
            }}
          >
            Từ chối
          </button>
        </div>
      )}
    </div>
  );
};
