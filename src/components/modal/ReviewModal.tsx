import React, { useEffect, useMemo, useState } from 'react';
import { Star, X } from 'lucide-react';
import Modal from '../common/Modal';
import { uploadService } from '../../services/uploadService';
import { reviewService } from '../../services/reviewService';
import './css/reviewModal.css';

interface ReviewModalProps {
  open: boolean;
  orderId: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ open, orderId, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
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
    setRating(5);
    setContent('');
    setFiles([]);
    setError('');
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose();
  };

  const submit = async () => {
    if (rating < 1 || rating > 5) {
      setError('Vui lòng chọn số sao từ 1 đến 5.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const attachedImages = await Promise.all(files.map((file) => uploadService.uploadOrderImage(file)));
      await reviewService.submitReview({
        orderId,
        rating,
        content: content.trim(),
        attachedImages,
      });
      onSubmitted?.();
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="review-modal">
        <header className="review-header">
          <div>
            <h2>Đánh giá thợ</h2>
            <p>Đơn hàng #{orderId}</p>
          </div>
          <button type="button" className="close-btn" onClick={handleClose} aria-label="Đóng" disabled={submitting}>
            <X size={22} />
          </button>
        </header>

        <div className="review-body">
          <div className="review-stars-input" role="radiogroup" aria-label="Số sao đánh giá">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={star <= rating ? 'is-active' : ''}
                disabled={submitting}
              >
                <Star size={28} />
              </button>
            ))}
          </div>

          <label className="review-field">
            <span>Bình luận</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về chất lượng sửa chữa..."
              disabled={submitting}
            />
          </label>

          <label className="review-upload">
            <span>Ảnh thực tế</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={submitting}
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            />
          </label>

          {previews.length > 0 && (
            <div className="review-preview-grid">
              {previews.map(({ file, url }) => (
                <img key={`${file.name}-${file.lastModified}`} src={url} alt={file.name} />
              ))}
            </div>
          )}

          {error && <div className="review-error">{error}</div>}
        </div>

        <footer className="review-footer">
          <button type="button" className="btn-text" onClick={handleClose} disabled={submitting}>
            Hủy bỏ
          </button>
          <button type="button" className="btn-solid-dark" onClick={() => void submit()} disabled={submitting}>
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </footer>
      </div>
    </Modal>
  );
};

export default ReviewModal;
