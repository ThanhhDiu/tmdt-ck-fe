export type TechnicianListItem = {
  id: string;
  fullName: string;
  avatar?: string | null;
  rating?: number | string | null;
  reviewCount?: number | null;
  location?: string | null;
  district?: string | null;
  skills?: string[] | null;
  pricePerHour?: number | null;
  isAvailable?: boolean | null;
  timeAvailable?: string | null;
  type?: string | null;
  titleBadge?: string | null;
  completedJobs?: number | null;
  distanceKm?: number | string | null;
  distance?: number | string | null;
  distanceInKm?: number | string | null;
  distance_km?: number | string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
};

export type TechnicianReview = {
  id: string;
  orderId?: string | null;
  authorName?: string | null;
  authorAvatar?: string | null;
  rating: number;
  content?: string | null;
  comment?: string | null;
  attachedImages?: string[] | null;
  images?: string[] | null;
  createdAt?: string | null;
};

export type TechnicianScheduleSlot = {
  id?: string;
  date: string;
  dayOfWeek?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  status?: 'available' | 'full' | 'partial' | 'off' | string | null;
  label?: string | null;
};

export type TechnicianDetail = {
  id: string;
  fullName: string;
  avatar?: string | null;
  coverImage?: string | null;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  district?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  rating?: number | string | null;
  reviewCount?: number | null;
  completedJobs?: number | null;
  isAvailable?: boolean | null;
  type?: string | null;
  titleBadge?: string | null;
  verificationStatus?: string | null;
  yearsExperience?: number | null;
  distanceKm?: number | string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  reviews?: TechnicianReview[] | null;
  schedule?: TechnicianScheduleSlot[] | Record<string, string | null | undefined> | null;
};

export type TechnicianListParams = {
  service?: string;
  categoryId?: string;
  district?: string;
  isAvailable?: boolean;
  minRating?: number;
  keyword?: string;
  sortBy?: 'popular' | 'rating' | 'distance' | 'price';
  sortDirection?: 'asc' | 'desc';
  lat?: number;
  lng?: number;
  page?: number;
  limit?: number;
};

export type PagedTechnicians = {
  items: TechnicianListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
