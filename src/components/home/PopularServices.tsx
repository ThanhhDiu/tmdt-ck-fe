import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PopularServices.css';
import {
  SnowflakeIcon,
  WashingMachineIcon,
  FridgeIcon,
  BroomIcon,
  WrenchIcon,
  BugIcon,
  MicrowaveIcon,
  CarIcon,
} from '../common/Icons';
import { getCategories, type Category } from '../../services/categoryService';

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  iconUrl?: string | null;
  serviceCount?: number;
}

const fallbackIcons = [
  <SnowflakeIcon />,
  <WashingMachineIcon />,
  <FridgeIcon />,
  <BroomIcon />,
  <WrenchIcon />,
  <BugIcon />,
  <MicrowaveIcon />,
  <CarIcon />,
];

export const mapCategoryToService = (category: Category, index = 0): ServiceItem => ({
  id: category.id,
  name: category.title,
  description: category.description || 'Dịch vụ GlowUp',
  icon: fallbackIcons[index % fallbackIcons.length],
  iconUrl: category.iconUrl,
  serviceCount: (category as Category & { serviceCount?: number }).serviceCount,
});

export const services: ServiceItem[] = [];

export const PopularServices: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        setLoading(true);
        setError('');
        const categories = await getCategories('active');
        if (active) {
          setItems(categories.map(mapCategoryToService));
        }
      } catch (err) {
        if (active) {
          setItems([]);
          setError(err instanceof Error ? err.message : 'Không thể tải danh mục dịch vụ');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  const handleServiceClick = (service: ServiceItem) => {
    navigate(`/provider?service=${encodeURIComponent(service.name)}&category=${encodeURIComponent(service.id)}`);
  };

  return (
    <section className="services-section">
      <div className="services-header">
        <div>
          <h2 className="section-title">Dịch vụ phổ biến</h2>
          <p className="section-subtitle">Tất cả những gì bạn cần cho một không gian hoàn hảo.</p>
        </div>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/services'); }} className="view-all-link">Xem tất cả dịch vụ →</a>
      </div>

      <div className="services-grid">
        {loading && <div className="services-state">Đang tải danh mục dịch vụ...</div>}
        {!loading && error && <div className="services-state services-state--error">{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div className="services-state">Chưa có danh mục dịch vụ đang hoạt động.</div>
        )}
        {!loading && !error && items.map((service) => (
          <div
            key={service.id}
            className="service-card"
            onClick={() => handleServiceClick(service)}
            role="button"
            tabIndex={0}
          >
            <div className="service-icon-container">
              {service.iconUrl ? <img src={service.iconUrl} alt={service.name} className="service-icon-img" /> : service.icon}
            </div>
            <h3 className="service-name">{service.name}</h3>
            <p className="service-desc">{service.description}</p>
            {typeof service.serviceCount === 'number' && (
              <p className="service-count">{service.serviceCount} dịch vụ</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
