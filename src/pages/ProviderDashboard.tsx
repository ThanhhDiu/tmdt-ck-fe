import React, { useState, useEffect } from 'react';
import { StatsCards } from '../components/dashboard/StatsCards';
import { EarningsChart } from '../components/dashboard/EarningsChart';
import { TodaySchedule } from '../components/dashboard/TodaySchedule';
import { useUserProfile } from '../contexts/UserProfileContext';
import { technicianService } from '../services/technician/technicianService';
import type { BusySlotResponse, ChartDataPoint, DashboardStats, TechnicianScheduleSlot } from '../types/technician';
import './ProviderDashboard.css';
import { ScheduleTab } from '../components/provider-profile/ScheduleTab';

const ProviderDashboard: React.FC = () => {
  const { profile } = useUserProfile();
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [schedule, setSchedule] = useState<TechnicianScheduleSlot[]>([]);
  const [bookedOrders, setBookedOrders] = useState<BusySlotResponse[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [weeklyEarnings, setWeeklyEarnings] = useState<ChartDataPoint[]>([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!profile.code) {
      setLoading(false);
      return;
    }

    let active = true;
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [techData, busySlotsData, statsData, weekChartData, monthChartData] = await Promise.all([
          technicianService.getTechnician(profile.code),
          technicianService.getTechnicianBusySlots(profile.code),
          technicianService.getDashboardStats(),
          technicianService.getEarningsChart('week'),
          technicianService.getEarningsChart('month'),
        ]);

        if (!active) return;

        setIsAvailable(techData.isAvailable ?? true);
        setSchedule((techData.schedule as TechnicianScheduleSlot[]) || []);
        setBookedOrders(busySlotsData || []);
        setDashboardStats(statsData);
        setWeeklyEarnings(weekChartData || []);
        setMonthlyEarnings(monthChartData || []);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu Dashboard thợ:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    
    void fetchDashboardData();

    return () => {
      active = false;
    };
  }, [profile.code]);

  const displayName = profile.fullName || 'Minh';

  return (
    <div className="pd-layout">
      <div className="pd-main">
        {/* Top Header Bar */}
        <div className="pd-top-bar">
          <div className="pd-greeting">
            <span className="pd-greeting-text">CHÀO BUỔI SÁNG, {displayName.toUpperCase()}</span>
            <h1 className="pd-page-title">Overview Dashboard</h1>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="pd-content-grid">
          {/* Left Column */}
          <div className="pd-left-col">
            <StatsCards stats={dashboardStats} loading={loading} />
            <EarningsChart
              weeklyData={weeklyEarnings}
              monthlyData={monthlyEarnings}
              loading={loading}
            />
            
            <ScheduleTab 
                schedule={schedule} 
                busySlots={bookedOrders} 
            />
          </div>

          {/* Right Column */}
          <div className="pd-right-col">
            <TodaySchedule 
                schedule={schedule} 
                busySlots={bookedOrders} 
            />
          </div>
        </div>

        {/* Floating Action Button */}
        <button className="pd-fab" title="Thêm mới">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProviderDashboard;