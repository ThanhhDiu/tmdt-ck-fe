import React, { useRef, useState } from 'react';
import { FaCamera, FaXmark } from 'react-icons/fa6';
import { uploadService } from '../../services/uploadService';
import { resolveMediaUrl } from '../../utils/mediaUrl.ts'; 

interface ImageUploaderProps {
    folder: string;               
    urls: string[];               
    onChange: (urls: string[]) => void; 
    maxImages?: number;           
    maxSizeMB?: number;           
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
    folder,
    urls,
    onChange,
    maxImages = 5,
    maxSizeMB = 1,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;

        const selectedFiles = Array.from(files);
        const validFiles: File[] = [];

        for (const file of selectedFiles) {
            if (file.size > maxSizeMB * 1024 * 1024) {
                window.alert(`Ảnh "${file.name}" vượt quá dung lượng ${maxSizeMB}MB.`);
                continue;
            }
            validFiles.push(file);
        }

        const slotsLeft = maxImages - urls.length;
        const filesToUpload = validFiles.slice(0, slotsLeft);

        if (filesToUpload.length === 0) return;

        setIsUploading(true);
        try {
            const uploadedUrls = await Promise.all(
                filesToUpload.map((file) => uploadService.uploadImage(file, folder))
            );
            
            onChange([...urls, ...uploadedUrls]);
        } catch (error) {
            window.alert('Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; 
            }
        }
    };

    const handleRemove = (indexToRemove: number) => {
        const newUrls = urls.filter((_, index) => index !== indexToRemove);
        onChange(newUrls);
    };

    return (
        <div className="image-uploader-container">
            <div className="photo-grid-mini" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {/* Hiển thị các ảnh đã upload */}
                {urls.map((url, index) => (
                    <div key={url} style={{ position: 'relative', width: '80px', height: '80px' }}>
                        <img 
                            src={resolveMediaUrl(url) || ""} 
                            alt={`Upload ${index}`} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                        />
                        <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            style={{
                                position: 'absolute', top: '-6px', right: '-6px',
                                background: '#ef4444', color: 'white', border: 'none',
                                borderRadius: '50%', width: '20px', height: '20px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', padding: 0
                            }}
                        >
                            <FaXmark size={12} />
                        </button>
                    </div>
                ))}

                {/* Nút thêm ảnh mới */}
                {urls.length < maxImages && (
                    <div
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        style={{
                            width: '80px', height: '80px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            border: '1px dashed #cbd5e1', borderRadius: '8px',
                            background: isUploading ? '#f1f5f9' : '#f8fafc',
                            cursor: isUploading ? 'not-allowed' : 'pointer',
                            color: '#64748b', fontSize: '12px', gap: '4px'
                        }}
                    >
                        {isUploading ? (
                            <span>Đang tải...</span>
                        ) : (
                            <>
                                <FaCamera size={20} />
                                <span>Tải lên</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleFileChange}
            />
        </div>
    );
};