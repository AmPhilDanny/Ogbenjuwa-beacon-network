import { useState, useEffect, useCallback } from 'react';
import { getQueueCount, processQueue, enqueueAction } from '../lib/offline-queue';

interface NetworkStatus {
  online: boolean;
  queueCount: number;
  lastOnlineAt: number | null;
  enqueue: (action: { type: string; endpoint: string; method: 'POST' | 'PUT' | 'DELETE'; body: unknown }) => Promise<void>;
  flush: () => Promise<{ success: number; failed: number }>;
}

export function useNetworkStatus(): NetworkStatus {
  const [online, setOnline] = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(0);
  const [lastOnlineAt, setLastOnlineAt] = useState<number | null>(navigator.onLine ? Date.now() : null);

  const refreshCount = useCallback(async () => {
    const count = await getQueueCount();
    setQueueCount(count);
  }, []);

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      setLastOnlineAt(Date.now());
      processQueue().then(() => refreshCount());
    };
    const goOffline = () => setOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    refreshCount();

    const interval = setInterval(refreshCount, 30000);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      clearInterval(interval);
    };
  }, [refreshCount]);

  const enqueue = useCallback(async (action: Parameters<typeof enqueueAction>[0]) => {
    await enqueueAction(action);
    await refreshCount();
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await (reg as any).sync.register('ogbenjuwa-sync');
      } catch {}
    }
  }, [refreshCount]);

  const flush = useCallback(async () => {
    const result = await processQueue();
    await refreshCount();
    return result;
  }, [refreshCount]);

  return { online, queueCount, lastOnlineAt, enqueue, flush };
}
