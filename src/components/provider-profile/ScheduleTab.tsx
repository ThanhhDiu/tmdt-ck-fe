import React, { useMemo } from 'react';
import type { BusySlotResponse, TechnicianScheduleSlot } from '../../types/technician';
import type { OrderResponse } from '../../types/order/order';
import { normalizeScheduleDayKey } from '../../services/technician/technicianService';
import './ScheduleTab.css';

interface ScheduleTabProps {
  schedule?: TechnicianScheduleSlot[];
  busySlots?: BusySlotResponse[];
}

const WEEK_DAYS = [
  { key: 'sunday', label: 'Chủ nhật' },
  { key: 'monday', label: 'Thứ 2' },
  { key: 'tuesday', label: 'Thứ 3' },
  { key: 'wednesday', label: 'Thứ 4' },
  { key: 'thursday', label: 'Thứ 5' },
  { key: 'friday', label: 'Thứ 6' },
  { key: 'saturday', label: 'Thứ 7' },
];

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseOrderDate = (slot: BusySlotResponse) => {
  const rawDate = slot.scheduledAt ?? slot.expectedTime;
  if (!rawDate) return null;

  const date = new Date(rawDate);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isActiveBookedOrder = (slot: BusySlotResponse) => {
  const status = (slot.status ?? '').toLowerCase();
  return !status.includes('cancel');
};

const formatDate = (date: Date) =>
  date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });

const formatTime = (date: Date) =>
  date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

const formatSlot = (slot?: TechnicianScheduleSlot, bookedCount = 0) => {
  if (bookedCount > 0) return `Đã có ${bookedCount} lịch hẹn`;
  if (!slot) return 'Chưa cập nhật';
  if (slot.label) return slot.label;
  if (slot.status === 'full') return 'Đã kín lịch';
  if (slot.status === 'off') return 'Nghỉ / chưa nhận lịch';
  if (slot.startTime && slot.endTime) return `${slot.startTime} - ${slot.endTime}`;
  return 'Còn trống';
};

const getSlotTone = (slot?: TechnicianScheduleSlot, bookedCount = 0) => {
  if (bookedCount > 0) return 'booked';
  if (!slot || slot.status === 'off') return 'off';
  if (slot.status === 'full') return 'full';
  return 'available';
};

export const ScheduleTab: React.FC<ScheduleTabProps> = ({ schedule = [], busySlots = [] }) => {
  const upcomingDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(today, index);
      const weekday = WEEK_DAYS[date.getDay()];
      return {
        ...weekday,
        date,
        dateKey: toDateKey(date),
      };
    });
  }, []);

  const slotsByDay = useMemo(() => {
    const map = new Map<string, TechnicianScheduleSlot>();
    schedule.forEach((slot) => {
      const key = normalizeScheduleDayKey(slot.dayOfWeek ?? slot.date);
      if (key && !map.has(key)) {
        map.set(key, slot);
      }
    });
    return map;
  }, [schedule]);

  const ordersByDate = useMemo(() => {
    const map = new Map<string, Array<{ slotInfo: BusySlotResponse; date: Date }>>();

    busySlots.filter(isActiveBookedOrder).forEach((slotInfo) => {
      const date = parseOrderDate(slotInfo);
      if (!date) return;

      const dateKey = toDateKey(date);
      const items = map.get(dateKey) ?? [];
      items.push({ slotInfo, date });
      map.set(dateKey, items);
    });

    return map;
  }, [busySlots]);

  const availableSlots = upcomingDays
    .map((day) => {
      const slot = slotsByDay.get(day.key);
      const bookedCount = ordersByDate.get(day.dateKey)?.length ?? 0;
      return {
        ...day,
        slot,
        bookedCount,
      };
    })
    .filter(({ slot, bookedCount }) => slot && getSlotTone(slot, bookedCount) === 'available');

  return (
    <div className="profile-card schedule-tab-card">
      <div className="schedule-tab-header">
        <div>
          <h2 className="pc-title">Lịch làm việc 7 ngày tới</h2>
          <p className="pc-text">
            Theo dõi ngày thợ đang mở lịch và những ngày đã có đơn hẹn.
          </p>
        </div>
      </div>

      <div className="schedule-week-grid">
        {upcomingDays.map((day) => {
          const slot = slotsByDay.get(day.key);
          const dayOrders = ordersByDate.get(day.dateKey) ?? [];
          const tone = getSlotTone(slot, dayOrders.length);

          return (
            <div key={day.dateKey} className={`schedule-day-card schedule-day-card--${tone}`}>
              <div className="schedule-day-top">
                <span className="schedule-day-label">{day.label}</span>
                <span className="schedule-day-date">{formatDate(day.date)}</span>
              </div>
              <div className="schedule-day-time">{formatSlot(slot, dayOrders.length)}</div>
              {dayOrders.length > 0 && (
                <div className="schedule-booked-list">
                  {/* Map đúng mã đơn orderCode từ API mới */}
                  {dayOrders.slice(0, 2).map(({ slotInfo, date }) => (
                    <span key={slotInfo.orderCode}>
                      #{slotInfo.orderCode} - {formatTime(date)}
                    </span>
                  ))}
                  {dayOrders.length > 2 && <span>+{dayOrders.length - 2} đơn khác</span>}
                </div>
              )}
              <span className="schedule-day-status">
                {tone === 'booked'
                  ? 'Đã đặt lịch'
                  : tone === 'available'
                    ? 'Còn trống'
                    : tone === 'full'
                      ? 'Đã kín'
                      : 'Chưa mở lịch'}
              </span>
            </div>
          );
        })}
      </div>

      {/* <section className="schedule-available-section">
        <h3>Khung giờ trống trong 7 ngày tới</h3>
        {availableSlots.length === 0 ? (
          <div className="schedule-empty-state">Thợ chưa có khung giờ trống trong 7 ngày tới.</div>
        ) : (
          <div className="schedule-available-list">
            {availableSlots.map(({ dateKey, label, date, slot }) => (
              <div key={dateKey} className="schedule-available-row">
                <div>
                  <strong>{label}</strong>
                  <span>{formatDate(date)}</span>
                </div>
                <p>{formatSlot(slot)}</p>
              </div>
            ))}
          </div>
        )}
      </section> */}
    </div>
  );
};
