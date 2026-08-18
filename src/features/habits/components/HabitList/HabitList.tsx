import React from 'react';
import { Plus } from 'lucide-react';
import { Habit, DailyActivityLog } from '@/core/types';
import { HabitCard } from '../HabitCard';
import { Button } from '@/core/ui/Button';
import { isHabitScheduledOnDate } from '@/features/heatmap/logic/heatmapCalculator';
import styles from './HabitList.module.css';

export interface HabitListProps {
  habits: Habit[];
  logs: DailyActivityLog[];
  selectedDate: string;
  onToggleCheck: (habit: Habit) => void;
  onOpenQuickLog: (habit: Habit) => void;
  onOpenDetail: (habit: Habit) => void;
  onOpenCreateModal: () => void;
}

export const HabitList: React.FC<HabitListProps> = ({
  habits,
  logs,
  selectedDate,
  onToggleCheck,
  onOpenQuickLog,
  onOpenDetail,
  onOpenCreateModal,
}) => {
  // Filter active and scheduled habits for selectedDate
  const activeScheduledHabits = habits.filter(
    (h) => !h.isArchived && isHabitScheduledOnDate(h, selectedDate)
  );

  const logsMap = new Map<string, DailyActivityLog>();
  logs.forEach((l) => {
    if (l.date === selectedDate) {
      logsMap.set(l.habitId, l);
    }
  });

  const completedCount = activeScheduledHabits.filter(
    (h) => logsMap.get(h.id)?.isCompleted
  ).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Hábitos del Día</h3>
        {activeScheduledHabits.length > 0 && (
          <span className={styles.counter}>
            {completedCount} de {activeScheduledHabits.length} completados
          </span>
        )}
      </div>

      {activeScheduledHabits.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🌱</div>
          <div className={styles.emptyTitle}>No hay hábitos programados</div>
          <p className={styles.emptyText}>
            No tienes actividades activas para este día. ¡Crea un nuevo hábito para empezar a trackear!
          </p>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus size={16} />}
            onClick={onOpenCreateModal}
          >
            Crear Hábito
          </Button>
        </div>
      ) : (
        <div className={styles.list}>
          {activeScheduledHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              log={logsMap.get(habit.id)}
              onToggleCheck={onToggleCheck}
              onOpenQuickLog={onOpenQuickLog}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
};
