import React from 'react';
import { FaEye, FaEllipsisVertical } from 'react-icons/fa6';
import { OrderStatusBadge, type OrderStatus } from './OrderStatusBadge';

export type OrderTableItem = {
  id: string;
  code: string;
  customer: string;
  service: string;
  technician: string;
  status: OrderStatus;
  price: string;
  appointment: string;
  createdAt: string;
  area?: string;
  payment?: string;
};

type Props = {
  orders: OrderTableItem[];
  selectedIds: string[];
  onToggleAll: (checked: boolean) => void;
  onToggleRow: (id: string, checked: boolean) => void;
  onView: (order: OrderTableItem) => void;
};

export const OrderTable: React.FC<Props> = ({ orders, selectedIds, onToggleAll, onToggleRow, onView }) => {
  const allChecked = orders.length > 0 && selectedIds.length === orders.length;

  return (
    <div className="order-table-shell">
      <table className="order-table">
        <thead>
          <tr>
            <th className="order-table__checkbox-cell">
              <input type="checkbox" checked={allChecked} onChange={(e) => onToggleAll(e.target.checked)} aria-label="Chọn tất cả" />
            </th>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Dịch vụ</th>
            <th>Thợ kỹ thuật</th>
            <th>Trạng thái</th>
            <th>Giá</th>
            <th>Lịch hẹn</th>
            <th>Tạo lúc</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const checked = selectedIds.includes(order.id);

            return (
              <tr key={order.id} className={checked ? 'is-selected' : ''}>
                <td className="order-table__checkbox-cell">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onToggleRow(order.id, e.target.checked)}
                    aria-label={`Chọn ${order.code}`}
                  />
                </td>
                <td>{order.code}</td>
                <td>{order.customer}</td>
                <td>{order.service}</td>
                <td>{order.technician}</td>
                <td><OrderStatusBadge status={order.status} /></td>
                <td>{order.price}</td>
                <td>{order.appointment}</td>
                <td>{order.createdAt}</td>
                <td>
                  <div className="order-table__actions">
                    <button type="button" className="order-table__icon-btn" onClick={() => onView(order)} aria-label={`Xem ${order.code}`}>
                      <FaEye />
                    </button>
                    <button type="button" className="order-table__icon-btn" aria-label={`Thao tác ${order.code}`}>
                      <FaEllipsisVertical />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
