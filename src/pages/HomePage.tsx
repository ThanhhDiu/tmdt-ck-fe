import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { HeroSection } from '../components/home/HeroSection';
import { PopularServices } from '../components/home/PopularServices';
import { TopExperts } from '../components/home/TopExperts';
import { PremiumBanner } from '../components/home/PremiumBanner';
import { Footer } from '../components/layout/Footer';
import { buildProviderProfilePath } from '../utils/providerNavigation';

const pageMap: Record<string, string> = {
  'home': '/',
  'provider': '/provider',
  'services': '/services',
  'rewards': '/rewards',
  'provider-profile': '/provider-profile',
  'provider-dashboard': '/provider-dashboard',
  'customer-settings': '/customer/account-settings',
  'login': '/auth/login',
};

export const HomePage: React.FC = () => {
  const nav = useNavigate();
  const onNavigate = (page: string, data?: Record<string, unknown>) => {
    const technicianId =
      typeof data?.id === 'string'
        ? data.id
        : typeof data?.technicianId === 'string'
          ? data.technicianId
          : null;

    if (page === 'provider-profile' && technicianId) {
      nav(buildProviderProfilePath(technicianId), { state: { ...data, id: technicianId } });
      return;
    }

    const path = pageMap[page] || '/';
    nav(path, { state: data });
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Header onNavigate={onNavigate} />
      <main>
        <HeroSection />
        <PopularServices />
        <TopExperts onNavigate={onNavigate} />
        <PremiumBanner />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
