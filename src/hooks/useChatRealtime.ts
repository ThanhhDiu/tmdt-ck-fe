import { useEffect, useRef } from 'react';
import {
  chatRealtimeClient,
  type MessageNewWsPayload,
} from '../services/chat/chatRealtimeClient';

type UseChatRealtimeOptions = {
  conversationIds: string[];
  enabled?: boolean;
  onMessage: (payload: MessageNewWsPayload) => void;
};

export const useChatRealtime = ({
  conversationIds,
  enabled = true,
  onMessage,
}: UseChatRealtimeOptions): void => {
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    if (!enabled) return undefined;

    chatRealtimeClient.activate();
    const unsubscribeHandler = chatRealtimeClient.onMessage((payload) => {
      handlerRef.current(payload);
    });

    return () => {
      unsubscribeHandler();
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    chatRealtimeClient.syncSubscriptions(conversationIds);

    return () => {
      conversationIds.forEach((id) => chatRealtimeClient.unsubscribeConversation(id));
    };
  }, [conversationIds, enabled]);

  useEffect(
    () => () => {
      chatRealtimeClient.deactivate();
    },
    []
  );
};
