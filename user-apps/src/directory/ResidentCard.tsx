import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import ConnectionButton from './ConnectionButton';
import type { ResidentPublicProfile, ConnectionStatus } from '@/lib/types';

interface Props {
  resident: ResidentPublicProfile;
  connectionStatus: ConnectionStatus;
  onConnect: () => void;
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function ResidentCard({ resident, connectionStatus, onConnect }: Props) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar>
          <AvatarFallback className="text-sm">{getInitials(resident.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{resident.name}</p>
            {resident.verified && <Badge variant="outline" className="text-[10px] text-green-600 border-green-600">{t('directory.verified')}</Badge>}
          </div>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {resident.ward}, {resident.lga}
          </p>
        </div>
      </div>
      <ConnectionButton status={connectionStatus} onConnect={onConnect} />
    </div>
  );
}
