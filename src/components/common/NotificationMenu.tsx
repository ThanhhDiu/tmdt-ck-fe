import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon } from './Icons';
import './notificationMenu.css';
import { getStoredUser, isAuthenticated } from '../../services/auth';
import { navigateToChat } from '../../utils/chatNavigation';
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
} from '../../services/notificationService';

type NotificationMenuProps = {
  variant?: 'light' | 'dark';
  badgeStyle?: 'dot' | 'count';
};

const formatNotificationTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const NotificationMenu: React.FC<NotificationMenuProps> = ({
  variant = 'light',
  badgeStyle = 'dot',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated()) {
      setItems([]);
      setUnreadCount(0);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getMyNotifications(1, 10);
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } catch {
      setItems([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      return;
    }
    loadNotifications();
    // Chỉ tải một lần khi mount — tránh gọi API lặp khi component cha re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      loadNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      await markAllNotificationsAsRead();
      setItems((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Giữ trạng thái hiện tại nếu API lỗi
    }
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await markNotificationAsRead(item.id);
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id ? { ...entry, isRead: true } : entry
          )
        );
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch {
        // Bỏ qua nếu không đánh dấu được
      }
    }

    if (item.type === 'chat_message') {
      const conversationId =
        typeof item.data?.conversationId === 'string'
          ? item.data.conversationId
          : undefined;
      const orderId =
        typeof item.data?.orderId === 'string' && item.data.orderId
          ? item.data.orderId
          : undefined;
      const storedRole = getStoredUser()?.role?.toLowerCase() ?? '';
      const role = storedRole === 'technician' ? 'technician' : 'customer';
      setIsOpen(false);
      navigateToChat(navigate, role, {
        conversationId,
        orderId,
      });
    }
  };

  const triggerClassName =
    variant === 'dark'
      ? 'btn-icon notification notification-menu__trigger'
      : 'action-icon notification-menu__trigger';

  const showDotBadge = badgeStyle === 'dot' && unreadCount > 0;
  const showCountBadge = badgeStyle === 'count' && unreadCount > 0;

  return (
    <div
      ref={menuRef}
      className={`notification-menu ${variant === 'dark' ? 'notification-menu--dark' : ''}`}
    >
      <button
        type="button"
        className={triggerClassName}
        aria-label="Thông báo"
        aria-expanded={isOpen}
        onClick={handleToggle}
      >
        <BellIcon size={20} />
        {showDotBadge && <span className="notification-dot" aria-hidden="true" />}
        {showCountBadge && (
          <span className="badge" aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-menu__panel" role="menu" aria-label="Danh sách thông báo">
          <div className="notification-menu__header">
            <p className="notification-menu__title">Thông báo</p>
            <button
              type="button"
              className="notification-menu__mark-all"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
            >
              Đọc tất cả
            </button>
          </div>

          <div className="notification-menu__list">
            {isLoading && <p className="notification-menu__loading">Đang tải...</p>}
            {!isLoading && items.length === 0 && (
              <p className="notification-menu__empty">Chưa có thông báo</p>
            )}
            {!isLoading &&
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`notification-menu__item ${item.isRead ? '' : 'notification-menu__item--unread'}`}
                  onClick={() => handleItemClick(item)}
                >
                  <p className="notification-menu__item-title">{item.title}</p>
                  <p className="notification-menu__item-body">{item.body}</p>
                  <span className="notification-menu__item-time">
                    {formatNotificationTime(item.createdAt)}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;
