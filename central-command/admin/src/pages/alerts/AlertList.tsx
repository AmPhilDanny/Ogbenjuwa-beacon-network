import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { useApi } from '../../hooks/useApi';
import { api, ApiClientError } from '../../lib/api';
import { formatRelativeTime } from '../../lib/utils';
import type { Alert } from '../../lib/types';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const inputCls =
  'px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring';

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'false_alarm', label: 'False Alarm' },
];

export default function AlertList() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const { data, loading, refetch } = useApi<{ data: Alert[] }>('/alerts');

  const filtered = (data?.data || []).filter((a) => !statusFilter || a.status === statusFilter);

  async function handleDelete(a: Alert) {
    if (!window.confirm(`Delete alert "${a.title}"?`)) return;
    try {
      await api.delete(`/alerts/${a.id}`);
      refetch();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to delete alert');
    }
  }

  const columns = [
    { key: 'title', header: 'Title', sortable: true, render: (a: Alert) => <span className="font-medium">{a.title}</span> },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'severity', header: 'Severity', render: (a: Alert) => <StatusBadge status={a.severity} /> },
    { key: 'status', header: 'Status', render: (a: Alert) => <StatusBadge status={a.status} /> },
    { key: 'createdAt', header: 'Reported', render: (a: Alert) => formatRelativeTime(a.createdAt) },
    {
      key: 'actions',
      header: 'Actions',
      render: (a: Alert) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" onClick={() => navigate(`/alerts/${a.id}/edit`)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(a)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Alerts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monitor and manage security alerts</p>
        </div>
        <Button onClick={() => navigate('/alerts/new')}>
          <Plus className="w-4 h-4 mr-1" /> New Alert
        </Button>
      </div>

      {error && <p className="text-sm text-accent mb-4 p-3 rounded-md bg-accent/10">{error}</p>}

      <div className="mb-4">
        <select className={inputCls} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {STATUS_FILTERS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchable
        searchKeys={['title', 'type']}
        onRowClick={(a) => navigate(`/alerts/${a.id}`)}
      />
    </div>
  );
}
