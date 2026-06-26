import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { UserProfileCard } from '../components/admin/UserProfileCard';
import { UserPersonalInfo } from '../components/admin/UserPersonalInfo';
import { InternalNotes, SystemStatus, SupportWidget } from '../components/admin/AdminSidebarWidgets';
import { UserOrderHistory } from '../components/admin/UserOrderHistory';
import './AdminUserDetail.css';

const AdminUserDetail: React.FC = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const location = useLocation();
  const user = location.state?.user;
  const isPendingTab = location.state?.tab === 'pending';

  const tabs = [
    { id: 'personal', label: 'Thông tin cá nhân' },
    { id: 'orders', label: 'Lịch sử đơn hàng' },
    { id: 'wallet', label: 'Ví tiền & Giao dịch' },
  ];

  return (
    <div className="aud-layout">
      <AdminSidebar activeItem="users" />

      <div className="aud-main">
        <AdminHeader />

        {/* Breadcrumb */}
        <div className="aud-breadcrumb">
          <a href="/admin/users" className="aud-bc-link">Quản lý người dùng</a>
          <span className="aud-bc-sep">›</span>
          <span className="aud-bc-current">{isPendingTab ? 'Xét duyệt' : 'Chi tiết'} Kỹ thuật viên</span>
        </div>

        {/* User Profile Card */}
        <UserProfileCard user={user} />

        {/* Tabs */}
        <div className="aud-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`aud-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="aud-content-grid">
          <div className="aud-content-left">
            {activeTab === 'personal' && <UserPersonalInfo user={user} isPending={isPendingTab} />}
            {activeTab === 'orders' && (
              <UserOrderHistory userId={user?.id} role={user?.role} />
            )}
            {activeTab === 'wallet' && (
              <div className="aud-placeholder-card">
                <h3>Ví tiền & Giao dịch</h3>
                <p>Chi tiết giao dịch và số dư ví sẽ hiển thị tại đây.</p>
              </div>
            )}
          </div>
          <div className="aud-sidebar-right">
            <InternalNotes />
            <SystemStatus />
            <SupportWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;
