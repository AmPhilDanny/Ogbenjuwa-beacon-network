import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { api } from '../lib/api';
import { Key, Plus, Trash2, Copy, Check, X, Eye, EyeOff } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  layer: string;
  permissions: string[];
  isActive: boolean;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface CreatedKey extends ApiKey {
  fullKey: string;
}

const LAYER_LABELS: Record<string, string> = {
  layer1: 'Beacon Network',
  layer2: 'Citizen Portal',
  external: 'External',
};

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createdKey, setCreatedKey] = useState<CreatedKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: '', layer: 'layer1' as const, permissions: '', expiresAt: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: ApiKey[] }>('/api-keys');
      setKeys(res.data);
    } catch (err) {
      console.error('Failed to fetch API keys', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const permissions = form.permissions ? form.permissions.split(',').map(s => s.trim()).filter(Boolean) : [];
      const body: Record<string, unknown> = { name: form.name, layer: form.layer, permissions };
      if (form.expiresAt) body.expiresAt = new Date(form.expiresAt).toISOString();

      const res = await api.post<CreatedKey>('/api-keys', body);
      setCreatedKey(res);
      setShowCreate(false);
      setForm({ name: '', layer: 'layer1', permissions: '', expiresAt: '' });
      fetchKeys();
    } catch (err) {
      console.error('Failed to create API key', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (key: ApiKey) => {
    try {
      await api.put(`/api-keys/${key.id}`, { isActive: !key.isActive });
      setKeys(prev => prev.map(k => k.id === key.id ? { ...k, isActive: !k.isActive } : k));
    } catch (err) {
      console.error('Failed to toggle key', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Revoke this API key? This cannot be undone.')) return;
    try {
      await api.delete(`/api-keys/${id}`);
      setKeys(prev => prev.filter(k => k.id !== id));
    } catch (err) {
      console.error('Failed to delete key', err);
    }
  };

  const handleCopy = () => {
    if (createdKey?.fullKey) {
      navigator.clipboard.writeText(createdKey.fullKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold">API Keys</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage API keys for Beacon Network and Citizen Portal integration</p>
      </div>

      {/* Created key banner */}
      {createdKey && (
        <Card className="mb-4 border-green-200 bg-green-50">
          <CardContent className="py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 mb-1">API Key Created — Copy it now. You won't see it again!</p>
                <div className="flex items-center gap-2 bg-white rounded-lg border border-green-200 p-2">
                  <code className="flex-1 text-sm font-mono truncate">{createdKey.fullKey}</code>
                  <button onClick={handleCopy} className="p-1.5 rounded hover:bg-green-100 shrink-0" title="Copy">
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copied && <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>}
              </div>
              <button onClick={() => setCreatedKey(null)} className="p-1 rounded hover:bg-green-200 shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create button / form */}
      {!showCreate ? (
        <Button onClick={() => setShowCreate(true)} className="mb-4">
          <Plus className="w-4 h-4 mr-2" /> Create API Key
        </Button>
      ) : (
        <Card className="mb-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>New API Key</CardTitle>
            <button onClick={() => setShowCreate(false)} className="p-1 rounded hover:bg-muted">
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Key Name</label>
              <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., Beacon Network Production" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Layer</label>
              <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.layer} onChange={e => setForm(p => ({ ...p, layer: e.target.value as any }))}>
                <option value="layer1">Beacon Network (Layer 1)</option>
                <option value="layer2">Citizen Portal (Layer 2)</option>
                <option value="external">External / Third-party</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Permissions <span className="text-muted-foreground font-normal">(comma-separated)</span></label>
              <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., alerts:read, alerts:write" value={form.permissions} onChange={e => setForm(p => ({ ...p, permissions: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Expires At <span className="text-muted-foreground font-normal">(optional)</span></label>
              <input type="date" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={saving || !form.name}>
                {saving ? 'Creating...' : 'Generate Key'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keys list */}
      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading API keys...</p>
      ) : keys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Key className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No API keys created yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {keys.map(k => (
            <Card key={k.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{k.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary">
                        {LAYER_LABELS[k.layer] || k.layer}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        k.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {k.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-mono">{k.keyPrefix}...</span>
                      {k.lastUsedAt && <span>Last used: {new Date(k.lastUsedAt).toLocaleDateString()}</span>}
                      {k.expiresAt && <span>Expires: {new Date(k.expiresAt).toLocaleDateString()}</span>}
                      <span>Created: {new Date(k.createdAt).toLocaleDateString()}</span>
                    </div>
                    {k.permissions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {k.permissions.map(p => (
                          <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{p}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleToggleActive(k)} className="p-1.5 rounded hover:bg-muted" title={k.isActive ? 'Deactivate' : 'Activate'}>
                      {k.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => handleDelete(k.id)} className="p-1.5 rounded hover:bg-muted text-red-500" title="Revoke">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
