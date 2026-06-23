import type { NavigateFunction } from 'react-router-dom';
import type { ChatLocationState } from '../types/chat';
import type { UserRole } from '../types/UserRole';

export const getChatPath = (role: UserRole): string =>
  role === 'technician' ? '/technician/chat' : '/customer/chat';

export const navigateToChat = (
  navigate: NavigateFunction,
  role: UserRole,
  state: ChatLocationState
): void => {
  navigate(getChatPath(role), { state });
};
