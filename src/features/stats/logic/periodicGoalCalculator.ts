import { Habit, DailyActivityLog } from '@/core/types';
import { getCurrentWeekRange, getCurrentMonthRange } from '@/core/utils/dateUtils';
import { isHabitSuccessfulOnDate } from '@/features/heatmap/logic/heatmapCalculator';

export interface PeriodicProgress {
  period: 'weekly' | 'monthly';
  current: number;
  target: number;
  percentage: number;
  isMet: boolean;
  daysRemaining: number;
  unit: string;
  label: string;
}

/**
 * Calculates the progress of a habit for the current week (Monday to Sunday)
 */
export function calculateWeeklyGoalProgress(
  habit: Habit,
  logs: DailyActivityLog[],
  referenceDate?: string
): PeriodicProgress | null {
  const target = habit.weeklyGoal;
  if (!target || target <= 0) return null;

  const { days, daysRemaining } = getCurrentWeekRange(referenceDate);
  const habitLogs = logs.filter((l) => l.habitId === habit.id);

  let current = 0;
  if (habit.type === 'avoidance') {
    current = days.filter((d) => {
      const log = habitLogs.find((l) => l.date === d);
      return isHabitSuccessfulOnDate(habit, d, log);
    }).length;
  } else if (habit.type === 'boolean') {
    current = habitLogs.filter((l) => days.includes(l.date) && l.isCompleted).length;
  } else {
    current = habitLogs
      .filter((l) => days.includes(l.date))
      .reduce((sum, l) => sum + (l.totalValue || 0), 0);
  }

  const percentage = Math.min(100, Math.round((current / target) * 100));
  const isMet = current >= target;
  const unit = habit.type === 'boolean' || habit.type === 'avoidance' ? 'días' : habit.unit || 'uds';

  return {
    period: 'weekly',
    current,
    target,
    percentage,
    isMet,
    daysRemaining,
    unit,
    label: 'Meta Semanal',
  };
}

/**
 * Calculates the progress of a habit for the current month (1st to last day)
 */
export function calculateMonthlyGoalProgress(
  habit: Habit,
  logs: DailyActivityLog[],
  referenceDate?: string
): PeriodicProgress | null {
  const target = habit.monthlyGoal;
  if (!target || target <= 0) return null;

  const { days, daysRemaining } = getCurrentMonthRange(referenceDate);
  const habitLogs = logs.filter((l) => l.habitId === habit.id);

  let current = 0;
  if (habit.type === 'avoidance') {
    current = days.filter((d) => {
      const log = habitLogs.find((l) => l.date === d);
      return isHabitSuccessfulOnDate(habit, d, log);
    }).length;
  } else if (habit.type === 'boolean') {
    current = habitLogs.filter((l) => days.includes(l.date) && l.isCompleted).length;
  } else {
    current = habitLogs
      .filter((l) => days.includes(l.date))
      .reduce((sum, l) => sum + (l.totalValue || 0), 0);
  }

  const percentage = Math.min(100, Math.round((current / target) * 100));
  const isMet = current >= target;
  const unit = habit.type === 'boolean' || habit.type === 'avoidance' ? 'días' : habit.unit || 'uds';

  return {
    period: 'monthly',
    current,
    target,
    percentage,
    isMet,
    daysRemaining,
    unit,
    label: 'Meta Mensual',
  };
}
