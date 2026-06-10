import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCurrentUser, getStoredUser } from '../../services/auth'
import './technicianSidebar.css'

interface SidebarProps {
  activeItem?: string
  onNavigate?: (page: string) => void
}

export const TechnicianSidebar: React.FC<SidebarProps> = ({ activeItem = 'dashboard', onNavigate }) => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<{
    fullName: string
    code: string
    avatar: string
  }>({
    fullName: 'Kỹ thuật viên',
    code: 'TV-0000',
    avatar: '',
  })

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Bảng điều khiển',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      id: 'jobs',
      label: 'Quản lý đơn hàng',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      id: 'messages',
      label: 'Tin nhắn',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: 'wallet',
      label: 'Ví của tôi',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'Hồ sơ kỹ thuật viên',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ]

  const pageMap: Record<string, string> = {
    dashboard: '/technician/provider-dashboard',
    jobs: '/technician/jobs',
    messages: '/technician/chat',
    wallet: '/technician/wallet',
    profile: '/technician/profile',
  }

  const handleNavigate = (itemId: string) => {
    if (onNavigate) {
      onNavigate(itemId)
      return
    }

    navigate(pageMap[itemId] || '/technician/provider-dashboard')
  }

  useEffect(() => {
    const storedUser = getStoredUser()
    if (storedUser) {
      setProfile((current) => ({
        fullName: storedUser.fullName || current.fullName,
        code: storedUser.code || current.code,
        avatar: ('avatar' in storedUser && typeof storedUser.avatar === 'string' ? storedUser.avatar : '') || current.avatar,
      }))
    }

    let mounted = true

    const loadProfile = async () => {
      try {
        const user = await fetchCurrentUser()
        if (!mounted || !user) {
          return
        }

        setProfile({
          fullName: user.fullName || 'Kỹ thuật viên',
          code: user.code || 'TV-0000',
          avatar: ('avatar' in user && typeof user.avatar === 'string' ? user.avatar : '') || '',
        })
      } catch {
        // Keep local fallback when profile request fails.
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [])

  const avatarFallback = useMemo(() => {
    const parts = profile.fullName.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) {
      return 'KT'
    }

    return parts.slice(-2).map((part) => part.charAt(0).toUpperCase()).join('')
  }, [profile.fullName])

  return (
    <aside className="technician-sidebar">
      <div className="technician-sidebar-top">
        <div className="technician-sidebar-brand">
          <h2 className="technician-sidebar-logo">GlowUp</h2>
          <span className="technician-sidebar-badge">Khu vực kỹ thuật viên</span>
        </div>

        <nav className="technician-sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`technician-nav-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => handleNavigate(item.id)}
            >
              <span className="technician-nav-icon">{item.icon}</span>
              <span className="technician-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="technician-sidebar-bottom">
        <div className="technician-user-profile">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.fullName} className="technician-user-avatar" />
          ) : (
            <div className="technician-user-avatar technician-user-avatar--fallback">{avatarFallback}</div>
          )}
          <div className="technician-user-info">
            <span className="technician-user-name">{profile.fullName}</span>
            <span className="technician-user-id">ID: {profile.code}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
