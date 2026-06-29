import React, { useEffect, useState } from 'react';

import { useLocation, useSearchParams } from 'react-router-dom';

import { useCustomerNavigate } from '../components/layout/useCustomerNavigate';
import { Header } from '../components/layout/Header';

import { ProfileHeader } from '../components/provider-profile/ProfileHeader';

import { ProfileTabs } from '../components/provider-profile/ProfileTabs';

import { AboutTab } from '../components/provider-profile/AboutTab';

import { ScheduleTab } from '../components/provider-profile/ScheduleTab';

import { ScheduleSidebar, VerificationSidebar, MapSidebar } from '../components/provider-profile/SidebarWidgets';

import { normalizeTechnicianSchedule, technicianService } from '../services/technician/technicianService';
import { orderService } from '../services/order/orderService';

import { mapDetailToProfileHeader } from '../utils/technicianMappers';

import { resolveTechnicianIdFromLocation } from '../utils/providerNavigation';

import type { ProfileHeaderProps } from '../components/provider-profile/ProfileHeader';
import type { TechnicianDetail, TechnicianReview, TechnicianScheduleSlot } from '../types/technician';
import type { OrderResponse } from '../types/order/order';

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

    return state?.activeTab === 'security' || state?.activeTab === 'projects' ? 'about' : state?.activeTab || 'about';

  });

  const [profileData, setProfileData] = useState<ProfileHeaderProps>(defaultProfile);
  const [detailData, setDetailData] = useState<TechnicianDetail | null>(null);
  const [reviews, setReviews] = useState<TechnicianReview[]>([]);
  const [schedule, setSchedule] = useState<TechnicianScheduleSlot[]>([]);
  const [technicianOrders, setTechnicianOrders] = useState<OrderResponse[]>([]);

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

        const [reviewItems, orderItems] = await Promise.all([
          technicianService.getTechnicianReviews(technicianId).catch(() => detail.reviews ?? []),
          orderService.listTechnicianOrders(technicianId, { size: 100 }).catch(() => []),
        ]);

        if (cancelled) return;

        setDetailData(detail);
        setReviews((reviewItems ?? []).filter(Boolean) as TechnicianReview[]);
        setSchedule(normalizeTechnicianSchedule(detail.schedule));
        setTechnicianOrders((orderItems ?? []).filter(Boolean) as OrderResponse[]);
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

      <Header onNavigate={onNavigate} />

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

              onBack={() => onNavigate('provider')}

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

                  <AboutTab detail={detailData} reviews={reviews} onViewAllReviews={() => setActiveTab('reviews')} />

                )}

                {activeTab === 'reviews' && <AboutTab detail={detailData} reviews={reviews} onlyReviews />}

                {activeTab === 'schedule' && <ScheduleTab schedule={schedule} bookedOrders={technicianOrders} />}

              </div>

              <div className="pp-sidebar-right">

                <ScheduleSidebar />

                <VerificationSidebar />

                <MapSidebar />

              </div>


            </div>

          </>

        )}

      </main>

    </div>

  );

};



export default ProviderProfile;

