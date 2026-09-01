import type confetti from 'canvas-confetti';

/**
 * Dynamically import canvas-confetti only when triggered
 */
async function getConfetti(): Promise<typeof confetti> {
  const module = await import('canvas-confetti');
  return (module.default || module) as unknown as typeof confetti;
}

/**
 * Trigger explosion of confetti for breaking a personal best record
 */
export async function fireRecordConfetti(): Promise<void> {
  try {
    const launchConfetti = await getConfetti();
    launchConfetti({
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
export async function fireCompletionConfetti(): Promise<void> {
  try {
    const launchConfetti = await getConfetti();
    launchConfetti({
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
