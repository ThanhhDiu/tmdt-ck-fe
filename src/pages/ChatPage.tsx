import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import styles from './ChatPage.module.css';
import { ContactItem } from '../components/chat/ContactItem';
import { QuotationCard } from '../components/chat/QuotationCard';
import { MessageInput } from '../components/chat/MessageInput';
import { SearchBar } from '../components/chat/SearchBar';
import { Avatar } from '../components/common/Avatar';
import { RepairRequestCard } from '../components/chat/RepairRequestCard';
import { PriceAdjustmentCard } from '../components/chat/PriceAdjustmentCard';
import { AdjustmentModal, type AdjustmentSubmitPayload } from '../components/modal/AdjustmentModal';
import UpdatePriceModal from '../components/modal/UpdatePriceModal';
import QuoteCreateModal from '../components/modal/QuoteCreateModal';
import { chatService } from '../services/chat/chatService';
import { mapWsMessageToChatMessage } from '../services/chat/chatRealtimeClient';
import { orderService } from '../services/order/orderService';
import { getStoredUser } from '../services/auth';
import { useChatRealtime } from '../hooks/useChatRealtime';
import { mergeUniqueMessages, resolveMessageImageUrl } from '../utils/chatMessages';
import type { Contact } from '../types/Message';
import type { UserRole } from '../types/UserRole';
import type { ChatLocationState, ChatMessage, ConversationItem } from '../types/chat';
import type { OrderResponse } from '../types/order/order';
import type { Quote } from '../types/Quote';

const pageMap: Record<string, string> = {
    home: '/',
    provider: '/provider',
    services: '/services',
    // rewards: '/rewards',
    'provider-profile': '/provider-profile',
    'provider-dashboard': '/provider-dashboard',
    'customer-settings': '/customer/account-settings',
    login: '/auth/login',
};

const formatMessageTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const isImagePreview = (message?: ConversationItem['lastMessage'] | null) => {
    if (!message) return false;
    if (message.type === 'image') return true;

    const value = (message.preview ?? message.content ?? '').trim();
    return /^https?:\/\/.+\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(value) ||
        /^\/?uploads\/.+\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(value);
};

const getConversationPreview = (message?: ConversationItem['lastMessage'] | null) => {
    if (!message) return '';
    const repairRequest = parseRepairRequestContent(message.content ?? message.preview);
    if (repairRequest) return 'Yêu cầu sửa chữa mới';
    if (isImagePreview(message)) return 'Đã nhận 1 ảnh';
    return message.preview ?? message.content ?? '';
};

const toContact = (conversation: ConversationItem): Contact => ({
    id: conversation.id,
    name: conversation.partner?.fullName ?? 'Đối tác',
    lastMessage: getConversationPreview(conversation.lastMessage),
    time: conversation.lastMessage?.sentAt
        ? formatMessageTime(conversation.lastMessage.sentAt)
        : '',
    avatar: conversation.partner?.avatar ?? 'https://placehold.co/48x48',
    isOnline: conversation.partner?.isOnline ?? false,
    unread: conversation.unreadCount > 0,
});

type RepairRequestMessagePayload = {
    kind?: string;
    orderCode?: string;
    deviceName?: string;
    serviceName?: string;
    serviceCategory?: string;
    description?: string;
    address?: string;
    estimatedPrice?: number;
    expectedTime?: string;
    images?: string[];
};

const parseRepairRequestContent = (content?: string | null): RepairRequestMessagePayload | null => {
    if (!content) return null;
    try {
        const payload = JSON.parse(content) as RepairRequestMessagePayload;
        return payload?.kind === 'repair_request' && payload.orderCode ? payload : null;
    } catch {
        return null;
    }
};

const firstNonBlank = (...values: Array<string | null | undefined>) =>
    values.find((value) => value?.trim())?.trim();

const mapRepairRequestToOrder = (payload: RepairRequestMessagePayload): OrderResponse => ({
    id: payload.orderCode ?? '',
    status: 'NEW',
    deviceName: firstNonBlank(payload.deviceName, payload.serviceName, payload.serviceCategory),
    serviceName: firstNonBlank(payload.serviceName, payload.deviceName, payload.serviceCategory),
    serviceCategory: payload.serviceCategory,
    description: payload.description,
    address: payload.address,
    estimatedPrice: payload.estimatedPrice,
    expectedTime: payload.expectedTime,
    images: payload.images ?? [],
});

export const ChatPage: React.FC<{ role?: UserRole }> = ({ role = 'customer' }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state as ChatLocationState | null;

    const routeConversationId = locationState?.conversationId;
    const routeOrderId = locationState?.orderId;
    const routeTechnicianId = locationState?.technicianId;
    const routeCustomerId = locationState?.customerId;

    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [conversations, setConversations] = useState<ConversationItem[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [linkedOrder, setLinkedOrder] = useState<OrderResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
    const [isPriceConfirmOpen, setIsPriceConfirmOpen] = useState(false);
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const currentUser = getStoredUser();
    const currentUserCode = currentUser?.code ?? '';

    const activeConversation = useMemo(
        () => conversations.find((c) => c.id === activeConversationId) ?? null,
        [conversations, activeConversationId]
    );

    const activeRepairRequest = useMemo(() => {
        for (let index = messages.length - 1; index >= 0; index -= 1) {
            const message = messages[index];
            if (message.type !== 'system') continue;
            const repairRequest = parseRepairRequestContent(message.content);
            if (repairRequest) return repairRequest;
        }
        return null;
    }, [messages]);

    const quoteSourceOrder = useMemo(
        () => activeRepairRequest ? mapRepairRequestToOrder(activeRepairRequest) : linkedOrder,
        [activeRepairRequest, linkedOrder]
    );

    const filteredConversations = useMemo(() => {
        const keyword = searchQuery.trim().toLowerCase();
        if (!keyword) return conversations;
        return conversations.filter((c) => c.partner.fullName.toLowerCase().includes(keyword));
    }, [conversations, searchQuery]);

    const loadLinkedOrder = useCallback(async (orderId?: string | null) => {
        if (!orderId) {
            setLinkedOrder(null);
            return;
        }
        try {
            const order = await orderService.getOrderById(orderId);
            setLinkedOrder(order);
        } catch {
            setLinkedOrder(null);
        }
    }, []);

    const loadMessages = useCallback(async (conversationId: string) => {
        const items = await chatService.listMessages(conversationId);
        setMessages(mergeUniqueMessages([], items));
    }, []);

    const refreshConversations = useCallback(async () => {
        const items = await chatService.listConversations();
        setConversations(items);
        return items;
    }, []);

    const conversationIds = useMemo(
        () => conversations.map((c) => c.id).filter(Boolean),
        [conversations]
    );

    const handleRealtimeMessage = useCallback(
        (payload: Parameters<typeof mapWsMessageToChatMessage>[0]) => {
            const incoming = mapWsMessageToChatMessage(payload);
            const conversationId = incoming.conversationId;
            const isActive = conversationId === activeConversationId;
            const isFromMe = incoming.senderId === currentUserCode;

            if (isActive) {
                setMessages((prev) => mergeUniqueMessages(prev, incoming));
            }

            setConversations((prev) =>
                prev.map((c) => {
                    if (c.id !== conversationId) return c;
                    const preview =
                        parseRepairRequestContent(incoming.content)
                            ? 'Yêu cầu sửa chữa mới'
                            : incoming.type === 'quotation'
                            ? 'Báo giá mới'
                            : incoming.type === 'image'
                                ? 'Ảnh mới'
                            : incoming.content ?? '';
                    return {
                        ...c,
                        lastMessage: {
                            type: incoming.type,
                            content: preview,
                            preview,
                            sentAt: incoming.sentAt,
                        },
                        unreadCount:
                            isActive || isFromMe ? c.unreadCount : c.unreadCount + 1,
                    };
                })
            );
        },
        [activeConversationId, currentUserCode]
    );

    useChatRealtime({
        conversationIds,
        enabled: !isLoading && conversationIds.length > 0,
        onMessage: handleRealtimeMessage,
    });

    const openConversation = useCallback(
        async (conversationId: string, orderId?: string | null) => {
            setActiveConversationId(conversationId);
            setConversations((prev) =>
                prev.map((c) =>
                    c.id === conversationId ? { ...c, unreadCount: 0 } : c
                )
            );
            await loadLinkedOrder(orderId ?? null);
            await loadMessages(conversationId);
        },
        [loadLinkedOrder, loadMessages]
    );

    useEffect(() => {
        setIsSidebarOpen(true);
    }, [role]);

    useEffect(() => {
        let cancelled = false;

        const bootstrap = async () => {
            setIsLoading(true);
            setLoadError(null);

            try {
                let items = await refreshConversations();
                if (cancelled) return;

                let technicianId = routeTechnicianId;
                let orderId = routeOrderId;

                if (role === 'customer' && orderId && !technicianId) {
                    const order = await orderService.getOrderById(orderId);
                    if (cancelled) return;
                    technicianId = order.technician?.id;
                    setLinkedOrder(order);
                    if (!technicianId) {
                        setLoadError('Đơn hàng chưa có thợ nhận. Vui lòng đợi thợ nhận đơn trước khi chat.');
                        return;
                    }
                }

                if (routeConversationId) {
                    const found = items.find((c) => c.id === routeConversationId);
                    await openConversation(
                        routeConversationId,
                        found?.orderId ?? orderId ?? null
                    );
                    return;
                }

                if (orderId) {
                    const byOrder = items.find((c) => c.orderId === orderId);
                    if (byOrder) {
                        await openConversation(byOrder.id, byOrder.orderId ?? orderId);
                        return;
                    }

                    if (role === 'technician' || role === 'customer') {
                        try {
                            const order = await orderService.getOrderById(orderId);
                            if (cancelled) return;
                            const partnerId =
                                role === 'technician'
                                    ? order.customer?.id
                                    : order.technician?.id;
                            if (partnerId) {
                                const byPartner = items.find((c) => c.partner?.id === partnerId);
                                if (byPartner) {
                                    await openConversation(
                                        byPartner.id,
                                        byPartner.orderId ?? orderId
                                    );
                                    return;
                                }
                            }
                            if (role === 'customer' && order.technician?.id) {
                                technicianId = order.technician.id;
                            }
                            if (role === 'technician' && order.customer?.id) {
                                const byCustomer = items.find(
                                    (c) => c.partner?.id === order.customer?.id
                                );
                                if (byCustomer) {
                                    await openConversation(byCustomer.id, orderId);
                                    return;
                                }
                            }
                        } catch {
                            // order lookup failed — fall through
                        }
                    }
                }

                if (role === 'technician' && routeCustomerId) {
                    const byCustomer = items.find((c) => c.partner?.id === routeCustomerId);
                    if (byCustomer) {
                        await openConversation(
                            byCustomer.id,
                            byCustomer.orderId ?? orderId ?? null
                        );
                        return;
                    }
                }

                if (role === 'customer' && technicianId) {
                    const existing = items.find((c) => c.partner?.id === technicianId);
                    if (existing && (!orderId || existing.orderId === orderId)) {
                        await openConversation(
                            existing.id,
                            existing.orderId ?? orderId ?? null
                        );
                        return;
                    }

                    const created = await chatService.createConversation({
                        technicianId,
                        orderId,
                    });
                    if (cancelled) return;

                    setConversations((prev) => {
                        const withoutDup = prev.filter((c) => c.id !== created.id);
                        return [created, ...withoutDup];
                    });
                    await openConversation(created.id, created.orderId ?? orderId ?? null);
                    return;
                }

                if (items.length > 0 && !orderId && !routeCustomerId && !technicianId) {
                    await openConversation(items[0].id, items[0].orderId);
                    return;
                }

                if (routeOrderId || routeTechnicianId || routeCustomerId) {
                    setLoadError(
                        'Không tìm thấy hội thoại tương ứng. Hãy thử mở lại từ đơn hàng hoặc hồ sơ thợ.'
                    );
                }
            } catch (error) {
                if (!cancelled) {
                    setLoadError(
                        error instanceof Error
                            ? error.message
                            : 'Không thể tải dữ liệu chat. Vui lòng thử lại.'
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        bootstrap();

        return () => {
            cancelled = true;
        };
    }, [
        openConversation,
        refreshConversations,
        role,
        routeConversationId,
        routeOrderId,
        routeTechnicianId,
        routeCustomerId,
    ]);

    useEffect(() => {
        if (role !== 'customer') return;
        if (linkedOrder?.priceAdjustment?.status?.toLowerCase() === 'pending') {
            setIsPriceConfirmOpen(true);
        }
    }, [linkedOrder, role]);

    const handleSelectConversation = async (conversationId: string) => {
        setActiveConversationId(conversationId);
        setConversations((prev) =>
            prev.map((c) =>
                c.id === conversationId ? { ...c, unreadCount: 0 } : c
            )
        );
        const selected = conversations.find((c) => c.id === conversationId);
        await loadLinkedOrder(selected?.orderId);
        await loadMessages(conversationId);
    };

    const handleSendMessage = async (text: string) => {
        if (!activeConversationId) return;
        const sent = await chatService.sendMessage(activeConversationId, text);
        setMessages((prev) => mergeUniqueMessages(prev, { ...sent, isRead: true }));
        await refreshConversations();
    };

    const handleSendImage = async (imageUrl: string) => {
        if (!activeConversationId) return;
        const sent = await chatService.sendImageMessage(activeConversationId, imageUrl);
        setMessages((prev) => mergeUniqueMessages(prev, { ...sent, isRead: true }));
        await refreshConversations();
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages.length, activeConversationId, linkedOrder?.id, linkedOrder?.priceAdjustment?.requestedAt]);

    const handleCreateQuote = async (quote: Quote) => {
        if (!activeConversationId || !quoteSourceOrder?.id) return;
        const scheduledAt =
            quote.scheduledAt ??
            (quote.date && quote.time
                ? new Date(`${quote.date}T${quote.time}`).toISOString()
                : new Date().toISOString());

        await chatService.createQuotation(activeConversationId, {
            orderCode: quoteSourceOrder.id,
            serviceName: firstNonBlank(
                quote.serviceName,
                quoteSourceOrder.serviceName,
                quoteSourceOrder.deviceName,
                quoteSourceOrder.serviceCategory
            ) ?? 'Dịch vụ sửa chữa',
            description: firstNonBlank(quote.description, quoteSourceOrder.description, quoteSourceOrder.subService) ?? '',
            price: quote.price,
            scheduledAt,
            notes: quote.notes,
        });
        setIsQuoteOpen(false);
        if (activeConversationId) {
            await loadMessages(activeConversationId);
        }
        await refreshConversations();
    };

    const handleAcceptQuote = async (quotationId: string) => {
        const originalOrderId = linkedOrder?.id;
        const result = await chatService.acceptQuotation(quotationId);
        if (activeConversationId) {
            await loadMessages(activeConversationId);
        }
        const nextOrderId = originalOrderId ?? result.orderId;
        await loadLinkedOrder(nextOrderId);
        const items = await refreshConversations();
        const active = items.find((c) => c.id === activeConversationId) ?? items.find((c) => c.orderId === nextOrderId);
        if (active) {
            setActiveConversationId(active.id);
        }
    };

    const handleRejectQuote = async (quotationId: string) => {
        await chatService.rejectQuotation(quotationId);
        if (activeConversationId) {
            await loadMessages(activeConversationId);
        }
    };

    const handleSubmitPriceAdjustment = async (payload: AdjustmentSubmitPayload) => {
        if (!linkedOrder?.id) return;
        const updated = await orderService.requestPriceAdjustment(linkedOrder.id, payload);
        setLinkedOrder(updated);
        if (activeConversationId) {
            await loadMessages(activeConversationId);
        }
    };

    const handleApprovePrice = async () => {
        if (!linkedOrder?.id) return;
        const updated = await orderService.approvePriceAdjustment(linkedOrder.id);
        setLinkedOrder(updated);
        setIsPriceConfirmOpen(false);
    };

    const handleRejectPrice = async () => {
        if (!linkedOrder?.id) return;
        const updated = await orderService.rejectPriceAdjustment(
            linkedOrder.id,
            'Khách hàng từ chối điều chỉnh giá'
        );
        setLinkedOrder(updated);
        setIsPriceConfirmOpen(false);
    };

    const onNavigate = (page: string, data?: unknown) => {
        const path = pageMap[page] || '/';
        navigate(path, { state: data });
    };

    const orderStatus = linkedOrder?.status?.toLowerCase() ?? '';
    const showPriceAdjustAction =
        role === 'technician' && orderStatus === 'in_progress';

    const pendingAdjustment =
        linkedOrder?.priceAdjustment?.status?.toLowerCase() === 'pending'
            ? linkedOrder.priceAdjustment
            : null;

    const activeContact: Contact = activeConversation
        ? toContact(activeConversation)
        : {
              id: '',
              name: 'Chọn hội thoại',
              lastMessage: '',
              time: '',
              avatar: 'https://placehold.co/48x48',
          };

    return (
        <div className={`${styles.container} ${role === 'technician' ? styles.technicianContainer : ''}`}>
            {role === 'customer' && <Header onNavigate={onNavigate} />}

            <div className={styles.mainLayout}>
                <aside
                    className={`${styles.sidebar} ${!isSidebarOpen ? styles.sidebarClosed : ''}`}
                >
                    <div style={{ padding: '16px' }}>
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Tìm kiếm hội thoại..."
                        />
                    </div>
                    <div style={{ padding: '0 8px' }}>
                        {filteredConversations.map((conversation) => (
                            <ContactItem
                                key={conversation.id}
                                contact={toContact(conversation)}
                                isActive={conversation.id === activeConversationId}
                                onClick={() => handleSelectConversation(conversation.id)}
                            />
                        ))}
                        {!isLoading && filteredConversations.length === 0 && (
                            <p className={styles.emptySidebar}>Chưa có hội thoại</p>
                        )}
                    </div>
                </aside>

                <main className={styles.chatArea}>
                    <header className={styles.chatHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {false && (
                                <button
                                    type="button"
                                    className={styles.toggleBtn}
                                    onClick={() => setIsSidebarOpen((prev) => !prev)}
                                >
                                    ☰
                                </button>
                            )}
                            <Avatar src={activeContact.avatar} size={40} isOnline={activeContact.isOnline} />
                            <div>
                                <strong>{activeContact.name}</strong>
                                {linkedOrder && (
                                    <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>
                                        Đơn {linkedOrder.id}
                                    </span>
                                )}
                            </div>
                        </div>
                    </header>

                    <section className={styles.messageList}>
                        {isLoading && (
                            <div className={styles.messageSkeletonStack}>
                                <div className={styles.messageSkeleton} />
                                <div className={`${styles.messageSkeleton} ${styles.messageSkeletonRight}`} />
                                <div className={styles.messageSkeletonShort} />
                            </div>
                        )}

                        {!isLoading && loadError && (
                            <p className={styles.emptyChat}>{loadError}</p>
                        )}

                        {!isLoading && !loadError && !activeConversationId && (
                            <p className={styles.emptyChat}>Chọn hoặc bắt đầu một cuộc trò chuyện</p>
                        )}

                        {!isLoading &&
                            messages.map((message) => {
                                const isMe = message.senderId === currentUserCode;
                                const isQuotation = message.type === 'quotation' && message.quotation;
                                const repairRequest = message.type === 'system'
                                    ? parseRepairRequestContent(message.content)
                                    : null;
                                const imageUrl = resolveMessageImageUrl(message);

                                return (
                                    <div
                                        key={message.id}
                                        className={`${styles.messageRow} ${isMe ? styles.messageRowRight : ''}`}
                                    >
                                        {!isMe && (
                                            <Avatar src={activeContact.avatar} size={32} isOnline={false} />
                                        )}
                                        <div className={styles.messageContent}>
                                            {repairRequest ? (
                                                <RepairRequestCard
                                                    order={mapRepairRequestToOrder(repairRequest)}
                                                    onQuote={
                                                        role === 'technician'
                                                            ? () => setIsQuoteOpen(true)
                                                            : undefined
                                                    }
                                                />
                                            ) : isQuotation ? (
                                                <QuotationCard
                                                    serviceName={message.quotation!.serviceName}
                                                    description={message.quotation!.description}
                                                    price={message.quotation!.price}
                                                    scheduledAt={message.quotation!.scheduledAt}
                                                    status={message.quotation!.status}
                                                    isCustomer={role === 'customer'}
                                                    onAccept={() =>
                                                        handleAcceptQuote(message.quotation!.id)
                                                    }
                                                    onReject={() =>
                                                        handleRejectQuote(message.quotation!.id)
                                                    }
                                                />
                                            ) : imageUrl ? (
                                                <a href={imageUrl} target="_blank" rel="noreferrer" className={styles.imageBubble}>
                                                    <img src={imageUrl} alt="Ảnh trong hội thoại" />
                                                </a>
                                            ) : (
                                                <div
                                                    className={`${styles.bubble} ${
                                                        isMe ? styles.bubbleRight : styles.bubbleLeft
                                                    }`}
                                                >
                                                    {message.content}
                                                </div>
                                            )}
                                            <span className={styles.messageTime}>
                                                {formatMessageTime(message.sentAt)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}

                        {pendingAdjustment && role === 'customer' && (
                            <div className={styles.messageRow}>
                                <div className={styles.messageContent}>
                                    <PriceAdjustmentCard
                                        adjustment={pendingAdjustment}
                                        onConfirm={() => setIsPriceConfirmOpen(true)}
                                    />
                                </div>
                            </div>
                        )}

                        {isTyping && (
                            <div className={styles.typingIndicator}>Đang soạn tin nhắn...</div>
                        )}
                        <div ref={messagesEndRef} />
                    </section>

                    {activeConversationId && (
                        <footer className={styles.inputArea}>
                            <MessageInput
                                role={role}
                                onSendMessage={handleSendMessage}
                                onSendImage={handleSendImage}
                                onTypingChange={setIsTyping}
                                onCreateQuote={handleCreateQuote}
                                linkedOrder={quoteSourceOrder}
                                showQuoteAction={role === 'technician' && Boolean(quoteSourceOrder)}
                                showPriceAdjustAction={showPriceAdjustAction}
                                onOpenPriceAdjust={() => setIsAdjustmentOpen(true)}
                            />
                        </footer>
                    )}
                </main>
            </div>

            {isQuoteOpen && quoteSourceOrder && (
                <QuoteCreateModal
                    open={isQuoteOpen}
                    onClose={() => setIsQuoteOpen(false)}
                    onSubmit={handleCreateQuote}
                    linkedOrder={quoteSourceOrder}
                />
            )}

            {isAdjustmentOpen && linkedOrder && (
                <AdjustmentModal
                    currentPrice={linkedOrder.estimatedPrice ?? linkedOrder.finalPrice ?? 0}
                    onClose={() => setIsAdjustmentOpen(false)}
                    onSubmit={handleSubmitPriceAdjustment}
                />
            )}

            {pendingAdjustment && (
                <UpdatePriceModal
                    open={isPriceConfirmOpen}
                    onClose={() => setIsPriceConfirmOpen(false)}
                    adjustment={pendingAdjustment}
                    onConfirm={handleApprovePrice}
                    onReject={handleRejectPrice}
                />
            )}
        </div>
    );
};
