import { Habit, DailyActivityLog, DayActivitySummary } from '@/core/types';
import { parseISODate } from '@/core/utils/dateUtils';

/**
 * Checks whether a habit was scheduled/planned on a specific date (day of week)
 */
export function isHabitScheduledOnDate(habit: Habit, dateStr: string): boolean {
  if (habit.isArchived) return false;
  if (habit.frequency.type === 'everyday') return true;

  if (habit.frequency.type === 'specific_days' && habit.frequency.daysOfWeek) {
    const date = parseISODate(dateStr);
    const dayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday ...
    return habit.frequency.daysOfWeek.includes(dayOfWeek);
  }

  return true;
}

/**
 * Checks whether a habit was completed/clean on a specific date.
 * - For boolean/quantitative habits: requires an explicit completed log.
 * - For avoidance habits: scheduled days between creation date and today are clean by default,
 *   unless a relapse log (isCompleted === false) is recorded.
 */
export function isHabitSuccessfulOnDate(
  habit: Habit,
  dateStr: string,
  log?: DailyActivityLog
): boolean {
  if (!isHabitScheduledOnDate(habit, dateStr)) return false;

  if (habit.type === 'avoidance') {
    const todayStr = new Date().toISOString().slice(0, 10);
    // Future dates cannot be completed yet
    if (dateStr > todayStr) return false;

    const creationDateStr = habit.createdAt ? habit.createdAt.slice(0, 10) : todayStr;
    if (dateStr < creationDateStr) return false;

    if (log) {
      return log.isCompleted !== false;
    }
    return true;
  }

  return !!log?.isCompleted;
}

/**
 * Calculates intensity level 0..4 for the Global Heatmap combining all habits on a given date
 */
export function calculateGlobalDaySummary(
  date: string,
  habits: Habit[],
  logs: DailyActivityLog[]
): DayActivitySummary {
  const scheduledHabits = habits.filter((h) => isHabitScheduledOnDate(h, date));
  const totalPlannedCount = scheduledHabits.length;

  let completedCount = 0;
  let hasRecord = false;

  const habitLogsSummary = scheduledHabits.map((habit) => {
    const log = logs.find((l) => l.habitId === habit.id && l.date === date);
    const isCompleted = isHabitSuccessfulOnDate(habit, date, log);
    const isRecord = !!log?.isPersonalRecord;

    if (isCompleted) {
      completedCount++;
    }
    if (isRecord) {
      hasRecord = true;
    }

    return {
      habitId: habit.id,
      habitName: habit.name,
      habitColor: habit.color,
      habitIcon: habit.icon,
      totalValue: log?.totalValue || (habit.type === 'avoidance' && isCompleted ? 1 : 0),
      unit: habit.unit,
      dailyGoal: habit.dailyGoal,
      isCompleted,
      isPersonalRecord: isRecord,
    };
  });

  // Calculate percentage & discrete intensity level (0..4)
  let intensityLevel: 0 | 1 | 2 | 3 | 4 = 0;
  if (totalPlannedCount > 0 && completedCount > 0) {
    const ratio = completedCount / totalPlannedCount;
    if (ratio >= 0.99) {
      intensityLevel = 4; // 100%
    } else if (ratio >= 0.65) {
      intensityLevel = 3;
    } else if (ratio >= 0.35) {
      intensityLevel = 2;
    } else {
      intensityLevel = 1;
    }
  }

  return {
    date,
    completedCount,
    totalPlannedCount,
    intensityLevel,
    hasRecord,
    habitLogs: habitLogsSummary,
  };
}

/**
 * Calculates intensity level 0..4 for an individual habit on a specific date
 */
export function calculateHabitDayIntensity(
  date: string,
  habit: Habit,
  log?: DailyActivityLog
): { level: 0 | 1 | 2 | 3 | 4; isRecord: boolean; isCompleted: boolean; value: number } {
  if (habit.type === 'avoidance') {
    const isCompleted = isHabitSuccessfulOnDate(habit, date, log);
    return {
      level: isCompleted ? 4 : 0,
      isRecord: false,
      isCompleted,
      value: isCompleted ? 1 : 0,
    };
  }

  if (!log || log.totalValue <= 0) {
    return { level: 0, isRecord: false, isCompleted: false, value: 0 };
  }

  const isRecord = !!log.isPersonalRecord;
  const isCompleted = !!log.isCompleted;
  const value = log.totalValue;

  if (habit.type === 'boolean') {
    return {
      level: isCompleted ? 4 : 0,
      isRecord: false,
      isCompleted,
      value,
    };
  }

  // Quantitative: based on ratio vs dailyGoal
  const goal = habit.dailyGoal && habit.dailyGoal > 0 ? habit.dailyGoal : 1;
  const ratio = value / goal;

  let level: 0 | 1 | 2 | 3 | 4 = 1;
  if (ratio >= 1.0) {
    level = 4;
  } else if (ratio >= 0.65) {
    level = 3;
  } else if (ratio >= 0.35) {
    level = 2;
  } else {
    level = 1;
  }

  return {
    level,
    isRecord,
    isCompleted,
    value,
  };
}

/**
 * Generates transparent opacity / lightness based on custom habit color Hex
 */
export function getHabitCustomColorShade(
  hexColor: string,
  level: 0 | 1 | 2 | 3 | 4,
  isDarkTheme: boolean = true
): string {
  if (level === 0) {
    return isDarkTheme ? 'var(--tk-cell-empty)' : 'var(--tk-cell-empty)';
  }

  const opacities = {
    1: 0.3,
    2: 0.55,
    3: 0.8,
    4: 1.0,
  };

  const alpha = opacities[level] || 1;

  // Convert Hex to RGBA
  const hex = hexColor.replace('#', '');
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return hexColor;
}
