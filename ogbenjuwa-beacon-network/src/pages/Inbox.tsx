import React, { useEffect, useMemo, useState } from 'react';
import { Megaphone, Mail, Bell, Send, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api, ApiClientError } from '@/lib/api';
import { toast } from 'sonner';
import type { Announcement, InboxMessage, InboxNotification } from '@/lib/types';

type Tab = 'broadcasts' | 'messages' | 'notifications';

const TYPE_STYLES: Record<string, string> = {
  announcement: 'bg-blue-100 text-blue-700',
  message: 'bg-purple-100 text-purple-700',
  alert: 'bg-red-100 text-red-700',
  sos: 'bg-orange-100 text-orange-700',
  system: 'bg-gray-100 text-gray-700',
};

export default function Inbox() {
  const [tab, setTab] = useState<Tab>('messages');
  const [broadcasts, setBroadcasts] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [notifications, setNotifications] = useState<InboxNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<InboxMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      api.get<{ data: Announcement[] }>('/communications/announcements/public').catch(() => ({ data: [] })),
      api.get<{ data: InboxMessage[] }>('/communications/messages?folder=inbox').catch(() => ({ data: [] })),
      api.get<{ data: InboxNotification[] }>('/communications/notifications').catch(() => ({ data: [] })),
    ])
      .then(([b, m, n]) => {
        setBroadcasts(b.data || []);
        setMessages(m.data || []);
        setNotifications(n.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const unreadMessages = useMemo(() => messages.filter(m => !m.isRead).length, [messages]);
  const unreadNotifications = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const markMessageRead = async (m: InboxMessage) => {
    if (m.isRead) return;
    try {
      await api.put(`/communications/messages/${m.id}/read`);
      setMessages(prev => prev.map(x => x.id === m.id ? { ...x, isRead: true } : x));
    } catch {
      toast.error('Failed to mark message as read');
    }
  };

  const markNotificationRead = async (n: InboxNotification) => {
    if (n.isRead) return;
    try {
      await api.put(`/communications/notifications/${n.id}/read`);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const sendReply = async () => {
    if (!replyingTo || !replyText.trim()) return;
    setSending(true);
    try {
      await api.post('/communications/messages', {
        receiverId: replyingTo.senderId,
        subject: replyingTo.subject.startsWith('Re: ') ? replyingTo.subject : `Re: ${replyingTo.subject}`,
        body: replyText.trim(),
      });
      setReplyText('');
      setReplyingTo(null);
      toast.success('Reply sent to the command centre');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Inbox</h1>
        <p className="text-muted-foreground">Broadcasts from the command centre, private messages, and your notifications.</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setTab('broadcasts')}
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full font-medium transition-colors ${tab === 'broadcasts' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-foreground hover:bg-primary/20'}`}>
          <Megaphone className="w-4 h-4" /> Broadcasts
          {broadcasts.length > 0 && <span className="text-xs opacity-70">({broadcasts.length})</span>}
        </button>
        <button onClick={() => setTab('messages')}
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full font-medium transition-colors ${tab === 'messages' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-foreground hover:bg-primary/20'}`}>
          <Mail className="w-4 h-4" /> Messages
          {unreadMessages > 0 && <span className="flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">{unreadMessages}</span>}
        </button>
        <button onClick={() => setTab('notifications')}
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full font-medium transition-colors ${tab === 'notifications' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-foreground hover:bg-primary/20'}`}>
          <Bell className="w-4 h-4" /> Notifications
          {unreadNotifications > 0 && <span className="flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">{unreadNotifications}</span>}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-10 text-center">Loading inbox...</p>
      ) : tab === 'broadcasts' ? (
        <BroadcastList items={broadcasts} />
      ) : tab === 'messages' ? (
        <div className="space-y-4">
          <MessagesList
            items={messages}
            onOpen={markMessageRead}
            onReply={setReplyingTo}
          />
          {replyingTo && (
            <Card className="border-primary/40">
              <CardContent className="space-y-3 pt-6">
                <div>
                  <p className="text-sm font-semibold">Reply to {replyingTo.senderName || 'Command Centre'}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">Re: {replyingTo.subject} — {replyingTo.body}</p>
                </div>
                <Textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="min-h-[90px]"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setReplyingTo(null); setReplyText(''); }}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={sendReply} disabled={sending || !replyText.trim()}>
                    <Send className="w-4 h-4 mr-2" /> {sending ? 'Sending...' : 'Send Reply'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <NotificationList items={notifications} onOpen={markNotificationRead} />
      )}
    </div>
  );
}

function BroadcastList({ items }: { items: Announcement[] }) {
  if (items.length === 0) {
    return <EmptyState icon={<Megaphone className="w-10 h-10 text-muted-foreground/40" />} message="No broadcasts yet" />;
  }
  return (
    <div className="space-y-3">
      {items.map(a => (
        <Card key={a.id}>
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-1">
              <Megaphone className="w-4 h-4 text-blue-600 shrink-0" />
              <h3 className="font-semibold">{a.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{a.body}</p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              {a.creatorName ? `From ${a.creatorName} • ` : ''}
              {new Date(a.createdAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MessagesList({
  items,
  onOpen,
  onReply,
}: {
  items: InboxMessage[];
  onOpen: (m: InboxMessage) => void;
  onReply: (m: InboxMessage) => void;
}) {
  if (items.length === 0) {
    return <EmptyState icon={<Mail className="w-10 h-10 text-muted-foreground/40" />} message="No private messages yet" />;
  }
  return (
    <div className="space-y-3">
      {items.map(m => (
        <Card key={m.id} className={m.isRead ? '' : 'border-primary/50'}>
          <CardContent className="py-4" onClick={() => onOpen(m)}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`truncate ${m.isRead ? 'font-medium' : 'font-semibold'}`}>{m.subject}</h3>
                  {!m.isRead && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700 shrink-0">New</span>}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-line">{m.body}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  From {m.senderName || 'Command Centre'}
                  {m.senderRole ? ` (${m.senderRole.replace(/_/g, ' ')})` : ''}
                  {' • '}{new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                {!m.isRead && (
                  <button onClick={e => { e.stopPropagation(); onOpen(m); }} className="p-1.5 rounded hover:bg-muted" title="Mark as read">
                    <Check className="w-4 h-4 text-primary" />
                  </button>
                )}
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={e => { e.stopPropagation(); onReply(m); }}>
                  <Send className="w-3 h-3 mr-1.5" /> Reply
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function NotificationList({ items, onOpen }: { items: InboxNotification[]; onOpen: (n: InboxNotification) => void }) {
  if (items.length === 0) {
    return <EmptyState icon={<Bell className="w-10 h-10 text-muted-foreground/40" />} message="No notifications yet" />;
  }
  return (
    <div className="space-y-3">
      {items.map(n => (
        <Card key={n.id} className={n.isRead ? '' : 'border-primary/50'}>
          <CardContent className="py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase shrink-0 mt-0.5 ${TYPE_STYLES[n.type] || 'bg-gray-100 text-gray-700'}`}>
                  {n.type}
                </span>
                <div className="min-w-0">
                  <p className={`text-sm ${n.isRead ? 'font-medium' : 'font-semibold'}`}>{n.title}</p>
                  {n.body && <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-line">{n.body}</p>}
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {!n.isRead && (
                <button onClick={() => onOpen(n)} className="p-1.5 rounded hover:bg-muted shrink-0" title="Mark as read">
                  <Check className="w-4 h-4 text-primary" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center py-12 text-center">
        {icon}
        <p className="text-sm text-muted-foreground mt-3">{message}</p>
      </CardContent>
    </Card>
  );
}
