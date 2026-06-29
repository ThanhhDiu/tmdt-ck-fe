import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import "./css/repairRequestModal.css";
import { X, XCircle } from "lucide-react"; 
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { navigateToChat } from "../../utils/chatNavigation";
import { orderService } from "../../services/order/orderService";
import { chatService } from "../../services/chat/chatService";
import { authService } from "../../services/auth/authService";
import { uploadService } from "../../services/uploadService";

interface RepairRequestModalProps {
    open: boolean;
    onClose: () => void;
    technicianId?: string;
    initialCategory?: string;
}

const RepairRequestModal: React.FC<RepairRequestModalProps> = ({ open, onClose, technicianId, initialCategory }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [deviceName, setDeviceName] = useState("");
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [serviceCategory, setServiceCategory] = useState("Khác");
    
    // State quản lý upload ảnh
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            const categoryFromUrl = searchParams.get("service");
            const categoryFromState = location.state?.serviceCategory;
            const resolvedCategory = initialCategory || categoryFromState || categoryFromUrl || "Khác";
            
            setServiceCategory(resolvedCategory); 

            const fetchUserProfile = async () => {
                try {
                    const response = await authService.getMe();
                    if (response.success && response.data) {
                        if (response.data.address) setAddress(response.data.address);
                        if (response.data.phone) setPhone(response.data.phone);
                    }
                } catch (error) {
                    console.error("Không thể tự động tải thông tin người dùng:", error);
                }
            };
            fetchUserProfile();
        } else {
            setDeviceName("");
            setDescription("");
            setAddress("");
            setPhone("");
            setServiceCategory("Khác"); 
            setSelectedFiles([]);
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            setPreviewUrls([]);
        }
    }, [open, location, searchParams, initialCategory]);

    // Xử lý khi chọn ảnh
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selected = Array.from(e.target.files);
            
            const MAX_SIZE = 1 * 1024 * 1024; //1MB
            const validFiles = selected.filter(file => {
                if (file.size > MAX_SIZE) {
                    alert(`Ảnh "${file.name}" vượt quá dung lượng 1MB. Vui lòng chọn ảnh nhẹ hơn.`);
                    return false;
                }
                return true;
            });

            // Chỉ lấy những file hợp lệ và giới hạn tối đa 3 ảnh
            const totalFiles = [...selectedFiles, ...validFiles].slice(0, 3);
            setSelectedFiles(totalFiles);

            // Tạo URL preview
            const newPreviews = totalFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls(newPreviews);
        }
    };

    // Xử lý khi xóa 1 ảnh đã chọn
    const handleRemoveImage = (index: number) => {
        const updatedFiles = [...selectedFiles];
        updatedFiles.splice(index, 1);
        setSelectedFiles(updatedFiles);

        const updatedPreviews = [...previewUrls];
        URL.revokeObjectURL(updatedPreviews[index]); 
        updatedPreviews.splice(index, 1);
        setPreviewUrls(updatedPreviews);
    };

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
                        
                        {previewUrls.length > 0 && (
                            <div className="preview-container">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="preview-item">
                                        <img src={url} alt={`Preview ${index}`} className="preview-image" />
                                        <button 
                                            className="btn-remove-preview"
                                            onClick={() => handleRemoveImage(index)}
                                            title="Xóa ảnh này"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedFiles.length < 3 && (
                            <label htmlFor="upload-images" className="upload-box">
                                <input
                                    id="upload-images"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    style={{ display: "none" }}
                                    onChange={handleFileChange}
                                />
                                <div className="upload-icon" />
                                <p>
                                    Tải lên ảnh để thợ chẩn đoán chính xác hơn (đã chọn {selectedFiles.length}/3)
                                </p>
                            </label>
                        )}
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
                                // 1. Upload ảnh trước (nếu có)
                                let uploadedImageUrls: string[] = [];
                                if (selectedFiles.length > 0) {
                                    uploadedImageUrls = await uploadService.uploadImages(selectedFiles, 'orders');
                                }

                                // 2. Tạo Order với mảng URL ảnh trả về
                                const order = await orderService.createOrder({
                                    deviceName,
                                    description,
                                    address,
                                    estimatedPrice: 0,
                                    expectedTime: new Date().toISOString(),
                                    serviceCategory: serviceCategory, 
                                    images: uploadedImageUrls,
                                    technicianId
                                });

                                // 3. Tạo conversation
                                const conv = await chatService.createConversation({
                                    technicianId,
                                    orderId: order.id
                                });

                                onClose();
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