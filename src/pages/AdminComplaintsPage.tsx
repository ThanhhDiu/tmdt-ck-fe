import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import {
  getAdminComplaintStats,
  getAdminComplaints,
  type AdminComplaintItem,
  type ComplaintStats,
  type ComplaintStatusApi,
} from '../services/adminComplaintService';
import './AdminComplaintsPage.css';

const ITEMS_PER_PAGE = 10;

const statusClassMap: Record<ComplaintStatusApi, string> = {
  open: 'order-status--red',
  investigating: 'order-status--yellow',
  resolved: 'order-status--green',
  dismissed: 'order-status--gray',
};

const defaultStats: ComplaintStats = {
  OPEN: 0,
  INVESTIGATING: 0,
  RESOLVED: 0,
  DISMISSED: 0,
  TOTAL: 0,
};

const buildStatusClass = (status: ComplaintStatusApi): string => statusClassMap[status] || 'order-status--gray';

const statusOptions: Array<{ label: string; value: 'all' | ComplaintStatusApi }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Mới', value: 'open' },
  { label: 'Đang xử lý', value: 'investigating' },
  { label: 'Đã giải quyết', value: 'resolved' },
  { label: 'Đã từ chối', value: 'dismissed' },
];

export default function AdminComplaintsPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<AdminComplaintItem | null>(null);
  const [rows, setRows] = useState<AdminComplaintItem[]>([]);
  const [stats, setStats] = useState<ComplaintStats>(defaultStats);
  const [statusFilter, setStatusFilter] = useState<'all' | ComplaintStatusApi>('all');
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedKeyword(keyword.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedKeyword]);

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        const nextStats = await getAdminComplaintStats();
        if (!active) return;
        setStats(nextStats);
      } catch {
        if (!active) return;
        setStats(defaultStats);
      }
    };

    loadStats();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadComplaints = async () => {
      setLoading(true);
      setError(null);

      try {
        const payload = await getAdminComplaints({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          status: statusFilter,
          keyword: debouncedKeyword,
        });

        if (!active) return;

        setRows(payload.items);
        setTotalPages(Math.max(1, payload.totalPages || Math.ceil((payload.totalElements || 0) / ITEMS_PER_PAGE) || 1));

        setSelected((current) => {
          if (!current) return null;
          return payload.items.find((item) => item.id === current.id) || null;
        });
      } catch (err: any) {
        if (!active) return;
        setRows([]);
        setTotalPages(1);
        setSelected(null);
        setError(err?.message || 'Không thể tải danh sách khiếu nại');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadComplaints();

    return () => {
      active = false;
    };
  }, [currentPage, debouncedKeyword, statusFilter]);

  const statCards = useMemo(
    () => [
      { title: 'Khiếu nại mới', value: stats.OPEN, sub: 'Chờ tiếp nhận', icon: '🔴' },
      { title: 'Đang xử lý', value: stats.INVESTIGATING, sub: 'Đang xác minh', icon: '🟡' },
      { title: 'Đã giải quyết', value: stats.RESOLVED, sub: 'Đã hoàn tất', icon: '🟢' },
      { title: 'Đã từ chối', value: stats.DISMISSED, sub: 'Không đủ cơ sở', icon: '⚫' },
    ],
    [stats],
  );

  return (
    <div className="acp-layout">
      <AdminSidebar activeItem="complaints" />

      <main className="acp-main">
        <AdminHeader />

        <div className="acp-header-row">
          <h1>Quản lý khiếu nại</h1>
        </div>

        <section className="orders-stats-row">
          {statCards.map((item) => (
            <div className="complaint-stat-card" key={item.title}>
              <div className="complaint-stat-top">
                <div className="complaint-icon">{item.icon}</div>
                <div>
                  <div className="stat-title">{item.title}</div>
                  <div className="stat-value">{item.value}</div>
                  <div className="complaint-sub">{item.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="orders-controls complaints-controls">
          <div className="filters-row complaints-filter-row">
            <div className="complaints-search-wrap">
              <input
                className="orders-search complaints-search-input"
                placeholder="Tìm mã khiếu nại, mã đơn, nội dung mô tả..."
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
            </div>

            <div className="filter-item complaints-status-filter">
              <label>Trạng thái</label>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | ComplaintStatusApi)}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="order-table-shell">
          <table className="order-table">
            <thead>
              <tr>
                <th>Mã KN</th>
                <th>Đơn</th>
                <th>Khách</th>
                <th>Thợ</th>
                <th>Lý do</th>
                <th>Ngày gửi</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="complaints-empty-row">
                    {error ? `Lỗi: ${error}` : 'Không có khiếu nại phù hợp bộ lọc'}
                  </td>
                </tr>
              ) : null}

              {loading ? (
                <tr>
                  <td colSpan={8} className="complaints-empty-row">
                    Đang tải dữ liệu khiếu nại...
                  </td>
                </tr>
              ) : null}

              {!loading
                ? rows.map((item) => (
                    <tr className="complaint-row" key={item.id} onClick={() => setSelected(item)}>
                      <td>{item.code}</td>
                      <td>{item.orderCode}</td>
                      <td>{item.customerName}</td>
                      <td>{item.technicianName}</td>
                      <td>{item.reasonLabel}</td>
                      <td>{item.createdAt}</td>
                      <td>
                        <span className={`order-status ${buildStatusClass(item.status)}`}>{item.statusLabel}</span>
                      </td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelected(item);
                          }}
                        >
                          👁
                        </button>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>

        <div className="complaints-pagination">
          <button className="complaints-page-btn" disabled={currentPage <= 1 || loading} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
            Trang trước
          </button>
          <span className="complaints-page-text">
            Trang {currentPage} / {Math.max(1, totalPages)}
          </span>
          <button className="complaints-page-btn" disabled={currentPage >= totalPages || loading} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
            Trang sau
          </button>
        </div>

        {selected ? (
          <div className="complaint-modal-overlay" onClick={() => setSelected(null)}>
            <div className="complaint-modal" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>Chi tiết khiếu nại {selected.code}</h2>
                  <div className={`order-status ${buildStatusClass(selected.status)}`}>{selected.statusLabel}</div>
                </div>

                <button className="close-btn" onClick={() => setSelected(null)}>
                  ✕
                </button>
              </div>

              <div className="modal-grid">
                <div className="modal-card">
                  <h4>Thông tin khiếu nại</h4>
                  <div className="complaint-grid">
                    <span>Mã KN</span>
                    <span>{selected.code}</span>

                    <span>Mã đơn</span>
                    <span>{selected.orderCode}</span>

                    <span>Ngày gửi</span>
                    <span>{selected.createdAt}</span>

                    <span>Lý do</span>
                    <span>{selected.reasonLabel}</span>
                  </div>
                </div>

                <div className="modal-card">
                  <h4>Khách hàng</h4>
                  <div className="complaint-grid">
                    <span>Tên</span>
                    <span>{selected.customerName}</span>
                  </div>
                </div>

                <div className="modal-card">
                  <h4>Thợ thực hiện</h4>
                  <div className="complaint-grid">
                    <span>Tên</span>
                    <span>{selected.technicianName}</span>
                  </div>
                </div>

                <div className="modal-card wide">
                  <h4>Mô tả</h4>
                  <p>{selected.description}</p>
                </div>

                <div className="modal-card wide">
                  <h4>Bằng chứng</h4>
                  {selected.evidenceImages.length > 0 ? (
                    <div className="evidence-list">
                      {selected.evidenceImages.map((url, index) => (
                        <a href={url} className="evidence-link" target="_blank" rel="noreferrer" key={`${selected.id}-${index}`}>
                          Ảnh #{index + 1}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="complaints-muted">Không có ảnh bằng chứng</div>
                  )}
                </div>

                <div className="modal-card wide">
                  <h4>Hành động</h4>
                  <div className="complaint-modal-actions">
                    <button className="complaint-modal-btn complaint-modal-btn--ghost" type="button" onClick={() => setSelected(null)}>
                      Đóng
                    </button>
                    <button
                      className="complaint-modal-btn complaint-modal-btn--primary"
                      type="button"
                      onClick={() => navigate(`/admin/complaints/${selected.id}/resolve`, { state: { complaint: selected } })}
                    >
                      Giải quyết
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
