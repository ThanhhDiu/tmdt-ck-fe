import React, { useMemo } from 'react';
import './TodaySchedule.css';
import type { OrderResponse } from '../../types/order/order';
import type { BusySlotResponse, TechnicianScheduleSlot } from '../../types/technician';

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  address: string;
  status: 'done' | 'in-progress' | 'upcoming';
}

interface TodayScheduleProps {
  schedule?: TechnicianScheduleSlot[];
  busySlots?: BusySlotResponse[];
}

const statusDot: Record<string, string> = {
  'done': '#3b82f6',
  'in-progress': '#e2af74',
  'upcoming': '#cbd5e1',
};

export const TodaySchedule: React.FC<TodayScheduleProps> = ({ schedule = [], busySlots = [] }) => {
  
  // Logic map dữ liệu thực từ bookedOrders
  const scheduleData: ScheduleItem[] = useMemo(() => {
    const today = new Date().toDateString();
    
    return busySlots
      .filter(slot => {
        const rawDate = slot.scheduledAt ?? slot.expectedTime;
        const slotDate = rawDate ? new Date(rawDate).toDateString() : '';
        return slotDate === today;
      })
      .map(slot => {
        const rawDate = slot.scheduledAt ?? slot.expectedTime;
        const date = new Date(rawDate || '');
        const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        
        // Xác định trạng thái dựa trên status của đơn
        let status: 'done' | 'in-progress' | 'upcoming' = 'upcoming';
        const statusUpper = (slot.status || '').toUpperCase();
        if (statusUpper === 'COMPLETED') status = 'done';
        else if (statusUpper === 'IN_PROGRESS') status = 'in-progress';
        
        return {
          id: slot.orderCode,
          time: timeStr,
          title: slot.deviceName || 'Khung giờ đã bận', // Fallback an toàn
          address: slot.address || '---',
          status
        };
      })
      .sort((a, b) => a.time.localeCompare(b.time)); // Sắp xếp theo thời gian
  }, [busySlots]);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="schedule-card">
      <div className="schedule-header">
        <h3 className="schedule-title">Lịch trình hôm nay</h3>
        <span className="schedule-date">{formattedDate}</span>
      </div>

      <div className="schedule-timeline">
        {scheduleData.length > 0 ? (
          scheduleData.map((item, index) => (
            <div key={item.id} className={`schedule-item status-${item.status}`}>
              <div className="timeline-line-wrapper">
                <div className="timeline-dot" style={{ backgroundColor: statusDot[item.status] }}></div>
                {index < scheduleData.length - 1 && <div className="timeline-line"></div>}
              </div>
              <div className="schedule-content">
                <span className="schedule-time">{item.time}</span>
                <h4 className="schedule-task-title">{item.title}</h4>
                <p className="schedule-address">{item.address}</p>
                {item.status === 'done' && <span className="schedule-status-badge badge-done">DONE</span>}
              </div>
            </div>
          ))
        ) : (
          <div className="schedule-empty">Hôm nay chưa có lịch hẹn nào.</div>
        )}
      </div>
    </div>
  );
};