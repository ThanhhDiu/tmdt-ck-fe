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
};

export type TechnicianListParams = {
  service?: string;
  district?: string;
  isAvailable?: boolean;
  minRating?: number;
  keyword?: string;
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
