import React, { useState } from 'react';
import { Plus, Settings, Sun, Moon } from 'lucide-react';
import { Habit } from '@/core/types';
import { useHabitsStore } from '@/features/habits';
import { useLogsStore } from '@/features/logging';
import { useThemeStore } from '@/core/theme/useThemeStore';
import { GlobalHeatmap } from '@/features/heatmap';
import { ConsistencyOverview } from '@/features/stats';
import { HabitList, HabitFormModal } from '@/features/habits';
import { QuickLogBottomSheet } from '@/features/logging';
import { DateNavigator } from '@/core/ui/DateNavigator';
import { SettingsModal } from '@/features/settings';
import styles from './HomeView.module.css';

export interface HomeViewProps {
  onOpenHabitDetail: (habit: Habit) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onOpenHabitDetail }) => {
  const { habits, loadHabits, createHabit } = useHabitsStore();
  const {
    logs,
    selectedDate,
    setSelectedDate,
    loadLogs,
    toggleBooleanHabit,
    addQuantitativeVolume,
    setDirectQuantitativeValue,
  } = useLogsStore();

  const { theme, toggleTheme } = useThemeStore();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

  const currentLogForQuickLog = quickLogHabit
    ? logs.find((l) => l.habitId === quickLogHabit.id && l.date === selectedDate)
    : undefined;

  return (
    <div className={styles.container}>
      {/* Top App Bar */}
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
          <button
            className={styles.actionBtn}
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            title="Cambiar tema oscuro/claro"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            className={styles.actionBtn}
            onClick={() => setIsSettingsModalOpen(true)}
            aria-label="Ajustes"
            title="Ajustes y Respaldo"
          >
            <Settings size={18} />
          </button>

          <button
            className={`${styles.actionBtn} ${styles.createBtn}`}
            onClick={() => setIsCreateModalOpen(true)}
            aria-label="Nuevo Hábito"
            title="Crear nuevo hábito"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </header>

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
        onToggleCheck={(h) => toggleBooleanHabit(h, selectedDate)}
        onOpenQuickLog={handleOpenQuickLog}
        onOpenDetail={onOpenHabitDetail}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Quick Log Volume Bottom Sheet */}
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

      {/* Create Habit Modal */}
      <HabitFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (input) => {
          await createHabit(input as any);
        }}
      />

      {/* Settings & Backup Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onDataResetOrImported={handleDataResetOrImported}
      />
    </div>
  );
};
