import React, { useState } from 'react';
import { adjustTechnicianWallet, type AdminCommissionWalletItem } from '../../services/adminCommissionService';
import './WalletAdjustModal.css';

interface WalletAdjustModalProps {
  technician: AdminCommissionWalletItem;
  onClose: () => void;
  /** Called after a successful adjustment so the parent can refresh data. */
  onAdjusted: () => void;
}

type Mode = 'add' | 'subtract';

export const WalletAdjustModal: React.FC<WalletAdjustModalProps> = ({ technician, onClose, onAdjusted }) => {
  const [mode, setMode] = useState<Mode>('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numericAmount = Number(amount || 0);

  const handleSubmit = async () => {
    if (!numericAmount || numericAmount <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ (> 0)');
      return;
    }
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do điều chỉnh');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await adjustTechnicianWallet({
        technicianId: technician.technicianId,
        amount: mode === 'add' ? numericAmount : -numericAmount,
        type: mode === 'add' ? 'admin-credit' : 'admin-debit',
        reason: reason.trim(),
      });
      onAdjusted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể điều chỉnh ví');
      setSubmitting(false);
    }
  };

  return (
    <div className="wam-overlay" onClick={onClose}>
      <div className="wam-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wam-header">
          <h2>Điều chỉnh ví thợ</h2>
          <button className="wam-close" onClick={onClose} aria-label="Đóng">×</button>
        </div>

        <div className="wam-body">
          <div className="wam-tech">
            <strong>{technician.technicianName}</strong>
            <span>{technician.technicianId}</span>
            <span className="wam-balance">Số dư hiện tại: {technician.walletBalanceLabel}</span>
          </div>

          <div className="wam-mode">
            <button
              type="button"
              className={`wam-mode-btn add ${mode === 'add' ? 'active' : ''}`}
              onClick={() => setMode('add')}
            >
              + Cộng tiền
            </button>
            <button
              type="button"
              className={`wam-mode-btn sub ${mode === 'subtract' ? 'active' : ''}`}
              onClick={() => setMode('subtract')}
            >
              − Trừ tiền
            </button>
          </div>

          <label className="wam-label">Số tiền (đ)</label>
          <input
            className="wam-input"
            inputMode="numeric"
            placeholder="VD: 50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
          />

          <label className="wam-label">Lý do</label>
          <textarea
            className="wam-textarea"
            placeholder="VD: Hoàn tiền khiếu nại đơn #GU-..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          {error && <div className="wam-error">{error}</div>}
        </div>

        <div className="wam-footer">
          <button className="wam-btn-cancel" onClick={onClose} disabled={submitting}>Hủy</button>
          <button
            className={`wam-btn-confirm ${mode}`}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Đang xử lý...' : mode === 'add' ? 'Cộng tiền vào ví' : 'Trừ tiền khỏi ví'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletAdjustModal;
