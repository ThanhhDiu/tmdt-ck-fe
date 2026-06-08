import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaArrowUpRightFromSquare, FaCircleCheck, FaCopy, FaQrcode, FaShieldHalved } from 'react-icons/fa6'
import {
  confirmWalletTopUp,
  createWalletTopUp,
  type WalletPaymentMethod,
  type WalletTopUpResult,
} from '../services/walletService'
import './TechnicianWalletTopUpPage.css'

type AmountId = 'basic' | 'popular' | 'premium' | 'professional'

const quickAmounts: Array<{ id: AmountId; label: string; value: number }> = [
  { id: 'basic', label: 'Cơ bản', value: 100000 },
  { id: 'popular', label: 'Phổ biến', value: 200000 },
  { id: 'premium', label: 'Nâng cao', value: 500000 },
  { id: 'professional', label: 'Chuyên nghiệp', value: 1000000 },
]

const paymentMethods: Array<{
  id: WalletPaymentMethod
  name: string
  description: string
  accent: string
}> = [
  { id: 'momo', name: 'Ví MoMo', description: 'Thanh toán nhanh qua ứng dụng MoMo', accent: '#a21a63' },
  { id: 'zalopay', name: 'ZaloPay', description: 'Ví điện tử ZaloPay an toàn tiện lợi', accent: '#0d8adf' },
  { id: 'vietqr', name: 'Chuyển khoản VietQR', description: 'Chuyển khoản và tự xác nhận sau khi thanh toán', accent: '#1f2d65' },
  { id: 'vnpay', name: 'VNPay', description: 'Thanh toán trực tuyến nhanh chóng', accent: '#c51f28' },
]

const formatMoney = (amount: number) => `${amount.toLocaleString('vi-VN')}đ`

const formatDateTime = (value: string | null) => {
  if (!value) return '--'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const QrFallback: React.FC<{ seed: string }> = ({ seed }) => (
  <div className="qr-card" style={{ ['--qr-accent' as string]: '#1f2d65' } as React.CSSProperties}>
    <div className="qr-grid">
      {Array.from({ length: 144 }, (_, index) => (
        <span
          key={`${seed}-${index}`}
          className={`qr-cell ${(index + seed.length + Math.floor(index / 12)) % 3 === 0 ? 'filled' : ''}`}
        />
      ))}
    </div>
    <div className="qr-caption">
      <FaQrcode />
      <span>Mã QR thanh toán</span>
    </div>
  </div>
)

const TechnicianWalletTopUpPage: React.FC = () => {
  const navigate = useNavigate()
  const [selectedAmount, setSelectedAmount] = useState<AmountId>('popular')
  const [customAmount, setCustomAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<WalletPaymentMethod>('vietqr')
  const [createdTopUp, setCreatedTopUp] = useState<WalletTopUpResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  const finalAmount = useMemo(() => {
    const parsed = Number(customAmount.replace(/\D/g, ''))
    if (parsed > 0) return parsed
    return quickAmounts.find((item) => item.id === selectedAmount)?.value ?? 0
  }, [customAmount, selectedAmount])

  const handleCreateTopUp = async () => {
    setError('')
    setSuccessMessage('')

    if (finalAmount < 10000) {
      setError('Số tiền nạp tối thiểu là 10.000đ')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createWalletTopUp(finalAmount, selectedMethod)
      setCreatedTopUp(result)
      setSuccessMessage('Đã tạo giao dịch nạp vào ví tín dụng. Dùng QR hoặc cổng thanh toán theo phương thức đã chọn.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo giao dịch nạp tiền')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmTopUp = async () => {
    if (!createdTopUp?.transactionId) return

    setError('')
    setSuccessMessage('')
    setIsConfirming(true)

    try {
      const result = await confirmWalletTopUp(createdTopUp.transactionId)
      setCreatedTopUp((current) => (current ? { ...current, status: result.status } : current))
      setSuccessMessage(result.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xác nhận giao dịch nạp tiền')
    } finally {
      setIsConfirming(false)
    }
  }

  const canManualConfirm = createdTopUp?.method !== 'vnpay'

  const handleCopy = async (value: string, message: string) => {
    if (!navigator.clipboard || !value) return
    await navigator.clipboard.writeText(value)
    setSuccessMessage(message)
  }

  return (
    <div className="topup-page">
      <header className="topup-header">
        <button className="back-btn" type="button" onClick={() => navigate('/technician/wallet')}>
          <FaArrowLeft />
          Quay lại ví
        </button>
        <div>
          <p className="topup-kicker">Nạp tiền vào ví</p>
          <h1>Chọn số tiền và phương thức thanh toán</h1>
          {error ? <p className="topup-hint" style={{ color: '#b42318' }}>{error}</p> : null}
          {successMessage ? <p className="topup-hint" style={{ color: '#0f7b6c' }}>{successMessage}</p> : null}
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
              <strong>Nạp vào ví tín dụng</strong>
              <p>Số tiền này chỉ đi vào ví tín dụng để hệ thống khấu trừ chi phí vận hành và phí hoa hồng.</p>
            </div>
          </div>
        </section>

        <section className="topup-card topup-methods-card">
          <div className="section-head">
            <span>Bước 2</span>
            <h2>Phương thức thanh toán</h2>
          </div>

          <div className="method-list">
            {paymentMethods.map((method) => (
              <article
                key={method.id}
                className={`method-card ${selectedMethod === method.id ? 'active' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedMethod(method.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setSelectedMethod(method.id)
                  }
                }}
              >
                <input
                  type="radio"
                  name="topup-method"
                  checked={selectedMethod === method.id}
                  onChange={() => setSelectedMethod(method.id)}
                  style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                />

                <div className="method-select">
                  <div className="method-text">
                    <strong>{method.name}</strong>
                    <small>{method.description}</small>
                  </div>
                  <span className="method-radio" aria-hidden="true" />
                </div>

                <div className="method-content">
                  {selectedMethod === method.id ? (
                    <>
                      {createdTopUp?.paymentInfo?.qrCode || createdTopUp?.qrCodeUrl ? (
                        createdTopUp.qrCodeUrl ? (
                          <div className="qr-card" style={{ ['--qr-accent' as string]: method.accent } as React.CSSProperties}>
                            <img
                              src={createdTopUp.qrCodeUrl}
                              alt="QR thanh toán"
                              style={{ width: '100%', borderRadius: 16, display: 'block' }}
                            />
                            <div className="qr-caption">
                              <FaQrcode />
                              <span>Quét mã để thanh toán</span>
                            </div>
                          </div>
                        ) : (
                          <QrFallback seed={createdTopUp.paymentInfo?.qrCode || method.id} />
                        )
                      ) : (
                        <QrFallback seed={method.id} />
                      )}

                      <div className="method-details">
                        <div>
                          <p>Tên tài khoản</p>
                          <h3>{createdTopUp?.paymentInfo?.accountName || 'GlowUp Service'}</h3>
                        </div>
                        <div>
                          <p>Số tài khoản</p>
                          <h3>
                            {createdTopUp?.paymentInfo?.accountNumber || 'Chưa tạo'}
                            <button
                              type="button"
                              className="copy-btn"
                              aria-label="Sao chép số tài khoản"
                              onClick={() => handleCopy(createdTopUp?.paymentInfo?.accountNumber || '', 'Đã sao chép số tài khoản')}
                            >
                              <FaCopy />
                            </button>
                          </h3>
                        </div>
                        <div>
                          <p>Phương thức</p>
                          <h3>{method.name}</h3>
                        </div>
                        <div className="transfer-note">
                          <FaCircleCheck />
                          <span>
                            Nội dung chuyển khoản: {createdTopUp?.paymentInfo?.transferContent || `${method.id.toUpperCase()} - ${formatMoney(finalAmount)}`}
                          </span>
                        </div>
                        <div>
                          <p>Mã giao dịch</p>
                          <h3>
                            {createdTopUp?.transactionId || 'Chưa tạo'}
                            <button
                              type="button"
                              className="copy-btn"
                              aria-label="Sao chép mã giao dịch"
                              onClick={() => handleCopy(createdTopUp?.transactionId || '', 'Đã sao chép mã giao dịch')}
                            >
                              <FaCopy />
                            </button>
                          </h3>
                        </div>
                        <div>
                          <p>Hạn giao dịch</p>
                          <h3>{formatDateTime(createdTopUp?.expiredAt || null)}</h3>
                        </div>
                        <div className="method-actions">
                          <button className="confirm-topup-btn" type="button" onClick={handleCreateTopUp} disabled={isSubmitting}>
                            {isSubmitting ? 'Đang tạo giao dịch...' : 'Tạo QR nạp tiền'}
                          </button>
                          <button
                            className="confirm-topup-btn"
                            type="button"
                            onClick={() => {
                              if (createdTopUp?.checkoutUrl) {
                                window.open(createdTopUp.checkoutUrl, '_blank', 'noopener,noreferrer')
                              }
                            }}
                            disabled={!createdTopUp?.checkoutUrl}
                            style={{ marginTop: 12 }}
                          >
                            <FaArrowUpRightFromSquare style={{ marginRight: 8 }} />
                            Mở cổng thanh toán
                          </button>
                          <button
                            className="confirm-topup-btn"
                            type="button"
                            onClick={handleConfirmTopUp}
                            disabled={!createdTopUp?.transactionId || isConfirming || !canManualConfirm}
                            style={{ marginTop: 12 }}
                          >
                            {isConfirming ? 'Đang xác nhận...' : 'Xác nhận đã chuyển khoản'}
                          </button>
                          <p className="topup-hint">
                            {canManualConfirm
                              ? '* Sau khi chuyển khoản, bấm xác nhận để gửi yêu cầu kiểm tra giao dịch.'
                              : '* Với VNPay, trạng thái thanh toán sẽ tự cập nhật sau khi giao dịch hoàn tất.'}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="method-compact">
                      <div className="method-compact-left">
                        <strong>{method.name}</strong>
                        <small>{method.description}</small>
                      </div>
                      <div className="method-compact-right">
                        <span className="method-compact-account">{formatMoney(finalAmount)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default TechnicianWalletTopUpPage
