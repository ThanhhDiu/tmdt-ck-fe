import { API_URL, fetchWithAuth } from './auth';

export type ComplaintStatusApi = 'open' | 'investigating' | 'resolved' | 'dismissed';

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
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  // Backward-compatible fallback if an endpoint returns flat pagination fields.
  page?: number;
  limit?: number;
  totalElements?: number;
  totalPages?: number;
}

interface ApiComplaintPartyRef {
  id?: string;
  fullName?: string;
}

interface ApiComplaintResponse {
  id: string;
  orderId?: string;
  reason?: string;
  description?: string;
  status?: string;
  evidenceImages?: string[] | null;
  customer?: ApiComplaintPartyRef | null;
  technician?: ApiComplaintPartyRef | null;
  createdAt?: string;
}

export interface AdminComplaintItem {
  id: string;
  code: string;
  orderCode: string;
  customerName: string;
  technicianName: string;
  reason: string;
  reasonLabel: string;
  status: ComplaintStatusApi;
  statusLabel: string;
  description: string;
  evidenceImages: string[];
  createdAt: string;
  rawCreatedAt: string;
}

export interface ComplaintListFilters {
  status?: 'all' | ComplaintStatusApi;
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface ComplaintListResult {
  items: AdminComplaintItem[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
}

export interface ComplaintStats {
  OPEN: number;
  INVESTIGATING: number;
  RESOLVED: number;
  DISMISSED: number;
  TOTAL: number;
}

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

const toStatusApi = (status?: string): ComplaintStatusApi => {
  const normalized = (status || '').trim().toLowerCase();

  switch (normalized) {
    case 'investigating':
      return 'investigating';
    case 'resolved':
      return 'resolved';
    case 'dismissed':
      return 'dismissed';
    case 'open':
    default:
      return 'open';
  }
};

const statusLabelMap: Record<ComplaintStatusApi, string> = {
  open: 'Mới',
  investigating: 'Đang xử lý',
  resolved: 'Đã giải quyết',
  dismissed: 'Đã từ chối',
};

const reasonLabelMap: Record<string, string> = {
  extra_fee: 'Thu thêm phí',
  bad_attitude: 'Thái độ không tốt',
  no_show: 'Không đến',
  poor_quality: 'Chất lượng kém',
  fraud: 'Gian lận',
  other: 'Khác',
};

const requestApi = async <T>(path: string): Promise<T> => {
  const response = await fetchWithAuth(`${API_URL}${path}`, { method: 'GET' });
  const payload: ApiResponse<T> = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message || 'Không thể tải danh sách khiếu nại');
  }

  return payload.data;
};

const readPagination = <T>(payload: PagedResponseApi<T>) => {
  const page = payload.pagination?.page ?? payload.page ?? 1;
  const limit = payload.pagination?.limit ?? payload.limit ?? 10;
  const totalElements = payload.pagination?.total ?? payload.totalElements ?? 0;
  const totalPages = payload.pagination?.totalPages ?? payload.totalPages ?? 0;

  return {
    page,
    limit,
    totalElements,
    totalPages,
  };
};

const toComplaintItem = (item: ApiComplaintResponse): AdminComplaintItem => {
  const status = toStatusApi(item.status);
  const normalizedReason = (item.reason || '').trim().toLowerCase();

  return {
    id: item.id,
    code: item.id,
    orderCode: item.orderId || '--',
    customerName: item.customer?.fullName || '--',
    technicianName: item.technician?.fullName || '--',
    reason: normalizedReason || 'other',
    reasonLabel: reasonLabelMap[normalizedReason] || 'Khác',
    status,
    statusLabel: statusLabelMap[status],
    description: item.description || '--',
    evidenceImages: item.evidenceImages || [],
    createdAt: formatDateTime(item.createdAt),
    rawCreatedAt: item.createdAt || '',
  };
};

export const getAdminComplaints = async (filters: ComplaintListFilters = {}): Promise<ComplaintListResult> => {
  const query = new URLSearchParams();

  if (filters.status && filters.status !== 'all') {
    query.set('status', filters.status);
  }

  if (filters.keyword?.trim()) {
    query.set('keyword', filters.keyword.trim());
  }

  query.set('page', String(filters.page || 1));
  query.set('limit', String(filters.limit || 10));

  const payload = await requestApi<PagedResponseApi<ApiComplaintResponse>>(`/reports?${query.toString()}`);
  const pagination = readPagination(payload);

  return {
    items: (payload.items || []).map(toComplaintItem),
    page: pagination.page || filters.page || 1,
    limit: pagination.limit || filters.limit || 10,
    totalElements: pagination.totalElements || 0,
    totalPages: pagination.totalPages || 0,
  };
};

const countByStatus = async (status: ComplaintStatusApi): Promise<number> => {
  const query = new URLSearchParams({
    page: '1',
    limit: '1',
    status,
  });

  const payload = await requestApi<PagedResponseApi<ApiComplaintResponse>>(`/reports?${query.toString()}`);
  return readPagination(payload).totalElements || 0;
};

export const getAdminComplaintStats = async (): Promise<ComplaintStats> => {
  const [open, investigating, resolved, dismissed] = await Promise.all([
    countByStatus('open'),
    countByStatus('investigating'),
    countByStatus('resolved'),
    countByStatus('dismissed'),
  ]);

  return {
    OPEN: open,
    INVESTIGATING: investigating,
    RESOLVED: resolved,
    DISMISSED: dismissed,
    TOTAL: open + investigating + resolved + dismissed,
  };
};
