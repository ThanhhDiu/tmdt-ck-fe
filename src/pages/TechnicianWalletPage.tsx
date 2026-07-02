import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaArrowRight,
  FaArrowTrendDown,
  FaArrowTrendUp,
  FaClockRotateLeft,
  FaCreditCard,
  FaShieldHalved,
  FaWallet,
} from 'react-icons/fa6'
import {
  getTechnicianWalletHistory,
  getTechnicianWalletSummary,
  type TechnicianWalletHistoryItem,
  type TechnicianWalletSummary,
  type WalletTransactionType,
} from '../services/walletService'
import './TechnicianWalletPage.css'

type WalletType = 'all' | 'credit' | 'personal'
type TimeRange = 'all' | '7d' | '30d'

const TYPE_FILTERS: Array<{ id: WalletTransactionType; label: string }> = [
  { id: 'all', label: 'Tất cả loại' },
  { id: 'topup', label: 'Nạp tiền' },
  { id: 'withdraw', label: 'Rút tiền' },
  { id: 'commission', label: 'Hoa hồng / Đơn hàng' },
  { id: 'payment', label: 'Thanh toán' },
]

const TIME_FILTERS: Array<{ id: TimeRange; label: string }> = [
  { id: 'all', label: 'Mọi thời gian' },
  { id: '7d', label: '7 ngày qua' },
  { id: '30d', label: '30 ngày qua' },
]

const PAGE_SIZE = 10

type HistoryRow = {
  id: string
  date: string
  createdAt: string
  title: string
  category: string
  amount: number
  status: 'success' | 'pending'
  walletType: Exclude<WalletType, 'all'>
  note: string
}

const formatMoney = (amount: number, signed: boolean = false) => {
  const value = Math.abs(amount).toLocaleString('vi-VN')
  if (!signed) {
    return `${value}đ`
  }

  return `${amount > 0 ? '-' : '+'}${value}đ`
}

const formatDateLabel = (value: string) => {
  if (!value) {
    return '--'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('vi-VN')
}

const toHistoryRow = (item: TechnicianWalletHistoryItem): HistoryRow => ({
  id: item.id,
  date: formatDateLabel(item.createdAt),
  createdAt: item.createdAt,
  title: item.title,
  category: item.category || item.type,
  amount: item.amount,
  status: item.status,
  walletType: item.walletGroup,
  note: item.note || (item.relatedOrderCode ? `Đơn liên quan: ${item.relatedOrderCode}` : ''),
})

const defaultSummary: TechnicianWalletSummary = {
  userId: '',
  creditBalance: 0,
  personalBalance: 0,
  pendingBalance: 0,
  totalEarned: 0,
  totalWithdrawn: 0,
  currency: 'VND',
  status: 'normal',
  updatedAt: '',
}

const TechnicianWalletPage: React.FC = () => {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<WalletType>('all')
  const [typeFilter, setTypeFilter] = useState<WalletTransactionType>('all')
  const [timeFilter, setTimeFilter] = useState<TimeRange>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [summary, setSummary] = useState<TechnicianWalletSummary>(defaultSummary)
  const [historyItems, setHistoryItems] = useState<HistoryRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const [error, setError] = useState('')

  // Wallet summary — loaded once.
  useEffect(() => {
    let mounted = true

    getTechnicianWalletSummary()
      .then((walletSummary) => {
        if (mounted) setSummary(walletSummary)
      })
      .catch((loadError) => {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu ví')
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  // Transaction history — reloads on type filter / page change (server-side).
  useEffect(() => {
    let mounted = true
    setIsHistoryLoading(true)

    getTechnicianWalletHistory({ type: typeFilter, page, limit: PAGE_SIZE })
      .then((result) => {
        if (!mounted) return
        setHistoryItems(result.items.map(toHistoryRow))
        setTotalPages(Math.max(1, result.totalPages))
      })
      .catch((loadError) => {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'Không thể tải lịch sử giao dịch')
      })
      .finally(() => {
        if (mounted) setIsHistoryLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [typeFilter, page])

  const handleTypeFilter = (next: WalletTransactionType) => {
    setTypeFilter(next)
    setPage(1)
  }

  const withinTimeRange = (value: string): boolean => {
    if (timeFilter === 'all' || !value) return true
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return true
    const days = timeFilter === '7d' ? 7 : 30
    const threshold = Date.now() - days * 24 * 60 * 60 * 1000
    return date.getTime() >= threshold
  }

  const visibleHistory = useMemo(() => {
    return historyItems
      .filter((item) => activeFilter === 'all' || item.walletType === activeFilter)
      .filter((item) => withinTimeRange(item.createdAt))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, timeFilter, historyItems])

  const walletFilterCounts: Record<WalletType, number> = useMemo(() => ({
    all: historyItems.length,
    credit: historyItems.filter((item) => item.walletType === 'credit').length,
    personal: historyItems.filter((item) => item.walletType === 'personal').length,
  }), [historyItems])

  return (
    <div className="wallet-home">
      <header className="wallet-home-header">
        <div>
          <p className="wallet-home-kicker">GlowUp Service</p>
          <h1>Quản lý 2 ví của kỹ thuật viên</h1>
          <p className="wallet-home-subtitle">
            Tách riêng ví dùng để duy trì hoạt động trên hệ thống và ví nhận thu nhập để rút về ngân hàng.
          </p>
        </div>
      </header>

      {error ? <div className="wallet-overview-card"><p>{error}</p></div> : null}

      <section className="wallet-overview-card">
        <div className="wallet-overview-copy">
          <span className="wallet-balance-label">
            <FaWallet /> Tổng số dư đang theo dõi
          </span>
          <strong>{isLoading ? 'Đang tải...' : formatMoney(summary.personalBalance)}</strong>
          <p>
            Ví tín dụng dùng để duy trì số dư hoạt động và tự động trừ phí dịch vụ. Ví cá nhân là nơi nhận thu nhập để rút về ngân hàng.
          </p>
        </div>

        <div className="wallet-overview-points">
          <article>
            <FaShieldHalved />
            <div>
              <strong>Trạng thái ví tín dụng</strong>
              <span>
                {summary.status === 'locked'
                  ? 'Đang bị khóa nhận đơn do không đủ ngưỡng.'
                  : summary.status === 'low_balance'
                    ? 'Số dư đang thấp hơn mức an toàn.'
                    : 'Đang đủ điều kiện hoạt động.'}
              </span>
            </div>
          </article>
          <article>
            <FaWallet />
            <div>
              <strong>Tiền có thể rút</strong>
              <span>{formatMoney(summary.personalBalance)} sẵn sàng rút về tài khoản liên kết.</span>
            </div>
          </article>
        </div>
      </section>

      <section className="wallet-metrics-grid">
        <article className="wallet-metric-card">
          <span className="wallet-metric-label"><FaWallet /> Số dư khả dụng</span>
          <strong>{isLoading ? '...' : formatMoney(summary.personalBalance)}</strong>
        </article>
        <article className="wallet-metric-card">
          <span className="wallet-metric-label"><FaClockRotateLeft /> Đang chờ xử lý</span>
          <strong>{isLoading ? '...' : formatMoney(summary.pendingBalance)}</strong>
        </article>
        <article className="wallet-metric-card">
          <span className="wallet-metric-label"><FaArrowTrendUp /> Tổng thu nhập</span>
          <strong>{isLoading ? '...' : formatMoney(summary.totalEarned)}</strong>
        </article>
        <article className="wallet-metric-card">
          <span className="wallet-metric-label"><FaArrowTrendDown /> Tổng đã rút</span>
          <strong>{isLoading ? '...' : formatMoney(summary.totalWithdrawn)}</strong>
        </article>
      </section>

      <section className="wallet-dual-grid">
        <article className="wallet-pocket-card credit">
          <div className="wallet-pocket-head">
            <span className="wallet-pocket-icon">
              <FaCreditCard />
            </span>
            <div>
              <p>Ví tín dụng</p>
              <strong>{formatMoney(summary.creditBalance)}</strong>
            </div>
          </div>

          <ul className="wallet-pocket-list">
            <li>Nạp tiền để duy trì số dư hoạt động trên hệ thống.</li>
            <li>Phí dịch vụ sẽ được tự động trừ sau mỗi đơn hoàn thành.</li>
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

          <p className="wallet-pocket-note">Ví này chỉ dùng cho chi phí hoạt động trên hệ thống.</p>
        </article>

        <article className="wallet-pocket-card personal">
          <div className="wallet-pocket-head">
            <span className="wallet-pocket-icon">
              <FaWallet />
            </span>
            <div>
              <p>Ví cá nhân</p>
              <strong>{formatMoney(summary.personalBalance)}</strong>
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

          <p className="wallet-pocket-note">Số dư ví cá nhân có thể dùng để rút về tài khoản ngân hàng đã liên kết.</p>
        </article>
      </section>

      <section className="wallet-history-card">
        <div className="wallet-history-header">
          <div>
            <p className="wallet-section-kicker">
              <FaClockRotateLeft /> Lịch sử giao dịch
            </p>
            <h2>Giao dịch theo từng ví</h2>
          </div>

          <div className="wallet-filter-tabs">
            {(['all', 'credit', 'personal'] as WalletType[]).map((filter) => (
              <button
                key={filter}
                className={activeFilter === filter ? 'active' : ''}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter === 'all'
                  ? 'Tất cả'
                  : filter === 'credit'
                    ? 'Ví tín dụng'
                    : 'Ví cá nhân'}
                <span>{walletFilterCounts[filter]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="wallet-history-filters">
          <div className="wallet-type-filters">
            {TYPE_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={typeFilter === item.id ? 'active' : ''}
                onClick={() => handleTypeFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <label className="wallet-time-filter">
            Thời gian:
            <select value={timeFilter} onChange={(event) => setTimeFilter(event.target.value as TimeRange)}>
              {TIME_FILTERS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
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
              <span>{item.date}</span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.category}</small>
                <em>{item.note || 'Giao dịch ví'}</em>
              </span>
              <span>
                <b className={`wallet-chip ${item.walletType}`}>
                  {item.walletType === 'credit' ? 'Ví tín dụng' : 'Ví cá nhân'}
                </b>
              </span>
              <span className={item.amount < 0 ? 'amount-in' : 'amount-out'}>{formatMoney(item.amount, true)}</span>
              <span>
                <b className={`wallet-status ${item.status}`}>
                  {item.status === 'success' ? 'Thành công' : 'Đang xử lý'}
                </b>
              </span>
            </div>
          ))}

          {isHistoryLoading ? (
            <div className="wallet-history-row">
              <span>--</span>
              <span><strong>Đang tải lịch sử giao dịch...</strong><small /><em /></span>
              <span>--</span>
              <span>--</span>
              <span>--</span>
            </div>
          ) : null}

          {!isHistoryLoading && visibleHistory.length === 0 ? (
            <div className="wallet-history-row">
              <span>--</span>
              <span>
                <strong>Chưa có giao dịch</strong>
                <small>Lịch sử sẽ hiển thị sau khi phát sinh nạp tiền, hoàn thành đơn hoặc rút tiền.</small>
                <em />
              </span>
              <span>--</span>
              <span>0đ</span>
              <span>--</span>
            </div>
          ) : null}
        </div>

        <div className="wallet-history-footer">
          <span>
            {isHistoryLoading ? 'Đang tải lịch sử giao dịch...' : `Trang ${page} / ${totalPages}`}
          </span>
          <div className="wallet-pagination">
            <button
              type="button"
              disabled={page <= 1 || isHistoryLoading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Trang trước
            </button>
            <button
              type="button"
              disabled={page >= totalPages || isHistoryLoading}
              onClick={() => setPage((current) => current + 1)}
            >
              Trang sau <FaArrowRight />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TechnicianWalletPage
