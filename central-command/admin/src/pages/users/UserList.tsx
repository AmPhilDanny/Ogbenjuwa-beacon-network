import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { useApi } from '../../hooks/useApi';
import { formatDate } from '../../lib/utils';
import type { User } from '../../lib/types';
import { Plus } from 'lucide-react';

export default function UserList() {
  const navigate = useNavigate();
  const { data, loading } = useApi<{ data: User[] }>('/users');

  const columns = [
    { key: 'name', header: 'Name', sortable: true, render: (u: User) => <span className="font-medium">{u.name}</span> },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'role', header: 'Role', sortable: true, render: (u: User) => <StatusBadge status={u.role} /> },
    { key: 'isActive', header: 'Status', render: (u: User) => <StatusBadge status={u.isActive ? 'active' : 'inactive'} /> },
    { key: 'createdAt', header: 'Joined', render: (u: User) => formatDate(u.createdAt) },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage operators and administrators</p>
        </div>
        <Button onClick={() => navigate('/users/new')}>
          <Plus className="w-4 h-4 mr-1" /> Add User
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={loading}
        searchable
        searchKeys={['name', 'email', 'role']}
        onRowClick={(u) => navigate(`/users/${u.id}`)}
      />
    </div>
  );
}
