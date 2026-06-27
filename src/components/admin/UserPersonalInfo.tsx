import React, { useState } from 'react';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { updateVerificationRequestStatus } from '../../services/verificationService';
import { updateAdminUserStatus } from '../../services/adminUserService';
import type { VerificationRequest } from '../../types/VerificationRequest';
import './UserPersonalInfo.css';

interface User {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  district?: string;
}

interface Props {
  user?: User;
  isPending?: boolean;
  verificationRequest?: VerificationRequest | null;
  onRefresh?: () => void;
}

export const UserPersonalInfo: React.FC<Props> = ({
  user,
  isPending = false,
  verificationRequest,
  onRefresh,
}) => {
  const [showIdModal, setShowIdModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [verifyAction, setVerifyAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);

  const skills = user?.skills || ['Sửa chữa điện lạnh', 'Lắp đặt máy nước nóng', 'Bảo trì hệ thống VRV', 'Thông tắc ống thoát'];
  const userName = user?.name || 'Nguyễn Văn Hùng';
  const userPhone = user?.phone || '090 •••• ••89';
  const userEmail = user?.email || 'hung.nguyen@glowup.pro';
  const userLocation = user?.district || user?.location || 'Quận 7, TP. Hồ Chí Minh';
  const userBio = user?.bio || 'Hơn 10 năm kinh nghiệm trong lĩnh vực bảo trì điện lạnh công nghiệp và dân dụng tại khu vực HCMC. Luôn đặt uy tín và sự hài lòng của khách hàng lên hàng đầu. Từng công tác tại các tập đoàn bảo trì lớn trước khi gia nhập nền tảng GlowUp.';

  const idImages = verificationRequest
    ? [
        { label: 'CCCD Mặt trước', url: resolveMediaUrl(verificationRequest.documents.idFront) || '' },
        { label: 'CCCD Mặt sau', url: resolveMediaUrl(verificationRequest.documents.idBack) || '' },
        { label: 'Ảnh chân dung', url: resolveMediaUrl(verificationRequest.documents.portrait) || '' },
        ...(verificationRequest.documents.certificate
          ? [{ label: 'Chứng chỉ nghề', url: resolveMediaUrl(verificationRequest.documents.certificate) || '' }]
          : []),
      ]
    : [];

  const openImage = (url: string) => {
    setSelectedImage(url);
    setShowIdModal(true);
  };

  const handleApprove = async () => {
    if (!verificationRequest) return;
    if (!window.confirm('Bạn có chắc chắn muốn phê duyệt hồ sơ xác minh này không?')) return;

    try {
      setLoading(true);
      // 1. Update verification request status
      await updateVerificationRequestStatus(verificationRequest.id, {
        status: 'approved',
        reviewedBy: 'admin',
      });

      // 2. Update user status
      if (user?.id) {
        await updateAdminUserStatus(parseInt(user.id, 10), {
          status: 'active',
        });
      }

      alert('Đã phê duyệt hồ sơ xác minh và kích hoạt tài khoản thợ thành công!');
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Lỗi khi phê duyệt hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!verificationRequest) return;
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }

    try {
      setLoading(true);
      await updateVerificationRequestStatus(verificationRequest.id, {
        status: 'rejected',
        note: rejectReason,
        reviewedBy: 'admin',
      });

      alert('Đã từ chối hồ sơ xác minh thành công!');
      setVerifyAction(null);
      setRejectReason('');
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Lỗi khi từ chối hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="upi-card">
        <h3 className="upi-title">Thông tin chi tiết</h3>
        <div className="upi-grid">
          <div className="upi-field">
            <label className="upi-label">HỌ VÀ TÊN</label>
            <p className="upi-value">{userName}</p>
          </div>
          <div className="upi-field">
            <label className="upi-label">SỐ ĐIỆN THOẠI</label>
            <p className="upi-value">{userPhone}</p>
          </div>
          <div className="upi-field">
            <label className="upi-label">ĐỊA CHỈ EMAIL</label>
            <p className="upi-value">{userEmail}</p>
          </div>
          <div className="upi-field">
            <label className="upi-label">KHU VỰC HOẠT ĐỘNG</label>
            <p className="upi-value">{userLocation}</p>
          </div>
        </div>

        <div className="upi-skills-section">
          <label className="upi-label">KỸ NĂNG CHUYÊN MÔN</label>
          <div className="upi-skills-tags">
            {skills.map((skill: string) => (
              <span key={skill} className="upi-skill-tag">{skill}</span>
            ))}
          </div>
        </div>

        <div className="upi-bio-section">
          <label className="upi-label">GIỚI THIỆU BẢN THÂN</label>
          <p className="upi-bio-text">
            {userBio}
          </p>
        </div>

        {/* ID Verification Section */}
        <div className="upi-verify-section">
          <label className="upi-label">XÁC MINH GIẤY TỜ</label>
          <div className="upi-id-images">
            {idImages.length > 0 ? (
              idImages.map(img => (
                <div key={img.label} className="upi-id-thumb" onClick={() => openImage(img.url)}>
                  <img src={img.url} alt={img.label} />
                  <span className="upi-id-label">{img.label}</span>
                  <div className="upi-id-overlay">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                  </div>
                </div>
              ))
            ) : (
              <p className="upi-no-docs">Không tìm thấy tài liệu xác minh cho tài khoản này.</p>
            )}
          </div>
          {isPending && (
            <div className="upi-verify-actions">
              <button className="upi-btn-approve" onClick={handleApprove} disabled={loading}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                {loading ? 'Đang xử lý...' : 'Phê duyệt'}
              </button>
              <button className="upi-btn-reject" onClick={() => setVerifyAction('reject')} disabled={loading}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                Từ chối
              </button>
            </div>
          )}
          {verifyAction === 'reject' && (
            <div className="upi-reject-reason">
              <textarea
                className="upi-reject-textarea"
                placeholder="Nhập lý do từ chối xác minh..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                disabled={loading}
              />
              <div className="upi-reject-btns">
                <button className="upi-reject-cancel" onClick={() => setVerifyAction(null)} disabled={loading}>Hủy</button>
                <button className="upi-reject-confirm" onClick={handleReject} disabled={loading}>
                  {loading ? 'Đang gửi...' : 'Gửi từ chối'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance Stats */}
      <div className="upi-perf-row">
        <div className="upi-perf-card">
          <div className="upi-perf-info">
            <span className="upi-perf-label">Tỉ lệ hoàn thành</span>
            <span className="upi-perf-value perf-green">98.5%</span>
          </div>
          <div className="upi-perf-bar"><div className="upi-perf-fill perf-fill-green" style={{ width: '98.5%' }}></div></div>
        </div>
        <div className="upi-perf-card">
          <div className="upi-perf-info">
            <span className="upi-perf-label">Hủy đơn (30 ngày)</span>
            <span className="upi-perf-value perf-red">0.2%</span>
          </div>
          <div className="upi-perf-bar"><div className="upi-perf-fill perf-fill-red" style={{ width: '0.2%' }}></div></div>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {showIdModal && (
        <div className="upi-lightbox-overlay" onClick={() => setShowIdModal(false)}>
          <div className="upi-lightbox" onClick={e => e.stopPropagation()}>
            <button className="upi-lightbox-close" onClick={() => setShowIdModal(false)}>×</button>
            <img src={selectedImage} alt="ID Document" className="upi-lightbox-img" />
          </div>
        </div>
      )}
    </>
  );
};

