import { apiClient } from '@/shared/lib/api-client';
import { ChatRoom } from '@oneops/shared-types';

export const chatApi = {
  getRooms: (): Promise<ChatRoom[]> => apiClient.get('/chat/rooms'),
};
