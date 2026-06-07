import React from 'react';
import type { OrderPriceAdjustmentResponse } from '../../types/order/order';
import styles from './Chat.module.css';

type PriceAdjustmentCardProps = {
  adjustment: OrderPriceAdjustmentResponse;
  onConfirm: () => void;
};

export const PriceAdjustmentCard: React.FC<PriceAdjustmentCardProps> = ({
  adjustment,
  onConfirm,
}) => {
  const original = adjustment.originalPrice ?? adjustment.beforePrice ?? 0;
  const updated = adjustment.newPrice ?? adjustment.afterPrice ?? 0;
  const diff = updated - original;

  return (
    <div className={styles.priceAdjustmentCard}>
      <h4>Điều chỉnh chi phí thực tế</h4>
      <p>
        Thợ đề nghị cập nhật từ {original.toLocaleString('vi-VN')}đ lên{' '}
        {updated.toLocaleString('vi-VN')}đ
        {diff > 0 ? ` (+${diff.toLocaleString('vi-VN')}đ)` : ''}.
      </p>
      {adjustment.reason && <p>{adjustment.reason}</p>}
      <button type="button" className={styles.btnPrimary} onClick={onConfirm}>
        Xem & xác nhận giá mới
      </button>
    </div>
  );
};
