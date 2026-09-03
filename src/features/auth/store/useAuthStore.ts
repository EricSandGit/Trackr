import { create } from 'zustand';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/services/supabase/supabaseClient';
import { storageManager } from '@/services/storage';
import { useHabitsStore } from '@/features/habits';
import { useLogsStore } from '@/features/logging';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  authError: string | null;

  initializeAuth: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null; user: User | null }>;
  signOut: () => Promise<void>;
  migrateLocalDataToCloud: () => Promise<{ success: boolean; count: number }>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,
  authError: null,

  clearError: () => set({ authError: null }),

  initializeAuth: async () => {
    if (!isSupabaseConfigured) {
      storageManager.setMode('local');
      set({ isInitialized: true, isLoading: false });
      await Promise.all([
        useHabitsStore.getState().loadHabits(),
        useLogsStore.getState().loadLogs(),
      ]);
      return;
    }

    set({ isLoading: true, authError: null });

    try {
      // 1. Check existing session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session?.user) {
        storageManager.setMode('supabase');
        set({ user: session.user, session, isLoading: false, isInitialized: true });
        // Refresh stores
        await Promise.all([
          useHabitsStore.getState().loadHabits(),
          useLogsStore.getState().loadLogs(),
        ]);
      } else {
        storageManager.setMode('local');
        set({ user: null, session: null, isLoading: false, isInitialized: true });
        await Promise.all([
          useHabitsStore.getState().loadHabits(),
          useLogsStore.getState().loadLogs(),
        ]);
      }

      // 2. Listen to auth state changes
      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (newSession?.user) {
          storageManager.setMode('supabase');
          set({ user: newSession.user, session: newSession, isLoading: false });
          await useHabitsStore.getState().loadHabits();
          await useLogsStore.getState().loadLogs();
        } else {
          storageManager.setMode('local');
          set({ user: null, session: null, isLoading: false });
          await useHabitsStore.getState().loadHabits();
          await useLogsStore.getState().loadLogs();
        }
      });
    } catch (err) {
      console.error('Error initializing auth:', err);
      storageManager.setMode('local');
      set({ authError: (err as Error).message, isLoading: false, isInitialized: true });
      await Promise.all([
        useHabitsStore.getState().loadHabits(),
        useLogsStore.getState().loadLogs(),
      ]);
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, authError: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        set({ authError: error.message, isLoading: false });
        return { error };
      }

      return { error: null };
    } catch (err) {
      const error = err as AuthError;
      set({ authError: error.message, isLoading: false });
      return { error };
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, authError: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        set({ authError: error.message, isLoading: false });
        return { error };
      }

      if (data.session?.user) {
        storageManager.setMode('supabase');
        set({ user: data.session.user, session: data.session, isLoading: false });
        await useHabitsStore.getState().loadHabits();
        await useLogsStore.getState().loadLogs();
      }

      return { error: null };
    } catch (err) {
      const error = err as AuthError;
      set({ authError: error.message, isLoading: false });
      return { error };
    }
  },

  signUpWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, authError: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        set({ authError: error.message, isLoading: false });
        return { error, user: null };
      }

      if (data.session?.user) {
        storageManager.setMode('supabase');
        set({ user: data.session.user, session: data.session, isLoading: false });
        await useHabitsStore.getState().loadHabits();
        await useLogsStore.getState().loadLogs();
      }

      set({ isLoading: false });
      return { error: null, user: data.user };
    } catch (err) {
      const error = err as AuthError;
      set({ authError: error.message, isLoading: false });
      return { error, user: null };
    }
  },

  signOut: async () => {
    set({ isLoading: true, authError: null });
    try {
      await supabase.auth.signOut();
      storageManager.setMode('local');
      set({ user: null, session: null, isLoading: false });
      await useHabitsStore.getState().loadHabits();
      await useLogsStore.getState().loadLogs();
    } catch (err) {
      console.error('Error signing out:', err);
      set({ isLoading: false });
    }
  },

  migrateLocalDataToCloud: async () => {
    const user = get().user;
    if (!user) return { success: false, count: 0 };

    try {
      const localAdapter = storageManager.getLocalAdapter();
      const supabaseAdapter = storageManager.getSupabaseAdapter();

      const localHabits = await localAdapter.getHabits();
      const localLogs = await localAdapter.getLogs();

      let migratedHabitsCount = 0;

      for (const habit of localHabits) {
        await supabaseAdapter.saveHabit(habit);
        migratedHabitsCount++;
      }

      for (const log of localLogs) {
        await supabaseAdapter.saveLog(log);
      }

      // Reload cloud data into stores
      await useHabitsStore.getState().loadHabits();
      await useLogsStore.getState().loadLogs();

      return { success: true, count: migratedHabitsCount };
    } catch (err) {
      console.error('Failed to migrate local data to cloud:', err);
      return { success: false, count: 0 };
    }
  },
}));
