import React from 'react';
import './RecentOrdersTable.css';
import type { RecentOrderTableItem } from '../../services/adminDashboardService.ts';

interface RecentOrdersTableProps {
  orders: RecentOrderTableItem[];
  isLoading?: boolean;
}

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({ orders, isLoading = false }) => {

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Đã hoàn thành':
        return 'rot-status-completed';
      case 'Đang xử lý':
        return 'rot-status-processing';
      case 'Chờ xác nhận':
        return 'rot-status-pending';
      default:
        return '';
    }
  };

  return (
    <div className="rot-container">
      <div className="rot-header">
        <h2 className="rot-title">Đơn hàng gần đây</h2>
        <a href="#" className="rot-view-all">
          Xem tất cả
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </a>
      </div>

      <div className="rot-table-wrapper">
        <table className="rot-table">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Thợ thực hiện</th>
              <th>Dịch vụ</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
              <th>Tiền thanh toán</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="rot-table-row">
                <td>
                  <div className="rot-customer-info">
                    <div className="rot-avatar">{order.customer.charAt(0)}</div>
                    <div className="rot-customer-details">
                      <div className="rot-customer-name">{order.customer}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="rot-provider-info">
                    <div className="rot-provider-avatar">{order.provider.charAt(0)}</div>
                    <div className="rot-provider-name">{order.provider}</div>
                  </div>
                </td>
                <td>
                  <div className="rot-service">{order.service}</div>
                </td>
                <td>
                  <span className={`rot-status-badge ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <div className="rot-date">{order.date}</div>
                </td>
                <td>
                  <div className="rot-amount">{order.amount}</div>
                </td>
              </tr>
            ))}
            {!isLoading && orders.length === 0 && (
              <tr className="rot-empty-row">
                <td colSpan={6}>Chưa có đơn hàng gần đây.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
