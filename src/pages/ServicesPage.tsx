import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { services, type ServiceItem } from '../components/home/PopularServices';
import '../components/home/PopularServices.css'; // Reusing the CSS

const pageMap: Record<string, string> = {
  'home': '/',
  'provider': '/provider',
  'services': '/services',
  'rewards': '/rewards',
  'provider-profile': '/provider-profile',
  'provider-dashboard': '/technician/dashboard',
  'customer-settings': '/customer/account-settings',
  'login': '/auth/login',
};

export const ServicesPage: React.FC = () => {
  const navigate = useNavigate();

  const handleServiceClick = (service: ServiceItem) => {
    navigate(`/provider?service=${encodeURIComponent(service.name)}`);
  };

  const onNavigate = (page: string, data?: unknown) => {
    const path = pageMap[page] || '/';
    navigate(path, { state: data });
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onNavigate={onNavigate} />

      <main style={{ flexGrow: 1, padding: '40px 0' }}>
        <section className="services-section" style={{ margin: '0 auto' }}>
          <div className="services-header">
            <div>
              <h1 className="section-title" style={{ fontSize: '36px' }}>Tất cả dịch vụ</h1>
              <p className="section-subtitle">Khám phá các dịch vụ chăm sóc nhà cửa toàn diện từ GlowUp.</p>
            </div>
          </div>

          <div className="services-grid">
            {services.map(service => (
              <div
                key={service.id}
                className="service-card"
                onClick={() => handleServiceClick(service)}
                role="button"
                tabIndex={0}
              >
                <div className="service-icon-container">
                  {service.icon}
                </div>
                <h3 className="service-name">{service.name}</h3>
                <p className="service-desc">{service.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ServicesPage;
