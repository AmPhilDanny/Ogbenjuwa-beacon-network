import React, { useEffect, useState } from 'react';
import { User, Shield, Bell, Lock, LogOut, ChevronRight, Mail, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface InboxMessage {
  id: string;
  senderName?: string | null;
  senderRole?: string | null;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

interface InboxNotification {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function Profile() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(session?.name || '');
  const [phone, setPhone] = useState('');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [notifications, setNotifications] = useState<InboxNotification[]>([]);
  const [inboxTab, setInboxTab] = useState<'messages' | 'notifications'>('messages');

  const fetchInbox = () => {
    api.get<{ data: InboxMessage[] }>('/communications/messages?folder=inbox')
      .then(res => setMessages(res.data))
      .catch(() => {});
    api.get<{ data: InboxNotification[] }>('/communications/notifications')
      .then(res => setNotifications(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    api.get<{ id: string; name: string; phone: string; email: string; role: string; lgaId: string }>('/auth/me')
      .then(user => {
        setName(user.name);
        setPhone(user.phone || '');
      })
      .catch(() => {});
    api.get<{ pushAlerts: boolean; smsAlerts: boolean }>('/notification-preferences')
      .then(prefs => {
        setPushEnabled(prefs.pushAlerts ?? true);
        setSmsEnabled(prefs.smsAlerts ?? true);
      })
      .catch(() => {});
    fetchInbox();
  }, []);

  const markMessageRead = async (id: string) => {
    try {
      await api.put(`/communications/messages/${id}/read`);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
    } catch {
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.put(`/communications/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
    }
  };

  const handleSave = async () => {
    try {
      await api.put('/auth/me', { name });
      await api.put('/notification-preferences', { pushAlerts: pushEnabled, smsAlerts: smsEnabled });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your account and notification preferences.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {(session?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{session?.name || 'User'}</p>
              <p className="text-sm text-muted-foreground capitalize">{session?.role || 'member'}</p>
              <p className="text-sm text-muted-foreground">{session?.lga || ''}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 ..." />
          </div>
          <Button onClick={handleSave} className="w-full">Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">Receive browser notifications</p>
            </div>
            <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">SMS Alerts</p>
              <p className="text-sm text-muted-foreground">Receive emergency SMS alerts</p>
            </div>
            <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Inbox
            <span className="text-xs font-normal text-muted-foreground">
              {messages.filter(m => !m.isRead).length + notifications.filter(n => !n.isRead).length > 0
                ? `(${messages.filter(m => !m.isRead).length + notifications.filter(n => !n.isRead).length} unread)`
                : ''}
            </span>
          </CardTitle>
          <div className="flex gap-1">
            <button onClick={() => setInboxTab('messages')}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${inboxTab === 'messages' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
              Messages
            </button>
            <button onClick={() => setInboxTab('notifications')}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${inboxTab === 'notifications' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
              Notifications
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 max-h-80 overflow-y-auto">
          {inboxTab === 'messages' && (
            messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No private messages yet</p>
            ) : (
              messages.map(m => (
                <div key={m.id} className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className={`text-sm ${m.isRead ? 'font-medium' : 'font-semibold'}`}>{m.subject}</p>
                    {m.senderName && <p className="text-xs text-muted-foreground">{m.senderName}</p>}
                    <p className="text-sm text-muted-foreground line-clamp-2">{m.body}</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">{new Date(m.createdAt).toLocaleString()}</p>
                  </div>
                  {!m.isRead && (
                    <button onClick={() => markMessageRead(m.id)} className="p-1.5 rounded hover:bg-muted shrink-0" title="Mark as read">
                      <Check className="w-4 h-4 text-primary" />
                    </button>
                  )}
                </div>
              ))
            )
          )}
          {inboxTab === 'notifications' && (
            notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No notifications yet</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className={`text-sm ${n.isRead ? 'font-medium' : 'font-semibold'}`}>{n.title}</p>
                    {n.body && <p className="text-sm text-muted-foreground line-clamp-2">{n.body}</p>}
                    <p className="text-xs text-muted-foreground/60 mt-0.5 capitalize">{n.type} • {new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  {!n.isRead && (
                    <button onClick={() => markNotificationRead(n.id)} className="p-1.5 rounded hover:bg-muted shrink-0" title="Mark as read">
                      <Check className="w-4 h-4 text-primary" />
                    </button>
                  )}
                </div>
              ))
            )
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <LogOut className="h-5 w-5" />
            Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="w-full" onClick={() => { logout(); navigate('/login'); }}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
