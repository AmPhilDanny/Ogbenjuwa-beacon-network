import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Clock } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import type { ConnectionStatus } from '@/lib/types';

interface Props {
  status: ConnectionStatus;
  onConnect: () => void;
}

export default function ConnectionButton({ status, onConnect }: Props) {
  const { t } = useLanguage();
  const [pending, setPending] = useState(status === 'pending');

  if (status === 'connected') {
    return (
      <Button variant="outline" size="sm" className="gap-1 text-xs" disabled>
        <UserCheck className="h-3 w-3" /> {t('directory.connected')}
      </Button>
    );
  }

  if (pending) {
    return (
      <Button variant="outline" size="sm" className="gap-1 text-xs" disabled>
        <Clock className="h-3 w-3" /> {t('directory.pending')}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1 text-xs"
      onClick={() => { onConnect(); setPending(true); }}
    >
      <UserPlus className="h-3 w-3" /> {t('directory.connect')}
    </Button>
  );
}
