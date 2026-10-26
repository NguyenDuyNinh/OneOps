import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './gateways/chat.gateway';
import { PrismaService } from '../../core/prisma.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, PrismaService],
  exports: [ChatService],
})
export class ChatModule {}
