import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Habit } from '@/core/types';
import { useAuthStore } from '@/features/auth';
import { useHabitsStore } from '@/features/habits';
import { useLogsStore } from '@/features/logging';
import { AppLayout } from '@/core/ui/AppLayout';
import { HomeView } from '@/app/HomeView';

const AllHabitsView = lazy(() =>
  import('@/app/AllHabitsView').then((m) => ({ default: m.AllHabitsView }))
);
const HabitDetailView = lazy(() =>
  import('@/app/HabitDetailView').then((m) => ({ default: m.HabitDetailView }))
);
const CasualHistoryView = lazy(() =>
  import('@/app/CasualHistoryView').then((m) => ({ default: m.CasualHistoryView }))
);
const HabitFormModal = lazy(() =>
  import('@/features/habits').then((m) => ({ default: m.HabitFormModal }))
);
const SettingsModal = lazy(() =>
  import('@/features/settings').then((m) => ({ default: m.SettingsModal }))
);
const PrivacyPolicyModal = lazy(() =>
  import('@/features/legal').then((m) => ({ default: m.PrivacyPolicyModal }))
);
const TermsOfServiceModal = lazy(() =>
  import('@/features/legal').then((m) => ({ default: m.TermsOfServiceModal }))
);
const LegalConsentModal = lazy(() =>
  import('@/features/legal').then((m) => ({ default: m.LegalConsentModal }))
);

const TERMS_ACCEPTED_KEY = 'tk_terms_accepted_v1';

type ViewState =
  | { type: 'home' }
  | { type: 'all-habits' }
  | { type: 'casual-history' }
  | { type: 'detail'; habitId: string; returnTo: 'home' | 'all-habits' | 'casual-history' };

export const App: React.FC = () => {
  const { initializeAuth } = useAuthStore();
  const { habits, loadHabits, createHabit } = useHabitsStore();
  const { logs, loadLogs } = useLogsStore();

  const [currentView, setCurrentView] = useState<ViewState>({ type: 'home' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth > 900;
  });

  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string | undefined>(undefined);
  const [isCreateHabitOpen, setIsCreateHabitOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDirectPrivacyOpen, setIsDirectPrivacyOpen] = useState(false);
  const [isDirectTermsOpen, setIsDirectTermsOpen] = useState(false);
  const [isConsentRequired, setIsConsentRequired] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(TERMS_ACCEPTED_KEY) !== 'true';
  });

  const handleAcceptConsent = () => {
    localStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
    setIsConsentRequired(false);
  };

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

    const handleResize = () => {
      if (window.innerWidth <= 900) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);

    // Smoothly dismiss splash screen once mounted
    const splash = document.getElementById('splash-screen');
    if (splash) {
      setTimeout(() => {
        splash.classList.add('splash-fade-out');
        setTimeout(() => {
          splash.remove();
        }, 450);
      }, 350);
    }

    return () => {
      window.removeEventListener('hashchange', checkLegalRoute);
      window.removeEventListener('resize', handleResize);
    };
  }, [initializeAuth]);

  const handleDataResetOrImported = async () => {
    await loadHabits();
    await loadLogs();
  };

  const handleOpenDetailFromHome = (habit: Habit) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView({ type: 'detail', habitId: habit.id, returnTo: 'home' });
  };

  const handleOpenDetailFromAllHabits = (habit: Habit) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView({ type: 'detail', habitId: habit.id, returnTo: 'all-habits' });
  };

  const handleOpenDetailFromCasualHistory = (habit: Habit) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView({ type: 'detail', habitId: habit.id, returnTo: 'casual-history' });
  };

  const handleSwitchToDaily = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCatalogCategoryFilter(undefined);
    setCurrentView({ type: 'home' });
  };

  const handleSwitchToAllHabits = (category?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCatalogCategoryFilter(category);
    setCurrentView({ type: 'all-habits' });
  };

  const handleSwitchToCasualHistory = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCatalogCategoryFilter(undefined);
    setCurrentView({ type: 'casual-history' });
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
    <AppLayout
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      onCloseSidebar={() => setIsSidebarOpen(false)}
      currentView={currentView.type}
      onNavigateHome={handleSwitchToDaily}
      onNavigateAllHabits={handleSwitchToAllHabits}
      onNavigateCasualHistory={handleSwitchToCasualHistory}
      onOpenSettings={() => setIsSettingsOpen(true)}
      onOpenCreateHabit={() => setIsCreateHabitOpen(true)}
      habits={habits}
    >
      <Suspense fallback={null}>
        {currentView.type === 'home' && (
          <HomeView
            onOpenHabitDetail={handleOpenDetailFromHome}
            onOpenCasualHistory={handleSwitchToCasualHistory}
            onOpenCreateHabit={() => setIsCreateHabitOpen(true)}
          />
        )}

        {currentView.type === 'all-habits' && (
          <AllHabitsView
            onOpenHabitDetail={handleOpenDetailFromAllHabits}
            onOpenCreateHabit={() => setIsCreateHabitOpen(true)}
            initialCategory={catalogCategoryFilter}
          />
        )}

        {currentView.type === 'casual-history' && (
          <CasualHistoryView
            habits={habits}
            logs={logs}
            onOpenHabitDetail={handleOpenDetailFromCasualHistory}
          />
        )}

        {currentView.type === 'detail' && (
          <HabitDetailView
            habitId={currentView.habitId}
            onBack={handleBackFromDetail}
          />
        )}
      </Suspense>

      {/* Global Modals */}
      {isCreateHabitOpen && (
        <Suspense fallback={null}>
          <HabitFormModal
            isOpen={isCreateHabitOpen}
            onClose={() => setIsCreateHabitOpen(false)}
            onSubmit={async (input) => {
              await createHabit(input as any);
            }}
          />
        </Suspense>
      )}

      {isSettingsOpen && (
        <Suspense fallback={null}>
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onDataResetOrImported={handleDataResetOrImported}
          />
        </Suspense>
      )}

      {isDirectPrivacyOpen && (
        <Suspense fallback={null}>
          <PrivacyPolicyModal
            isOpen={isDirectPrivacyOpen}
            onClose={() => {
              setIsDirectPrivacyOpen(false);
              if (window.location.hash.includes('privacy')) {
                window.history.replaceState(null, '', window.location.pathname);
              }
            }}
          />
        </Suspense>
      )}

      {isDirectTermsOpen && (
        <Suspense fallback={null}>
          <TermsOfServiceModal
            isOpen={isDirectTermsOpen}
            onClose={() => {
              setIsDirectTermsOpen(false);
              if (window.location.hash.includes('terms')) {
                window.history.replaceState(null, '', window.location.pathname);
              }
            }}
          />
        </Suspense>
      )}

      {isConsentRequired && (
        <Suspense fallback={null}>
          <LegalConsentModal
            isOpen={isConsentRequired}
            onAccept={handleAcceptConsent}
          />
        </Suspense>
      )}
    </AppLayout>
  );
};
