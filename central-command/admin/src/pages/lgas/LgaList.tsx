import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { useApi } from '../../hooks/useApi';
import type { Lga } from '../../lib/types';

export default function LgaList() {
  const navigate = useNavigate();
  const { data, loading } = useApi<{ data: Lga[] }>('/lgas');

  const columns = [
    { key: 'name', header: 'LGA', sortable: true, render: (l: Lga) => <span className="font-medium">{l.name}</span> },
    { key: 'code', header: 'Code' },
    { key: 'state', header: 'State' },
    { key: 'region', header: 'Region' },
    { key: 'coverageTarget', header: 'Coverage', render: (l: Lga) => `${l.coverageTarget}%` },
    { key: 'isActive', header: 'Status', render: (l: Lga) => <StatusBadge status={l.isActive ? 'active' : 'inactive'} /> },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold">Local Government Areas</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage LGAs and wards across Benue State</p>
      </div>
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={loading}
        searchable
        searchKeys={['name', 'code']}
        onRowClick={(l) => navigate(`/lgas/${l.id}`)}
      />
    </div>
  );
}
