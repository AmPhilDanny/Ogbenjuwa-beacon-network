import { useEffect, useRef } from 'react';

export interface SMSItem {
  name: string;
  initials: string;
  phone: string;
  village: string;
  message: string;
  delivered: boolean;
}

interface SMSFeedProps {
  items: SMSItem[];
}

export function SMSFeed({ items }: SMSFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new items appear
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [items.length]);

  return (
    <div className="sms-feed">
      {items.length === 0 && (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-12">
          No alerts sent yet. Tap the SOS button to begin.
        </div>
      )}

      {items.map((item, i) => (
        <div key={i} className="sms-item">
          <div className="sms-avatar">{item.initials}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="sms-name">{item.name}</span>
              <span className="sms-phone">{item.phone}</span>
            </div>
            <div className="sms-text">{item.message}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{item.village}</div>
          </div>
          <span className="sms-tick">{item.delivered ? '✓✓' : '✓'}</span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
