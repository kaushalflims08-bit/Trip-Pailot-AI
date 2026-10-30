import React, { useState } from 'react';
import { AlertOctagon, PhoneCall, Share2, ShieldAlert, Heart, Building2, MapPin, X } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';
import { getNearestFacilities, EMERGENCY_NUMBERS } from '../../data/emergency';
import { buildSharingLinks } from '../../services/location';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const SOSButton: React.FC = () => {
  const {
    liveLocation,
    trustedContacts,
    startLiveSharing,
    addNotification,
    language,
  } = useTripStore();

  const [isOpen, setIsOpen] = useState(false);
  const [sosFired, setSosFired] = useState(false);

  const lat = liveLocation?.lat || 11.4102;
  const lng = liveLocation?.lng || 76.6950;
  const { nearestHospital, nearestPolice } = getNearestFacilities(lat, lng);

  const handleTriggerSOS = () => {
    setIsOpen(true);
    setSosFired(true);

    // Auto arm live sharing for emergency
    const trackId = startLiveSharing(60); // 1 hour emergency broadcast

    addNotification({
      type: 'gps',
      title: 'EMERGENCY SOS ARMED',
      titleTa: 'அவசர SOS இயக்கப்பட்டது',
      message: `Emergency SOS triggered at ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E. Nearest hospital: ${nearestHospital.name}`,
      messageTa: `அவசர SOS இயக்கப்பட்டது. அருகிலுள்ள மருத்துவமனை: ${nearestHospital.nameTa}`,
    });
  };

  const sharingLinks = buildSharingLinks(
    liveLocation || { lat, lng, accuracy: 10, speed: 0, heading: 0, timestamp: Date.now() },
    'emergency-sos'
  );

  return (
    <>
      {/* Expanding Ripple SOS Button */}
      <div className="relative inline-flex items-center justify-center">
        {/* Animated Ripple Rings */}
        <span className="absolute -inset-2 rounded-2xl bg-red-600 opacity-30 animate-ping duration-[2200ms] pointer-events-none" />
        <span className="absolute -inset-4 rounded-3xl bg-red-600 opacity-15 animate-ping duration-[3200ms] pointer-events-none" />

        <button
          onClick={handleTriggerSOS}
          aria-label="Emergency SOS Button"
          className="relative flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-red-600/40 hover:brightness-110 active:scale-95 transition-all cursor-pointer border border-white/30"
        >
          <div className="p-1 rounded-lg bg-white/20">
            <AlertOctagon className="w-5 h-5 fill-white text-red-600" />
          </div>
          <div className="flex flex-col text-left">
            <span className="leading-none text-xs">EMERGENCY</span>
            <span className="text-base font-black tracking-widest leading-none mt-0.5">SOS</span>
          </div>
        </button>
      </div>

      {/* Emergency Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="EMERGENCY SOS ACTIVATED"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-200 text-xs sm:text-sm flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {language === 'ta'
                  ? 'அவசர SOS இயக்கப்பட்டது. நேரலை இருப்பிடம் தானாக சேமிக்கப்பட்டுள்ளது.'
                  : 'Emergency tracking is active. Real-time GPS location captured.'}
              </p>
              <p className="text-xs opacity-90 mt-0.5">
                Current Coordinates: {lat.toFixed(4)}°N, {lng.toFixed(4)}°E (Ooty/Nilgiris Sector)
              </p>
            </div>
          </div>

          {/* Quick Dial Emergency Numbers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Instant Helpline Dispatch (India)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EMERGENCY_NUMBERS.slice(0, 4).map((en) => (
                <a
                  key={en.number}
                  href={`tel:${en.number}`}
                  className="flex flex-col items-center justify-center p-3 rounded-xl glass-card hover:bg-red-500/10 border border-slate-200 dark:border-slate-800 transition-all text-center cursor-pointer group"
                >
                  <PhoneCall className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {en.number}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate w-full">{en.service}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Nearest Safe Facilities (Calculated via Haversine) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Hospital */}
            <div className="p-3.5 rounded-xl glass-card border border-teal-500/30">
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-xs font-bold mb-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Nearest Hospital ({nearestHospital.distanceKm || '1.2'} km)</span>
              </div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                {language === 'ta' ? nearestHospital.nameTa : nearestHospital.name}
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {nearestHospital.address}
              </p>
              <a
                href={`tel:${nearestHospital.phone}`}
                className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Call {nearestHospital.phone}
              </a>
            </div>

            {/* Police Station */}
            <div className="p-3.5 rounded-xl glass-card border border-blue-500/30">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold mb-1">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span>Nearest Police ({nearestPolice.distanceKm || '0.8'} km)</span>
              </div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                {language === 'ta' ? nearestPolice.nameTa : nearestPolice.name}
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {nearestPolice.address}
              </p>
              <a
                href={`tel:${nearestPolice.phone}`}
                className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Call {nearestPolice.phone}
              </a>
            </div>
          </div>

          {/* Trusted Contacts Broadcast */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Alert Trusted Contacts ({trustedContacts.length} saved)
              </span>
              <a
                href={sharingLinks.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Share2 className="w-3.5 h-3.5" />
                Send SOS via WhatsApp
              </a>
            </div>
            <div className="space-y-1.5">
              {trustedContacts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 dark:border-slate-700/50 last:border-0"
                >
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {c.name} ({c.relation})
                  </span>
                  <a
                    href={`tel:${c.phone}`}
                    className="text-xs font-mono text-[#FF7A1A] font-bold hover:underline"
                  >
                    {c.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" variant="outline" onClick={() => setIsOpen(false)}>
              Close Overlay
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
