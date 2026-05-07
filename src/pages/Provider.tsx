import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Provider.css';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FilterSidebar } from '../components/provider/FilterSidebar';
import { ProviderList } from '../components/provider/ProviderList';

const pageMap: Record<string, string> = {
  'home': '/',
  'provider': '/provider',
  'services': '/services',
  'provider-profile': '/provider-profile',
  'provider-dashboard': '/provider-dashboard',
  'customer-settings': '/customer/account-settings',
  'login': '/auth/login',
};

export const Provider: React.FC = () => {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedService = searchParams.get('service') || undefined;

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const onNavigate = (page: string, data?: unknown) => {
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
      <Footer />
    </div>
  );
};

export default Provider;
