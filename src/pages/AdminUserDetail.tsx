import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { UserProfileCard } from '../components/admin/UserProfileCard';
import { UserPersonalInfo } from '../components/admin/UserPersonalInfo';
import { InternalNotes, SystemStatus, SupportWidget } from '../components/admin/AdminSidebarWidgets';
import { UserOrderHistory } from '../components/admin/UserOrderHistory';
import { getAdminUserById } from '../services/adminUserService';
import { getVerificationRequests } from '../services/verificationService';
import { technicianService } from '../services/technician/technicianService';
import type { VerificationRequest } from '../types/VerificationRequest';
import './AdminUserDetail.css';

interface CombinedUser {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  district: string;
  role: 'customer' | 'technician';
  status: 'active' | 'pending' | 'locked' | 'inactive';
  serviceType?: string;
  orderCount: number;
  joinedAt: string;
  isVerified: boolean;
  bio?: string;
  skills?: string[];
  balance?: string;
  rating?: number;
  ratingLabel?: string;
  completedJobs?: string;
  code?: string;
}

const AdminUserDetail: React.FC = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [user, setUser] = useState<CombinedUser | null>(null);
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const userId = parseInt(id, 10);
      const userRes = await getAdminUserById(userId);

      const combined: CombinedUser = {
        id: String(userRes.id),
        name: userRes.fullName,
        avatar: userRes.avatar || 'https://i.pravatar.cc/150?img=default',
        phone: userRes.phone,
        email: userRes.email,
        district: userRes.district || 'Chưa rõ',
        role: userRes.role,
        status: userRes.status,
        serviceType: userRes.role === 'technician' ? 'Kỹ thuật viên' : 'Khách hàng',
        orderCount: 0,
        joinedAt: new Date(userRes.createdAt).toLocaleDateString('vi-VN'),
        isVerified: userRes.status === 'active',
        bio: userRes.bio || '',
        skills: [],
        balance: '0đ',
        rating: 5.0,
        ratingLabel: 'Đánh giá trung bình',
        completedJobs: '0',
        code: userRes.code,
      };

      if (userRes.role === 'technician') {
        try {
          const techDetail = await technicianService.getTechnician(userRes.code);
          if (techDetail) {
            combined.bio = techDetail.bio || combined.bio;
            combined.skills = techDetail.skills || [];
            combined.rating = typeof techDetail.rating === 'number' 
              ? techDetail.rating 
              : (typeof techDetail.rating === 'string' ? parseFloat(techDetail.rating) : 5.0);
            combined.completedJobs = String(techDetail.completedJobs ?? 0);
            combined.district = techDetail.district || combined.district;
          }
        } catch (err) {
          console.error('Lỗi khi tải hồ sơ thợ chuyên sâu:', err);
        }

        try {
          const verifications = await getVerificationRequests(undefined, userRes.email || userRes.fullName);
          const matching = verifications.find(
            (v) => v.technicianId === userRes.code || v.email === userRes.email
          );
          if (matching) {
            setVerificationRequest(matching);
          }
        } catch (err) {
          console.error('Lỗi khi tải hồ sơ xác minh KYC:', err);
        }
      }

      setUser(combined);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi tải thông tin chi tiết người dùng.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return (
      <div className="aud-layout">
        <AdminSidebar activeItem="users" />
        <div className="aud-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <p>Đang tải thông tin chi tiết...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="aud-layout">
        <AdminSidebar activeItem="users" />
        <div className="aud-main" style={{ padding: '40px', textAlign: 'center' }}>
          <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>{error || 'Không tìm thấy thông tin người dùng'}</h2>
          <button 
            className="aud-bc-link" 
            onClick={() => navigate('/admin/users')} 
            style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
          >
            Quay lại quản lý người dùng
          </button>
        </div>
      </div>
    );
  }

  const isPendingTab = user.status === 'pending';

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
          <button 
            onClick={() => navigate('/admin/users')} 
            className="aud-bc-link"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', color: 'inherit' }}
          >
            Quản lý người dùng
          </button>
          <span className="aud-bc-sep">›</span>
          <span className="aud-bc-current">{isPendingTab ? 'Xét duyệt' : 'Chi tiết'} {user.role === 'technician' ? 'Kỹ thuật viên' : 'Khách hàng'}</span>
        </div>

        {/* User Profile Card */}
        <UserProfileCard user={user} onRefresh={fetchDetail} />

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
            {activeTab === 'personal' && (
              <UserPersonalInfo 
                user={user} 
                isPending={isPendingTab} 
                verificationRequest={verificationRequest}
                onRefresh={fetchDetail}
              />
            )}
            {activeTab === 'orders' && (
              <UserOrderHistory userId={user.id} role={user.role} />
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
