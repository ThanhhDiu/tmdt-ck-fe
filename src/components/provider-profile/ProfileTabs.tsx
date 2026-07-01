import React from 'react';
import './ProfileTabs.css';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  reviewCount?: number;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange, reviewCount = 0 }) => {
  const formatCount = (num: number) => num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num;
  const tabs = [
    { id: 'about', label: 'Giới thiệu' },
    { id: 'reviews', label: `Đánh giá (${formatCount(reviewCount)})` },
    { id: 'schedule', label: 'Lịch làm việc' },
  ];

  return (
    <div className="tabs-header">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
