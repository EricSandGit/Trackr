import React from 'react';
import { Habit } from '@/core/types';
import { AppHeader } from '../AppHeader';
import { Sidebar } from '../Sidebar';
import styles from './AppLayout.module.css';

export interface AppLayoutProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onCloseSidebar: () => void;
  currentView: 'home' | 'all-habits' | 'casual-history' | 'detail';
  onNavigateHome: () => void;
  onNavigateAllHabits: (categoryFilter?: string) => void;
  onNavigateCasualHistory: () => void;
  onOpenSettings: () => void;
  onOpenCreateHabit: () => void;
  habits: Habit[];
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  onCloseSidebar,
  currentView,
  onNavigateHome,
  onNavigateAllHabits,
  onNavigateCasualHistory,
  onOpenSettings,
  onOpenCreateHabit,
  habits,
  children,
}) => {
  return (
    <div className={styles.appWrapper}>
      <AppHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={onToggleSidebar}
        onNavigateHome={onNavigateHome}
        onOpenSettings={onOpenSettings}
        onOpenCreateHabit={onOpenCreateHabit}
      />

      <div className={styles.mainContainer}>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={onCloseSidebar}
          currentView={currentView}
          onNavigateHome={onNavigateHome}
          onNavigateAllHabits={onNavigateAllHabits}
          onNavigateCasualHistory={onNavigateCasualHistory}
          onOpenSettings={onOpenSettings}
          habits={habits}
        />

        <main className={styles.contentArea}>
          {children}
        </main>
      </div>
    </div>
  );
};
