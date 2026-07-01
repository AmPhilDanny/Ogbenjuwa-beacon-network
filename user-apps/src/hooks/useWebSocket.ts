import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from 'sonner';

type WsMessage = {
  type: string;
  data: unknown;
};

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

const WS_URL = 'ws://localhost:4001/ws';
const RECONNECT_DELAY = 3000;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  const getToken = useCallback(() => {
    return sessionStorage.getItem('accessToken');
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    setStatus('connecting');

    try {
      const token = getToken();
      const url = token ? `${WS_URL}?token=${token}` : WS_URL;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) { ws.close(); return; }
        setStatus('connected');
        ws.send(JSON.stringify({ type: 'subscribe:alerts' }));
      };

      ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data);
          handleMessage(msg);
        } catch {}
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setStatus('disconnected');
        reconnectRef.current = setTimeout(() => {
          if (mountedRef.current) connect();
        }, RECONNECT_DELAY);
      };

      ws.onerror = () => {};
    } catch {}
  }, [getToken]);

  const disconnect = useCallback(() => {
    mountedRef.current = false;
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }
    wsRef.current?.close();
    wsRef.current = null;
    setStatus('disconnected');
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    const handleStorage = () => {
      const token = getToken();
      if (!token && wsRef.current) {
        wsRef.current.close();
      } else if (token && wsRef.current?.readyState !== WebSocket.OPEN) {
        connect();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      mountedRef.current = false;
      disconnect();
      window.removeEventListener('storage', handleStorage);
    };
  }, [connect, disconnect, getToken]);

  return { status, reconnect: connect };
}

function handleMessage(msg: WsMessage) {
  switch (msg.type) {
    case 'alert:new': {
      const alert = msg.data as { title?: string; severity?: string; description?: string };
      toast(
        `🚨 ${alert?.title || 'New Alert'}`,
        {
          description: `[${(alert?.severity || 'INFO').toUpperCase()}] ${alert?.description || ''}`,
          duration: 8000,
        },
      );
      break;
    }
    case 'alert:updated': {
      const updated = msg.data as { title?: string; status?: string };
      toast(`Alert Updated: ${updated?.title}`, {
        description: `Status: ${updated?.status}`,
        duration: 5000,
      });
      break;
    }
    case 'alert:resolved': {
      const resolved = msg.data as { title?: string };
      toast(`✅ Resolved: ${resolved?.title}`, { duration: 5000 });
      break;
    }
    case 'connected':
    case 'subscribed':
    case 'pong':
      break;
    default:
      break;
  }
}
