import { API_URL, fetchWithAuth } from './auth';

export type OrderStatusApi = 'new' | 'assigned' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
export type OrderStatusUi = 'NEW' | 'ASSIGNED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code?: string;
    message?: string;
  };
}

interface PagedResponseApi<T> {
  items: T[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
}

interface ApiOrderPartySummary {
  id: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  rating?: number | null;
}

interface ApiOrderPriceAdjustmentPart {
  name: string;
  price: number;
  partCode?: string;
}

interface ApiOrderPriceAdjustment {
  originalPrice?: number;
  newPrice?: number;
  reason?: string;
  status?: string;
  parts?: ApiOrderPriceAdjustmentPart[];
  requestedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
}

interface ApiOrderResponse {
  id: string;
  status?: string;
  serviceName?: string;
  subService?: string;
  serviceCategory?: string;
  deviceName?: string;
  description?: string;
  address?: string;
  scheduledAt?: string;
  expectedTime?: string;
  startedAt?: string;
  completedAt?: string;
  estimatedPrice?: number;
  finalPrice?: number;
  paymentMethod?: string;
  warrantyMonths?: number;
  customer?: ApiOrderPartySummary | null;
  technician?: ApiOrderPartySummary | null;
  priceAdjustment?: ApiOrderPriceAdjustment | null;
  images?: string[] | null;
  cancelledBy?: string;
  cancelReason?: string;
  cancelledAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiReportPartyRef {
  id?: string;
  fullName?: string;
}

interface ApiReportResponse {
  id: string;
  orderId?: string;
  reason?: string;
  description?: string;
  status?: string;
  evidenceImages?: string[] | null;
  customer?: ApiReportPartyRef | null;
  technician?: ApiReportPartyRef | null;
  createdAt?: string;
}

interface ApiWarrantyResponse {
  id: string;
  orderId?: string;
  status?: string;
  description?: string;
  images?: string[] | null;
  scheduledAt?: string;
  warrantyExpiresAt?: string;
  remainingDays?: number;
  technician?: ApiOrderPartySummary | null;
  createdAt?: string;
}

export interface OrderTableRow {
  id: string;
  code: string;
  customer: string;
  service: string;
  technician: string;
  status: OrderStatusUi;
  price: string;
  appointment: string;
  createdAt: string;
  area?: string;
  payment?: string;
  rawCreatedAt?: string;
  rawScheduledAt?: string;
  rawPrice?: number;
  rawTechnician?: string;
  rawArea?: string;
  rawPaymentMethod?: string;
}

export interface OrderStatsSummary {
  totalOrders: number;
  processing: number;
  completed: number;
  cancelled: number;
  disputes: number;
  pendingPriceReview: number;
}

export interface OrderTimelineEntry {
  label: string;
  status: string;
  time: string;
  note?: string;
}

export interface OrderReportItem {
  id: string;
  orderId?: string;
  reason: string;
  description: string;
  status: string;
  evidenceImages: string[];
  customerName: string;
  technicianName: string;
  createdAt: string;
}

export interface OrderWarrantyItem {
  id: string;
  orderId?: string;
  status: string;
  description: string;
  images: string[];
  scheduledAt: string;
  warrantyExpiresAt: string;
  remainingDays: number;
  technicianName: string;
  createdAt: string;
}

export interface OrderDetailViewModel {
  order: ApiOrderResponse;
  tableRow: OrderTableRow;
  timeline: OrderTimelineEntry[];
  priceAdjustment: {
    oldPrice: string;
    newPrice: string;
    reason: string;
    parts: Array<{ name: string; price: string; partCode: string }>;
    status: string;
    requestedAt: string;
    approvedAt: string;
    rejectedAt: string;
  } | null;
  images: {
    before: string[];
    completion: string[];
    evidence: string[];
  };
  reports: OrderReportItem[];
  warranty: OrderWarrantyItem | null;
}

export interface OrderListFilters {
  status?: OrderStatusUi | 'TẤT CẢ';
  keyword?: string;
  page?: number;
  limit?: number;
}

interface OrderListResult {
  items: OrderTableRow[];
  totalElements: number;
}

const DEFAULT_LIMIT = 1000;

const requestApi = async <T>(path: string): Promise<T> => {
  const response = await fetchWithAuth(`${API_URL}${path}`, { method: 'GET' });
  const payload: ApiResponse<T> = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message || 'Không thể tải dữ liệu đơn hàng');
  }

  return payload.data;
};

const requestOptionalApi = async <T>(path: string): Promise<T | null> => {
  const response = await fetchWithAuth(`${API_URL}${path}`, { method: 'GET' });

  if (response.status === 404) {
    return null;
  }

  const payload: ApiResponse<T> = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message || 'Không thể tải dữ liệu đơn hàng');
  }

  return payload.data;
};

const toApiStatus = (status?: OrderStatusUi): OrderStatusApi | undefined => {
  if (!status || status === 'TẤT CẢ') {
    return undefined;
  }

  return status.toLowerCase().replace('_', '-') as OrderStatusApi;
};

const toUiStatus = (status?: string): OrderStatusUi => {
  const normalized = (status || '').toLowerCase().replace(/-/g, '_');

  switch (normalized) {
    case 'new':
      return 'NEW';
    case 'assigned':
      return 'ASSIGNED';
    case 'scheduled':
      return 'SCHEDULED';
    case 'in_progress':
      return 'IN_PROGRESS';
    case 'completed':
      return 'COMPLETED';
    case 'cancelled':
      return 'CANCELLED';
    default:
      return 'NEW';
  }
};

const formatCurrency = (value?: number | null): string => {
  const numberValue = Number(value || 0);
  return `${numberValue.toLocaleString('vi-VN')}đ`;
};

const formatDateTime = (value?: string | null): string => {
  if (!value) return '--';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatDateOnly = (value?: string | null): string => {
  if (!value) return '--';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('vi-VN');
};

const mapOrderToRow = (order: ApiOrderResponse): OrderTableRow => {
  const service = [order.serviceName, order.subService].filter(Boolean).join(' - ');
  const scheduledAt = order.scheduledAt || order.expectedTime;
  const price = order.finalPrice ?? order.estimatedPrice ?? 0;

  return {
    id: order.id,
    code: order.id,
    customer: order.customer?.fullName || 'N/A',
    service: service || order.deviceName || 'N/A',
    technician: order.technician?.fullName || 'Chưa có thợ',
    status: toUiStatus(order.status),
    price: formatCurrency(price),
    appointment: formatDateTime(scheduledAt),
    createdAt: formatDateTime(order.createdAt),
    area: order.address || undefined,
    payment: order.paymentMethod ? order.paymentMethod.toUpperCase() : undefined,
    rawCreatedAt: order.createdAt,
    rawScheduledAt: scheduledAt,
    rawPrice: price,
    rawTechnician: order.technician?.fullName || undefined,
    rawArea: order.address || undefined,
    rawPaymentMethod: order.paymentMethod || undefined,
  };
};

const mapReports = (reports: ApiReportResponse[]): OrderReportItem[] => {
  return reports.map((report) => ({
    id: report.id,
    orderId: report.orderId,
    reason: report.reason || '--',
    description: report.description || '--',
    status: report.status || '--',
    evidenceImages: report.evidenceImages || [],
    customerName: report.customer?.fullName || '--',
    technicianName: report.technician?.fullName || '--',
    createdAt: formatDateTime(report.createdAt),
  }));
};

const mapWarranty = (warranty: ApiWarrantyResponse | null): OrderWarrantyItem | null => {
  if (!warranty) return null;

  return {
    id: warranty.id,
    orderId: warranty.orderId,
    status: warranty.status || '--',
    description: warranty.description || '--',
    images: warranty.images || [],
    scheduledAt: formatDateTime(warranty.scheduledAt),
    warrantyExpiresAt: formatDateTime(warranty.warrantyExpiresAt),
    remainingDays: warranty.remainingDays ?? 0,
    technicianName: warranty.technician?.fullName || '--',
    createdAt: formatDateTime(warranty.createdAt),
  };
};

const mapPriceAdjustment = (order: ApiOrderResponse) => {
  const adjustment = order.priceAdjustment;

  if (!adjustment) {
    return null;
  }

  return {
    oldPrice: formatCurrency(adjustment.originalPrice ?? order.estimatedPrice ?? 0),
    newPrice: formatCurrency(adjustment.newPrice ?? order.finalPrice ?? order.estimatedPrice ?? 0),
    reason: adjustment.reason || '--',
    status: adjustment.status || '--',
    parts: (adjustment.parts || []).map((part) => ({
      name: part.name,
      price: formatCurrency(part.price),
      partCode: part.partCode || '--',
    })),
    requestedAt: formatDateTime(adjustment.requestedAt),
    approvedAt: formatDateTime(adjustment.approvedAt),
    rejectedAt: formatDateTime(adjustment.rejectedAt),
  };
};

const mapTimeline = (order: ApiOrderResponse): OrderTimelineEntry[] => {
  const items: OrderTimelineEntry[] = [];

  if (order.createdAt) {
    items.push({
      label: 'Đơn hàng được tạo',
      status: 'NEW',
      time: formatDateTime(order.createdAt),
    });
  }

  if (order.scheduledAt) {
    items.push({
      label: 'Lên lịch hẹn',
      status: 'SCHEDULED',
      time: formatDateTime(order.scheduledAt),
    });
  }

  if (order.startedAt) {
    items.push({
      label: 'Bắt đầu xử lý',
      status: 'IN_PROGRESS',
      time: formatDateTime(order.startedAt),
    });
  }

  if (order.completedAt) {
    items.push({
      label: 'Hoàn thành đơn',
      status: 'COMPLETED',
      time: formatDateTime(order.completedAt),
    });
  }

  if (order.cancelledAt) {
    items.push({
      label: 'Hủy đơn',
      status: 'CANCELLED',
      time: formatDateTime(order.cancelledAt),
      note: order.cancelReason || undefined,
    });
  }

  if (order.priceAdjustment?.requestedAt) {
    items.push({
      label: 'Yêu cầu điều chỉnh giá',
      status: 'IN_PROGRESS',
      time: formatDateTime(order.priceAdjustment.requestedAt),
      note: order.priceAdjustment.reason || undefined,
    });
  }

  if (order.priceAdjustment?.approvedAt) {
    items.push({
      label: 'Duyệt điều chỉnh giá',
      status: 'COMPLETED',
      time: formatDateTime(order.priceAdjustment.approvedAt),
    });
  }

  if (order.priceAdjustment?.rejectedAt) {
    items.push({
      label: 'Từ chối điều chỉnh giá',
      status: 'CANCELLED',
      time: formatDateTime(order.priceAdjustment.rejectedAt),
    });
  }

  return items;
};

const fetchReportList = async (orderCode: string): Promise<OrderReportItem[]> => {
  const query = new URLSearchParams({ page: '1', limit: '1000', keyword: orderCode });
  const payload = await requestApi<PagedResponseApi<ApiReportResponse>>(`/reports?${query.toString()}`);

  return mapReports(payload.items || []).filter((item) => item.orderId === orderCode);
};

const fetchWarranty = async (orderCode: string): Promise<OrderWarrantyItem | null> => {
  const payload = await requestOptionalApi<ApiWarrantyResponse>(`/orders/${orderCode}/warranty`);
  return mapWarranty(payload);
};

export const getAdminOrders = async (filters: OrderListFilters = {}): Promise<OrderListResult> => {
  const query = new URLSearchParams();

  if (filters.status && filters.status !== 'TẤT CẢ') {
    query.set('status', toApiStatus(filters.status) || '');
  }

  if (filters.keyword?.trim()) {
    query.set('keyword', filters.keyword.trim());
  }

  query.set('page', String(filters.page || 1));
  query.set('limit', String(filters.limit || DEFAULT_LIMIT));

  const payload = await requestApi<PagedResponseApi<ApiOrderResponse>>(`/orders?${query.toString()}`);

  return {
    items: (payload.items || []).map(mapOrderToRow),
    totalElements: payload.totalElements || 0,
  };
};

export const getOrderStats = async (): Promise<OrderStatsSummary> => {
  const countByStatus = async (status?: OrderStatusUi) => {
    const query = new URLSearchParams({ page: '1', limit: '1' });
    const apiStatus = toApiStatus(status);

    if (apiStatus) {
      query.set('status', apiStatus);
    }

    const payload = await requestApi<PagedResponseApi<ApiOrderResponse>>(`/orders?${query.toString()}`);
    return payload.totalElements || 0;
  };

  const countReportsByStatus = async (status: string) => {
    const query = new URLSearchParams({ page: '1', limit: '1', status });
    const payload = await requestApi<PagedResponseApi<ApiReportResponse>>(`/reports?${query.toString()}`);
    return payload.totalElements || 0;
  };

  const [totalOrders, newCount, assignedCount, scheduledCount, inProgressCount, completedCount, cancelledCount, openReports, investigatingReports] = await Promise.all([
    countByStatus(undefined),
    countByStatus('NEW'),
    countByStatus('ASSIGNED'),
    countByStatus('SCHEDULED'),
    countByStatus('IN_PROGRESS'),
    countByStatus('COMPLETED'),
    countByStatus('CANCELLED'),
    countReportsByStatus('open'),
    countReportsByStatus('investigating'),
  ]);

  return {
    totalOrders,
    processing: newCount + assignedCount + scheduledCount + inProgressCount,
    completed: completedCount,
    cancelled: cancelledCount,
    disputes: openReports + investigatingReports,
    pendingPriceReview: 0,
  };
};

export const getOrderDetail = async (orderCode: string): Promise<OrderDetailViewModel> => {
  const order = await requestApi<ApiOrderResponse>(`/orders/${orderCode}`);
  const [reports, warranty] = await Promise.all([
    fetchReportList(orderCode).catch(() => []),
    fetchWarranty(orderCode).catch(() => null),
  ]);

  return {
    order,
    tableRow: mapOrderToRow(order),
    timeline: mapTimeline(order),
    priceAdjustment: mapPriceAdjustment(order),
    images: {
      before: order.images || [],
      completion: order.status === 'completed' ? (order.images || []) : [],
      evidence: [
        ...reports.flatMap((report) => report.evidenceImages || []),
        ...(warranty?.images || []),
      ],
    },
    reports,
    warranty,
  };
};

export const formatApiDateTime = formatDateTime;
export const formatApiDateOnly = formatDateOnly;
