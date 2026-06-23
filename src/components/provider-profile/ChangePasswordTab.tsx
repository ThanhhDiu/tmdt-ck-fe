import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { userService } from '../../services/userService';
import './ChangePasswordTab.css';

export const ChangePasswordTab: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validate = (): string | null => {
    if (!oldPassword.trim()) return 'Vui lòng nhập mật khẩu cũ';
    if (!newPassword.trim()) return 'Vui lòng nhập mật khẩu mới';
    if (!passwordRegex.test(newPassword)) {
      return 'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)';
    }
    if (newPassword !== confirmPassword) return 'Xác nhận mật khẩu không khớp';
    if (oldPassword === newPassword) return 'Mật khẩu mới phải khác mật khẩu cũ';
    return null;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    try {
      await userService.changePassword(oldPassword, newPassword, confirmPassword);
      setSuccess('Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosErr = err as any;
      const msg =
        axiosErr?.response?.data?.error?.message ||
        axiosErr?.response?.data?.message ||
        'Đổi mật khẩu thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Password strength indicator
  const getStrength = (pw: string): { label: string; color: string; percent: number } => {
    if (!pw) return { label: '', color: 'transparent', percent: 0 };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[@$!%*?&]/.test(pw)) score++;

    if (score <= 2) return { label: 'Yếu', color: '#ef4444', percent: 33 };
    if (score <= 3) return { label: 'Trung bình', color: '#f59e0b', percent: 60 };
    if (score <= 4) return { label: 'Mạnh', color: '#22c55e', percent: 80 };
    return { label: 'Rất mạnh', color: '#10b981', percent: 100 };
  };

  const strength = getStrength(newPassword);

  return (
    <section className="cp-tab-card">
      <div className="cp-tab-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={20} /> Đổi mật khẩu
        </h2>
        <p>Nhập mật khẩu hiện tại để xác minh, sau đó đặt mật khẩu mới cho tài khoản.</p>
      </div>

      <form className="cp-form" onSubmit={onSubmit}>
        {/* Messages */}
        {error && (
          <div className="cp-message cp-message--error" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.18)', marginBottom: '16px' }}>
            <span>⚠️</span>
            {error}
          </div>
        )}
        {success && (
          <div className="cp-message cp-message--success" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', backgroundColor: 'rgba(34, 197, 94, 0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.18)', marginBottom: '16px' }}>
            <ShieldCheck size={18} />
            {success}
          </div>
        )}

        <label className="cp-field">
          <span>Mật khẩu hiện tại *</span>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type={showOld ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              autoComplete="current-password"
              style={{ width: '100%', paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              tabIndex={-1}
              style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
            >
              {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        <label className="cp-field">
          <span>Mật khẩu mới *</span>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
              autoComplete="new-password"
              style={{ width: '100%', paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              tabIndex={-1}
              style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {/* Password strength meter */}
          {newPassword && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <div style={{ flex: 1, height: '6px', borderRadius: '999px', background: 'rgba(110, 111, 115, 0.12)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${strength.percent}%`,
                    background: strength.color,
                    transition: 'width 0.3s ease, background 0.3s ease'
                  }}
                />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, minWidth: '80px', textAlign: 'right', color: strength.color }}>
                {strength.label}
              </span>
            </div>
          )}
        </label>

        <label className="cp-field">
          <span>Xác nhận mật khẩu mới *</span>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              autoComplete="new-password"
              style={{ width: '100%', paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              tabIndex={-1}
              style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <span style={{ display: 'block', marginTop: '6px', fontSize: '13px', color: '#ef4444', fontWeight: 500 }}>
              Mật khẩu không khớp
            </span>
          )}
        </label>

        <button
          className="cp-submit"
          type="submit"
          disabled={isSaving}
          style={{ opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {isSaving ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
        </button>
      </form>
    </section>
  );
};

export default ChangePasswordTab;