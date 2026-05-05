import React, { useEffect, useMemo, useRef, useState } from 'react';
import './NotificationMenu.css';
import { BadgeCheckIcon, BellIcon, CheckCircleIcon, ClockIcon } from './Icons';

type NotificationVariant = 'light' | 'dark';
type NotificationBadgeStyle = 'dot' | 'count';
type NotificationTone = 'info' | 'success' | 'alert';
type NotificationFilter = 'all' | 'unread';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  isUnread?: boolean;
  tone?: NotificationTone;
  tag?: string;
}

interface NotificationMenuProps {
  items?: NotificationItem[];
  title?: string;
  variant?: NotificationVariant;
  badgeStyle?: NotificationBadgeStyle;
  align?: 'left' | 'right';
}

const defaultNotifications: NotificationItem[] = [
  {
    id: 'schedule-confirmed',
    title: 'Lịch hẹn đã được xác nhận',
    description: 'Khách hàng Nguyễn Minh Anh đã xác nhận lịch sửa máy lạnh lúc 14:30 hôm nay.',
    time: '2 phút trước',
    isUnread: true,
    tone: 'success',
    tag: 'Mới',
  },
  {
    id: 'new-message',
    title: 'Tin nhắn mới từ khách hàng',
    description: 'Khách vừa gửi thêm hình ảnh lỗi thiết bị để bạn báo giá chính xác hơn.',
    time: '12 phút trước',
    isUnread: true,
    tone: 'info',
    tag: 'Chat',
  },
  {
    id: 'payment-released',
    title: 'Thanh toán đã được giải ngân',
    description: '1.250.000 ₫ đã được cộng vào ví sau khi công việc hoàn tất.',
    time: '1 giờ trước',
    tone: 'success',
    tag: 'Ví',
  },
  {
    id: 'profile-reminder',
    title: 'Hoàn thiện hồ sơ xác minh',
    description: 'Bổ sung ảnh mặt sau CCCD để tăng tỉ lệ được duyệt hồ sơ trong hôm nay.',
    time: '3 giờ trước',
    isUnread: true,
    tone: 'alert',
    tag: 'Nhắc nhở',
  },
];

const toneIconMap = {
  info: BadgeCheckIcon,
  success: CheckCircleIcon,
  alert: ClockIcon,
} as const;

export const NotificationMenu: React.FC<NotificationMenuProps> = ({
  items = defaultNotifications,
  title = 'Thông báo',
  variant = 'light',
  badgeStyle = 'dot',
  align = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [menuItems, setMenuItems] = useState<NotificationItem[]>(items);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMenuItems(items);
  }, [items]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const unreadCount = useMemo(
    () => menuItems.filter((item) => item.isUnread).length,
    [menuItems],
  );

  const visibleItems = useMemo(() => {
    if (filter === 'unread') {
      return menuItems.filter((item) => item.isUnread);
    }

    return menuItems;
  }, [filter, menuItems]);

  const heroCopy = unreadCount > 0
    ? `Bạn có ${unreadCount} cập nhật cần xem ngay`
    : 'Mọi thông báo đã được xem';

  const markAllAsRead = () => {
    setMenuItems((currentItems) => currentItems.map((item) => ({ ...item, isUnread: false })));
  };

  const handleNotificationClick = (id: string) => {
    setMenuItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, isUnread: false } : item)),
    );
  };

  return (
    <div
      ref={wrapperRef}
      className={`notification-menu notification-menu--${variant} notification-menu--${align}`}
    >
      <button
        type="button"
        className={`notification-menu__trigger ${isOpen ? 'is-open' : ''}`}
        aria-label={title}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <BellIcon size={20} />
        {unreadCount > 0 && (
          <span className={`notification-menu__badge notification-menu__badge--${badgeStyle}`}>
            {badgeStyle === 'count' ? (unreadCount > 9 ? '9+' : unreadCount) : ''}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-menu__panel" role="dialog" aria-label={title}>
          <div className="notification-menu__hero">
            <div>
              <p className="notification-menu__eyebrow">Hộp thư của bạn</p>
              <h3 className="notification-menu__title">{title}</h3>
              <p className="notification-menu__hero-copy">{heroCopy}</p>
            </div>

            <button
              type="button"
              className="notification-menu__mark-all"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Đánh dấu đã đọc
            </button>
          </div>

          <div className="notification-menu__toolbar">
            <div className="notification-menu__filters">
              <button
                type="button"
                className={`notification-menu__filter ${filter === 'all' ? 'is-active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Tất cả
              </button>
              <button
                type="button"
                className={`notification-menu__filter ${filter === 'unread' ? 'is-active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                Chưa đọc
              </button>
            </div>

            <span className="notification-menu__summary">{menuItems.length} mục</span>
          </div>

          <div className="notification-menu__list">
            {visibleItems.length > 0 ? (
              visibleItems.map((item) => {
                const Icon = toneIconMap[item.tone ?? 'info'];

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`notification-menu__item ${item.isUnread ? 'is-unread' : ''}`}
                    onClick={() => handleNotificationClick(item.id)}
                  >
                    <span className={`notification-menu__icon notification-menu__icon--${item.tone ?? 'info'}`}>
                      <Icon size={18} />
                    </span>

                    <span className="notification-menu__content">
                      <span className="notification-menu__item-head">
                        <span className="notification-menu__item-title">{item.title}</span>
                        {item.tag ? <span className="notification-menu__tag">{item.tag}</span> : null}
                      </span>
                      <span className="notification-menu__item-text">{item.description}</span>
                      <span className="notification-menu__item-foot">
                        <span className="notification-menu__item-time">{item.time}</span>
                        {item.isUnread ? <span className="notification-menu__item-dot" /> : null}
                      </span>
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="notification-menu__empty">
                <CheckCircleIcon size={22} />
                <p>Không còn thông báo chưa đọc.</p>
              </div>
            )}
          </div>

          <button type="button" className="notification-menu__footer-action">
            Xem tất cả thông báo
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;
