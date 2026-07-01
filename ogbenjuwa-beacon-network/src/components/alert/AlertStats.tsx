import { Phone, Radio, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AlertStatsProps {
  registered: number;
  lgaNodes: number;
  delivered: number;
  lastTime: string;
}

export function AlertStats({ registered, lgaNodes, delivered, lastTime }: AlertStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Phone className="h-5 w-5 text-green-500 shrink-0" />
          <div>
            <div className="text-xl font-bold">{registered.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Registered</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Radio className="h-5 w-5 text-blue-500 shrink-0" />
          <div>
            <div className="text-xl font-bold">{lgaNodes}</div>
            <p className="text-xs text-muted-foreground">LGA Nodes</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
          <div>
            <div className="text-xl font-bold">{delivered}</div>
            <p className="text-xs text-muted-foreground">SMS Delivered</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Clock className="h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <div className="text-xl font-bold tabular-nums">{lastTime}</div>
            <p className="text-xs text-muted-foreground">Last Alert</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
