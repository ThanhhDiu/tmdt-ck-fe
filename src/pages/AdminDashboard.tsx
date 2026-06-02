import React, { useEffect, useMemo, useState } from 'react';
import { AdminSidebar } from '../components/admin/AdminSidebar.tsx';
import { AdminHeader } from '../components/admin/AdminHeader.tsx';
import './AdminDashboard.css';
import { DashboardStatsCards } from '../components/admin/DashboardStatsCards.tsx';
import { RevenueChart } from '../components/admin/RevenueChart.tsx';
import { ServiceDistributionChart } from '../components/admin/ServiceDistributionChart.tsx';
import { RecentOrdersTable } from '../components/admin/RecentOrdersTable.tsx';
import type { DashboardTimeFilter, DashboardViewMode } from '../types/DashboardTimeFilter.ts';
import {
  getAdminDashboardData,
  type AdminDashboardData,
} from '../services/adminDashboardService.ts';

const AdminDashboard: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [timeFilter, setTimeFilter] = useState<DashboardTimeFilter>({
    mode: 'all-time',
    year: currentYear,
    quarter: 1,
    month: 1,
  });
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let year = currentYear; year >= 2020; year -= 1) {
      list.push(year);
    }
    return list;
  }, [currentYear]);

  const monthOptions = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
  ];

  const setMode = (mode: DashboardViewMode) => {
    setTimeFilter((prev) => ({ ...prev, mode }));
  };

  useEffect(() => {
    let isCancelled = false;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminDashboardData(timeFilter);
        if (!isCancelled) {
          setDashboardData(data);
        }
      } catch (fetchError) {
        if (!isCancelled) {
          setError(fetchError instanceof Error ? fetchError.message : 'Không thể tải dữ liệu thống kê.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    void fetchDashboardData();

    return () => {
      isCancelled = true;
    };
  }, [timeFilter]);

  return (
    <div className="ad-layout">
      <AdminSidebar activeItem="dashboard" />
      <div className="ad-main">
        <AdminHeader />

        {/* Page Header */}
        <div className="ad-page-header">
          <div>
            <h1 className="ad-page-title">Trang Tổng Quan Thống Kê</h1>
            <p className="ad-page-subtitle">Quản lý tổng quát hoạt động kinh doanh, doanh thu và dịch vụ</p>
          </div>
          <div className="ad-page-actions">
            <div className="ad-global-time-filter">
              <div className="ad-global-mode-buttons">
                <button
                  className={`ad-filter-btn ${timeFilter.mode === 'all-time' ? 'active' : ''}`}
                  onClick={() => setMode('all-time')}
                >
                  Từ đầu đến hiện tại
                </button>
                <button
                  className={`ad-filter-btn ${timeFilter.mode === 'year' ? 'active' : ''}`}
                  onClick={() => setMode('year')}
                >
                  Theo năm
                </button>
                <button
                  className={`ad-filter-btn ${timeFilter.mode === 'quarter' ? 'active' : ''}`}
                  onClick={() => setMode('quarter')}
                >
                  Theo quý
                </button>
                <button
                  className={`ad-filter-btn ${timeFilter.mode === 'month' ? 'active' : ''}`}
                  onClick={() => setMode('month')}
                >
                  Theo tháng
                </button>
              </div>

              {(timeFilter.mode === 'year' || timeFilter.mode === 'quarter' || timeFilter.mode === 'month') && (
                <select
                  className="ad-select-input"
                  value={timeFilter.year}
                  onChange={(event) =>
                    setTimeFilter((prev) => ({
                      ...prev,
                      year: Number(event.target.value),
                    }))
                  }
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      Năm {year}
                    </option>
                  ))}
                </select>
              )}

              {timeFilter.mode === 'quarter' && (
                <select
                  className="ad-select-input"
                  value={timeFilter.quarter}
                  onChange={(event) =>
                    setTimeFilter((prev) => ({
                      ...prev,
                      quarter: Number(event.target.value) as 1 | 2 | 3 | 4,
                    }))
                  }
                >
                  <option value={1}>Quý 1</option>
                  <option value={2}>Quý 2</option>
                  <option value={3}>Quý 3</option>
                  <option value={4}>Quý 4</option>
                </select>
              )}

              {timeFilter.mode === 'month' && (
                <select
                  className="ad-select-input"
                  value={timeFilter.month}
                  onChange={(event) =>
                    setTimeFilter((prev) => ({
                      ...prev,
                      month: Number(event.target.value),
                    }))
                  }
                >
                  {monthOptions.map((monthOption) => (
                    <option key={monthOption.value} value={monthOption.value}>
                      {monthOption.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button className="ad-export-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Xuất báo cáo
            </button>
          </div>
        </div>

        {error && <div className="ad-dashboard-error">{error}</div>}

        {/* Stats Cards */}
        <DashboardStatsCards stats={dashboardData?.stats || []} isLoading={loading} />

        {/* Charts Section */}
        <div className="ad-charts-container">
          <div className="ad-chart-wrapper ad-chart-large">
            <div className="ad-chart-header">
              <h2 className="ad-chart-title">Tăng trưởng đơn hàng</h2>
            </div>
            <RevenueChart chartData={dashboardData?.revenue || []} isLoading={loading} />
          </div>

          <div className="ad-chart-wrapper ad-chart-small">
            <div className="ad-chart-header">
              <h2 className="ad-chart-title">Tỷ trọng dịch vụ</h2>
            </div>
            <ServiceDistributionChart services={dashboardData?.services || []} isLoading={loading} />
          </div>
        </div>

        {/* Recent Orders Table */}
        <RecentOrdersTable orders={dashboardData?.recentOrders || []} isLoading={loading} />
      </div>
    </div>
  );
};

export default AdminDashboard;
