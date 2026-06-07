import apiClient from '../../api/config';
import type {
  ChatMessage,
  ConversationItem,
  CreateConversationPayload,
  CreateQuotationPayload,
  EmbeddedQuotation,
} from '../../types/chat';

type PagedData<T> = {
  items: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const unwrap = <T,>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'success' in payload && (payload as { success?: boolean }).success && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export const chatService = {
  listConversations: async (page = 1, limit = 30): Promise<ConversationItem[]> => {
    const response = await apiClient.get('/api/conversations', { params: { page, limit } });
    if (!response.data || (response.data as { success?: boolean }).success === false) {
      throw new Error('Không thể tải danh sách hội thoại');
    }
    const data = unwrap<PagedData<ConversationItem>>(response.data);
    return (data.items ?? []).filter((item) => Boolean(item.id));
  },

  createConversation: async (payload: CreateConversationPayload): Promise<ConversationItem> => {
    const response = await apiClient.post('/api/conversations', payload);
    if (!response.data || (response.data as { success?: boolean }).success === false) {
      throw new Error('Không thể tạo cuộc trò chuyện');
    }
    const created = unwrap<{
      id: string;
      orderId?: string | null;
      partner?: ConversationItem['partner'] | null;
    }>(response.data);
    if (!created.id) {
      throw new Error('Phản hồi tạo hội thoại không hợp lệ');
    }
    return {
      id: created.id,
      orderId: created.orderId ?? undefined,
      partner: created.partner ?? {
        id: payload.technicianId,
        fullName: 'Thợ',
      },
      unreadCount: 0,
    };
  },

  listMessages: async (conversationId: string, page = 1, limit = 50): Promise<ChatMessage[]> => {
    const response = await apiClient.get(`/api/conversations/${conversationId}/messages`, {
      params: { page, limit },
    });
    const data = unwrap<PagedData<ChatMessage>>(response.data);
    const items = data.items ?? [];
    return [...items].reverse();
  },

  sendMessage: async (conversationId: string, content: string): Promise<ChatMessage> => {
    const response = await apiClient.post(`/api/conversations/${conversationId}/messages`, {
      type: 'text',
      content,
    });
    return unwrap<ChatMessage>(response.data);
  },

  createQuotation: async (
    conversationId: string,
    payload: CreateQuotationPayload
  ): Promise<EmbeddedQuotation & { id: string }> => {
    const response = await apiClient.post(`/api/conversations/${conversationId}/quotes`, payload);
    const quote = unwrap<{
      id: string;
      serviceName: string;
      description?: string;
      price: number;
      scheduledAt?: string;
      status: string;
    }>(response.data);
    return quote;
  },

  acceptQuotation: async (quotationId: string): Promise<{ orderId: string }> => {
    const response = await apiClient.patch(`/api/quotes/${quotationId}/accept`);
    const data = unwrap<{ orderId: string }>(response.data);
    return { orderId: data.orderId };
  },

  rejectQuotation: async (quotationId: string): Promise<void> => {
    await apiClient.patch(`/api/quotes/${quotationId}/reject`);
  },
};
