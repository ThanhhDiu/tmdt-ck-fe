import React from 'react';
import "./orderTabs.css"

interface OrderTabsProps {
    activeTab: string;
    onChangeTab: (tab: string) => void;
}

export const OrderTabs: React.FC<OrderTabsProps> = ({ activeTab, onChangeTab }) => {
    const tabs = [
        { id: 'new', label: 'Yêu cầu mới' },
        { id: 'scheduled', label: 'Sắp hẹn' },
        { id: 'in-progress', label: 'Đang sửa' },
        { id: 'awaiting-payment', label: 'Chờ thanh toán' },
        { id: 'completed', label: 'Hoàn thành' },
        { id: 'warranty', label: 'Bảo hành' },
        { id: 'cancelled', label: 'Đã hủy' }
    ];

    return (
        <div className="order-tabs">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onChangeTab(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default OrderTabs;