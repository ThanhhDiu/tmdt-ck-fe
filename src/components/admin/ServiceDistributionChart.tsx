import React from 'react';
import './ServiceDistributionChart.css';
import type { ServiceDistributionDataPoint } from '../../services/adminDashboardService.ts';

interface ServiceData {
  name: string;
  percentage: number;
  color: string;
}

interface ServiceDistributionChartProps {
  services: ServiceDistributionDataPoint[];
  isLoading?: boolean;
}

export const ServiceDistributionChart: React.FC<ServiceDistributionChartProps> = ({ services, isLoading = false }) => {
  const chartServices: ServiceData[] = services.length > 0
    ? services
    : [{ name: 'Chưa có dữ liệu', percentage: 100, color: '#cbd5e1' }];

  // Calculate angles for pie chart
  let currentAngle = -90;
  const segments = chartServices.map((service) => {
    const startAngle = currentAngle;
    const endAngle = currentAngle + (service.percentage / 100) * 360;
    const isLarge = service.percentage > 50 ? 1 : 0;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = Math.cos(startRad);
    const y1 = Math.sin(startRad);
    const x2 = Math.cos(endRad);
    const y2 = Math.sin(endRad);

    const pathData = `M 0 0 L ${x1} ${y1} A 1 1 0 ${isLarge} 1 ${x2} ${y2} Z`;

    currentAngle = endAngle;

    return { service, startAngle, endAngle, pathData };
  });

  return (
    <div className="sdc-container">
      <div className="sdc-chart">
        <svg className="sdc-pie" viewBox="-1.2 -1.2 2.4 2.4" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="sdc-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          </defs>

          {segments.map((segment, index) => (
            <g key={index} className="sdc-segment" style={{ '--segment-color': segment.service.color } as React.CSSProperties}>
              <path
                d={segment.pathData}
                fill={segment.service.color}
                opacity="0.9"
                filter="url(#sdc-shadow)"
                className="sdc-segment-path"
              />
              {/* Center circle for donut effect */}
              <circle cx="0" cy="0" r="0.55" fill="#fff" />
            </g>
          ))}

          {/* Center percentage */}
          <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" className="sdc-center-text">
            100%
          </text>
        </svg>
      </div>

      <div className="sdc-legend">
        {chartServices.map((service, index) => (
          <div key={index} className="sdc-legend-item">
            <div className="sdc-legend-color" style={{ backgroundColor: service.color }}></div>
            <div className="sdc-legend-content">
              <span className="sdc-legend-name">{service.name}</span>
              <span className="sdc-legend-percentage">{service.percentage}%</span>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && services.length === 0 && (
        <div className="sdc-no-data">Chưa có dữ liệu tỷ trọng dịch vụ.</div>
      )}
    </div>
  );
};
