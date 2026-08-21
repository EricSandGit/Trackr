import { Habit, DailyActivityLog, GlobalConsistencyStats, HabitIndividualStats } from '@/core/types';
import { formatDateToISO, shiftDate, isHabitScheduledOnDate } from './streakUtils';
import { isHabitSuccessfulOnDate } from '@/features/heatmap/logic/heatmapCalculator';

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
    const anyCompleted = activeHabits.some((habit) => {
      const log = logs.find((l) => l.habitId === habit.id && l.date === checkDate);
      return isHabitSuccessfulOnDate(habit, checkDate, log);
    });
    if (anyCompleted) {
      activeDaysInLast30++;
    }
  }
  const monthlyConsistencyPercentage = Math.round((activeDaysInLast30 / 30) * 100);

  // 2. Current global streak & Best global streak
  let currentStreak = 0;
  let isStreakActive = true;

  // Check today first, if not completed yet, check starting from yesterday
  const hasTodayActivity = activeHabits.some((habit) => {
    const log = logs.find((l) => l.habitId === habit.id && l.date === todayStr);
    return isHabitSuccessfulOnDate(habit, todayStr, log);
  });
  let offset = hasTodayActivity ? 0 : 1;

  while (isStreakActive && offset < 365) {
    const checkDate = shiftDate(todayStr, -offset);
    const anyCompleted = activeHabits.some((habit) => {
      const log = logs.find((l) => l.habitId === habit.id && l.date === checkDate);
      return isHabitSuccessfulOnDate(habit, checkDate, log);
    });

    if (anyCompleted) {
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
    activeHabits.forEach((habit) => {
      const log = logs.find((l) => l.habitId === habit.id && l.date === checkDate);
      if (isHabitSuccessfulOnDate(habit, checkDate, log)) {
        totalActivitiesThisWeek++;
      }
    });
  }

  // 4. Most consistent habit & habit to reinforce (last 30 days)
  const habitPerformances = activeHabits.map((habit) => {
    let plannedDaysCount = 0;
    let completedDaysCount = 0;

    for (let i = 0; i < 30; i++) {
      const checkDate = shiftDate(todayStr, -i);
      if (isHabitScheduledOnDate(habit, checkDate)) {
        plannedDaysCount++;
        const log = logs.find((l) => l.habitId === habit.id && l.date === checkDate);
        if (isHabitSuccessfulOnDate(habit, checkDate, log)) {
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

  if (habit.type === 'avoidance') {
    // Count days from creation date to today
    const creationDateStr = habit.createdAt ? formatDateToISO(new Date(habit.createdAt)) : todayStr;
    let scanOffset = 0;
    while (scanOffset < 730) {
      const checkDate = shiftDate(todayStr, -scanOffset);
      if (checkDate < creationDateStr) break;

      if (isHabitScheduledOnDate(habit, checkDate)) {
        const log = habitLogs.find((l) => l.date === checkDate);
        if (isHabitSuccessfulOnDate(habit, checkDate, log)) {
          totalLifetimeEntries++;
          totalLifetimeVolume++;
        }
      }
      scanOffset++;
    }
  } else {
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
  }

  // Calculate current streak for this habit
  let currentStreak = 0;
  let isStreakActive = true;

  // Check today
  const todayLog = habitLogs.find((l) => l.date === todayStr);
  const isTodayCleanOrCompleted = isHabitSuccessfulOnDate(habit, todayStr, todayLog);

  let offset = isTodayCleanOrCompleted ? 0 : 1;

  while (isStreakActive && offset < 365) {
    const checkDate = shiftDate(todayStr, -offset);
    if (habit.type === 'avoidance') {
      const creationDateStr = habit.createdAt ? formatDateToISO(new Date(habit.createdAt)) : todayStr;
      if (checkDate < creationDateStr) break;
    }

    const isScheduled = isHabitScheduledOnDate(habit, checkDate);

    if (isScheduled) {
      const log = habitLogs.find((l) => l.date === checkDate);
      if (isHabitSuccessfulOnDate(habit, checkDate, log)) {
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
      const log = habitLogs.find((l) => l.date === checkDate);
      if (isHabitSuccessfulOnDate(habit, checkDate, log)) {
        completedLast30++;
      }
    }
  }

  const completionRateLast30Days = plannedLast30 > 0 ? Math.round((completedLast30 / plannedLast30) * 100) : 0;

  return {
    currentStreak,
    bestStreak: Math.max(currentStreak, habit.type === 'avoidance' ? currentStreak : (allTimeRecordValue > 0 ? 14 : currentStreak)),
    totalLifetimeEntries,
    totalLifetimeVolume,
    unit: habit.unit,
    allTimeRecordValue,
    allTimeRecordDate,
    completionRateLast30Days,
  };
}
