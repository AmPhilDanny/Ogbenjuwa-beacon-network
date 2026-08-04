import React, { useEffect, useState } from 'react';
import { Rss, Filter, Search, AlertTriangle, Shield, Info, MapPin, Check, MessageCircle, Share2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useIncidents } from '@/hooks/useIncidents';
import { api, ApiClientError } from '@/lib/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface FeedComment {
  id: string;
  resourceType: string;
  resourceId: string;
  body: string;
  userName?: string | null;
  createdAt: string;
}

interface Interactions {
  acks: Record<string, { count: number; acknowledged: boolean }>;
  myAcks: Record<string, boolean>;
  comments: FeedComment[];
}

export default function Feed() {
  const { incidents, loading } = useIncidents();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [interactions, setInteractions] = useState<Interactions>({ acks: {}, myAcks: {}, comments: [] });
  const [commentsOpen, setCommentsOpen] = useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

  const fetchInteractions = () => {
    api.get<{ data: Interactions }>('/feed/interactions')
      .then(res => setInteractions(res.data))
      .catch(() => {});
  };

  useEffect(() => { fetchInteractions(); }, []);

  const filteredIncidents = incidents.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterType || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const ackKey = (item: { id: string; type: string }) => `${item.type}:${item.id}`;

  const toggleAcknowledge = async (item: { id: string; type: string }) => {
    const key = ackKey(item);
    try {
      const res = await api.post<{ acknowledged: boolean; count: number }>('/feed/acknowledge', {
        resourceType: item.type,
        resourceId: item.id,
      });
      setInteractions(prev => ({
        ...prev,
        acks: { ...prev.acks, [key]: { count: res.count, acknowledged: res.acknowledged } },
        myAcks: res.acknowledged ? { ...prev.myAcks, [key]: true } : (() => { const next = { ...prev.myAcks }; delete next[key]; return next; })(),
      }));
      toast.success(res.acknowledged ? 'Acknowledged' : 'Acknowledgement removed');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Failed to acknowledge');
    }
  };

  const toggleComments = (id: string) => {
    setCommentsOpen(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addComment = async (item: { id: string; type: string }) => {
    const key = ackKey(item);
    const text = (commentText[key] || '').trim();
    if (!text) return;
    setSubmitting(prev => ({ ...prev, [key]: true }));
    try {
      const comment = await api.post<FeedComment>('/feed/comments', {
        resourceType: item.type,
        resourceId: item.id,
        body: text,
      });
      setInteractions(prev => ({ ...prev, comments: [comment, ...prev.comments] }));
      setCommentText(prev => ({ ...prev, [key]: '' }));
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Failed to add comment');
    } finally {
      setSubmitting(prev => ({ ...prev, [key]: false }));
    }
  };

  const shareItem = async (item: { id: string; type: string; title: string; content: string }) => {
    const url = `${window.location.origin}/feed?highlight=${item.id}`;
    const shareData = { title: item.title, text: item.content, url };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      } catch {
        toast.error('Sharing is not supported on this device');
      }
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Community Feed</h1>
          <p className="text-muted-foreground">Stay updated with safety alerts and broadcasts.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterType === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType(null)}
          >
            All
          </Button>
          <Button
            variant={filterType === 'alert' ? "destructive" : "outline"}
            size="sm"
            onClick={() => setFilterType('alert')}
          >
            Alerts
          </Button>
          <Button
            variant={filterType === 'announcement' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType('announcement')}
          >
            Updates
          </Button>
          <Button size="sm" className="gap-2" asChild>
            <Link to="/report">
              <AlertTriangle className="h-4 w-4" />
              Post Update
            </Link>
          </Button>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search incidents, announcements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading feed...</p>
        ) : filteredIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Rss className="h-12 w-12 mb-4 opacity-20" />
            <p>No items found matching your criteria.</p>
          </div>
        ) : (
          filteredIncidents.map((item) => {
            const key = ackKey(item);
            const ack = interactions.acks[key];
            const itemComments = interactions.comments.filter(c => `${c.resourceType}:${c.resourceId}` === key);
            const isOpen = !!commentsOpen[item.id];
            return (
              <Card key={item.id} className={cn(
                "transition-all hover:shadow-md",
                item.severity === 'high' ? "border-l-4 border-l-destructive" :
                item.severity === 'medium' ? "border-l-4 border-l-amber-500" : ""
              )}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <Badge variant={item.type === 'alert' ? 'destructive' : 'secondary'}>
                          {item.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{item.author}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.location}
                        </span>
                        <span>•</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{item.content}</p>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <Button
                      variant={ack?.acknowledged ? "default" : "ghost"}
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => toggleAcknowledge(item)}
                    >
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                      {ack?.acknowledged ? 'Acknowledged' : 'Acknowledge'}
                      {ack && ack.count > 0 && <span className="ml-1 text-xs opacity-70">({ack.count})</span>}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => toggleComments(item.id)}>
                      <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                      Comment
                      {itemComments.length > 0 && <span className="ml-1 text-xs opacity-70">({itemComments.length})</span>}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => shareItem(item)}>
                      <Share2 className="w-3.5 h-3.5 mr-1.5" />
                      Share
                    </Button>
                  </div>

                  {isOpen && (
                    <div className="mt-4 space-y-3 border-t pt-4">
                      {itemComments.length > 0 && (
                        <div className="space-y-2">
                          {itemComments.map(c => (
                            <div key={c.id} className="flex items-start gap-2 text-sm bg-muted/50 rounded-lg p-3">
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-xs">{c.userName || 'Community member'}</p>
                                <p className="text-muted-foreground break-words">{c.body}</p>
                                <p className="text-xs text-muted-foreground/60 mt-0.5">{new Date(c.createdAt).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Textarea
                          className="min-h-[60px] text-sm"
                          placeholder="Write a comment..."
                          value={commentText[key] || ''}
                          onChange={e => setCommentText(prev => ({ ...prev, [key]: e.target.value }))}
                        />
                        <Button size="sm" className="h-auto" onClick={() => addComment(item)} disabled={submitting[key] || !(commentText[key] || '').trim()}>
                          {submitting[key] ? 'Posting...' : 'Post'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
