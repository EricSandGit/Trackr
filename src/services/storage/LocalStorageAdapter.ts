import { Habit, DailyActivityLog } from '@/core/types';
import { IStorageAdapter } from './IStorageAdapter';
import { getMockInitialData } from './mockInitialData';

const HABITS_KEY = 'tk_habits_data_v1';
const LOGS_KEY = 'tk_logs_data_v1';
const SEEDED_KEY = 'tk_is_initialized_v1';

export class LocalStorageAdapter implements IStorageAdapter {
  constructor() {
    this.ensureSeeded();
  }

  private ensureSeeded(): void {
    if (typeof window === 'undefined') return;
    const isSeeded = localStorage.getItem(SEEDED_KEY);
    if (!isSeeded) {
      const { habits, logs } = getMockInitialData();
      localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
      localStorage.setItem(SEEDED_KEY, 'true');
    }
  }

  // Habits
  async getHabits(): Promise<Habit[]> {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(HABITS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load habits from localStorage', e);
      return [];
    }
  }

  async saveHabit(habit: Habit): Promise<void> {
    const habits = await this.getHabits();
    const index = habits.findIndex((h) => h.id === habit.id);
    if (index >= 0) {
      habits[index] = habit;
    } else {
      habits.push(habit);
    }
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  }

  async deleteHabit(id: string): Promise<void> {
    const habits = await this.getHabits();
    const filtered = habits.filter((h) => h.id !== id);
    localStorage.setItem(HABITS_KEY, JSON.stringify(filtered));

    // Also delete logs associated with this habit
    const logs = await this.getLogs();
    const remainingLogs = logs.filter((l) => l.habitId !== id);
    localStorage.setItem(LOGS_KEY, JSON.stringify(remainingLogs));
  }

  // Logs
  async getLogs(): Promise<DailyActivityLog[]> {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(LOGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load logs from localStorage', e);
      return [];
    }
  }

  async getLogsByHabit(habitId: string): Promise<DailyActivityLog[]> {
    const logs = await this.getLogs();
    return logs.filter((l) => l.habitId === habitId);
  }

  async saveLog(log: DailyActivityLog): Promise<void> {
    const logs = await this.getLogs();
    const index = logs.findIndex((l) => l.id === log.id);
    if (index >= 0) {
      logs[index] = log;
    } else {
      logs.push(log);
    }
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  }

  async deleteLog(id: string): Promise<void> {
    const logs = await this.getLogs();
    const filtered = logs.filter((l) => l.id !== id);
    localStorage.setItem(LOGS_KEY, JSON.stringify(filtered));
  }

  // Backup & Restore
  async exportBackup(): Promise<string> {
    const habits = await this.getHabits();
    const logs = await this.getLogs();
    const backupData = {
      app: 'Trackr',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      habits,
      logs,
    };
    return JSON.stringify(backupData, null, 2);
  }

  async importBackup(jsonData: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed.habits) && Array.isArray(parsed.logs)) {
        localStorage.setItem(HABITS_KEY, JSON.stringify(parsed.habits));
        localStorage.setItem(LOGS_KEY, JSON.stringify(parsed.logs));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to parse backup file', e);
      return false;
    }
  }

  async resetAllData(): Promise<void> {
    localStorage.removeItem(HABITS_KEY);
    localStorage.removeItem(LOGS_KEY);
    localStorage.removeItem(SEEDED_KEY);
    this.ensureSeeded();
  }
}
