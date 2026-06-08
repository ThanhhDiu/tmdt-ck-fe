import React from 'react';
import type {RequestData} from "../../types/RequestData.ts";
import type {UserRole} from "../../types/UserRole.ts";
import "./requestDetail.css"
import {FaLocationDot, FaClock, FaRegCommentDots, FaArrowLeft} from 'react-icons/fa6';
import { navigateToChat } from "../../utils/chatNavigation";
import {useNavigate} from "react-router-dom";

interface RequestDetailProps {
    data: RequestData;
    role: UserRole;
    onBack: () => void;
    onCancel?: (id: string) => void;
}

export const RequestDetail: React.FC<RequestDetailProps> = ({ data, role, onBack, onCancel }) => {
    const navigate = useNavigate();
    const handleChatClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (role === 'customer' && data.technicianId) {
            navigateToChat(navigate, role, {
                technicianId: data.technicianId,
                orderId: data.id,
            });
            return;
        }
        navigateToChat(navigate, role, {
            orderId: data.id,
            customerId: data.customerId,
        });
    };
    return (
        <div className="request-detail">
            <div className="detail-header">
                <button className="back-btn" onClick={onBack}>
                    <FaArrowLeft /> CHI TIẾT YÊU CẦU
                </button>
                <span className="req-id">#{data.id}</span>
            </div>

            <div className="detail-body">
                {/* thông tin chung */}
                <div className="info-block">
                    <span className="label">THÔNG TIN THIẾT BỊ</span>
                    <h2 className="device-title">{data.deviceName}</h2>

                    <span className="label mt-4">MÔ TẢ TÌNH TRẠNG LỖI</span>
                    <div className="desc-box">
                        "{data.description}"
                    </div>
                </div>

                {/* hình ảnh */}
                <div className="images-block">
                    <div className="block-header">
                        <span className="label">HÌNH ẢNH THỰC TẾ</span>
                        <span className="img-count">{data.images.length} Ảnh</span>
                    </div>
                    <div className="image-grid">
                        {data.images.map((img, idx) => (
                            <img key={idx} src={img} alt="Lỗi thiết bị" className="req-image" />
                        ))}
                    </div>
                </div>

                {/* địa điểm và thời gian */}
                <div className="meta-grid">
                    <div className="meta-box">
                        {/* Thay đổi icon vị trí */}
                        <span className="icon"><FaLocationDot /></span>
                        <div>
                            <span className="label">ĐỊA ĐIỂM</span>
                            <p>{data.address}</p>
                        </div>
                    </div>
                    <div className="meta-box">
                        {/* Thay đổi icon đồng hồ thời gian mọng muốn */}
                        <span className="icon"><FaClock /></span>
                        <div>
                            <span className="label">THỜI GIAN MONG MUỐN</span>
                            <p>{data.expectedTime}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hành động (Hiển thị đa luồng theo Role) */}
            <div className="detail-footer">
                {role === 'technician' ? (
                    <>
                        <button className="btn-large-secondary" onClick={() => onCancel?.(data.id)}>
                            Từ chối yêu cầu
                        </button>
                        <button className="btn-large-primary" onClick={handleChatClick}><FaRegCommentDots /> Chat & Báo giá ngay</button>
                    </>
                ) : (
                    <>
                        <button className="btn-large-secondary" onClick={() => onCancel?.(data.id)}>
                            Hủy yêu cầu
                        </button>
                        <button className="btn-large-primary">Sửa thông tin</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default RequestDetail;