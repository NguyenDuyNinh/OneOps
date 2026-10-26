import { Controller, Get, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../platform/guards/jwt-auth.guard';
import { CurrentUser } from '../platform/decorators/current-user.decorator';
import type { JwtPayload } from '../platform/types/identity.types';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  async getRooms(@CurrentUser() user: JwtPayload) {
    return this.chatService.getRooms(user.sub);
  }
}
