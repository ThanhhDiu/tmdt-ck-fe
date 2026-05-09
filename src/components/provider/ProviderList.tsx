import React, { useState, useMemo, useEffect } from 'react';
import './ProviderList.css';
import { ProviderCard } from './ProviderCard';
import { PremiumProviderCard } from './PremiumProviderCard';
import { ChevronDownIcon } from '../common/Icons';
import RepairRequestModal from "../modal/RepairRequestModal.tsx";

/** Bảng mapping: tên dịch vụ (PopularServices) → các skill tương ứng của thợ */
const SERVICE_SKILL_MAP: Record<string, string[]> = {
    'Máy lạnh': ['Sửa điện lạnh', 'Bảo trì máy lạnh', 'Hệ thống thông gió', 'Vệ sinh máy lạnh', 'Lắp đặt máy lạnh'],
    'Giặt ủi': ['Giặt ủi chuyên nghiệp', 'Vệ sinh máy giặt', 'Giặt thảm', 'Giặt rèm cửa'],
    'Tủ lạnh': ['Sửa tủ lạnh', 'Bảo trì tủ lạnh', 'Vệ sinh tủ lạnh'],
    'Dọn dẹp': ['Dọn dẹp nhà cửa', 'Vệ sinh công nghiệp', 'Dọn dẹp theo giờ', 'Tổng vệ sinh'],
    'Điện nước': ['Sửa điện dân dụng', 'Sửa ống nước', 'Thông tắc ống nước', 'Lắp đặt thiết bị vệ sinh', 'Lắp đặt điện'],
    'Côn trùng': ['Phun diệt côn trùng', 'Diệt mối', 'Xử lý mối mọt'],
    'Lò vi sóng': ['Sửa lò vi sóng', 'Thay linh kiện lò vi sóng', 'Vệ sinh lò vi sóng'],
    'Xe hơi': ['Rửa xe tận nơi', 'Chăm sóc nội thất ô tô', 'Đánh bóng sơn xe'],
};

const allProviders = [
    // === Top Experts (Premium) ===
    {
        type: 'premium', id: 'p1', name: 'Nguyễn Văn Minh',
        avatar: 'https://i.pravatar.cc/150?img=11', titleBadge: 'CHUYÊN GIA KIM CƯƠNG',
        description: 'Chuyên gia Máy lạnh với 8 năm kinh nghiệm và hơn 1.450 đơn hàng hoàn thành.',
        skills: ['Sửa điện lạnh', 'Bảo trì máy lạnh', 'Hệ thống thông gió'],
        reviewCount: 1450,
    },
    {
        type: 'premium', id: 'p2', name: 'Lê Thị Tuyết',
        avatar: 'https://i.pravatar.cc/150?img=5', titleBadge: 'CHUYÊN GIA BẠCH KIM',
        description: 'Chuyên gia Vệ sinh với 5 năm kinh nghiệm và 900 đơn hàng hoàn thành.',
        skills: ['Dọn dẹp nhà cửa', 'Vệ sinh công nghiệp', 'Giặt ủi chuyên nghiệp'],
        reviewCount: 900,
    },
    {
        type: 'premium', id: 'p3', name: 'Phạm Hoàng Nam',
        avatar: 'https://i.pravatar.cc/150?img=8', titleBadge: 'CHUYÊN GIA VÀNG',
        description: 'Kỹ thuật viên Điện nước với 6 năm kinh nghiệm, hoàn thành 1.120 đơn hàng.',
        skills: ['Sửa điện dân dụng', 'Sửa ống nước', 'Lắp đặt điện'],
        reviewCount: 1120,
    },

    // === Máy lạnh ===
    {
        type: 'normal', id: '1', name: 'Nguyễn Minh Tuấn',
        avatar: 'https://i.pravatar.cc/150?img=13', rating: 4.9, reviewCount: 124,
        location: '25 Bis Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
        skills: ['Sửa điện lạnh', 'Bảo trì máy lạnh', 'Hệ thống thông gió'],
        price: '250.000đ', isAvailable: true
    },
    {
        type: 'normal', id: '10', name: 'Trịnh Hoàng Phúc',
        avatar: 'https://i.pravatar.cc/150?img=57', rating: 4.6, reviewCount: 73,
        location: '88 Lê Văn Sỹ, Quận 3, TP.HCM',
        skills: ['Vệ sinh máy lạnh', 'Lắp đặt máy lạnh', 'Bảo trì máy lạnh'],
        price: '220.000đ', isAvailable: true
    },

    // === Điện nước ===
    {
        type: 'normal', id: '2', name: 'Phạm Hoài Nam',
        avatar: 'https://i.pravatar.cc/150?img=55', rating: 4.8, reviewCount: 98,
        location: '152 Nguyễn Lương Bằng, Quận 7, TP.HCM',
        skills: ['Thông tắc ống nước', 'Lắp đặt thiết bị vệ sinh'],
        price: '200.000đ', isAvailable: false, timeAvailable: '14:00'
    },
    {
        type: 'normal', id: '11', name: 'Đặng Văn Khoa',
        avatar: 'https://i.pravatar.cc/150?img=60', rating: 4.5, reviewCount: 45,
        location: '201 Điện Biên Phủ, Bình Thạnh, TP.HCM',
        skills: ['Sửa điện dân dụng', 'Sửa ống nước', 'Lắp đặt điện'],
        price: '180.000đ', isAvailable: true
    },

    // === Nội thất / Đồ gỗ ===
    {
        type: 'normal', id: '3', name: 'Lê Văn Hùng',
        avatar: 'https://i.pravatar.cc/150?img=33', rating: 4.7, reviewCount: 56,
        location: 'Số 10 Kha Vạn Cân, Thủ Đức, TP.HCM',
        skills: ['Sửa chữa đồ gỗ', 'Lắp đặt nội thất'],
        price: '180.000đ', isAvailable: true
    },

    // === Dọn dẹp ===
    {
        type: 'normal', id: '4', name: 'Ngô Thị Hương',
        avatar: 'https://i.pravatar.cc/150?img=25', rating: 4.9, reviewCount: 210,
        location: '45 Nguyễn Huệ, Quận 1, TP.HCM',
        skills: ['Dọn dẹp nhà cửa', 'Dọn dẹp theo giờ', 'Tổng vệ sinh'],
        price: '150.000đ', isAvailable: true
    },
    {
        type: 'normal', id: '12', name: 'Trần Thanh Thảo',
        avatar: 'https://i.pravatar.cc/150?img=32', rating: 4.7, reviewCount: 89,
        location: '78 Phan Xích Long, Phú Nhuận, TP.HCM',
        skills: ['Vệ sinh công nghiệp', 'Dọn dẹp nhà cửa', 'Tổng vệ sinh'],
        price: '170.000đ', isAvailable: true
    },

    // === Giặt ủi ===
    {
        type: 'normal', id: '5', name: 'Bùi Minh Châu',
        avatar: 'https://i.pravatar.cc/150?img=47', rating: 4.8, reviewCount: 156,
        location: '320 Lý Thường Kiệt, Quận 10, TP.HCM',
        skills: ['Giặt ủi chuyên nghiệp', 'Giặt thảm', 'Giặt rèm cửa'],
        price: '120.000đ', isAvailable: true
    },

    // === Tủ lạnh ===
    {
        type: 'normal', id: '6', name: 'Võ Thành Đạt',
        avatar: 'https://i.pravatar.cc/150?img=51', rating: 4.6, reviewCount: 67,
        location: '15 Hoàng Diệu, Quận 4, TP.HCM',
        skills: ['Sửa tủ lạnh', 'Bảo trì tủ lạnh', 'Vệ sinh tủ lạnh'],
        price: '200.000đ', isAvailable: false, timeAvailable: '16:00'
    },

    // === Côn trùng ===
    {
        type: 'normal', id: '7', name: 'Phan Quốc Bảo',
        avatar: 'https://i.pravatar.cc/150?img=53', rating: 4.9, reviewCount: 88,
        location: '99 Trần Não, Quận 2, TP.HCM',
        skills: ['Phun diệt côn trùng', 'Diệt mối', 'Xử lý mối mọt'],
        price: '300.000đ', isAvailable: true
    },

    // === Lò vi sóng ===
    {
        type: 'normal', id: '8', name: 'Trần Trọng Trí',
        avatar: 'https://i.pravatar.cc/150?img=17', rating: 5.0, reviewCount: 312,
        location: '55 Nguyễn Đình Chiểu, Quận 3, TP.HCM',
        skills: ['Sửa lò vi sóng', 'Thay linh kiện lò vi sóng', 'Vệ sinh lò vi sóng'],
        price: '200.000đ', isAvailable: true
    },
    {
        type: 'normal', id: '13', name: 'Hoàng Văn Tuấn',
        avatar: 'https://i.pravatar.cc/150?img=57', rating: 4.8, reviewCount: 145,
        location: '12 Lê Lai, Quận 1, TP.HCM',
        skills: ['Sửa lò vi sóng', 'Vệ sinh lò vi sóng'],
        price: '180.000đ', isAvailable: true
    },

    // === Xe hơi ===
    {
        type: 'normal', id: '9', name: 'Hồ Đắc Trung',
        avatar: 'https://i.pravatar.cc/150?img=59', rating: 4.7, reviewCount: 92,
        location: '280 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM',
        skills: ['Rửa xe tận nơi', 'Chăm sóc nội thất ô tô', 'Đánh bóng sơn xe'],
        price: '200.000đ', isAvailable: true
    },
];

interface Props {
    onNavigate?: (page: string, data?: any) => void;
    selectedService?: string;
    currentPage?: number;
    setCurrentPage?: (page: number) => void;
    setTotalPages?: (total: number) => void;
}

export const ProviderList: React.FC<Props> = ({
    onNavigate,
    selectedService,
    currentPage = 1,
    setCurrentPage,
    setTotalPages
}) => {
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState('PHỔ BIẾN NHẤT');
    const ITEMS_PER_PAGE = 7;
    const [selectedProvider, setSelectedProvider] = useState<any>(null);

    const handleNavigate = (page: string, data?: any) => {
        if (page === 'open-modal') {
            setSelectedProvider(data);
            return;
        }
        onNavigate?.(page, data);
    };

    /** Lọc providers theo dịch vụ được chọn */
    const filteredProviders = useMemo(() => {
        if (!selectedService) return allProviders;

        const matchingSkills = SERVICE_SKILL_MAP[selectedService];
        if (!matchingSkills) return allProviders;

        return allProviders.filter(p => {
            // Kiểm tra xem provider có ít nhất 1 skill khớp với dịch vụ
            return p.skills?.some(skill => matchingSkills.includes(skill));
        });
    }, [selectedService]);

    /** Sắp xếp */
    const sortedProviders = useMemo(() => {
        const sorted = [...filteredProviders];
        sorted.sort((a, b) => {
            // Nếu không chọn dịch vụ cụ thể (hiển thị tất cả), ghim Premium lên đầu
            if (!selectedService) {
                if (a.type === 'premium' && b.type !== 'premium') return -1;
                if (b.type === 'premium' && a.type !== 'premium') return 1;
            }

            if (selectedSort === 'PHỔ BIẾN NHẤT') {
                return ((b as any).reviewCount || 0) - ((a as any).reviewCount || 0);
            }
            return 0; // or implement other sorts like GIÁ THẤP NHẤT
        });
        return sorted;
    }, [filteredProviders, selectedSort]);

    const pageTitle = selectedService
        ? `Thợ chuyên ${selectedService}`
        : 'Thợ sửa chữa chuyên nghiệp';

    const resultCount = sortedProviders.filter(p => p.type !== 'premium').length;

    const totalPagesCalculated = Math.ceil(sortedProviders.length / ITEMS_PER_PAGE);
    const paginatedProviders = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedProviders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedProviders, currentPage]);

    useEffect(() => {
        if (setCurrentPage) setCurrentPage(1);
    }, [selectedService, selectedSort, setCurrentPage]);

    useEffect(() => {
        if (setTotalPages) setTotalPages(totalPagesCalculated);
    }, [totalPagesCalculated, setTotalPages]);

    return (
        <div className="provider-list-container">
            <div className="pl-header">
                <div className="pl-header-left">
                    <h1 className="pl-title">{pageTitle}</h1>
                    <p className="pl-subtitle">
                        Tìm thấy {resultCount} chuyên gia
                        {selectedService && <span className="pl-service-tag">{selectedService}</span>}
                        {' '}tại khu vực TP.HCM
                    </p>
                </div>
                <div className="pl-sort" style={{ position: 'relative' }}>
                    <span className="sort-label">SẮP XẾP:</span>
                    <button className="sort-btn" onClick={() => setIsSortOpen(!isSortOpen)}>
                        {selectedSort} <ChevronDownIcon size={14} className="sort-icon" />
                    </button>

                    {isSortOpen && (
                        <div className="sort-dropdown">
                            {['PHỔ BIẾN NHẤT', 'ĐÁNH GIÁ CAO NHẤT', 'GIÁ THẤP NHẤT'].map(option => (
                                <div
                                    key={option}
                                    className={`sort-option ${selectedSort === option ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedSort(option);
                                        setIsSortOpen(false);
                                    }}
                                >
                                    {option}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="pl-cards">
                {paginatedProviders.map((p) => {
                    if (p.type === 'premium') {
                        return <PremiumProviderCard key={p.id} provider={p as any} onNavigate={onNavigate} />;
                    }
                    return <ProviderCard key={p.id} provider={p as any} onNavigate={handleNavigate} />;
                })}
            </div>

            {resultCount === 0 && (
                <div className="pl-empty">
                    <p>Hiện chưa có thợ nào cho dịch vụ "{selectedService}".</p>
                    <p>Hãy thử tìm kiếm dịch vụ khác.</p>
                </div>
            )}

            <RepairRequestModal
                open={!!selectedProvider}
                onClose={() => setSelectedProvider(null)}
            />
        </div>
    );
};
