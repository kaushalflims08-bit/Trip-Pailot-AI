import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ExternalLink, Navigation, Compass } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type?: 'user' | 'hospital' | 'police' | 'attraction' | 'waypoint';
  notes?: string;
}

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  routePolyline?: [number, number][];
  accuracy?: number;
  showUserPulse?: boolean;
  className?: string;
  height?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  center = [11.4102, 76.6950], // Ooty default
  zoom = 13,
  markers = [],
  routePolyline = [],
  accuracy,
  showUserPulse = true,
  className = '',
  height = 'h-80',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const { darkMode } = useTripStore();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: false,
      });

      // CartoDB tiles for elegant dark/light theme
      const tileUrl = darkMode
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(center, zoom);
    }

    return () => {
      // Map cleanup on component unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers, polyline and tiles when props change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Re-apply correct theme tiles
    const tileUrl = darkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });
    L.tileLayer(tileUrl, { maxZoom: 19, subdomains: 'abcd' }).addTo(map);

    // Draw route polyline
    if (routePolyline.length > 1) {
      const poly = L.polyline(routePolyline, {
        color: '#FF7A1A',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
      });
      poly.addTo(layerGroup);
      try {
        map.fitBounds(poly.getBounds(), { padding: [30, 30] });
      } catch {
        // bounds fit fallback
      }
    }

    // Accuracy breathing circle around center if user location
    if (accuracy && accuracy > 0) {
      L.circle(center, {
        radius: accuracy,
        color: '#14B8A6',
        fillColor: '#14B8A6',
        fillOpacity: 0.15,
        weight: 1.5,
      }).addTo(layerGroup);
    }

    // Add User Pulse Dot
    if (showUserPulse) {
      const userIcon = L.divIcon({
        className: 'user-pulse-marker',
        html: `
          <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: rgba(20, 184, 166, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background: #14B8A6; border: 2.5px solid #ffffff; box-shadow: 0 0 10px rgba(20,184,166,0.8);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      L.marker(center, { icon: userIcon })
        .bindPopup(`<b>Your Live Location</b><br/>${center[0].toFixed(4)}°N, ${center[1].toFixed(4)}°E`)
        .addTo(layerGroup);
    }

    // Add custom markers
    markers.forEach((m) => {
      let iconColor = '#FF7A1A';
      if (m.type === 'hospital') iconColor = '#EF4444';
      if (m.type === 'police') iconColor = '#3B82F6';
      if (m.type === 'attraction') iconColor = '#10B981';

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="background: ${iconColor}; color: white; padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.4);">
              ${m.title}
            </div>
            <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${iconColor};"></div>
          </div>
        `,
        iconSize: [60, 30],
        iconAnchor: [30, 30],
      });

      L.marker([m.lat, m.lng], { icon: customIcon })
        .bindPopup(`<b>${m.title}</b><br/>${m.notes || ''}`)
        .addTo(layerGroup);
    });
  }, [center, zoom, markers, routePolyline, accuracy, showUserPulse, darkMode]);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${center[0]},${center[1]}`;

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-md ${height} ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating map controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white backdrop-blur shadow-md hover:bg-white dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#FF7A1A]" />
          <span>Open in Google Maps</span>
        </a>
      </div>

      <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur text-white text-[10px] font-mono">
          <Compass className="w-3 h-3 text-[#FF7A1A]" />
          <span>{center[0].toFixed(4)}°N, {center[1].toFixed(4)}°E</span>
        </div>
      </div>
    </div>
  );
};
