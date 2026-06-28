import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './ProviderList.css';
import { ProviderCard } from './ProviderCard';
import { PremiumProviderCard } from './PremiumProviderCard';
import { ChevronDownIcon } from '../common/Icons';
import RepairRequestModal from '../modal/RepairRequestModal.tsx';
import { technicianService } from '../../services/technician/technicianService';
import { SearchSortPagination } from '../common/SearchSortPagination';
import {
  mapListItemToProviderEntry,
  type ProviderListEntry,
} from '../../utils/technicianMappers';

interface Props {
  onNavigate?: (page: string, data?: unknown) => void;
  selectedService?: string;
  selectedCategoryId?: string;
  keyword?: string;
  onKeywordChange?: (value: string) => void;
  district?: string;
  minRating?: number;
  isAvailable?: boolean;
  lat?: number;
  lng?: number;
  sortValue?: string;
  onSortChange?: (value: string) => void;
  onSearchSubmit?: (keyword: string) => void | Promise<void>;
  currentPage?: number;
  totalPages?: number;
  setCurrentPage?: (page: number) => void;
  setTotalPages?: (total: number) => void;
}

export const ProviderList: React.FC<Props> = ({
  onNavigate,
  selectedService,
  selectedCategoryId,
  keyword = '',
  onKeywordChange,
  district,
  minRating,
  isAvailable,
  lat,
  lng,
  sortValue = '',
  onSortChange,
  onSearchSubmit,
  currentPage = 1,
  totalPages = 1,
  setCurrentPage,
  setTotalPages,
}) => {
  const ITEMS_PER_PAGE = 7;
  const [selectedProvider, setSelectedProvider] = useState<ProviderListEntry | null>(null);
  const [providers, setProviders] = useState<ProviderListEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [resultTotal, setResultTotal] = useState(0);

  const handleNavigate = (page: string, data?: unknown) => {
    if (page === 'open-modal') {
      setSelectedProvider(data as ProviderListEntry);
      return;
    }
    onNavigate?.(page, data);
  };

  const loadProviders = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [sortByRaw, sortDirectionRaw] = sortValue.split('_');
      const sortBy = sortByRaw === 'rating' || sortByRaw === 'distance' || sortByRaw === 'price'
        ? sortByRaw
        : undefined;
      const sortDirection = sortDirectionRaw === 'asc' || sortDirectionRaw === 'desc'
        ? sortDirectionRaw
        : undefined;
      const normalizedKeyword = keyword.trim();
      const normalizeText = (value?: string) =>
        (value ?? '')
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
      const keywordParam =
        normalizedKeyword && normalizeText(normalizedKeyword) !== normalizeText(selectedService)
          ? normalizedKeyword
          : undefined;
      const data = await technicianService.listTechnicians({
        service: selectedService,
        categoryId: selectedCategoryId,
        keyword: keywordParam,
        district,
        isAvailable,
        lat,
        lng,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        minRating,
        sortBy,
        sortDirection,
      });

      let items = data.items.map(mapListItemToProviderEntry);

      if (sortValue === 'price_asc') {
        items = [...items].sort((a, b) => {
          const priceA =
            a.kind === 'normal'
              ? Number.parseInt(a.price.replace(/\D/g, ''), 10) || Number.MAX_SAFE_INTEGER
              : Number.MAX_SAFE_INTEGER;
          const priceB =
            b.kind === 'normal'
              ? Number.parseInt(b.price.replace(/\D/g, ''), 10) || Number.MAX_SAFE_INTEGER
              : Number.MAX_SAFE_INTEGER;
          return priceA - priceB;
        });
      }

      if (sortValue === 'price_desc') {
        items = [...items].sort((a, b) => {
          const priceA =
            a.kind === 'normal'
              ? Number.parseInt(a.price.replace(/\D/g, ''), 10) || 0
              : 0;
          const priceB =
            b.kind === 'normal'
              ? Number.parseInt(b.price.replace(/\D/g, ''), 10) || 0
              : 0;
          return priceB - priceA;
        });
      }

      if (sortValue === 'distance_asc') {
        items = [...items].sort((a, b) => {
          const distanceA = a.kind === 'normal' ? a.distanceKm ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
          const distanceB = b.kind === 'normal' ? b.distanceKm ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
          return distanceA - distanceB;
        });
      }

      if (sortValue === 'distance_desc') {
        items = [...items].sort((a, b) => {
          const distanceA = a.kind === 'normal' ? a.distanceKm ?? 0 : 0;
          const distanceB = b.kind === 'normal' ? b.distanceKm ?? 0 : 0;
          return distanceB - distanceA;
        });
      }

      setProviders(items);
      setResultTotal(data.pagination.total);
      setTotalPages?.(Math.max(1, data.pagination.totalPages));
    } catch (error) {
      setProviders([]);
      setResultTotal(0);
      setTotalPages?.(1);
      setLoadError(
        error instanceof Error ? error.message : 'Không thể tải danh sách thợ'
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedService, selectedCategoryId, keyword, district, isAvailable, lat, lng, minRating, sortValue, setTotalPages]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  useEffect(() => {
    setCurrentPage?.(1);
  }, [selectedService, selectedCategoryId, keyword, district, isAvailable, minRating, sortValue, setCurrentPage]);

  const pageTitle = selectedService
    ? `Thợ chuyên ${selectedService}`
    : 'Thợ sửa chữa chuyên nghiệp';

  const resultCount = useMemo(
    () => providers.filter((p) => p.kind !== 'premium').length,
    [providers]
  );

  return (
    <div className="provider-list-container">
      <div className="pl-header">
        <div className="pl-header-left">
          <h1 className="pl-title">{pageTitle}</h1>
          <p className="pl-subtitle">
            Tìm thấy {resultTotal || resultCount} chuyên gia
            {selectedService && <span className="pl-service-tag">{selectedService}</span>}{' '}
            tại khu vực TP.HCM
          </p>
        </div>
      </div>

      <SearchSortPagination
        keyword={keyword}
        onKeywordChange={onKeywordChange ?? (() => undefined)}
        sortValue={sortValue}
        onSortChange={onSortChange ?? (() => undefined)}
        sortOptions={[
          { label: 'Mặc định', value: '' },
          { label: 'Đánh giá cao nhất', value: 'rating_desc' },
          { label: 'Đánh giá thấp nhất', value: 'rating_asc' },
          { label: 'Gần nhất', value: 'distance_asc' },
          { label: 'Xa nhất', value: 'distance_desc' },
          { label: 'Giá thấp nhất', value: 'price_asc' },
          { label: 'Giá cao nhất', value: 'price_desc' },
        ]}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage ?? (() => undefined)}
        onSearchSubmit={onSearchSubmit}
        placeholder="Tìm tên thợ hoặc dịch vụ..."
      />

      <div className="pl-cards">
        {isLoading && <p className="pl-empty">Đang tải danh sách thợ...</p>}
        {!isLoading && loadError && <p className="pl-empty">{loadError}</p>}
        {!isLoading &&
          !loadError &&
          providers.map((p) =>
            p.kind === 'premium' ? (
              <PremiumProviderCard
                key={p.id}
                provider={p}
                onNavigate={(page, data) =>
                  onNavigate?.(page, data ?? { id: p.id, name: p.name, avatar: p.avatar })
                }
              />
            ) : (
              <ProviderCard key={p.id} provider={p} onNavigate={handleNavigate} />
            )
          )}
      </div>

      {!isLoading && !loadError && providers.length === 0 && (
        <div className="pl-empty">
          <p>Hiện tại chưa có thợ nào sẵn sàng nhận đơn ở khu vực này.</p>
          <p>Vui lòng thử lại sau hoặc tìm kiếm dịch vụ khác.</p>
        </div>
      )}

      <RepairRequestModal
        open={!!selectedProvider}
        onClose={() => setSelectedProvider(null)}
        technicianId={selectedProvider?.id}
      />
    </div>
  );
};
