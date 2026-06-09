import React, { useState } from "react";
import Modal from "../common/Modal";
import "./css/repairRequestModal.css";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { navigateToChat } from "../../utils/chatNavigation";
import { orderService } from "../../services/order/orderService";
import { chatService } from "../../services/chat/chatService";

interface RepairRequestModalProps {
    open: boolean;
    onClose: () => void;
    technicianId?: string;
}

const RepairRequestModal: React.FC<RepairRequestModalProps> = ({ open, onClose, technicianId }) => {
    const navigate = useNavigate();
    const [deviceName, setDeviceName] = useState("");
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("123 Nguyễn Hữu Cảnh, Bình Thạnh");
    const [phone, setPhone] = useState("090 123 4567");
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <Modal open={open} onClose={onClose}>
            <div className="repair-modal">
                {/* CLOSE */}
                <button
                    className="repair-close"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <X size={24} />
                </button>

                {/* HEADER */}
                <header className="repair-header">
                    Gửi yêu cầu sửa chữa
                </header>

                {/* BODY */}
                <div className="repair-body">
                    {/* DEVICE NAME */}
                    <div className="form-group">
                        <label htmlFor="repair-device">TÊN THIẾT BỊ</label>
                        <input
                            id="repair-device"
                            type="text"
                            placeholder="Ví dụ: Máy lạnh Daikin, Máy giặt LG..."
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                        />
                    </div>

                    {/* DESCRIPTION */}
                    <div className="form-group">
                        <label htmlFor="repair-desc">MÔ TẢ TÌNH TRẠNG LỖI</label>
                        <textarea
                            id="repair-desc"
                            placeholder="Mô tả tình trạng hỏng hóc thực tế của máy..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* IMAGE */}
                    <div className="form-group">
                        <label>HÌNH ẢNH THỰC TẾ</label>
                        <div className="upload-box">
                            <div className="upload-icon" />
                            <p>
                                Tải lên ảnh để thợ chẩn đoán chính xác hơn (tối đa 3 ảnh)
                            </p>
                        </div>
                    </div>

                    {/* ADDRESS */}
                    <div className="form-group">
                        <label htmlFor="repair-address">ĐỊA CHỈ SỬA CHỮA</label>
                        <input
                            id="repair-address"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    {/* PHONE */}
                    <div className="form-group">
                        <label htmlFor="repair-phone">SỐ ĐIỆN THOẠI LIÊN HỆ</label>
                        <input
                            id="repair-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                </div>

                {/* FOOTER */}
                <footer className="repair-footer">
                    <button
                        className="btn-submit"
                        disabled={isSubmitting || !deviceName.trim() || !description.trim()}
                        onClick={async () => {
                            if (!technicianId) return;
                            setIsSubmitting(true);
                            try {
                                // 1. Create order directly assigned to this technician
                                const order = await orderService.createOrder({
                                    deviceName,
                                    description,
                                    address,
                                    estimatedPrice: 0,
                                    expectedTime: new Date().toISOString(),
                                    serviceCategory: "Khác", // Default category
                                    images: [],
                                    technicianId
                                });

                                // 2. Create or find conversation linked to this order
                                const conv = await chatService.createConversation({
                                    technicianId,
                                    orderId: order.id
                                });

                                onClose();
                                // 3. Navigate to chat with linked order ID and conversation ID
                                navigateToChat(navigate, "customer", {
                                    conversationId: conv.id,
                                    orderId: order.id,
                                    technicianId
                                });
                            } catch (err) {
                                alert(err instanceof Error ? err.message : "Có lỗi xảy ra khi gửi yêu cầu");
                            } finally {
                                setIsSubmitting(false);
                            }
                        }}
                    >
                        {isSubmitting ? "Đang xử lý..." : "Gửi yêu cầu & Chat ngay"}
                    </button>
                </footer>
            </div>
        </Modal>
    );
};

export default RepairRequestModal;
