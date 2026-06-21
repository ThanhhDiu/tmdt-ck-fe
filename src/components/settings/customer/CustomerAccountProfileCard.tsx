import { BadgeCheck, Save, UploadCloud } from 'lucide-react';
import { SettingsActionBar } from '../actions/SettingsActionBar';
import { SettingsCard } from '../cards/SettingsCard';
import { SettingsTextField } from '../fields/SettingsTextField';
import { SettingsTextareaField } from '../fields/SettingsTextareaField';
import type { CustomerAccountFormData } from './types';
import { useRef } from 'react';

interface CustomerAccountProfileCardProps {
  form: CustomerAccountFormData;
  onFieldChange: (field: keyof CustomerAccountFormData, value: string) => void;
  onSave?: () => void;
  onUploadAvatar?: (file: File) => void;
  avatarUrl?: string | null;
  isSaving?: boolean;
}

export function CustomerAccountProfileCard({
  form,
  onFieldChange,
  onSave,
  onUploadAvatar,
  avatarUrl,
  isSaving
}: CustomerAccountProfileCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadAvatar) {
      onUploadAvatar(file);
    }
    // Reset input value to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  };

  return (
    <SettingsCard
      title="Cài đặt tài khoản"
      subtitle="Quản lý bảo mật và dữ liệu cá nhân để trải nghiệm dịch vụ luôn nhất quán, rõ ràng và an tâm hơn."
      eyebrow={
        <>
          <BadgeCheck size={18} />
          Hồ sơ khách hàng
        </>
      }
      actions={
        <>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
          <button type="button" className="settings-ghost-button" onClick={handleUploadClick}>
            <UploadCloud size={18} />
            Tải ảnh lên
          </button>
        </>
      }
    >
      <div className="settings-grid settings-grid--two">
        <SettingsTextField
          label="Họ tên"
          value={form.fullName}
          onChange={(value) => onFieldChange('fullName', value)}
        />
        <SettingsTextField
          label="Số điện thoại"
          value={form.phone}
          onChange={(value) => onFieldChange('phone', value)}
        />
        <SettingsTextField
          label="Email"
          value={form.email}
          onChange={(value) => onFieldChange('email', value)}
          fullWidth
        />
        <SettingsTextareaField
          label="Địa chỉ mặc định"
          value={form.address}
          onChange={(value) => onFieldChange('address', value)}
          fullWidth
        />
      </div>

      <SettingsActionBar>
        <button 
          type="button" 
          className="settings-primary-button" 
          onClick={onSave}
          disabled={isSaving}
          style={{ opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
        >
          <Save size={18} />
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </SettingsActionBar>
    </SettingsCard>
  );
}
