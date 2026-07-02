import apiClient from '../../api/config';
import type {
  BusySlotResponse,
  ChartDataPoint,
  DashboardStats,
  PagedTechnicians,
  TechnicianDetail,
  TechnicianListItem,
  TechnicianListParams,
  TechnicianScheduleSlot,
} from '../../types/technician';

export interface Technician {
  id: string;
  fullName: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  location: string;
  district: string;
  skills: string[];
  pricePerHour: number;
  isAvailable: boolean;
  timeAvailable?: string;
  type?: 'normal' | 'premium';
  titleBadge?: string;
  completedJobs: number;
  bio?: string;
}

type PagedData<T> = {
  items: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type TechnicianScheduleApiItem = Partial<TechnicianScheduleSlot> & {
  day?: string | null;
  dayOfWeek?: string | null;
  from?: string | null;
  to?: string | null;
  start?: string | null;
  end?: string | null;
  timeRange?: string | null;
};

type TechnicianScheduleRecord = Record<string, string | null | undefined>;

type TechnicianScheduleApiResponse =
  | TechnicianScheduleApiItem[]
  | TechnicianScheduleRecord
  | {
      items?: TechnicianScheduleApiItem[] | null;
      schedule?: TechnicianScheduleApiItem[] | TechnicianScheduleRecord | null;
      slots?: TechnicianScheduleApiItem[] | null;
      availableSlots?: TechnicianScheduleApiItem[] | null;
    };

type TechnicianReviewApiItem = NonNullable<TechnicianDetail['reviews']>[number];

type TechnicianReviewApiResponse =
  | TechnicianReviewApiItem[]
  | {
      items?: TechnicianReviewApiItem[] | null;
      reviews?: TechnicianReviewApiItem[] | null;
    };

const WEEKDAY_LABELS: Record<string, string> = {
  monday: 'Thứ 2',
  tuesday: 'Thứ 3',
  wednesday: 'Thứ 4',
  thursday: 'Thứ 5',
  friday: 'Thứ 6',
  saturday: 'Thứ 7',
  sunday: 'Chủ nhật',
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

export const normalizeScheduleDayKey = (value?: string | null) => {
  const normalized = (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (['monday', 'mon', 'thu 2', 'thu hai', 't2', '2'].includes(normalized)) return 'monday';
  if (['tuesday', 'tue', 'thu 3', 'thu ba', 't3', '3'].includes(normalized)) return 'tuesday';
  if (['wednesday', 'wed', 'thu 4', 'thu tu', 't4', '4'].includes(normalized)) return 'wednesday';
  if (['thursday', 'thu', 'thu 5', 'thu nam', 't5', '5'].includes(normalized)) return 'thursday';
  if (['friday', 'fri', 'thu 6', 'thu sau', 't6', '6'].includes(normalized)) return 'friday';
  if (['saturday', 'sat', 'thu 7', 'thu bay', 't7', '7'].includes(normalized)) return 'saturday';
  if (['sunday', 'sun', 'chu nhat', 'cn', '8'].includes(normalized)) return 'sunday';

  return normalized;
};

const parseTimeRange = (value?: string | null) => {
  const text = (value ?? '').trim();
  if (!text) {
    return { startTime: null, endTime: null, label: null, status: 'off' as const };
  }

  const match = text.match(/(\d{1,2}:\d{2})\s*[-–—]\s*(\d{1,2}:\d{2})/);
  if (!match) {
    return { startTime: null, endTime: null, label: text, status: 'available' as const };
  }

  return {
    startTime: match[1],
    endTime: match[2],
    label: null,
    status: 'available' as const,
  };
};

const isScheduleRecord = (payload: unknown): payload is TechnicianScheduleRecord => {
  if (!payload || Array.isArray(payload) || typeof payload !== 'object') return false;

  return Object.values(payload).every(
    (value) => value === null || value === undefined || typeof value === 'string'
  );
};

const normalizeScheduleSlot = (
  slot: TechnicianScheduleApiItem,
  index: number
): TechnicianScheduleSlot => {
  const startTime = slot.startTime ?? slot.from ?? slot.start ?? null;
  const endTime = slot.endTime ?? slot.to ?? slot.end ?? null;
  const dayKey = normalizeScheduleDayKey(slot.dayOfWeek ?? slot.day ?? slot.date);

  return {
    id: slot.id ?? `${slot.date ?? slot.day ?? slot.dayOfWeek ?? 'slot'}-${index}`,
    date: slot.date ?? WEEKDAY_LABELS[dayKey] ?? slot.day ?? slot.dayOfWeek ?? 'Chưa cập nhật ngày',
    dayOfWeek: dayKey || slot.dayOfWeek || slot.day || null,
    startTime,
    endTime,
    status: slot.status ?? (startTime || endTime || slot.timeRange ? 'available' : null),
    label: slot.label ?? slot.timeRange ?? null,
  };
};

export const normalizeTechnicianSchedule = (
  payload: TechnicianScheduleApiResponse | null | undefined
): TechnicianScheduleSlot[] => {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    return payload.filter(Boolean).map(normalizeScheduleSlot);
  }

  if (isScheduleRecord(payload)) {
    return Object.entries(payload).map(([day, timeRange], index) => {
      const dayKey = normalizeScheduleDayKey(day);
      const parsed = parseTimeRange(timeRange);

      return {
        id: `${dayKey || day}-${index}`,
        date: WEEKDAY_LABELS[dayKey] ?? day,
        dayOfWeek: dayKey || day,
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        status: parsed.status,
        label: parsed.label,
      };
    });
  }

  const nested = payload.items ?? payload.schedule ?? payload.slots ?? payload.availableSlots ?? null;
  return normalizeTechnicianSchedule(nested);
};

const getReviewItems = (payload: TechnicianReviewApiResponse | null | undefined) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return payload.items ?? payload.reviews ?? [];
};

const normalizeReview = (review: TechnicianReviewApiItem): TechnicianReviewApiItem => ({
  ...review,
  comment: review.comment ?? review.content ?? null,
  images: review.images ?? review.attachedImages ?? null,
});

export const technicianService = {
  listTechnicians: async (params: TechnicianListParams = {}): Promise<PagedTechnicians> => {
    const response = await apiClient.get('/api/technicians', {
      params: {
        service: params.service,
        categoryId: params.categoryId,
        district: params.district,
        isAvailable: params.isAvailable,
        minRating: params.minRating,
        keyword: params.keyword,
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        lat: params.lat,
        lng: params.lng,
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

    const detail = unwrap<TechnicianDetail>(response.data);
    return {
      ...detail,
      schedule: normalizeTechnicianSchedule(detail.schedule as TechnicianScheduleApiResponse | null | undefined),
    };
  },

  updateTechnicianProfile: async (
    technicianId: string,
    data: { skills?: string[]; district?: string; bio?: string }
  ): Promise<void> => {
    const response = await apiClient.patch(`/api/technicians/${encodeURIComponent(technicianId)}/profile`, data);
    if (!response.data || (response.data as { success?: boolean }).success === false) {
      throw new Error('Không thể cập nhật hồ sơ hành nghề');
    }
  },

  updateTechnicianAvailability: async (
    technicianId: string,
    isAvailable: boolean
  ): Promise<void> => {
    const response = await apiClient.patch(`/api/technicians/${encodeURIComponent(technicianId)}/availability`, {
      isAvailable,
    });
    if (!response.data || (response.data as { success?: boolean }).success === false) {
      throw new Error('Không thể cập nhật trạng thái hoạt động');
    }
  },

  getTechnicianReviews: async (technicianId: string) => {
    const response = await apiClient.get(`/api/technicians/${encodeURIComponent(technicianId)}/reviews`);
    const data = unwrap<TechnicianReviewApiResponse>(response.data);
    return getReviewItems(data).filter(Boolean).map(normalizeReview);
  },

  getTechnicianSchedule: async (technicianId: string) => {
    const detail = await technicianService.getTechnician(technicianId);
    return normalizeTechnicianSchedule(detail.schedule as TechnicianScheduleApiResponse | null | undefined);
  },

  getTechnicianBusySlots: async (technicianId: string): Promise<BusySlotResponse[]> => {
    const response = await apiClient.get(`/api/technicians/${encodeURIComponent(technicianId)}/busy-slots`);
    return unwrap<BusySlotResponse[]>(response.data);
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/api/technicians/dashboard/stats');
    return unwrap<DashboardStats>(response.data);
  },

  getEarningsChart: async (period: 'week' | 'month' = 'week'): Promise<ChartDataPoint[]> => {
    const response = await apiClient.get(`/api/technicians/dashboard/chart?period=${period}`);
    return unwrap<ChartDataPoint[]>(response.data);
  },
};
