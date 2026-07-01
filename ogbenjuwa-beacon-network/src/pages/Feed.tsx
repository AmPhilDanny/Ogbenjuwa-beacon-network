import React, { useState } from 'react';
import { Rss, Filter, Search, AlertTriangle, Shield, Info, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useIncidents } from '@/hooks/useIncidents';
import { Link } from 'react-router-dom';

export default function Feed() {
  const { incidents, loading } = useIncidents();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredIncidents = incidents.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterType || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Community Feed</h1>
          <p className="text-muted-foreground">Stay updated with safety alerts in Otukpo Ward 1.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={filterType === null ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilterType(null)}
          >
            All
          </Button>
          <Button 
            variant={filterType === 'alert' ? "destructive" : "outline"} 
            size="sm" 
            onClick={() => setFilterType('alert')}
          >
            Alerts
          </Button>
          <Button 
            variant={filterType === 'announcement' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilterType('announcement')}
          >
            Updates
          </Button>
          <Button size="sm" className="gap-2" asChild>
            <Link to="/report">
              <AlertTriangle className="h-4 w-4" />
              Post Update
            </Link>
          </Button>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          className="pl-9" 
          placeholder="Search incidents, announcements..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Rss className="h-12 w-12 mb-4 opacity-20" />
            <p>No incidents found matching your criteria.</p>
          </div>
        ) : (
          filteredIncidents.map((item) => (
            <Card key={item.id} className={cn(
              "transition-all hover:shadow-md",
              item.severity === 'high' ? "border-l-4 border-l-destructive" : 
              item.severity === 'medium' ? "border-l-4 border-l-amber-500" : ""
            )}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <Badge variant={item.type === 'alert' ? 'destructive' : 'secondary'}>
                        {item.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{item.author}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </span>
                      <span>•</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{item.content}</p>
                <div className="mt-4 flex gap-2">
                  <Button variant="ghost" size="sm" className="text-xs h-8">Acknowledge</Button>
                  <Button variant="ghost" size="sm" className="text-xs h-8">Comment</Button>
                  <Button variant="ghost" size="sm" className="text-xs h-8">Share</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
