export interface GlobalConsistencyStats {
  monthlyConsistencyPercentage: number; // e.g. 85%
  currentGlobalStreak: number; // consecutive active days
  bestGlobalStreak: number;
  totalActivitiesThisWeek: number;
  activeHabitsCount: number;
  mostConsistentHabit: {
    id: string;
    name: string;
    icon?: string;
    color: string;
    percentage: number;
  } | null;
  habitToReinforce: {
    id: string;
    name: string;
    icon?: string;
    color: string;
    percentage: number;
  } | null;
}

export interface HabitIndividualStats {
  currentStreak: number;
  bestStreak: number;
  totalLifetimeEntries: number;
  totalLifetimeVolume: number;
  unit?: string;
  allTimeRecordValue: number;
  allTimeRecordDate: string | null;
  completionRateLast30Days: number;
}
