import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import StatusBadge from '../../components/StatusBadge';
import { useApi } from '../../hooks/useApi';
import { formatDate } from '../../lib/utils';
import type { User } from '../../lib/types';

export default function UserDetail() {
  const { id } = useParams();
  const { data: user, loading } = useApi<User>(`/users/${id}`);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!user) return <p className="text-muted-foreground">User not found</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-serif font-bold mb-6">{user.name}</h1>
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-muted-foreground">Email</dt><dd className="font-medium">{user.email}</dd></div>
            <div><dt className="text-muted-foreground">Phone</dt><dd className="font-medium">{user.phone || '-'}</dd></div>
            <div><dt className="text-muted-foreground">Role</dt><dd><StatusBadge status={user.role} /></dd></div>
            <div><dt className="text-muted-foreground">Status</dt><dd><StatusBadge status={user.isActive ? 'active' : 'inactive'} /></dd></div>
            <div><dt className="text-muted-foreground">Last Login</dt><dd className="font-medium">{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}</dd></div>
            <div><dt className="text-muted-foreground">Created</dt><dd className="font-medium">{formatDate(user.createdAt)}</dd></div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
