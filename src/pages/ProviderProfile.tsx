import React, { useEffect, useState } from 'react';

import { useLocation, useSearchParams } from 'react-router-dom';

import { useCustomerNavigate } from '../components/layout/useCustomerNavigate';

import { ProfileHeader } from '../components/provider-profile/ProfileHeader';

import { ProfileTabs } from '../components/provider-profile/ProfileTabs';

import { AboutTab } from '../components/provider-profile/AboutTab';

import { ScheduleTab } from '../components/provider-profile/ScheduleTab';

import { ProjectsTab } from '../components/provider-profile/ProjectsTab';

import { ScheduleSidebar, VerificationSidebar, MapSidebar } from '../components/provider-profile/SidebarWidgets';

import { ChangePasswordTab } from '../components/provider-profile/ChangePasswordTab';

import { technicianService } from '../services/technician/technicianService';

import { mapDetailToProfileHeader } from '../utils/technicianMappers';

import { resolveTechnicianIdFromLocation } from '../utils/providerNavigation';

import type { ProfileHeaderProps } from '../components/provider-profile/ProfileHeader';

import './ProviderProfile.css';



const defaultProfile: ProfileHeaderProps = {

  name: 'Đang tải...',

  avatar: 'https://placehold.co/150x150',

  coverImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80',

  rating: 0,

  reviewCount: 0,

  completedJobs: '0',

  location: 'TP.HCM',

  isAvailable: false,

  type: 'normal',

  titleBadge: '',

};



export const ProviderProfile: React.FC = () => {

  const onNavigate = useCustomerNavigate();

  const location = useLocation();

  const [searchParams] = useSearchParams();

  const technicianId = resolveTechnicianIdFromLocation(searchParams, location.state);



  const [activeTab, setActiveTab] = useState(() => {

    const state = location.state as { activeTab?: string } | null;

    return state?.activeTab || 'about';

  });

  const [profileData, setProfileData] = useState<ProfileHeaderProps>(defaultProfile);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState<string | null>(null);



  useEffect(() => {

    if (!technicianId) {

      setIsLoading(false);

      setLoadError('Không xác định được thợ. Vui lòng mở lại từ danh sách thợ.');

      return;

    }



    let cancelled = false;



    const loadProfile = async () => {

      setIsLoading(true);

      setLoadError(null);



      try {

        const detail = await technicianService.getTechnician(technicianId);

        if (cancelled) return;

        setProfileData(mapDetailToProfileHeader(detail));

      } catch (error) {

        if (!cancelled) {

          setLoadError(

            error instanceof Error

              ? error.message

              : 'Không thể tải hồ sơ thợ. Vui lòng thử lại.'

          );

        }

      } finally {

        if (!cancelled) {

          setIsLoading(false);

        }

      }

    };



    loadProfile();



    return () => {

      cancelled = true;

    };

  }, [technicianId]);



  return (

    <div style={{ backgroundColor: '#f4f3ec', minHeight: '100vh' }}>

      <main className="pp-main-container">

        {isLoading && (

          <p style={{ padding: '24px', textAlign: 'center' }}>Đang tải hồ sơ thợ...</p>

        )}



        {!isLoading && loadError && (

          <p style={{ padding: '24px', textAlign: 'center', color: '#b91c1c' }}>{loadError}</p>

        )}



        {!isLoading && !loadError && (

          <>

            <ProfileHeader

              profile={profileData}

              onBack={() => onNavigate('find-provider')}

              onReviewsClick={() => setActiveTab('reviews')}

            />



            <ProfileTabs

              activeTab={activeTab}

              onTabChange={setActiveTab}

              reviewCount={profileData.reviewCount}

            />



            <div className="pp-layout">

              <div className="pp-content-left">

                {activeTab === 'about' && (

                  <AboutTab onViewAllReviews={() => setActiveTab('reviews')} />

                )}

                {activeTab === 'reviews' && <AboutTab onlyReviews />}

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

          </>

        )}

      </main>

    </div>

  );

};



export default ProviderProfile;

