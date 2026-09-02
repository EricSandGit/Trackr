import { Habit, DailyActivityLog } from '@/core/types';
import { IStorageAdapter } from './IStorageAdapter';
import { supabase } from '@/services/supabase/supabaseClient';

export class SupabaseStorageAdapter implements IStorageAdapter {
  // --- HABITS ---
  async getHabits(): Promise<Habit[]> {
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

  async saveHabit(habit: Habit): Promise<void> {
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
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting habit from Supabase:', error);
      throw error;
    }
  }

  // --- LOGS ---
  async getLogs(): Promise<DailyActivityLog[]> {
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

  async getLogsByHabit(habitId: string): Promise<DailyActivityLog[]> {
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
    const habits = await this.getHabits();
    for (const h of habits) {
      await this.deleteHabit(h.id);
    }
  }
}
