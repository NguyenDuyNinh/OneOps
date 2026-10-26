import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatService } from '../chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('chat:send')
  async handleSendMessage(@MessageBody() payload: { roomId: string; senderId: string; content: string }) {
    const message = await this.chatService.sendMessage(payload.roomId, payload.senderId, payload.content);
    this.server.to(`chat:${payload.roomId}`).emit('chat:new_message', message);
    return message;
  }
}
