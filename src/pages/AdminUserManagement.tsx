import React, { useState } from 'react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { UserManagementTable } from '../components/admin/UserManagementTable';
import { Footer } from '../components/layout/Footer';
import './AdminUserManagement.css';

const AdminUserManagement: React.FC = () => {
  const [activeRole, setActiveRole] = useState<'customer' | 'technician'>('technician');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'locked' | 'inactive'>('all');
  const [areaFilter, setAreaFilter] = useState<'all' | 'Quận 1' | 'Quận 3' | 'Quận 7' | 'Thủ Đức'>('all');

  return (
    <div className="aum-layout">
      <AdminSidebar activeItem="users" />
      <div className="aum-main">
        <AdminHeader
          searchPlaceholder="Tìm kiếm theo tên hoặc số điện thoại..."
          searchValue={searchKeyword}
          onSearchChange={setSearchKeyword}
        />

        <div className="aum-breadcrumb">HỆ THỐNG &gt; NGƯỜI DÙNG</div>

        <div className="aum-page-header">
          <div>
            <h1 className="aum-page-title">Quản lý người dùng</h1>
            <p className="aum-page-subtitle">Theo dõi tài khoản khách hàng và kỹ thuật viên trên toàn hệ thống</p>
          </div>
          <button className="aum-add-btn" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Thêm thợ mới
          </button>
        </div>

        <UserManagementTable
          activeRole={activeRole}
          onRoleChange={setActiveRole}
          searchKeyword={searchKeyword}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          areaFilter={areaFilter}
          onAreaFilterChange={setAreaFilter}
        />

        <div className="aum-footer-wrap">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;
