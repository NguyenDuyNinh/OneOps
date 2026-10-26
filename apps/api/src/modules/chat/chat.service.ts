import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getRooms(userId: string) {
    return this.prisma.chatRoom.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async sendMessage(roomId: string, senderId: string, content: string) {
    return this.prisma.message.create({
      data: {
        roomId,
        senderId,
        content,
      },
    });
  }
}
