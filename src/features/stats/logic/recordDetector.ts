import { DailyActivityLog } from '@/core/types';

/**
 * Evaluates whether adding a new value on `targetDate` constitutes a new All-Time Personal Record
 */
export function evaluateIfNewRecord(
  habitId: string,
  targetDate: string,
  newValueForDay: number,
  allLogs: DailyActivityLog[]
): boolean {
  if (newValueForDay <= 0) return false;

  // Find all other days for this habit except the targetDate
  const pastLogs = allLogs.filter((l) => l.habitId === habitId && l.date !== targetDate);
  if (pastLogs.length === 0) {
    // First ever entry counts as initial record if > 0
    return true;
  }

  const previousMax = Math.max(...pastLogs.map((l) => l.totalValue), 0);
  return newValueForDay > previousMax;
}
