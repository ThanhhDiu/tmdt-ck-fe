import React from 'react';
import './HeroSection.css';
import { BadgeCheckIcon } from '../common/Icons';

export const HeroSection: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <div className="badge-premium">DỊCH VỤ CAO CẤP</div>
          <h1 className="hero-title">
            Chăm sóc<br />ngôi nhà của bạn
          </h1>
          <p className="hero-description">
            Chuyên nghiệp & Tin cậy. Mang đẳng cấp dịch vụ hàng đầu bước không gian sống của bạn với đội ngũ kỹ thuật viên giàu kinh nghiệm.
          </p>
          <div className="hero-actions">
            <button className="btn-primary">Đặt lịch ngay</button>
            <button className="btn-secondary">Tìm hiểu thêm</button>
          </div>
        </div>

        <div className="hero-stats">

          <div className="stat-card">

            <div className="stat-header">

              <div className="stat-icon-wrapper">

                <BadgeCheckIcon size={24} className="stat-icon-svg" />

              </div>

              <div className="stat-info">

                <span className="stat-label">Đối tác uy tín</span>

                <h3 className="stat-value">1.200+ Chuyên gia</h3>

              </div>

            </div>

            <div className="stat-progress-bar">

              <div className="stat-progress-fill"></div>

            </div>

            <p className="stat-rating">Đánh giá 4.9/5 sao từ 50.000 khách hàng</p>

          </div>

        </div>
      </div>
    </section>
  );
};
