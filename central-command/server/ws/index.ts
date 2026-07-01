import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

interface ClientInfo {
  ws: WebSocket;
  userId?: string;
  role?: string;
  lgaId?: string;
}

const clients = new Map<WebSocket, ClientInfo>();

export function setupWebSocket(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const info: ClientInfo = { ws };
    clients.set(ws, info);

    const urlParams = new URL(req.url || '/', `http://${req.headers.host}`).searchParams;
    const token = urlParams.get('token');

    if (token) {
      try {
        const payload = jwt.verify(token, env.JWT_SECRET) as { id: string; role: string; lgaId?: string };
        info.userId = payload.id;
        info.role = payload.role;
        info.lgaId = payload.lgaId;
      } catch {
        // Unauthenticated connection allowed for public alerts
      }
    }

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        handleMessage(ws, info, msg);
      } catch {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.send(JSON.stringify({ type: 'connected', userId: info.userId }));
  });
}

function handleMessage(ws: WebSocket, _info: ClientInfo, msg: { type: string; payload?: unknown }): void {
  switch (msg.type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      break;
    case 'subscribe:alerts':
      ws.send(JSON.stringify({ type: 'subscribed', channel: 'alerts' }));
      break;
    case 'subscribe:incidents':
      ws.send(JSON.stringify({ type: 'subscribed', channel: 'incidents' }));
      break;
    default:
      ws.send(JSON.stringify({ type: 'error', message: `Unknown message type: ${msg.type}` }));
  }
}

export function broadcast(event: string, data: unknown, filter?: { lgaId?: string; role?: string }): void {
  const message = JSON.stringify({ type: event, data });

  for (const [, info] of clients) {
    if (info.ws.readyState !== WebSocket.OPEN) continue;
    if (filter?.lgaId && info.lgaId !== filter.lgaId) continue;
    if (filter?.role && info.role !== filter.role) continue;

    info.ws.send(message);
  }
}

export function sendToUser(userId: string, event: string, data: unknown): void {
  const message = JSON.stringify({ type: event, data });

  for (const [, info] of clients) {
    if (info.ws.readyState === WebSocket.OPEN && info.userId === userId) {
      info.ws.send(message);
      break;
    }
  }
}
