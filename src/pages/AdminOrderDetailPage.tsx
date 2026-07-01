import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import {
  formatApiDateTime,
  getOrderDetail,
  type OrderDetailViewModel,
} from '../services/orderService';
import './AdminOrderDetailPage.css';

const formatCurrency = (value?: number | null): string => {
  if (value == null) return '--';
  return `${value.toLocaleString('vi-VN')}đ`;
};

const formatText = (value?: string | null): string => {
  const normalized = value?.trim();
  return normalized ? normalized : '--';
};

const statusLabel: Record<string, string> = {
  NEW: 'Mới tạo',
  ASSIGNED: 'Đã phân công',
  SCHEDULED: 'Đã lên lịch',
  IN_PROGRESS: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const normalizeStatus = (status?: string): string => {
  if (!status) return '--';
  const key = status.toUpperCase().replace(/-/g, '_');
  return statusLabel[key] || key;
};

const OrderKvp = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="aod-kvp">
    <dt>{label}</dt>
    <dd>{value}</dd>
  </div>
);

const SectionTitle = ({ title }: { title: string }) => <h3 className="aod-card-title">{title}</h3>;

const ImageList = ({ items }: { items: string[] }) => {
  if (!items.length) {
    return <p className="aod-empty-text">Không có hình ảnh</p>;
  }

  return (
    <div className="aod-images-grid">
      {items.map((src, index) => (
        <a key={`${src}-${index}`} className="aod-image-link" href={src} target="_blank" rel="noreferrer">
          {src}
        </a>
      ))}
    </div>
  );
};

const AdminOrderDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderId = '' } = useParams<{ orderId: string }>();

  const [detail, setDetail] = useState<OrderDetailViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!orderId) {
      setDetail(null);
      setError('Không tìm thấy mã đơn hàng');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getOrderDetail(orderId);
      setDetail(response);
    } catch (err: any) {
      setDetail(null);
      setError(err?.message || 'Không thể tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const basic = detail?.order;

  const serviceLabel = useMemo(() => {
    if (!basic) return '--';
    const parts = [basic.serviceName, basic.subService].filter(Boolean);
    if (parts.length > 0) return parts.join(' - ');
    return formatText(basic.deviceName);
  }, [basic]);

  const timeline = detail?.timeline || [];

  return (
    <div className="aod-layout">
      <AdminSidebar activeItem="orders" />
      <main className="aod-main">
        <AdminHeader />

        <div className="aod-breadcrumbs">
          <button type="button" className="aod-back-btn" onClick={() => navigate('/admin/orders')}>
            ← Quản lý đơn hàng
          </button>
          <span>/</span>
          <span>Chi tiết đơn {orderId || '--'}</span>
        </div>

        <header className="aod-header">
          <div>
            <h1>Chi tiết đơn hàng</h1>
            <p>Theo dõi đầy đủ thông tin đơn hàng, tiến độ và dữ liệu phát sinh.</p>
          </div>
        </header>

        {loading && (
          <div className="aod-notice">Đang tải chi tiết đơn hàng...</div>
        )}

        {!loading && error && (
          <div className="aod-notice aod-notice--error">
            <p>{error}</p>
            <button type="button" onClick={fetchDetail}>Thử lại</button>
          </div>
        )}

        {!loading && !error && detail && basic && (
          <>
            <section className="aod-grid">
              <article className="aod-card">
                <SectionTitle title="Thông tin chung" />
                <dl className="aod-kvp-list">
                  <OrderKvp label="Mã đơn" value={formatText(basic.id)} />
                  <OrderKvp label="Trạng thái" value={normalizeStatus(basic.status)} />
                  <OrderKvp label="Dịch vụ" value={serviceLabel} />
                  <OrderKvp label="Danh mục" value={formatText(basic.serviceCategory)} />
                  <OrderKvp label="Thiết bị" value={formatText(basic.deviceName)} />
                  <OrderKvp label="Mô tả" value={formatText(basic.description)} />
                </dl>
              </article>

              <article className="aod-card">
                <SectionTitle title="Khách hàng và kỹ thuật viên" />
                <dl className="aod-kvp-list">
                  <OrderKvp label="Khách hàng" value={formatText(basic.customer?.fullName)} />
                  <OrderKvp label="SĐT khách hàng" value={formatText(basic.customer?.phone)} />
                  <OrderKvp label="Kỹ thuật viên" value={formatText(basic.technician?.fullName)} />
                  <OrderKvp label="SĐT kỹ thuật viên" value={formatText(basic.technician?.phone)} />
                </dl>
              </article>

              <article className="aod-card">
                <SectionTitle title="Thời gian và địa chỉ" />
                <dl className="aod-kvp-list">
                  <OrderKvp label="Địa chỉ" value={formatText(basic.address)} />
                  <OrderKvp label="Lịch hẹn" value={formatApiDateTime(basic.scheduledAt || basic.expectedTime)} />
                  <OrderKvp label="Bắt đầu" value={formatApiDateTime(basic.startedAt)} />
                  <OrderKvp label="Hoàn thành" value={formatApiDateTime(basic.completedAt)} />
                  <OrderKvp label="Tạo lúc" value={formatApiDateTime(basic.createdAt)} />
                  <OrderKvp label="Cập nhật lúc" value={formatApiDateTime(basic.updatedAt)} />
                </dl>
              </article>

              <article className="aod-card">
                <SectionTitle title="Giá và thanh toán" />
                <dl className="aod-kvp-list">
                  <OrderKvp label="Giá ước tính" value={formatCurrency(basic.estimatedPrice)} />
                  <OrderKvp label="Giá cuối" value={formatCurrency(basic.finalPrice)} />
                  <OrderKvp label="Phương thức" value={formatText(basic.paymentMethod)?.toUpperCase()} />
                  <OrderKvp label="Bảo hành" value={basic.warrantyMonths ? `${basic.warrantyMonths} tháng` : '--'} />
                </dl>
              </article>

              <article className="aod-card">
                <SectionTitle title="Điều chỉnh giá" />
                {detail.priceAdjustment ? (
                  <dl className="aod-kvp-list">
                    <OrderKvp label="Giá cũ" value={detail.priceAdjustment.oldPrice} />
                    <OrderKvp label="Giá mới" value={detail.priceAdjustment.newPrice} />
                    <OrderKvp label="Trạng thái" value={formatText(detail.priceAdjustment.status)} />
                    <OrderKvp label="Lý do" value={formatText(detail.priceAdjustment.reason)} />
                    <OrderKvp label="Yêu cầu lúc" value={formatText(detail.priceAdjustment.requestedAt)} />
                  </dl>
                ) : (
                  <p className="aod-empty-text">Không có điều chỉnh giá</p>
                )}
              </article>

              <article className="aod-card">
                <SectionTitle title="Thông tin hủy" />
                <dl className="aod-kvp-list">
                  <OrderKvp label="Người hủy" value={formatText(basic.cancelledBy)} />
                  <OrderKvp label="Lý do hủy" value={formatText(basic.cancelReason)} />
                  <OrderKvp label="Thời điểm hủy" value={formatApiDateTime(basic.cancelledAt)} />
                </dl>
              </article>
            </section>

            <section className="aod-grid aod-grid--secondary">
              <article className="aod-card">
                <SectionTitle title="Hình ảnh đơn hàng" />
                <ImageList items={basic.images || []} />
              </article>

              <article className="aod-card">
                <SectionTitle title="Lịch sử trạng thái" />
                {timeline.length === 0 ? (
                  <p className="aod-empty-text">Không có lịch sử trạng thái</p>
                ) : (
                  <ul className="aod-timeline">
                    {timeline.map((item) => (
                      <li key={`${item.label}-${item.time}`}>
                        <strong>{item.label}</strong>
                        <span>{item.time}</span>
                        {item.note && <p>{item.note}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </article>

              <article className="aod-card">
                <SectionTitle title="Bảo hành" />
                {detail.warranty ? (
                  <dl className="aod-kvp-list">
                    <OrderKvp label="Mã bảo hành" value={detail.warranty.id} />
                    <OrderKvp label="Trạng thái" value={detail.warranty.status} />
                    <OrderKvp label="Mô tả" value={detail.warranty.description} />
                    <OrderKvp label="Lịch hẹn" value={detail.warranty.scheduledAt} />
                    <OrderKvp label="Hạn bảo hành" value={detail.warranty.warrantyExpiresAt} />
                  </dl>
                ) : (
                  <p className="aod-empty-text">Không có thông tin bảo hành</p>
                )}
              </article>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminOrderDetailPage;
