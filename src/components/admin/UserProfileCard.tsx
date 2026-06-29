import React, { useState } from 'react';
import { BadgeCheckIcon } from '../common/Icons';
import { updateAdminUserStatus } from '../../services/adminUserService';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import './UserProfileCard.css';

interface UserProfile {
  id?: string;
  name?: string;
  avatar?: string;
  serviceType?: string;
  rating?: number;
  completedJobs?: string;
  phone?: string;
  status?: string;
  badge?: string;
  ratingLabel?: string;
  balance?: string;
  isVerified?: boolean;
}

interface UserProfileCardProps {
  user?: UserProfile;
  onRefresh?: () => void;
}

const defaultUser: UserProfile = {
  name: 'Nguyễn Văn Hùng',
  id: 'TECH-7821-VN',
  avatar: 'https://i.pravatar.cc/150?img=33',
  badge: 'Kỹ thuật viên Cao cấp',
  rating: 4.9,
  ratingLabel: 'Đánh giá trung bình',
  completedJobs: '1,500+',
  balance: '5.200.000đ',
  isVerified: true,
};

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ user: passedUser, onRefresh }) => {
  const user = passedUser || defaultUser;
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const [loading, setLoading] = useState(false);
  const isLocked = user.status === 'locked';

  const handleToggleLock = async () => {
    if (!user.id) return;
    try {
      setLoading(true);
      const userId = parseInt(user.id, 10);
      const nextStatus = isLocked ? 'active' : 'locked';
      await updateAdminUserStatus(userId, {
        status: nextStatus,
        reason: isLocked ? undefined : lockReason,
      });
      alert(isLocked ? 'Đã mở lại tài khoản thành công!' : 'Đã khóa tài khoản thành công!');
      setShowLockModal(false);
      setLockReason('');
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Lỗi khi thực hiện thao tác.');
    } finally {
      setLoading(false);
    }
  };

  const resolvedAvatar = resolveMediaUrl(user.avatar) || 'https://i.pravatar.cc/150?img=default';

  return (
    <>
      <div className="upc-card">
        <div className="upc-left">
          <div className="upc-avatar-wrapper">
            <img src={resolvedAvatar} alt={user.name} className="upc-avatar" />
            {user.isVerified && <span className="upc-verified-badge"><BadgeCheckIcon size={14} /> ĐÃ XÁC MINH</span>}
          </div>
          <div className="upc-info">
            <div className="upc-name-row">
              <h2 className="upc-name">{user.name}</h2>
              <span className="upc-id-tag">ID: {user.id}</span>
            </div>
            <span className="upc-badge-tag">{user.badge || user.serviceType}</span>
            <div className="upc-stats-row">
              <div className="upc-stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <strong>{user.rating}/5</strong>
                <span className="upc-stat-label">{user.ratingLabel}</span>
              </div>
              <div className="upc-stat-divider"></div>
              <div className="upc-stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <strong>{user.completedJobs}</strong>
                <span className="upc-stat-label">Công việc hoàn thành</span>
              </div>
              <div className="upc-stat-divider"></div>
              <div className="upc-stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                <strong>{user.balance}</strong>
                <span className="upc-stat-label">Số dư khả dụng</span>
              </div>
            </div>
          </div>
        </div>
        <div className="upc-actions">
          <button className="upc-btn-contact">Liên hệ trực tiếp</button>
          <button className={`upc-btn-lock ${isLocked ? 'upc-btn-locked' : ''}`} onClick={() => setShowLockModal(true)}>
            {isLocked ? 'Đang bị khóa tài khoản' : 'Khóa tài khoản'}
          </button>
        </div>
      </div>

      {/* Lock/Unlock Account Modal */}
      {showLockModal && (
        <div className="upc-modal-overlay" onClick={() => setShowLockModal(false)}>
          <div className="upc-modal" onClick={e => e.stopPropagation()}>
            {isLocked ? (
              <>
                <h3 className="upc-modal-title">Mở lại tài khoản</h3>
                <p className="upc-modal-desc">Bạn có chắc chắn muốn mở lại tài khoản <strong>{user.name}</strong> ({user.id}) không?</p>
                <div className="upc-modal-actions">
                  <button className="upc-modal-cancel" onClick={() => setShowLockModal(false)} disabled={loading}>Hủy</button>
                  <button 
                    className="upc-modal-confirm upc-modal-unlock" 
                    onClick={handleToggleLock}
                    disabled={loading}
                  >
                    {loading ? 'Đang xử lý...' : 'Xác nhận mở lại'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="upc-modal-title">Khóa tài khoản</h3>
                <p className="upc-modal-desc">Bạn đang khóa tài khoản <strong>{user.name}</strong> ({user.id}). Vui lòng nhập lý do:</p>
                <textarea
                  className="upc-modal-textarea"
                  placeholder="Nhập lý do khóa tài khoản..."
                  value={lockReason}
                  onChange={e => setLockReason(e.target.value)}
                  rows={4}
                  disabled={loading}
                />
                <div className="upc-modal-actions">
                  <button className="upc-modal-cancel" onClick={() => setShowLockModal(false)} disabled={loading}>Hủy</button>
                  <button 
                    className="upc-modal-confirm" 
                    onClick={handleToggleLock}
                    disabled={loading}
                  >
                    {loading ? 'Đang xử lý...' : 'Xác nhận khóa'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

