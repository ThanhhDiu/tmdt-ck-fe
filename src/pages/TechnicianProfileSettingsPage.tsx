import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { technicianService } from '../services/technician/technicianService';
import { authService } from '../services/auth/authService';

import { uploadService } from '../services/technician/uploadTechnical';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useToast } from '../components/common/Toast';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { ChangePasswordTab } from '../components/provider-profile/ChangePasswordTab';
import {
  BadgeCheck,
  Camera,
  Clock3,
  LogOut,
  MapPinned,
  Save,
  Sparkles,
  Trash2,
  Wrench,
} from 'lucide-react';
import {
  DeleteAccountModal,
  SettingsActionBar,
  SettingsCard,
  SettingsChipPicker,
  SettingsDangerZone,
  SettingsFrame,
  SettingsInsightCard,
  SettingsMain,
  SettingsSwitchRow,
  SettingsTextField,
  SettingsTopline,
  SettingsTextareaField,
} from '../components/settings';

const skillOptions = ['Máy lạnh', 'Máy giặt', 'Tủ lạnh', 'Điện dân dụng', 'Vệ sinh máy lạnh'];
const areaOptions = ['Quận Bình Thạnh', 'Quận 1', 'Quận 3', 'Quận 7', 'TP. Thủ Đức'];

export default function TechnicianProfileSettingsPage() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    bio: '',
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [userCode, setUserCode] = useState<string>('');
  const [verificationStatus, setVerificationStatus] = useState<string>('');

  const navigate = useNavigate();
  const { profile: userProfileContext, setAvatar, updateProfile } = useUserProfile();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // State quản lý trạng thái lưu hồ sơ — tránh double-submit
  const [isSaving, setIsSaving] = useState(false);
  const isLoadedRef = useRef(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/auth/login');
  };

  const resolvedAvatarUrl = resolveMediaUrl(userProfileContext.avatar);
  const displayAvatar = previewUrl || resolvedAvatarUrl || 'https://segayanime.com/wp-content/uploads/2026/01/avatar-fb-mac-dinh-1.jpg';

  // Cleanup object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Lock body scroll when pending verification status is active
  useEffect(() => {
    if (verificationStatus?.toLowerCase() === 'pending') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [verificationStatus]);

  useEffect(() => {
    // Try to get code from context first, then localStorage
    const code = userProfileContext.code || (() => {
      const rawUser = localStorage.getItem('user');
      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          const u = parsed.user || parsed;
          return u.code || '';
        } catch (e) {
          console.error(e);
        }
      }
      return '';
    })();

    if (!code || isLoadedRef.current) return;
    isLoadedRef.current = true;

    setUserCode(code);

    // Call /api/technicians/{code} first to check status
    technicianService.getTechnician(code)
      .then((techRes) => {
        if (techRes) {
          const t = techRes;
          setVerificationStatus(t.verificationStatus || 'none');
          
          if (t.verificationStatus?.toLowerCase() === 'pending') {
            // If pending, do not call /api/auth/me, just exit
            return;
          }

          // If NOT pending, call userService.getMe() to fetch other profile details
          userService.getMe()
            .then((res) => {
              const u = res.data;
              setUserId(u.id?.toString() || '');
              setIsAvailable(t.isAvailable ?? true);
              setSkills(t.skills || []);
              setAreas(t.district ? [t.district] : []);
              setProfile({
                name: u.fullName || '',
                phone: u.phone || '',
                bio: t.bio || '',
              });
            })
            .catch((err) => {
              console.error('Lỗi khi tải thông tin user:', err);
            });
        }
      })
      .catch((err) => {
        console.error('Lỗi khi tải hồ sơ thợ:', err);
      });
  }, [userProfileContext.code]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // ─── Tính năng 2: Upload Avatar ──────────────────────────────────────────
  // Xử lý khi user chọn file ảnh: validate → preview → upload → đồng bộ context
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng file: chỉ cho phép ảnh (.jpg, .png, ...)
    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chọn file ảnh hợp lệ (.jpg, .png).', 'warning');
      return;
    }
    // Giới hạn kích thước file: tối đa 10MB
    if (file.size > 10 * 1024 * 1024) {
      showToast('Ảnh không được vượt quá 10MB.', 'warning');
      return;
    }

    // Tạo URL tạm để hiển thị preview ngay lập tức (UX tốt hơn)
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setIsUploading(true);
    try {
      // Gọi API upload ảnh lên server (Multipart/form-data)
      const res = await uploadService.uploadImage(file);
      if (res.success && res.data?.url) {
        const newAvatarUrl = res.data.url;
        // Cập nhật avatar URL vào database thông qua API user
        if (userId) {
          await userService.updateUserProfile(userId, { avatar: newAvatarUrl });
        }
        // Tính năng 3: Đồng bộ avatar mới vào Global State (UserProfileContext)
        // → Sidebar và Header tự động re-render hiển thị avatar mới
        const newResolved = resolveMediaUrl(newAvatarUrl);
        setAvatar(newResolved);
        updateProfile({ avatar: newResolved });

        // Xóa previewUrl sau khi upload thành công để dùng URL từ server
        URL.revokeObjectURL(objectUrl);
        setPreviewUrl(null);

        showToast('Cập nhật ảnh đại diện thành công!', 'success');
      } else {
        throw new Error(res.message || 'Upload thất bại');
      }
    } catch (error: unknown) {
      console.error('Lỗi upload avatar:', error);
      // Xóa preview khi upload thất bại
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
      // Xử lý lỗi mạng hoặc server
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : 'Tải ảnh lên thất bại. Vui lòng kiểm tra kết nối mạng và thử lại.';
      showToast(errorMessage, 'error');
    } finally {
      setIsUploading(false);
      // Reset input file để cho phép chọn lại cùng file
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ─── Tính năng 4: Lưu thông tin chỉnh sửa hồ sơ thợ ────────────────────
  // Gom toàn bộ thông tin đã chỉnh sửa và gửi API cập nhật
  const handleSave = async () => {
    if (!userId) {
      showToast('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.', 'error');
      return;
    }

    // Validate cơ bản trước khi gửi
    if (!profile.name.trim()) {
      showToast('Tên không được để trống.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      // Bước 1: Cập nhật thông tin cơ bản (Tên, SĐT) qua PATCH /api/users/:id
      await userService.updateUserProfile(userId, {
        fullName: profile.name,
        phone: profile.phone,
      });

      // Đồng bộ thông tin mới vào Global State để Header/Sidebar cập nhật ngay
      updateProfile({
        fullName: profile.name,
        phone: profile.phone,
      });

      // Bước 2: Cập nhật thông tin kỹ thuật viên (Kỹ năng, khu vực) qua PATCH /api/technicians/:code/profile
      if (userCode) {
        await technicianService.updateTechnicianProfile(userCode, {
          skills,
          district: areas[0] || '',
          bio: profile.bio,
        });
      }

      showToast('Lưu thay đổi thành công!', 'success');
    } catch (err: unknown) {
      console.error('Lỗi khi lưu hồ sơ:', err);
      // Phân biệt lỗi mạng và lỗi server để hiển thị thông báo phù hợp
      const errorMessage =
        err instanceof Error && err.message
          ? err.message
          : 'Lưu thay đổi thất bại. Vui lòng kiểm tra kết nối mạng và thử lại.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAvailable = async () => {
    const newState = !isAvailable;
    setIsAvailable(newState);
    if (userCode) {
      try {
        await technicianService.updateTechnicianAvailability(userCode, newState);
        showToast(
          newState ? 'Đã bật nhận đơn. Bạn sẽ nhận được đơn hàng mới.' : 'Đã tạm dừng nhận đơn.',
          'info',
        );
      } catch (err) {
        console.error('Error updating availability', err);
        setIsAvailable(!newState); // Hoàn tác nếu API thất bại (optimistic UI)
        showToast('Cập nhật trạng thái thất bại. Vui lòng thử lại.', 'error');
      }
    }
  };

  const toggleSelection = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setter((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const isPending = verificationStatus?.toLowerCase() === 'pending';

  return (
    <div className="settings-page settings-page--technician" style={{ position: 'relative' }}>
      {!isPending ? (
        <>
          <SettingsFrame as="div" singleColumn className="settings-frame--technician-full">
        <SettingsMain>
          <SettingsTopline
            title="Hồ sơ & kỹ năng"
            subtitle="Bản nâng cấp này bám theo layout technician hiện có, nhưng gom thông tin cá nhân, khu vực phục vụ và trạng thái nhận việc vào cùng một flow chỉnh sửa mượt hơn."
            badge={
              <span className="settings-badge">
                <BadgeCheck size={18} />
                Hồ sơ đạt chuẩn GlowUp
              </span>
            }
          />

          <div style={{ position: 'relative' }}>
            <section className="tech-settings-overview">
            <article className="tech-settings-hero">
              <div className="tech-settings-hero__identity">
                <div className="profile-avatar-wrapper" onClick={handleAvatarClick} title="Nhấp để đổi ảnh đại diện"
                  style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden' }}>
                  <img
                    src={displayAvatar}
                    alt={profile.name}
                    className="tech-settings-hero__avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                  <div className="profile-avatar-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s', color: 'white', borderRadius: '50%', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                    {isUploading ? (
                      <div className="profile-avatar-spinner" />
                    ) : (
                      <Camera size={24} />
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <div className="tech-settings-hero__copy">
                  <span className="tech-settings-hero__eyebrow">Hồ sơ kỹ thuật viên</span>
                  <h2 className="tech-settings-hero__name">{profile.name}</h2>
                  <p className="tech-settings-hero__meta">ID: {userCode || 'TECH-...'} · Đã xác minh bởi GlowUp</p>
                  <div className="tech-settings-hero__chips">
                    <span className={`tech-settings-chip ${isAvailable ? 'is-online' : 'is-offline'}`}>
                      {isAvailable ? 'Đang nhận đơn' : 'Tạm dừng nhận đơn'}
                    </span>
                    <span className="tech-settings-chip">
                      <Wrench size={14} />
                      {skills.length} kỹ năng
                    </span>
                    <span className="tech-settings-chip">
                      <MapPinned size={14} />
                      {areas.length} khu vực
                    </span>
                  </div>
                </div>
              </div>

              <div className="tech-settings-hero__note">
                <div className="tech-settings-hero__note-icon">
                  <Sparkles size={18} />
                </div>
                <div>
                  <strong>Hồ sơ rõ ràng giúp tăng chuyển đổi</strong>
                  <p>
                    Cập nhật đầy đủ mô tả, kỹ năng và vùng phục vụ để khách hàng tin tưởng hơn trước khi đặt dịch vụ.
                  </p>
                </div>
              </div>
            </article>

            <article className="tech-settings-status">
              <div className="tech-settings-status__header">
                <span className="tech-settings-status__eyebrow">Điều phối hiện tại</span>
                <span className={`tech-settings-status__badge ${isAvailable ? 'is-active' : ''}`}>
                  {isAvailable ? 'Online' : 'Offline'}
                </span>
              </div>

              <div className="tech-settings-status__stats">
                <div className="tech-settings-status__item">
                  <span className="tech-settings-status__label">Độ hoàn thiện hồ sơ</span>
                  <strong className="tech-settings-status__value">92%</strong>
                </div>
                <div className="tech-settings-status__item">
                  <span className="tech-settings-status__label">Phản hồi trung bình</span>
                  <strong className="tech-settings-status__value">8 phút</strong>
                </div>
                <div className="tech-settings-status__item">
                  <span className="tech-settings-status__label">Tỉ lệ nhận đơn</span>
                  <strong className="tech-settings-status__value">87%</strong>
                </div>
              </div>
            </article>
          </section>

          <SettingsCard
            title="Hồ sơ kỹ thuật viên"
            subtitle="Cập nhật thông tin công việc và khả năng phục vụ để thuật toán điều phối đơn gợi ý chính xác hơn."
            eyebrow={
              <>
                <Wrench size={18} />
                Khu vực kỹ thuật
              </>
            }
            compactTitle
          >
            <SettingsSwitchRow
              title="Sẵn sàng nhận đơn"
              description="Bật để hệ thống ưu tiên hiển thị bạn trong luồng đề xuất và điều phối đơn gần khu vực."
              checked={isAvailable}
              onToggle={handleToggleAvailable}
            />

            <div className="settings-grid settings-grid--two">
              <SettingsTextField
                label="Tên đầy đủ"
                value={profile.name}
                onChange={(value) => setProfile((current) => ({ ...current, name: value }))}
              />
              <SettingsTextField
                label="Số điện thoại"
                value={profile.phone}
                onChange={(value) => setProfile((current) => ({ ...current, phone: value }))}
              />
              <SettingsChipPicker
                label="Kỹ năng chuyên môn"
                options={skillOptions}
                selected={skills}
                onToggle={(value) => toggleSelection(value, setSkills)}
              />
              <SettingsChipPicker
                label="Khu vực hoạt động"
                options={areaOptions}
                selected={areas}
                onToggle={(value) => toggleSelection(value, setAreas)}
                tone="warm"
              />
              <SettingsTextareaField
                label="Giới thiệu bản thân"
                value={profile.bio}
                onChange={(value) => setProfile((current) => ({ ...current, bio: value }))}
                fullWidth
              />
            </div>

            {/* Tính năng 4: Nút Lưu thay đổi với trạng thái loading */}
            <SettingsActionBar>
              <button
                type="button"
                className="settings-primary-button"
                onClick={handleSave}
                disabled={isSaving}
                style={{ opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
              >
                <Save size={18} />
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </SettingsActionBar>
          </SettingsCard>

          <ChangePasswordTab />

          <SettingsDangerZone
            title="Xóa tài khoản"
            text="Hành động này sẽ xóa vĩnh viễn dữ liệu hồ sơ, lịch sử nhận đơn và cấu hình vận hành. Chỉ dùng khi thật sự cần đóng tài khoản kỹ thuật viên."
            action={
              <button type="button" className="settings-danger-button" onClick={() => setDeleteOpen(true)}>
                <Trash2 size={18} />
                Xóa tài khoản
              </button>
            }
          />

          <SettingsCard title="Đăng xuất khỏi thiết bị" subtitle="Đăng xuất tài khoản của bạn khỏi phiên làm việc hiện tại.">
            <SettingsActionBar>
              <button type="button" className="settings-danger-button" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LogOut size={18} />
                Đăng xuất
              </button>
            </SettingsActionBar>
          </SettingsCard>

          <div className="settings-insights">
            <SettingsInsightCard
              icon={<MapPinned size={22} />}
              title="Khu vực ưu tiên"
              text="Hệ thống sẽ ưu tiên đơn phát sinh trong các quận đã chọn để tăng tốc độ nhận việc và giảm thời gian di chuyển."
            />
            <SettingsInsightCard
              icon={<Clock3 size={22} />}
              title="Nhịp nhận đơn"
              text="Trạng thái sẵn sàng giúp đội điều phối thấy đúng khả năng hiện tại của bạn thay vì phải xác nhận thủ công."
            />
            <SettingsInsightCard
              icon={<BadgeCheck size={22} />}
              title="Độ tin cậy hồ sơ"
              text="Thông tin rõ ràng về kỹ năng và mô tả chuyên môn giúp khách hàng tin tưởng hơn trước khi đặt dịch vụ."
            />
          </div>

          </div>
        </SettingsMain>
          </SettingsFrame>

          <DeleteAccountModal
            open={deleteOpen}
            message="Bạn có chắc chắn muốn xóa tài khoản kỹ thuật viên? Toàn bộ lịch sử nhận đơn và cấu hình hồ sơ sẽ biến mất vĩnh viễn."
            onConfirm={() => setDeleteOpen(false)}
            onCancel={() => setDeleteOpen(false)}
          />
        </>
      ) : (
        <div style={{ height: '80vh' }} />
      )}

      {/* Glassmorphic Overlay for Pending Status */}
      {isPending && (
        <>
          <style>{`
            .pending-overlay {
              position: fixed;
              top: 0;
              left: 240px;
              right: 0;
              bottom: 0;
              z-index: 1000;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background-color: rgba(255, 255, 255, 0.65);
              backdrop-filter: blur(10px);
              padding: 40px;
              text-align: center;
              pointer-events: auto;
            }
            @media (max-width: 900px) {
              .pending-overlay {
                left: 72px;
              }
            }
          `}</style>
          <div className="pending-overlay">
            <div style={{
              backgroundColor: 'white',
              padding: '32px 40px',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(47, 58, 85, 0.1)',
              border: '1px solid #e8e7e1',
              maxWidth: '480px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#fff7e8',
                color: '#a16207',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#2f3a55', margin: 0 }}>
                Hồ sơ đang chờ phê duyệt
              </h3>
              <p style={{ color: '#7a7a7a', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
                Yêu cầu xác minh danh tính của bạn đang được ban quản trị xét duyệt. Trong thời gian này, bạn không thể thay đổi thông tin hồ sơ hành nghề.
              </p>
              <button 
                onClick={() => navigate('/technician/verification')} 
                style={{
                  marginTop: '8px',
                  padding: '10px 24px',
                  backgroundColor: '#aa3bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#932ee2'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#aa3bff'}
              >
                Verify
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
