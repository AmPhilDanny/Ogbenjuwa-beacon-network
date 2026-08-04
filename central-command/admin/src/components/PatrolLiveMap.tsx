import { MapContainer, TileLayer, CircleMarker, Circle, Popup } from 'react-leaflet';
import type { PatrolCheckin } from '../lib/types';

const IDOMA_CENTRE: [number, number] = [7.15, 8.13];
const IDOMA_ZOOM = 9;

interface LgaCircle {
  id: string;
  name: string;
  lat?: string | number | null;
  lng?: string | number | null;
  radius?: string | number | null;
}

interface PatrolLiveMapProps {
  checkins?: PatrolCheckin[];
  lgas?: LgaCircle[];
}

export default function PatrolLiveMap({ checkins = [], lgas = [] }: PatrolLiveMapProps) {
  return (
    <MapContainer
      center={IDOMA_CENTRE}
      zoom={IDOMA_ZOOM}
      className="h-full w-full rounded-xl"
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {lgas
        .filter((l) => l.lat != null && l.lng != null)
        .map((l) => {
          const lat = Number(l.lat);
          const lng = Number(l.lng);
          const radiusKm = Number(l.radius) || 0;
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
          return (
            <Circle
              key={`lga-${l.id}`}
              center={[lat, lng]}
              radius={radiusKm * 1000}
              pathOptions={{ color: '#1D4ED8', fillColor: '#1D4ED8', fillOpacity: 0.06, weight: 1.5, opacity: 0.5 }}
            >
              <Popup>{l.name}</Popup>
            </Circle>
          );
        })}

      {checkins.map((c) => {
        const lat = Number(c.lat);
        const lng = Number(c.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return (
          <CircleMarker
            key={`checkin-${c.memberId}`}
            center={[lat, lng]}
            radius={8}
            pathOptions={{ color: '#fff', fillColor: '#2D9B57', fillOpacity: 0.9, weight: 2 }}
          >
            <Popup>
              <div className="font-sans">
                <strong>{c.memberName || c.memberId}</strong>
                <br />
                <span className="text-xs text-muted-foreground">{new Date(c.timestamp).toLocaleString()}</span>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
