import { useState, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/i18n';
import { useResidents } from '@/hooks/useResidents';
import { api } from '@/lib/api';
import ResidentCard from './ResidentCard';

export default function DirectoryPage() {
  const { t } = useLanguage();
  const { residents, search, setSearch, lgaFilter, setLgaFilter, getConnectionStatus, sendRequest } = useResidents();
  const [lgas, setLgas] = useState<string[]>([]);

  useEffect(() => {
    api.get<{ data: { id: string; name: string }[] }>('/lgas')
      .then(res => setLgas((res.data || []).map(l => l.name)))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('directory.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('directory.subtitle') || 'Find and connect with neighbors'}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={t('directory.search')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setLgaFilter('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !lgaFilter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}
        >
          {t('general.all') || 'All'}
        </button>
        {lgas.map(lga => (
          <button
            key={lga}
            onClick={() => setLgaFilter(lga)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              lgaFilter === lga ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            <MapPin className="h-3 w-3" /> {lga}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {residents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">{t('directory.no_results')}</p>
          </div>
        ) : (
          residents.map(r => (
            <ResidentCard
              key={r.id}
              resident={r}
              connectionStatus={getConnectionStatus(r.id)}
              onConnect={() => sendRequest(r.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
