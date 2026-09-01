import React from 'react';
import { Menu, Plus, PanelLeft } from 'lucide-react';
import { useI18nStore } from '@/core/i18n';
import styles from './AppHeader.module.css';

export interface AppHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNavigateHome: () => void;
  onOpenSettings?: () => void;
  onOpenCreateHabit: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  onNavigateHome,
  onOpenCreateHabit,
}) => {
  const { t } = useI18nStore();

  return (
    <header className={styles.topBar}>
      <div className={styles.topLeft}>
        <button
          type="button"
          className={`${styles.menuBtn} ${isSidebarOpen ? styles.menuBtnActive : ''}`}
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? t('sidebar.closeMenu') : t('sidebar.openMenu')}
          title={isSidebarOpen ? t('sidebar.closeMenu') : t('sidebar.openMenu')}
        >
          {isSidebarOpen ? <PanelLeft size={18} /> : <Menu size={18} />}
        </button>

        <div className={styles.brand} onClick={onNavigateHome}>
          <div className={styles.brandIcon}>
            <div className={styles.brandIconDot} style={{ backgroundColor: '#238636' }} />
            <div className={styles.brandIconDot} style={{ backgroundColor: '#39d353' }} />
            <div className={styles.brandIconDot} style={{ backgroundColor: '#0e4429' }} />
            <div className={styles.brandIconDot} style={{ backgroundColor: '#2ea043' }} />
          </div>
          <h1 className={styles.brandTitle}>Trackr</h1>
          <span className={styles.brandBadge}>PWA</span>
        </div>
      </div>

      <div className={styles.topActions}>
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.createBtn}`}
          onClick={onOpenCreateHabit}
          aria-label={t('nav.newHabit')}
          title={t('nav.newHabit')}
        >
          <Plus size={18} strokeWidth={2.5} />
          <span className={styles.createBtnLabel}>{t('nav.newHabit')}</span>
        </button>
      </div>
    </header>
  );
};
