import React, { useEffect, useMemo, useState } from 'react';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { FaArrowUpRightDots, FaEllipsis, FaGear } from 'react-icons/fa6';
import {
  getAdminCommissionSettings,
  getAdminCommissionTransactions,
  getAdminCommissionWallets,
  updateAdminCommission,
  type AdminCommissionTransactionItem,
  type AdminCommissionTransactionType,
  type AdminCommissionWalletItem,
} from '../services/adminCommissionService';
import './AdminFinancePage.css';

type TxType = AdminCommissionTransactionType;
type TechStatus = 'all' | 'normal' | 'low' | 'locked';

const AdminFinancePage: React.FC = () => {
  const [commissionFixed, setCommissionFixed] = useState('10000');
  const [minBalance, setMinBalance] = useState('20000');
  const [autoLockEnabled, setAutoLockEnabled] = useState(false);
  const [commissionUpdatedAt, setCommissionUpdatedAt] = useState('');
  const [commissionUpdatedBy, setCommissionUpdatedBy] = useState('');
  const [wallets, setWallets] = useState<AdminCommissionWalletItem[]>([]);
  const [transactions, setTransactions] = useState<AdminCommissionTransactionItem[]>([]);
  const [txTypeFilter, setTxTypeFilter] = useState<'all' | TxType>('all');
  const [txDateFilter, setTxDateFilter] = useState('');
  const [techFilter, setTechFilter] = useState<TechStatus>('all');
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionLimit] = useState(10);
  const [transactionTotalElements, setTransactionTotalElements] = useState(0);
  const [transactionTotalPages, setTransactionTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadCommissionSettings = async () => {
      try {
        const settings = await getAdminCommissionSettings();

        if (!active) {
          return;
        }

        setCommissionFixed(settings.fixedCommissionFee);
        setMinBalance(settings.minimumCommissionBalance);
        setAutoLockEnabled(settings.autoLockEnabled);
        setCommissionUpdatedAt(settings.updatedAtLabel);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Không thể tải cài đặt hoa hồng');
        }
      }
    };

    void loadCommissionSettings();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadCommissionData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [walletResult, transactionResult] = await Promise.all([
          getAdminCommissionWallets({
            status: techFilter,
            page: 1,
            size: 10,
          }),
          getAdminCommissionTransactions({
            type: txTypeFilter,
            date: txDateFilter,
            page: transactionPage,
            limit: transactionLimit,
          }),
        ]);

        if (!active) {
          return;
        }

        setWallets(walletResult.items);
        setTransactions(transactionResult.items);
        setTransactionTotalElements(transactionResult.totalElements);
        setTransactionTotalPages(transactionResult.totalPages);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu hoa hồng');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadCommissionData();

    return () => {
      active = false;
    };
  }, [techFilter, transactionPage, transactionLimit, txDateFilter, txTypeFilter]);

  const filteredWallets = useMemo(() => {
    if (techFilter === 'all') {
      return wallets;
    }

    return wallets.filter((wallet) => wallet.walletStatus === techFilter);
  }, [techFilter, wallets]);

  const visibleTransactionPages = useMemo(() => {
    if (transactionTotalPages <= 1) {
      return [1];
    }

    const pages = new Set<number>([transactionPage]);

    if (transactionPage > 1) {
      pages.add(transactionPage - 1);
    }

    if (transactionPage < transactionTotalPages) {
      pages.add(transactionPage + 1);
    }

    return Array.from(pages)
      .filter((page) => page >= 1 && page <= transactionTotalPages)
      .sort((left, right) => left - right);
  }, [transactionPage, transactionTotalPages]);

  const handleSaveCommission = async () => {
    setIsSaving(true);
    setError('');

    try {
      const result = await updateAdminCommission({
        fixedCommissionFee: Number(commissionFixed || 0),
        minimumCommissionBalance: Number(minBalance || 0),
      });

      const walletResult = await getAdminCommissionWallets({
        status: techFilter,
        page: 1,
        size: 10,
      });

      setCommissionFixed(result.fixedCommissionFee);
      setMinBalance(result.minimumCommissionBalance);
      setCommissionUpdatedAt(result.updatedAtLabel);
      setCommissionUpdatedBy(result.updatedBy);
      setWallets(walletResult.items);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Không thể lưu cài đặt hoa hồng');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="afp-layout">
      <AdminSidebar activeItem="finance" />
      <main className="afp-main">
        <AdminHeader />

        <section className="afp-title-row">
          <div>
            <h1>Quản lý Ví & Hoa hồng</h1>
            <p>Theo dõi nguồn thu tài chính và duyệt toàn bộ giao dịch thu/rút.</p>
          </div>
        </section>

        {error ? (
          <section className="afp-card afp-alert-card">
            <strong>Không thể tải dữ liệu</strong>
            <p>{error}</p>
          </section>
        ) : null}

        <section className="afp-card-grid">
          <article className="afp-card afp-commission-card">
            <header className="afp-card-head">
              <h2>
                <FaGear />
                Cài đặt phí hoa hồng
              </h2>
              <button type="button" aria-label="Settings">
                <FaEllipsis />
              </button>
            </header>

            <div className="afp-commission-inner">
              <div className="afp-commission-left">
                <label className="afp-label">PHÍ HOA HỒNG CỐ ĐỊNH</label>
                <div className="afp-input-affix">
                  <input
                    value={commissionFixed}
                    onChange={(e) => setCommissionFixed(e.target.value.replace(/\D/g, ''))}
                    inputMode="numeric"
                  />
                  <span>đ</span>
                </div>
                <small className="afp-help">Phí này sẽ được tự động trừ từ ví hoa hồng của thợ khi đơn hàng hoàn thành.</small>
                <div className="afp-commission-meta">
                  Cập nhật lần cuối: {commissionUpdatedAt || '--'}{commissionUpdatedBy ? ` bởi ${commissionUpdatedBy}` : ''}
                </div>
              </div>
              <div className="afp-commission-right">
                <span className={`afp-status-badge ${autoLockEnabled ? 'active' : ''}`}>
                  Tự khóa ví: {autoLockEnabled ? 'Bật' : 'Tắt'}
                </span>
                <button className="afp-primary-btn" type="button" onClick={handleSaveCommission} disabled={isSaving}>
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </article>

          <article className="afp-card afp-rules-card">
            <header className="afp-card-head">
              <h2>
                <FaArrowUpRightDots />
                Cài đặt ví Tín dụng thợ
              </h2>
            </header>

            <div className="afp-rules-body">
              <ul>
                <li>Phí hoa hồng được áp dụng cho tất cả đơn hàng hoàn thành.</li>
                <li>Hệ thống sẽ trừ trước từ ví hoa hồng của thợ.</li>
                <li>Nếu số dư ví hoa hồng không đủ, thợ sẽ bị khóa nhận đơn mới.</li>
              </ul>

              <label className="afp-label">QUY ĐỊNH SỐ DƯ TỐI THIỂU</label>
              <div className="afp-input-affix">
                <input value={minBalance} onChange={(e) => setMinBalance(e.target.value.replace(/\D/g, ''))} inputMode="numeric" />
                <span>đ</span>
              </div>

              <button className="afp-secondary-btn" type="button" onClick={handleSaveCommission} disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : 'Cập nhật'}
              </button>
            </div>
          </article>

          
        </section>

        <section className="afp-tech-status">
          <div className="afp-tech-status-head">
            <h3>Tình trạng ví hoa hồng của thợ</h3>
            <div className="afp-tech-tabs">
              <button type="button" className={techFilter === 'all' ? 'active' : ''} onClick={() => setTechFilter('all')}>Tất cả</button>
              <button type="button" className={techFilter === 'normal' ? 'active' : ''} onClick={() => setTechFilter('normal')}>Bình thường</button>
              <button type="button" className={techFilter === 'low' ? 'active' : ''} onClick={() => setTechFilter('low')}>Sắp hết</button>
              <button type="button" className={techFilter === 'locked' ? 'active' : ''} onClick={() => setTechFilter('locked')}>Đã khóa</button>
            </div>
          </div>

          <div className="afp-tech-list">
            <div className="afp-tech-row afp-tech-head">
              <span>THỢ</span>
              <span>SỐ DƯ VÍ HOA HỒNG</span>
              <span>TRẠNG THÁI</span>
              <span>TỔNG PHÍ ĐÃ TRỪ</span>
              <span>GIAO DỊCH GẦN NHẤT</span>
              <span />
            </div>
            {filteredWallets
              .map((t) => (
                <div className="afp-tech-row" key={t.technicianId}>
                  <span className="afp-tech-name">
                    <div className="afp-avatar small">{t.technicianName.split(' ').map((n) => n[0]).slice(-2).join('')}</div>
                    <div>
                      <strong>{t.technicianName}</strong>
                      <small>{t.technicianId}</small>
                    </div>
                  </span>
                  <span className={t.walletBalance > 0 ? 'afp-amount-in' : 'afp-amount-out'}>{t.walletBalanceLabel}</span>
                  <span className={`afp-td-status ${t.walletStatus}`}>{t.walletStatusLabel}</span>
                  <span>{t.totalCommissionPaidLabel}</span>
                  <span>
                    <strong>{t.lastOrderAtLabel}</strong>
                    <small>{t.locked ? 'Ví đang khóa' : 'Ví đang hoạt động'}</small>
                  </span>
                  <span><button className="afp-more-btn" type="button">...</button></span>
                </div>
              ))}
          </div>
        </section>

        <section className="afp-table-wrap">
          <div className="afp-table-head-row">
            <h3>Lịch sử giao dịch hệ thống</h3>
            <div className="afp-table-filters">
              <select value={txTypeFilter} onChange={(event) => {
                setTxTypeFilter(event.target.value as 'all' | TxType)
                setTransactionPage(1)
              }}>
                <option value="all">Tất cả loại giao dịch</option>
                <option value="commission">Hoa hồng</option>
                <option value="withdraw">Rút tiền</option>
                <option value="topup">Nạp tiền</option>
              </select>
              <input type="date" value={txDateFilter} onChange={(event) => {
                setTxDateFilter(event.target.value)
                setTransactionPage(1)
              }} />
            </div>
          </div>

          <div className="afp-table">
            <div className="afp-table-head">
              <span>Mã giao dịch</span>
              <span>Thời gian</span>
              <span>Đối tác/Người dùng</span>
              <span>Loại</span>
              <span>Số tiền</span>
              <span>Trạng thái</span>
              <span>Thao tác</span>
            </div>

            {isLoading ? (
              <div className="afp-empty-state">Đang tải dữ liệu giao dịch...</div>
            ) : null}

            {!isLoading && transactions.map((item) => (
              <div className="afp-table-row" key={item.id}>
                <span>{item.id}</span>
                <span>
                  <strong>{item.time}</strong>
                  <small>{item.date}</small>
                </span>
                <span>
                  <strong>{item.partnerName}</strong>
                  <small>{item.partnerArea}</small>
                </span>
                <span>
                  <b className={`afp-pill ${item.type}`}>{item.typeLabel}</b>
                </span>
                <span className={item.amount < 0 ? 'afp-amount-out' : 'afp-amount-in'}>{item.amountLabel}</span>
                <span className={`afp-status ${item.status}`}>{item.statusLabel}</span>
                <span>
                  <button className="afp-more-btn" type="button" aria-label="More actions">
                    <FaEllipsis />
                  </button>
                </span>
              </div>
            ))}
          </div>

          <footer className="afp-table-footer">
            <p>Hiển thị {transactions.length} trên tổng số {transactionTotalElements} giao dịch</p>
            <div>
              <button type="button" onClick={() => setTransactionPage((page) => Math.max(1, page - 1))} disabled={transactionPage === 1}>&lt;</button>
              {visibleTransactionPages.map((page) => (
                <button
                  key={page}
                  type="button"
                  className={page === transactionPage ? 'active' : ''}
                  onClick={() => setTransactionPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setTransactionPage((page) => Math.min(transactionTotalPages, page + 1))}
                disabled={transactionPage >= transactionTotalPages}
              >&gt;</button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
};

export default AdminFinancePage;