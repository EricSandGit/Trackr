import confetti from 'canvas-confetti';

/**
 * Trigger explosion of confetti for breaking a personal best record
 */
export function fireRecordConfetti(): void {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.75 },
      colors: ['#fbbf24', '#f59e0b', '#39d353', '#60a5fa', '#f43f5e'],
      ticks: 200,
      gravity: 1.2,
      scalar: 1.1,
    });
  } catch {
    // Fallback if canvas is not supported
  }
}

/**
 * Subtle sparkle confetti when reaching 100% of daily habits
 */
export function fireCompletionConfetti(): void {
  try {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#39d353', '#2ea043', '#58a6ff'],
      ticks: 150,
      gravity: 1.3,
    });
  } catch {
    // Fallback
  }
}
