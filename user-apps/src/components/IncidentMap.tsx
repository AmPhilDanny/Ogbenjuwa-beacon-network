import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

interface IncidentMarker {
  id: string;
  title: string;
  severity: string;
  lat: number;
  lng: number;
  status: string;
  createdAt: string;
  location: string;
}

interface Village {
  name: string;
  lat: number;
  lng: number;
  lgaId: string;
}

interface Lga {
  name: string;
  lat?: string | number | null;
  lng?: string | number | null;
  radius?: string | number | null;
}

const IDOMA_CENTRE = { lat: 7.15, lng: 8.13 };

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#D97706',
  low: '#16A34A',
};

type LeafletInstance = typeof import('leaflet');

export function IncidentMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<ReturnType<LeafletInstance['map']> | null>(null);
  const LRef = useRef<LeafletInstance | null>(null);
  const markersRef = useRef<ReturnType<LeafletInstance['marker']>[]>([]);
  const layersRef = useRef<Array<ReturnType<LeafletInstance['circle']> | ReturnType<LeafletInstance['circleMarker']>>>([]);
  const [loaded, setLoaded] = useState(false);
  const [incidents, setIncidents] = useState<IncidentMarker[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [lgas, setLgas] = useState<Lga[]>([]);

  useEffect(() => {
    // Load Leaflet from CDN
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      setLoaded(true);
    };
    document.body.appendChild(script);

    // Fetch data
    Promise.all([
      api.get<{ data: IncidentMarker[] }>('/alerts').catch(() => ({ data: [] })),
      api.get<{ data: Village[] }>('/villages').catch(() => ({ data: [] })),
      api.get<{ data: Lga[] }>('/lgas').catch(() => ({ data: [] })),
    ]).then(([alertsRes, villagesRes, lgasRes]) => {
      setIncidents(alertsRes.data.filter(a => a.status === 'active' || a.status === 'investigating'));
      setVillages(villagesRes.data);
      setLgas(lgasRes.data);
    });

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current || mapInstanceRef.current) return;

    const L = (window as any).L as LeafletInstance;
    LRef.current = L;

    const map = L.map(mapRef.current, {
      center: [IDOMA_CENTRE.lat, IDOMA_CENTRE.lng],
      zoom: 9,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapInstanceRef.current = map;
  }, [loaded]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = LRef.current;
    if (!map || !L) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    layersRef.current.forEach(l => l.remove());
    layersRef.current = [];

    // Build village coordinate lookup
    const villageCoords: Record<string, { lat: number; lng: number }> = {};
    villages.forEach(v => {
      villageCoords[v.name.toLowerCase()] = { lat: v.lat, lng: v.lng };
    });

    // Render LGA coverage circles (radius configured in km → Leaflet meters)
    lgas.forEach(l => {
      if (l.lat == null || l.lng == null) return;
      const lat = Number(l.lat);
      const lng = Number(l.lng);
      const radiusKm = Number(l.radius) || 0;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const circle = L.circle([lat, lng], {
        radius: radiusKm * 1000,
        color: '#1D4ED8',
        fillColor: '#1D4ED8',
        fillOpacity: 0.06,
        weight: 1.5,
        opacity: 0.5,
      }).addTo(map).bindPopup(`
        <div style="font-family:sans-serif;font-size:13px;">
          <strong>${l.name}</strong><br/>
          <span style="color:#666;">Coverage: ${radiusKm} km</span>
        </div>
      `);
      layersRef.current.push(circle);
    });

    // Render village markers
    villages.forEach(v => {
      if (v.lat == null || v.lng == null) return;
      const cm = L.circleMarker([v.lat, v.lng], {
        radius: 4,
        color: '#2D9B57',
        fillColor: '#2D9B57',
        fillOpacity: 0.8,
        weight: 1,
      }).addTo(map).bindPopup(`
        <div style="font-family:sans-serif;font-size:13px;">
          <strong>${v.name}</strong>
        </div>
      `);
      layersRef.current.push(cm);
    });

    // Add incident markers
    incidents.forEach(inc => {
      const coords = villageCoords[inc.location?.toLowerCase()];
      if (!coords) return;

      const color = SEVERITY_COLORS[inc.severity] || '#6B7280';
      const icon = L.divIcon({
        html: `<div style="width:24px;height:24px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:bold;">!</div>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([coords.lat, coords.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;font-size:13px;">
            <strong>${inc.title}</strong><br/>
            <span style="color:${color};">${inc.severity.toUpperCase()}</span> · ${inc.status}<br/>
            <span style="color:#666;font-size:11px;">${inc.location}</span><br/>
            <span style="color:#999;font-size:10px;">${new Date(inc.createdAt).toLocaleString()}</span>
          </div>
        `);

      markersRef.current.push(marker);
    });

    // Fit bounds if markers exist
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [incidents, villages, lgas, loaded]);

  return (
    <div ref={mapRef} className="h-full w-full" style={{ minHeight: '400px' }} />
  );
}
