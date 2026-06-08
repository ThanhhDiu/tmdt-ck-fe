import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './ProviderList.css';
import { ProviderCard } from './ProviderCard';
import { PremiumProviderCard } from './PremiumProviderCard';
import { ChevronDownIcon } from '../common/Icons';
import RepairRequestModal from '../modal/RepairRequestModal.tsx';
import { technicianService } from '../../services/technician/technicianService';
import {
  mapListItemToProviderEntry,
  type ProviderListEntry,
} from '../../utils/technicianMappers';

interface Props {
  onNavigate?: (page: string, data?: unknown) => void;
  selectedService?: string;
  currentPage?: number;
  setCurrentPage?: (page: number) => void;
  setTotalPages?: (total: number) => void;
}

export const ProviderList: React.FC<Props> = ({
  onNavigate,
  selectedService,
  currentPage = 1,
  setCurrentPage,
  setTotalPages,
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('PHỔ BIẾN NHẤT');
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
      const minRating = selectedSort === 'ĐÁNH GIÁ CAO NHẤT' ? 4.5 : undefined;
      const data = await technicianService.listTechnicians({
        service: selectedService,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        minRating,
      });

      let items = data.items.map(mapListItemToProviderEntry);

      if (selectedSort === 'GIÁ THẤP NHẤT') {
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
  }, [currentPage, selectedService, selectedSort, setTotalPages]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  useEffect(() => {
    setCurrentPage?.(1);
  }, [selectedService, selectedSort, setCurrentPage]);

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
        <div className="pl-sort" style={{ position: 'relative' }}>
          <span className="sort-label">SẮP XẾP:</span>
          <button className="sort-btn" type="button" onClick={() => setIsSortOpen(!isSortOpen)}>
            {selectedSort} <ChevronDownIcon size={14} className="sort-icon" />
          </button>

          {isSortOpen && (
            <div className="sort-dropdown">
              {['PHỔ BIẾN NHẤT', 'ĐÁNH GIÁ CAO NHẤT', 'GIÁ THẤP NHẤT'].map((option) => (
                <div
                  key={option}
                  className={`sort-option ${selectedSort === option ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedSort(option);
                    setIsSortOpen(false);
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
          <p>Hiện chưa có thợ nào{selectedService ? ` cho dịch vụ "${selectedService}"` : ''}.</p>
          <p>Hãy thử tìm kiếm dịch vụ khác.</p>
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
