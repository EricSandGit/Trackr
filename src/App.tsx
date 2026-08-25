import React, { useEffect, useState } from 'react';
import { Habit } from '@/core/types';
import { useHabitsStore } from '@/features/habits';
import { useLogsStore } from '@/features/logging';
import { HomeView } from '@/app/HomeView';
import { AllHabitsView } from '@/app/AllHabitsView';
import { HabitDetailView } from '@/app/HabitDetailView';

type ViewState =
  | { type: 'home' }
  | { type: 'all-habits' }
  | { type: 'detail'; habitId: string; returnTo: 'home' | 'all-habits' };

export const App: React.FC = () => {
  const { loadHabits } = useHabitsStore();
  const { loadLogs } = useLogsStore();
  const [currentView, setCurrentView] = useState<ViewState>({ type: 'home' });

  useEffect(() => {
    loadHabits();
    loadLogs();
  }, [loadHabits, loadLogs]);

  const handleOpenDetailFromHome = (habit: Habit) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView({ type: 'detail', habitId: habit.id, returnTo: 'home' });
  };

  const handleOpenDetailFromAllHabits = (habit: Habit) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView({ type: 'detail', habitId: habit.id, returnTo: 'all-habits' });
  };

  const handleSwitchToDaily = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView({ type: 'home' });
  };

  const handleSwitchToAllHabits = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView({ type: 'all-habits' });
  };

  const handleBackFromDetail = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentView.type === 'detail') {
      setCurrentView({ type: currentView.returnTo });
    } else {
      setCurrentView({ type: 'home' });
    }
  };

  return (
    <>
      {currentView.type === 'home' && (
        <HomeView
          onOpenHabitDetail={handleOpenDetailFromHome}
          onSwitchToAllHabits={handleSwitchToAllHabits}
        />
      )}

      {currentView.type === 'all-habits' && (
        <AllHabitsView
          onOpenHabitDetail={handleOpenDetailFromAllHabits}
          onSwitchToDailyView={handleSwitchToDaily}
        />
      )}

      {currentView.type === 'detail' && (
        <HabitDetailView
          habitId={currentView.habitId}
          onBack={handleBackFromDetail}
        />
      )}
    </>
  );
};
