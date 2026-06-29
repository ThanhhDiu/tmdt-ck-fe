import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCustomerNavigate } from '../components/layout/useCustomerNavigate';
import './Provider.css';
import { FilterSidebar } from '../components/provider/FilterSidebar';
import { ProviderList } from '../components/provider/ProviderList';

export const FindProvider: React.FC = () => {
  const onNavigate = useCustomerNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedService = searchParams.get('service') || undefined;
  const selectedCategoryId = searchParams.get('category') || undefined;
  const selectedKeyword = searchParams.get('keyword') || '';
  const selectedSortBy = searchParams.get('sortBy') || '';
  const selectedSortDirection = searchParams.get('sortDirection') || '';
  const selectedSortValue =
    selectedSortBy && selectedSortDirection ? `${selectedSortBy}_${selectedSortDirection}` : '';
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [keyword, setKeyword] = React.useState(selectedKeyword || selectedService || '');
  const [district, setDistrict] = React.useState<string | undefined>();
  const [minRating, setMinRating] = React.useState<number | undefined>();
  const [isAvailable, setIsAvailable] = React.useState<boolean | undefined>();
  const [sortValue, setSortValue] = React.useState(selectedSortValue);
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(null);

  const normalizeSearch = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    setCurrentPage(1);
  };

  const syncProviderUrl = (next: {
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

    setSearchParams(params);
  };

  const handleSortChange = (value: string) => {
    setSortValue(value);
    setCurrentPage(1);
    syncProviderUrl({
      service: selectedService,
      category: selectedCategoryId,
      keyword: selectedService ? undefined : keyword.trim() || undefined,
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

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh' }}>
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
            onKeywordChange={handleKeywordChange}
            district={district}
            minRating={minRating}
            isAvailable={isAvailable}
            lat={coords?.lat}
            lng={coords?.lng}
            sortValue={sortValue}
            onSortChange={handleSortChange}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            setTotalPages={setTotalPages}
          />
        </div>
      </main>
    </div>
  );
};

export default FindProvider;
