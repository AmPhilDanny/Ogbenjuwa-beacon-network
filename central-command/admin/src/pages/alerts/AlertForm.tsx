import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useApi } from '../../hooks/useApi';
import { api, ApiClientError } from '../../lib/api';
import type { Alert, AlertType, Lga, Ward } from '../../lib/types';

const inputCls =
  'w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring';

const SEVERITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export default function AlertForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: alertTypesData } = useApi<{ data: AlertType[] }>('/alert-types');
  const { data: lgasData } = useApi<{ data: Lga[] }>('/lgas');
  const { data: alert, loading: alertLoading } = useApi<Alert>(isEdit ? `/alerts/${id}` : '', isEdit);
  const [wards, setWards] = useState<Ward[]>([]);

  const [form, setForm] = useState({
    title: '',
    type: '',
    severity: 'medium',
    description: '',
    lgaId: '',
    wardId: '',
    location: '',
    isPublic: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!alert) return;
    setForm({
      title: alert.title,
      type: alert.type,
      severity: alert.severity,
      description: alert.description || '',
      lgaId: alert.lgaId,
      wardId: alert.wardId || '',
      location: alert.location || '',
      isPublic: alert.isPublic,
    });
    if (alert.lgaId) loadWards(alert.lgaId);
  }, [alert]);

  // Default type once alert types arrive
  useEffect(() => {
    if (!isEdit && alertTypesData?.data?.length && !form.type) {
      setForm((f) => ({ ...f, type: alertTypesData.data[0].key }));
    }
  }, [alertTypesData, isEdit, form.type]);

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
        title: form.title,
        type: form.type,
        severity: form.severity,
        description: form.description || undefined,
        lgaId: form.lgaId,
        wardId: form.wardId || null,
        location: form.location || undefined,
        isPublic: form.isPublic,
      };
      if (isEdit) {
        await api.put(`/alerts/${id}`, body);
      } else {
        await api.post('/alerts', body);
      }
      navigate('/alerts');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to save alert');
    } finally {
      setLoading(false);
    }
  }

  if (isEdit && alertLoading) return <p className="text-muted-foreground">Loading...</p>;

  const alertTypes = alertTypesData?.data || [];
  const lgas = lgasData?.data || [];

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-serif font-bold mb-6">{isEdit ? 'Edit Alert' : 'Create Alert'}</h1>
      <Card>
        <CardHeader><CardTitle>Alert Details</CardTitle></CardHeader>
        <CardContent>
          {error && <p className="text-sm text-accent mb-4 p-3 rounded-md bg-accent/10">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required>
                  {alertTypes.length === 0 && <option value="">Loading types...</option>}
                  {alertTypes.map((t) => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Severity</label>
                <select className={inputCls} value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                  {SEVERITIES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">LGA</label>
                <select className={inputCls} value={form.lgaId} onChange={(e) => handleLgaChange(e.target.value)} required>
                  <option value="">Select LGA</option>
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
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input className={inputCls} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Near Otukpo Main Market" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea className={inputCls} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                className="w-4 h-4"
              />
              Public alert (visible to citizens)
            </label>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Alert'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/alerts')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
