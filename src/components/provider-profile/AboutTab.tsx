import React, { useState } from 'react';
import './AboutTab.css';
import { StarIcon } from '../common/Icons';
import type { TechnicianDetail, TechnicianReview } from '../../types/technician';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const formatTimeAgo = (value?: string | null): string => {
  if (!value) return 'Vừa xong';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return `${Math.max(1, minutes)} phút trước`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.round(hours / 24)} ngày trước`;
};

export const AboutTab: React.FC<{
  onlyReviews?: boolean;
  onViewAllReviews?: () => void;
  detail?: TechnicianDetail | null;
  reviews?: TechnicianReview[];
}> = ({ onlyReviews, onViewAllReviews, detail, reviews = [] }) => {
  const [visibleCount, setVisibleCount] = useState(5);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : Number(detail?.rating ?? 0);
  const roundedRating = Number.isFinite(averageRating) ? averageRating.toFixed(1) : '0.0';

  return (
    <div className="about-tab-container">
      {!onlyReviews && (
        <div className="profile-card">
          <h2 className="pc-title">Về tôi</h2>
          <p className="pc-text">
            {detail?.bio || 'Thợ chưa cập nhật mô tả chi tiết. Bạn có thể xem đánh giá và lịch làm việc để cân nhắc trước khi gửi yêu cầu.'}
          </p>
          <div className="pc-skills-wrapper">
            {(detail?.skills ?? []).map((skill) => (
              <span key={skill} className="pc-skill-pill">{skill}</span>
            ))}
            {(detail?.skills ?? []).length === 0 && <span className="pc-skill-pill">Chưa cập nhật kỹ năng</span>}
          </div>
        </div>
      )}

      <div className="profile-card">
        <div className="review-header">
          <h2 className="pc-title mb-0">Đánh giá thực tế</h2>
          <div className="avg-rating-box">
            <span className="avg-rating-num">{roundedRating}</span>
            <div className="avg-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} size={16} className={star <= Math.round(averageRating) ? 'star-solid' : 'star-empty'} />
              ))}
            </div>
            <span className="review-count">({reviews.length || detail?.reviewCount || 0} đánh giá)</span>
          </div>
        </div>

        <div className="review-list">
          {reviews.length === 0 && (
            <div className="review-item">
              <p className="review-content">Chưa có đánh giá nào cho thợ này.</p>
            </div>
          )}
          {reviews.slice(0, visibleCount).map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-item-header">
                <img
                  src={resolveMediaUrl(review.authorAvatar) || 'https://placehold.co/80x80'}
                  alt={review.authorName || 'Khách hàng'}
                  className="review-avatar"
                />
                <div className="review-author-info">
                  <h4 className="review-author-name">{review.authorName || 'Khách hàng'}</h4>
                  <span className="review-time">{formatTimeAgo(review.createdAt)}</span>
                </div>
                <div className="review-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon key={star} size={12} className={star <= review.rating ? 'star-solid' : 'star-empty'} />
                  ))}
                </div>
              </div>
              <p className="review-content">{review.comment || 'Khách hàng không để lại bình luận.'}</p>
              {(review.images ?? []).map((image) => (
                <div key={image} className="review-attachment">
                  <img src={resolveMediaUrl(image) ?? image} alt="Attachment" className="review-img" />
                </div>
              ))}
            </div>
          ))}
        </div>

        {onlyReviews ? (
          visibleCount < reviews.length && (
            <button className="view-more-btn" onClick={() => setVisibleCount((value) => value + 3)}>Xem thêm</button>
          )
        ) : (
          reviews.length > 0 && <button className="view-more-btn" onClick={onViewAllReviews}>Xem tất cả</button>
        )}
      </div>
    </div>
  );
};
