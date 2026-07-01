import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { api } from '../lib/api';
import { ScrollText, ChevronDown, ChevronUp, X } from 'lucide-react';

interface AuditEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: unknown;
  ipAddress: string;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-purple-100 text-purple-700',
  LOGOUT: 'bg-gray-100 text-gray-700',
};

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState('');
  const [filterResource, setFilterResource] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [page, filterAction, filterResource, dateFrom, dateTo]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (filterAction) params.set('action', filterAction);
      if (filterResource) params.set('resource', filterResource);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      const res = await api.get<{ data: AuditEntry[] }>(`/audit-logs?${params}`);
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track all administrative actions</p>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Action</label>
              <select
                value={filterAction}
                onChange={e => { setFilterAction(e.target.value); setPage(1); }}
                className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
              >
                <option value="">All Actions</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="LOGIN">LOGIN</option>
                <option value="LOGOUT">LOGOUT</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Resource</label>
              <select
                value={filterResource}
                onChange={e => { setFilterResource(e.target.value); setPage(1); }}
                className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
              >
                <option value="">All Resources</option>
                <option value="user">User</option>
                <option value="alert">Alert</option>
                <option value="incident">Incident</option>
                <option value="patrol">Patrol</option>
                <option value="lga">LGA</option>
                <option value="settings">Settings</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1); }}
                className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
              />
            </div>
            {(filterAction || filterResource || dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" onClick={() => { setFilterAction(''); setFilterResource(''); setDateFrom(''); setDateTo(''); setPage(1); }} className="mt-4">
                <X className="w-3 h-3 mr-1" /> Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading audit logs...</p>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <ScrollText className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No audit logs found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map(log => (
            <Card key={log.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700'}`}>
                      {log.action}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm truncate">
                        <span className="font-medium">{log.resource}</span>
                        {log.resourceId && <span className="text-muted-foreground"> / {log.resourceId.substring(0, 8)}...</span>}
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        {new Date(log.createdAt).toLocaleString()} &middot; {log.ipAddress}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground font-mono">{log.userId.substring(0, 8)}...</span>
                    <button
                      onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                      className="p-1 rounded hover:bg-muted"
                    >
                      {expandedId === log.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                {expandedId === log.id && log.details && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto max-h-48">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {logs.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground px-2">Page {page}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
