export interface LivePosition {
  lat: number;
  lng: number;
  accuracy: number;
  speed: number | null; // km/h
  heading: number | null;
  timestamp: number;
  address?: string;
  batteryLevel?: number;
}

// Simulated waypoints along Chennai -> Mettupalayam -> Ooty
export const SIMULATED_OOTY_ROUTE: { lat: number; lng: number; label: string; speed: number }[] = [
  { lat: 13.0827, lng: 80.2707, label: 'Chennai Central Railway Station', speed: 0 },
  { lat: 12.9249, lng: 79.1378, label: 'Vellore Bypass Expressway', speed: 85 },
  { lat: 11.6643, lng: 78.1460, label: 'Salem Junction Highway', speed: 75 },
  { lat: 11.3410, lng: 77.7172, label: 'Erode Perundurai Tollway', speed: 80 },
  { lat: 11.3005, lng: 76.9482, label: 'Mettupalayam Foothills (Hairpin Start)', speed: 35 },
  { lat: 11.3320, lng: 76.8850, label: 'Burliar 14th Hairpin Bend', speed: 28 },
  { lat: 11.3530, lng: 76.7959, label: 'Coonoor Upper Plateau', speed: 32 },
  { lat: 11.3850, lng: 76.7450, label: 'Aravankadu Cordite Factory View', speed: 40 },
  { lat: 11.4102, lng: 76.6950, label: 'Ooty Town Center (Udhagamandalam)', speed: 20 },
];

const geocodeCache = new Map<string, string>();

/**
 * Reverse geocode lat/lng to human-readable address with caching
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  if (geocodeCache.has(key)) {
    return geocodeCache.get(key)!;
  }

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`, {
      headers: { 'Accept-Language': 'en,ta' }
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.display_name?.split(',').slice(0, 3).join(',') || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
      geocodeCache.set(key, addr);
      return addr;
    }
  } catch {
    // ignore fetch error
  }
  const fallback = `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
  geocodeCache.set(key, fallback);
  return fallback;
}

/**
 * Get device battery level if Battery API is supported
 */
export async function getDeviceBattery(): Promise<number | undefined> {
  try {
    if ('getBattery' in navigator) {
      const battery: any = await (navigator as any).getBattery();
      return Math.round(battery.level * 100);
    }
  } catch {
    // Battery API not supported
  }
  return undefined;
}

/**
 * Watch user location with geolocation API
 */
export function watchUserLocation(
  onUpdate: (pos: LivePosition) => void,
  onError: (errMessage: string, isLowAccuracy?: boolean) => void
): () => void {
  if (!('geolocation' in navigator)) {
    onError('Geolocation is not supported by your browser.');
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    async (geoPos) => {
      const { latitude, longitude, accuracy, speed, heading } = geoPos.coords;
      const battery = await getDeviceBattery();
      const address = await reverseGeocode(latitude, longitude);

      const pos: LivePosition = {
        lat: latitude,
        lng: longitude,
        accuracy: Math.round(accuracy),
        speed: speed !== null ? Math.round(speed * 3.6) : 0, // convert m/s to km/h
        heading,
        timestamp: geoPos.timestamp,
        address,
        batteryLevel: battery,
      };

      if (accuracy > 100) {
        onError(`GPS accuracy is low (${Math.round(accuracy)}m). Try moving near an open window.`, true);
      }

      onUpdate(pos);
    },
    (err) => {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          onError('Location permission denied. You can still test with Simulated Movement.');
          break;
        case err.POSITION_UNAVAILABLE:
          onError('GPS signal unavailable. Ensure location services are turned on.');
          break;
        case err.TIMEOUT:
          onError('Location request timed out. Retrying...');
          break;
        default:
          onError('Unable to retrieve location.');
      }
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000,
    }
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}

/**
 * Multi-tab Realtime Location Syncing (BroadcastChannel + LocalStorage)
 */
export class LiveSharingBroadcaster {
  private channel: BroadcastChannel | null = null;
  private trackId: string;

  constructor(trackId: string) {
    this.trackId = trackId;
    try {
      this.channel = new BroadcastChannel('trippilot-live-tracking');
    } catch {
      // Fallback to storage events
    }
  }

  publish(pos: LivePosition) {
    const payload = { trackId: this.trackId, position: pos, updated: Date.now() };
    try {
      localStorage.setItem(`trippilot_track_${this.trackId}`, JSON.stringify(payload));
    } catch {
      // ignore
    }
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch {
        // ignore
      }
    }
  }

  destroy() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    try {
      localStorage.removeItem(`trippilot_track_${this.trackId}`);
    } catch {
      // ignore
    }
  }
}

/**
 * Generate share messages & links
 */
export function buildSharingLinks(pos: LivePosition, trackId: string) {
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${pos.lat},${pos.lng}`;
  const origin = window.location.origin;
  const trackViewerLink = `${origin}/track/${trackId}`;
  const timeStr = new Date(pos.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const messageText = `I am here: ${mapsLink} (Time: ${timeStr}). Live tracking: ${trackViewerLink}. Sent from TripPilot AI.`;
  const encodedMsg = encodeURIComponent(messageText);

  return {
    mapsLink,
    trackViewerLink,
    messageText,
    whatsappUrl: `https://wa.me/?text=${encodedMsg}`,
    smsUrl: `sms:?&body=${encodedMsg}`,
  };
}
