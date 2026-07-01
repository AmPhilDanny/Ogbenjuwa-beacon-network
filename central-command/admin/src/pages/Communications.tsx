import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function Communications() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold">Communications</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Send announcements and manage messages</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">Communications module coming soon</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Announcements, messaging, and broadcast features will be available here</p>
        </CardContent>
      </Card>
    </div>
  );
}
