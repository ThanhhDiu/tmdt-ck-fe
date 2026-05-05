import React, { useState } from 'react';
import './technicianHeader.css';
import { FaLocationDot, FaEye, FaEyeSlash } from 'react-icons/fa6';
import NotificationMenu from '../common/NotificationMenu';

export const TechnicianHeader: React.FC = () => {
    const [isOnline, setIsOnline] = useState(true);
    const [showBalance, setShowBalance] = useState(false);

    return (
        <header className="db-header">
            <div className="db-header-left">
                <div className="db-location">
                    <span className="icon"><FaLocationDot /></span>
                    <span className="text">TP. Hồ Chí Minh</span>
                </div>
            </div>

            <div className="db-header-right">
                {/* Số dư ví */}
                <div className="db-wallet-quick">
                    <span className="wallet-label">Số dư:</span>
                    <span className="wallet-amount">
                        {showBalance ? '1.250.000 ₫' : '******'}
                    </span>
                    <button
                        className="btn-icon toggle-eye"
                        onClick={() => setShowBalance(!showBalance)}
                        title={showBalance ? "Ẩn số dư" : "Hiện số dư"}
                    >
                        {showBalance ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>

                {/* Trạng thái nhận việc */}
                <div className={`db-status-toggle ${isOnline ? 'online' : 'offline'}`}>
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={isOnline}
                            onChange={() => setIsOnline(!isOnline)}
                        />
                        <span className="slider round"></span>
                    </label>
                    <span className="status-text">{isOnline ? 'Sẵn sàng' : 'Ngoại tuyến'}</span>
                </div>

                {/* Thông báo */}
                <NotificationMenu variant="dark" badgeStyle="count" />
            </div>
        </header>
    );
};

export default TechnicianHeader;
