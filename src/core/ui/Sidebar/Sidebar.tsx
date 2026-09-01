import React, { useMemo } from 'react';
import {
  CalendarDays,
  Layers,
  Activity,
  Settings,
  X,
} from 'lucide-react';
import { Habit } from '@/core/types';
import { useI18nStore } from '@/core/i18n';
import { UserAccountButton } from '@/features/auth';
import styles from './Sidebar.module.css';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: 'home' | 'all-habits' | 'casual-history' | 'detail';
  onNavigateHome: () => void;
  onNavigateAllHabits: (categoryFilter?: string) => void;
  onNavigateCasualHistory: () => void;
  onOpenSettings: () => void;
  habits: Habit[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentView,
  onNavigateHome,
  onNavigateAllHabits,
  onNavigateCasualHistory,
  onOpenSettings,
  habits,
}) => {
  const { t } = useI18nStore();

  // Aggregate categories & count
  const categoryStats = useMemo(() => {
    const map = new Map<string, { count: number; color: string }>();
    habits.forEach((h) => {
      const cat = h.category || 'General';
      const existing = map.get(cat);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(cat, { count: 1, color: h.color || 'var(--tk-accent)' });
      }
    });
    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      color: data.color,
    }));
  }, [habits]);

  const activeHabitsCount = habits.filter((h) => !h.isArchived).length;

  return (
    <>
      {/* Backdrop for mobile drawer mode */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar container */}
      <aside
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : styles.sidebarCollapsed}`}
        aria-label="Navegación principal"
      >
        {/* Mobile Header (Close button only, NO duplicate Trackr logo) */}
        <div className={styles.mobileHeader}>
          <span className={styles.mobileHeaderTitle}>{t('sidebar.navigationTitle')}</span>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t('sidebar.closeMenu')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Body */}
        <div className={styles.body}>
          {/* Main Views Section */}
          <div className={styles.section}>
            <span className={styles.sectionTitle}>{t('sidebar.navigationTitle')}</span>

            <button
              type="button"
              className={`${styles.navItem} ${currentView === 'home' ? styles.navItemActive : ''}`}
              onClick={() => {
                onNavigateHome();
                if (window.innerWidth <= 900) onClose();
              }}
            >
              <div className={styles.navItemLeft}>
                <CalendarDays size={16} />
                <span className={styles.navItemLabel}>{t('sidebar.dailyView')}</span>
              </div>
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${currentView === 'all-habits' ? styles.navItemActive : ''}`}
              onClick={() => {
                onNavigateAllHabits();
                if (window.innerWidth <= 900) onClose();
              }}
            >
              <div className={styles.navItemLeft}>
                <Layers size={16} />
                <span className={styles.navItemLabel}>{t('sidebar.allHabitsView')}</span>
              </div>
              <span
                className={`${styles.badge} ${currentView === 'all-habits' ? styles.badgeActive : ''}`}
              >
                {activeHabitsCount}
              </span>
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${currentView === 'casual-history' ? styles.navItemActive : ''}`}
              onClick={() => {
                onNavigateCasualHistory();
                if (window.innerWidth <= 900) onClose();
              }}
            >
              <div className={styles.navItemLeft}>
                <Activity size={16} />
                <span className={styles.navItemLabel}>{t('sidebar.casualHistory')}</span>
              </div>
            </button>
          </div>

          {/* Quick Categories Filter Section */}
          {categoryStats.length > 0 && (
            <div className={styles.section}>
              <span className={styles.sectionTitle}>{t('sidebar.categoriesTitle')}</span>

              {categoryStats.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  className={styles.navItem}
                  onClick={() => {
                    onNavigateAllHabits(cat.name);
                    if (window.innerWidth <= 900) onClose();
                  }}
                >
                  <div className={styles.navItemLeft}>
                    <span
                      className={styles.categoryDot}
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className={styles.navItemLabel}>{cat.name}</span>
                  </div>
                  <span className={styles.badge}>{cat.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <UserAccountButton variant="nav" />

          <button
            type="button"
            className={styles.navItem}
            onClick={() => {
              onOpenSettings();
              if (window.innerWidth <= 900) onClose();
            }}
          >
            <div className={styles.navItemLeft}>
              <Settings size={16} />
              <span className={styles.navItemLabel}>{t('nav.settings')}</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
