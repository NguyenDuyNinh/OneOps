import { Controller, Get, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { JwtPayload } from '@oneops/shared-types';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  async getRooms(@CurrentUser() user: JwtPayload) {
    return this.chatService.getRooms(user.sub);
  }
}
