/**
 * Safe haptic vibration wrapper for mobile browsers
 */
export type HapticType = 'light' | 'medium' | 'success' | 'record' | 'error';

export function triggerHaptic(type: HapticType = 'light'): void {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'success':
        navigator.vibrate([15, 40, 20]);
        break;
      case 'record':
        navigator.vibrate([30, 50, 40, 50, 60]);
        break;
      case 'error':
        navigator.vibrate([40, 30, 40]);
        break;
    }
  } catch {
    // Ignore environments where vibrate is not permitted
  }
}
