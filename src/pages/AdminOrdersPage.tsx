import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { OrderTable } from '../components/orderManagement/OrderTable';
import {
  getAdminOrders,
  getOrderStats,
  type OrderStatsSummary,
  type OrderTableRow,
} from '../services/orderService';
import './AdminOrdersPage.css';

const AdminOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [orders, setOrders] = useState<OrderTableRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [stats, setStats] = useState<OrderStatsSummary | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const pageCache = useRef<Map<string, { items: OrderTableRow[]; totalElements: number; totalPages: number }>>(new Map());

  const requestStatus = useMemo(() => (statusFilter === 'Tất cả' ? undefined : (statusFilter as OrderTableRow['status'])), [statusFilter]);
  const cacheKeyPrefix = useMemo(() => `${statusFilter}::${debouncedSearch}`, [statusFilter, debouncedSearch]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchText.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const result = await getOrderStats();
      setStats(result);
    } catch {
      setStats({
        totalOrders: 0,
        processing: 0,
        completed: 0,
        cancelled: 0,
        disputes: 0,
        pendingPriceReview: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadOrdersPage = useCallback(async (page: number) => {
    const cacheKey = `${cacheKeyPrefix}::${page}`;

    if (pageCache.current.has(cacheKey)) {
      const cached = pageCache.current.get(cacheKey)!;
      setOrders(cached.items);
      setTotalItems(cached.totalElements);
      setTotalPages(Math.max(1, cached.totalPages));
      setSelectedIds((current) => current.filter((id) => cached.items.some((order) => order.id === id)));
      setOrdersLoading(false);
      setOrdersError(null);
      return;
    }

    try {
      setOrdersLoading(true);
      setOrdersError(null);

      const result = await getAdminOrders({
        page,
        limit: itemsPerPage,
        keyword: debouncedSearch || undefined,
        status: requestStatus,
      });

      pageCache.current.set(cacheKey, {
        items: result.items,
        totalElements: result.totalElements,
        totalPages: result.totalPages,
      });
      setOrders(result.items);
      setTotalItems(result.totalElements);
      setTotalPages(Math.max(1, result.totalPages));
      setSelectedIds((current) => current.filter((id) => result.items.some((order) => order.id === id)));

      const hasNextPage = page * itemsPerPage < result.totalElements;
      if (hasNextPage) {
        const nextKey = `${cacheKeyPrefix}::${page + 1}`;
        if (!pageCache.current.has(nextKey)) {
          getAdminOrders({
            page: page + 1,
            limit: itemsPerPage,
            keyword: debouncedSearch || undefined,
            status: requestStatus,
          })
            .then((nextResult) => {
              pageCache.current.set(nextKey, {
                items: nextResult.items,
                totalElements: nextResult.totalElements,
                totalPages: nextResult.totalPages,
              });
            })
            .catch(() => {});
        }
      }
    } catch (error: any) {
      setOrders([]);
      setTotalItems(0);
      setTotalPages(1);
      setOrdersError(error?.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setOrdersLoading(false);
    }
  }, [cacheKeyPrefix, debouncedSearch, itemsPerPage, requestStatus]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    setCurrentPage(1);
    pageCache.current.clear();
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    void loadOrdersPage(currentPage);
  }, [currentPage, loadOrdersPage]);

  const visibleOrders = orders;
  const displayTotalItems = Math.max(totalItems, visibleOrders.length);
  const pageNumbers = useMemo(() => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 2) {
      return [1, 2, 3];
    }

    if (currentPage >= totalPages - 1) {
      return [totalPages - 2, totalPages - 1, totalPages];
    }

    return [currentPage - 1, currentPage, currentPage + 1];
  }, [currentPage, totalPages]);

  const currentStats = stats || {
    totalOrders: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    disputes: 0,
    pendingPriceReview: 0,
  };

  const openOrderDetail = (order: OrderTableRow) => {
    navigate(`/admin/orders/${order.id}`);
  };

  const retryOrderList = async () => {
    pageCache.current.clear();
    await Promise.all([loadOrdersPage(currentPage), loadStats()]);
  };

  const totalOrders = statsLoading ? '...' : currentStats.totalOrders.toLocaleString('vi-VN');
  const processingOrders = statsLoading ? '...' : currentStats.processing.toLocaleString('vi-VN');
  const completedOrders = statsLoading ? '...' : currentStats.completed.toLocaleString('vi-VN');
  const cancelledOrders = statsLoading ? '...' : currentStats.cancelled.toLocaleString('vi-VN');
  const disputesOrders = statsLoading ? '...' : currentStats.disputes.toLocaleString('vi-VN');
  const pendingPriceReviewOrders = statsLoading ? '...' : currentStats.pendingPriceReview.toLocaleString('vi-VN');

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
            <div className="orders-search-wrap">
              <input
                className="orders-search"
                placeholder="Tìm theo mã đơn, dịch vụ, tên khách hàng..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="orders-main">
          <div className="orders-left">
            {renderOrderTable()}
            {!ordersLoading && visibleOrders.length > 0 && (
              <div className="orders-pagination-footer">
                <span className="orders-pagination-summary">
                  Hiển thị {visibleOrders.length} trên tổng số {displayTotalItems.toLocaleString('vi-VN')} giao dịch
                </span>

                <div className="orders-pagination-controls">
                  <button
                    type="button"
                    className="orders-page-btn"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((prev) => Math.max(1, prev - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    aria-label="Trang trước"
                  >
                    {'<'}
                  </button>

                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={`orders-page-btn ${page === currentPage ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      aria-label={`Trang ${page}`}
                      aria-current={page === currentPage ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="orders-page-btn"
                    disabled={currentPage >= totalPages}
                    onClick={() => {
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    aria-label="Trang sau"
                  >
                    {'>'}
                  </button>
                </div>
              </div>
            )}
          </div>

        </section>
      </main>
    </div>
  );
};

export default AdminOrdersPage;
