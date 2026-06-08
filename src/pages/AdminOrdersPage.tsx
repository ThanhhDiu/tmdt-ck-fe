import React, { useEffect, useMemo, useState } from 'react';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { OrderTable } from '../components/orderManagement/OrderTable';
import {
  getAdminOrders,
  type OrderStatsSummary,
  type OrderTableRow,
} from '../services/orderService';
import './AdminOrdersPage.css';

const formatDateForFilter = (value?: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parsePrice = (value?: string | null): number => {
  if (!value) return 0;
  const normalized = value.replace(/[^\d]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const DASHBOARD_FETCH_LIMIT = 1000;

const buildOrderStats = (orders: OrderTableRow[]): OrderStatsSummary => {
  return orders.reduce(
    (acc, order) => {
      switch (order.status) {
        case 'NEW':
        case 'ASSIGNED':
        case 'SCHEDULED':
        case 'IN_PROGRESS':
          acc.processing += 1;
          break;
        case 'COMPLETED':
          acc.completed += 1;
          break;
        case 'CANCELLED':
          acc.cancelled += 1;
          break;
        default:
          break;
      }

      return acc;
    },
    {
      totalOrders: orders.length,
      processing: 0,
      completed: 0,
      cancelled: 0,
      disputes: 0,
      pendingPriceReview: 0,
    },
  );
};

const isWithinTimeFilter = (order: OrderTableRow, filter: string): boolean => {
  if (filter === 'Tất cả') return true;

  const baseDate = formatDateForFilter(order.rawScheduledAt || order.rawCreatedAt);
  if (!baseDate) return true;

  const now = new Date();
  const diffMs = now.getTime() - baseDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (filter === 'Hôm nay') {
    return now.toDateString() === baseDate.toDateString();
  }

  if (filter === '7 ngày') {
    return diffDays >= 0 && diffDays <= 7;
  }

  if (filter === '30 ngày') {
    return diffDays >= 0 && diffDays <= 30;
  }

  return true;
};

const isWithinPriceFilter = (order: OrderTableRow, filter: string): boolean => {
  if (filter === 'Tất cả') return true;

  const price = order.rawPrice ?? parsePrice(order.price);
  if (filter === 'Dưới 300k') return price < 300000;
  if (filter === '300k - 500k') return price >= 300000 && price <= 500000;
  if (filter === 'Trên 500k') return price > 500000;

  return true;
};

const AdminOrdersPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [timeFilter, setTimeFilter] = useState('Tất cả');
  const [paymentFilter, setPaymentFilter] = useState('Tất cả');
  const [technicianFilter, setTechnicianFilter] = useState('Tất cả');
  const [areaFilter, setAreaFilter] = useState('Tất cả');
  const [priceFilter, setPriceFilter] = useState('Tất cả');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [fullData, setFullData] = useState<OrderTableRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchText.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        setOrdersLoading(true);
        setOrdersError(null);

        const firstPage = await getAdminOrders({
          page: 1,
          limit: DASHBOARD_FETCH_LIMIT,
        });

        if (!active) return;

        const totalPages = Math.max(1, Math.ceil((firstPage.totalElements || 0) / DASHBOARD_FETCH_LIMIT));
        let nextOrders = [...firstPage.items];

        if (totalPages > 1) {
          const remainingPages = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, index) => {
              return getAdminOrders({
                page: index + 2,
                limit: DASHBOARD_FETCH_LIMIT,
              });
            }),
          );

          if (!active) return;

          nextOrders = [...nextOrders, ...remainingPages.flatMap((page) => page.items)];
        }

        setFullData(nextOrders);
        setSelectedIds((current) => current.filter((id) => nextOrders.some((order) => order.id === id)));
      } catch (error: any) {
        if (!active) return;
        setFullData([]);
        setOrdersError(error?.message || 'Không thể tải danh sách đơn hàng');
      } finally {
        if (active) {
          setOrdersLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [areaFilter, debouncedSearch, paymentFilter, priceFilter, statusFilter, technicianFilter, timeFilter]);

  const filteredTechnicians = useMemo(() => {
    return ['Tất cả', ...Array.from(new Set(fullData.map((order) => order.rawTechnician).filter(Boolean) as string[]))];
  }, [fullData]);

  const filteredAreas = useMemo(() => {
    return ['Tất cả', ...Array.from(new Set(fullData.map((order) => order.rawArea).filter(Boolean) as string[]))];
  }, [fullData]);

  const paymentOptions = useMemo(() => {
    return ['Tất cả', ...Array.from(new Set(fullData.map((order) => order.rawPaymentMethod).filter(Boolean) as string[]))];
  }, [fullData]);

  const filteredData = useMemo(() => {
    return fullData.filter((order) => {
      if (statusFilter !== 'Tất cả' && order.status !== statusFilter) return false;
      if (!isWithinTimeFilter(order, timeFilter)) return false;
      if (paymentFilter !== 'Tất cả' && order.rawPaymentMethod?.toUpperCase() !== paymentFilter.toUpperCase()) return false;
      if (technicianFilter !== 'Tất cả' && order.rawTechnician !== technicianFilter) return false;
      if (areaFilter !== 'Tất cả' && order.rawArea !== areaFilter) return false;
      if (!isWithinPriceFilter(order, priceFilter)) return false;

      if (debouncedSearch) {
        const keyword = debouncedSearch.toLowerCase();
        const searchable = [
          order.id,
          order.code,
          order.customer,
          order.service,
          order.technician,
          order.status,
          order.area || '',
          order.payment || '',
          order.createdAt,
          order.appointment,
        ].join(' ').toLowerCase();

        if (!searchable.includes(keyword)) return false;
      }

      return true;
    });
  }, [areaFilter, debouncedSearch, fullData, paymentFilter, priceFilter, statusFilter, technicianFilter, timeFilter]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [currentPage, filteredData, itemsPerPage]);

  const visibleOrders = paginatedData;
  const stats = useMemo(() => buildOrderStats(filteredData), [filteredData]);

  const openOrderDetail = () => {};

  const retryOrderList = async () => {
    setOrdersLoading(true);
    setOrdersError(null);

    try {
      const firstPage = await getAdminOrders({
        page: 1,
        limit: DASHBOARD_FETCH_LIMIT,
      });

      const totalPages = Math.max(1, Math.ceil((firstPage.totalElements || 0) / DASHBOARD_FETCH_LIMIT));
      let nextOrders = [...firstPage.items];

      if (totalPages > 1) {
        const remainingPages = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, index) => {
            return getAdminOrders({
              page: index + 2,
              limit: DASHBOARD_FETCH_LIMIT,
            });
          }),
        );

        nextOrders = [...nextOrders, ...remainingPages.flatMap((page) => page.items)];
      }

      setFullData(nextOrders);
      setSelectedIds((current) => current.filter((id) => nextOrders.some((order) => order.id === id)));
    } catch (error: any) {
      setFullData([]);
      setOrdersError(error?.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setOrdersLoading(false);
    }
  };

  const totalOrders = ordersLoading ? '...' : stats.totalOrders.toLocaleString('vi-VN');
  const processingOrders = ordersLoading ? '...' : stats.processing.toLocaleString('vi-VN');
  const completedOrders = ordersLoading ? '...' : stats.completed.toLocaleString('vi-VN');
  const cancelledOrders = ordersLoading ? '...' : stats.cancelled.toLocaleString('vi-VN');
  const disputesOrders = ordersLoading ? '...' : stats.disputes.toLocaleString('vi-VN');
  const pendingPriceReviewOrders = ordersLoading ? '...' : stats.pendingPriceReview.toLocaleString('vi-VN');

  const statSkeleton = <div style={{ height: 22, width: '55%', borderRadius: 8, background: 'linear-gradient(90deg, #e2e8f0 25%, #f8fafc 37%, #e2e8f0 63%)' }} />;

  const renderOrderTable = () => {
    if (ordersLoading) {
      return (
        <div className="order-table-shell" aria-busy="true">
          <table className="order-table">
            <thead>
              <tr>
                <th className="order-table__checkbox-cell" />
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
              {Array.from({ length: 6 }).map((_, index) => (
                <tr key={`order-skeleton-${index}`}>
                  <td className="order-table__checkbox-cell"><div style={{ width: 14, height: 14, borderRadius: 4, background: '#e2e8f0' }} /></td>
                  {Array.from({ length: 9 }).map((__, cellIndex) => (
                    <td key={cellIndex}>
                      <div style={{ height: 16, width: cellIndex === 5 ? 92 : '75%', borderRadius: 8, background: '#e2e8f0' }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <OrderTable
        orders={visibleOrders}
        selectedIds={selectedIds}
        onToggleAll={(checked) => setSelectedIds(checked ? visibleOrders.map((order) => order.id) : [])}
        onToggleRow={(id, checked) => {
          setSelectedIds((current) => (checked ? Array.from(new Set([...current, id])) : current.filter((item) => item !== id)));
        }}
        onView={openOrderDetail}
      />
    );
  };

  return (
    <div className="acp-layout">
      <AdminSidebar activeItem="orders" />
      <main className="acp-main">
        <AdminHeader />

        <div className="acp-header-row">
          <div>
            <h1>Quản lý đơn hàng</h1>
          </div>
        </div>

        {ordersError && (
          <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: '#fee2e2', color: '#991b1b' }}>
            {ordersError}
            <button type="button" onClick={retryOrderList} style={{ marginLeft: 12, border: 'none', background: 'transparent', color: '#991b1b', fontWeight: 700, cursor: 'pointer' }}>
              Thử lại
            </button>
          </div>
        )}

        <section className="orders-stats-row">
          {ordersLoading
            ? Array.from({ length: 6 }).map((_, index) => (
              <div key={`stat-skeleton-${index}`} className="stat-card" style={{ minHeight: 74, position: 'relative', overflow: 'hidden' }}>
                <div className="stat-title" style={{ opacity: 0.5 }}>Đang tải...</div>
                {statSkeleton}
              </div>
            ))
            : (
              <>
                <div className="stat-card"><div className="stat-title">Tổng đơn hàng</div><div className="stat-value">{totalOrders}</div></div>
                <div className="stat-card"><div className="stat-title">Đang xử lý</div><div className="stat-value">{processingOrders}</div></div>
                <div className="stat-card"><div className="stat-title">Hoàn thành</div><div className="stat-value">{completedOrders}</div></div>
                <div className="stat-card"><div className="stat-title">Đã hủy</div><div className="stat-value">{cancelledOrders}</div></div>
                <div className="stat-card"><div className="stat-title">Tranh chấp</div><div className="stat-value">{disputesOrders}</div></div>
                <div className="stat-card"><div className="stat-title">Chờ duyệt giá</div><div className="stat-value">{pendingPriceReviewOrders}</div></div>
              </>
            )}
        </section>

        <section className="orders-controls">
          

          <div className="filters-row">
            <div className="filter-item">
              <label>Trạng thái</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option>Tất cả</option>
                <option>NEW</option>
                <option>ASSIGNED</option>
                <option>SCHEDULED</option>
                <option>IN_PROGRESS</option>
                <option>COMPLETED</option>
                <option>CANCELLED</option>
              </select>
            </div>
            <div className="filter-item">
              <label>Thời gian</label>
              <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}><option>Tất cả</option><option>Hôm nay</option><option>7 ngày</option><option>30 ngày</option></select>
            </div>
            <div className="filter-item">
              <label>Thanh toán</label>
              <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                {paymentOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label>Thợ kỹ thuật</label>
              <select value={technicianFilter} onChange={(e) => setTechnicianFilter(e.target.value)}>
                {filteredTechnicians.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label>Khu vực</label>
              <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
                {filteredAreas.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label>Mức giá</label>
              <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}><option>Tất cả</option><option>Dưới 300k</option><option>300k - 500k</option><option>Trên 500k</option></select>
            </div>
            <div className="orders-search-wrap">
              <input
                className="orders-search"
                placeholder="Tìm kiếm đơn hàng..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="orders-main">
          <div className="orders-left">
            {renderOrderTable()}
            {!ordersLoading && totalItems > 0 && (
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(1, prev - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    background: currentPage === 1 ? '#f1f5f9' : '#fff',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1,
                  }}
                >
                  ← Trước
                </button>
                <span style={{ padding: '0 8px', color: '#64748b', fontSize: 14 }}>
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    background: currentPage >= totalPages ? '#f1f5f9' : '#fff',
                    cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage >= totalPages ? 0.5 : 1,
                  }}
                >
                  Sau →
                </button>
              </div>
            )}
          </div>

        </section>
      </main>
    </div>
  );
};

export default AdminOrdersPage;
