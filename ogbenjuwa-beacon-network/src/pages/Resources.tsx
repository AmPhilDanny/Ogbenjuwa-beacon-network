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
  lga?: string;
  phone?: string;
  capacity?: number;
  occupied?: number;
}

const emergencyContacts = [
  {
    category: 'Emergency Services',
    items: [
      { name: 'Police Emergency', phone: '112', desc: 'National emergency response line' },
      { name: 'Police (Otukpo Division)', phone: '0803 123 4567', desc: 'Otukpo Divisional Police Headquarters' },
      { name: 'Medical Emergency', phone: '199', desc: '24/7 emergency medical response' },
      { name: 'Fire Service', phone: '044 123456', desc: 'Benue State Fire Service' },
    ]
  },
  {
    category: 'Community Safety',
    items: [
      { name: 'Ward Lead - Ward 1', phone: '0812 345 6789', desc: 'Hon. Oche Amali (Chairman)' },
      { name: 'Cluster A Lead', phone: '0802 456 7890', desc: 'Mrs. Adah Agbo' },
      { name: 'Cluster B Lead', phone: '0703 567 8901', desc: 'Mr. Idoko John' },
    ]
  },
  {
    category: 'Medical Facilities',
    items: [
      { name: 'FMC Otukpo', phone: '044 234567', desc: 'Federal Medical Centre, 1.2km away' },
      { name: 'General Hospital', phone: '0805 123 4567', desc: 'Otukpo General Hospital, 2.5km away' },
      { name: 'St. Marys Hospital', phone: '0706 789 0123', desc: 'Private medical facility, 1.8km away' },
    ]
  }
];

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    api.get<{ data: Resource[] }>('/resources')
      .then(res => setResources(res.data || []))
      .catch(() => {});
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

        {emergencyContacts.map((group) => (
          <Card key={group.category}>
            <CardHeader>
              <CardTitle>{group.category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.items.map((item) => (
                <div key={item.name} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                    <p className="text-sm font-mono text-primary font-bold">{item.phone}</p>
                  </div>
                  <Button size="sm" variant="secondary" className="gap-2">
                    <Phone className="h-4 w-4" />
                    Call
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

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
            <Button variant="secondary" className="w-full gap-2">
              <ExternalLink className="h-4 w-4" />
              Get Directions
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
