import React, { useState } from 'react';
import { Paperclip, Image, Smile, SendHorizontal, Coins } from 'lucide-react';
import styles from './Chat.module.css';
import QuoteCreateModal from '../modal/QuoteCreateModal';
import { ChatInputWrapper } from './ChatInputWrapper';
import type { Quote } from '../../types/Quote';
import type { UserRole } from '../../types/UserRole';

interface MessageInputProps {
    role: UserRole;
    onSendMessage?: (message: string) => void;
    onCreateQuote?: (quote: Quote) => Promise<void>;
    showQuoteAction?: boolean;
    showPriceAdjustAction?: boolean;
    onOpenPriceAdjust?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
    role,
    onSendMessage,
    onCreateQuote,
    showQuoteAction = false,
    showPriceAdjustAction = false,
    onOpenPriceAdjust,
}) => {
    const [message, setMessage] = useState('');
    const [openQuote, setOpenQuote] = useState(false);

    const handleSend = () => {
        if (message.trim() && onSendMessage) {
            onSendMessage(message);
            setMessage('');
        }
    };

    return (
        <>
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
                        <button type="button" className={styles.iconButton} title="Gửi hình ảnh" disabled>
                            <Image size={20} color="#94a3b8" />
                        </button>
                        <button type="button" className={styles.iconButton} title="Biểu cảm" disabled>
                            <Smile size={20} color="#94a3b8" />
                        </button>
                    </>
                }
                rightElement={
                    <button
                        type="button"
                        className={styles.sendButton}
                        onClick={handleSend}
                        disabled={!message.trim()}
                    >
                        <SendHorizontal size={20} color="white" />
                    </button>
                }
            >
                <textarea
                    className={styles.textInput}
                    placeholder="Nhập tin nhắn..."
                    rows={1}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
            </ChatInputWrapper>

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
