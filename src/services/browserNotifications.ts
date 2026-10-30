import { useTripStore, TripNotification } from '../store/useTripStore';

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export function getBrowserNotificationPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return Notification.permission;
  }
}

export interface SendAlertParams {
  title: string;
  titleTa?: string;
  body: string;
  bodyTa?: string;
  type: TripNotification['type'];
  tag?: string;
  icon?: string;
}

/**
 * Sends a native browser system notification (if permitted) AND mirrors it in the in-app notification center
 */
export function sendTripNotification({
  title,
  titleTa,
  body,
  bodyTa,
  type,
  tag,
  icon,
}: SendAlertParams): boolean {
  const store = useTripStore.getState();
  const lang = store.language;

  const displayTitle = lang === 'ta' && titleTa ? titleTa : title;
  const displayBody = lang === 'ta' && bodyTa ? bodyTa : body;

  // 1. Mirror into in-app store so the notification bell reflects it
  store.addNotification({
    type,
    title: displayTitle,
    titleTa,
    message: displayBody,
    messageTa: bodyTa,
  });

  // 2. Dispatch native OS / Browser Notification API if supported and granted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(displayTitle, {
        body: displayBody,
        icon: icon || '/manifest.webmanifest',
        tag: tag || `trippilot-${Date.now()}`,
      });
      return true;
    } catch (err) {
      console.warn('Native notification dispatch failed:', err);
    }
  }

  return false;
}

// ----------------------------------------------------------------------
// Specific Trigger Helpers
// ----------------------------------------------------------------------

/**
 * 1. Upcoming Flight or Train Alert
 */
export function alertUpcomingFlightOrTrain(mode: 'flight' | 'train' = 'train') {
  if (mode === 'flight') {
    return sendTripNotification({
      type: 'traffic',
      title: '✈️ Flight Alert: IndiGo 6E-452 (MAA → CJB)',
      titleTa: '✈️ விமான எச்சரிக்கை: IndiGo 6E-452 (சென்னை → கோவை)',
      body: 'Boarding begins in 45 mins at Terminal 1, Gate 4. Please proceed to security with government ID.',
      bodyTa: 'போர்டிங் 45 நிமிடங்களில் முனையம் 1, கேட் 4-ல் தொடங்குகிறது. அடையாள அட்டையுடன் பாதுகாப்பு சோதனைக்குச் செல்லவும்.',
      tag: 'flight-status',
    });
  }

  return sendTripNotification({
    type: 'traffic',
    title: '🚆 Train Departure Alert: 12671 Nilgiri SF Express',
    titleTa: '🚆 ரயில் புறப்பாடு எச்சரிக்கை: 12671 நீலகிரி அதிவிரைவு ரயில்',
    body: 'Scheduled departure at 21:05 from Platform 4, Chennai Central. Coach B3 confirmed.',
    bodyTa: 'சென்னை சென்ட்ரல் நடைமேடை 4-லிருந்து இரவு 21:05 மணிக்கு புறப்படுகிறது. கோச் B3 உறுதி செய்யப்பட்டது.',
    tag: 'train-status',
  });
}

/**
 * 2. Hotel Check-In Alert
 */
export function alertHotelCheckin(hotelName = 'Sterling Ooty Fern Hill') {
  return sendTripNotification({
    type: 'booking',
    title: `🏨 Hotel Check-In Ready: ${hotelName}`,
    titleTa: `🏨 ஹோட்டல் செக்-இன் தயார்: ${hotelName}`,
    body: 'Your Valley View Room is prepared with welcome eucalyptus refreshments. Front desk check-in available from 12:00 PM.',
    bodyTa: 'உங்கள் அறை தயாராக உள்ளது. மதியம் 12:00 மணி முதல் வரவேற்பறையில் செக்-இன் செய்யலாம்.',
    tag: 'hotel-checkin',
  });
}

/**
 * 3. Local Weather & Ghat Road Alert
 */
export function alertLocalWeather(destination = 'Ooty / Nilgiri Ghats') {
  return sendTripNotification({
    type: 'disruption',
    title: `⛅ Weather & Road Alert: ${destination}`,
    titleTa: `⛅ வானிலை மற்றும் சாலை எச்சரிக்கை: ${destination}`,
    body: 'Dense evening mist & light drizzle near Doddabetta Peak (Visibility < 60m). Drive carefully on Kallar-Coonoor 36 hairpin curves.',
    bodyTa: 'தொட்டபெட்டா மலைப் பகுதியில் மாலை பனிமூட்டம் மற்றும் சாரல் மழை. கொண்டை ஊசி வளைவுகளில் எச்சரிக்கையுடன் வாகனத்தை இயக்கவும்.',
    tag: 'weather-road-alert',
  });
}
