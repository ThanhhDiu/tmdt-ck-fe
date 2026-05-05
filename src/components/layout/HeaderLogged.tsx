import React from 'react';
import './HeaderLogged.css';
import { SearchIcon, FileTextIcon } from '../common/Icons';
import NotificationMenu from '../common/NotificationMenu';

interface HeaderNavItem {
  key: string;
  label: string;
  page: string;
}

interface HeaderLoggedProps {
  onNavigate?: (page: string, data?: any) => void;
  navItems?: HeaderNavItem[];
  activeNavKey?: string;
  profilePage?: string;
  searchPlaceholder?: string;
}

const defaultNavItems: HeaderNavItem[] = [
  { key: 'services', label: 'Dịch vụ', page: 'home' },
  { key: 'providers', label: 'Danh sách thợ', page: 'find-provider' },
  { key: 'offers', label: 'Ưu đãi', page: 'find-provider' },
];

export const HeaderLogged: React.FC<HeaderLoggedProps> = ({
  onNavigate,
  navItems = defaultNavItems,
  activeNavKey = 'providers',
  profilePage = 'customer-settings',
  searchPlaceholder = 'Tìm kiếm thợ...',
}) => {
  const goToProfile = () => onNavigate && onNavigate(profilePage);
  const goToLogout = () => onNavigate && onNavigate('login');

  return (
    <header className="header-logged">
      <div className="hl-container">
        <div className="hl-left">
          <div className="hl-logo" style={{ cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('home')}>
            <span className="hl-logo-text">GlowUp</span>
          </div>

          <nav className="hl-nav-menu">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`hl-nav-item ${activeNavKey === item.key ? 'active' : ''}`}
                onClick={() => onNavigate && onNavigate(item.page)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="hl-right">
          <div className="hl-search-bar">
            <SearchIcon size={16} className="hl-search-icon" />
            <input type="text" placeholder={searchPlaceholder} className="hl-search-input" />
          </div>

          <div className="hl-actions">
            <NotificationMenu badgeStyle="dot" />
            <button className="hl-icon-btn" type="button" aria-label="Tài liệu">
              <FileTextIcon size={20} />
            </button>
            <div className="hl-profile-dropdown">
              <button className="hl-avatar-wrapper" type="button" aria-haspopup="menu" aria-label="Tài khoản của tôi">
                <img src="https://i.pravatar.cc/150?img=32" alt="User" className="hl-avatar" />
              </button>

              <div className="hl-profile-menu" role="menu" aria-label="Tùy chọn tài khoản">
                <div className="hl-profile-menu__header">
                  <img src="https://i.pravatar.cc/150?img=32" alt="User" className="hl-profile-menu__avatar" />
                  <div>
                    <p className="hl-profile-menu__name">Hồ sơ của tôi</p>
                    <p className="hl-profile-menu__sub">Quản lý tài khoản và bảo mật</p>
                  </div>
                </div>

                <button className="hl-profile-menu__item" type="button" onClick={goToProfile} role="menuitem">
                  Hồ sơ của tôi
                </button>
                <button
                  className="hl-profile-menu__item hl-profile-menu__item--danger"
                  type="button"
                  onClick={goToLogout}
                  role="menuitem"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderLogged;
