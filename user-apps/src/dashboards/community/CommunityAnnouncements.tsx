import { useState, useEffect } from 'react';
import { Megaphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n';
import { api } from '@/lib/api';

interface Announcement {
  id: string;
  title: string;
  body: string;
  isPublished: boolean;
  createdAt: string;
}

export default function CommunityAnnouncements() {
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: Announcement[] }>('/communications/announcements?page=1&limit=10')
      .then(res => setAnnouncements(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          {t('community.announcements')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">{t('general.no_data') || 'No announcements'}</p>
        ) : (
          <div className="space-y-4">
            {announcements.filter(a => a.isPublished).map(a => (
              <div key={a.id} className="border-l-2 border-primary pl-3">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">{a.title}</p>
                  <Badge variant="outline" className="text-[10px]">Published</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{a.body}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(a.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
