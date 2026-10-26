import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import type { AttendanceCheckedInEvent } from './attendance.types';

@WebSocketGateway({ cors: { origin: '*' } })
export class AttendanceGateway {
  @WebSocketServer()
  server: Server;

  @OnEvent('attendance.checked_in')
  handleAttendanceCheckedIn(payload: AttendanceCheckedInEvent) {
    this.server.to('headcount').emit('headcount:updated', payload);
  }
}
