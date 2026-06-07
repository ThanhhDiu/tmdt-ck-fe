import type { ProviderProps } from '../components/provider/ProviderCard';
import type { PremiumProviderProps } from '../components/provider/PremiumProviderCard';
import type { ProfileHeaderProps } from '../components/provider-profile/ProfileHeader';
import type { TechnicianDetail, TechnicianListItem } from '../types/technician';

export const formatPricePerHour = (value?: number | null): string => {
  if (value == null || Number.isNaN(value)) {
    return 'Liên hệ';
  }
  return `${value.toLocaleString('vi-VN')}đ`;
};

export const toNumber = (value?: number | string | null, fallback = 0): number => {
  if (value == null) return fallback;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const mapListItemToProviderCard = (item: TechnicianListItem): ProviderProps => ({
  id: item.id,
  name: item.fullName,
  avatar: item.avatar || 'https://placehold.co/150x150',
  rating: toNumber(item.rating, 0),
  reviewCount: Number(item.reviewCount ?? 0),
  location: item.location || item.district || 'TP.HCM',
  skills: item.skills ?? [],
  price: formatPricePerHour(item.pricePerHour ?? null),
  isAvailable: Boolean(item.isAvailable),
  timeAvailable: item.timeAvailable ?? undefined,
});

export const mapListItemToPremiumCard = (item: TechnicianListItem): PremiumProviderProps => ({
  id: item.id,
  name: item.fullName,
  avatar: item.avatar || 'https://placehold.co/150x150',
  titleBadge: item.titleBadge || 'CHUYÊN GIA',
  description:
    item.skills && item.skills.length > 0
      ? item.skills.slice(0, 3).join(' · ')
      : `Đã hoàn thành ${item.completedJobs ?? 0} đơn hàng`,
});

export type ProviderListEntry =
  | ({ kind: 'premium' } & PremiumProviderProps)
  | ({ kind: 'normal' } & ProviderProps);

export const mapListItemToProviderEntry = (item: TechnicianListItem): ProviderListEntry => {
  if (item.type === 'premium') {
    return { kind: 'premium', ...mapListItemToPremiumCard(item) };
  }
  return { kind: 'normal', ...mapListItemToProviderCard(item) };
};

export const mapDetailToProfileHeader = (detail: TechnicianDetail): ProfileHeaderProps => ({
  technicianId: detail.id,
  name: detail.fullName,
  avatar: detail.avatar || 'https://placehold.co/150x150',
  coverImage:
    detail.coverImage ||
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80',
  rating: toNumber(detail.rating, 0),
  reviewCount: Number(detail.reviewCount ?? 0),
  completedJobs:
    detail.completedJobs != null
      ? `${detail.completedJobs.toLocaleString('vi-VN')}+`
      : '0',
  location: detail.location || detail.district || 'TP.HCM',
  isAvailable: Boolean(detail.isAvailable),
  type: detail.type || 'normal',
  titleBadge: detail.titleBadge || '',
});
