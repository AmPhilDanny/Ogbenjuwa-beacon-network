import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Power, Trash2, Pencil, Radio, Users, MapPin, CalendarClock } from 'lucide-react';
import DataTable from '../../components/DataTable';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import PatrolLiveMap from '../../components/PatrolLiveMap';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useApi } from '../../hooks/useApi';
import { api, ApiClientError } from '../../lib/api';
import type { PatrolTeam, PatrolCheckin, Lga, Ward, Village } from '../../lib/types';

const inputCls =
  'px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring';

export default function PatrolList() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useApi<{ data: PatrolTeam[] }>('/patrols');
  const { data: liveData } = useApi<{ data: PatrolCheckin[] }>('/patrols/checkins/live');
  const { data: lgasData } = useApi<{ data: Lga[] }>('/lgas');

  const [wards, setWards] = useState<Ward[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [filters, setFilters] = useState({ lgaId: '', wardId: '', villageId: '' });
  const [actionError, setActionError] = useState('');

  const lgas = lgasData?.data || [];
  const teams = data?.data || [];
  const checkins = liveData?.data || [];

  // Cascade: when LGA changes, reload wards + villages
  useEffect(() => {
    const lgaId = filters.lgaId;
    setFilters((f) => ({ ...f, wardId: '', villageId: '' }));
    setVillages([]);
    if (!lgaId) { setWards([]); return; }
    api.get<{ data: Ward[] }>(`/lgas/${lgaId}/wards`).then((res) => setWards(res.data || [])).catch(() => setWards([]));
    api.get<{ data: Village[] }>(`/villages?lgaId=${lgaId}`).then((res) => setVillages(res.data || [])).catch(() => setVillages([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.lgaId]);

  // When ward changes, reload villages scoped to that ward
  useEffect(() => {
    if (!filters.wardId) return;
    api.get<{ data: Village[] }>(`/villages?wardId=${filters.wardId}`).then((res) => setVillages(res.data || [])).catch(() => setVillages([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.wardId]);

  const filteredTeams = teams.filter((t) => {
    if (filters.lgaId && t.lgaId !== filters.lgaId) return false;
    if (filters.wardId && t.wardId !== filters.wardId) return false;
    if (filters.villageId && t.villageId !== filters.villageId) return false;
    return true;
  });

  const activeShifts = teams.filter((t) => t.isActive);
  const liveMembers = checkins.length;

  async function handleToggleActive(t: PatrolTeam) {
    setActionError('');
    try {
      await api.put(`/patrols/${t.id}`, { isActive: !t.isActive });
      refetch();
    } catch (err) {
      setActionError(err instanceof ApiClientError ? err.message : 'Failed to update team');
    }
  }

  async function handleDelete(t: PatrolTeam) {
    if (!window.confirm(`Delete patrol team "${t.name}"? This also removes its shifts and members.`)) return;
    setActionError('');
    try {
      await api.delete(`/patrols/${t.id}`);
      refetch();
    } catch (err) {
      setActionError(err instanceof ApiClientError ? err.message : 'Failed to delete team');
    }
  }

  const columns = [
    { key: 'name', header: 'Team', sortable: true, render: (t: PatrolTeam) => <span className="font-medium">{t.name}</span> },
    { key: 'lgaName', header: 'LGA', render: (t: PatrolTeam) => t.lgaName || '-' },
    { key: 'area', header: 'Ward / Village', render: (t: PatrolTeam) => [t.wardName, t.villageName].filter(Boolean).join(' / ') || '-' },
    { key: 'leaderName', header: 'Leader', render: (t: PatrolTeam) => t.leaderName || '-' },
    { key: 'memberCount', header: 'Members', sortable: true },
    { key: 'isActive', header: 'Status', render: (t: PatrolTeam) => <StatusBadge status={t.isActive ? 'active' : 'inactive'} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (t: PatrolTeam) => (
        <div className="flex gap-1">
          <button
            className="p-1.5 rounded-md hover:bg-muted"
            onClick={(e) => { e.stopPropagation(); navigate(`/patrols/${t.id}/edit`); }}
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded-md hover:bg-muted"
            onClick={(e) => { e.stopPropagation(); handleToggleActive(t); }}
            title={t.isActive ? 'Deactivate' : 'Activate'}
          >
            <Power className={`w-4 h-4 ${t.isActive ? 'text-green-600' : 'text-muted-foreground'}`} />
          </button>
          <button
            className="p-1.5 rounded-md hover:bg-accent/10 text-accent"
            onClick={(e) => { e.stopPropagation(); handleDelete(t); }}
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
          <h1 className="text-2xl font-serif font-bold">Patrol Operations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage patrol teams, shifts and live positions</p>
        </div>
        <Button onClick={() => navigate('/patrols/new')}>
          <Plus className="w-4 h-4 mr-1" /> New Team
        </Button>
      </div>

      {error && <p className="text-sm text-accent mb-4 p-3 rounded-md bg-accent/10">{error}</p>}
      {actionError && <p className="text-sm text-accent mb-4 p-3 rounded-md bg-accent/10">{actionError}</p>}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatsCard icon={Radio} label="Active Teams" value={activeShifts.length} subtext={`of ${teams.length} total teams`} />
        <StatsCard icon={Users} label="Members in Field" value={liveMembers} subtext="check-ins in last 10 min" />
        <StatsCard icon={MapPin} label="LGAs Covered" value={new Set(teams.map((t) => t.lgaId)).size} subtext="with patrol teams" />
        <StatsCard icon={CalendarClock} label="Total Teams" value={teams.length} subtext="across all locations" />
      </div>

      {/* Live map */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Live Patrol Map</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[400px] w-full">
            <PatrolLiveMap checkins={checkins} lgas={lgas} />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Local Government</label>
              <select
                className={inputCls}
                value={filters.lgaId}
                onChange={(e) => setFilters({ ...filters, lgaId: e.target.value })}
              >
                <option value="">All LGAs</option>
                {lgas.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ward</label>
              <select
                className={inputCls}
                value={filters.wardId}
                onChange={(e) => setFilters({ ...filters, wardId: e.target.value })}
                disabled={!filters.lgaId}
              >
                <option value="">All wards</option>
                {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Village</label>
              <select
                className={inputCls}
                value={filters.villageId}
                onChange={(e) => setFilters({ ...filters, villageId: e.target.value })}
                disabled={!filters.wardId}
              >
                <option value="">All villages</option>
                {villages.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={filteredTeams}
        loading={loading}
        searchable
        searchKeys={['name', 'lgaName', 'leaderName']}
        onRowClick={(t) => navigate(`/patrols/${t.id}`)}
      />
    </div>
  );
}
