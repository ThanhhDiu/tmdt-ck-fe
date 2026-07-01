import { AlertTriangle } from 'lucide-react';

interface DeleteAccountModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteAccountModal({
  open,
  title = 'Xóa tài khoản',
  message,
  confirmLabel = 'Xóa tài khoản',
  cancelLabel = 'Hủy',
  loading = false,
  error,
  onConfirm,
  onCancel,
}: DeleteAccountModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
      <div className="settings-modal__dialog">
        <div className="settings-modal__icon">
          <AlertTriangle size={28} />
        </div>
        <h2 className="settings-modal__title" id="delete-account-title">
          {title}
        </h2>
        <p className="settings-modal__text">{message}</p>
        {error && <p className="settings-modal__error">{error}</p>}

        <div className="settings-modal__actions">
          <button type="button" className="settings-danger-button" onClick={onConfirm} disabled={loading}>
            {loading ? 'Đang xóa...' : confirmLabel}
          </button>
          <button type="button" className="settings-secondary-button" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
