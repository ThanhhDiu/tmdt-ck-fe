import React, { useState } from "react";
import type { Quote } from "../../types/Quote";
import "./css/quote-form.css";

interface Props {
    quote: Quote;
    setQuote: (q: Quote) => void;
    onClose: () => void;
    onSubmit?: (quote: Quote) => Promise<void>;
}

const QuoteForm = ({ quote, setQuote, onClose, onSubmit }: Props) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (field: keyof Quote, value: string | number) => {
        setQuote({ ...quote, [field]: value });
    };

    const buildScheduledAt = (): string => {
        if (!quote.date || !quote.time) {
            return new Date().toISOString();
        }
        return new Date(`${quote.date}T${quote.time}`).toISOString();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            const payload: Quote = {
                ...quote,
                scheduledAt: buildScheduledAt(),
            };
            if (onSubmit) {
                await onSubmit(payload);
            }
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể gửi báo giá');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="quote-form" onSubmit={handleSubmit}>
            <div>
                <div className="quote-title">Tạo báo giá mới</div>
                <div className="quote-subtitle">
                    Gửi đề xuất chuyên nghiệp đến khách hàng của bạn.
                </div>
            </div>

            <div className="field-group">
                <label className="field-label">Tên dịch vụ</label>
                <input
                    type="text"
                    className="input"
                    value={quote.serviceName}
                    onChange={(e) => handleChange("serviceName", e.target.value)}
                    required
                />
            </div>

            <div className="field-group">
                <label className="field-label">Mô tả chi tiết lỗi</label>
                <textarea
                    className="textarea"
                    placeholder="Nhập tình trạng..."
                    value={quote.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                />
            </div>

            <div className="field-group">
                <label className="field-label">Ngày & giờ</label>
                <div className="datetime-row">
                    <input
                        type="date"
                        className="input input-small"
                        value={quote.date}
                        onChange={(e) => handleChange("date", e.target.value)}
                        required
                    />
                    <input
                        type="time"
                        className="input input-small"
                        value={quote.time}
                        onChange={(e) => handleChange("time", e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="field-group">
                <label className="field-label">Tổng chi phí</label>
                <div className="price-wrapper">
                    <input
                        type="number"
                        className="input"
                        value={quote.price || ""}
                        onChange={(e) => handleChange("price", Number(e.target.value))}
                        required
                        min="0"
                    />
                    <span className="price-unit">VND</span>
                </div>
            </div>

            <div className="field-group">
                <label className="field-label">Ghi chú</label>
                <textarea
                    className="textarea"
                    placeholder="Lưu ý thêm cho khách hàng..."
                    value={quote.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                />
            </div>

            {error && <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p>}

            <div className="quote-actions">
                <button type="button" className="btn btn-cancel" onClick={onClose} disabled={isSubmitting}>
                    Hủy
                </button>
                <button type="submit" className="btn btn-submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Đang gửi...' : 'Gửi báo giá'}
                </button>
            </div>
        </form>
    );
};

export default QuoteForm;
