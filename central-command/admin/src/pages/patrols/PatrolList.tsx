import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { useApi } from '../../hooks/useApi';
import type { PatrolTeam } from '../../lib/types';

export default function PatrolList() {
  const { data, loading } = useApi<{ data: PatrolTeam[] }>('/patrols');

  const columns = [
    { key: 'name', header: 'Team', sortable: true, render: (t: PatrolTeam) => <span className="font-medium">{t.name}</span> },
    { key: 'memberCount', header: 'Members' },
    { key: 'isActive', header: 'Status', render: (t: PatrolTeam) => <StatusBadge status={t.isActive ? 'active' : 'inactive'} /> },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold">Patrols</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage patrol teams and shifts</p>
      </div>
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={loading}
        searchable
        searchKeys={['name']}
      />
    </div>
  );
}
