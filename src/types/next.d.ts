import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Socket as NetSocket } from 'net';

export interface SocketServer extends HTTPServer {
  io?: SocketIOServer | null;
}

export interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

export interface NextApiResponseServerIo extends NextApiResponse {
  socket: SocketWithIO;
} 