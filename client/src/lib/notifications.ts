import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications, Schedule } from '@capacitor/local-notifications';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

const CATEGORY_EMOJI_MAP: Record<string, string> = {
  finance: '💰',
  love: '❤️',
  career: '💼',
  health: '🌿',
  mindset: '🧠',
};

/** Returns true when running inside a Capacitor native app (iOS/Android). */
function isNativePlatform(): boolean {
  return Capacitor.getPlatform() !== 'web';
}

/**
 * Initialize native Capacitor plugins on app startup.
 * Call this from the app's main entry point.
 */
export async function initCapacitorPlugins(): Promise<void> {
  if (!isNativePlatform()) return;

  try {
    await StatusBar.setBackgroundColor({ color: '#FFF7ED' });
    await StatusBar.setStyle({ style: Style.Dark });
    await SplashScreen.hide();
  } catch (err) {
    console.warn('Capacitor plugin init failed (expected in web):', err);
  }
}

/**
 * Register for push notifications.
 * Returns the device token if permission is granted.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!isNativePlatform()) return null;

  try {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('Push notification permission denied');
      return null;
    }

    await PushNotifications.register();

    return new Promise((resolve) => {
      PushNotifications.addListener('registration', (token) => {
        resolve(token.value);
      });

      // Timeout after 10s
      setTimeout(() => resolve(null), 10000);
    });
  } catch (err) {
    console.error('Push registration failed:', err);
    return null;
  }
}

/**
 * Schedule daily local notifications based on the user's frequency preference.
 */
export async function scheduleDailyAffirmations(
  frequency: 1 | 3 | 5,
  affirmations: { text: string; category: string }[]
): Promise<void> {
  if (!isNativePlatform()) return;

  // Cancel existing notifications first
  await LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }] });

  const timeSlots: Record<number, { hour: number; minute: number }[]> = {
    1: [{ hour: 9, minute: 0 }],
    3: [
      { hour: 8, minute: 0 },
      { hour: 13, minute: 0 },
      { hour: 19, minute: 0 },
    ],
    5: [
      { hour: 7, minute: 0 },
      { hour: 10, minute: 0 },
      { hour: 13, minute: 0 },
      { hour: 17, minute: 0 },
      { hour: 21, minute: 0 },
    ],
  };

  const slots = timeSlots[frequency] || timeSlots[3];

  const notifications = slots.map((slot, index) => {
    const affirmation = affirmations[index % affirmations.length] || {
      text: 'You are capable of amazing things.',
      category: 'mindset',
    };
    const emoji = CATEGORY_EMOJI_MAP[affirmation.category] || '✨';

    // Schedule for next occurrence of this time
    const now = new Date();
    const scheduled = new Date(now);
    scheduled.setHours(slot.hour, slot.minute, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (scheduled <= now) {
      scheduled.setDate(scheduled.getDate() + 1);
    }

    return {
      id: index + 1,
      title: `Daily Affirm ${emoji}`,
      body: `"${affirmation.text}"`,
      schedule: { at: scheduled } as Schedule,
      extra: {
        category: affirmation.category,
      },
      sound: undefined,
    };
  });

  try {
    await LocalNotifications.schedule({ notifications });
  } catch (err) {
    console.error('Failed to schedule notifications:', err);
  }
}

/**
 * Cancel all scheduled local notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  if (!isNativePlatform()) return;

  try {
    await LocalNotifications.cancel({
      notifications: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
    });
  } catch (err) {
    console.warn('Failed to cancel notifications:', err);
  }
}

/**
 * Request notification permission (for web PWA fallback)
 * Used when Capacitor is not available.
 */
export async function requestWebNotificationPermission(): Promise<boolean> {
  if (isNativePlatform()) return true; // Already handled by Capacitor

  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;

  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}