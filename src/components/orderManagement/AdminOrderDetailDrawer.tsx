import React, { useEffect, useState } from 'react';
import type { OrderDetailViewModel, OrderReportItem, OrderTimelineEntry, OrderWarrantyItem } from '../../services/orderService';
import { OrderStatusBadge } from './OrderStatusBadge';

type DetailTab = 'Thông tin' | 'Lịch sử' | 'Hình ảnh' | 'Điều chỉnh giá' | 'Thanh toán' | 'Báo cáo' | 'Bảo hành';

const DETAIL_TABS: DetailTab[] = ['Thông tin', 'Lịch sử', 'Hình ảnh', 'Điều chỉnh giá', 'Thanh toán', 'Báo cáo', 'Bảo hành'];

type DrawerProps = {
  detail: OrderDetailViewModel | null;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onRetry: () => void;
};

const formatImageGroup = (images: string[]) => {
  return images.length > 0 ? images : ['Không có ảnh'];
};

const renderKvp = (label: string, value: string) => (
  <div key={label}>
    <dt>{label}</dt>
    <dd>{value}</dd>
  </div>
);

const TimelineItem = ({ item }: { item: OrderTimelineEntry }) => (
  <div style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #eef2f7' }}>
    <div style={{ minWidth: 92, fontSize: 12, color: '#64748b' }}>{item.time}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.label}</div>
      <div style={{ fontSize: 12, color: '#475569' }}>{item.note || item.status}</div>
    </div>
  </div>
);

const ReportRow = ({ report }: { report: OrderReportItem }) => (
  <article className="order-detail-card" style={{ marginBottom: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <strong>{report.reason}</strong>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{report.description}</div>
      </div>
      <span className="order-status order-status--gray">{report.status}</span>
    </div>
    <div style={{ marginTop: 10, fontSize: 12, color: '#475569' }}>
      Khách hàng: {report.customerName} | Thợ: {report.technicianName} | {report.createdAt}
    </div>
    <div style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
      Ảnh bằng chứng: {report.evidenceImages.length > 0 ? report.evidenceImages.length : '0'}
    </div>
  </article>
);

const WarrantyPanel = ({ warranty }: { warranty: OrderWarrantyItem | null }) => {
  if (!warranty) {
    return <div className="order-detail-drawer__placeholder">Không có yêu cầu bảo hành nào cho đơn này</div>;
  }

  return (
    <section className="order-detail-card">
      <h4>Bảo hành gần nhất</h4>
      <dl className="order-detail-card__list">
        {renderKvp('Mã bảo hành', warranty.id)}
        {renderKvp('Trạng thái', warranty.status)}
        {renderKvp('Mô tả', warranty.description)}
        {renderKvp('Lịch hẹn', warranty.scheduledAt)}
        {renderKvp('Hạn bảo hành', warranty.warrantyExpiresAt)}
        {renderKvp('Ngày còn lại', `${warranty.remainingDays}`)}
        {renderKvp('Thợ kỹ thuật', warranty.technicianName)}
      </dl>
    </section>
  );
};

const AdminOrderDetailDrawer: React.FC<DrawerProps> = ({ detail, loading = false, error = null, onClose, onRetry }) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('Thông tin');

  useEffect(() => {
    setActiveTab('Thông tin');
  }, [detail?.tableRow.id]);

  const hasSelection = !!detail || loading || !!error;

  const priceAdjustment = detail?.priceAdjustment;

  const beforeImages = formatImageGroup(detail?.images.before || []);
  const completionImages = formatImageGroup(detail?.images.completion || []);
  const evidenceImages = formatImageGroup(detail?.images.evidence || []);

  const renderSkeleton = () => (
    <aside className="order-detail-drawer">
      <div className="order-detail-drawer__header">
        <div style={{ flex: 1 }}>
          <div style={{ height: 22, width: 140, borderRadius: 8, background: '#e2e8f0' }} />
          <div style={{ height: 28, width: 92, borderRadius: 999, background: '#e2e8f0', marginTop: 8 }} />
        </div>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e2e8f0' }} />
      </div>
      <div className="order-detail-drawer__tabs">
        {DETAIL_TABS.map((tab) => (
          <div key={tab} style={{ height: 34, width: 86, borderRadius: 999, background: '#e2e8f0' }} />
        ))}
      </div>
      <div className="order-detail-drawer__body">
        <div className="order-detail-drawer__info-grid">
          {Array.from({ length: 5 }).map((_, index) => (
            <section key={index} className="order-detail-card">
              <div style={{ height: 16, width: 120, borderRadius: 8, background: '#e2e8f0', marginBottom: 12 }} />
              <div style={{ display: 'grid', gap: 10 }}>
                {Array.from({ length: 4 }).map((__, rowIndex) => (
                  <div key={rowIndex} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 12 }}>
                    <div style={{ height: 14, borderRadius: 8, background: '#e2e8f0' }} />
                    <div style={{ height: 14, borderRadius: 8, background: '#e2e8f0', width: '70%' }} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </aside>
  );

  if (!hasSelection) {
    return null;
  }

  if (loading && !detail) {
    return renderSkeleton();
  }

  if (error && !detail) {
    return (
      <aside className="order-detail-drawer">
        <div className="order-detail-drawer__empty">
          <div style={{ color: '#b91c1c', fontWeight: 700, marginBottom: 8 }}>Không thể tải chi tiết đơn hàng</div>
          <div style={{ color: '#475569', marginBottom: 12 }}>{error}</div>
          <button type="button" className="order-detail-drawer__footer-btn order-detail-drawer__footer-btn--primary" onClick={onRetry}>
            Thử lại
          </button>
        </div>
      </aside>
    );
  }

  if (!detail) {
    return null;
  }

  const row = detail.tableRow;
  const basic = detail.order;

  return (
    <aside className="order-detail-drawer">
      <div className="order-detail-drawer__header">
        <div>
          <div className="order-detail-drawer__code">{row.code}</div>
          <div className="order-detail-drawer__status"><OrderStatusBadge status={row.status} /></div>
        </div>
        <button onClick={onClose} className="order-detail-drawer__close" type="button">×</button>
      </div>

      <div className="order-detail-drawer__tabs">
        {DETAIL_TABS.map((tab) => (
          <button key={tab} type="button" className={`order-detail-drawer__tab ${activeTab === tab ? 'is-active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <div className="order-detail-drawer__body">
        {activeTab === 'Thông tin' && (
          <div className="order-detail-drawer__info-grid">
            <section className="order-detail-card">
              <h4>Thông tin cơ bản</h4>
              <dl className="order-detail-card__list">
                {renderKvp('Mã đơn', row.code)}
                {renderKvp('Trạng thái', row.status)}
                {renderKvp('Dịch vụ', row.service)}
                {renderKvp('Danh mục', basic.serviceCategory || '--')}
                {renderKvp('Thiết bị', basic.deviceName || '--')}
              </dl>
            </section>

            <section className="order-detail-card">
              <h4>Khách hàng</h4>
              <dl className="order-detail-card__list">
                {renderKvp('Tên khách hàng', basic.customer?.fullName || '--')}
                {renderKvp('Số điện thoại', basic.customer?.phone || '--')}
                {renderKvp('Địa chỉ', basic.address || '--')}
                {renderKvp('Ghi chú', basic.description || '--')}
              </dl>
            </section>

            <section className="order-detail-card">
              <h4>Thợ kỹ thuật</h4>
              <dl className="order-detail-card__list">
                {renderKvp('Thợ kỹ thuật', basic.technician?.fullName || 'Chưa có thợ')}
                {renderKvp('Số điện thoại', basic.technician?.phone || '--')}
                {renderKvp('Đánh giá', basic.technician?.rating == null ? '--' : `${basic.technician.rating}/5`)}
                {renderKvp('Trạng thái', basic.technician ? 'Đã phân công' : 'Chờ phân công')}
              </dl>
            </section>

            <section className="order-detail-card">
              <h4>Địa chỉ & lịch hẹn</h4>
              <dl className="order-detail-card__list">
                {renderKvp('Địa chỉ', basic.address || '--')}
                {renderKvp('Lịch hẹn', row.appointment)}
                {renderKvp('Bắt đầu', formatStatusDate(detail.order.startedAt))}
                {renderKvp('Hoàn thành', formatStatusDate(detail.order.completedAt))}
              </dl>
            </section>

            <section className="order-detail-card">
              <h4>Giá</h4>
              <dl className="order-detail-card__list">
                {renderKvp('Tạm tính', formatCurrencyLike(detail.order.estimatedPrice))}
                {renderKvp('Giá cuối', formatCurrencyLike(detail.order.finalPrice ?? detail.order.estimatedPrice))}
                {renderKvp('Thanh toán', (basic.paymentMethod || '--').toUpperCase())}
                {renderKvp('Bảo hành', basic.warrantyMonths ? `${basic.warrantyMonths} tháng` : '--')}
              </dl>
            </section>
          </div>
        )}

        {activeTab === 'Lịch sử' && (
          <div>
            {detail.timeline.length > 0
              ? detail.timeline.map((item) => <TimelineItem key={`${item.label}-${item.time}`} item={item} />)
              : <div className="order-detail-drawer__placeholder">Không có dữ liệu lịch sử</div>}
          </div>
        )}

        {activeTab === 'Hình ảnh' && (
          <div className="order-detail-drawer__info-grid">
            <section className="order-detail-card">
              <h4>Before</h4>
              {beforeImages.map((src, index) => (
                <div key={`${src}-${index}`} style={{ marginBottom: 8, wordBreak: 'break-all', color: src === 'Không có ảnh' ? '#64748b' : '#0f172a' }}>{src}</div>
              ))}
            </section>
            <section className="order-detail-card">
              <h4>Completion</h4>
              {completionImages.map((src, index) => (
                <div key={`${src}-${index}`} style={{ marginBottom: 8, wordBreak: 'break-all', color: src === 'Không có ảnh' ? '#64748b' : '#0f172a' }}>{src}</div>
              ))}
            </section>
            <section className="order-detail-card">
              <h4>Evidence</h4>
              {evidenceImages.map((src, index) => (
                <div key={`${src}-${index}`} style={{ marginBottom: 8, wordBreak: 'break-all', color: src === 'Không có ảnh' ? '#64748b' : '#0f172a' }}>{src}</div>
              ))}
            </section>
          </div>
        )}

        {activeTab === 'Điều chỉnh giá' && (
          priceAdjustment ? (
            <div className="order-detail-drawer__info-grid">
              <section className="order-detail-card">
                <h4>Điều chỉnh giá</h4>
                <dl className="order-detail-card__list">
                  {renderKvp('Giá cũ', priceAdjustment.oldPrice)}
                  {renderKvp('Giá mới', priceAdjustment.newPrice)}
                  {renderKvp('Lý do', priceAdjustment.reason)}
                  {renderKvp('Trạng thái', priceAdjustment.status)}
                  {renderKvp('Yêu cầu lúc', priceAdjustment.requestedAt)}
                  {renderKvp('Duyệt lúc', priceAdjustment.approvedAt)}
                  {renderKvp('Từ chối lúc', priceAdjustment.rejectedAt)}
                </dl>
              </section>
              <section className="order-detail-card">
                <h4>Parts</h4>
                {priceAdjustment.parts.length > 0
                  ? priceAdjustment.parts.map((part) => (
                    <div key={`${part.partCode}-${part.name}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid #eef2f7' }}>
                      <div>
                        <strong>{part.name}</strong>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{part.partCode}</div>
                      </div>
                      <div>{part.price}</div>
                    </div>
                  ))
                  : <div className="order-detail-drawer__placeholder">Không có parts</div>}
              </section>
            </div>
          ) : <div className="order-detail-drawer__placeholder">Không có dữ liệu điều chỉnh giá</div>
        )}

        {activeTab === 'Thanh toán' && (
          <section className="order-detail-card">
            <h4>Thanh toán</h4>
            <dl className="order-detail-card__list">
              {renderKvp('Phương thức', (basic.paymentMethod || '--').toUpperCase())}
              {renderKvp('Tạm tính', formatCurrencyLike(detail.order.estimatedPrice))}
              {renderKvp('Giá cuối', formatCurrencyLike(detail.order.finalPrice ?? detail.order.estimatedPrice))}
              {renderKvp('Trạng thái', detail.order.status || '--')}
            </dl>
          </section>
        )}

        {activeTab === 'Báo cáo' && (
          detail.reports.length > 0
            ? detail.reports.map((report) => <ReportRow key={report.id} report={report} />)
            : <div className="order-detail-drawer__placeholder">Không có báo cáo nào cho đơn này</div>
        )}

        {activeTab === 'Bảo hành' && <WarrantyPanel warranty={detail.warranty} />}
      </div>

      <div className="order-detail-drawer__footer">
        <button type="button" className="order-detail-drawer__footer-btn order-detail-drawer__footer-btn--danger">Hủy đơn</button>
        <button type="button" className="order-detail-drawer__footer-btn">Mở tranh chấp</button>
        <button type="button" className="order-detail-drawer__footer-btn order-detail-drawer__footer-btn--primary">Cập nhật trạng thái</button>
      </div>
    </aside>
  );
};

const formatCurrencyLike = (value?: number | null) => {
  if (value == null) return '--';
  return `${value.toLocaleString('vi-VN')}đ`;
};

const formatStatusDate = (value?: string | null) => {
  if (!value) return '--';
  return value;
};

export default AdminOrderDetailDrawer;
