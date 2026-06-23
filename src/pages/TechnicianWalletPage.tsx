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
  getTechnicianWalletHistory,
  getTechnicianWalletSummary,
  type TechnicianWalletHistoryItem,
  type TechnicianWalletSummary,
} from '../services/walletService'
import './TechnicianWalletPage.css'

type WalletType = 'all' | 'credit' | 'personal'

type HistoryRow = {
  id: string
  date: string
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

  return `${amount < 0 ? '-' : '+'}${value}đ`
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
  const [summary, setSummary] = useState<TechnicianWalletSummary>(defaultSummary)
  const [historyItems, setHistoryItems] = useState<HistoryRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadWalletData = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [walletSummary, walletHistory] = await Promise.all([
          getTechnicianWalletSummary(),
          getTechnicianWalletHistory(),
        ])

        if (!mounted) {
          return
        }

        setSummary(walletSummary)
        setHistoryItems(walletHistory.map(toHistoryRow))
      } catch (loadError) {
        if (!mounted) {
          return
        }

        setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu ví')
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadWalletData()

    return () => {
      mounted = false
    }
  }, [])

  const totalBalance = summary.creditBalance + summary.personalBalance

  const visibleHistory = useMemo(() => {
    if (activeFilter === 'all') {
      return historyItems
    }

    return historyItems.filter((item) => item.walletType === activeFilter)
  }, [activeFilter, historyItems])

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
              <span className={item.amount > 0 ? 'amount-in' : 'amount-out'}>{formatMoney(item.amount, true)}</span>
              <span>
                <b className={`wallet-status ${item.status}`}>
                  {item.status === 'success' ? 'Thành công' : 'Đang xử lý'}
                </b>
              </span>
            </div>
          ))}

          {!isLoading && visibleHistory.length === 0 ? (
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
            {isLoading ? 'Đang tải lịch sử giao dịch...' : `Đã tải ${historyItems.length} giao dịch gần nhất`}
          </span>
          <button type="button" onClick={() => window.location.reload()}>
            Tải lại <FaArrowRight />
          </button>
        </div>
      </section>
    </div>
  )
}

export default TechnicianWalletPage
