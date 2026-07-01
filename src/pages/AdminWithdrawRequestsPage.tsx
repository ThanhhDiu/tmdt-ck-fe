import React, { useEffect, useState } from 'react';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import {
  approveAdminWithdrawRequest,
  getAdminWithdrawRequests,
  type AdminWithdrawRequestItem,
} from '../services/adminCommissionService';
import './AdminWithdrawRequestsPage.css';

const statusLabel = (status: string): { text: string; cls: string } => {
  switch (status) {
    case 'success':
    case 'done':
    case 'approved':
      return { text: 'Đã duyệt', cls: 'done' };
    case 'failed':
    case 'rejected':
      return { text: 'Từ chối', cls: 'failed' };
    default:
      return { text: 'Chờ duyệt', cls: 'pending' };
  }
};

const AdminWithdrawRequestsPage: React.FC = () => {
  const [items, setItems] = useState<AdminWithdrawRequestItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getAdminWithdrawRequests();
      setItems(result.items);
      setPendingCount(result.pendingCount);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải danh sách yêu cầu rút tiền');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    setError('');
    try {
      await approveAdminWithdrawRequest(id);
      await load();
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : 'Không thể duyệt yêu cầu rút tiền');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="awr-layout">
      <AdminSidebar activeItem="withdraw-requests" />
      <main className="awr-main">
        <AdminHeader />

        <section className="awr-title-row">
          <div>
            <h1>Yêu cầu rút tiền</h1>
            <p>Duyệt các yêu cầu rút tiền từ ví cá nhân của thợ về tài khoản ngân hàng.</p>
          </div>
          <span className="awr-pending-badge">{pendingCount} đang chờ</span>
        </section>

        {error ? <div className="awr-alert">{error}</div> : null}

        <section className="awr-card">
          <div className="awr-table">
            <div className="awr-row awr-head">
              <span>Thợ</span>
              <span>Số tiền</span>
              <span>Ngân hàng</span>
              <span>Số tài khoản</span>
              <span>Thời gian</span>
              <span>Trạng thái</span>
              <span>Thao tác</span>
            </div>

            {loading ? <div className="awr-empty">Đang tải dữ liệu...</div> : null}

            {!loading && items.length === 0 ? (
              <div className="awr-empty">Không có yêu cầu rút tiền nào.</div>
            ) : null}

            {!loading &&
              items.map((item) => {
                const st = statusLabel(item.status);
                const isPending = st.cls === 'pending';
                return (
                  <div className="awr-row" key={item.id}>
                    <span className="awr-tech">
                      <span className="awr-avatar">{item.technicianName.charAt(0).toUpperCase()}</span>
                      <span>
                        <strong>{item.technicianName}</strong>
                        <small>{item.technicianId}</small>
                      </span>
                    </span>
                    <span className="awr-amount">{item.amountLabel}</span>
                    <span>{item.bankName}</span>
                    <span>{item.accountNumber}</span>
                    <span>{item.requestedAtLabel}</span>
                    <span><b className={`awr-status ${st.cls}`}>{st.text}</b></span>
                    <span>
                      {isPending ? (
                        <button
                          className="awr-approve-btn"
                          type="button"
                          onClick={() => handleApprove(item.id)}
                          disabled={approvingId === item.id}
                        >
                          {approvingId === item.id ? 'Đang duyệt...' : 'Duyệt'}
                        </button>
                      ) : (
                        <span className="awr-done-text">—</span>
                      )}
                    </span>
                  </div>
                );
              })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminWithdrawRequestsPage;
