import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useCustomerNavigate } from '../components/layout/useCustomerNavigate';
import { ProfileHeader } from '../components/provider-profile/ProfileHeader';
import { ProfileTabs } from '../components/provider-profile/ProfileTabs';
import { AboutTab } from '../components/provider-profile/AboutTab';
import { ScheduleTab } from '../components/provider-profile/ScheduleTab';
import { ProjectsTab } from '../components/provider-profile/ProjectsTab';
import { ScheduleSidebar, VerificationSidebar, MapSidebar } from '../components/provider-profile/SidebarWidgets';
import { ChangePasswordTab } from '../components/provider-profile/ChangePasswordTab';
import './ProviderProfile.css';

export const ProviderProfile: React.FC = () => {
  const onNavigate = useCustomerNavigate();
  const location = useLocation();
  const providerData = location.state as any;

  const [activeTab, setActiveTab] = useState(() => providerData?.activeTab || 'about');
  
  const defaultProfile = {
    name: 'Nguyễn Văn Hùng',
    avatar: 'https://i.pravatar.cc/150?img=33',
    coverImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80',
    rating: 4.9,
    reviewCount: 1240,
    completedJobs: '1.500+',
    location: 'Quận 1, HCMC',
    isAvailable: true,
    type: 'normal',
    titleBadge: ''
  };

  const profileData = providerData ? {
    ...defaultProfile,
    name: providerData.name,
    avatar: providerData.avatar,
    rating: providerData.rating || 4.9,
    reviewCount: providerData.reviewCount || 1240,
    location: providerData.location || 'Khu vực TP.HCM',
    type: providerData.type || 'normal',
    titleBadge: providerData.titleBadge || ''
  } : defaultProfile;

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh' }}>
      <main className="pp-main-container">
        <ProfileHeader profile={profileData} onBack={() => onNavigate('find-provider')} onReviewsClick={() => setActiveTab('reviews')} />
        
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} reviewCount={profileData.reviewCount} />

        <div className="pp-layout">
          <div className="pp-content-left">
            {activeTab === 'about' && <AboutTab onViewAllReviews={() => setActiveTab('reviews')} />}
            {activeTab === 'reviews' && <AboutTab onlyReviews={true} />}
            {activeTab === 'schedule' && <ScheduleTab />}
            {activeTab === 'projects' && <ProjectsTab />}
            {activeTab === 'security' && <ChangePasswordTab />}
          </div>
          {activeTab !== 'security' && (
            <div className="pp-sidebar-right">
              <ScheduleSidebar />
              <VerificationSidebar />
              <MapSidebar />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProviderProfile;
