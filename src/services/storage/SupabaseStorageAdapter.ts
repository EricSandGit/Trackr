import { Habit, DailyActivityLog } from '@/core/types';
import { IStorageAdapter } from './IStorageAdapter';
import { supabase } from '@/services/supabase/supabaseClient';

const HABITS_CACHE_KEY = 'tk_cloud_cache_habits';
const LOGS_CACHE_KEY = 'tk_cloud_cache_logs';

export class SupabaseStorageAdapter implements IStorageAdapter {
  public onHabitsUpdated?: (habits: Habit[]) => void;
  public onLogsUpdated?: (logs: DailyActivityLog[]) => void;

  private getCachedHabits(): Habit[] | null {
    try {
      const raw = localStorage.getItem(HABITS_CACHE_KEY);
      if (raw !== null) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  private setCachedHabits(habits: Habit[]): void {
    try {
      localStorage.setItem(HABITS_CACHE_KEY, JSON.stringify(habits));
    } catch (e) {}
  }

  private getCachedLogs(): DailyActivityLog[] | null {
    try {
      const raw = localStorage.getItem(LOGS_CACHE_KEY);
      if (raw !== null) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  private setCachedLogs(logs: DailyActivityLog[]): void {
    try {
      localStorage.setItem(LOGS_CACHE_KEY, JSON.stringify(logs));
    } catch (e) {}
  }

  public clearCache(): void {
    try {
      localStorage.removeItem(HABITS_CACHE_KEY);
      localStorage.removeItem(LOGS_CACHE_KEY);
    } catch (e) {}
  }

  // --- CLOUD NETWORK FETCHERS ---
  private async fetchHabitsFromCloud(): Promise<Habit[]> {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching habits from Supabase:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      icon: row.icon || 'Target',
      color: row.color || '#39d353',
      category: row.category || undefined,
      type: row.type || 'boolean',
      unit: row.unit || undefined,
      dailyGoal: row.daily_goal ? Number(row.daily_goal) : undefined,
      weeklyGoal: row.weekly_goal ? Number(row.weekly_goal) : undefined,
      monthlyGoal: row.monthly_goal ? Number(row.monthly_goal) : undefined,
      frequency: {
        type: row.frequency_type || 'everyday',
        daysOfWeek: row.frequency_days || undefined,
      },
      isArchived: row.is_archived || false,
      startDate: row.start_date || undefined,
      endDate: row.end_date || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  private async fetchLogsFromCloud(): Promise<DailyActivityLog[]> {
    const { data, error } = await supabase
      .from('daily_activity_logs')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching logs from Supabase:', error);
      throw error;
    }

    return (data || []).map((row: any) => {
      const totalValue = Number(row.total_value || 0);
      return {
        id: `${row.habit_id}_${row.date}`,
        habitId: row.habit_id,
        date: row.date,
        totalValue,
        isCompleted: totalValue > 0,
        isPersonalRecord: false,
        entries: [],
      };
    });
  }

  // --- HABITS (SWR / Instant Cache) ---
  async getHabits(): Promise<Habit[]> {
    const cached = this.getCachedHabits();

    const cloudPromise = this.fetchHabitsFromCloud()
      .then((fresh) => {
        this.setCachedHabits(fresh);
        if (cached !== null && this.onHabitsUpdated) {
          this.onHabitsUpdated(fresh);
        }
        return fresh;
      })
      .catch((err) => {
        if (cached !== null) {
          console.warn('Using cached habits (offline or network delay):', err);
          return cached;
        }
        throw err;
      });

    // If local cache is available, return immediately (<2ms)!
    if (cached !== null) {
      return cached;
    }

    return await cloudPromise;
  }

  async saveHabit(habit: Habit): Promise<void> {
    const cached = this.getCachedHabits();
    if (cached !== null) {
      const idx = cached.findIndex((h) => h.id === habit.id);
      const updated = idx >= 0
        ? cached.map((h) => (h.id === habit.id ? habit : h))
        : [...cached, habit];
      this.setCachedHabits(updated);
    }

    const row = {
      id: habit.id,
      name: habit.name,
      description: habit.description || null,
      icon: habit.icon || 'Target',
      color: habit.color,
      category: habit.category || null,
      type: habit.type,
      unit: habit.unit || null,
      daily_goal: habit.dailyGoal ?? null,
      weekly_goal: habit.weeklyGoal ?? null,
      monthly_goal: habit.monthlyGoal ?? null,
      frequency_type: habit.frequency.type,
      frequency_days: habit.frequency.daysOfWeek || null,
      is_archived: habit.isArchived,
      start_date: habit.startDate || null,
      end_date: habit.endDate || null,
      created_at: habit.createdAt,
      updated_at: habit.updatedAt || new Date().toISOString(),
    };

    const { error } = await supabase
      .from('habits')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error('Error saving habit to Supabase:', error);
      throw error;
    }
  }

  async deleteHabit(id: string): Promise<void> {
    const cached = this.getCachedHabits();
    if (cached !== null) {
      this.setCachedHabits(cached.filter((h) => h.id !== id));
    }

    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting habit from Supabase:', error);
      throw error;
    }
  }

  // --- LOGS (SWR / Instant Cache) ---
  async getLogs(): Promise<DailyActivityLog[]> {
    const cached = this.getCachedLogs();

    const cloudPromise = this.fetchLogsFromCloud()
      .then((fresh) => {
        this.setCachedLogs(fresh);
        if (cached !== null && this.onLogsUpdated) {
          this.onLogsUpdated(fresh);
        }
        return fresh;
      })
      .catch((err) => {
        if (cached !== null) {
          console.warn('Using cached logs (offline or network delay):', err);
          return cached;
        }
        throw err;
      });

    if (cached !== null) {
      return cached;
    }

    return await cloudPromise;
  }

  async getLogsByHabit(habitId: string): Promise<DailyActivityLog[]> {
    const cached = this.getCachedLogs();
    if (cached !== null) {
      return cached.filter((l) => l.habitId === habitId);
    }

    const { data, error } = await supabase
      .from('daily_activity_logs')
      .select('*')
      .eq('habit_id', habitId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching habit logs from Supabase:', error);
      throw error;
    }

    return (data || []).map((row: any) => {
      const totalValue = Number(row.total_value || 0);
      return {
        id: `${row.habit_id}_${row.date}`,
        habitId: row.habit_id,
        date: row.date,
        totalValue,
        isCompleted: totalValue > 0,
        isPersonalRecord: false,
        entries: [],
      };
    });
  }

  async saveLog(log: DailyActivityLog): Promise<void> {
    const cached = this.getCachedLogs();
    if (cached !== null) {
      const idx = cached.findIndex((l) => l.id === log.id);
      const updated = idx >= 0
        ? cached.map((l) => (l.id === log.id ? log : l))
        : [...cached, log];
      this.setCachedLogs(updated);
    }

    const row = {
      habit_id: log.habitId,
      date: log.date,
      total_value: log.totalValue,
    };

    const { error } = await supabase
      .from('daily_activity_logs')
      .upsert(row, { onConflict: 'habit_id,date' });

    if (error) {
      console.error('Error saving log to Supabase:', error);
      throw error;
    }
  }

  async deleteLog(id: string): Promise<void> {
    const cached = this.getCachedLogs();
    if (cached !== null) {
      this.setCachedLogs(cached.filter((l) => l.id !== id));
    }

    // id is `${habitId}_${date}`
    const separatorIdx = id.lastIndexOf('_');
    if (separatorIdx === -1) return;

    const habitId = id.substring(0, separatorIdx);
    const date = id.substring(separatorIdx + 1);

    const { error } = await supabase
      .from('daily_activity_logs')
      .delete()
      .eq('habit_id', habitId)
      .eq('date', date);

    if (error) {
      console.error('Error deleting log from Supabase:', error);
      throw error;
    }
  }

  // --- BACKUP & RESTORE ---
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
      if (Array.isArray(parsed.habits)) {
        for (const h of parsed.habits) {
          await this.saveHabit(h);
        }
      }
      if (Array.isArray(parsed.logs)) {
        for (const l of parsed.logs) {
          await this.saveLog(l);
        }
      }
      return true;
    } catch (e) {
      console.error('Failed to import backup into Supabase', e);
      return false;
    }
  }

  async resetAllData(): Promise<void> {
    this.clearCache();
    const habits = await this.getHabits();
    for (const h of habits) {
      await this.deleteHabit(h.id);
    }
  }
}
