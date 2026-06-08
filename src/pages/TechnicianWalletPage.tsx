import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaArrowRight,
  FaArrowTrendDown,
  FaArrowTrendUp,
  FaClockRotateLeft,
  FaCreditCard,
  FaMoneyBillTransfer,
  FaShieldHalved,
  FaWallet,
} from 'react-icons/fa6'
import {
  getWalletSummary,
  getWalletTransactions,
  type WalletPocketType,
  type WalletSummary,
  type WalletTransaction,
} from '../services/walletService'
import './TechnicianWalletPage.css'

type WalletFilter = 'all' | WalletPocketType

const formatCurrency = (amount: number) => `${amount.toLocaleString('vi-VN')}đ`
const formatSignedCurrency = (amount: number) => `${amount < 0 ? '-' : '+'}${Math.abs(amount).toLocaleString('vi-VN')}đ`

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

const getStatusLabel = (status: string) => {
  switch (status.toLowerCase()) {
    case 'success':
      return 'Thành công'
    case 'awaiting_payment':
      return 'Chờ thanh toán'
    case 'pending_verification':
      return 'Chờ xác minh'
    case 'failed':
      return 'Thất bại'
    case 'cancelled':
      return 'Đã hủy'
    default:
      return 'Đang xử lý'
  }
}

const getWalletTypeLabel = (type: WalletPocketType) => (type === 'credit' ? 'Ví tín dụng' : 'Ví cá nhân')

const getWalletHealthLabel = (status: string) => {
  switch (status.toLowerCase()) {
    case 'locked':
      return 'Tạm khóa'
    case 'low_balance':
    case 'low':
      return 'Số dư thấp'
    default:
      return 'Hoạt động bình thường'
  }
}

const TechnicianWalletPage: React.FC = () => {
  const navigate = useNavigate()
  const [wallet, setWallet] = useState<WalletSummary | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [activeFilter, setActiveFilter] = useState<WalletFilter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadWallet = async () => {
      setLoading(true)
      setError('')

      try {
        const [walletResult, transactionResult] = await Promise.all([
          getWalletSummary(),
          getWalletTransactions('all', 'all', 1, 20),
        ])

        if (!isMounted) return

        setWallet(walletResult)
        setTransactions(transactionResult.items)
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu ví')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadWallet()

    return () => {
      isMounted = false
    }
  }, [])

  const visibleHistory = useMemo(() => {
    if (activeFilter === 'all') return transactions
    return transactions.filter((item) => item.walletType === activeFilter)
  }, [activeFilter, transactions])

  const filterCounts = useMemo<Record<WalletFilter, number>>(
    () => ({
      all: transactions.length,
      credit: transactions.filter((item) => item.walletType === 'credit').length,
      personal: transactions.filter((item) => item.walletType === 'personal').length,
    }),
    [transactions],
  )

  return (
    <div className="wallet-home">
      <header className="wallet-home-header">
        <div>
          <p className="wallet-home-kicker">GlowUp Service</p>
          <h1>Quản lý 2 ví của kỹ thuật viên</h1>
          <p className="wallet-home-subtitle">
            Tách riêng ví dùng để nạp chi phí vận hành và ví nhận thu nhập rút về ngân hàng.
          </p>
          {wallet?.updatedAt ? (
            <p className="wallet-home-subtitle">Cập nhật lần cuối: {formatDateTime(wallet.updatedAt)}</p>
          ) : null}
          {error ? <p className="wallet-home-subtitle" style={{ color: '#b42318' }}>{error}</p> : null}
        </div>
      </header>

      <section className="wallet-overview-card">
        <div className="wallet-overview-copy">
          <span className="wallet-balance-label">
            <FaWallet /> Tổng số dư đang theo dõi
          </span>
          <strong>{formatCurrency(wallet?.totalBalance || 0)}</strong>
          <p>
            Ví tín dụng dùng để duy trì số dư hoạt động và thanh toán các khoản phí dịch vụ.
            Ví cá nhân là nơi giữ thu nhập khả dụng để rút về ngân hàng.
          </p>
        </div>

        <div className="wallet-overview-points">
          <article>
            <FaShieldHalved />
            <div>
              <strong>Khấu trừ đúng ví</strong>
              <span>Giao dịch vận hành và phí hệ thống chỉ ảnh hưởng ví tín dụng.</span>
            </div>
          </article>
          <article>
            <FaMoneyBillTransfer />
            <div>
              <strong>Rút tiền rõ ràng</strong>
              <span>Chỉ ví cá nhân mới có thể tạo yêu cầu rút tiền.</span>
            </div>
          </article>
        </div>
      </section>

      <section className="wallet-dual-grid">
        <article className="wallet-pocket-card credit">
          <div className="wallet-pocket-head">
            <span className="wallet-pocket-icon">
              <FaCreditCard />
            </span>
            <div>
              <p>Ví tín dụng</p>
              <strong>{formatCurrency(wallet?.creditWallet.balance || 0)}</strong>
            </div>
          </div>

          <ul className="wallet-pocket-list">
            <li>Nạp tiền để duy trì số dư hoạt động trên hệ thống.</li>
            <li>Ví này được dùng cho các khoản phí dịch vụ và vận hành.</li>
            <li>Không dùng để rút tiền về ngân hàng.</li>
          </ul>

          <div className="wallet-pocket-actions">
            <button
              className="wallet-pocket-btn primary"
              onClick={() => navigate('/technician/wallet/topup')}
              type="button"
            >
              <FaArrowTrendUp />
              Nạp vào ví tín dụng
            </button>
          </div>

          <p className="wallet-pocket-note">Trạng thái: {getWalletHealthLabel(wallet?.creditWallet.status || 'normal')}.</p>
        </article>

        <article className="wallet-pocket-card personal">
          <div className="wallet-pocket-head">
            <span className="wallet-pocket-icon">
              <FaWallet />
            </span>
            <div>
              <p>Ví cá nhân</p>
              <strong>{formatCurrency(wallet?.personalWallet.balance || 0)}</strong>
            </div>
          </div>

          <ul className="wallet-pocket-list">
            <li>Nhận tiền đối soát và số dư thu nhập khả dụng.</li>
            <li>Cho phép tạo yêu cầu rút về tài khoản ngân hàng liên kết.</li>
            <li>Tách biệt hoàn toàn với logic khấu trừ đơn tiền mặt.</li>
          </ul>

          <div className="wallet-pocket-actions">
            <button
              className="wallet-pocket-btn primary"
              onClick={() => navigate('/technician/wallet/withdraw')}
              type="button"
            >
              <FaArrowTrendDown />
              Rút từ ví cá nhân
            </button>
          </div>

          <p className="wallet-pocket-note">
            Đang chờ rút: {formatCurrency(wallet?.personalWallet.pendingBalance || 0)}.
          </p>
        </article>
      </section>

      <section className="wallet-rules-grid">
        <article className="wallet-rule-card">
          <h2>Ví tín dụng phục vụ vận hành</h2>
          <p>
            Khi kỹ thuật viên nạp tiền, hệ thống cộng vào ví tín dụng. Số dư này chỉ dành cho các
            khoản phí dịch vụ và các chi phí vận hành trên ứng dụng.
          </p>
        </article>

        <article className="wallet-rule-card">
          <h2>Ví cá nhân phục vụ thanh toán ra ngoài</h2>
          <p>
            Thu nhập sau đối soát được đưa vào ví cá nhân. Người dùng có thể chủ động rút tiền về
            ngân hàng mà không làm ảnh hưởng số dư vận hành.
          </p>
        </article>
      </section>

      <section className="wallet-history-card">
        <div className="wallet-history-header">
          <div>
            <p className="wallet-section-kicker">
              <FaClockRotateLeft /> Lịch sử giao dịch
            </p>
            <h2>{loading ? 'Đang tải giao dịch...' : 'Giao dịch theo từng ví'}</h2>
          </div>

          <div className="wallet-filter-tabs">
            {(['all', 'credit', 'personal'] as WalletFilter[]).map((filter) => (
              <button
                key={filter}
                className={activeFilter === filter ? 'active' : ''}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter === 'all' ? 'Tất cả' : getWalletTypeLabel(filter)}
                <span>{filterCounts[filter]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="wallet-history-table">
          <div className="wallet-history-head">
            <span>Ngày giao dịch</span>
            <span>Nội dung</span>
            <span>Ví</span>
            <span>Số tiền</span>
            <span>Trạng thái</span>
          </div>

          {visibleHistory.map((item) => (
            <div className="wallet-history-row" key={item.id}>
              <span>{formatDateTime(item.createdAt)}</span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.category}</small>
                <em>{item.note || item.relatedOrderCode || item.id}</em>
              </span>
              <span>
                <b className={`wallet-chip ${item.walletType}`}>
                  {getWalletTypeLabel(item.walletType)}
                </b>
              </span>
              <span className={item.amount > 0 ? 'amount-in' : 'amount-out'}>{formatSignedCurrency(item.amount)}</span>
              <span>
                <b className={`wallet-status ${item.status === 'success' ? 'success' : 'pending'}`}>
                  {getStatusLabel(item.status)}
                </b>
              </span>
            </div>
          ))}

          {!loading && visibleHistory.length === 0 ? (
            <div className="wallet-history-row">
              <span>--</span>
              <span>
                <strong>Chưa có giao dịch</strong>
                <small>Dữ liệu trống</small>
                <em>Hệ thống chưa ghi nhận giao dịch theo bộ lọc này.</em>
              </span>
              <span>--</span>
              <span className="amount-in">0đ</span>
              <span>
                <b className="wallet-status pending">Trống</b>
              </span>
            </div>
          ) : null}
        </div>

        <div className="wallet-history-footer">
          <span>Hiển thị {visibleHistory.length} giao dịch gần nhất</span>
          <button type="button" onClick={() => navigate('/technician/wallet/withdraw')}>
            Quản lý rút tiền <FaArrowRight />
          </button>
        </div>
      </section>
    </div>
  )
}

export default TechnicianWalletPage
