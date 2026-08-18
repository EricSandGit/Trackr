export interface ActivityLogEntry {
  id: string;
  timestamp: string; // ISO String
  value: number; // For boolean habits: 1. For quantitative habits: added value (e.g. +15)
  notes?: string;
}

export interface DailyActivityLog {
  id: string; // Composite key: `${habitId}_${date}`
  habitId: string;
  date: string; // "YYYY-MM-DD"
  totalValue: number; // Total cumulative value for that day
  isCompleted: boolean; // true if marked as completed or reached dailyGoal
  isPersonalRecord: boolean; // true if this date achieved the all-time peak volume
  entries: ActivityLogEntry[];
}

export interface DayActivitySummary {
  date: string; // "YYYY-MM-DD"
  completedCount: number;
  totalPlannedCount: number;
  intensityLevel: 0 | 1 | 2 | 3 | 4;
  hasRecord: boolean;
  habitLogs: Array<{
    habitId: string;
    habitName: string;
    habitColor: string;
    habitIcon?: string;
    totalValue: number;
    unit?: string;
    dailyGoal?: number;
    isCompleted: boolean;
    isPersonalRecord: boolean;
  }>;
}
