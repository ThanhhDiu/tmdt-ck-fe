import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Provider.css';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FilterSidebar } from '../components/provider/FilterSidebar';
import { ProviderList } from '../components/provider/ProviderList';
import { buildProviderProfilePath } from '../utils/providerNavigation';
import { getCategories } from '../services/categoryService';

const pageMap: Record<string, string> = {
  'home': '/',
  'provider': '/provider',
  'services': '/services',
  // 'rewards': '/rewards',
  'provider-profile': '/provider-profile',
  'provider-dashboard': '/provider-dashboard',
  'customer-settings': '/customer/account-settings',
  'login': '/auth/login',
};

export const Provider: React.FC = () => {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedService = searchParams.get('service') || undefined;
  const selectedCategoryId = searchParams.get('category') || undefined;
  const selectedKeyword = searchParams.get('keyword') || '';
  const selectedSortBy = searchParams.get('sortBy') || '';
  const selectedSortDirection = searchParams.get('sortDirection') || '';
  const selectedSortValue =
    selectedSortBy && selectedSortDirection ? `${selectedSortBy}_${selectedSortDirection}` : '';

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState(selectedKeyword || selectedService || '');
  const [district, setDistrict] = useState<string | undefined>();
  const [minRating, setMinRating] = useState<number | undefined>();
  const [isAvailable, setIsAvailable] = useState<boolean | undefined>();
  const [sortValue, setSortValue] = useState(selectedSortValue);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const buildProviderParams = (next: {
    service?: string;
    category?: string;
    keyword?: string;
    sortValue?: string;
  }) => {
    const params = new URLSearchParams();
    if (next.service) params.set('service', next.service);
    if (next.category) params.set('category', next.category);
    if (next.keyword) params.set('keyword', next.keyword);

    if (next.sortValue) {
      const [sortBy, sortDirection] = next.sortValue.split('_');
      if (sortBy && sortDirection) {
        params.set('sortBy', sortBy);
        params.set('sortDirection', sortDirection);
      }
    }

    return params;
  };

  const syncProviderUrl = (next: {
    service?: string;
    category?: string;
    keyword?: string;
    sortValue?: string;
    replace?: boolean;
  }) => {
    const params = buildProviderParams(next);
    setSearchParams(params, { replace: next.replace ?? false });
  };

  const normalizeSearch = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const handleProviderSearchSubmit = async (value: string) => {
    const searchValue = value.trim();
    setCurrentPage(1);

    if (!searchValue) {
      syncProviderUrl({ sortValue });
      return;
    }

    try {
      const categories = await getCategories('active');
      const normalizedKeyword = normalizeSearch(searchValue);
      const matchedCategory = categories.find((category) => {
        const title = normalizeSearch(category.title);
        return title === normalizedKeyword || title.includes(normalizedKeyword) || normalizedKeyword.includes(title);
      });

      if (matchedCategory) {
        setKeyword(matchedCategory.title);
        syncProviderUrl({
          service: matchedCategory.title,
          category: matchedCategory.id,
          sortValue,
        });
        return;
      }
    } catch {
      // Fall back to keyword filtering if category lookup fails.
    }

    setKeyword(searchValue);
    syncProviderUrl({ keyword: searchValue, sortValue });
  };

  const handleProviderKeywordChange = (value: string) => {
    setKeyword(value);
    setCurrentPage(1);

    const normalizedValue = normalizeSearch(value);
    const normalizedService = normalizeSearch(selectedService ?? '');
    if ((selectedCategoryId || selectedService) && normalizedValue && normalizedValue !== normalizedService) {
      syncProviderUrl({ keyword: value, sortValue, replace: true });
    }
  };

  const handleSortChange = (value: string) => {
    setSortValue(value);
    setCurrentPage(1);

    const normalizedKeyword = keyword.trim();
    const normalizedService = normalizeSearch(selectedService ?? '');
    const normalizedKeywordText = normalizeSearch(normalizedKeyword);
    const keywordIsService = selectedService && normalizedKeywordText === normalizedService;

    if (selectedService && selectedCategoryId && (!normalizedKeyword || keywordIsService)) {
      syncProviderUrl({
        service: selectedService,
        category: selectedCategoryId,
        sortValue: value,
      });
      return;
    }

    syncProviderUrl({
      keyword: normalizedKeyword || undefined,
      sortValue: value,
    });
  };

  useEffect(() => {
    setKeyword(selectedKeyword || selectedService || '');
    setSortValue(selectedSortValue);
  }, [selectedKeyword, selectedService, selectedSortValue]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setCoords(null);
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    );
  }, []);

  const onNavigate = (page: string, data?: unknown) => {
    const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
    const technicianId =
      typeof record?.id === 'string'
        ? record.id
        : typeof record?.technicianId === 'string'
          ? record.technicianId
          : null;

    if (page === 'provider-profile' && technicianId) {
      nav(buildProviderProfilePath(technicianId), { 
        state: { 
          ...record, 
          id: technicianId,
          serviceCategory: selectedService 
        } 
      });
      return;
    }

    const path = pageMap[page] || '/';
    nav(path, { state: data });
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh' }}>
      <Header onNavigate={onNavigate} />
      <main className="fp-main-container">
        <div className="fp-layout">
          <FilterSidebar
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            district={district}
            minRating={minRating}
            isAvailable={isAvailable}
            onDistrictChange={(value) => {
              setDistrict(value);
              setCurrentPage(1);
            }}
            onMinRatingChange={(value) => {
              setMinRating(value);
              setCurrentPage(1);
            }}
            onAvailabilityChange={(value) => {
              setIsAvailable(value);
              setCurrentPage(1);
            }}
          />
          <ProviderList
            onNavigate={onNavigate}
            selectedService={selectedService}
            selectedCategoryId={selectedCategoryId}
            keyword={keyword}
            onKeywordChange={handleProviderKeywordChange}
            district={district}
            minRating={minRating}
            isAvailable={isAvailable}
            lat={coords?.lat}
            lng={coords?.lng}
            sortValue={sortValue}
            onSortChange={handleSortChange}
            onSearchSubmit={handleProviderSearchSubmit}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            setTotalPages={setTotalPages}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Provider;
