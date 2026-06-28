import React, { useEffect, useMemo, useState } from "react";
import Modal from "../common/Modal";
import "./css/reportModal.css";
import { X } from "lucide-react";
import { uploadService } from "../../services/uploadService";
import { reportService } from "../../services/reportService";

interface ReportModalProps {
    open: boolean;
    orderId: string;
    orderCode?: string;
    onClose: () => void;
    onSubmitted?: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ open, orderId, orderCode, onClose, onSubmitted }) => {
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const previews = useMemo(
        () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
        [files]
    );

    useEffect(() => {
        return () => {
            previews.forEach((preview) => URL.revokeObjectURL(preview.url));
        };
    }, [previews]);

    const resetForm = () => {
        setReason("");
        setDescription("");
        setFiles([]);
        setError("");
    };

    const handleClose = () => {
        if (submitting) return;
        resetForm();
        onClose();
    };

    const submit = async () => {
        if (!reason) {
            setError("Vui lòng chọn lý do khiếu nại.");
            return;
        }
        if (!description.trim()) {
            setError("Vui lòng nhập mô tả chi tiết.");
            return;
        }

        setSubmitting(true);
        setError("");
        try {
            const evidenceImages = await Promise.all(files.map((file) => uploadService.uploadImage(file, "orders")));
            await reportService.submitReport({
                orderId,
                reason,
                description: description.trim(),
                evidenceImages,
            });
            onSubmitted?.();
            onClose();
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể gửi khiếu nại. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <div className="report-modal">
                {/* HEADER */}
                <header className="report-header">
                    <div className="header-info">
                        <h2 className="title text-danger">BÁO CÁO SỰ CỐ / KHIẾU NẠI</h2>
                        <span className="sub">Đơn hàng #{orderCode ?? orderId}</span>
                    </div>

                    <button
                        className="close-btn"
                        onClick={handleClose}
                        aria-label="Đóng"
                        disabled={submitting}
                    >
                        <X size={24} />
                    </button>
                </header>

                {/* BODY */}
                <div className="report-body">
                    <div className="notice danger-notice">
                        Đội ngũ GlowUp sẽ tiếp nhận và xử lý khiếu nại của bạn trong vòng 24h làm việc.
                    </div>

                    {/* LÝ DO KHIẾU NẠI */}
                    <div className="form-group">
                        <label htmlFor="report-reason">VẤN ĐỀ BẠN GẶP PHẢI</label>
                        <select id="report-reason" className="report-select" value={reason} disabled={submitting} onChange={(event) => setReason(event.target.value)}>
                            <option value="">-- Chọn lý do --</option>
                            <option value="bad_attitude">Thợ có thái độ không tốt/bất lịch sự</option>
                            <option value="extra_fee">Thợ yêu cầu thu thêm phụ phí ngoài hệ thống</option>
                            <option value="poor_quality">Thợ chưa sửa xong hoặc chất lượng kém</option>
                            <option value="fraud">Thợ có dấu hiệu gian lận hoặc làm hư hỏng tài sản</option>
                            <option value="other">Lý do khác</option>
                        </select>
                    </div>

                    {/* MÔ TẢ CHI TIẾT */}
                    <div className="form-group">
                        <label htmlFor="report-desc">MÔ TẢ CHI TIẾT</label>
                        <textarea
                            id="report-desc"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Vui lòng cung cấp thêm thông tin chi tiết để GlowUp hỗ trợ bạn tốt nhất..."
                            disabled={submitting}
                        />
                    </div>

                    {/* BẰNG CHỨNG */}
                    <div className="form-group">
                        <label>BẰNG CHỨNG (HÌNH ẢNH/VIDEO)</label>
                        <input type="file" accept="image/*" multiple disabled={submitting} onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
                        {previews.length > 0 && (
                            <div className="report-preview-grid">
                                {previews.map(({ file, url }) => (
                                    <img key={`${file.name}-${file.lastModified}`} src={url} alt={file.name} />
                                ))}
                            </div>
                        )}
                    </div>
                    {error && <div className="report-error">{error}</div>}
                </div>

                {/* FOOTER */}
                <footer className="report-footer">
                    <button className="btn-text" onClick={handleClose} disabled={submitting}>
                        Hủy bỏ
                    </button>
                    <button className="btn-solid-danger" onClick={() => void submit()} disabled={submitting}>
                        {submitting ? "Đang gửi..." : "Gửi khiếu nại"}
                    </button>
                </footer>
            </div>
        </Modal>
    );
};

export default ReportModal;
