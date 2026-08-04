import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, CircleMarker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Plus, Trash2, Pencil, Save, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useApi } from '../../hooks/useApi';
import { api, ApiClientError } from '../../lib/api';
import type { Lga, Village } from '../../lib/types';

const DEFAULT_CENTER: [number, number] = [7.15, 8.13];
const DEFAULT_ZOOM = 9;
const inputCls =
  'w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring';

const centerIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#e11d48;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LgaDetail() {
  const { id } = useParams();
  const { data: lga, loading, refetch } = useApi<Lga & { wards: { id: string; name: string }[] }>(`/lgas/${id}`);

  // LGA coverage fields
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [radius, setRadius] = useState('10');

  // Village form
  const [villageForm, setVillageForm] = useState({ id: '', name: '', wardId: '', lat: '', lng: '', population: '0' });

  const [mode, setMode] = useState<'center' | 'village'>('center');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!lga) return;
    setLat(lga.lat != null ? String(Number(lga.lat)) : '');
    setLng(lga.lng != null ? String(Number(lga.lng)) : '');
    setRadius(lga.radius != null ? String(Number(lga.radius)) : '10');
  }, [lga]);

  const latNum = lat !== '' ? Number(lat) : null;
  const lngNum = lng !== '' ? Number(lng) : null;
  const radiusNum = radius !== '' ? Number(radius) : null;
  const hasCenter = latNum != null && lngNum != null && Number.isFinite(latNum) && Number.isFinite(lngNum);
  const center: [number, number] = hasCenter ? [latNum as number, lngNum as number] : DEFAULT_CENTER;

  const villages = (lga?.villages || []) as Village[];
  const wards = lga?.wards || [];

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!lga) return <p className="text-muted-foreground">LGA not found</p>;

  const currentLga = lga;

  function handleMapSelect(selLat: number, selLng: number) {
    if (mode === 'center') {
      setLat(selLat.toFixed(5));
      setLng(selLng.toFixed(5));
    } else {
      setVillageForm((f) => ({ ...f, lat: selLat.toFixed(5), lng: selLng.toFixed(5) }));
    }
  }

  async function handleSaveLga() {
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const body: Record<string, unknown> = { radius: radiusNum ?? 10 };
      if (hasCenter) {
        body.lat = latNum;
        body.lng = lngNum;
      }
      await api.put(`/lgas/${currentLga.id}`, body);
      setNotice('Coverage saved');
      refetch();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to save coverage');
    } finally {
      setSaving(false);
    }
  }

  function resetVillageForm() {
    setVillageForm({ id: '', name: '', wardId: '', lat: '', lng: '', population: '0' });
  }

  async function handleVillageSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const body = {
        name: villageForm.name,
        lgaId: currentLga.id,
        wardId: villageForm.wardId || undefined,
        lat: villageForm.lat !== '' ? Number(villageForm.lat) : undefined,
        lng: villageForm.lng !== '' ? Number(villageForm.lng) : undefined,
        population: Number(villageForm.population) || 0,
      };
      if (villageForm.id) {
        await api.put(`/villages/${villageForm.id}`, body);
        setNotice('Village updated');
      } else {
        await api.post('/villages', body);
        setNotice('Village added');
      }
      resetVillageForm();
      refetch();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to save village');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteVillage(v: Village) {
    if (!window.confirm(`Delete village "${v.name}"?`)) return;
    setError('');
    setNotice('');
    try {
      await api.delete(`/villages/${v.id}`);
      setNotice('Village deleted');
      if (villageForm.id === v.id) resetVillageForm();
      refetch();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to delete village');
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">{lga.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {lga.code} · {lga.state} · {lga.region}
          </p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
          {lga.coverageTarget}% coverage target
        </span>
      </div>

      {error && <p className="text-sm text-accent mb-4 p-3 rounded-md bg-accent/10">{error}</p>}
      {notice && (
        <p className="text-sm text-green-600 mb-4 p-3 rounded-md bg-green-600/10 flex items-center gap-2">
          <Check className="w-4 h-4" /> {notice}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Map Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md overflow-hidden border border-border mb-4 relative z-0">
              <MapContainer center={center} zoom={hasCenter ? DEFAULT_ZOOM : DEFAULT_ZOOM} style={{ height: '380px', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onSelect={handleMapSelect} />
                {hasCenter && <Marker position={center} icon={centerIcon} />}
                {hasCenter && radiusNum != null && Number.isFinite(radiusNum) && radiusNum > 0 && (
                  <Circle center={center} radius={radiusNum * 1000} pathOptions={{ color: '#e11d48', fillColor: '#e11d48', fillOpacity: 0.08, weight: 2 }} />
                )}
                {villages
                  .filter((v) => v.lat != null && v.lng != null)
                  .map((v) => (
                    <CircleMarker
                      key={v.id}
                      center={[Number(v.lat), Number(v.lng)]}
                      radius={5}
                      pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.9, weight: 1 }}
                    >
                      <span />
                    </CircleMarker>
                  ))}
              </MapContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Latitude</label>
                <input className={inputCls} value={lat} onChange={(e) => setLat(e.target.value)} placeholder="e.g. 7.1900" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Longitude</label>
                <input className={inputCls} value={lng} onChange={(e) => setLng(e.target.value)} placeholder="e.g. 8.1300" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Radius (km)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className={inputCls}
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <Button onClick={handleSaveLga} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Coverage'}
              </Button>
              <Button variant="outline" onClick={() => setMode(mode === 'center' ? 'village' : 'center')}>
                {mode === 'center' ? 'Click map to set center' : 'Click map to set village coords'}
              </Button>
              <span className="text-xs text-muted-foreground">
                {mode === 'center' ? 'Map clicks update the LGA center' : 'Map clicks update the village form below'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Villages ({villages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVillageSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input className={inputCls} value={villageForm.name} onChange={(e) => setVillageForm({ ...villageForm, name: e.target.value })} placeholder="Village name" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ward</label>
                <select className={inputCls} value={villageForm.wardId} onChange={(e) => setVillageForm({ ...villageForm, wardId: e.target.value })}>
                  <option value="">None</option>
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Latitude</label>
                <input className={inputCls} value={villageForm.lat} onChange={(e) => setVillageForm({ ...villageForm, lat: e.target.value })} placeholder="e.g. 7.2500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Longitude</label>
                <input className={inputCls} value={villageForm.lng} onChange={(e) => setVillageForm({ ...villageForm, lng: e.target.value })} placeholder="e.g. 8.1500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Population</label>
                <input type="number" min="0" className={inputCls} value={villageForm.population} onChange={(e) => setVillageForm({ ...villageForm, population: e.target.value })} />
              </div>
              <div className="md:col-span-6 flex gap-2">
                <Button type="submit" size="sm" disabled={saving}>
                  {villageForm.id ? <><Pencil className="w-4 h-4 mr-1.5" /> Update</> : <><Plus className="w-4 h-4 mr-1.5" /> Add Village</>}
                </Button>
                {villageForm.id && (
                  <Button type="button" size="sm" variant="outline" onClick={resetVillageForm}>
                    Cancel edit
                  </Button>
                )}
              </div>
            </form>

            {villages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No villages configured yet</p>
            ) : (
              <ul className="space-y-2">
                {villages.map((v) => (
                  <li key={v.id} className="text-sm py-2 px-3 rounded-md border border-border flex items-center justify-between">
                    <div>
                      <span className="font-medium">{v.name}</span>
                      {v.lat != null && v.lng != null && (
                        <span className="text-muted-foreground ml-2">({Number(v.lat).toFixed(4)}, {Number(v.lng).toFixed(4)})</span>
                      )}
                      <span className="text-muted-foreground ml-2">pop: {v.population}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="p-1.5 rounded-md hover:bg-muted"
                        onClick={() => setVillageForm({ id: v.id, name: v.name, wardId: v.wardId || '', lat: v.lat != null ? String(Number(v.lat)) : '', lng: v.lng != null ? String(Number(v.lng)) : '', population: String(v.population) })}
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-accent/10 text-accent" onClick={() => handleDeleteVillage(v)} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Wards ({wards.length})</CardTitle></CardHeader>
          <CardContent>
            {wards.length === 0 ? (
              <p className="text-sm text-muted-foreground">No wards configured</p>
            ) : (
              <ul className="space-y-2">
                {wards.map((w) => (
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
