import React from 'react';
import './Footer.css';
import { FacebookIcon, InstagramIcon } from '../common/Icons';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <h2 className="footer-logo">GlowUp</h2>
            <p className="footer-desc">
              Giải pháp chăm sóc toàn diện với đội ngũ chuyên gia lành nghề.<br />100% đánh giá xác thực.
            </p>
          </div>

          <div className="footer-links">
            <a href="#">Quy chế hoạt động</a>
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Liên hệ</a>
          </div>

          <div className="footer-social">
            {/* Social icons */}
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
              <FacebookIcon size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
              <InstagramIcon size={20} />
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 GlowUp. Cùng bạn kiến tạo không gian sống tuyệt vời.</p>
        </div>
      </div>
    </footer>
  );
};
