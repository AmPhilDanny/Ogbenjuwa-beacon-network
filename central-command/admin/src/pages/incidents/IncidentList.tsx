import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { useApi } from '../../hooks/useApi';
import { formatRelativeTime } from '../../lib/utils';
import type { Incident } from '../../lib/types';

export default function IncidentList() {
  const navigate = useNavigate();
  const { data, loading } = useApi<{ data: Incident[] }>('/incidents');

  const columns = [
    { key: 'title', header: 'Incident', sortable: true, render: (i: Incident) => <span className="font-medium">{i.title}</span> },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'priority', header: 'Priority', render: (i: Incident) => <StatusBadge status={i.priority} /> },
    { key: 'status', header: 'Status', render: (i: Incident) => <StatusBadge status={i.status} /> },
    { key: 'createdAt', header: 'Reported', render: (i: Incident) => formatRelativeTime(i.createdAt) },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold">Incidents</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track and manage security incidents</p>
      </div>
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={loading}
        searchable
        searchKeys={['title', 'type']}
        onRowClick={(i) => navigate(`/incidents/${i.id}`)}
      />
    </div>
  );
}
