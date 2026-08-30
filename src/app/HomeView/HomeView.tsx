import React, { useState, Suspense, lazy } from 'react';
import { Plus, Settings, CalendarDays, Layers } from 'lucide-react';
import { Habit } from '@/core/types';
import { useHabitsStore } from '@/features/habits';
import { useLogsStore } from '@/features/logging';
import { GlobalHeatmap } from '@/features/heatmap';
import { ConsistencyOverview } from '@/features/stats';
import { HabitList, CasualActivitiesSection } from '@/features/habits';
import { UserAccountButton } from '@/features/auth';
import { DateNavigator } from '@/core/ui/DateNavigator';
import { useI18nStore } from '@/core/i18n';
import styles from './HomeView.module.css';

const QuickLogBottomSheet = lazy(() =>
  import('@/features/logging').then((m) => ({ default: m.QuickLogBottomSheet }))
);
const HabitFormModal = lazy(() =>
  import('@/features/habits').then((m) => ({ default: m.HabitFormModal }))
);
const CasualActivityModal = lazy(() =>
  import('@/features/habits').then((m) => ({ default: m.CasualActivityModal }))
);
const CasualHistoryModal = lazy(() =>
  import('@/features/habits').then((m) => ({ default: m.CasualHistoryModal }))
);
const SettingsModal = lazy(() =>
  import('@/features/settings').then((m) => ({ default: m.SettingsModal }))
);

export interface HomeViewProps {
  onOpenHabitDetail: (habit: Habit) => void;
  onSwitchToAllHabits: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenHabitDetail,
  onSwitchToAllHabits,
}) => {
  const { habits, loadHabits, createHabit } = useHabitsStore();
  const {
    logs,
    selectedDate,
    setSelectedDate,
    loadLogs,
    toggleBooleanHabit,
    toggleAvoidanceHabit,
    addQuantitativeVolume,
    setDirectQuantitativeValue,
    deleteLogForDate,
  } = useLogsStore();
  const { t } = useI18nStore();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCasualModalOpen, setIsCasualModalOpen] = useState(false);
  const [isCasualHistoryModalOpen, setIsCasualHistoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [quickLogHabit, setQuickLogHabit] = useState<Habit | null>(null);

  const handleOpenQuickLog = (habit: Habit) => {
    setQuickLogHabit(habit);
  };

  const handleCloseQuickLog = () => {
    setQuickLogHabit(null);
  };

  const handleDataResetOrImported = async () => {
    await loadHabits();
    await loadLogs();
  };

  const handleLogExistingCasualActivity = async (habit: Habit, amount?: number) => {
    if (habit.type === 'quantitative') {
      await setDirectQuantitativeValue(habit, amount || 1, selectedDate);
    } else {
      const existing = logs.find((l) => l.habitId === habit.id && l.date === selectedDate);
      if (!existing || !existing.isCompleted) {
        await toggleBooleanHabit(habit, selectedDate);
      }
    }
  };

  const handleCreateAndLogCasualActivity = async (input: any, amount?: number) => {
    const newHabit = await createHabit(input);
    if (newHabit.type === 'quantitative') {
      await setDirectQuantitativeValue(newHabit, amount || 1, selectedDate);
    } else {
      await toggleBooleanHabit(newHabit, selectedDate);
    }
  };

  const currentLogForQuickLog = quickLogHabit
    ? logs.find((l) => l.habitId === quickLogHabit.id && l.date === selectedDate)
    : undefined;

  return (
    <div className={styles.container}>
      {/* Top Header / Branding */}
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <div className={styles.brandIconDot} style={{ backgroundColor: '#238636' }} />
            <div className={styles.brandIconDot} style={{ backgroundColor: '#39d353' }} />
            <div className={styles.brandIconDot} style={{ backgroundColor: '#0e4429' }} />
            <div className={styles.brandIconDot} style={{ backgroundColor: '#2ea043' }} />
          </div>
          <h1 className={styles.brandTitle}>Trackr</h1>
          <span className={styles.brandBadge}>PWA</span>
        </div>

        <div className={styles.topActions}>
          <UserAccountButton />

          <button
            className={styles.actionBtn}
            onClick={() => setIsSettingsModalOpen(true)}
            aria-label={t('nav.settings')}
            title={t('nav.settings')}
          >
            <Settings size={18} />
          </button>

          <button
            className={`${styles.actionBtn} ${styles.createBtn}`}
            onClick={() => setIsCreateModalOpen(true)}
            aria-label={t('nav.newHabit')}
            title={t('nav.newHabit')}
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* Main Tab Switcher between Daily & All Habits */}
      <div className={styles.viewSwitcher}>
        <button
          type="button"
          className={`${styles.viewTab} ${styles.viewTabActive}`}
        >
          <CalendarDays size={16} />
          <span>{t('allHabits.navDailyView')}</span>
        </button>

        <button
          type="button"
          className={styles.viewTab}
          onClick={onSwitchToAllHabits}
        >
          <Layers size={16} />
          <span>{t('allHabits.navAllHabitsView')}</span>
          <span className={styles.viewTabBadge}>{habits.length}</span>
        </button>
      </div>

      {/* Global Consistency Stats */}
      <ConsistencyOverview habits={habits} logs={logs} />

      {/* Combined Global Activity Matrix */}
      <GlobalHeatmap
        habits={habits}
        logs={logs}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        weeksCount={22}
      />

      {/* Date Navigation Bar (Hoy / Ayer / Selector) */}
      <DateNavigator
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Daily Habits List */}
      <HabitList
        habits={habits}
        logs={logs}
        selectedDate={selectedDate}
        onToggleCheck={(h) => {
          if (h.type === 'avoidance') {
            toggleAvoidanceHabit(h, selectedDate);
          } else {
            toggleBooleanHabit(h, selectedDate);
          }
        }}
        onOpenQuickLog={handleOpenQuickLog}
        onOpenDetail={onOpenHabitDetail}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onViewAllHabits={onSwitchToAllHabits}
      />

      {/* Casual Activities (Spontaneous) Section */}
      <CasualActivitiesSection
        habits={habits}
        logs={logs}
        selectedDate={selectedDate}
        onOpenCasualModal={() => setIsCasualModalOpen(true)}
        onOpenHistoryModal={() => setIsCasualHistoryModalOpen(true)}
        onOpenDetail={onOpenHabitDetail}
        onAddVolume={handleOpenQuickLog}
        onDeleteLogForDate={async (hId, d) => {
          await deleteLogForDate(hId, d);
        }}
      />

      {/* Quick Log Volume Bottom Sheet */}
      {!!quickLogHabit && (
        <Suspense fallback={null}>
          <QuickLogBottomSheet
            isOpen={!!quickLogHabit}
            onClose={handleCloseQuickLog}
            habit={quickLogHabit}
            targetDate={selectedDate}
            currentLog={currentLogForQuickLog}
            onAddVolume={async (h, amt, d, notes) => {
              await addQuantitativeVolume(h, amt, d, notes);
            }}
            onSetDirectValue={async (h, val, d) => {
              await setDirectQuantitativeValue(h, val, d);
            }}
          />
        </Suspense>
      )}

      {/* Create Regular Habit Modal */}
      {isCreateModalOpen && (
        <Suspense fallback={null}>
          <HabitFormModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={async (input) => {
              await createHabit(input as any);
            }}
          />
        </Suspense>
      )}

      {/* Casual Activity Modal */}
      {isCasualModalOpen && (
        <Suspense fallback={null}>
          <CasualActivityModal
            isOpen={isCasualModalOpen}
            onClose={() => setIsCasualModalOpen(false)}
            selectedDate={selectedDate}
            habits={habits}
            onLogExistingCasualActivity={handleLogExistingCasualActivity}
            onCreateAndLogCasualActivity={handleCreateAndLogCasualActivity}
            onOpenHistory={() => {
              setIsCasualModalOpen(false);
              setIsCasualHistoryModalOpen(true);
            }}
          />
        </Suspense>
      )}

      {/* Casual Activities History Modal */}
      {isCasualHistoryModalOpen && (
        <Suspense fallback={null}>
          <CasualHistoryModal
            isOpen={isCasualHistoryModalOpen}
            onClose={() => setIsCasualHistoryModalOpen(false)}
            habits={habits}
            logs={logs}
            onOpenDetail={onOpenHabitDetail}
          />
        </Suspense>
      )}

      {/* Settings & Backup Modal */}
      {isSettingsModalOpen && (
        <Suspense fallback={null}>
          <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            onDataResetOrImported={handleDataResetOrImported}
          />
        </Suspense>
      )}
    </div>
  );
};
