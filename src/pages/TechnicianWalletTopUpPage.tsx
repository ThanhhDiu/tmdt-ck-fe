import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaCircleCheck, FaShieldHalved } from 'react-icons/fa6'
import { createTechnicianWalletTopUp } from '../services/walletService'
import './TechnicianWalletTopUpPage.css'

type AmountId = 'basic' | 'popular' | 'premium' | 'professional'

const quickAmounts: Array<{ id: AmountId; label: string; value: number }> = [
  { id: 'basic', label: 'Cơ bản', value: 100000 },
  { id: 'popular', label: 'Phổ biến', value: 200000 },
  { id: 'premium', label: 'Nâng cao', value: 500000 },
  { id: 'professional', label: 'Chuyên nghiệp', value: 1000000 },
]

const formatMoney = (amount: number) => `${amount.toLocaleString('vi-VN')}đ`

const TechnicianWalletTopUpPage: React.FC = () => {
  const navigate = useNavigate()
  const [selectedAmount, setSelectedAmount] = useState<AmountId>('popular')
  const [customAmount, setCustomAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  const finalAmount = useMemo(() => {
    const parsed = Number(customAmount.replace(/\D/g, ''))
    if (parsed > 0) return parsed

    return quickAmounts.find((item) => item.id === selectedAmount)?.value ?? 0
  }, [customAmount, selectedAmount])

  const handleCreateTopUp = async () => {
    if (finalAmount <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const result = await createTechnicianWalletTopUp(finalAmount)
      if (!result.checkoutUrl) {
        throw new Error('Không nhận được liên kết thanh toán từ hệ thống')
      }

      window.location.href = result.checkoutUrl
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể tạo giao dịch nạp tiền')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="topup-page">
      <header className="topup-header">
        <button className="back-btn" type="button" onClick={() => navigate('/technician/wallet')}>
          <FaArrowLeft />
          Quay lại ví
        </button>
        <div>
          <p className="topup-kicker">Nạp tiền vào ví tín dụng</p>
          <h1>Chọn số tiền và chuyển sang cổng thanh toán</h1>
        </div>
      </header>

      <div className="topup-layout">
        <section className="topup-card topup-amount-card">
          <div className="section-head">
            <span>Bước 1</span>
            <h2>Chọn số tiền</h2>
          </div>

          <div className="amount-option-grid">
            {quickAmounts.map((amount) => (
              <button
                key={amount.id}
                className={`amount-option ${selectedAmount === amount.id ? 'active' : ''}`}
                type="button"
                onClick={() => {
                  setSelectedAmount(amount.id)
                  setCustomAmount('')
                }}
              >
                <small>{amount.label}</small>
                <strong>{formatMoney(amount.value)}</strong>
              </button>
            ))}
          </div>

          <div className="custom-amount-block">
            <label htmlFor="custom-amount">Số tiền khác</label>
            <div className="custom-amount-input">
              <input
                id="custom-amount"
                inputMode="numeric"
                placeholder="Nhập số tiền..."
                value={customAmount}
                onChange={(event) => setCustomAmount(event.target.value.replace(/\D/g, ''))}
              />
              <span>đ</span>
            </div>
          </div>

          <div className="topup-summary">
            <FaShieldHalved />
            <div>
              <strong>Thanh toán an toàn</strong>
              <p>Backend hiện hỗ trợ luồng nạp ví tín dụng qua VNPay và sẽ chuyển bạn sang cổng thanh toán ngay sau khi tạo giao dịch.</p>
            </div>
          </div>
        </section>

        <section className="topup-card topup-methods-card">
          <div className="section-head">
            <span>Bước 2</span>
            <h2>Phương thức thanh toán</h2>
          </div>

          <div className="method-list">
            <article className="method-card active">
              <div className="method-select">
                <div className="method-text">
                  <strong>VNPay</strong>
                  <small>Phương thức đang được backend hỗ trợ cho nạp ví tín dụng</small>
                </div>
                <span className="method-radio" aria-hidden="true" />
              </div>

              <div className="method-content">
                <div className="method-details">
                  <div>
                    <p>Số tiền thanh toán</p>
                    <h3>{formatMoney(finalAmount)}</h3>
                  </div>
                  <div>
                    <p>Ví nhận tiền</p>
                    <h3>Ví tín dụng</h3>
                  </div>
                  <div>
                    <p>Cổng thanh toán</p>
                    <h3>VNPay</h3>
                  </div>
                  <div className="transfer-note">
                    <FaCircleCheck />
                    <span>Bạn sẽ được chuyển tới trang thanh toán của VNPay sau khi xác nhận.</span>
                  </div>
                  {error ? <p className="topup-hint">{error}</p> : null}
                  <div className="method-actions">
                    <button className="confirm-topup-btn" type="button" onClick={handleCreateTopUp} disabled={isSubmitting}>
                      {isSubmitting ? 'Đang tạo giao dịch...' : 'Thanh toán với VNPay'}
                    </button>
                    <p className="topup-hint">* Số tiền tối thiểu backend chấp nhận là 10.000đ.</p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  )
}

export default TechnicianWalletTopUpPage
