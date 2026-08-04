import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import StatusBadge from '../../components/StatusBadge';
import { useApi } from '../../hooks/useApi';
import { api, ApiClientError } from '../../lib/api';
import { formatDate, formatRelativeTime } from '../../lib/utils';
import type { Alert, Lga } from '../../lib/types';
import { Pencil, Trash2, Search, CheckCircle2, XCircle, Globe } from 'lucide-react';

const STATUS_FLOW: { status: Alert['status']; label: string }[] = [
  { status: 'active', label: 'Active' },
  { status: 'investigating', label: 'Investigating' },
  { status: 'resolved', label: 'Resolved' },
  { status: 'false_alarm', label: 'False Alarm' },
];

export default function AlertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: alert, loading, refetch } = useApi<Alert>(`/alerts/${id}`);
  const { data: lgasData } = useApi<{ data: Lga[] }>('/lgas');
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!alert) return <p className="text-muted-foreground">Alert not found</p>;

  const currentAlert = alert;
  const lgaName = lgasData?.data?.find((l) => l.id === currentAlert.lgaId)?.name;

  async function handleStatusChange(status: Alert['status']) {
    setError('');
    setNotice('');
    setStatusLoading(true);
    try {
      await api.put(`/alerts/${currentAlert.id}`, { status });
      setNotice(`Alert marked ${status}`);
      refetch();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete alert "${currentAlert.title}"?`)) return;
    setError('');
    setNotice('');
    try {
      await api.delete(`/alerts/${currentAlert.id}`);
      navigate('/alerts');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to delete alert');
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">{currentAlert.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Reported {formatRelativeTime(currentAlert.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate(`/alerts/${currentAlert.id}/edit`)}>
            <Pencil className="w-4 h-4 mr-1.5" /> Edit
          </Button>
          <Button size="sm" variant="danger" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-1.5" /> Delete
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-accent mb-4 p-3 rounded-md bg-accent/10">{error}</p>}
      {notice && <p className="text-sm text-green-600 mb-4 p-3 rounded-md bg-green-600/10">{notice}</p>}

      <Card className="mb-4">
        <CardHeader><CardTitle>Status</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FLOW.map((s) => (
              <Button
                key={s.status}
                size="sm"
                variant={currentAlert.status === s.status ? 'primary' : 'outline'}
                disabled={statusLoading}
                onClick={() => handleStatusChange(s.status)}
              >
                {s.status === 'resolved' && <CheckCircle2 className="w-4 h-4 mr-1.5" />}
                {s.status === 'false_alarm' && <XCircle className="w-4 h-4 mr-1.5" />}
                {s.status === 'investigating' && <Search className="w-4 h-4 mr-1.5" />}
                {s.status === 'active' && <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />}
                {s.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-muted-foreground">Type</dt><dd className="font-medium capitalize">{currentAlert.type}</dd></div>
            <div><dt className="text-muted-foreground">Severity</dt><dd><StatusBadge status={currentAlert.severity} /></dd></div>
            <div><dt className="text-muted-foreground">Status</dt><dd><StatusBadge status={currentAlert.status} /></dd></div>
            <div><dt className="text-muted-foreground">LGA</dt><dd className="font-medium">{lgaName || currentAlert.lgaId}</dd></div>
            <div><dt className="text-muted-foreground">Location</dt><dd className="font-medium">{currentAlert.location || '-'}</dd></div>
            <div>
              <dt className="text-muted-foreground">Visibility</dt>
              <dd className="font-medium flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                {currentAlert.isPublic ? 'Public' : 'Internal'}
              </dd>
            </div>
            <div className="col-span-2"><dt className="text-muted-foreground">Description</dt><dd className="font-medium mt-1">{currentAlert.description || 'No description'}</dd></div>
            <div><dt className="text-muted-foreground">Created</dt><dd className="font-medium">{formatDate(currentAlert.createdAt)}</dd></div>
            {currentAlert.resolvedAt && <div><dt className="text-muted-foreground">Resolved</dt><dd className="font-medium">{formatDate(currentAlert.resolvedAt)}</dd></div>}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
