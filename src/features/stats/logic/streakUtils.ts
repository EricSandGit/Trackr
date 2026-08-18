import { Habit } from '@/core/types';
import { parseISODate } from '@/core/utils/dateUtils';

export { formatDateToISO, shiftDate } from '@/core/utils/dateUtils';

export function isHabitScheduledOnDate(habit: Habit, dateStr: string): boolean {
  if (habit.isArchived) return false;
  if (habit.frequency.type === 'everyday') return true;

  if (habit.frequency.type === 'specific_days' && habit.frequency.daysOfWeek) {
    const date = parseISODate(dateStr);
    const dayOfWeek = date.getDay();
    return habit.frequency.daysOfWeek.includes(dayOfWeek);
  }

  return true;
}
