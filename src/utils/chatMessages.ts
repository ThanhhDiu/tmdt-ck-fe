import type { ChatMessage } from '../types/chat';
import { resolveMediaUrl } from './mediaUrl';

const normalizeText = (value?: string | null): string => (value ?? '').trim();

export const resolveMessageImageUrl = (message: ChatMessage): string | null => {
  if (message.type !== 'image') return null;

  if (message.imageUrl) return resolveMediaUrl(message.imageUrl);
  if (message.mediaUrl) return resolveMediaUrl(message.mediaUrl);
  if (message.content) return resolveMediaUrl(message.content);

  const firstAttachment = message.attachments?.[0];
  if (typeof firstAttachment === 'string') return resolveMediaUrl(firstAttachment);
  if (firstAttachment?.url) return resolveMediaUrl(firstAttachment.url);
  if (firstAttachment?.mediaUrl) return resolveMediaUrl(firstAttachment.mediaUrl);
  if (firstAttachment?.imageUrl) return resolveMediaUrl(firstAttachment.imageUrl);

  return null;
};

const messageFingerprint = (message: ChatMessage): string => {
  const imageUrl = resolveMessageImageUrl(message);
  const quotationId = message.quotation?.id ?? '';
  return [
    message.conversationId,
    message.senderId,
    message.type,
    normalizeText(imageUrl ?? message.content),
    quotationId,
  ].join('|');
};

const areNearDuplicates = (a: ChatMessage, b: ChatMessage): boolean => {
  if (messageFingerprint(a) !== messageFingerprint(b)) return false;

  const timeA = new Date(a.sentAt).getTime();
  const timeB = new Date(b.sentAt).getTime();
  if (Number.isNaN(timeA) || Number.isNaN(timeB)) return true;

  return Math.abs(timeA - timeB) <= 5000;
};

export const mergeUniqueMessages = (
  previous: ChatMessage[],
  incoming: ChatMessage | ChatMessage[]
): ChatMessage[] => {
  const next = [...previous];
  const incomingList = Array.isArray(incoming) ? incoming : [incoming];

  incomingList.forEach((message) => {
    const index = next.findIndex((item) => item.id === message.id || areNearDuplicates(item, message));
    if (index >= 0) {
      next[index] = { ...next[index], ...message };
      return;
    }
    next.push(message);
  });

  return next.sort((a, b) => {
    const timeA = new Date(a.sentAt).getTime();
    const timeB = new Date(b.sentAt).getTime();
    if (Number.isNaN(timeA) || Number.isNaN(timeB)) return 0;
    return timeA - timeB;
  });
};
