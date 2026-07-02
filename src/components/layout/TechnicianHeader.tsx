import React, { useEffect, useState } from 'react';
import './technicianHeader.css';
import { FaLocationDot } from 'react-icons/fa6';
import NotificationMenu from '../common/NotificationMenu';
import { technicianService } from '../../services/technician/technicianService';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { LogOut } from 'lucide-react';
import { authService } from '../../services/auth/authService';
import { useNavigate } from 'react-router';

export const TechnicianHeader: React.FC = () => {
    const { profile } = useUserProfile();
    const [isAvailable, setIsAvailable] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [fetching, setFetching] = useState<boolean>(true);
    const navigate = useNavigate();


    const handleLogout = () => {
        authService.logout();
        navigate('/auth/login');
      };
    
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

    return (
        <header className="db-header">
            <div className="db-header-left">
                <div className="db-location">
                    <span className="icon"><FaLocationDot /></span>
                    <span className="text">TP. Hồ Chí Minh</span>
                </div>
            </div>

            <div className="db-header-right">
                {/* Thông báo */}
                <NotificationMenu variant="dark" badgeStyle="count" />

                {/* Trạng thái nhận việc */}
                <div className="pd-availabiliti">
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
                        {fetching ? 'Đang tải...' : (loading ? 'Đang cập nhật...' : (isAvailable ? 'Sẵn sàng' : 'Ngoại tuyến'))}
                    </span>
                    </div>
                </div>

                <button type="button" className="settings-danger-button" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LogOut size={18} />
                    Đăng xuất
                </button>
                
            </div>
        </header>
    );
};

export default TechnicianHeader;
