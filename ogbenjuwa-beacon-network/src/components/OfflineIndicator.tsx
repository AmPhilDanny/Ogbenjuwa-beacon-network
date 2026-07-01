import { WifiOff, Wifi, RefreshCw, Inbox } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function OfflineIndicator() {
  const { online, queueCount, flush } = useNetworkStatus();
  const [flushing, setFlushing] = useState(false);

  const handleFlush = async () => {
    setFlushing(true);
    await flush();
    setFlushing(false);
  };

  // Queue badge (shown when online with pending items)
  if (online && queueCount > 0) {
    return (
      <div
        className={cn(
          'fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-50',
          'flex items-center gap-2 px-4 py-2 rounded-full',
          'bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200',
          'text-sm font-medium shadow-lg border border-blue-200 dark:border-blue-700',
        )}
      >
        <Inbox className="h-4 w-4" />
        <span>{queueCount} pending — syncing when online</span>
        <button
          onClick={handleFlush}
          disabled={flushing}
          className="ml-1 p-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          title="Sync now"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${flushing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    );
  }

  // Offline banner
  if (online) return null;

  return (
    <div
      className={cn(
        'fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-2 px-4 py-2 rounded-full',
        'bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200',
        'text-sm font-medium shadow-lg border border-amber-200 dark:border-amber-700',
      )}
    >
      <WifiOff className="h-4 w-4" />
      <span>Offline — {queueCount > 0 ? `${queueCount} pending` : 'showing cached data'}</span>
    </div>
  );
}
