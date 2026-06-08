import React, { useEffect, useMemo, useState } from "react";
import Modal from "../common/Modal";
import "./css/repairRequestModal.css";
import {
    AlertTriangle,
    Bolt,
    CalendarDays,
    Camera,
    CheckCircle2,
    Circle,
    Fan,
    MapPin,
    Phone,
    Refrigerator,
    Shirt,
    Upload,
    Video,
    Wrench,
    X,
    Zap,
} from "lucide-react";
import {useNavigate} from "react-router-dom";
import { navigateToChat } from "../../utils/chatNavigation";

interface RepairRequestModalProps {
    open: boolean;
    onClose: () => void;
    technicianId?: string;
}

const RepairRequestModal: React.FC<RepairRequestModalProps> = ({open, onClose, technicianId}) => {
    const navigate = useNavigate();
    const [service, setService] = useState<ServiceId>("aircon");
    const [airconType, setAirconType] = useState(airconTypes[0]);
    const [brand, setBrand] = useState("Daikin");
    const [description, setDescription] = useState("");
    const [uploads, setUploads] = useState<UploadedAsset[]>([]);
    const [urgency, setUrgency] = useState<UrgencyId>("normal");
    const [timeSlot, setTimeSlot] = useState("Sáng");
    const [date, setDate] = useState("");
    const [address, setAddress] = useState("123 Nguyễn Hữu Cảnh, Bình Thạnh");
    const [phone, setPhone] = useState("0901234567");

    const summaryError = useMemo(() => {
        if (!description.trim()) return "Chưa có mô tả lỗi";
        if (!address.trim()) return "Chưa có địa chỉ";
        return null;
    }, [address, description]);

    const appendIssueChip = (chip: string) => {
        setDescription((prev) => {
            if (!prev.trim()) return chip;
            if (prev.toLowerCase().includes(chip.toLowerCase())) return prev;
            return `${prev.trim()}\n- ${chip}`;
        });
    };

    const onFileSelected: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        const selectedFiles = Array.from(event.target.files ?? []);
        if (!selectedFiles.length) return;

        const nextUploads = selectedFiles.map((file, index) => ({
            id: `${file.name}-${Date.now()}-${index}`,
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        setUploads((prev) => [...prev, ...nextUploads].slice(0, 8));
        event.target.value = "";
    };

    const removeUpload = (id: string) => {
        setUploads((prev) => {
            const target = prev.find((item) => item.id === id);
            if (target) {
                URL.revokeObjectURL(target.previewUrl);
            }
            return prev.filter((item) => item.id !== id);
        });
    };

    useEffect(() => {
        return () => {
            uploads.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        };
    }, [uploads]);

    const onSubmit = () => {
        const payload = {
            provider: {
                name: providerName,
                avatar: providerAvatar,
                rating: providerRating,
            },
            request: {
                service,
                serviceLabel: selectedServiceLabel(service),
                deviceType: service === "aircon" ? airconType : "Khác",
                brand,
                description,
                urgency,
                timeSlot,
                date,
                address,
                phone,
                attachments: uploads.map((item) => ({
                    name: item.file.name,
                    type: item.file.type,
                    previewUrl: item.previewUrl,
                })),
            },
        };

        navigate("/customer/chat", {
            state: {
                prefillRepairRequest: payload,
            },
        });
        onClose();
    };

    const severityText = urgencyOptions.find((item) => item.id === urgency)?.label ?? "Không gấp";
    const providerName = provider?.name ?? "Thợ kỹ thuật";
    const providerAvatar = provider?.avatar ?? "https://placehold.co/80x80";
    const providerRating = provider?.rating ?? 4.8;
    const providerResponseEta = provider?.responseEta ?? "Phản hồi trong ~5 phút";

    return (
        <Modal open={open} onClose={onClose}>
            <div className="repair-modal">
                <button className="repair-close" onClick={onClose} aria-label="Close modal">
                    <X size={20}/>
                </button>

                <div className="repair-headline">
                    <div>
                        <h2>Yêu cầu sửa chữa</h2>
                        <p>Mô tả nhanh sự cố để thợ tư vấn và báo giá chính xác hơn</p>
                    </div>
                    <div className="provider-mini-card">
                        <img src={providerAvatar} alt={providerName} />
                        <div>
                            <strong>{providerName}</strong>
                            <span>
                                <Bolt size={14}/> {providerRating.toFixed(1)}
                            </span>
                            <small>{providerResponseEta}</small>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <footer className="repair-footer">
                    <button
                        className="btn-submit"
                        onClick={() => {
                            onClose();
                            if (technicianId) {
                                navigateToChat(navigate, "customer", { technicianId });
                                return;
                            }
                            navigate("/customer/chat");
                        }}
                    >
                            Gửi yêu cầu & Chat ngay
                </button>
            </footer>
        </div>
</Modal>
)
    ;
};

export default RepairRequestModal;
