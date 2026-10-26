import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket && typeof window !== 'undefined') {
    socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000', {
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return socket!;
};
