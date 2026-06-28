import React, { useRef, useState } from 'react';
import { Paperclip, Image, Smile, SendHorizontal, Coins } from 'lucide-react';
import styles from './Chat.module.css';
import QuoteCreateModal from '../modal/QuoteCreateModal';
import { ChatInputWrapper } from './ChatInputWrapper';
import type { Quote } from '../../types/Quote';
import type { UserRole } from '../../types/UserRole';
import { uploadService } from '../../services/uploadService';

interface MessageInputProps {
    role: UserRole;
    onSendMessage?: (message: string) => Promise<void> | void;
    onSendImage?: (imageUrl: string) => Promise<void> | void;
    onTypingChange?: (isTyping: boolean) => void;
    onCreateQuote?: (quote: Quote) => Promise<void>;
    showQuoteAction?: boolean;
    showPriceAdjustAction?: boolean;
    onOpenPriceAdjust?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
    role,
    onSendMessage,
    onSendImage,
    onTypingChange,
    onCreateQuote,
    showQuoteAction = false,
    showPriceAdjustAction = false,
    onOpenPriceAdjust,
}) => {
    const [message, setMessage] = useState('');
    const [openQuote, setOpenQuote] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleSend = async () => {
        if (message.trim() && onSendMessage) {
            try {
                setSendError(null);
                await onSendMessage(message);
                setMessage('');
                onTypingChange?.(false);
            } catch (error) {
                setSendError(error instanceof Error ? error.message : 'Không thể gửi tin nhắn');
            }
        }
    };

    const handleImageSelected = async (file?: File) => {
        if (!file || !onSendImage) return;
        setIsUploading(true);
        try {
            setSendError(null);
            const imageUrl = await uploadService.uploadImage(file, 'chat');
            await onSendImage(imageUrl);
        } catch (error) {
            setSendError(error instanceof Error ? error.message : 'Không thể gửi hình ảnh');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <>
            <div>
                {sendError && <div className={styles.inputError}>{sendError}</div>}
                <ChatInputWrapper
                    leftIcons={
                        <>
                            {showQuoteAction && role === 'technician' && (
                                <button
                                    type="button"
                                    className={styles.iconButton}
                                    title="Gửi báo giá"
                                    onClick={() => setOpenQuote(true)}
                                >
                                    <Paperclip size={20} color="#4A5E8B" />
                                </button>
                            )}
                            {showPriceAdjustAction && role === 'technician' && (
                                <button
                                    type="button"
                                    className={styles.iconButton}
                                    title="Cập nhật giá thực tế"
                                    onClick={onOpenPriceAdjust}
                                >
                                    <Coins size={20} color="#4A5E8B" />
                                </button>
                            )}
                            <button
                                type="button"
                                className={styles.iconButton}
                                title="Gửi hình ảnh"
                                disabled={isUploading || !onSendImage}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Image size={20} color={isUploading ? '#94a3b8' : '#4A5E8B'} />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={(event) => void handleImageSelected(event.target.files?.[0])}
                            />
                            <button type="button" className={styles.iconButton} title="Biểu cảm" disabled>
                                <Smile size={20} color="#94a3b8" />
                            </button>
                        </>
                    }
                    rightElement={
                        <button
                            type="button"
                            className={styles.sendButton}
                            onClick={() => void handleSend()}
                            disabled={!message.trim()}
                        >
                            <SendHorizontal size={20} color="white" />
                        </button>
                    }
                >
                    <textarea
                        className={styles.textInput}
                        placeholder={isUploading ? 'Đang tải ảnh lên...' : 'Nhập tin nhắn...'}
                        rows={1}
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            onTypingChange?.(Boolean(e.target.value.trim()));
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                void handleSend();
                            }
                        }}
                    />
                </ChatInputWrapper>
            </div>

            {showQuoteAction && onCreateQuote && (
                <QuoteCreateModal
                    open={openQuote}
                    onClose={() => setOpenQuote(false)}
                    onSubmit={onCreateQuote}
                />
            )}
        </>
    );
};
