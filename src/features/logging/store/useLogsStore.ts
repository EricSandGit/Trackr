import { create } from 'zustand';
import { DailyActivityLog, Habit } from '@/core/types';
import { storageAdapter } from '@/services/storage';
import { formatDateToISO } from '@/core/utils/dateUtils';
import { evaluateIfNewRecord } from '@/features/stats/logic/recordDetector';
import { triggerHaptic } from '@/core/utils/haptics';
import { fireRecordConfetti, fireCompletionConfetti } from '@/core/utils/confetti';
import { generateId } from '@/core/utils/idGenerator';

interface LogsStoreState {
  logs: DailyActivityLog[];
  selectedDate: string; // YYYY-MM-DD
  isLoading: boolean;
  error: string | null;

  setSelectedDate: (date: string) => void;
  loadLogs: () => Promise<void>;

  toggleBooleanHabit: (habit: Habit, date?: string) => Promise<void>;
  addQuantitativeVolume: (
    habit: Habit,
    amount: number,
    date?: string,
    notes?: string
  ) => Promise<{ isRecord: boolean; isNowCompleted: boolean }>;
  setDirectQuantitativeValue: (
    habit: Habit,
    totalValue: number,
    date?: string
  ) => Promise<{ isRecord: boolean; isNowCompleted: boolean }>;
}

export const useLogsStore = create<LogsStoreState>((set, get) => ({
  logs: [],
  selectedDate: formatDateToISO(new Date()),
  isLoading: false,
  error: null,

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
  },

  loadLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const logs = await storageAdapter.getLogs();
      set({ logs, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  toggleBooleanHabit: async (habit: Habit, targetDate?: string) => {
    const date = targetDate || get().selectedDate;
    const logId = `${habit.id}_${date}`;
    const existingLog = get().logs.find((l) => l.id === logId);

    const nowIso = new Date().toISOString();

    if (existingLog && existingLog.isCompleted) {
      // Toggle OFF
      const updatedLog: DailyActivityLog = {
        ...existingLog,
        totalValue: 0,
        isCompleted: false,
        isPersonalRecord: false,
        entries: [],
      };
      await storageAdapter.saveLog(updatedLog);
      set((state) => ({
        logs: state.logs.map((l) => (l.id === logId ? updatedLog : l)),
      }));
      triggerHaptic('light');
    } else {
      // Toggle ON
      const updatedLog: DailyActivityLog = {
        id: logId,
        habitId: habit.id,
        date,
        totalValue: 1,
        isCompleted: true,
        isPersonalRecord: false,
        entries: [
          {
            id: generateId(),
            timestamp: nowIso,
            value: 1,
          },
        ],
      };
      await storageAdapter.saveLog(updatedLog);
      set((state) => {
        const index = state.logs.findIndex((l) => l.id === logId);
        const newLogs = index >= 0
          ? state.logs.map((l) => (l.id === logId ? updatedLog : l))
          : [...state.logs, updatedLog];
        return { logs: newLogs };
      });
      triggerHaptic('success');
    }
  },

  addQuantitativeVolume: async (habit: Habit, amount: number, targetDate?: string, notes?: string) => {
    const date = targetDate || get().selectedDate;
    const logId = `${habit.id}_${date}`;
    const allLogs = get().logs;
    const existingLog = allLogs.find((l) => l.id === logId);

    const previousTotal = existingLog?.totalValue || 0;
    const newTotal = Math.max(0, previousTotal + amount);
    const goal = habit.dailyGoal || 0;
    const isNowCompleted = goal > 0 ? newTotal >= goal : newTotal > 0;

    const isRecord = evaluateIfNewRecord(habit.id, date, newTotal, allLogs);

    const entry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      value: amount,
      notes,
    };

    const updatedLog: DailyActivityLog = {
      id: logId,
      habitId: habit.id,
      date,
      totalValue: newTotal,
      isCompleted: isNowCompleted,
      isPersonalRecord: isRecord,
      entries: existingLog ? [...existingLog.entries, entry] : [entry],
    };

    await storageAdapter.saveLog(updatedLog);
    set((state) => {
      const index = state.logs.findIndex((l) => l.id === logId);
      const newLogs = index >= 0
        ? state.logs.map((l) => (l.id === logId ? updatedLog : l))
        : [...state.logs, updatedLog];
      return { logs: newLogs };
    });

    // Feedback
    if (isRecord && newTotal > 0) {
      triggerHaptic('record');
      fireRecordConfetti();
    } else if (isNowCompleted && previousTotal < goal) {
      triggerHaptic('success');
      fireCompletionConfetti();
    } else {
      triggerHaptic('medium');
    }

    return { isRecord, isNowCompleted };
  },

  setDirectQuantitativeValue: async (habit: Habit, totalValue: number, targetDate?: string) => {
    const date = targetDate || get().selectedDate;
    const logId = `${habit.id}_${date}`;
    const allLogs = get().logs;

    const goal = habit.dailyGoal || 0;
    const isNowCompleted = goal > 0 ? totalValue >= goal : totalValue > 0;
    const isRecord = evaluateIfNewRecord(habit.id, date, totalValue, allLogs);

    const updatedLog: DailyActivityLog = {
      id: logId,
      habitId: habit.id,
      date,
      totalValue: Math.max(0, totalValue),
      isCompleted: isNowCompleted,
      isPersonalRecord: isRecord,
      entries: [
        {
          id: generateId(),
          timestamp: new Date().toISOString(),
          value: totalValue,
        },
      ],
    };

    await storageAdapter.saveLog(updatedLog);
    set((state) => {
      const index = state.logs.findIndex((l) => l.id === logId);
      const newLogs = index >= 0
        ? state.logs.map((l) => (l.id === logId ? updatedLog : l))
        : [...state.logs, updatedLog];
      return { logs: newLogs };
    });

    if (isRecord && totalValue > 0) {
      triggerHaptic('record');
      fireRecordConfetti();
    } else if (isNowCompleted) {
      triggerHaptic('success');
    } else {
      triggerHaptic('light');
    }

    return { isRecord, isNowCompleted };
  },
}));
