import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { chatService } from '../services/chat/chatService';
import { mapWsMessageToChatMessage } from '../services/chat/chatRealtimeClient';
import { orderService } from '../services/order/orderService';
import { getStoredUser } from '../services/auth';
import { useChatRealtime } from '../hooks/useChatRealtime';
import type { Contact } from '../types/Message';
import type { UserRole } from '../types/UserRole';
import type { ChatLocationState, ChatMessage, ConversationItem } from '../types/chat';
import type { OrderResponse } from '../types/order/order';
import type { Quote } from '../types/Quote';

const pageMap: Record<string, string> = {
    home: '/',
    provider: '/provider',
    services: '/services',
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

const toContact = (conversation: ConversationItem): Contact => ({
    id: conversation.id,
    name: conversation.partner?.fullName ?? 'Đối tác',
    lastMessage:
        conversation.lastMessage?.preview ??
        conversation.lastMessage?.content ??
        '',
    time: conversation.lastMessage?.sentAt
        ? formatMessageTime(conversation.lastMessage.sentAt)
        : '',
    avatar: conversation.partner?.avatar ?? 'https://placehold.co/48x48',
    isOnline: conversation.partner?.isOnline ?? false,
    unread: conversation.unreadCount > 0,
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(role === 'customer');
    const [conversations, setConversations] = useState<ConversationItem[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [linkedOrder, setLinkedOrder] = useState<OrderResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
    const [isPriceConfirmOpen, setIsPriceConfirmOpen] = useState(false);

    const currentUser = getStoredUser();
    const currentUserCode = currentUser?.code ?? '';

    const activeConversation = useMemo(
        () => conversations.find((c) => c.id === activeConversationId) ?? null,
        [conversations, activeConversationId]
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
        setMessages(items);
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
                setMessages((prev) => {
                    if (prev.some((m) => m.id === incoming.id)) {
                        return prev;
                    }
                    return [...prev, incoming];
                });
            }

            setConversations((prev) =>
                prev.map((c) => {
                    if (c.id !== conversationId) return c;
                    const preview =
                        incoming.type === 'quotation'
                            ? 'Báo giá mới'
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
        setIsSidebarOpen(role === 'customer');
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
                    if (existing) {
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
        setMessages((prev) => [...prev, { ...sent, isRead: true }]);
        await refreshConversations();
    };

    const handleCreateQuote = async (quote: Quote) => {
        if (!activeConversationId) return;
        const scheduledAt =
            quote.scheduledAt ??
            (quote.date && quote.time
                ? new Date(`${quote.date}T${quote.time}`).toISOString()
                : new Date().toISOString());

        await chatService.createQuotation(activeConversationId, {
            serviceName: quote.serviceName,
            description: quote.description,
            price: quote.price,
            scheduledAt,
            notes: quote.notes,
        });
        await refreshConversations();
    };

    const handleAcceptQuote = async (quotationId: string) => {
        const result = await chatService.acceptQuotation(quotationId);
        if (activeConversationId) {
            await loadMessages(activeConversationId);
        }
        await loadLinkedOrder(result.orderId);
        const items = await refreshConversations();
        const active = items.find((c) => c.orderId === result.orderId);
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
    const showRepairCard = Boolean(
        linkedOrder &&
            (['new', 'assigned'].includes(orderStatus) ||
                !messages.some((m) => m.type === 'quotation'))
    );

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
        <div className={styles.container}>
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
                            {role === 'technician' && (
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
                        {isLoading && <p className={styles.emptyChat}>Đang tải hội thoại...</p>}

                        {!isLoading && loadError && (
                            <p className={styles.emptyChat}>{loadError}</p>
                        )}

                        {!isLoading && !loadError && !activeConversationId && (
                            <p className={styles.emptyChat}>Chọn hoặc bắt đầu một cuộc trò chuyện</p>
                        )}

                        {!isLoading && activeConversationId && linkedOrder && showRepairCard && (
                            <div className={styles.messageRow}>
                                <div className={styles.messageContent}>
                                    <RepairRequestCard order={linkedOrder} />
                                </div>
                            </div>
                        )}

                        {!isLoading &&
                            messages.map((message) => {
                                const isMe = message.senderId === currentUserCode;
                                const isQuotation = message.type === 'quotation' && message.quotation;

                                return (
                                    <div
                                        key={message.id}
                                        className={`${styles.messageRow} ${isMe ? styles.messageRowRight : ''}`}
                                    >
                                        {!isMe && (
                                            <Avatar src={activeContact.avatar} size={32} isOnline={false} />
                                        )}
                                        <div className={styles.messageContent}>
                                            {isQuotation ? (
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
                    </section>

                    {activeConversationId && (
                        <footer className={styles.inputArea}>
                            <MessageInput
                                role={role}
                                onSendMessage={handleSendMessage}
                                onCreateQuote={handleCreateQuote}
                                showQuoteAction={role === 'technician'}
                                showPriceAdjustAction={showPriceAdjustAction}
                                onOpenPriceAdjust={() => setIsAdjustmentOpen(true)}
                            />
                        </footer>
                    )}
                </main>
            </div>

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
