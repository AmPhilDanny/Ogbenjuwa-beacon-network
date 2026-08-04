import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { api, ApiClientError } from '../../lib/api';
import type { Announcement, MessageItem, NotificationItem, User } from '../../lib/types';
import {
  Send, Plus, Eye, EyeOff, Trash2, Check, Bell, X, Megaphone, Mail, Search,
} from 'lucide-react';

const inputCls =
  'w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring';

type Tab = 'broadcast' | 'messages' | 'log';

const TYPE_STYLES: Record<string, string> = {
  announcement: 'bg-blue-100 text-blue-700',
  message: 'bg-purple-100 text-purple-700',
  alert: 'bg-red-100 text-red-700',
  sos: 'bg-orange-100 text-orange-700',
  system: 'bg-gray-100 text-gray-700',
};

export default function Communications() {
  const [tab, setTab] = useState<Tab>('broadcast');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold">Communications</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Broadcast to the network, send private messages, and track all communication</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        <button onClick={() => setTab('broadcast')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors shrink-0 ${
            tab === 'broadcast' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}>
          <Megaphone className="w-4 h-4" /> Broadcast
        </button>
        <button onClick={() => setTab('messages')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors shrink-0 ${
            tab === 'messages' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}>
          <Mail className="w-4 h-4" /> Private Messages
        </button>
        <button onClick={() => setTab('log')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors shrink-0 ${
            tab === 'log' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}>
          <Bell className="w-4 h-4" /> Notification Log
        </button>
      </div>

      {tab === 'broadcast' && <BroadcastTab />}
      {tab === 'messages' && <MessagesTab />}
      {tab === 'log' && <NotificationLogTab />}
    </div>
  );
}

// ─── Broadcast Tab ─────────────────────────────────────────────────────────

function BroadcastTab() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', body: '', isPublished: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Announcement[] }>('/communications/announcements?limit=50');
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Failed to fetch announcements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (editId) {
        await api.put(`/communications/announcements/${editId}`, form);
      } else {
        await api.post('/communications/announcements', form);
      }
      setForm({ title: '', body: '', isPublished: false });
      setShowCreate(false);
      setEditId(null);
      fetchAnnouncements();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (a: Announcement) => {
    if (a.isPublished) {
      if (!confirm(`Unpublish "${a.title}"? Users who already received it will keep their copy.`)) return;
    } else if (!confirm(`Publish "${a.title}"? This will broadcast it to everyone across the network in real time.`)) {
      return;
    }
    try {
      await api.put(`/communications/announcements/${a.id}`, { isPublished: !a.isPublished });
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to toggle publish', err);
    }
  };

  const handleDelete = async (a: Announcement) => {
    if (!confirm(`Delete "${a.title}"? This also removes the notifications sent to users.`)) return;
    try {
      await api.delete(`/communications/announcements/${a.id}`);
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to delete announcement', err);
    }
  };

  const startEdit = (a: Announcement) => {
    setEditId(a.id);
    setForm({ title: a.title, body: a.body, isPublished: a.isPublished });
    setShowCreate(false);
  };

  return (
    <div className="space-y-4">
      {!showCreate && !editId && (
        <Button onClick={() => { setShowCreate(true); setForm({ title: '', body: '', isPublished: false }); }}>
          <Plus className="w-4 h-4 mr-2" /> New Broadcast
        </Button>
      )}

      {(showCreate || editId) && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              {editId ? 'Edit Broadcast' : 'New Broadcast'}
            </CardTitle>
            <button onClick={() => { setShowCreate(false); setEditId(null); setForm({ title: '', body: '', isPublished: false }); }} className="p-1 rounded hover:bg-muted">
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Title</label>
                <input className={inputCls} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Security meeting tonight" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Message</label>
                <textarea className={`${inputCls} min-h-[120px]`} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="Write the message everyone will receive..." />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))} className="rounded border-input" />
                Publish immediately — broadcast to everyone in real time
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={() => { setShowCreate(false); setEditId(null); setForm({ title: '', body: '', isPublished: false }); }}>Cancel</Button>
                <Button type="submit" disabled={saving || !form.title.trim() || !form.body.trim()}>
                  <Send className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : editId ? 'Update' : form.isPublished ? 'Broadcast' : 'Save Draft'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading broadcasts...</p>
      ) : announcements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Megaphone className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No broadcasts yet</p>
          </CardContent>
        </Card>
      ) : (
        announcements.map(a => (
          <Card key={a.id}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-medium truncate">{a.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      a.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {a.isPublished ? 'Published' : 'Draft'}
                    </span>
                    {a.isPublished && a.recipientCount != null && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                        {a.recipientCount} recipient{a.recipientCount === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{a.body}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {a.creatorName ? `By ${a.creatorName} • ` : ''}
                    {new Date(a.createdAt).toLocaleDateString()} {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleTogglePublish(a)} className="p-1.5 rounded hover:bg-muted" title={a.isPublished ? 'Unpublish' : 'Broadcast now'}>
                    {a.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => startEdit(a)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Edit">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(a)} className="p-1.5 rounded hover:bg-muted text-red-500" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

// ─── Messages Tab ──────────────────────────────────────────────────────────

function MessagesTab() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({ receiverId: '', subject: '', body: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Recipient search
  const [search, setSearch] = useState('');
  const [userResults, setUserResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: MessageItem[] }>('/communications/messages?folder=all');
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const searchUsers = async (query: string) => {
    setSearch(query);
    if (!query.trim()) { setUserResults([]); return; }
    setSearching(true);
    try {
      const res = await api.get<{ data: User[] }>(`/users?search=${encodeURIComponent(query)}&limit=10`);
      setUserResults(res.data.filter(u => u.isActive));
    } catch {
      setUserResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.receiverId || !form.subject.trim() || !form.body.trim()) return;
    setSaving(true);
    setError('');
    try {
      await api.post('/communications/messages', form);
      setForm({ receiverId: '', subject: '', body: '' });
      setSearch('');
      setUserResults([]);
      setShowCompose(false);
      fetchMessages();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to send message');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkRead = async (m: MessageItem) => {
    try {
      await api.put(`/communications/messages/${m.id}/read`);
      setMessages(prev => prev.map(x => x.id === m.id ? { ...x, isRead: true } : x));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const selected = useMemo(() => userResults.find(u => u.id === form.receiverId), [userResults, form.receiverId]);

  return (
    <div className="space-y-4">
      {!showCompose && (
        <Button onClick={() => { setShowCompose(true); setForm({ receiverId: '', subject: '', body: '' }); }}>
          <Plus className="w-4 h-4 mr-2" /> Send Private Message
        </Button>
      )}

      {showCompose && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Send Private Message
            </CardTitle>
            <button onClick={() => setShowCompose(false)} className="p-1 rounded hover:bg-muted">
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Recipient</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <input
                    className={`${inputCls} pl-9`}
                    placeholder="Search users by name or email..."
                    value={search}
                    onChange={e => searchUsers(e.target.value)}
                  />
                </div>
                {searching && <p className="text-xs text-muted-foreground">Searching...</p>}
                {userResults.length > 0 && (
                  <div className="border border-input rounded-md divide-y divide-border max-h-48 overflow-y-auto">
                    {userResults.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setForm(p => ({ ...p, receiverId: u.id }));
                          setSearch(u.name);
                          setUserResults([]);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted text-left"
                      >
                        <span className="font-medium truncate">{u.name}</span>
                        <span className="text-xs text-muted-foreground capitalize shrink-0 ml-2">{u.role.replace(/_/g, ' ')}</span>
                      </button>
                    ))}
                  </div>
                )}
                {form.receiverId && !selected && (
                  <p className="text-xs text-green-600">Recipient selected</p>
                )}
                {selected && (
                  <p className="text-xs text-green-600">
                    {selected.name} • {selected.role.replace(/_/g, ' ')} • {selected.email}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Subject</label>
                <input className={inputCls} value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Verify your patrol report" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Message</label>
                <textarea className={`${inputCls} min-h-[100px]`} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="Private message — only the recipient can see this..." />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={() => setShowCompose(false)}>Cancel</Button>
                <Button type="submit" disabled={saving || !form.receiverId || !form.subject.trim() || !form.body.trim()}>
                  <Send className="w-4 h-4 mr-2" /> {saving ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading messages...</p>
      ) : messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Mail className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No private messages yet</p>
          </CardContent>
        </Card>
      ) : (
        messages.map(m => (
          <Card key={m.id}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-medium truncate">{m.subject}</h3>
                    {m.isRead ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">Read</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">Unread</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{m.body}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    To: <span className="font-medium">{m.receiverName || 'Unknown user'}</span>
                    {m.receiverRole ? ` (${m.receiverRole.replace(/_/g, ' ')})` : ''}
                    {' • '}{new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!m.isRead && (
                  <button onClick={() => handleMarkRead(m)} className="p-1.5 rounded hover:bg-muted shrink-0" title="Mark as read">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

// ─── Notification Log Tab ──────────────────────────────────────────────────

function NotificationLogTab() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');

  const fetchLog = async (type?: string) => {
    setLoading(true);
    try {
      const qs = type ? `?type=${encodeURIComponent(type)}` : '';
      const res = await api.get<{ data: NotificationItem[] }>(`/communications/notifications/all${qs}`);
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notification log', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLog(); }, []);

  const types = useMemo(() => Array.from(new Set(notifications.map(n => n.type))).sort(), [notifications]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">Every notification sent to users across the platform — from broadcasts, alerts, and private messages.</p>
        <select
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); fetchLog(e.target.value || undefined); }}
        >
          <option value="">All types</option>
          {types.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading notification log...</p>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Bell className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No notifications have been sent yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {notifications.map(n => (
              <div key={n.id} className="flex items-start justify-between gap-4 px-4 py-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase shrink-0 mt-0.5 ${TYPE_STYLES[n.type] || 'bg-gray-100 text-gray-700'}`}>
                    {n.type}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    {n.body && <p className="text-sm text-muted-foreground line-clamp-1">{n.body}</p>}
                    <p className="text-xs text-muted-foreground/60 mt-0.5">
                      To: <span className="font-medium">{n.userName || 'Unknown user'}</span>
                      {n.userRole ? ` (${n.userRole.replace(/_/g, ' ')})` : ''}
                      {n.userEmail ? ` • ${n.userEmail}` : ''}
                      {' • '}{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {n.isRead ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 shrink-0">Read</span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 shrink-0">Delivered</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
