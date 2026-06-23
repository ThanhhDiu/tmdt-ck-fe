import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import { loadTokenFromStorage } from '../../utils/token';

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

export type OrderStatusChangedPayload = {
  orderId: string;
  oldStatus?: string;
  newStatus?: string;
  updatedAt?: string;
};

type OrderEventHandler = (payload: OrderStatusChangedPayload) => void;

const parseBody = (body: string): OrderStatusChangedPayload | null => {
  try {
    return JSON.parse(body) as OrderStatusChangedPayload;
  } catch {
    return null;
  }
};

/**
 * Singleton STOMP client that subscribes to per-order topics
 * (`/topic/orders.{code}`) and fans status-change events out to listeners.
 * Mirrors {@link chatRealtimeClient} so both share the same broker conventions.
 */
class OrderRealtimeClient {
  private client: Client | null = null;
  private subscriptions = new Map<string, StompSubscription>();
  private trackedOrderIds = new Set<string>();
  private handlers = new Set<OrderEventHandler>();

  activate(): void {
    const token = loadTokenFromStorage();
    if (!token) return;
    if (this.client?.active) return;

    this.client = new Client({
      brokerURL: resolveBrokerUrl(),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.subscriptions.clear();
        this.trackedOrderIds.forEach((id) => this.attachSubscription(id));
      },
      onStompError: (frame) => {
        console.warn('[Order WS] STOMP error', frame.headers['message'] ?? frame);
      },
      onWebSocketError: () => {
        console.warn('[Order WS] WebSocket error');
      },
    });

    this.client.activate();
  }

  deactivate(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
    this.trackedOrderIds.clear();
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  onEvent(handler: OrderEventHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  private attachSubscription(orderId: string): void {
    if (!this.client?.connected || this.subscriptions.has(orderId)) {
      return;
    }

    const destination = `/topic/orders.${orderId}`;
    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      const payload = parseBody(message.body);
      if (!payload) return;
      const normalized: OrderStatusChangedPayload = {
        ...payload,
        orderId: payload.orderId || orderId,
      };
      this.handlers.forEach((handler) => handler(normalized));
    });

    this.subscriptions.set(orderId, subscription);
  }

  private subscribeOrder(orderId: string): void {
    if (!orderId) return;
    this.trackedOrderIds.add(orderId);
    this.activate();
    if (this.client?.connected) {
      this.attachSubscription(orderId);
    }
  }

  private unsubscribeOrder(orderId: string): void {
    this.trackedOrderIds.delete(orderId);
    const sub = this.subscriptions.get(orderId);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(orderId);
    }
  }

  syncSubscriptions(orderIds: string[]): void {
    const next = new Set(orderIds.filter(Boolean));
    [...this.trackedOrderIds].forEach((id) => {
      if (!next.has(id)) {
        this.unsubscribeOrder(id);
      }
    });
    next.forEach((id) => this.subscribeOrder(id));
  }
}

export const orderRealtimeClient = new OrderRealtimeClient();
