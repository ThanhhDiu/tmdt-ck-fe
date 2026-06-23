import React, { useState } from 'react';
import './ProfileHeader.css';
import { StarIcon, BadgeCheckIcon, ArrowLeftIcon } from '../common/Icons';
import RepairRequestModal from '../modal/RepairRequestModal';
import { useNavigate } from "react-router-dom";
import { navigateToChat } from "../../utils/chatNavigation";

export interface ProfileHeaderProps {
    technicianId?: string;
    name: string;
    avatar: string;
    coverImage: string;
    rating: number;
    reviewCount: number;
    completedJobs: string;
    location: string;
    isAvailable: boolean;
    type?: string;
    titleBadge?: string;
}

export const ProfileHeader: React.FC<{
    profile: ProfileHeaderProps,
    onBack?: () => void,
    onReviewsClick?: () => void
}> = ({ profile, onBack, onReviewsClick }) => {
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    return (
        <div className="profile-header-container">
            <div className="ph-cover-wrapper">
                <img src={profile.coverImage} alt="Cover" className="ph-cover-img" />
                <div className="ph-cover-overlay"></div>
                {onBack && (
                    <button className="ph-back-btn" onClick={onBack}>
                        <ArrowLeftIcon size={20} />
                    </button>
                )}
            </div>

            <div className="ph-content">
                <div className="ph-avatar-section">
                    <div className="ph-avatar-wrapper">
                        <img src={profile.avatar} alt={profile.name} className="ph-avatar-img" />
                        {profile.isAvailable && (
                            <div className="ph-status-badge">
                                <span className="dot"></span> Đang sẵn sàng
                            </div>
                        )}
                    </div>
                </div>

                <div className="ph-info-section">
                    <div className="ph-name-row">
                        <h1 className="ph-name">{profile.name}</h1>
                        {profile.type === 'premium' && profile.titleBadge && (
                            <div className="ph-premium-badge">{profile.titleBadge}</div>
                        )}
                    </div>

                    <div className="ph-stats-row">
                        <div className="ph-stat-item" style={{ cursor: 'pointer' }} onClick={onReviewsClick}>
                            <StarIcon size={16} className="star-icon text-yellow-500" />
                            <span className="ph-stat-desc ml-1">({profile.reviewCount} đánh giá)</span>
                        </div>
                        <span className="ph-dot">•</span>
                        <div className="ph-stat-item">
                            <BadgeCheckIcon size={16} className="text-gray-500" />
                            <span className="ph-stat-val ml-1">{profile.completedJobs} đơn hoàn thành</span>
                        </div>
                        <span className="ph-dot">•</span>
                        <div className="ph-stat-item location">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                strokeLinejoin="round" className="text-gray-500">
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span className="ph-stat-val ml-1">{profile.location}</span>
                        </div>
                    </div>
                </div>

                <div className="ph-action-section">
                    <button
                        className="ph-primary-btn"
                        onClick={() => {
                            if (!profile.technicianId) {
                                navigate("/customer/chat");
                                return;
                            }
                            navigateToChat(navigate, "customer", {
                                technicianId: profile.technicianId,
                            });
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Chat ngay & Nhận báo giá
                    </button>
                </div>
            </div>

            <RepairRequestModal
                open={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                provider={{
                    name: profile.name,
                    avatar: profile.avatar,
                    rating: profile.rating,
                    responseEta: 'Phản hồi trong ~5 phút',
                    area: profile.location,
                }}
            />
        </div>
    );
};
