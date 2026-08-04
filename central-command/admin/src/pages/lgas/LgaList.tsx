import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Power, Trash2 } from 'lucide-react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useApi } from '../../hooks/useApi';
import { api, ApiClientError } from '../../lib/api';
import type { Lga } from '../../lib/types';

const inputCls =
  'w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring';

export default function LgaList() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useApi<{ data: Lga[] }>('/lgas');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    code: '',
    state: 'Benue',
    region: 'Idoma',
    coverageTarget: '80',
    lat: '',
    lng: '',
    radius: '',
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  function resetForm() {
    setForm({ name: '', code: '', state: 'Benue', region: 'Idoma', coverageTarget: '80', lat: '', lng: '', radius: '' });
    setFormError('');
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        code: form.code,
        state: form.state,
        region: form.region,
        coverageTarget: Number(form.coverageTarget) || 80,
      };
      if (form.lat !== '') body.lat = Number(form.lat);
      if (form.lng !== '') body.lng = Number(form.lng);
      if (form.radius !== '') body.radius = Number(form.radius);
      await api.post('/lgas', body);
      setShowForm(false);
      resetForm();
      refetch();
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : 'Failed to create LGA');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(l: Lga) {
    setActionError('');
    try {
      await api.put(`/lgas/${l.id}`, { isActive: !l.isActive });
      refetch();
    } catch (err) {
      setActionError(err instanceof ApiClientError ? err.message : 'Failed to update LGA');
    }
  }

  async function handleDelete(l: Lga) {
    if (!window.confirm(`Delete LGA "${l.name}"? This also deletes its wards and villages.`)) return;
    setActionError('');
    try {
      await api.delete(`/lgas/${l.id}`);
      refetch();
    } catch (err) {
      setActionError(err instanceof ApiClientError ? err.message : 'Failed to delete LGA');
    }
  }

  const columns = [
    { key: 'name', header: 'LGA', sortable: true, render: (l: Lga) => <span className="font-medium">{l.name}</span> },
    { key: 'code', header: 'Code' },
    { key: 'state', header: 'State' },
    { key: 'region', header: 'Region' },
    { key: 'coverageTarget', header: 'Coverage', render: (l: Lga) => `${l.coverageTarget}%` },
    { key: 'isActive', header: 'Status', render: (l: Lga) => <StatusBadge status={l.isActive ? 'active' : 'inactive'} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (l: Lga) => (
        <div className="flex gap-1">
          <button
            className="p-1.5 rounded-md hover:bg-muted"
            onClick={(e) => { e.stopPropagation(); handleToggleActive(l); }}
            title={l.isActive ? 'Deactivate' : 'Activate'}
          >
            <Power className={`w-4 h-4 ${l.isActive ? 'text-green-600' : 'text-muted-foreground'}`} />
          </button>
          <button
            className="p-1.5 rounded-md hover:bg-accent/10 text-accent"
            onClick={(e) => { e.stopPropagation(); handleDelete(l); }}
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
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Local Government Areas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage LGAs and wards across Benue State</p>
        </div>
        <Button onClick={() => { setShowForm((s) => !s); resetForm(); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add LGA
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Otukpo" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Code</label>
                <input className={inputCls} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. OTK" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input className={inputCls} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Region</label>
                <input className={inputCls} value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Coverage Target (%)</label>
                <input type="number" min="0" max="100" className={inputCls} value={form.coverageTarget} onChange={(e) => setForm({ ...form, coverageTarget: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Latitude</label>
                <input className={inputCls} value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Longitude</label>
                <input className={inputCls} value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Radius (km)</label>
                <input type="number" min="0" step="0.5" className={inputCls} value={form.radius} onChange={(e) => setForm({ ...form, radius: e.target.value })} placeholder="Optional" />
              </div>
              <div className="md:col-span-4 flex gap-2">
                <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create LGA'}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
              </div>
            </form>
            {formError && <p className="text-sm text-accent mt-3">{formError}</p>}
          </CardContent>
        </Card>
      )}

      {actionError && <p className="text-sm text-accent mb-4 p-3 rounded-md bg-accent/10">{actionError}</p>}
      {error && <p className="text-sm text-accent mb-4 p-3 rounded-md bg-accent/10">{error}</p>}

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
