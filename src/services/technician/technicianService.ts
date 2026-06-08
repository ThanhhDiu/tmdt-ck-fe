import apiClient from '../../api/config';
import type {
  PagedTechnicians,
  TechnicianDetail,
  TechnicianListItem,
  TechnicianListParams,
} from '../../types/technician';

type PagedData<T> = {
  items: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const unwrap = <T,>(payload: unknown): T => {
  if (
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    (payload as { success?: boolean }).success &&
    'data' in payload
  ) {
    return (payload as { data: T }).data;
  }
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export const technicianService = {
  listTechnicians: async (params: TechnicianListParams = {}): Promise<PagedTechnicians> => {
    const response = await apiClient.get('/api/technicians', {
      params: {
        service: params.service,
        district: params.district,
        isAvailable: params.isAvailable,
        minRating: params.minRating,
        keyword: params.keyword,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      },
    });

    if (!response.data || (response.data as { success?: boolean }).success === false) {
      throw new Error('Không thể tải danh sách thợ');
    }

    const data = unwrap<PagedData<TechnicianListItem>>(response.data);
    const pagination = data.pagination ?? {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      total: data.items?.length ?? 0,
      totalPages: 1,
    };

    return {
      items: data.items ?? [],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages ?? 1,
      },
    };
  },

  getTechnician: async (technicianId: string): Promise<TechnicianDetail> => {
    const response = await apiClient.get(`/api/technicians/${encodeURIComponent(technicianId)}`);
    if (!response.data || (response.data as { success?: boolean }).success === false) {
      throw new Error('Không thể tải hồ sơ thợ');
    }
    return unwrap<TechnicianDetail>(response.data);
  },
};
