import React, { useEffect, useState } from 'react';
import { getAdminOrders, type OrderTableRow } from '../../services/orderService';
import './UserOrderHistory.css';

interface UserOrderHistoryProps {
  /** User code or numeric id used to scope the order list. */
  userId?: string;
  role?: string;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  NEW: { label: 'Yêu cầu mới', cls: 'new' },
  ASSIGNED: { label: 'Đã nhận', cls: 'progress' },
  SCHEDULED: { label: 'Đã hẹn', cls: 'progress' },
  IN_PROGRESS: { label: 'Đang xử lý', cls: 'progress' },
  AWAITING_PAYMENT: { label: 'Chờ thanh toán', cls: 'await' },
  COMPLETED: { label: 'Hoàn thành', cls: 'done' },
  CANCELLED: { label: 'Đã hủy', cls: 'cancel' },
};

export const UserOrderHistory: React.FC<UserOrderHistoryProps> = ({ userId, role }) => {
  const [orders, setOrders] = useState<OrderTableRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!userId) {
        setOrders([]);
        setPage(1);
        setTotalPages(1);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const filter = role === 'technician' ? { technician: userId } : { customer: userId };
        const result = await getAdminOrders({ ...filter, page: 1, limit: 10 });
        if (!active) return;
        setOrders(result.items);
        setPage(1);
        setTotalPages(result.totalPages);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Không thể tải lịch sử đơn hàng');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [userId, role]);

  const loadMore = async () => {
    if (!userId || loadingMore || page >= totalPages) {
      return;
    }

    const nextPage = page + 1;

    setLoadingMore(true);
    setError(null);

    try {
      const filter = role === 'technician' ? { technician: userId } : { customer: userId };
      const result = await getAdminOrders({ ...filter, page: nextPage, limit: 10 });
      setOrders((current) => [...current, ...result.items]);
      setPage(nextPage);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thêm đơn hàng');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="uoh-card">
      <h3>Lịch sử đơn hàng</h3>

      {loading && <div className="uoh-state">Đang tải lịch sử đơn hàng...</div>}
      {error && <div className="uoh-state error">{error}</div>}
      {!loading && !error && orders.length === 0 && (
        <div className="uoh-state">Người dùng chưa có đơn hàng nào.</div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div>
          <div className="uoh-table">
            <div className="uoh-row uoh-head">
              <span>Mã đơn</span>
              <span>Dịch vụ</span>
              <span>{role === 'technician' ? 'Khách hàng' : 'Thợ'}</span>
              <span>Trạng thái</span>
              <span>Chi phí</span>
              <span>Ngày tạo</span>
            </div>
            {orders.map((o) => {
              const st = STATUS_LABEL[o.status] ?? { label: o.status, cls: 'new' };
              return (
                <div className="uoh-row" key={o.id}>
                  <span className="uoh-code">#{o.code}</span>
                  <span>{o.service}</span>
                  <span>{role === 'technician' ? o.customer : o.technician}</span>
                  <span><b className={`uoh-status ${st.cls}`}>{st.label}</b></span>
                  <span>{o.price}</span>
                  <span>{o.createdAt}</span>
                </div>
              );
            })}
          </div>
          {page < totalPages && (
            <button className="uoh-load-more" type="button" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? 'Đang tải thêm...' : 'Tải thêm'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserOrderHistory;
