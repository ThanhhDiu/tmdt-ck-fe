import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaCircleCheck, FaShieldHalved, FaArrowRight, FaPlus } from 'react-icons/fa6'
import {
  createTechnicianBankAccount,
  createTechnicianWalletWithdraw,
  getTechnicianBankAccounts,
  getTechnicianWalletSummary,
  type TechnicianBankAccount,
} from '../services/walletService'
import './TechnicianWalletWithdrawPage.css'

const bankOptions = ['Vietcombank', 'Techcombank', 'BIDV', 'ACB', 'MB Bank', 'VPBank']
const withdrawFee = 5000

const TechnicianWalletWithdrawPage: React.FC = () => {
  const navigate = useNavigate()
  const [bankAccounts, setBankAccounts] = useState<TechnicianBankAccount[]>([])
  const [selectedBank, setSelectedBank] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isAddBankOpen, setIsAddBankOpen] = useState(false)
  const [newBankName, setNewBankName] = useState(bankOptions[0])
  const [newAccountOwner, setNewAccountOwner] = useState('')
  const [newAccountNumber, setNewAccountNumber] = useState('')
  const [balance, setBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCreatingBank, setIsCreatingBank] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [walletSummary, accounts] = await Promise.all([
          getTechnicianWalletSummary(),
          getTechnicianBankAccounts(),
        ])

        if (!mounted) {
          return
        }

        setBalance(walletSummary.personalBalance)
        setBankAccounts(accounts)
        setSelectedBank((current) => current || accounts.find((account) => account.isDefault)?.id || accounts[0]?.id || '')
      } catch (loadError) {
        if (!mounted) {
          return
        }

        setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu rút tiền')
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [])

  const amountNumber = Number(withdrawAmount.replace(/\D/g, '')) || 0
  const fee = amountNumber > 0 ? withdrawFee : 0
  const remaining = Math.max(balance - amountNumber, 0)

  const handleAddBank = async () => {
    if (!newAccountOwner.trim() || !newAccountNumber.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin ngân hàng')
      return
    }

    setIsCreatingBank(true)
    setError('')

    try {
      const nextBank = await createTechnicianBankAccount({
        bankName: newBankName,
        accountNumber: newAccountNumber.trim(),
        accountOwner: newAccountOwner.trim().toUpperCase(),
      })

      setBankAccounts((current) => [...current, nextBank])
      setSelectedBank(nextBank.id)
      setIsAddBankOpen(false)
      setNewBankName(bankOptions[0])
      setNewAccountOwner('')
      setNewAccountNumber('')
      setSuccessMessage('Đã thêm tài khoản ngân hàng mới')
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Không thể thêm tài khoản ngân hàng')
    } finally {
      setIsCreatingBank(false)
    }
  }

  const handleWithdraw = async () => {
    if (!selectedBank) {
      setError('Vui lòng chọn tài khoản ngân hàng nhận tiền')
      return
    }

    if (amountNumber <= 0) {
      setError('Vui lòng nhập số tiền muốn rút')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccessMessage('')

    try {
      const result = await createTechnicianWalletWithdraw({
        amount: amountNumber,
        bankAccountId: selectedBank,
      })

      setSuccessMessage(`Đã tạo yêu cầu rút tiền ${result.transactionId}`)
      setBalance((current) => Math.max(0, current - result.amount))
      setWithdrawAmount('')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể tạo yêu cầu rút tiền')
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
        </div>
      </header>

      {error ? <div className="withdraw-card"><p>{error}</p></div> : null}
      {successMessage ? <div className="withdraw-card"><p>{successMessage}</p></div> : null}

      <div className="withdraw-layout">
        <section className="withdraw-card">
          <div className="section-head">
            <span>Chọn ngân hàng</span>
            <h2>Tài khoản nhận tiền</h2>
          </div>

          <div className="bank-list">
            {bankAccounts.map((bank) => (
              <button
                key={bank.id}
                type="button"
                className={`bank-item ${selectedBank === bank.id ? 'active' : ''}`}
                onClick={() => setSelectedBank(bank.id)}
              >
                <span className="bank-icon" style={{ backgroundColor: '#1a3b6b' }}>
                  {bank.bankName.charAt(0).toUpperCase()}
                </span>
                <span className="bank-info">
                  <strong>{bank.bankName}</strong>
                  <small>{bank.accountOwner}</small>
                  <small>{bank.accountNumber}</small>
                </span>
                <span className="bank-radio" aria-hidden="true" />
              </button>
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
              <span>Hạn mức khả dụng: <strong>{isLoading ? 'Đang tải...' : `${balance.toLocaleString('vi-VN')}đ`}</strong></span>
              <button type="button" onClick={() => setWithdrawAmount(balance.toString())}>Rút tất cả</button>
            </div>
          </div>

          <div className="support-note">
            <FaShieldHalved />
            <p>Yêu cầu rút tiền được kiểm tra bảo mật trước khi xử lý. Vui lòng xác nhận đúng số tài khoản.</p>
          </div>
        </section>

        <aside className="withdraw-summary">
          <p className="summary-kicker">Tóm tắt giao dịch</p>
          <div className="summary-row">
            <span>Số dư hiện tại</span>
            <strong>{balance.toLocaleString('vi-VN')}đ</strong>
          </div>
          <div className="summary-row">
            <span>Số tiền rút</span>
            <strong>{amountNumber.toLocaleString('vi-VN')}đ</strong>
          </div>
          <div className="summary-row">
            <span>Phí giao dịch</span>
            <strong>{fee.toLocaleString('vi-VN')}đ</strong>
          </div>
          <div className="summary-row final">
            <span>Số dư còn lại</span>
            <strong>{remaining.toLocaleString('vi-VN')}đ</strong>
          </div>

          <button className="withdraw-submit" type="button" onClick={handleWithdraw} disabled={isSubmitting || isLoading}>
            <FaArrowRight />
            {isSubmitting ? 'Đang gửi yêu cầu...' : 'Tạo yêu cầu rút tiền'}
          </button>
          <p className="withdraw-hint">Yêu cầu sẽ được xử lý trong vòng 2 - 4 giờ làm việc.</p>

          <div className="withdraw-help">
            <span>
              <FaCircleCheck /> Hỗ trợ nhanh
            </span>
            <p>Bạn gặp khó khăn khi rút tiền? Hãy liên hệ đội ngũ chăm sóc khách hàng GlowUp.</p>
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
                  placeholder="Nhập tên chủ tài khoản"
                  value={newAccountOwner}
                  onChange={(event) => setNewAccountOwner(event.target.value)}
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
              <button type="button" className="bank-modal-primary" onClick={handleAddBank} disabled={isCreatingBank}>
                {isCreatingBank ? 'Đang thêm...' : 'Thêm ngân hàng'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default TechnicianWalletWithdrawPage
