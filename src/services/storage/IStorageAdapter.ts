import { Habit, DailyActivityLog } from '@/core/types';

export interface IStorageAdapter {
  // Habits CRUD
  getHabits(): Promise<Habit[]>;
  saveHabit(habit: Habit): Promise<void>;
  deleteHabit(id: string): Promise<void>;

  // Daily Logs CRUD
  getLogs(): Promise<DailyActivityLog[]>;
  getLogsByHabit(habitId: string): Promise<DailyActivityLog[]>;
  saveLog(log: DailyActivityLog): Promise<void>;
  deleteLog(id: string): Promise<void>;

  // Backup & Restore
  exportBackup(): Promise<string>;
  importBackup(jsonData: string): Promise<boolean>;
  resetAllData(): Promise<void>;
}
