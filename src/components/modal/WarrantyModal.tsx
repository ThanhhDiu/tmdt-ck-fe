import React, { useState } from 'react';
import { FaXmark } from 'react-icons/fa6';
import { ImageUploader } from '../common/ImageUploader';
import { orderController } from '../../controllers/order/orderController';
import './css/adjustmentModal.css'; 

interface WarrantyModalProps {
    open: boolean;
    orderId: string;
    onClose: () => void;
    onSuccess: () => void; 
}

const WarrantyModal: React.FC<WarrantyModalProps> = ({ open, orderId, onClose, onSuccess }) => {
    const [description, setDescription] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!open) return null;

    const handleSubmit = async () => {
        if (!description.trim()) return setError('Vui lòng mô tả chi tiết lỗi phát sinh.');
        if (!scheduledAt) return setError('Vui lòng chọn thời gian mong muốn thợ đến kiểm tra.');

        const isoScheduledAt = new Date(scheduledAt).toISOString();

        setLoading(true);
        setError(null);

        const res = await orderController.submitWarranty(orderId, {
            description,
            images,
            scheduledAt: isoScheduledAt
        });

        setLoading(false);

        if (res.success) {
            window.alert('Gửi yêu cầu bảo hành thành công! Vui lòng chờ thợ xác nhận.');
            onSuccess(); // Báo cho cha refresh
            onClose();
        } else {
            setError(res.message || 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2>Yêu cầu Bảo hành</h2>
                    <button type="button" className="icon-btn" onClick={onClose}><FaXmark /></button>
                </div>

                <div className="modal-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>MÔ TẢ LỖI PHÁT SINH</label>
                            <textarea
                                className="reason-input"
                                style={{ marginTop: '8px' }}
                                placeholder="Ví dụ: Máy lạnh vẫn bị chảy nước sau 2 tuần..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>THỜI GIAN MONG MUỐN KIỂM TRA</label>
                            <input 
                                type="datetime-local" 
                                className="input" 
                                style={{ marginTop: '8px', width: '100%' }}
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' }}>
                                HÌNH ẢNH MINH CHỨNG
                            </label>
                            <ImageUploader 
                                folder="warranty" 
                                urls={images} 
                                onChange={setImages} 
                                maxImages={3}
                            />
                        </div>

                        {error && <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-outline" onClick={onClose} disabled={loading}>Hủy</button>
                    <button className="btn-solid" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarrantyModal;