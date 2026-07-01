import { MapContainer, TileLayer, Marker, CircleMarker, Popup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const IDOMA_CENTRE: [number, number] = [7.15, 8.13];
const IDOMA_ZOOM = 9;

// Fix Leaflet default marker icon (broken in bundlers)
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const activeIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'sos-marker',
});

const resourceIcon = (color: string) =>
  L.divIcon({
    html: `<div style="width:24px;height:24px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:12px;">🏥</div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const villageIcon = L.divIcon({
  html: `<div style="width:12px;height:12px;background:#2D9B57;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
  className: '',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

interface Village {
  name: string;
  lga: string;
  lat: number;
  lng: number;
  pop: number;
}

interface PatrolMember {
  id: number;
  name: string;
  role: string;
  lat: number;
  lng: number;
  active: boolean;
  lastSeen: string;
}

interface Resource {
  type: string;
  name: string;
  lga: string;
  lat: number;
  lng: number;
  capacity: number;
  occupied: number;
}

interface PatrolMapProps {
  villages?: Village[];
  members?: PatrolMember[];
  resources?: Resource[];
}

const MEMBER_COLORS: Record<number, string> = {
  1: '#2D9B57',
  2: '#3B82F6',
  3: '#8B5CF6',
  4: '#F59E0B',
  5: '#EF4444',
};

export function PatrolMap({ villages = [], members = [], resources = [] }: PatrolMapProps) {
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

      <LayersControl position="topright">
        <LayersControl.Overlay checked name="Coverage Zones">
          <>
            {villages.map((v) => (
              <CircleMarker
                key={`cov-${v.name}`}
                center={[v.lat, v.lng]}
                radius={30}
                pathOptions={{ color: '#2D9B57', fillColor: '#2D9B57', fillOpacity: 0.08, weight: 1, opacity: 0.3 }}
              >
                <Popup>{v.name} coverage area</Popup>
              </CircleMarker>
            ))}
          </>
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name="Villages">
          <>
            {villages.map((v) => (
              <Marker key={`v-${v.name}`} position={[v.lat, v.lng]} icon={villageIcon}>
                <Popup>
                  <div className="font-sans">
                    <strong className="text-base">{v.name}</strong>
                    <br />
                    <span className="text-sm text-muted-foreground">LGA: {v.lga}</span>
                    <br />
                    <span className="text-sm">Pop: {v.pop.toLocaleString()}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name="Patrol Members">
          <>
            {members.map((m, idx) => (
              <CircleMarker
                key={`p-${m.id}`}
                center={[m.lat, m.lng]}
                radius={8}
                pathOptions={{
                  color: '#fff',
                  fillColor: MEMBER_COLORS[m.id] || MEMBER_COLORS[idx + 1] || '#6B7280',
                  fillOpacity: m.active ? 0.9 : 0.4,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="font-sans">
                    <strong>{m.name}</strong>
                    <br />
                    <span className="text-sm">{m.role}</span>
                    <br />
                    <span className={`text-xs ${m.active ? 'text-green-600' : 'text-gray-400'}`}>
                      {m.active ? '● Active' : '○ Offline'} · {m.lastSeen}
                    </span>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </>
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name="Resources">
          <>
            {resources.map((r, i) => (
              <Marker key={`r-${i}`} position={[r.lat, r.lng]} icon={resourceIcon('#2D9B57')}>
                <Popup>
                  <div className="font-sans">
                    <strong>{r.name}</strong>
                    <br />
                    <span className="text-sm capitalize">{r.type}</span>
                    <br />
                    <span className="text-xs">Capacity: {r.occupied}/{r.capacity}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        </LayersControl.Overlay>
      </LayersControl>
    </MapContainer>
  );
}
