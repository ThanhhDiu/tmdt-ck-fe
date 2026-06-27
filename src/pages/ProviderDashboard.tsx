import React, { useState, useEffect } from 'react';
import { StatsCards } from '../components/dashboard/StatsCards';
import { EarningsChart } from '../components/dashboard/EarningsChart';
import { AvailableTasks } from '../components/dashboard/AvailableTasks';
import { TodaySchedule } from '../components/dashboard/TodaySchedule';
import { useUserProfile } from '../contexts/UserProfileContext';
import { technicianService } from '../services/technician/technicianService';
import './ProviderDashboard.css';

const ProviderDashboard: React.FC = () => {
  const { profile } = useUserProfile();
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);

  useEffect(() => {
    if (!profile.code) return;
    const fetchAvailability = async () => {
      try {
        setFetching(true);
        const data = await technicianService.getTechnician(profile.code);
        setIsAvailable(data.isAvailable ?? true);
      } catch (error) {
        console.error('Lỗi khi lấy trạng thái hoạt động của thợ:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchAvailability();
  }, [profile.code]);

  const handleToggleAvailability = async () => {
    if (!profile.code) return;
    const nextVal = !isAvailable;
    try {
      setLoading(true);
      await technicianService.updateTechnicianAvailability(profile.code, nextVal);
      setIsAvailable(nextVal);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Lỗi khi cập nhật trạng thái hoạt động.');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="pd-availability">
            <span className="pd-availability-label">AVAILABILITY</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
              <label className="pd-switch-wrapper">
                <input 
                  type="checkbox" 
                  checked={isAvailable} 
                  onChange={handleToggleAvailability}
                  disabled={loading || fetching}
                />
                <span className="pd-switch-slider"></span>
              </label>
              <span className="pd-availability-status">
                <span className={isAvailable ? "status-dot-green" : "status-dot-red"}></span>
                {fetching ? 'Đang tải...' : (loading ? 'Đang cập nhật...' : (isAvailable ? 'Accepting Jobs' : 'Offline'))}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="pd-content-grid">
          {/* Left Column */}
          <div className="pd-left-col">
            <StatsCards />
            <EarningsChart />
            <AvailableTasks />
          </div>

          {/* Right Column */}
          <div className="pd-right-col">
            <TodaySchedule />
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

