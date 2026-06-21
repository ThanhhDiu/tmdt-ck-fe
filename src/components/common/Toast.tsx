import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import './Toast.css';

// ─── Kiểu dữ liệu Toast ─────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
    /** Thời gian hiển thị (ms), mặc định 4000ms */
    duration: number;
}

interface ToastContextValue {
    /** Hiển thị toast thông báo */
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

// ─── Context để dùng Toast từ bất kỳ đâu trong app ──────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

let toastIdCounter = 0;

// ─── Provider bao bọc toàn bộ app ───────────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    /**
     * Thêm một toast mới vào danh sách hiển thị.
     * Mỗi toast sẽ tự biến mất sau `duration` ms.
     */
    const showToast = useCallback(
        (message: string, type: ToastType = 'info', duration = 4000) => {
            const id = ++toastIdCounter;
            setToasts((prev) => [...prev, { id, message, type, duration }]);
        },
        [],
    );

    /** Xóa toast khỏi danh sách (khi animation kết thúc hoặc hết thời gian) */
    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Container hiển thị tất cả toast ở góc trên bên phải */}
            <div className="toast-container" aria-live="polite">
                {toasts.map((toast) => (
                    <ToastMessage key={toast.id} toast={toast} onDismiss={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

// ─── Hook tiện ích để gọi showToast từ bất kỳ component con nào ─────────────
export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error('useToast phải được sử dụng bên trong <ToastProvider>');
    }
    return ctx;
}

// ─── Component hiển thị từng toast riêng lẻ ──────────────────────────────────
function ToastMessage({
    toast,
    onDismiss,
}: {
    toast: ToastItem;
    onDismiss: (id: number) => void;
}) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Tự động bắt đầu animation thoát trước khi hết duration 300ms
        const exitTimer = setTimeout(() => setIsExiting(true), toast.duration - 300);
        // Xóa toast khỏi DOM sau khi animation kết thúc
        const removeTimer = setTimeout(() => onDismiss(toast.id), toast.duration);

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [toast.id, toast.duration, onDismiss]);

    // Map icon SVG cho từng loại toast
    const icons: Record<ToastType, string> = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    };

    return (
        <div
            className={`toast-message toast-message--${toast.type} ${isExiting ? 'toast-message--exit' : ''}`}
            role="alert"
        >
            <span className="toast-message__icon">{icons[toast.type]}</span>
            <span className="toast-message__text">{toast.message}</span>
            <button
                className="toast-message__close"
                onClick={() => onDismiss(toast.id)}
                aria-label="Đóng thông báo"
            >
                ×
            </button>
        </div>
    );
}
