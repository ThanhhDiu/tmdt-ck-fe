export type ChatMessageType = 'text' | 'image' | 'quotation' | 'system';

export type EmbeddedQuotation = {
  id: string;
  serviceName: string;
  description?: string;
  price: number;
  scheduledAt?: string;
  status: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  type: ChatMessageType;
  content?: string | null;
  quotation?: EmbeddedQuotation | null;
  sentAt: string;
  isRead?: boolean;
};

export type ChatPartner = {
  id: string;
  fullName: string;
  avatar?: string | null;
  isOnline?: boolean;
};

export type ConversationItem = {
  id: string;
  orderId?: string | null;
  partner: ChatPartner;
  lastMessage?: {
    type?: string;
    content?: string;
    preview?: string;
    sentAt?: string;
  } | null;
  unreadCount: number;
  updatedAt?: string;
};

export type CreateConversationPayload = {
  technicianId: string;
  orderId?: string;
};

export type CreateQuotationPayload = {
  serviceName: string;
  description?: string;
  price: number;
  scheduledAt: string;
  notes?: string;
};

export type ChatLocationState = {
  conversationId?: string;
  technicianId?: string;
  customerId?: string;
  orderId?: string;
};
