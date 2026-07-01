import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useApi } from '../../hooks/useApi';
import type { Lga } from '../../lib/types';

export default function LgaDetail() {
  const { id } = useParams();
  const { data: lga, loading } = useApi<Lga & { wards: { id: string; name: string }[] }>(`/lgas/${id}`);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!lga) return <p className="text-muted-foreground">LGA not found</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-serif font-bold mb-6">{lga.name}</h1>
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-muted-foreground">Code</dt><dd className="font-medium">{lga.code}</dd></div>
              <div><dt className="text-muted-foreground">State</dt><dd className="font-medium">{lga.state}</dd></div>
              <div><dt className="text-muted-foreground">Region</dt><dd className="font-medium">{lga.region}</dd></div>
              <div><dt className="text-muted-foreground">Coverage Target</dt><dd className="font-medium">{lga.coverageTarget}%</dd></div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Wards ({lga.wards?.length || 0})</CardTitle></CardHeader>
          <CardContent>
            {!lga.wards?.length ? (
              <p className="text-sm text-muted-foreground">No wards configured</p>
            ) : (
              <ul className="space-y-2">
                {lga.wards.map((w) => (
                  <li key={w.id} className="text-sm py-1 border-b border-border last:border-0">{w.name}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
