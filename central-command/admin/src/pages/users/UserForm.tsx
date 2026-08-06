import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useApi } from '../../hooks/useApi';
import { api, ApiClientError } from '../../lib/api';
import type { Lga, User, Ward } from '../../lib/types';

const inputCls =
  'w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring';

const FALLBACK_ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'state_observer', label: 'State Observer' },
  { value: 'lga_coordinator', label: 'LGA Coordinator' },
  { value: 'vigilante_leader', label: 'Vigilante Leader' },
  { value: 'community_admin', label: 'Community Admin' },
  { value: 'resident', label: 'Resident' },
];

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: lgasData } = useApi<{ data: Lga[] }>('/lgas');
  const { data: rolesData } = useApi<{ data: { name: string; label: string }[] }>('/roles');
  const { data: user, loading: userLoading } = useApi<User>(isEdit ? `/users/${id}` : '', isEdit);
  const [wards, setWards] = useState<Ward[]>([]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'community_admin',
    phone: '',
    lgaId: '',
    wardId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name,
      email: user.email,
      username: user.username || '',
      password: '',
      role: user.role,
      phone: user.phone || '',
      lgaId: user.lgaId || '',
      wardId: user.wardId || '',
    });
    if (user.lgaId) loadWards(user.lgaId);
  }, [user]);

  async function loadWards(lgaId: string) {
    try {
      const res = await api.get<{ data: Ward[] }>(`/lgas/${lgaId}/wards`);
      setWards(res.data || []);
    } catch {
      setWards([]);
    }
  }

  function handleLgaChange(lgaId: string) {
    setForm((f) => ({ ...f, lgaId, wardId: '' }));
    if (lgaId) loadWards(lgaId);
    else setWards([]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        phone: form.phone || undefined,
        role: form.role,
        lgaId: form.lgaId || null,
        wardId: form.wardId || null,
      };
      if (form.username) body.username = form.username;
      if (isEdit) {
        if (form.password) body.password = form.password;
        await api.put(`/users/${id}`, body);
      } else {
        body.email = form.email;
        body.password = form.password;
        await api.post('/users', body);
      }
      navigate('/users');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to save user');
    } finally {
      setLoading(false);
    }
  }

  if (isEdit && userLoading) return <p className="text-muted-foreground">Loading...</p>;

  const lgas = lgasData?.data || [];
  const loadedRoles = (rolesData?.data || []).map((r) => ({ value: r.name, label: r.label }));
  const roleOptions = loadedRoles.length > 0 ? loadedRoles : FALLBACK_ROLES;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-serif font-bold mb-6">{isEdit ? 'Edit User' : 'Create User'}</h1>
      <Card>
        <CardHeader><CardTitle>User Details</CardTitle></CardHeader>
        <CardContent>
          {error && <p className="text-sm text-accent mb-4 p-3 rounded-md bg-accent/10">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required={!isEdit} disabled={isEdit} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input className={inputCls} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{isEdit ? 'New Password (leave blank to keep current)' : 'Password'}</label>
              <input type="password" className={inputCls} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!isEdit} minLength={8} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {roleOptions.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">LGA</label>
                <select className={inputCls} value={form.lgaId} onChange={(e) => handleLgaChange(e.target.value)}>
                  <option value="">None</option>
                  {lgas.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ward</label>
                <select className={inputCls} value={form.wardId} onChange={(e) => setForm({ ...form, wardId: e.target.value })} disabled={!form.lgaId}>
                  <option value="">None</option>
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create User'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/users')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
