import React, { useEffect, useState } from 'react';
import { Habit } from '@/core/types';
import { useHabitsStore } from '@/features/habits';
import { useLogsStore } from '@/features/logging';
import { HomeView } from '@/app/HomeView';
import { HabitDetailView } from '@/app/HabitDetailView';

type ViewState =
  | { type: 'home' }
  | { type: 'detail'; habitId: string };

export const App: React.FC = () => {
  const { loadHabits } = useHabitsStore();
  const { loadLogs } = useLogsStore();
  const [currentView, setCurrentView] = useState<ViewState>({ type: 'home' });

  useEffect(() => {
    loadHabits();
    loadLogs();
  }, [loadHabits, loadLogs]);

  const handleOpenDetail = (habit: Habit) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView({ type: 'detail', habitId: habit.id });
  };

  const handleBackToHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView({ type: 'home' });
  };

  return (
    <>
      {currentView.type === 'home' && (
        <HomeView onOpenHabitDetail={handleOpenDetail} />
      )}

      {currentView.type === 'detail' && (
        <HabitDetailView
          habitId={currentView.habitId}
          onBack={handleBackToHome}
        />
      )}
    </>
  );
};
