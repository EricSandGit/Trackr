/**
 * Haptic Feedback utility for mobile web and PWA / Capacitor
 * Gracefully degrades if vibration API is not supported.
 */

export type HapticType = 'light' | 'medium' | 'success' | 'record' | 'warning' | 'error';

export function triggerHaptic(type: HapticType = 'light'): void {
  if (typeof window === 'undefined' || !('navigator' in window) || !('vibrate' in navigator)) {
    return;
  }

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
    // Ignore any browser restrictions
  }
}
