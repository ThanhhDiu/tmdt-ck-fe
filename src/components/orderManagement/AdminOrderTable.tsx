import React from 'react';

type OrderItem = {
  id: string;
  code: string;
  customer: string;
  technician?: string;
  status: string;
  price: number;
  area: string;
  payment: string;
  createdAt: string;
};

const AdminOrderTable: React.FC<{ orders: OrderItem[]; onSelect: (o: OrderItem) => void }> = ({ orders, onSelect }) => {
  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', color: '#475569' }}>
            <th style={{ padding: '8px 12px' }}>Mã đơn</th>
            <th style={{ padding: '8px 12px' }}>Khách hàng</th>
            <th style={{ padding: '8px 12px' }}>Thợ</th>
            <th style={{ padding: '8px 12px' }}>Trạng thái</th>
            <th style={{ padding: '8px 12px' }}>Khu vực</th>
            <th style={{ padding: '8px 12px' }}>Thanh toán</th>
            <th style={{ padding: '8px 12px' }}>Giá</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} style={{ borderTop: '1px solid #eef2ff', cursor: 'pointer' }} onClick={() => onSelect(o)}>
              <td style={{ padding: '10px 12px' }}>{o.code}</td>
              <td style={{ padding: '10px 12px' }}>{o.customer}</td>
              <td style={{ padding: '10px 12px' }}>{o.technician || '-'}</td>
              <td style={{ padding: '10px 12px' }}>{o.status}</td>
              <td style={{ padding: '10px 12px' }}>{o.area}</td>
              <td style={{ padding: '10px 12px' }}>{o.payment}</td>
              <td style={{ padding: '10px 12px' }}>{o.price.toLocaleString('vi-VN')}</td>
            </tr>
          ))}

          {orders.length === 0 && (
            <tr>
              <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>Không có đơn hàng</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrderTable;
