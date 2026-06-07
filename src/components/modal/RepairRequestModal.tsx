import React from "react";
import Modal from "../common/Modal";
import "./css/repairRequestModal.css";
import {X} from "lucide-react";
import {useNavigate} from "react-router-dom";
import { navigateToChat } from "../../utils/chatNavigation";

interface RepairRequestModalProps {
    open: boolean;
    onClose: () => void;
    technicianId?: string;
}

const RepairRequestModal: React.FC<RepairRequestModalProps> = ({open, onClose, technicianId}) => {
    const navigate = useNavigate();

    return (
        <Modal open={open} onClose={onClose}>
            <div className="repair-modal">
                {/* CLOSE */}
                <button
                    className="repair-close"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <X size={24}/>
                </button>

                {/* HEADER */}
                <header className="repair-header">
                    Gửi yêu cầu sửa chữa
                </header>

                {/* BODY */}
                <div className="repair-body">
                    {/* DESCRIPTION */}
                    <div className="form-group">
                        <label htmlFor="repair-desc">MÔ TẢ TÌNH TRẠNG LỖI</label>
                        <textarea
                            id="repair-desc"
                            placeholder="Mô tả tình trạng hỏng hóc thực tế của máy..."
                        />
                    </div>

                    {/* IMAGE */}
                    <div className="form-group">
                        <label>HÌNH ẢNH THỰC TẾ</label>
                        <div className="upload-box">
                            <div className="upload-icon"/>
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
                            defaultValue="123 Nguyễn Hữu Cảnh, Bình Thạnh"
                        />
                    </div>

                    {/* PHONE */}
                    <div className="form-group">
                        <label htmlFor="repair-phone">SỐ ĐIỆN THOẠI LIÊN HỆ</label>
                        <input
                            id="repair-phone"
                            type="tel"
                            defaultValue="090 123 4567"
                        />
                    </div>
                </div>

                {/* FOOTER */}
                <footer className="repair-footer">
                    <button
                        className="btn-submit"
                        onClick={() => {
                            onClose();
                            if (technicianId) {
                                navigateToChat(navigate, "customer", { technicianId });
                                return;
                            }
                            navigate("/customer/chat");
                        }}
                    >
                            Gửi yêu cầu & Chat ngay
                </button>
            </footer>
        </div>
</Modal>
)
    ;
};

export default RepairRequestModal;
