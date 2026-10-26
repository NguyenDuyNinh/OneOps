// [Dev 3] — Module Chat Nội Bộ
// Chủ sở hữu: Dev 3 | Không sửa nếu không phải Dev 3

export enum ChatRoomType {
  DIRECT = 'DIRECT',    // Chat 1-1
  GROUP = 'GROUP',      // Chat nhóm
}

export interface ChatRoom {
  id: string;
  name?: string;        // Chỉ có với GROUP
  type: ChatRoomType;
  members: ChatMember[];
  lastMessage?: Message;
  createdAt: Date;
}

export interface ChatMember {
  userId: string;
  name: string;
  avatarUrl?: string;
  joinedAt: Date;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  attachments?: MessageAttachment[];
  linkPreviews?: LinkPreview[];
  isRead: boolean;
  createdAt: Date;
}

export interface MessageAttachment {
  name: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  sourceType?: 'figma' | 'github' | 'drive' | 'generic';
}

// DTOs
export interface CreateRoomDto {
  type: ChatRoomType;
  name?: string;
  memberIds: string[];
}

export interface SendMessageDto {
  content: string;
  attachmentUrls?: string[];
}
