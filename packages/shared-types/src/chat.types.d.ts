export declare enum ChatRoomType {
    DIRECT = "DIRECT",
    GROUP = "GROUP"
}
export interface ChatRoom {
    id: string;
    name?: string;
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
export interface CreateRoomDto {
    type: ChatRoomType;
    name?: string;
    memberIds: string[];
}
export interface SendMessageDto {
    content: string;
    attachmentUrls?: string[];
}
