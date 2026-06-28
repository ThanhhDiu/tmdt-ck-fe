import React from 'react';
import './FilterSidebar.css';
import { StarIcon } from '../common/Icons';

interface FilterSidebarProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  district?: string;
  minRating?: number;
  isAvailable?: boolean;
  onDistrictChange?: (district?: string) => void;
  onMinRatingChange?: (rating?: number) => void;
  onAvailabilityChange?: (value?: boolean) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  district,
  minRating,
  isAvailable,
  onDistrictChange,
  onMinRatingChange,
  onAvailabilityChange,
}) => {
  const districts = ['Quận 1, HCMC', 'Quận 7, HCMC', 'Thủ Đức, HCMC', 'Quận Bình Thạnh, HCMC'];

  return (
    <aside className="filter-sidebar">
      <div className="filter-section">
        <h3 className="filter-title">Lọc theo khu vực</h3>
        <div className="filter-options">
          <label className="filter-checkbox">
            <input
              type="radio"
              name="district"
              checked={!district}
              onChange={() => onDistrictChange?.(undefined)}
            />
            <span className="checkmark border-circle"></span>
            <span className="filter-text">Tất cả khu vực</span>
          </label>
          {districts.map((item) => (
            <label className="filter-checkbox" key={item}>
              <input
                type="radio"
                name="district"
                checked={district === item}
                onChange={() => onDistrictChange?.(item)}
              />
              <span className="checkmark border-circle"></span>
              <span className="filter-text">{item}</span>
            </label>
          ))}
        </div>

      </div>

      <div className="filter-section">
        <h3 className="filter-title">Trạng thái</h3>
        <div className="filter-options">
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={Boolean(isAvailable)}
              onChange={(event) => onAvailabilityChange?.(event.target.checked ? true : undefined)}
            />
            <span className="checkmark"></span>
            <span className="filter-text">Sẵn sàng nhận việc</span>
          </label>
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Đánh giá</h3>
        <div className="filter-options">
          <label className="filter-checkbox">
            <input
              type="radio"
              name="rating"
              checked={!minRating}
              onChange={() => onMinRatingChange?.(undefined)}
            />
            <span className="checkmark border-circle"></span>
            <span className="rating-text">Tất cả</span>
          </label>
          <label className="filter-checkbox">
            <input
              type="radio"
              name="rating"
              checked={minRating === 4}
              onChange={() => onMinRatingChange?.(4)}
            />
            <span className="checkmark border-circle"></span>
            <div className="filter-rating">
              <StarIcon size={14} className="star-icon text-yellow-500" />
              <StarIcon size={14} className="star-icon text-yellow-500" />
              <StarIcon size={14} className="star-icon text-yellow-500" />
              <StarIcon size={14} className="star-icon text-yellow-500" />
              <StarIcon size={14} className="star-icon text-gray-300" />
              <span className="rating-text">4.0+</span>
            </div>
          </label>
        </div>
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="pl-pagination" style={{ marginTop: '24px' }}>
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            &laquo;
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => onPageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            &raquo;
          </button>
        </div>
      )}
    </aside>
  );
};
