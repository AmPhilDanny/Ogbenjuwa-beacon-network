import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { api } from '../../lib/api';
import { MessageSquare, Send, Plus, Eye, EyeOff, Trash2, Check, Bell, X } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  body: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export default function Communications() {
  const [tab, setTab] = useState<'announcements' | 'notifications'>('announcements');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', body: '', isPublished: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tab === 'announcements') fetchAnnouncements();
    else fetchNotifications();
  }, [tab, page]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Announcement[]; pagination: { page: number; limit: number } }>(
        `/communications/announcements?page=${page}&limit=20`
      );
      setAnnouncements(res.data);
      setTotalPages(Math.ceil((res as any).pagination?.page || 1));
    } catch (err) {
      console.error('Failed to fetch announcements', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Notification[] }>('/communications/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title || !form.body) return;
    setSaving(true);
    try {
      await api.post('/communications/announcements', form);
      setForm({ title: '', body: '', isPublished: false });
      setShowCreate(false);
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to create announcement', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!form.title || !form.body) return;
    setSaving(true);
    try {
      await api.put(`/communications/announcements/${id}`, form);
      setEditId(null);
      setForm({ title: '', body: '', isPublished: false });
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to update announcement', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/communications/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to delete announcement', err);
    }
  };

  const handleTogglePublish = async (a: Announcement) => {
    try {
      await api.put(`/communications/announcements/${a.id}`, { isPublished: !a.isPublished });
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to toggle publish', err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.put(`/communications/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const startEdit = (a: Announcement) => {
    setEditId(a.id);
    setForm({ title: a.title, body: a.body, isPublished: a.isPublished });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold">Communications</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Send announcements and manage messages</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        <button onClick={() => { setTab('announcements'); setPage(1); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'announcements' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}>
          <MessageSquare className="w-4 h-4" /> Announcements
        </button>
        <button onClick={() => setTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'notifications' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}>
          <Bell className="w-4 h-4" /> Notifications
          {notifications.filter(n => !n.isRead).length > 0 && (
            <span className="w-2 h-2 rounded-full bg-accent" />
          )}
        </button>
      </div>

      {/* Announcements Tab */}
      {tab === 'announcements' && (
        <div className="space-y-4">
          {/* Create button */}
          {!showCreate && (
            <Button onClick={() => { setShowCreate(true); setEditId(null); setForm({ title: '', body: '', isPublished: false }); }}>
              <Plus className="w-4 h-4 mr-2" /> New Announcement
            </Button>
          )}

          {/* Create/Edit form */}
          {(showCreate || editId) && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{editId ? 'Edit Announcement' : 'New Announcement'}</CardTitle>
                <button onClick={() => { setShowCreate(false); setEditId(null); }} className="p-1 rounded hover:bg-muted">
                  <X className="w-4 h-4" />
                </button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Title</label>
                  <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Body</label>
                  <textarea className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[100px]" value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="publish" checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))} className="rounded border-input" />
                  <label htmlFor="publish" className="text-sm">Publish immediately</label>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => { setShowCreate(false); setEditId(null); }}>Cancel</Button>
                  <Button onClick={editId ? () => handleUpdate(editId) : handleCreate} disabled={saving || !form.title || !form.body}>
                    <Send className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Announcement list */}
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading announcements...</p>
          ) : announcements.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No announcements yet</p>
              </CardContent>
            </Card>
          ) : (
            announcements.map(a => (
              <Card key={a.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{a.title}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          a.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {a.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{a.body}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">{new Date(a.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleTogglePublish(a)} className="p-1.5 rounded hover:bg-muted" title={a.isPublished ? 'Unpublish' : 'Publish'}>
                        {a.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => startEdit(a)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded hover:bg-muted text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {tab === 'notifications' && (
        <div className="space-y-2">
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12 text-center">
                <Bell className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map(n => (
              <Card key={n.id}>
                <CardContent className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" />}
                      <div className={!n.isRead ? '' : 'opacity-60'}>
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-sm text-muted-foreground">{n.body}</p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {!n.isRead && (
                      <button onClick={() => handleMarkRead(n.id)} className="p-1.5 rounded hover:bg-muted shrink-0" title="Mark as read">
                        <Check className="w-3.5 h-3.5 text-primary" />
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
