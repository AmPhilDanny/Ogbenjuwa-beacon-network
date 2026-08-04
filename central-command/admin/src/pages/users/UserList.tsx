import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { useApi } from '../../hooks/useApi';
import { api, ApiClientError } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import type { User } from '../../lib/types';
import { Plus, Power, Trash2 } from 'lucide-react';

export default function UserList() {
  const navigate = useNavigate();
  const { data, loading, refetch } = useApi<{ data: User[] }>('/users');

  async function handleToggleActive(u: User) {
    try {
      await api.put(`/users/${u.id}`, { isActive: !u.isActive });
      refetch();
    } catch (err) {
      window.alert(err instanceof ApiClientError ? err.message : 'Failed to update user');
    }
  }

  async function handleDelete(u: User) {
    if (!window.confirm(`Deactivate user "${u.name}"?`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      refetch();
    } catch (err) {
      window.alert(err instanceof ApiClientError ? err.message : 'Failed to delete user');
    }
  }

  const columns = [
    { key: 'name', header: 'Name', sortable: true, render: (u: User) => <span className="font-medium">{u.name}</span> },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'role', header: 'Role', sortable: true, render: (u: User) => <StatusBadge status={u.role} /> },
    { key: 'isActive', header: 'Status', render: (u: User) => <StatusBadge status={u.isActive ? 'active' : 'inactive'} /> },
    { key: 'createdAt', header: 'Joined', render: (u: User) => formatDate(u.createdAt) },
    {
      key: 'actions',
      header: 'Actions',
      render: (u: User) => (
        <div className="flex gap-1">
          <button
            className="p-1.5 rounded-md hover:bg-muted"
            onClick={(e) => { e.stopPropagation(); handleToggleActive(u); }}
            title={u.isActive ? 'Deactivate' : 'Activate'}
          >
            <Power className={`w-4 h-4 ${u.isActive ? 'text-green-600' : 'text-muted-foreground'}`} />
          </button>
          <button
            className="p-1.5 rounded-md hover:bg-accent/10 text-accent"
            onClick={(e) => { e.stopPropagation(); handleDelete(u); }}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
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
