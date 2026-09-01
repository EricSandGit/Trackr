import React, { useState, Suspense, lazy } from 'react';
import { Habit } from '@/core/types';
import { useHabitsStore } from '@/features/habits';
import { useLogsStore } from '@/features/logging';
import { GlobalHeatmap } from '@/features/heatmap';
import { ConsistencyOverview } from '@/features/stats';
import { HabitList, CasualActivitiesSection } from '@/features/habits';
import { DateNavigator } from '@/core/ui/DateNavigator';
import styles from './HomeView.module.css';

const QuickLogBottomSheet = lazy(() =>
  import('@/features/logging').then((m) => ({ default: m.QuickLogBottomSheet }))
);
const CasualActivityModal = lazy(() =>
  import('@/features/habits').then((m) => ({ default: m.CasualActivityModal }))
);
const CasualHistoryModal = lazy(() =>
  import('@/features/habits').then((m) => ({ default: m.CasualHistoryModal }))
);

export interface HomeViewProps {
  onOpenHabitDetail: (habit: Habit) => void;
  onOpenCasualHistory?: () => void;
  onOpenCreateHabit?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenHabitDetail,
  onOpenCasualHistory,
  onOpenCreateHabit,
}) => {
  const { habits, createHabit } = useHabitsStore();
  const {
    logs,
    selectedDate,
    setSelectedDate,
    toggleBooleanHabit,
    toggleAvoidanceHabit,
    addQuantitativeVolume,
    setDirectQuantitativeValue,
    deleteLogForDate,
  } = useLogsStore();

  // Modals state
  const [isCasualModalOpen, setIsCasualModalOpen] = useState(false);
  const [isCasualHistoryModalOpen, setIsCasualHistoryModalOpen] = useState(false);
  const [quickLogHabit, setQuickLogHabit] = useState<Habit | null>(null);

  const handleOpenQuickLog = (habit: Habit) => {
    setQuickLogHabit(habit);
  };

  const handleCloseQuickLog = () => {
    setQuickLogHabit(null);
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
      {/* Top Analytics Dashboard: Heatmap on the left (with integrated DateNavigator), 5 Metric Cards on the right */}
      <div className={styles.topAnalyticsRow}>
        <div className={styles.heatmapWrapper}>
          <GlobalHeatmap
            habits={habits}
            logs={logs}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            weeksCount={22}
            footerSlot={
              <DateNavigator
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                variant="embedded"
              />
            }
          />
        </div>

        <div className={styles.statsWrapper}>
          <ConsistencyOverview habits={habits} logs={logs} />
        </div>
      </div>

      {/* Scheduled Habits List for Selected Date */}
      <HabitList
        habits={habits}
        logs={logs}
        selectedDate={selectedDate}
        onToggleCheck={async (h: Habit) => {
          if (h.type === 'avoidance') {
            await toggleAvoidanceHabit(h, selectedDate);
          } else {
            await toggleBooleanHabit(h, selectedDate);
          }
        }}
        onOpenQuickLog={handleOpenQuickLog}
        onOpenDetail={onOpenHabitDetail}
        onOpenCreateModal={onOpenCreateHabit || (() => {})}
      />

      {/* Casual / Spontaneous Activities Section */}
      <CasualActivitiesSection
        habits={habits}
        logs={logs}
        selectedDate={selectedDate}
        onOpenCasualModal={() => setIsCasualModalOpen(true)}
        onOpenHistoryModal={() => {
          if (onOpenCasualHistory) {
            onOpenCasualHistory();
          } else {
            setIsCasualHistoryModalOpen(true);
          }
        }}
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
              if (onOpenCasualHistory) {
                onOpenCasualHistory();
              } else {
                setIsCasualHistoryModalOpen(true);
              }
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
    </div>
  );
};
