import { Habit } from '@/core/types';
import { parseISODate } from '@/core/utils/dateUtils';

export { formatDateToISO, shiftDate } from '@/core/utils/dateUtils';

export function isHabitScheduledOnDate(habit: Habit, dateStr: string): boolean {
  if (habit.isArchived) return false;

  // Check explicit start date
  if (habit.startDate && dateStr < habit.startDate) {
    return false;
  }

  // Check explicit end date
  if (habit.endDate && dateStr > habit.endDate) {
    return false;
  }

  // A habit cannot be scheduled before it was created (if no startDate is set)
  if (!habit.startDate) {
    const createdDateStr = habit.createdAt ? habit.createdAt.slice(0, 10) : '';
    if (createdDateStr && dateStr < createdDateStr) {
      return false;
    }
  }

  // Casual activities are not scheduled on fixed days
  if (habit.frequency.type === 'casual') return false;

  if (habit.frequency.type === 'everyday') return true;

  if (habit.frequency.type === 'specific_days' && habit.frequency.daysOfWeek) {
    const date = parseISODate(dateStr);
    const dayOfWeek = date.getDay();
    return habit.frequency.daysOfWeek.includes(dayOfWeek);
  }

  return true;
}
