import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink, Compass, Shield, Clock, Battery, Navigation } from 'lucide-react';
import { MapView } from '../components/maps/MapView';
import { LivePosition } from '../services/location';

export const TrackViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [position, setPosition] = useState<LivePosition>({
    lat: 11.4102,
    lng: 76.6950,
    accuracy: 14,
    speed: 35,
    heading: 190,
    timestamp: Date.now(),
    address: 'Commercial Road, Ooty, Nilgiris',
    batteryLevel: 82,
  });

  useEffect(() => {
    // 1. Initial read from localStorage
    try {
      const stored = localStorage.getItem(`trippilot_track_${id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.position) setPosition(parsed.position);
      }
    } catch {
      // ignore
    }

    // 2. Listen to multi-tab BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('trippilot-live-tracking');
      bc.onmessage = (event) => {
        if (event.data?.position && (event.data.trackId === id || !id)) {
          setPosition(event.data.position);
        }
      };
    } catch {
      // fallback
    }

    // 3. Fallback storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === `trippilot_track_${id}` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.position) setPosition(parsed.position);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [id]);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}`;

  return (
    <div className="min-h-screen bg-[#071427] text-white flex flex-col">
      {/* Top Header */}
      <header className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0B1F3A]/80 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FF7A1A] flex items-center justify-center font-black text-white text-xs">
            TP
          </div>
          <div>
            <h1 className="text-sm font-bold font-heading">
              TripPilot AI • Live Location Viewer
            </h1>
            <div className="flex items-center gap-1.5 text-[10px] text-teal-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span>Broadcast Active • Shared by Traveler</span>
            </div>
          </div>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FF7A1A] text-white hover:brightness-110 shadow-sm transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open in Google Maps</span>
        </a>
      </header>

      {/* Main Map View */}
      <div className="flex-1 relative">
        <MapView
          center={[position.lat, position.lng]}
          zoom={14}
          accuracy={position.accuracy}
          showUserPulse
          height="h-[calc(100vh-140px)]"
        />

        {/* Floating Telemetry Info Card */}
        <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:w-96 z-30">
          <div className="p-4 rounded-2xl glass-card border border-white/20 shadow-2xl bg-[#0B1F3A]/90 backdrop-blur-xl text-xs space-y-2">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-slate-300">Live Status</span>
              <span className="text-teal-400 font-mono">
                Updated {new Date(position.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="text-sm font-bold text-white flex items-start gap-1.5">
              <Navigation className="w-4 h-4 text-[#FF7A1A] shrink-0 mt-0.5" />
              <span>{position.address || `${position.lat.toFixed(4)}°N, ${position.lng.toFixed(4)}°E`}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/60 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block">Speed</span>
                <strong className="text-white">{position.speed ?? 0} km/h</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Accuracy</span>
                <strong className="text-teal-400">±{position.accuracy}m</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Battery</span>
                <strong className="text-emerald-400">{position.batteryLevel ?? 80}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
