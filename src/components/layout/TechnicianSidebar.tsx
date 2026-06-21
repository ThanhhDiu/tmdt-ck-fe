
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../../contexts/UserProfileContext';
import React, { useEffect, useState } from 'react';
import './technicianSidebar.css';
//import { fetchCurrentUser, getStoredUser, type User } from '../../services/auth';

// Ảnh mặc định khi chưa có avatar hoặc ảnh bị lỗi
const DEFAULT_AVATAR = 'https://segayanime.com/wp-content/uploads/2026/01/avatar-fb-mac-dinh-1.jpg';

interface SidebarProps {
  activeItem?: string
  onNavigate?: (page: string) => void
}

export const TechnicianSidebar: React.FC<SidebarProps> = ({ activeItem = 'dashboard', onNavigate }) => {
  const navigate = useNavigate();

  // Tính năng 3: Sidebar sử dụng chung Global State (UserProfileContext) với trang Profile
  // Khi avatar thay đổi ở trang Profile → setAvatar/updateProfile cập nhật context
  // → Sidebar tự re-render hiển thị avatar mới mà KHÔNG cần reload trang
  const { profile } = useUserProfile();
  /*
      const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  
      useEffect(() => {
          let isMounted = true;
  
          const loadCurrentUser = async () => {
              try {
                  const user = await fetchCurrentUser();
                  if (!isMounted) {
                      return;
                  }
                  setCurrentUser(user);
              } catch {
                  if (!isMounted) {
                      return;
                  }
                  setCurrentUser(getStoredUser());
              }
          };
  
          loadCurrentUser();
  
          return () => {
              isMounted = false;
          };
      }, []);*/


  const menuItems = [
    {
      id: 'dashboard', label: 'Dashboard', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
          <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
          <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
          <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
        </svg>
      )
    },
    {
      id: 'jobs', label: 'Order Management', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      )
    },
    {
      id: 'messages', label: 'Messages', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      )
    },
    {
      id: 'wallet', label: 'My Wallet', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
      )
    },
    {
      id: 'profile', label: 'Technician Profile', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )
    },
  ];

  const pageMap: Record<string, string> = {
    dashboard: '/technician/provider-dashboard',
    jobs: '/technician/jobs',
    messages: '/technician/chat',
    wallet: '/technician/wallet',
    profile: '/technician/profile',
  };

  const handleNavigate = (itemId: string) => {
    if (onNavigate) {
      onNavigate(itemId);
      return;
    }

    const target = pageMap[itemId] || '/provider-dashboard';
    navigate(target);
  };

  // Xử lý avatar: dùng avatar từ context, fallback sang ảnh mặc định nếu chưa có
  const displayAvatar = profile?.avatar || DEFAULT_AVATAR;

  return (
    <aside className="technician-sidebar">
      <div className="technician-sidebar-top">
        <div className="technician-sidebar-brand">
          <h2 className="technician-sidebar-logo">GlowUp</h2>
          <span className="technician-sidebar-badge">Verified Provider</span>
        </div>

        <nav className="technician-sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`technician-nav-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => handleNavigate(item.id)}
            >
              <span className="technician-nav-icon">{item.icon}</span>
              <span className="technician-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="technician-sidebar-bottom">
        <div className="technician-user-profile" style={{ marginBottom: '12px' }}>
          {/* Tính năng 3: Avatar đồng bộ realtime từ UserProfileContext
                        - Khi upload avatar mới ở trang Profile → context cập nhật → sidebar re-render
                        - onError: nếu URL ảnh bị lỗi (404, mất kết nối), fallback về ảnh mặc định */}
          <img
            src={displayAvatar}
            alt={profile?.fullName || 'Technician'}
            className="technician-user-avatar"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
            }}
          />
          <div className="technician-user-info">
            <span className="technician-user-name">{profile?.fullName || 'Technician'}</span>
            <span className="technician-user-id">ID: #{profile?.code ? `TECH-${profile.id}` : 'GP-8829'}</span>

          </div>
        </div>
      </div>
    </aside>
  );
};
