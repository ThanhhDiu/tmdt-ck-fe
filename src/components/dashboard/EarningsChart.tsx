import React, { useMemo, useState } from 'react';
import type { ChartDataPoint } from '../../types/technician';
import './EarningsChart.css';

interface EarningsChartProps {
  weeklyData?: ChartDataPoint[];
  monthlyData?: ChartDataPoint[];
  loading?: boolean;
}

export const EarningsChart: React.FC<EarningsChartProps> = ({ weeklyData = [], monthlyData = [], loading = false }) => {
  const [period, setPeriod] = useState<'7' | '30'>('7');
  const data = useMemo(() => (period === '7' ? weeklyData : monthlyData), [monthlyData, period, weeklyData]);
  const maxValue = Math.max(...(data.length > 0 ? data.map((d) => d.value) : [1]));

  return (
    <div className="earnings-chart-card">
      <div className="earnings-chart-header">
        <h3 className="earnings-chart-title">Tổng quan doanh thu</h3>
        <div className="earnings-period-toggle">
          <button
            type="button"
            className={`period-btn ${period === '7' ? 'active' : ''}`}
            onClick={() => setPeriod('7')}
          >
            7 ngày
          </button>
          <button
            type="button"
            className={`period-btn ${period === '30' ? 'active' : ''}`}
            onClick={() => setPeriod('30')}
          >
            30 ngày
          </button>
        </div>
      </div>

      <div className="chart-area">
        {loading ? (
          <div className="chart-bars-container chart-bars-container--loading">
            {Array.from({ length: period === '7' ? 7 : 4 }).map((_, index) => (
              <div key={index} className="chart-bar-wrapper">
                <div className="chart-bar-group">
                  <div className="chart-bar-bg chart-bar-skeleton" />
                  <div className="chart-bar-main chart-bar-skeleton" />
                </div>
                <span className="chart-bar-label chart-bar-label--loading">...</span>
              </div>
            ))}
          </div>
        ) : data.length > 0 ? (
          <div className="chart-bars-container">
            {data.map((item, index) => {
              const heightPercent = Math.max(8, (item.value / maxValue) * 100);
              const isToday = item.label === 'Today' || item.label.toLowerCase() === 'today';
              return (
                <div key={`${item.label}-${index}`} className="chart-bar-wrapper">
                  <div className="chart-bar-group">
                    <div
                      className="chart-bar-bg"
                      style={{ height: `${heightPercent * 0.6}%` }}
                    ></div>
                    <div
                      className={`chart-bar-main ${isToday ? 'bar-today' : ''}`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className="bar-tooltip">
                        {item.value.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                  </div>
                  <span className={`chart-bar-label ${isToday ? 'label-today' : ''}`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="chart-empty-state">
            Không có dữ liệu doanh thu cho giai đoạn này.
          </div>
        )}
      </div>
    </div>
  );
};
