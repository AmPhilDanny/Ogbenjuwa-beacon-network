import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { useApi } from '../../hooks/useApi';
import { formatRelativeTime } from '../../lib/utils';
import type { Alert } from '../../lib/types';
import { Plus } from 'lucide-react';

export default function AlertList() {
  const navigate = useNavigate();
  const { data, loading } = useApi<{ data: Alert[] }>('/alerts');

  const columns = [
    { key: 'title', header: 'Title', sortable: true, render: (a: Alert) => <span className="font-medium">{a.title}</span> },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'severity', header: 'Severity', render: (a: Alert) => <StatusBadge status={a.severity} /> },
    { key: 'status', header: 'Status', render: (a: Alert) => <StatusBadge status={a.status} /> },
    { key: 'createdAt', header: 'Reported', render: (a: Alert) => formatRelativeTime(a.createdAt) },
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
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={loading}
        searchable
        searchKeys={['title', 'type']}
        onRowClick={(a) => navigate(`/alerts/${a.id}`)}
      />
    </div>
  );
}
