import type { ReactNode } from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const IDOMA_CENTRE: [number, number] = [7.15, 8.13];
const IDOMA_ZOOM = 9;

interface Village {
  name: string;
  lga: string;
  lat: number;
  lng: number;
  pop: number;
}

interface Lga {
  name: string;
  lat?: string | number | null;
  lng?: string | number | null;
  radius?: string | number | null;
}

interface AlertMapProps {
  children?: ReactNode;
  villages?: Village[];
  lgas?: Lga[];
}

export function AlertMap({ children, villages = [], lgas = [] }: AlertMapProps) {
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
              key={l.name}
              center={[lat, lng]}
              radius={radiusKm * 1000}
              pathOptions={{ color: '#1D4ED8', fillColor: '#1D4ED8', fillOpacity: 0.06, weight: 1.5, opacity: 0.5 }}
            >
              <Popup>
                <div className="font-sans">
                  <strong className="text-base">{l.name}</strong>
                  <br />
                  <span className="text-sm text-muted-foreground">Coverage: {radiusKm} km</span>
                </div>
              </Popup>
            </Circle>
          );
        })}

      {villages.map((v) => (
        <CircleMarker
          key={v.name}
          center={[v.lat, v.lng]}
          radius={10}
          pathOptions={{
            color: '#2D9B57',
            fillColor: '#2D9B57',
            fillOpacity: 0.3,
            weight: 2,
          }}
        >
          <Popup>
            <div className="font-sans">
              <strong className="text-base">{v.name}</strong>
              <br />
              <span className="text-sm text-muted-foreground">LGA: {v.lga}</span>
              <br />
              <span className="text-sm">Pop: {v.pop.toLocaleString()}</span>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {children}
    </MapContainer>
  );
}
