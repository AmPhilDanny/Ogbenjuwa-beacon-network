import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import StatusBadge from '../../components/StatusBadge';
import { Button } from '../../components/ui/button';
import { useApi } from '../../hooks/useApi';
import { api, ApiClientError } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import type { User } from '../../lib/types';
import { Pencil, Power, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: user, loading, refetch } = useApi<User>(`/users/${id}`);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!user) return <p className="text-muted-foreground">User not found</p>;

  const currentUser = user;

  async function handleToggleActive() {
    setError('');
    setNotice('');
    try {
      await api.put(`/users/${currentUser.id}`, { isActive: !currentUser.isActive });
      setNotice(currentUser.isActive ? 'User deactivated' : 'User activated');
      refetch();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to update user');
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Deactivate user "${currentUser.name}"?`)) return;
    setError('');
    setNotice('');
    try {
      await api.delete(`/users/${currentUser.id}`);
      navigate('/users');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to delete user');
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">{currentUser.name}</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate(`/users/${currentUser.id}/edit`)}>
            <Pencil className="w-4 h-4 mr-1.5" /> Edit
          </Button>
          <Button size="sm" variant={currentUser.isActive ? 'outline' : 'primary'} onClick={handleToggleActive}>
            <Power className="w-4 h-4 mr-1.5" />
            {currentUser.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button size="sm" variant="danger" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-1.5" /> Delete
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-accent mb-4 p-3 rounded-md bg-accent/10">{error}</p>}
      {notice && <p className="text-sm text-green-600 mb-4 p-3 rounded-md bg-green-600/10">{notice}</p>}

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-muted-foreground">Email</dt><dd className="font-medium">{currentUser.email}</dd></div>
            <div><dt className="text-muted-foreground">Username</dt><dd className="font-medium">{currentUser.username || '-'}</dd></div>
            <div><dt className="text-muted-foreground">Phone</dt><dd className="font-medium">{currentUser.phone || '-'}</dd></div>
            <div><dt className="text-muted-foreground">Role</dt><dd><StatusBadge status={currentUser.role} /></dd></div>
            <div><dt className="text-muted-foreground">Status</dt><dd><StatusBadge status={currentUser.isActive ? 'active' : 'inactive'} /></dd></div>
            <div><dt className="text-muted-foreground">Last Login</dt><dd className="font-medium">{currentUser.lastLoginAt ? formatDate(currentUser.lastLoginAt) : 'Never'}</dd></div>
            <div><dt className="text-muted-foreground">Created</dt><dd className="font-medium">{formatDate(currentUser.createdAt)}</dd></div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
