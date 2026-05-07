import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCustomerNavigate } from '../components/layout/useCustomerNavigate';
import './Provider.css';
import { FilterSidebar } from '../components/provider/FilterSidebar';
import { ProviderList } from '../components/provider/ProviderList';

export const FindProvider: React.FC = () => {
  const onNavigate = useCustomerNavigate();
  const [searchParams] = useSearchParams();
  const selectedService = searchParams.get('service') || undefined;
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh' }}>
      <main className="fp-main-container">
        <div className="fp-layout">
          <FilterSidebar
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <ProviderList
            onNavigate={onNavigate}
            selectedService={selectedService}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            setTotalPages={setTotalPages}
          />
        </div>
      </main>
    </div>
  );
};

export default FindProvider;
