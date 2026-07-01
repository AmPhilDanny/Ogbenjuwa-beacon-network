import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import StatusBadge from '../../components/StatusBadge';
import { useApi } from '../../hooks/useApi';
import { api } from '../../lib/api';
import { formatDate, formatRelativeTime } from '../../lib/utils';
import type { Incident } from '../../lib/types';

export default function IncidentDetail() {
  const { id } = useParams();
  const { data: incident, loading, refetch } = useApi<Incident>(`/incidents/${id}`);
  const [notes, setNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!incident) return <p className="text-muted-foreground">Incident not found</p>;

  async function handleResolve() {
    setResolving(true);
    try {
      await api.post(`/incidents/${id}/resolve`, { notes });
      refetch();
    } finally {
      setResolving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold">{incident.title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Reported {formatRelativeTime(incident.createdAt)}</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-muted-foreground">Type</dt><dd className="font-medium capitalize">{incident.type}</dd></div>
              <div><dt className="text-muted-foreground">Priority</dt><dd><StatusBadge status={incident.priority} /></dd></div>
              <div><dt className="text-muted-foreground">Status</dt><dd><StatusBadge status={incident.status} /></dd></div>
              <div><dt className="text-muted-foreground">Location</dt><dd className="font-medium">{incident.location || '-'}</dd></div>
              <div className="col-span-2"><dt className="text-muted-foreground">Description</dt><dd className="font-medium mt-1">{incident.description || 'No description'}</dd></div>
              <div><dt className="text-muted-foreground">Created</dt><dd className="font-medium">{formatDate(incident.createdAt)}</dd></div>
              {incident.resolvedAt && <div><dt className="text-muted-foreground">Resolved</dt><dd className="font-medium">{formatDate(incident.resolvedAt)}</dd></div>}
            </dl>
          </CardContent>
        </Card>

        {incident.status !== 'resolved' && incident.status !== 'closed' && (
          <Card>
            <CardHeader><CardTitle>Resolve Incident</CardTitle></CardHeader>
            <CardContent>
              <textarea
                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm mb-3"
                rows={3}
                placeholder="Response notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button onClick={handleResolve} disabled={resolving}>
                {resolving ? 'Resolving...' : 'Mark Resolved'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
