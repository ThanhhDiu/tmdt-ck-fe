import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    Image as ImageIcon,
    MapPin,
    Play,
    Send,
    ShieldAlert,
    Wrench,
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import styles from './ChatPage.module.css';
import { ContactItem } from '../components/chat/ContactItem';
import { QuotationCard } from '../components/chat/QuotationCard';
import { MessageInput } from '../components/chat/MessageInput';
import { SearchBar } from '../components/chat/SearchBar';
import { Avatar } from '../components/common/Avatar';
import type { Contact } from '../types/Message';
import type {UserRole} from "../types/UserRole.ts";

const mockContact: Contact = {
    id: '1',
    name: 'Nguyễn Văn An',
    lastMessage: 'Tôi đã gửi báo giá...',
    time: '10:45 AM',
    avatar: 'https://placehold.co/48x48',
    isOnline: true
};

const mockContact2: Contact = {
    id: '2',
    name: 'Trần Văn Bình',
    lastMessage: 'Dạ vâng, anh gửi đi ạ.',
    time: '10:45 AM',
    avatar: 'https://placehold.co/48x48',
    isOnline: true
};

const pageMap: Record<string, string> = {
    home: '/',
    provider: '/provider',
    services: '/services',
    rewards: '/rewards',
    'provider-profile': '/provider-profile',
    'provider-dashboard': '/provider-dashboard',
    'customer-settings': '/customer/account-settings',
    login: '/auth/login',
};

export const ChatPage: React.FC<{ role?: UserRole }> = ({ role = "customer" }) => {
    const nav = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(role === "customer");
    const [requestStatus, setRequestStatus] = useState<'creating' | 'sent'>('sent');
    const [requestTimestamp] = useState(
        () => new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    );

    const repairPrefill = (location.state as {
        prefillRepairRequest?: {
            provider: {
                name: string;
                avatar: string;
                rating: number;
            };
            request: {
                serviceLabel: string;
                deviceType: string;
                brand: string;
                description: string;
                urgency: string;
                timeSlot: string;
                date?: string;
                address: string;
                phone: string;
                attachments: Array<{
                    name: string;
                    type: string;
                    previewUrl: string;
                }>;
            };
        };
    })?.prefillRepairRequest;

    const mockContact: Contact = {
        id: '1',
        name: repairPrefill?.provider.name || 'Nguyễn Văn An',
        lastMessage: 'Tôi đã gửi báo giá...',
        time: '10:45 AM',
        avatar: repairPrefill?.provider.avatar || 'https://placehold.co/48x48',
        isOnline: true
    };

    const urgencyMap: Record<string, string> = {
        normal: 'Không gấp',
        today: 'Cần hôm nay',
        urgent: 'Khẩn cấp',
    };

    const handleSendMessage = (text: string) => {
        console.log("Tin nhắn mới:", text);
    };

    const onNavigate = (page: string, data?: unknown) => {
        const path = pageMap[page] || '/';
        nav(path, { state: data });
    };

    useEffect(() => {
        setIsSidebarOpen(role === "customer");
    }, [role]);

    useEffect(() => {
        if (!repairPrefill) return;
        setRequestStatus('creating');
        const timer = window.setTimeout(() => setRequestStatus('sent'), 700);
        return () => window.clearTimeout(timer);
    }, [repairPrefill]);

    return (
        <div className={styles.container}>

            {/* HEADER chỉ cho khách */}
            {role === "customer" && <Header onNavigate={onNavigate} />}

            <div className={styles.mainLayout}>

                {/* SIDEBAR */}
                <aside
                    className={`${styles.sidebar} ${
                        !isSidebarOpen ? styles.sidebarClosed : ''
                    }`}
                >
                    <div style={{ padding: '16px' }}>
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Tìm kiếm hội thoại..."
                        />
                    </div>
                    <div style={{ padding: '0 8px' }}>
                        <ContactItem contact={mockContact} isActive />
                        <ContactItem contact={mockContact2} />
                    </div>
                </aside>

                {/* CHAT AREA */}
                <main className={styles.chatArea}>

                    {/* HEADER CHAT */}
                    <header className={styles.chatHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

                            {/* Nút toggle chỉ cho thợ */}
                            {role === "technician" && (
                                <button
                                    className={styles.toggleBtn}
                                    onClick={() => setIsSidebarOpen(prev => !prev)}
                                >
                                    ☰
                                </button>
                            )}

                            <Avatar src={mockContact.avatar} size={40} isOnline />
                            <div>
                                <strong>{mockContact.name}</strong>
                                <span style={{ fontSize: 12, color: '#22C55E', display: 'block' }}>
                                    ● Đang hoạt động
                                </span>
                            </div>
                        </div>
                    </header>

                    {/* MESSAGE */}
                    <section className={styles.messageList}>
                        <div className={styles.messageRow}>
                            <Avatar src={mockContact.avatar} size={32} />
                            <div className={styles.messageContent}>
                                <div className={`${styles.bubble} ${styles.bubbleLeft}`}>
                                    Chào bạn, tôi gửi báo giá nhé.
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.messageRow} ${styles.messageRowRight}`}>
                            <div className={styles.messageContent}>
                                <div className={`${styles.bubble} ${styles.bubbleRight}`}>
                                    Ok anh.
                                </div>
                            </div>
                        </div>

                        <div className={styles.messageRow}>
                            <Avatar src={mockContact.avatar} size={32} />
                            <div className={styles.messageContent}>
                                <QuotationCard
                                    serviceName="Sửa máy lạnh"
                                    description="Vệ sinh + nạp gas"
                                    price={450000}
                                />
                            </div>
                        </div>

                        {repairPrefill && (
                            <div className={`${styles.messageRow} ${styles.messageRowRight}`}>
                                <div className={`${styles.messageContent} ${styles.repairMessageContent}`}>
                                    <div className={styles.repairSummaryCard}>
                                        <div className={styles.repairSummaryHeader}>
                                            <div className={styles.repairSummaryTitleGroup}>
                                                <span className={styles.repairSummaryIconWrap}>
                                                    <Wrench size={14} />
                                                </span>
                                                <h4>Yêu cầu sửa chữa đã gửi</h4>
                                            </div>
                                            {requestStatus === 'creating' ? (
                                                <span className={`${styles.repairStatusBadge} ${styles.pending}`}>
                                                    Đang tạo yêu cầu...
                                                </span>
                                            ) : (
                                                <span className={`${styles.repairStatusBadge} ${styles.sent}`}>
                                                    <CheckCircle2 size={13} /> Đang chờ phản hồi
                                                </span>
                                            )}
                                        </div>

                                        <div className={styles.repairInfoRows}>
                                            <div className={styles.repairInfoRow}>
                                                <span className={styles.repairInfoIcon}><Wrench size={15} /></span>
                                                <div>
                                                    <p className={styles.repairInfoLabel}>Thiết bị</p>
                                                    <p className={styles.repairInfoValue}>
                                                        {repairPrefill.request.serviceLabel} • {repairPrefill.request.deviceType} • {repairPrefill.request.brand}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className={styles.repairInfoRow}>
                                                <span className={styles.repairInfoIcon}><AlertTriangle size={15} /></span>
                                                <div>
                                                    <p className={styles.repairInfoLabel}>Sự cố</p>
                                                    <p className={styles.repairInfoValue}>{repairPrefill.request.description || 'Chưa cập nhật'}</p>
                                                </div>
                                            </div>

                                            <div className={styles.repairInfoRow}>
                                                <span className={styles.repairInfoIcon}><MapPin size={15} /></span>
                                                <div>
                                                    <p className={styles.repairInfoLabel}>Địa chỉ</p>
                                                    <p className={styles.repairInfoValue}>{repairPrefill.request.address}</p>
                                                </div>
                                            </div>

                                            <div className={styles.repairInfoRow}>
                                                <span className={styles.repairInfoIcon}><Clock3 size={15} /></span>
                                                <div>
                                                    <p className={styles.repairInfoLabel}>Thời gian</p>
                                                    <p className={styles.repairInfoValue}>
                                                        {repairPrefill.request.timeSlot}{repairPrefill.request.date ? ` - ${repairPrefill.request.date}` : ''}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className={styles.repairInfoRow}>
                                                <span className={styles.repairInfoIcon}><ShieldAlert size={15} /></span>
                                                <div>
                                                    <p className={styles.repairInfoLabel}>Mức độ</p>
                                                    <p className={styles.repairInfoValue}>{urgencyMap[repairPrefill.request.urgency] || 'Không gấp'}</p>
                                                </div>
                                            </div>

                                            <div className={styles.repairInfoRow}>
                                                <span className={styles.repairInfoIcon}><ImageIcon size={15} /></span>
                                                <div>
                                                    <p className={styles.repairInfoLabel}>Media</p>
                                                    <p className={styles.repairInfoValue}>
                                                        {repairPrefill.request.attachments.length > 0
                                                            ? `${repairPrefill.request.attachments.length} hình ảnh/video đính kèm`
                                                            : 'Không có tệp đính kèm'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {repairPrefill.request.attachments.length > 0 && (
                                            <div className={styles.repairMediaGrid}>
                                                {repairPrefill.request.attachments.slice(0, 3).map((asset, index) => (
                                                    <div key={`${asset.name}-${index}`} className={styles.repairMediaItem}>
                                                        {asset.type.startsWith('video/') ? (
                                                            <>
                                                                <video src={asset.previewUrl} muted playsInline />
                                                                <span className={styles.repairMediaPlay}><Play size={14} /></span>
                                                            </>
                                                        ) : (
                                                            <img src={asset.previewUrl} alt={asset.name} />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className={styles.repairSummaryFooter}>
                                            <span>
                                                <Send size={13} /> Thông tin đã được gửi đến thợ để tư vấn và báo giá
                                            </span>
                                            <small>{requestTimestamp}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* INPUT */}
                    <footer className={styles.inputArea}>
                        <MessageInput onSendMessage={handleSendMessage} />
                    </footer>
                </main>
            </div>
        </div>
    );
};
