import React from 'react';
import './ProviderCard.css';
import {BadgeCheckIcon, StarIcon} from '../common/Icons';


export interface ProviderProps {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    location: string;
    skills: string[];
    price: string;
    isAvailable: boolean;
    timeAvailable?: string;
}

export const ProviderCard: React.FC<{
    provider: ProviderProps;
    onNavigate?: (page: string, data?: any) => void
}> = ({provider, onNavigate}) => {

    return (
        <div className="provider-card">
            <div className="pc-top">
                <div className="pc-avatar-wrapper">
                    <img src={provider.avatar} alt={provider.name} className="pc-avatar"/>
                    <div className="pc-verified-badge"><BadgeCheckIcon size={12}/></div>
                </div>

                <div className="pc-main-info">
                    <div className="pc-header-row">
                        <h3 className="pc-name">{provider.name}</h3>
                        <div className="pc-price-section">
                            <span className="pc-price">{provider.price}</span><span
                            className="pc-price-unit">/giờ</span>
                        </div>
                    </div>

                    <div className="pc-meta-row">
                        <div className="pc-rating">
                            <StarIcon size={14} className="star-icon"/>
                            <span className="pc-rating-val">{provider.rating}</span>
                            <span className="pc-review-count">({provider.reviewCount} đánh giá)</span>
                        </div>
                        <span className="pc-dot">•</span>
                        <span className="pc-location">{provider.location}</span>
                        <div className="pc-availability-container">
                            {provider.isAvailable ? (
                                <span className="pc-avail-now">Sẵn sàng ngay</span>
                            ) : (
                                <span className="pc-avail-later">Bận đến {provider.timeAvailable}</span>
                            )}
                        </div>
                    </div>

                    <div className="pc-skills">
                        {provider.skills.map(skill => (
                            <span key={skill} className="pc-skill-tag">{skill}</span>
                        ))}
                    </div>

                    <div className="pc-actions">
                        <button className="pc-btn-outline"
                                onClick={() => onNavigate?.('provider-profile', { id: provider.id, name: provider.name, avatar: provider.avatar })}>Xem hồ sơ
                        </button>
                        <button
                            className="pc-btn-solid"
                            onClick={() => onNavigate?.('open-modal', provider)}
                        >
                            Gửi yêu cầu
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};
