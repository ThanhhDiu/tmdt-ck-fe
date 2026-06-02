import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaArrowRight, FaCircleCheck, FaPlus, FaShieldHalved, FaTrash } from 'react-icons/fa6'
import {
  createWalletBankAccount,
  createWalletWithdraw,
  deleteWalletBankAccount,
  getWalletBankAccounts,
  getWalletSummary,
  type BankAccount,
} from '../services/walletService'
import './TechnicianWalletWithdrawPage.css'

const bankOptions = ['Vietcombank', 'Techcombank', 'BIDV', 'ACB', 'MB Bank', 'VPBank']

const TechnicianWalletWithdrawPage: React.FC = () => {
  const navigate = useNavigate()
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [selectedBank, setSelectedBank] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isAddBankOpen, setIsAddBankOpen] = useState(false)
  const [newBankName, setNewBankName] = useState(bankOptions[0])
  const [newAccountOwner, setNewAccountOwner] = useState('')
  const [newAccountNumber, setNewAccountNumber] = useState('')
  const [balance, setBalance] = useState(0)
  const [pendingBalance, setPendingBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAddingBank, setIsAddingBank] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [wallet, accounts] = await Promise.all([getWalletSummary(), getWalletBankAccounts()])

        if (!isMounted) return

        setBalance(wallet.personalWallet.balance)
        setPendingBalance(wallet.personalWallet.pendingBalance)
        setBankAccounts(accounts)
        setSelectedBank(accounts.find((item) => item.isDefault)?.id || accounts[0]?.id || '')
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu rút tiền')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const amountNumber = Number(withdrawAmount.replace(/\D/g, '')) || 0
  const fee = amountNumber > 0 ? 5000 : 0
  const remaining = Math.max(balance - amountNumber, 0)
  const netAmount = Math.max(amountNumber - fee, 0)

  const selectedBankAccount = useMemo(
    () => bankAccounts.find((account) => account.id === selectedBank) || null,
    [bankAccounts, selectedBank],
  )

  const handleAddBank = async () => {
    setError('')
    setSuccessMessage('')

    if (!newAccountOwner.trim() || !newAccountNumber.trim()) {
      setError('Vui lòng nhập đủ tên chủ tài khoản và số tài khoản')
      return
    }

    setIsAddingBank(true)
    try {
      const nextBank = await createWalletBankAccount({
        bankName: newBankName,
        accountOwner: newAccountOwner.trim().toUpperCase(),
        accountNumber: newAccountNumber.trim(),
      })

      setBankAccounts((current) => [...current, nextBank])
      setSelectedBank(nextBank.id)
      setIsAddBankOpen(false)
      setNewBankName(bankOptions[0])
      setNewAccountOwner('')
      setNewAccountNumber('')
      setSuccessMessage('Đã thêm tài khoản ngân hàng')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể thêm tài khoản ngân hàng')
    } finally {
      setIsAddingBank(false)
    }
  }

  const handleDeleteBank = async (bankId: string) => {
    setError('')
    setSuccessMessage('')

    try {
      await deleteWalletBankAccount(bankId)
      const nextAccounts = bankAccounts.filter((item) => item.id !== bankId)
      setBankAccounts(nextAccounts)
      setSelectedBank((current) => (current === bankId ? nextAccounts[0]?.id || '' : current))
      setSuccessMessage('Đã xóa tài khoản ngân hàng')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa tài khoản ngân hàng')
    }
  }

  const handleWithdraw = async () => {
    setError('')
    setSuccessMessage('')

    if (!selectedBank) {
      setError('Vui lòng chọn tài khoản ngân hàng nhận tiền')
      return
    }

    if (amountNumber < 50000) {
      setError('Số tiền rút tối thiểu là 50.000đ')
      return
    }

    if (amountNumber <= fee) {
      setError('Số tiền rút phải lớn hơn phí rút')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createWalletWithdraw({
        amount: amountNumber,
        bankAccountId: selectedBank,
      })

      setBalance(result.remainingBalance)
      setPendingBalance((current) => current + result.netAmount)
      setWithdrawAmount('')
      setSuccessMessage(`Đã tạo yêu cầu rút tiền thành công. Số tiền thực nhận là ${result.netAmount.toLocaleString('vi-VN')}đ`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo yêu cầu rút tiền')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="withdraw-page">
      <header className="withdraw-header">
        <button className="back-btn" type="button" onClick={() => navigate('/technician/wallet')}>
          <FaArrowLeft />
          Quay lại ví
        </button>
        <div>
          <p className="withdraw-kicker">Rút tiền về ngân hàng</p>
          <h1>Chuyển số dư ví cá nhân về tài khoản liên kết</h1>
          {error ? <p className="withdraw-hint" style={{ color: '#b42318' }}>{error}</p> : null}
          {successMessage ? <p className="withdraw-hint" style={{ color: '#0f7b6c' }}>{successMessage}</p> : null}
        </div>
      </header>

      <div className="withdraw-layout">
        <section className="withdraw-card">
          <div className="section-head">
            <span>Chọn ngân hàng</span>
            <h2>{isLoading ? 'Đang tải tài khoản...' : 'Tài khoản nhận tiền'}</h2>
          </div>

          <div className="bank-list">
            {bankAccounts.map((bank) => (
              <div key={bank.id} style={{ display: 'grid', gap: 8 }}>
                <button
                  type="button"
                  className={`bank-item ${selectedBank === bank.id ? 'active' : ''}`}
                  onClick={() => setSelectedBank(bank.id)}
                >
                  <span className="bank-icon" style={{ backgroundColor: '#1a3b6b' }}>
                    {bank.bankName.charAt(0).toUpperCase()}
                  </span>
                  <span className="bank-info">
                    <strong>{bank.bankName}{bank.isDefault ? ' • Mặc định' : ''}</strong>
                    <small>{bank.accountOwner}</small>
                    <small>{bank.accountNumber}</small>
                  </span>
                  <span className="bank-radio" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="bank-item bank-item-add"
                  onClick={() => handleDeleteBank(bank.id)}
                  style={{ paddingTop: 12, paddingBottom: 12 }}
                >
                  <span className="bank-icon bank-icon-add" aria-hidden="true">
                    <FaTrash />
                  </span>
                  <span className="bank-info">
                    <strong>Xóa tài khoản này</strong>
                    <small>Một số tài khoản có thể không xóa được nếu đang được sử dụng</small>
                  </span>
                </button>
              </div>
            ))}

            <button type="button" className="bank-item bank-item-add" onClick={() => setIsAddBankOpen(true)}>
              <span className="bank-icon bank-icon-add" aria-hidden="true">
                <FaPlus />
              </span>
              <span className="bank-info">
                <strong>Thêm ngân hàng</strong>
                <small>Liên kết tài khoản mới để rút tiền nhanh hơn</small>
              </span>
            </button>
          </div>

          <div className="amount-block">
            <label htmlFor="withdraw-amount">Số tiền muốn rút</label>
            <div className="amount-input">
              <input
                id="withdraw-amount"
                inputMode="numeric"
                placeholder="0"
                value={withdrawAmount}
                onChange={(event) => setWithdrawAmount(event.target.value.replace(/\D/g, ''))}
              />
              <span>đ</span>
            </div>
            <div className="amount-helpers">
              <span>Hạn mức khả dụng: <strong>{balance.toLocaleString('vi-VN')}đ</strong></span>
              <button type="button" onClick={() => setWithdrawAmount(balance.toString())}>Rút tất cả</button>
            </div>
          </div>

          <div className="support-note">
            <FaShieldHalved />
            <p>Yêu cầu rút tiền chỉ áp dụng cho ví cá nhân. Phí giao dịch cố định là 5.000đ cho mỗi lần rút.</p>
          </div>
        </section>

        <aside className="withdraw-summary">
          <p className="summary-kicker">Tóm tắt giao dịch</p>
          <div className="summary-row">
            <span>Số dư ví cá nhân</span>
            <strong>{balance.toLocaleString('vi-VN')}đ</strong>
          </div>
          <div className="summary-row">
            <span>Đang chờ xử lý</span>
            <strong>{pendingBalance.toLocaleString('vi-VN')}đ</strong>
          </div>
          <div className="summary-row">
            <span>Số tiền rút</span>
            <strong>{amountNumber.toLocaleString('vi-VN')}đ</strong>
          </div>
          <div className="summary-row">
            <span>Phí giao dịch</span>
            <strong>{fee.toLocaleString('vi-VN')}đ</strong>
          </div>
          <div className="summary-row">
            <span>Thực nhận</span>
            <strong>{netAmount.toLocaleString('vi-VN')}đ</strong>
          </div>
          <div className="summary-row final">
            <span>Số dư còn lại</span>
            <strong>{remaining.toLocaleString('vi-VN')}đ</strong>
          </div>

          <button className="withdraw-submit" type="button" onClick={handleWithdraw} disabled={isSubmitting || !selectedBankAccount}>
            <FaArrowRight />
            {isSubmitting ? 'Đang tạo yêu cầu...' : 'Tạo yêu cầu rút tiền'}
          </button>
          <p className="withdraw-hint">Yêu cầu sẽ được xử lý trong vòng 2 - 4 giờ làm việc.</p>

          <div className="withdraw-help">
            <span>
              <FaCircleCheck /> Tài khoản đang chọn
            </span>
            <p>
              {selectedBankAccount
                ? `${selectedBankAccount.bankName} - ${selectedBankAccount.accountNumber}`
                : 'Chưa có tài khoản ngân hàng được chọn.'}
            </p>
          </div>
        </aside>
      </div>

      {isAddBankOpen ? (
        <div className="bank-modal-overlay" role="presentation" onClick={() => setIsAddBankOpen(false)}>
          <div
            className="bank-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-bank-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bank-modal-header">
              <div>
                <p className="summary-kicker">Liên kết tài khoản</p>
                <h2 id="add-bank-title">Thêm ngân hàng</h2>
              </div>
              <button type="button" className="bank-modal-close" onClick={() => setIsAddBankOpen(false)}>
                ×
              </button>
            </div>

            <div className="bank-modal-form">
              <label>
                <span>Ngân hàng</span>
                <select value={newBankName} onChange={(event) => setNewBankName(event.target.value)}>
                  {bankOptions.map((bankName) => (
                    <option key={bankName} value={bankName}>
                      {bankName}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Chủ tài khoản</span>
                <input
                  type="text"
                  placeholder="Nhập tên chủ tài khoản in hoa"
                  value={newAccountOwner}
                  onChange={(event) => setNewAccountOwner(event.target.value.toUpperCase())}
                />
              </label>

              <label>
                <span>Số tài khoản</span>
                <input
                  type="text"
                  placeholder="Nhập số tài khoản"
                  value={newAccountNumber}
                  onChange={(event) => setNewAccountNumber(event.target.value.replace(/\D/g, ''))}
                />
              </label>
            </div>

            <div className="bank-modal-actions">
              <button type="button" className="bank-modal-secondary" onClick={() => setIsAddBankOpen(false)}>
                Hủy
              </button>
              <button type="button" className="bank-modal-primary" onClick={handleAddBank} disabled={isAddingBank}>
                {isAddingBank ? 'Đang thêm...' : 'Thêm ngân hàng'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default TechnicianWalletWithdrawPage
