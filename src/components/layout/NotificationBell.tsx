import React, { useState, useRef, useEffect } from 'react';
import {
  Bell, CheckCheck, Clock, ShieldAlert, Sparkles, AlertTriangle,
  Plane, Building, CloudSun, Check, Smartphone
} from 'lucide-react';
import { useTripStore, TripNotification } from '../../store/useTripStore';
import {
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  alertUpcomingFlightOrTrain,
  alertHotelCheckin,
  alertLocalWeather,
  NotificationPermissionState,
} from '../../services/browserNotifications';

export const NotificationBell: React.FC = () => {
  const { notifications, markAllNotificationsRead, language } = useTripStore();
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermissionState>('default');
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setPermission(getBrowserNotificationPermission());
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleRequestPermission = async () => {
    const res = await requestBrowserNotificationPermission();
    setPermission(res);
  };

  const getIcon = (type: TripNotification['type']) => {
    switch (type) {
      case 'booking':
        return <Sparkles className="w-4 h-4 text-[#FF7A1A]" />;
      case 'budget':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'traffic':
      case 'disruption':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-teal-400" />;
    }
  };

  return (
    <div className="relative inline-block text-left" ref={panelRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            markAllNotificationsRead();
          }
        }}
        aria-label={`Notifications, ${unreadCount} unread`}
        className={`relative p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer ${
          unreadCount > 0 ? 'animate-bounce' : ''
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF7A1A] text-[10px] font-bold text-white shadow-[0_0_8px_#FF7A1A]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl glass-card border border-white/20 dark:border-white/10 shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                Notifications
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                {notifications.length}
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-[#FF7A1A] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Browser Notification API Permission Banner */}
          <div className="p-3 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200/50 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#14B8A6]" />
                <span>Browser Push Notifications</span>
              </span>

              {permission === 'granted' ? (
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Enabled
                </span>
              ) : (
                <button
                  onClick={handleRequestPermission}
                  className="text-[11px] font-bold text-white bg-gradient-to-r from-[#FF7A1A] to-[#ff9138] px-2.5 py-1 rounded-lg shadow-sm hover:brightness-110 cursor-pointer"
                >
                  Enable Native Alerts
                </button>
              )}
            </div>

            {/* Quick Demo Alert Triggers */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => alertUpcomingFlightOrTrain('train')}
                title="Send upcoming train departure alert"
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-[#FF7A1A]/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap cursor-pointer"
              >
                <Plane className="w-3 h-3 text-[#FF7A1A]" />
                <span>Flight/Train Alert</span>
              </button>

              <button
                onClick={() => alertHotelCheckin('Sterling Ooty Fern Hill')}
                title="Send hotel check-in reminder"
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-teal-500/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap cursor-pointer"
              >
                <Building className="w-3 h-3 text-teal-500" />
                <span>Hotel Check-in</span>
              </button>

              <button
                onClick={() => alertLocalWeather('Ooty & Nilgiris')}
                title="Send local weather & ghat advisory"
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-amber-500/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap cursor-pointer"
              >
                <CloudSun className="w-3 h-3 text-amber-500" />
                <span>Weather Alert</span>
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/40 flex items-start gap-3 ${
                    !n.read ? 'bg-[#FF7A1A]/5' : ''
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-200/70 dark:bg-slate-800/70 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5 shrink-0 ml-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
