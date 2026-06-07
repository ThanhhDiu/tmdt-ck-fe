import React, { useRef, useState } from 'react';
import { FaXmark, FaPlus, FaCamera } from 'react-icons/fa6';
import { uploadService } from '../../services/uploadService';
import "./css/adjustmentModal.css";

export type AdjustmentPart = {
    name: string;
    price: number;
    partCode?: string;
};

export type AdjustmentSubmitPayload = {
    newPrice: number;
    reason: string;
    parts: AdjustmentPart[];
    evidenceImages: string[];
};

interface AdjustmentModalProps {
    currentPrice: number;
    onClose: () => void;
    onSubmit: (payload: AdjustmentSubmitPayload) => Promise<void>;
}

export const AdjustmentModal: React.FC<AdjustmentModalProps> = ({
    currentPrice,
    onClose,
    onSubmit,
}) => {
    const [newPrice, setNewPrice] = useState(currentPrice);
    const [reason, setReason] = useState('');
    const [parts, setParts] = useState<AdjustmentPart[]>([
        { name: '', price: 0, partCode: '' },
    ]);
    const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const diff = newPrice - currentPrice;

    const handleAddPart = () => {
        setParts((prev) => [...prev, { name: '', price: 0, partCode: '' }]);
    };

    const handlePartChange = (index: number, field: keyof AdjustmentPart, value: string | number) => {
        setParts((prev) =>
            prev.map((part, i) => (i === index ? { ...part, [field]: value } : part))
        );
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files?.length) return;

        try {
            const uploads = await Promise.all(
                Array.from(files).map((file) => uploadService.uploadImage(file, 'evidence'))
            );
            setEvidenceUrls((prev) => [...prev, ...uploads].slice(0, 5));
        } catch {
            setError('Không thể tải ảnh lên');
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSubmit = async () => {
        if (!reason.trim()) {
            setError('Vui lòng nhập lý do điều chỉnh');
            return;
        }
        if (newPrice <= 0) {
            setError('Giá mới không hợp lệ');
            return;
        }

        const validParts = parts.filter((p) => p.name.trim() && p.price > 0);

        setIsSubmitting(true);
        setError(null);
        try {
            await onSubmit({
                newPrice,
                reason: reason.trim(),
                parts: validParts,
                evidenceImages: evidenceUrls,
            });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gửi điều chỉnh giá thất bại');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Điều chỉnh Chi phí Thực tế</h2>
                    <button type="button" className="icon-btn" onClick={onClose}><FaXmark /></button>
                </div>

                <div className="modal-body">
                    <div className="price-compare-box">
                        <div className="old-price">
                            <label>Giá dự kiến ban đầu</label>
                            <span className="strike-through">{currentPrice.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="new-price">
                            <label>Tổng chi phí thực tế mới</label>
                            <div className="new-val-row">
                                <input
                                    type="number"
                                    className="input"
                                    value={newPrice}
                                    min={0}
                                    onChange={(e) => setNewPrice(Number(e.target.value))}
                                />
                                {diff > 0 && (
                                    <span className="diff-tag text-blue">
                                        Tăng +{diff.toLocaleString('vi-VN')}đ
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="modal-split-row">
                        <div className="col-left">
                            <div className="section-head">
                                <h3>Danh mục Vật tư & Linh kiện</h3>
                                <button type="button" className="btn-text" onClick={handleAddPart}>
                                    <FaPlus /> Thêm linh kiện
                                </button>
                            </div>
                            {parts.map((part, index) => (
                                <div key={index} className="part-item-gray" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                                    <input
                                        className="input"
                                        placeholder="Tên linh kiện"
                                        value={part.name}
                                        onChange={(e) => handlePartChange(index, 'name', e.target.value)}
                                    />
                                    <input
                                        className="input"
                                        type="number"
                                        placeholder="Giá"
                                        value={part.price || ''}
                                        onChange={(e) => handlePartChange(index, 'price', Number(e.target.value))}
                                    />
                                </div>
                            ))}

                            <div className="section-head mt-4">
                                <h3>Lý do điều chỉnh</h3>
                            </div>
                            <textarea
                                className="reason-input"
                                placeholder="Giải thích rõ nguyên nhân phát sinh..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>

                        <div className="col-right">
                            <div className="section-head">
                                <h3>Hình ảnh minh chứng</h3>
                            </div>
                            <div className="photo-grid-mini">
                                {evidenceUrls.map((url) => (
                                    <img key={url} src={url} alt="Minh chứng" />
                                ))}
                                <div
                                    className="upload-box-mini"
                                    onClick={() => fileInputRef.current?.click()}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <FaCamera className="icon" />
                                    <span>Tải ảnh lên</span>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    hidden
                                    onChange={handleUpload}
                                />
                            </div>
                        </div>
                    </div>
                    {error && <p style={{ color: '#dc2626', marginTop: 12 }}>{error}</p>}
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn-outline" onClick={onClose} disabled={isSubmitting}>
                        Hủy bỏ
                    </button>
                    <button type="button" className="btn-solid" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Đang gửi...' : 'Gửi báo giá điều chỉnh'}
                    </button>
                </div>
            </div>
        </div>
    );
};
