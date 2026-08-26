import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Haptic Feedback utility for native Capacitor Android/iOS and Web PWA.
 * Gracefully uses native motor on mobile and falls back to Web Vibration API.
 */

export type HapticType = 'light' | 'medium' | 'success' | 'record' | 'warning' | 'error';

export async function triggerHaptic(type: HapticType = 'light'): Promise<void> {
  try {
    switch (type) {
      case 'light':
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'success':
        await Haptics.notification({ type: NotificationType.Success });
        break;
      case 'record':
        await Haptics.notification({ type: NotificationType.Success });
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([25, 40, 35, 40, 50]);
        }
        break;
      case 'warning':
        await Haptics.notification({ type: NotificationType.Warning });
        break;
      case 'error':
        await Haptics.notification({ type: NotificationType.Error });
        break;
      default:
        await Haptics.impact({ style: ImpactStyle.Light });
    }
  } catch {
    // Fallback to standard web vibration
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        switch (type) {
          case 'light':
            navigator.vibrate(10);
            break;
          case 'medium':
            navigator.vibrate(20);
            break;
          case 'success':
            navigator.vibrate([15, 35, 25]);
            break;
          case 'record':
            navigator.vibrate([25, 40, 35, 40, 50]);
            break;
          case 'warning':
            navigator.vibrate([30, 40, 30]);
            break;
          case 'error':
            navigator.vibrate([40, 30, 40, 30, 40]);
            break;
          default:
            navigator.vibrate(10);
        }
      } catch {
        // Ignore
      }
    }
  }
}
