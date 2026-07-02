import React, { useEffect, useMemo, useState } from "react";
import Modal from "../common/Modal";
import QuoteForm from "../quote/QuoteForm";
import { QuotationCard } from "../chat/QuotationCard";
import type { Quote } from "../../types/Quote";
import type { OrderResponse } from "../../types/order/order";
import "./css/quote.css";

interface QuoteCreateModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (quote: Quote) => Promise<void>;
    linkedOrder?: OrderResponse | null;
}

const toDateTimeInputParts = (value?: string) => {
    if (!value) return { date: "", time: "" };

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { date: "", time: "" };

    const pad = (part: number) => String(part).padStart(2, "0");
    return {
        date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
        time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
    };
};

const firstNonBlank = (...values: Array<string | null | undefined>) =>
    values.find((value) => value?.trim())?.trim() ?? "";

const buildInitialQuote = (order?: OrderResponse | null): Quote => {
    const schedule = toDateTimeInputParts(order?.expectedTime ?? order?.scheduledAt);

    return {
        serviceName: firstNonBlank(order?.serviceName, order?.deviceName, order?.serviceCategory),
        description: firstNonBlank(order?.description, order?.subService),
        date: schedule.date,
        time: schedule.time,
        price: order?.estimatedPrice ?? order?.finalPrice ?? 0,
        notes: "",
    };
};

const QuoteCreateModal: React.FC<QuoteCreateModalProps> = ({ open, onClose, onSubmit, linkedOrder }) => {
    const initialQuote = useMemo(() => buildInitialQuote(linkedOrder), [linkedOrder]);
    const [quote, setQuote] = useState<Quote>(initialQuote);

    useEffect(() => {
        if (open) {
            setQuote(initialQuote);
        }
    }, [initialQuote, open]);

    const previewSchedule =
        quote.date && quote.time
            ? new Date(`${quote.date}T${quote.time}`).toISOString()
            : undefined;

    const previewServiceName =
        firstNonBlank(quote.serviceName, linkedOrder?.deviceName, linkedOrder?.serviceCategory) || "Dịch vụ sửa chữa";
    const previewDescription = firstNonBlank(quote.description, linkedOrder?.description) || "Chưa có mô tả chi tiết.";

    return (
        <Modal open={open} onClose={onClose}>
            <div className="quote-modal">
                <div className="quote-left">
                    <QuoteForm
                        quote={quote}
                        setQuote={setQuote}
                        onClose={onClose}
                        onSubmit={onSubmit}
                    />
                </div>
                <div className="quote-right">
                    <div className="preview-header-text" style={{ marginBottom: "24px" }}>
                        <div className="preview-title">XEM TRƯỚC BÁO GIÁ</div>
                        <div className="preview-sub">Giao diện khách hàng sẽ nhận</div>
                    </div>
                    <QuotationCard
                        serviceName={previewServiceName}
                        description={previewDescription}
                        price={quote.price}
                        scheduledAt={previewSchedule}
                        previewMode={true}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default QuoteCreateModal;
