import React, { useEffect, useState } from 'react';
import './TopExperts.css';
import { StarIcon, BadgeCheckIcon, CheckCircleIcon, ClockIcon } from '../common/Icons';
import { technicianService } from '../../services/technician/technicianService';
import { toNumber } from '../../utils/technicianMappers';

type ExpertCard = {
  id: string;
  name: string;
  title: string;
  rating: number;
  experience: string;
  completedJobs: string;
  badge: string;
  imageUrl: string;
};

export const TopExperts: React.FC<{ onNavigate?: (page: string, data?: Record<string, unknown>) => void }> = ({
  onNavigate,
}) => {
  const [experts, setExperts] = useState<ExpertCard[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await technicianService.listTechnicians({ page: 1, limit: 6 });
        const premium = data.items
          .filter((item) => item.type === 'premium')
          .slice(0, 3)
          .map((item) => ({
            id: item.id,
            name: item.fullName,
            title: item.titleBadge || item.skills?.[0] || 'Kỹ thuật viên',
            rating: toNumber(item.rating, 0),
            experience: 'Chuyên nghiệp',
            completedJobs: `${item.completedJobs ?? 0} đơn`,
            badge: item.titleBadge || 'CHUYÊN GIA',
            imageUrl: item.avatar || 'https://placehold.co/150x150',
          }));

        if (!cancelled) {
          setExperts(premium);
        }
      } catch {
        if (!cancelled) {
          setExperts([]);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleExpertClick = (expert: ExpertCard) => {
    onNavigate?.('provider-profile', {
      id: expert.id,
      name: expert.name,
      avatar: expert.imageUrl,
      rating: expert.rating,
      location: 'TP. Hồ Chí Minh',
      type: 'premium',
      titleBadge: expert.badge,
    });
  };

  if (experts.length === 0) {
    return null;
  }

  return (
    <section className="experts-section">
      <div className="experts-header">
        <h2 className="section-title text-center">Chuyên gia hàng đầu</h2>
        <p className="section-subtitle text-center">
          Đội ngũ kỹ thuật viên có tay nghề cao, đã được xác minh 100% với trên 5 năm kinh nghiệm thực chiến.
        </p>
      </div>

      <div className="experts-grid">
        {experts.map((expert) => (
          <div
            key={expert.id}
            className="expert-card"
            onClick={() => handleExpertClick(expert)}
            style={{ cursor: 'pointer' }}
          >
            <div className="badge-tier badge-diamond">
              {expert.badge}
            </div>

            <div className="expert-info-top">
              <div className="expert-avatar-wrapper">
                <img src={expert.imageUrl} alt={expert.name} className="expert-avatar" />
                <div className="verified-badge">
                  <BadgeCheckIcon size={12} />
                </div>
              </div>
              <div className="expert-name-title">
                <h3 className="expert-name">{expert.name}</h3>
                <p className="expert-title">{expert.title}</p>
                <div className="expert-rating">
                  <StarIcon size={14} className="star-icon" />
                  <span className="rating-value">{expert.rating}</span>
                </div>
              </div>
            </div>

            <div className="expert-stats">
              <div className="stat-item">
                <ClockIcon size={16} className="stat-icon" />
                <span>Kinh nghiệm: {expert.experience}</span>
              </div>
              <div className="stat-item">
                <CheckCircleIcon size={16} className="stat-icon" />
                <span>Hoàn thành: {expert.completedJobs}</span>
              </div>
            </div>

            <button type="button" className="btn-request">
              Gửi yêu cầu →
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
