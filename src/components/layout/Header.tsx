/* eslint-disable @typescript-eslint/no-unused-expressions */
import React from 'react';
import { useLocation } from 'react-router-dom';
import './Header.css';
import { authController } from '../../controllers/auth/authController';
import { SearchIcon, BellIcon } from '../common/Icons';

interface HeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onNavigate?: (page: string, data?: any) => void;
  profilePage?: string;
  searchPlaceholder?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  profilePage = 'customer-settings',
  searchPlaceholder = 'Tìm kiếm dịch vụ...',
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const goToProfile = () => onNavigate && onNavigate(profilePage);
  const goToLogout = () => {
    authController.handleLogout();
    onNavigate && onNavigate('login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo" style={{ cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('home')}>
          <span className="logo-text">GlowUp</span>
        </div>

        <nav className="header-nav">
          <a
            href="#"
            className={`nav-item ${isActive('/') ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }}
          >
            Trang chủ
          </a>
          <a
            href="#"
            className={`nav-item ${isActive('/services') ? 'active' : ''}`}
           
            onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('services'); }}
          >
            Dịch vụ
          </a>
          <a
            href="#"
            className={`nav-item ${isActive('/provider') ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('provider'); }}
          >
            Chuyên gia
          </a>
          <a href="#" className="nav-item">Ưu đãi</a>
        </nav>

        <div className="header-actions">
          <div className="search-box" style={{ cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('provider')}>
            <SearchIcon className="search-icon" size={16} />
            <input type="text" placeholder={searchPlaceholder} className="search-input" />
          </div>
          <div className="action-icon">
            <BellIcon size={20} />
            <span className="notification-dot"></span>
          </div>
          <div className="profile-dropdown">
            <button className="profile-btn" type="button" aria-haspopup="menu" aria-label="Tài khoản của tôi">
              <img src="https://i.pravatar.cc/150?img=32" alt="Avatar" className="avatar-img" />
            </button>

            <div className="profile-menu" role="menu" aria-label="Tùy chọn tài khoản">
              <div className="profile-menu__header">
                <img src="https://i.pravatar.cc/150?img=32" alt="Avatar" className="profile-menu__avatar" />
                <div>
                  <p className="profile-menu__name">Hồ sơ của tôi</p>
                  <p className="profile-menu__sub">Quản lý thông tin cá nhân</p>
                </div>
              </div>

              <button className="profile-menu__item" type="button" onClick={goToProfile} role="menuitem">
                Hồ sơ của tôi
              </button>
              <button className="profile-menu__item profile-menu__item--danger" type="button" onClick={goToLogout} role="menuitem">
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
