import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Habit } from '@/core/types';
import { useAuthStore } from '@/features/auth';
import { HomeView } from '@/app/HomeView';

const AllHabitsView = lazy(() =>
  import('@/app/AllHabitsView').then((m) => ({ default: m.AllHabitsView }))
);
const HabitDetailView = lazy(() =>
  import('@/app/HabitDetailView').then((m) => ({ default: m.HabitDetailView }))
);

type ViewState =
  | { type: 'home' }
  | { type: 'all-habits' }
  | { type: 'detail'; habitId: string; returnTo: 'home' | 'all-habits' };

export const App: React.FC = () => {
  const { initializeAuth } = useAuthStore();
  const [currentView, setCurrentView] = useState<ViewState>({ type: 'home' });

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

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
    <Suspense fallback={null}>
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
    </Suspense>
  );
};
