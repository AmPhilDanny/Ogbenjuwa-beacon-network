import { useState, useMemo, type FormEvent } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import StatusBadge from '../../components/StatusBadge';
import { useApi } from '../../hooks/useApi';
import { api, ApiClientError } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Plus, Pencil, Trash2, X, ShieldCheck } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  label: string;
  description?: string | null;
  permissionKeys: string[];
  isActive: boolean;
  createdAt: string;
}

const inputCls =
  'w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring';

interface FormState {
  name: string;
  label: string;
  description: string;
  permissionKeys: string;
}

const EMPTY_FORM: FormState = { name: '', label: '', description: '', permissionKeys: '' };

export default function RolesPage() {
  const { data, loading, refetch } = useApi<{ data: Role[] }>('/roles');
  const [editing, setEditing] = useState<Role | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const roles = data?.data || [];

  const permissionOptions = useMemo(() => {
    const seen = new Set<string>();
    roles.forEach((r) => (r.permissionKeys || []).forEach((k) => seen.add(k)));
    return [...seen].sort();
  }, [roles]);

  function startCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
  }

  function startEdit(r: Role) {
    setEditing(r);
    setForm({
      name: r.name,
      label: r.label,
      description: r.description || '',
      permissionKeys: (r.permissionKeys || []).join('\n'),
    });
    setError('');
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        label: form.label.trim(),
        description: form.description.trim() || undefined,
        permissionKeys: form.permissionKeys.split('\n').map((s) => s.trim()).filter(Boolean),
      };
      if (editing) {
        await api.put(`/roles/${editing.id}`, body);
      } else {
        await api.post('/roles', body);
      }
      setEditing(null);
      setForm(EMPTY_FORM);
      refetch();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to save role');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(r: Role) {
    if (!window.confirm(`Delete role "${r.label}"? Users with this role will lose its permissions.`)) return;
    try {
      await api.delete(`/roles/${r.id}`);
      refetch();
    } catch (err) {
      window.alert(err instanceof ApiClientError ? err.message : 'Failed to delete role');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Roles</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Define access roles for the beacon network</p>
        </div>
        <Button onClick={startCreate}>
          <Plus className="w-4 h-4 mr-1" /> New Role
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading roles...</p>
          ) : roles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No roles defined yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Label</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Permissions</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-primary" />
                          {r.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">{r.label}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">
                          {(r.permissionKeys || []).length} permission(s)
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.isActive ? 'active' : 'inactive'} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(r.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            className="p-1.5 rounded-md hover:bg-accent/10 text-accent"
                            title="Edit"
                            onClick={() => startEdit(r)}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"
                            title="Delete"
                            onClick={() => handleDelete(r)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {editing !== null || form.name !== '' || form.label !== '' ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editing ? `Edit Role: ${editing.name}` : 'New Role'}</CardTitle>
            <button className="p-1 rounded-md hover:bg-muted" onClick={() => { setEditing(null); setForm(EMPTY_FORM); setError(''); }}>
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent>
            {error && <p className="text-sm text-accent mb-4 p-3 rounded-md bg-accent/10">{error}</p>}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Role Key (e.g. ward_lead)</label>
                  <input
                    className={inputCls}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    pattern="[a-z0-9_]+"
                    title="Lowercase letters, numbers, underscores"
                    disabled={!!editing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Label (e.g. Ward Lead)</label>
                  <input
                    className={inputCls}
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  className={inputCls}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What this role is responsible for"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Permission Keys (one per line, e.g. alerts:read)
                </label>
                <textarea
                  className={`${inputCls} font-mono text-xs h-36`}
                  value={form.permissionKeys}
                  onChange={(e) => setForm({ ...form, permissionKeys: e.target.value })}
                  placeholder="alerts:read&#10;incidents:read&#10;patrols:read"
                />
                {permissionOptions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {permissionOptions.map((k) => (
                      <button
                        key={k}
                        type="button"
                        className="text-[11px] px-2 py-0.5 rounded-md border border-border bg-muted/50 hover:bg-muted font-mono"
                        onClick={() => setForm((f) => ({ ...f, permissionKeys: f.permissionKeys ? `${f.permissionKeys}\n${k}` : k }))}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Role'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setEditing(null); setForm(EMPTY_FORM); setError(''); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}