import React from 'react';
import {useNavigate} from 'react-router-dom';
import './technicianSidebar.css';

interface SidebarProps {
    activeItem?: string;
    onNavigate?: (page: string) => void;
}

export const TechnicianSidebar: React.FC<SidebarProps> = ({activeItem = 'dashboard', onNavigate}) => {
    const navigate = useNavigate();
    const menuItems = [
        {
            id: 'dashboard', label: 'Tổng quan', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                    <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                    <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                    <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                </svg>
            )
        },
        {
            id: 'jobs', label: 'Quản lý đơn hàng', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
            )
        },
        {
            id: 'messages', label: 'Tin nhắn', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            )
        },
        {
            id: 'wallet', label: 'Ví tiền của tôi', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
            )
        },
        {
            id: 'profile', label: 'Hồ sơ thợ', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            )
        },
    ];

    const pageMap: Record<string, string> = {
        dashboard: '/technician/provider-dashboard',
        jobs: '/technician/jobs',
        messages: '/technician/chat',
        wallet: '/technician/wallet',
        profile: '/technician/profile',
    };

    const handleNavigate = (itemId: string) => {
        if (onNavigate) {
            onNavigate(itemId);
            return;
        }

        const target = pageMap[itemId] || '/provider-dashboard';
        navigate(target);
    };

    return (
        <aside className="db-sidebar">
            <div className="db-sidebar-top">
                <div className="db-sidebar-brand">
                    <h2 className="db-sidebar-logo">GlowUp</h2>
                    <span className="db-sidebar-badge">Verified Provider</span>
                </div>

                <nav className="db-sidebar-nav">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`db-nav-item ${activeItem === item.id ? 'active' : ''}`}
                            onClick={() => handleNavigate(item.id)}
                        >
                            <span className="db-nav-icon">{item.icon}</span>
                            <span className="db-nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="db-sidebar-bottom">
                <div className="db-user-profile">
                    <img src="https://i.pravatar.cc/150?img=28" alt="User" className="db-user-avatar"/>
                    <div className="db-user-info">
                        <span className="db-user-name">Minh Nguyễn</span>
                        <span className="db-user-id">ID: #GP-8829</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};
