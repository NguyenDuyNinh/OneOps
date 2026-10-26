import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({ cors: { origin: '*' } })
export class TasksGateway {
  @WebSocketServer()
  server: Server;

  @OnEvent('task.status_changed')
  handleTaskStatusChanged(payload: any) {
    this.server.emit('task:status_changed', payload);
  }
}
