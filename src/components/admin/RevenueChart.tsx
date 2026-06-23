import React from 'react';
import './RevenueChart.css';
import type { RevenueChartDataPoint } from '../../services/adminDashboardService.ts';

interface RevenueChartProps {
  chartData: RevenueChartDataPoint[];
  isLoading?: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ chartData, isLoading = false }) => {
  const data = chartData.length > 0 ? chartData : [{ day: '--', value: 0, max: 100 }];

  return (
    <div className="rc-chart-container">
      <div className="rc-chart">
        <div className="rc-y-axis">
          <div className="rc-y-label">100</div>
          <div className="rc-y-label">75</div>
          <div className="rc-y-label">50</div>
          <div className="rc-y-label">25</div>
          <div className="rc-y-label">0</div>
        </div>

        <div className="rc-chart-area">
          <svg className="rc-line-chart" viewBox="0 0 800 250" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((val, i) => (
              <line
                key={`grid-${i}`}
                x1="0"
                y1={`${100 - val}%`}
                x2="100%"
                y2={`${100 - val}%`}
                className="rc-grid-line"
              />
            ))}

            {/* Area fill */}
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Line path */}
            <polyline
              className="rc-line"
              points={data
                .map(
                  (d, i) =>
                    `${((i / (data.length - 1 || 1)) * 100).toFixed(2)},${(100 - d.value).toFixed(2)}`
                )
                .join(' ')}
              fill="none"
            />

            {/* Area fill path */}
            <polygon
              className="rc-area"
              points={`0,100 ${data
                .map(
                  (d, i) =>
                    `${((i / (data.length - 1 || 1)) * 100).toFixed(2)},${(100 - d.value).toFixed(2)}`
                )
                .join(' ')} ${100},100`}
              fill="url(#areaGradient)"
            />

            {/* Data points */}
            {data.map((d, i) => (
              <circle
                key={`point-${i}`}
                cx={`${((i / (data.length - 1 || 1)) * 100).toFixed(2)}%`}
                cy={`${(100 - d.value).toFixed(2)}%`}
                r="4"
                className="rc-point"
              />
            ))}
          </svg>

          <div className="rc-x-axis">
            {data.map((d, i) => (
              <div key={`label-${i}`} className="rc-x-label">
                {d.day}
              </div>
            ))}
          </div>
        </div>
      </div>

      {!isLoading && chartData.length === 0 && (
        <div className="rc-no-data">Chưa có dữ liệu doanh thu cho bộ lọc đã chọn.</div>
      )}

      <div className="rc-chart-legend">
        <div className="rc-legend-item rc-legend-current">
          <div className="rc-legend-dot"></div>
          <span>Doanh thu hiện tại</span>
        </div>
        <div className="rc-legend-item rc-legend-average">
          <div className="rc-legend-dot"></div>
          <span>Trung bình</span>
        </div>
      </div>
    </div>
  );
};
