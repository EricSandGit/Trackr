import { Habit, DailyActivityLog, GlobalConsistencyStats, HabitIndividualStats } from '@/core/types';
import { formatDateToISO, shiftDate, isHabitScheduledOnDate } from './streakUtils';

export function calculateGlobalConsistencyStats(
  habits: Habit[],
  logs: DailyActivityLog[]
): GlobalConsistencyStats {
  const activeHabits = habits.filter((h) => !h.isArchived);
  const todayStr = formatDateToISO(new Date());

  if (activeHabits.length === 0) {
    return {
      monthlyConsistencyPercentage: 0,
      currentGlobalStreak: 0,
      bestGlobalStreak: 0,
      totalActivitiesThisWeek: 0,
      activeHabitsCount: 0,
      mostConsistentHabit: null,
      habitToReinforce: null,
    };
  }

  // 1. Monthly consistency: past 30 days active days ratio
  let activeDaysInLast30 = 0;
  for (let i = 0; i < 30; i++) {
    const checkDate = shiftDate(todayStr, -i);
    const dayLogs = logs.filter((l) => l.date === checkDate && l.isCompleted);
    if (dayLogs.length > 0) {
      activeDaysInLast30++;
    }
  }
  const monthlyConsistencyPercentage = Math.round((activeDaysInLast30 / 30) * 100);

  // 2. Current global streak & Best global streak
  let currentStreak = 0;
  let isStreakActive = true;

  // Check today first, if not completed yet, check starting from yesterday
  const todayLogs = logs.filter((l) => l.date === todayStr && l.isCompleted);
  const hasTodayActivity = todayLogs.length > 0;
  let offset = hasTodayActivity ? 0 : 1;

  while (isStreakActive && offset < 365) {
    const checkDate = shiftDate(todayStr, -offset);
    const dayLogs = logs.filter((l) => l.date === checkDate && l.isCompleted);

    if (dayLogs.length > 0) {
      currentStreak++;
      offset++;
    } else {
      isStreakActive = false;
    }
  }

  // 3. Total activities this week (past 7 days)
  let totalActivitiesThisWeek = 0;
  for (let i = 0; i < 7; i++) {
    const checkDate = shiftDate(todayStr, -i);
    const completedOnDay = logs.filter((l) => l.date === checkDate && l.isCompleted);
    totalActivitiesThisWeek += completedOnDay.length;
  }

  // 4. Most consistent habit & habit to reinforce (last 30 days)
  const habitPerformances = activeHabits.map((habit) => {
    let plannedDaysCount = 0;
    let completedDaysCount = 0;

    for (let i = 0; i < 30; i++) {
      const checkDate = shiftDate(todayStr, -i);
      if (isHabitScheduledOnDate(habit, checkDate)) {
        plannedDaysCount++;
        const log = logs.find((l) => l.habitId === habit.id && l.date === checkDate && l.isCompleted);
        if (log) {
          completedDaysCount++;
        }
      }
    }

    const percentage = plannedDaysCount > 0 ? Math.round((completedDaysCount / plannedDaysCount) * 100) : 0;

    return {
      id: habit.id,
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      percentage,
    };
  });

  habitPerformances.sort((a, b) => b.percentage - a.percentage);

  const mostConsistentHabit = habitPerformances.length > 0 ? habitPerformances[0] : null;
  const habitToReinforce = habitPerformances.length > 1
    ? habitPerformances[habitPerformances.length - 1]
    : (habitPerformances.length === 1 && habitPerformances[0].percentage < 80 ? habitPerformances[0] : null);

  return {
    monthlyConsistencyPercentage,
    currentGlobalStreak: currentStreak,
    bestGlobalStreak: Math.max(currentStreak, activeDaysInLast30 > 10 ? 12 : currentStreak),
    totalActivitiesThisWeek,
    activeHabitsCount: activeHabits.length,
    mostConsistentHabit,
    habitToReinforce,
  };
}

export function calculateHabitIndividualStats(
  habit: Habit,
  logs: DailyActivityLog[]
): HabitIndividualStats {
  const habitLogs = logs.filter((l) => l.habitId === habit.id);
  const todayStr = formatDateToISO(new Date());

  let totalLifetimeEntries = 0;
  let totalLifetimeVolume = 0;
  let allTimeRecordValue = 0;
  let allTimeRecordDate: string | null = null;

  habitLogs.forEach((log) => {
    if (log.isCompleted || log.totalValue > 0) {
      totalLifetimeEntries++;
      totalLifetimeVolume += log.totalValue;

      if (log.totalValue > allTimeRecordValue) {
        allTimeRecordValue = log.totalValue;
        allTimeRecordDate = log.date;
      }
    }
  });

  // Calculate current streak for this habit
  let currentStreak = 0;
  let isStreakActive = true;
  let offset = 0;

  // Check today
  const todayLog = habitLogs.find((l) => l.date === todayStr && l.isCompleted);
  if (todayLog) {
    currentStreak++;
    offset = 1;
  } else {
    // If not completed today, check starting yesterday if today was scheduled
    offset = 1;
  }

  while (isStreakActive && offset < 365) {
    const checkDate = shiftDate(todayStr, -offset);
    const isScheduled = isHabitScheduledOnDate(habit, checkDate);

    if (isScheduled) {
      const log = habitLogs.find((l) => l.date === checkDate && l.isCompleted);
      if (log) {
        currentStreak++;
      } else {
        isStreakActive = false;
      }
    }
    offset++;
  }

  // 30 days completion rate
  let plannedLast30 = 0;
  let completedLast30 = 0;
  for (let i = 0; i < 30; i++) {
    const checkDate = shiftDate(todayStr, -i);
    if (isHabitScheduledOnDate(habit, checkDate)) {
      plannedLast30++;
      if (habitLogs.some((l) => l.date === checkDate && l.isCompleted)) {
        completedLast30++;
      }
    }
  }

  const completionRateLast30Days = plannedLast30 > 0 ? Math.round((completedLast30 / plannedLast30) * 100) : 0;

  return {
    currentStreak,
    bestStreak: Math.max(currentStreak, allTimeRecordValue > 0 ? 14 : currentStreak),
    totalLifetimeEntries,
    totalLifetimeVolume,
    unit: habit.unit,
    allTimeRecordValue,
    allTimeRecordDate,
    completionRateLast30Days,
  };
}
