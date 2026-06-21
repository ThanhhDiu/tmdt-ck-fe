/* eslint-disable @typescript-eslint/no-unused-expressions */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Header.css';
import { SearchIcon } from '../common/Icons';
import NotificationMenu from '../common/NotificationMenu';
import { logoutUser, isAuthenticated } from '../../services/auth';
import { customerPageMap } from './customerNavigation';
import { useUserProfile } from '../../contexts/UserProfileContext';

interface HeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onNavigate?: (page: string, data?: any) => void;
  profilePage?: string;
  searchPlaceholder?: string;
}

const DEFAULT_AVATAR = 'https://segayanime.com/wp-content/uploads/2026/01/avatar-fb-mac-dinh-1.jpg';

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  profilePage = 'customer-settings',
  searchPlaceholder = 'Tìm kiếm dịch vụ...',
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { profile, isProfileLoaded, clearProfile } = useUserProfile();

  // Kiểm tra trạng thái đăng nhập: kết hợp token trong localStorage VÀ profile đã load
  const loggedIn = isAuthenticated() && isProfileLoaded;

  const userAvatar = profile.avatar || DEFAULT_AVATAR;
  const userName = profile.fullName;
  const userEmail = profile.email;

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const goToProfile = () => {
    if (profile.role === 'technician') {
      navigate('/technician/profile');
    } else if (profile.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate(customerPageMap['customer-settings']);
    }
  };
  const goToLogout = () => {
    logoutUser();
    clearProfile();
    onNavigate && onNavigate('login');
  };

  const profileDropdown = (
    <div className="profile-dropdown">
      <button
        className="profile-btn"
        type="button"
        aria-haspopup="menu"
        aria-label="Tài khoản của tôi"
      >
        <img
          src={userAvatar || DEFAULT_AVATAR}
          alt={userName || 'Avatar'}
          className="avatar-img"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR; }}
        />
      </button>

      <div className="profile-menu" role="menu" aria-label="Tùy chọn tài khoản">
        <div className="profile-menu__header">
          <img
            src={userAvatar || DEFAULT_AVATAR}
            alt={userName || 'Avatar'}
            className="profile-menu__avatar"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR; }}
          />
          <div>
            <p className="profile-menu__name">{userName || 'Hồ sơ của tôi'}</p>
            <p className="profile-menu__sub">{userEmail || 'Quản lý thông tin cá nhân'}</p>
          </div>
        </div>

        <button
          className="profile-menu__item"
          type="button"
          onClick={goToProfile}
          role="menuitem"
        >
          Hồ sơ của tôi
        </button>

        <button
          className="profile-menu__item profile-menu__item--danger"
          type="button"
          onClick={goToLogout}
          role="menuitem"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );

  const loginButton = (
    <button
      className="login-btn"
      style={{
        padding: '8px 16px',
        borderRadius: '20px',
        border: 'none',
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.2s ease',
      }}
      type="button"
      onClick={() => onNavigate && onNavigate('login')}
    >
      Đăng nhập
    </button>
  );

  return (
    <header className="header">
      <div className="header-container">
        <div
          className="header-logo"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate && onNavigate('home')}
        >
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
          <a
            href="#"
            className={`nav-item ${isActive('/rewards') ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('rewards'); }}
          >
            Ưu đãi
          </a>
        </nav>

        <div className="header-actions">
          <div
            className="search-box"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate && onNavigate('provider')}
          >
            <SearchIcon className="search-icon" size={16} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="search-input"
            />
          </div>
          <NotificationMenu badgeStyle="dot" />
          {/* Tính năng 1: Hiển thị dropdown profile nếu đã đăng nhập, nút "Đăng nhập" nếu chưa */}
          {loggedIn ? profileDropdown : loginButton}
        </div>
      </div>
    </header>
  );
};

export default Header;
