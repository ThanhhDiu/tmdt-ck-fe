import React from 'react';
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
  CarIcon 
} from '../common/Icons';

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export const services: ServiceItem[] = [
  { id: '1', name: 'Máy lạnh', description: 'Vệ sinh & Bảo trì', icon: <SnowflakeIcon /> },
  { id: '2', name: 'Giặt ủi', description: 'Sạch tận cơ sở', icon: <WashingMachineIcon /> },
  { id: '3', name: 'Tủ lạnh', description: 'Bảo trì định kỳ', icon: <FridgeIcon /> },
  { id: '4', name: 'Dọn dẹp', description: 'Theo giờ / Định kỳ', icon: <BroomIcon /> },
  { id: '5', name: 'Điện nước', description: 'Sửa chữa 24/7', icon: <WrenchIcon /> },
  { id: '6', name: 'Côn trùng', description: 'Phun / Diệt triệt để', icon: <BugIcon /> },
  { id: '7', name: 'Lò vi sóng', description: 'Sửa chữa & Bảo trì', icon: <MicrowaveIcon /> },
  { id: '8', name: 'Xe hơi', description: 'Rửa & Chăm sóc', icon: <CarIcon /> },
];

export const PopularServices: React.FC = () => {
  const navigate = useNavigate();

  const handleServiceClick = (service: ServiceItem) => {
    navigate(`/provider?service=${encodeURIComponent(service.name)}`);
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
  );
};
