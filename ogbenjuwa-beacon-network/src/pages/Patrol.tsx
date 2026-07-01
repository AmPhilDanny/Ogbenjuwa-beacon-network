import { useState, useEffect } from 'react';
import { MapPin, Users, Radio, Shield, Circle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { PatrolMap } from '@/components/patrol/PatrolMap';
import { cn } from '@/lib/utils';

interface PatrolMember {
  id: number;
  name: string;
  role: string;
  lat: number;
  lng: number;
  active: boolean;
  lastSeen: string;
}

interface Resource {
  type: string;
  name: string;
  lga: string;
  lat: number;
  lng: number;
  capacity: number;
  occupied: number;
}

interface Village {
  name: string;
  lga: string;
  lat: number;
  lng: number;
  pop: number;
}

const MEMBER_COLORS: Record<number, string> = {
  1: '#2D9B57',
  2: '#3B82F6',
  3: '#8B5CF6',
  4: '#F59E0B',
  5: '#EF4444',
};

export default function Patrol() {
  const [mapView, setMapView] = useState<'patrol' | 'coverage' | 'resources'>('patrol');
  const [members, setMembers] = useState<PatrolMember[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ data: any[] }>('/patrols/teams').catch(() => ({ data: [] })),
      api.get<{ data: Village[] }>('/villages').catch(() => ({ data: [] })),
      api.get<{ data: Resource[] }>('/resources').catch(() => ({ data: [] })),
    ]).then(([membersRes, villagesRes, resourcesRes]) => {
      setMembers(membersRes.data as any);
      setVillages(villagesRes.data);
      setResources(resourcesRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const activeMembers = members.filter(m => m.active);
  const totalCoverage = villages.length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Patrol Map</h1>
        <p className="text-muted-foreground">Live patrol tracking for Otukpo and surrounding wards.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Patrols</CardTitle>
            <Radio className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{loading ? '...' : activeMembers.length}</div>
            <p className="text-xs text-muted-foreground">of {members.length} members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Coverage Zones</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : totalCoverage}</div>
            <p className="text-xs text-muted-foreground">Idoma villages monitored</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
            <MapPin className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : resources.length}</div>
            <p className="text-xs text-muted-foreground">Active facilities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Response Ready</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">4.2m</div>
            <p className="text-xs text-muted-foreground">Avg. response time</p>
          </CardContent>
        </Card>
      </div>

      {/* Map + Status Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Live Map</CardTitle>
                <div className="flex gap-1">
                  {(['patrol', 'coverage', 'resources'] as const).map((view) => (
                    <Badge
                      key={view}
                      variant={mapView === view ? 'default' : 'outline'}
                      className="cursor-pointer capitalize"
                      onClick={() => setMapView(view)}
                    >
                      {view}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[500px] w-full">
                <PatrolMap villages={villages} members={members} resources={resources} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patrol Status Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Radio className="h-4 w-4 text-green-500" />
                Patrol Status
              </CardTitle>
              <CardDescription>Active patrol members in the field</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Loading patrol data...</p>
              ) : members.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No patrol data available</p>
              ) : (
                members.map((m, idx) => (
                  <div
                    key={m.id}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                      m.active ? 'bg-card border-border' : 'bg-muted/30 border-dashed opacity-60'
                    )}
                  >
                    <div
                      className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: MEMBER_COLORS[m.id] || MEMBER_COLORS[idx + 1] || '#6B7280' }}
                    >
                      {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.role}</p>
                      <p className="text-xs flex items-center gap-1 mt-0.5">
                        <Circle
                          className={cn('h-2 w-2 fill-current', m.active ? 'text-green-500' : 'text-gray-400')}
                        />
                        {m.active ? 'Active' : 'Offline'} · {m.lastSeen}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Map Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#2D9B57]" />
                <span>Village / Settlement</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-white bg-blue-500" />
                <span>Patrol Member (Active)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-dashed border-gray-400 bg-gray-300 opacity-60" />
                <span>Patrol Member (Inactive)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full border-2 border-green-500 bg-green-500/20" />
                <span>Coverage Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🏥</span>
                <span>Resource Facility</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
