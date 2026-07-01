import type { ReactNode } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
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

interface AlertMapProps {
  children?: ReactNode;
  villages?: Village[];
}

export function AlertMap({ children, villages = [] }: AlertMapProps) {
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
