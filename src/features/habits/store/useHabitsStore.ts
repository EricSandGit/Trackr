import { create } from 'zustand';
import { Habit, CreateHabitInput, UpdateHabitInput } from '@/core/types';
import { storageAdapter } from '@/services/storage';
import { generateId } from '@/core/utils/idGenerator';

interface HabitsStoreState {
  habits: Habit[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  loadHabits: () => Promise<void>;
  createHabit: (input: CreateHabitInput) => Promise<Habit>;
  updateHabit: (id: string, patch: UpdateHabitInput) => Promise<void>;
  toggleArchiveHabit: (id: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
}

export const useHabitsStore = create<HabitsStoreState>((set, get) => ({
  habits: [],
  isLoading: false,
  isInitialized: false,
  error: null,

  loadHabits: async () => {
    set({ isLoading: true, error: null });
    try {
      const habits = await storageAdapter.getHabits();
      set({ habits, isLoading: false, isInitialized: true });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false, isInitialized: true });
    }
  },

  createHabit: async (input: CreateHabitInput) => {
    const now = new Date().toISOString();
    const newHabit: Habit = {
      ...input,
      id: generateId(),
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };

    await storageAdapter.saveHabit(newHabit);
    set((state) => ({ habits: [...state.habits, newHabit] }));
    return newHabit;
  },

  updateHabit: async (id: string, patch: UpdateHabitInput) => {
    const existing = get().habits.find((h) => h.id === id);
    if (!existing) return;

    const updated: Habit = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    await storageAdapter.saveHabit(updated);
    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? updated : h)),
    }));
  },

  toggleArchiveHabit: async (id: string) => {
    const existing = get().habits.find((h) => h.id === id);
    if (!existing) return;

    const updated: Habit = {
      ...existing,
      isArchived: !existing.isArchived,
      updatedAt: new Date().toISOString(),
    };

    await storageAdapter.saveHabit(updated);
    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? updated : h)),
    }));
  },

  deleteHabit: async (id: string) => {
    await storageAdapter.deleteHabit(id);
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
    }));
  },
}));
