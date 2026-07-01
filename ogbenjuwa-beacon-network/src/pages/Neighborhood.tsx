import React, { useEffect, useState } from 'react';
import { Users, Shield, MapPin, Phone, MessageSquare, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface Member {
  id: string;
  name: string;
  role: string;
  lga?: string;
  phone?: string;
}

export default function Neighborhood() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ data: Member[] }>('/users?role=vigilante').catch(() => ({ data: [] })),
      api.get<{ data: Member[] }>('/users?role=lga_coordinator').catch(() => ({ data: [] })),
      api.get<{ data: Member[] }>('/users?role=citizen').catch(() => ({ data: [] })),
    ]).then(([vigs, coords, citizens]) => {
      setMembers([...(vigs.data || []), ...(coords.data || []), ...(citizens.data || [])]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Neighborhood</h1>
        <p className="text-muted-foreground">Connect with members in your community.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Community Members
          </CardTitle>
          <CardDescription>{members.length} member(s) in your area.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading members...</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No members found.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {members.slice(0, 12).map((member) => (
                <div key={member.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{member.role?.replace('_', ' ') || 'member'}</p>
                    {member.lga && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {member.lga}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
