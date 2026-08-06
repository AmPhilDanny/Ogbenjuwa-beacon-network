import React, { useEffect, useState } from 'react';
import { Phone, MapPin, ExternalLink, Shield, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface Resource {
  id: string;
  type: string;
  name: string;
  lgaId?: string;
  lga?: string;
  village?: string;
  phone?: string;
  capacity?: number;
  occupied?: number;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  village?: string | null;
  lgaId?: string | null;
  lga?: string;
}

interface LgaRow {
  id: string;
  name: string;
}

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ data: Resource[] }>('/resources').catch(() => ({ data: [] })),
      api.get<{ data: Contact[] }>('/contacts').catch(() => ({ data: [] })),
      api.get<{ data: LgaRow[] }>('/lgas').catch(() => ({ data: [] })),
    ]).then(([resRes, contactsRes, lgasRes]) => {
      const lgaById = new Map<string, string>(lgasRes.data.map((l): [string, string] => [l.id, l.name]));
      setResources(resRes.data.map((r) => ({ ...r, lga: r.lgaId ? lgaById.get(r.lgaId) ?? undefined : r.lga })));
      setContacts(
        contactsRes.data.map((c) => ({
          ...c,
          lga: c.lgaId ? lgaById.get(c.lgaId) ?? undefined : undefined,
        }))
      );
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Emergency Resources</h1>
        <p className="text-muted-foreground">Critical contacts and locations at your fingertips.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {resources.length > 0 && (
          <Card className="md:col-span-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Available Resources
              </CardTitle>
              <CardDescription>Real-time resource availability from the command center.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {resources.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-semibold text-sm">{r.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{r.type}</p>
                      {r.lga && <p className="text-xs text-muted-foreground">{r.lga}</p>}
                    </div>
                    <Badge variant={r.occupied !== undefined && r.capacity ? (r.occupied / r.capacity) > 0.8 ? 'destructive' : 'default' : 'secondary'}>
                      {r.occupied !== undefined && r.capacity ? `${r.capacity - r.occupied} available` : 'Available'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && contacts.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Emergency Contacts
              </CardTitle>
              <CardDescription>Verified community safety contacts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contacts.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="font-semibold">{item.name}</p>
                    {(item.lga || item.village) && (
                      <p className="text-xs text-muted-foreground">
                        {[item.village, item.lga].filter(Boolean).join(', ')}
                      </p>
                    )}
                    <p className="text-sm font-mono text-primary font-bold">{item.phone}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-2"
                    asChild
                  >
                    <a href={`tel:${item.phone}`}>
                      <Phone className="h-4 w-4" />
                      Call
                    </a>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="md:col-span-2">
            <CardContent className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              Loading emergency resources...
            </CardContent>
          </Card>
        )}

        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle>Nearest Safe Haven</CardTitle>
            <CardDescription className="text-primary-foreground/70">Designated community assembly point.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-10 w-10 shrink-0 opacity-80" />
              <div>
                <p className="font-bold">Otukpo Local Government Secretariat</p>
                <p className="text-sm opacity-90">1.2km away • Approx 15 min walk</p>
              </div>
            </div>
            <Button variant="secondary" className="w-full gap-2" asChild>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Otukpo+Local+Government+Secretariat"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Get Directions
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}