import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import StatusBadge from '../../components/StatusBadge';
import { useApi } from '../../hooks/useApi';
import { api } from '../../lib/api';
import { formatDate, formatRelativeTime } from '../../lib/utils';
import type { Alert } from '../../lib/types';

export default function AlertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: alert, loading, refetch } = useApi<Alert>(`/alerts/${id}`);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!alert) return <p className="text-muted-foreground">Alert not found</p>;

  async function handleResolve() {
    await api.post(`/alerts/${id}/resolve`);
    refetch();
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">{alert.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Reported {formatRelativeTime(alert.createdAt)}</p>
        </div>
        {alert.status === 'active' && (
          <Button onClick={handleResolve}>Resolve Alert</Button>
        )}
      </div>
      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-muted-foreground">Type</dt><dd className="font-medium capitalize">{alert.type}</dd></div>
            <div><dt className="text-muted-foreground">Severity</dt><dd><StatusBadge status={alert.severity} /></dd></div>
            <div><dt className="text-muted-foreground">Status</dt><dd><StatusBadge status={alert.status} /></dd></div>
            <div><dt className="text-muted-foreground">Location</dt><dd className="font-medium">{alert.location || '-'}</dd></div>
            <div className="col-span-2"><dt className="text-muted-foreground">Description</dt><dd className="font-medium mt-1">{alert.description || 'No description'}</dd></div>
            <div><dt className="text-muted-foreground">Created</dt><dd className="font-medium">{formatDate(alert.createdAt)}</dd></div>
            {alert.resolvedAt && <div><dt className="text-muted-foreground">Resolved</dt><dd className="font-medium">{formatDate(alert.resolvedAt)}</dd></div>}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
