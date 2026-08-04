import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import StatusBadge from '../../components/StatusBadge';
import { Button } from '../../components/ui/button';
import { useApi } from '../../hooks/useApi';
import { api, ApiClientError } from '../../lib/api';
import { formatDate, formatRelativeTime } from '../../lib/utils';
import type { PatrolTeam, PatrolMember, PatrolShift, User } from '../../lib/types';
import { Pencil, Power, Trash2, UserPlus, UserMinus, Plus } from 'lucide-react';

const inputCls =
  'w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring';

const SHIFT_STATUSES: { status: PatrolShift['status']; label: string }[] = [
  { status: 'scheduled', label: 'Scheduled' },
  { status: 'active', label: 'Active' },
  { status: 'completed', label: 'Completed' },
  { status: 'cancelled', label: 'Cancelled' },
];

export default function PatrolDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: team, loading, refetch } = useApi<PatrolTeam>(`/patrols/${id}`);
  const { data: usersData } = useApi<{ data: User[] }>('/users');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [newMemberId, setNewMemberId] = useState('');
  const [shiftForm, setShiftForm] = useState({ date: '', startTime: '', endTime: '', notes: '' });
  const [saving, setSaving] = useState(false);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!team) return <p className="text-muted-foreground">Patrol team not found</p>;

  const currentTeam = team;
  const members = currentTeam.members || [];
  const shifts = currentTeam.shifts || [];
  const memberIds = new Set(members.map((m) => m.userId));
  const availableUsers = (usersData?.data || []).filter((u) => !memberIds.has(u.id) && u.isActive);

  async function handleToggleActive() {
    setError('');
    setNotice('');
    try {
      await api.put(`/patrols/${currentTeam.id}`, { isActive: !currentTeam.isActive });
      setNotice(currentTeam.isActive ? 'Team deactivated' : 'Team activated');
      refetch();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to update team');
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete patrol team "${currentTeam.name}"? This also removes its shifts and members.`)) return;
    setError('');
    try {
      await api.delete(`/patrols/${currentTeam.id}`);
      navigate('/patrols');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to delete team');
    }
  }

  async function handleAddMember(e: FormEvent) {
    e.preventDefault();
    if (!newMemberId) return;
    setError('');
    setNotice('');
    setSaving(true);
    try {
      await api.post('/patrols/members', { teamId: currentTeam.id, userId: newMemberId });
      setNewMemberId('');
      setNotice('Member added');
      refetch();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to add member');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveMember(m: PatrolMember) {
    if (!window.confirm(`Remove this member from the team?`)) return;
    setError('');
    setNotice('');
    try {
      await api.delete(`/patrols/members/${m.id}`);
      setNotice('Member removed');
      refetch();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to remove member');
    }
  }

  async function handleCreateShift(e: FormEvent) {
    e.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      await api.post('/patrols/shifts', { teamId: currentTeam.id, ...shiftForm });
      setShiftForm({ date: '', startTime: '', endTime: '', notes: '' });
      setNotice('Shift scheduled');
      refetch();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to create shift');
    } finally {
      setSaving(false);
    }
  }

  async function handleShiftStatus(s: PatrolShift, status: PatrolShift['status']) {
    setError('');
    setNotice('');
    try {
      await api.put(`/patrols/shifts/${s.id}`, { status });
      setNotice(`Shift marked ${status}`);
      refetch();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to update shift');
    }
  }

  async function handleDeleteShift(s: PatrolShift) {
    if (!window.confirm(`Delete this shift?`)) return;
    setError('');
    setNotice('');
    try {
      await api.delete(`/patrols/shifts/${s.id}`);
      setNotice('Shift deleted');
      refetch();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to delete shift');
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">{currentTeam.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {[currentTeam.lgaName, currentTeam.wardName, currentTeam.villageName].filter(Boolean).join(' / ')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate(`/patrols/${currentTeam.id}/edit`)}>
            <Pencil className="w-4 h-4 mr-1.5" /> Edit
          </Button>
          <Button size="sm" variant={currentTeam.isActive ? 'outline' : 'primary'} onClick={handleToggleActive}>
            <Power className="w-4 h-4 mr-1.5" />
            {currentTeam.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button size="sm" variant="danger" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-1.5" /> Delete
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-accent mb-4 p-3 rounded-md bg-accent/10">{error}</p>}
      {notice && <p className="text-sm text-green-600 mb-4 p-3 rounded-md bg-green-600/10">{notice}</p>}

      <Card className="mb-4">
        <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-muted-foreground">Leader</dt><dd className="font-medium">{currentTeam.leaderName || '-'}</dd></div>
            <div><dt className="text-muted-foreground">Members</dt><dd className="font-medium">{members.length}</dd></div>
            <div><dt className="text-muted-foreground">Status</dt><dd><StatusBadge status={currentTeam.isActive ? 'active' : 'inactive'} /></dd></div>
            <div><dt className="text-muted-foreground">Created</dt><dd className="font-medium">{currentTeam.createdAt ? formatDate(currentTeam.createdAt) : '-'}</dd></div>
          </dl>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader><CardTitle>Members ({members.length})</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleAddMember} className="flex gap-2 mb-4">
            <select className={inputCls} value={newMemberId} onChange={(e) => setNewMemberId(e.target.value)}>
              <option value="">Add member...</option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
            <Button type="submit" disabled={saving || !newMemberId}>
              <UserPlus className="w-4 h-4 mr-1" /> Add
            </Button>
          </form>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet</p>
          ) : (
            <ul className="divide-y">
              {members.map((m) => (
                <li key={m.id} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{m.name || m.userId}</p>
                    <p className="text-xs text-muted-foreground">{m.role} · joined {formatRelativeTime(m.joinedAt)}</p>
                  </div>
                  <button
                    className="p-1.5 rounded-md hover:bg-accent/10 text-accent"
                    onClick={() => handleRemoveMember(m)}
                    title="Remove member"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader><CardTitle>Shifts</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreateShift} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" className={inputCls} value={shiftForm.date} onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start</label>
              <input type="time" className={inputCls} value={shiftForm.startTime} onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End</label>
              <input type="time" className={inputCls} value={shiftForm.endTime} onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <input className={inputCls} value={shiftForm.notes} onChange={(e) => setShiftForm({ ...shiftForm, notes: e.target.value })} />
            </div>
            <div className="md:col-span-4">
              <Button type="submit" disabled={saving}>
                <Plus className="w-4 h-4 mr-1" /> Schedule Shift
              </Button>
            </div>
          </form>

          {shifts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No shifts scheduled</p>
          ) : (
            <ul className="divide-y">
              {shifts.map((s) => (
                <li key={s.id} className="py-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-medium text-sm">{s.date} · {s.startTime}–{s.endTime}</p>
                      {s.notes && <p className="text-xs text-muted-foreground mt-0.5">{s.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={s.status} />
                      {SHIFT_STATUSES.map((st) => (
                        st.status !== s.status && (
                          <Button key={st.status} size="sm" variant="outline" onClick={() => handleShiftStatus(s, st.status)}>
                            {st.label}
                          </Button>
                        )
                      ))}
                      <button
                        className="p-1.5 rounded-md hover:bg-accent/10 text-accent"
                        onClick={() => handleDeleteShift(s)}
                        title="Delete shift"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
