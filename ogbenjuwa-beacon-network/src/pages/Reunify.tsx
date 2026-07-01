import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Users, Home, MapPin, Eye, Shield, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { fuzzyScore, generateReunionCode } from '@/lib/utils';
import type { FamilyEntry, RegistryStatus } from '@/lib/types';

// ─── Status config ───────────────────────────────────────────────────────
const STATUS_CONFIG: Record<RegistryStatus, { label: string; color: string; bg: string; border: string }> = {
  at_camp:   { label: 'At Camp',    color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950/20',  border: 'border-green-500/30' },
  searching: { label: 'Searching',  color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-950/20',  border: 'border-amber-500/30' },
  reunified: { label: 'Reunified',  color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950/20',    border: 'border-blue-500/30' },
};

// ─── Stats ───────────────────────────────────────────────────────────────
function statsFrom(registry: FamilyEntry[]) {
  const total = registry.length;
  const reunited = registry.filter((e) => e.status === 'reunified').length;
  const searching = registry.filter((e) => e.status === 'searching').length;
  const atCamp = registry.filter((e) => e.status === 'at_camp').length;
  return { total, reunited, searching, atCamp };
}

// ─── Reunify Page ────────────────────────────────────────────────────────
export default function Reunify() {
  const [registry, setRegistry] = useState<FamilyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [ageMin, setAgeMin] = useState(0);
  const [ageMax, setAgeMax] = useState(120);
  const [lgaFilter, setLgaFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [reunionCode, setReunionCode] = useState('');
  const [reunionName, setReunionName] = useState('');

  useEffect(() => {
    api.get<{ data: FamilyEntry[] }>('/family')
      .then(res => setRegistry(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Unique LGAs from registry
  const uniqueLgas = useMemo(
    () => [...new Set(registry.map((e) => e.lga))],
    [registry],
  );

  const stats = useMemo(() => statsFrom(registry), [registry]);

  // ─── Search logic ────────────────────────────────────────────────────────
  const results = useMemo(() => {
    let results = [...registry];

    if (lgaFilter && lgaFilter !== 'all') {
      results = results.filter((e) => e.lga === lgaFilter);
    }
    if (statusFilter && statusFilter !== 'all') {
      results = results.filter((e) => e.status === statusFilter);
    }
    results = results.filter((e) => e.age >= ageMin && e.age <= ageMax);

    if (query.trim()) {
      const scored = results.map((e) => ({
        entry: e,
        score: fuzzyScore(query, e.name),
      }));
      scored.sort((a, b) => b.score - a.score);
      results = scored.filter((r) => r.score >= 0.4).map((r) => r.entry);
    }

    const statusOrder: Record<RegistryStatus, number> = { at_camp: 0, searching: 1, reunified: 2 };
    results.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    return results;
  }, [query, ageMin, ageMax, lgaFilter, statusFilter, registry]);

  const handleGenerateCode = useCallback((name: string) => {
    setReunionCode(generateReunionCode());
    setReunionName(name);
    setShowModal(true);
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Family Reunification</h1>
        <p className="text-muted-foreground">
          Search for missing persons in the Idoma region
        </p>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="h-5 w-5 text-primary shrink-0" />
            <div>
              <div className="text-xl font-bold">{loading ? '...' : stats.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Registered</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Home className="h-5 w-5 text-green-500 shrink-0" />
            <div>
              <div className="text-xl font-bold text-green-500">{stats.reunited}</div>
              <p className="text-xs text-muted-foreground">Reunited</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Search className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <div className="text-xl font-bold text-amber-500">{stats.searching}</div>
              <p className="text-xs text-muted-foreground">Searching</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <MapPin className="h-5 w-5 text-blue-500 shrink-0" />
            <div>
              <div className="text-xl font-bold text-blue-500">{stats.atCamp}</div>
              <p className="text-xs text-muted-foreground">At Camp</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Registry
          </CardTitle>
          <CardDescription>
            Find missing persons by name, location, or status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name..."
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <div className="w-28">
                <Input
                  type="number"
                  min={0}
                  max={120}
                  value={ageMin}
                  onChange={(e) => setAgeMin(Number(e.target.value))}
                  placeholder="Min age"
                />
              </div>
              <span className="flex items-center text-muted-foreground">—</span>
              <div className="w-28">
                <Input
                  type="number"
                  min={0}
                  max={120}
                  value={ageMax}
                  onChange={(e) => setAgeMax(Number(e.target.value))}
                  placeholder="Max age"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Select value={lgaFilter} onValueChange={setLgaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All LGAs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All LGAs</SelectItem>
                  {uniqueLgas.map((lga) => (
                    <SelectItem key={lga} value={lga}>{lga}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="at_camp">At Camp</SelectItem>
                  <SelectItem value="searching">Searching</SelectItem>
                  <SelectItem value="reunified">Reunified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            Or send SMS:{' '}
            <span className="font-mono">
              FIND {query || '[name]'} {ageMin || '[min age]'} {lgaFilter !== 'all' ? lgaFilter : '[LGA]'}
            </span>{' '}
            to <span className="font-mono">347</span>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">
            {loading
              ? 'Loading registry...'
              : results.length === 0
                ? 'No matching records found.'
                : `${results.length} record${results.length > 1 ? 's' : ''} found`}
          </p>
        </div>

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((entry) => {
              const config = STATUS_CONFIG[entry.status];
              const showCamp = entry.status === 'at_camp' && entry.camp;

              return (
                <Card
                  key={entry.id}
                  className={`border-2 ${config.border} ${config.bg} transition-all hover:shadow-md`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{entry.name}</CardTitle>
                        <CardDescription>
                          {entry.gender === 'M' ? 'Male' : 'Female'}, {entry.age} yrs · {entry.lga} · {entry.village}
                        </CardDescription>
                      </div>
                      <Badge className={`${config.color} capitalize`}>
                        {config.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span>ID: {entry.id}</span>
                      <span>Registered: {entry.registeredAt}</span>
                    </div>

                    {showCamp && (
                      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 mb-3">
                        <MapPin className="h-3 w-3" />
                        <span>Located at: {entry.camp}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button size="sm" variant="default" onClick={() => handleGenerateCode(entry.name)}>
                        Send Reunion Code
                      </Button>
                      {entry.status === 'searching' && (
                        <Button size="sm" variant="outline">
                          Connect to Match
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Privacy notice */}
      <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10">
        <CardContent className="flex items-start gap-3 p-4">
          <Shield className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground">Privacy Protection:</strong>{' '}
            Search results never display full home addresses, GPS coordinates, or phone numbers.
            Reunification is coordinated via secure reunion codes only.
            Camp locations are shown only for confirmed matches.
          </div>
        </CardContent>
      </Card>

      {/* Reunion Code Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Reunion Code Generated
            </DialogTitle>
            <DialogDescription>
              Share this code with {reunionName} to coordinate reunification.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-6">
            <div className="text-4xl font-mono font-bold tracking-widest text-primary bg-primary/10 px-8 py-4 rounded-xl">
              {reunionCode}
            </div>
            <div className="space-y-2 text-sm text-muted-foreground w-full">
              <h4 className="font-semibold text-foreground">Instructions:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Provide this code to the registrant's family member.</li>
                <li>The registrant will present the code at their camp or community building.</li>
                <li>Verify identity by matching the code with our records.</li>
                <li>Complete reunification at the designated meeting point.</li>
              </ol>
              <p className="text-xs mt-3 text-amber-600 dark:text-amber-400">
                ⚠️ Never share this code via unsecured channels. Meet at a named community building — never a private location.
              </p>
            </div>
          </div>

          <Button variant="outline" onClick={() => setShowModal(false)} className="w-full">
            <X className="h-4 w-4 mr-2" /> Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
