import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useApi } from '../../hooks/useApi';
import { api, ApiClientError } from '../../lib/api';
import type { Lga, User, Ward, Village, PatrolTeam } from '../../lib/types';

const inputCls =
  'w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring';

export default function PatrolForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: lgasData } = useApi<{ data: Lga[] }>('/lgas');
  const { data: usersData } = useApi<{ data: User[] }>('/users');
  const { data: team, loading: teamLoading } = useApi<PatrolTeam>(isEdit ? `/patrols/${id}` : '', isEdit);
  const [wards, setWards] = useState<Ward[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [form, setForm] = useState({
    name: '',
    lgaId: '',
    wardId: '',
    villageId: '',
    leaderId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!team) return;
    setForm({
      name: team.name,
      lgaId: team.lgaId,
      wardId: team.wardId || '',
      villageId: team.villageId || '',
      leaderId: team.leaderId,
    });
    loadWards(team.lgaId);
    loadVillages(team.wardId || '', team.lgaId);
  }, [team]);

  async function loadWards(lgaId: string) {
    try {
      const res = await api.get<{ data: Ward[] }>(`/lgas/${lgaId}/wards`);
      setWards(res.data || []);
    } catch {
      setWards([]);
    }
  }

  async function loadVillages(wardId: string, lgaId: string) {
    try {
      const params = new URLSearchParams();
      if (wardId) params.set('wardId', wardId);
      if (lgaId) params.set('lgaId', lgaId);
      const res = await api.get<{ data: Village[] }>(`/villages?${params.toString()}`);
      setVillages(res.data || []);
    } catch {
      setVillages([]);
    }
  }

  function handleLgaChange(lgaId: string) {
    setForm((f) => ({ ...f, lgaId, wardId: '', villageId: '' }));
    setVillages([]);
    if (lgaId) loadWards(lgaId);
    else setWards([]);
  }

  function handleWardChange(wardId: string) {
    setForm((f) => ({ ...f, wardId, villageId: '' }));
    loadVillages(wardId, form.lgaId);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        lgaId: form.lgaId,
        wardId: form.wardId || null,
        villageId: form.villageId || null,
        leaderId: form.leaderId,
      };
      if (isEdit) {
        await api.put(`/patrols/${id}`, body);
      } else {
        await api.post('/patrols', body);
      }
      navigate('/patrols');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to save patrol team');
    } finally {
      setLoading(false);
    }
  }

  if (isEdit && teamLoading) return <p className="text-muted-foreground">Loading...</p>;

  const lgas = lgasData?.data || [];
  const users = usersData?.data || [];

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-serif font-bold mb-6">{isEdit ? 'Edit Patrol Team' : 'Create Patrol Team'}</h1>
      <Card>
        <CardHeader><CardTitle>Team Details</CardTitle></CardHeader>
        <CardContent>
          {error && <p className="text-sm text-accent mb-4 p-3 rounded-md bg-accent/10">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Team Name</label>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Local Government</label>
              <select className={inputCls} value={form.lgaId} onChange={(e) => handleLgaChange(e.target.value)} required>
                <option value="">Select LGA</option>
                {lgas.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ward</label>
                <select className={inputCls} value={form.wardId} onChange={(e) => handleWardChange(e.target.value)} disabled={!form.lgaId}>
                  <option value="">All wards</option>
                  {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Village</label>
                <select className={inputCls} value={form.villageId} onChange={(e) => setForm({ ...form, villageId: e.target.value })} disabled={!form.lgaId}>
                  <option value="">All villages</option>
                  {villages.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Team Leader</label>
              <select className={inputCls} value={form.leaderId} onChange={(e) => setForm({ ...form, leaderId: e.target.value })} required>
                <option value="">Select leader</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Team'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/patrols')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
