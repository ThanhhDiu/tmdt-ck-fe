import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { userService } from '../services/userService';
import { uploadService } from '../services/technician/uploadTechnical';
import { useUserProfile } from '../contexts/UserProfileContext';
import { resolveMediaUrl } from '../utils/mediaUrl';
import {
  CustomerAccountDangerZone,
  CustomerAccountProfileCard,
  CustomerSettingsInsights,
  DeleteAccountModal,
  SettingsMain,
} from '../components/settings';
import type { CustomerAccountFormData } from '../components/settings';

function profileToForm(profile: {
  fullName: string;
  phone: string;
  email: string;
  address: string;
}): CustomerAccountFormData {
  return {
    fullName: profile.fullName,
    phone: profile.phone,
    email: profile.email,
    address: profile.address,
  };
}

export default function CustomerAccountSettingsPage() {
  const location = useLocation();
  const { profile, refreshProfile, setAvatar, updateProfile } = useUserProfile();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState<CustomerAccountFormData>(() => profileToForm(profile));
  const [userId, setUserId] = useState<string>(profile.id);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadAccountData = useCallback(async () => {
    setLoading(true);
    try {
      await refreshProfile();
      const res = await userService.getMe();
      const u = res.data;

      setUserId(u.id != null ? String(u.id) : '');
      const resolvedAvatar = resolveMediaUrl(u.avatar);
      setAvatarUrl(resolvedAvatar);
      setForm({
        fullName: u.fullName || '',
        phone: u.phone || '',
        email: u.email || '',
        address: u.address || '',
      });

      updateProfile({
        id: u.id != null ? String(u.id) : '',
        fullName: u.fullName || '',
        phone: u.phone || '',
        email: u.email || '',
        code: u.code || '',
        avatar: resolvedAvatar,
        address: u.address || '',
      });
    } catch (err) {
      console.error('Lỗi khi tải thông tin user:', err);
    } finally {
      setLoading(false);
    }
  }, [refreshProfile, updateProfile]);

  useEffect(() => {
    void loadAccountData();
  }, [location.key, loadAccountData]);

  const updateField = (field: keyof CustomerAccountFormData, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      await userService.updateUserProfile(userId, {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        address: form.address,
      });
      updateProfile({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        address: form.address,
      });
      alert('Cập nhật thông tin thành công!');
    } catch (err) {
      console.error(err);
      alert('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadAvatar = async (file: File) => {
    const res = await uploadService.uploadImage(file);
    if (res.success && res.data?.url) {
      const newAvatarUrl = res.data.url;
      if (userId) {
        await userService.updateUserProfile(userId, { avatar: newAvatarUrl });
      }
      const resolvedAvatar = resolveMediaUrl(newAvatarUrl);
      setAvatarUrl(resolvedAvatar);
      setAvatar(resolvedAvatar);
    } else {
      throw new Error(res.message || 'Upload thất bại');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải thông tin...</div>;
  }

  return (
    <>
      <SettingsMain>
        <CustomerAccountProfileCard
          form={form}
          onFieldChange={updateField}
          onSave={handleSave}
          onUploadAvatar={handleUploadAvatar}
          avatarUrl={avatarUrl}
          isSaving={isSaving}
        />

        <CustomerAccountDangerZone onDelete={() => setDeleteOpen(true)} />

        <CustomerSettingsInsights />
      </SettingsMain>

      <DeleteAccountModal
        open={deleteOpen}
        message="Bạn có chắc chắn? Toàn bộ lịch sử đơn hàng, ví và dữ liệu liên quan sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác."
        onConfirm={() => setDeleteOpen(false)}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
