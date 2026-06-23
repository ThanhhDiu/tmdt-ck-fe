import React from 'react';
import './PremiumProviderCard.css';

export interface PremiumProviderProps {
  id: string;
  name: string;
  avatar: string;
  titleBadge: string;
  description: string;
}

export const PremiumProviderCard: React.FC<{ provider: PremiumProviderProps; onNavigate?: (page: string, data?: any) => void }> = ({ provider, onNavigate }) => {
  return (
    <div className="premium-provider-card">
      <div className="ppc-bg-decoration"></div>
      
      <div className="ppc-content">
        <div className="ppc-avatar-wrapper">
          <img src={provider.avatar} alt={provider.name} className="ppc-avatar" />
        </div>
        
        <div className="ppc-info-section">
          <div className="ppc-badge-wrapper">
            <span className="ppc-badge">{provider.titleBadge}</span>
          </div>
          <h3 className="ppc-name">{provider.name}</h3>
          <p className="ppc-desc">{provider.description}</p>
          <button className="ppc-btn" onClick={() => onNavigate?.('provider-profile', { id: provider.id, name: provider.name, avatar: provider.avatar })}>Xem hồ sơ đặc biệt</button>
        </div>
      </div>
    </div>
  );
};
