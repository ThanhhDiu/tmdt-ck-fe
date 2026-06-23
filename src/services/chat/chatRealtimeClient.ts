import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import { loadTokenFromStorage } from '../../utils/token';
import type { ChatMessage } from '../../types/chat';

const resolveBrokerUrl = (): string => {
  const fromEnv = import.meta.env.VITE_WS_URL?.toString();
  if (fromEnv) {
    return fromEnv;
  }
  const { protocol, hostname } = window.location;
  const wsProtocol = protocol === 'https:' ? 'wss' : 'ws';
  const port = hostname === 'localhost' ? ':8080' : '';
  return `${wsProtocol}://${hostname}${port}/ws-stomp`;
};

export type MessageNewWsPayload = {
  event: string;
  conversationId: string;
  message: {
    id: string;
    conversationId?: string;
    senderId: string;
    type: string;
    content?: string | null;
    quotation?: ChatMessage['quotation'];
    sentAt: string;
    isRead?: boolean;
  };
};

type MessageHandler = (payload: MessageNewWsPayload) => void;

const parseBody = (body: string): MessageNewWsPayload | null => {
  try {
    return JSON.parse(body) as MessageNewWsPayload;
  } catch {
    return null;
  }
};

class ChatRealtimeClient {
  private client: Client | null = null;
  private subscriptions = new Map<string, StompSubscription>();
  private trackedConversationIds = new Set<string>();
  private handlers = new Set<MessageHandler>();

  activate(): void {
    const token = loadTokenFromStorage();
    if (!token) return;

    if (this.client?.active) return;

    this.client = new Client({
      brokerURL: resolveBrokerUrl(),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.subscriptions.clear();
        this.trackedConversationIds.forEach((id) => this.attachSubscription(id));
      },
      onStompError: (frame) => {
        console.warn('[Chat WS] STOMP error', frame.headers['message'] ?? frame);
      },
      onWebSocketError: () => {
        console.warn('[Chat WS] WebSocket error');
      },
    });

    this.client.activate();
  }

  deactivate(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
    this.trackedConversationIds.clear();
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  private attachSubscription(conversationId: string): void {
    if (!this.client?.connected || this.subscriptions.has(conversationId)) {
      return;
    }

    const destination = `/topic/conversations.${conversationId}`;
    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      const payload = parseBody(message.body);
      if (!payload || payload.event !== 'message:new' || !payload.message) {
        return;
      }
      const normalized: MessageNewWsPayload = {
        ...payload,
        conversationId: payload.conversationId || conversationId,
      };
      this.handlers.forEach((handler) => handler(normalized));
    });

    this.subscriptions.set(conversationId, subscription);
  }

  subscribeConversation(conversationId: string): void {
    if (!conversationId) return;
    this.trackedConversationIds.add(conversationId);
    this.activate();
    if (this.client?.connected) {
      this.attachSubscription(conversationId);
    }
  }

  unsubscribeConversation(conversationId: string): void {
    this.trackedConversationIds.delete(conversationId);
    const sub = this.subscriptions.get(conversationId);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(conversationId);
    }
  }

  syncSubscriptions(conversationIds: string[]): void {
    const next = new Set(conversationIds.filter(Boolean));
    [...this.trackedConversationIds].forEach((id) => {
      if (!next.has(id)) {
        this.unsubscribeConversation(id);
      }
    });
    next.forEach((id) => this.subscribeConversation(id));
  }
}

export const chatRealtimeClient = new ChatRealtimeClient();

export const mapWsMessageToChatMessage = (
  payload: MessageNewWsPayload
): ChatMessage => {
  const msg = payload.message;
  return {
    id: msg.id,
    conversationId: msg.conversationId ?? payload.conversationId,
    senderId: msg.senderId,
    type: (msg.type?.toLowerCase() ?? 'text') as ChatMessage['type'],
    content: msg.content,
    quotation: msg.quotation ?? null,
    sentAt:
      typeof msg.sentAt === 'string'
        ? msg.sentAt
        : new Date().toISOString(),
    isRead: msg.isRead ?? false,
  };
};
