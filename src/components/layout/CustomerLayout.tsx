import React from 'react';
import { Footer } from './Footer';
import Header from './Header';
import { SettingsFrame } from './SettingsFrame';
import { CustomerSettingsSidebar } from '../settings/customer/CustomerSettingsSidebar';
import { authController } from '../../controllers/auth/authController';
import '../settings/SettingsUI.css';
import { useCustomerNavigate } from './useCustomerNavigate';
import './layout.css';

interface CustomerLayoutProps {
  children: React.ReactNode;
  activeNavKey?: string;
  activeSidebarItem?: string;
  profilePage?: string;
  searchPlaceholder?: string;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({
  children,
  activeSidebarItem,
  profilePage = 'customer-settings',
  searchPlaceholder = 'Tìm kiếm dịch vụ...',
}) => {
  const onNavigate = useCustomerNavigate();

  const handleSidebarSelect = (id: string) => {
    if (id === 'logout') {
      authController.handleLogout();
      onNavigate('login');
      return;
    }

    if (id === 'security') {
      onNavigate('change-password');
      return;
    }

    if (id === 'wallet') {
      onNavigate('order-management');
      return;
    }

    onNavigate('customer-settings');
  };

  return (
    <div className="app-wrapper cust-layout-container">
      <Header
        onNavigate={onNavigate}
        profilePage={profilePage}
        searchPlaceholder={searchPlaceholder}
      />

      <main className="cust-content-area">
        {activeSidebarItem ? (
          <div className="settings-page settings-page--customer">
            <SettingsFrame as="div">
              <CustomerSettingsSidebar
                activeItem={activeSidebarItem}
                onSelect={handleSidebarSelect}
              />
              {children}
            </SettingsFrame>
          </div>
        ) : (
          children
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CustomerLayout;
