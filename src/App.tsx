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
const PrivacyPolicyModal = lazy(() =>
  import('@/features/legal').then((m) => ({ default: m.PrivacyPolicyModal }))
);
const TermsOfServiceModal = lazy(() =>
  import('@/features/legal').then((m) => ({ default: m.TermsOfServiceModal }))
);

type ViewState =
  | { type: 'home' }
  | { type: 'all-habits' }
  | { type: 'detail'; habitId: string; returnTo: 'home' | 'all-habits' };

export const App: React.FC = () => {
  const { initializeAuth } = useAuthStore();
  const [currentView, setCurrentView] = useState<ViewState>({ type: 'home' });
  const [isDirectPrivacyOpen, setIsDirectPrivacyOpen] = useState(false);
  const [isDirectTermsOpen, setIsDirectTermsOpen] = useState(false);

  useEffect(() => {
    initializeAuth();

    const checkLegalRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();

      if (hash.includes('privacy') || path.includes('privacy') || search.includes('privacy')) {
        setIsDirectPrivacyOpen(true);
      } else if (hash.includes('terms') || path.includes('terms') || search.includes('terms')) {
        setIsDirectTermsOpen(true);
      }
    };

    checkLegalRoute();
    window.addEventListener('hashchange', checkLegalRoute);
    return () => window.removeEventListener('hashchange', checkLegalRoute);
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

      {isDirectPrivacyOpen && (
        <PrivacyPolicyModal
          isOpen={isDirectPrivacyOpen}
          onClose={() => {
            setIsDirectPrivacyOpen(false);
            if (window.location.hash.includes('privacy')) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }}
        />
      )}

      {isDirectTermsOpen && (
        <TermsOfServiceModal
          isOpen={isDirectTermsOpen}
          onClose={() => {
            setIsDirectTermsOpen(false);
            if (window.location.hash.includes('terms')) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }}
        />
      )}
    </Suspense>
  );
};
