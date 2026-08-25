import React, { useState, useMemo } from 'react';
import { Plus, Layers, Sparkles, Search } from 'lucide-react';
import { Habit, DailyActivityLog, CURATED_HABIT_CATEGORIES } from '@/core/types';
import { HabitCard } from '../HabitCard';
import { Button } from '@/core/ui/Button';
import { HabitIcon } from '@/core/ui/HabitIcon';
import { useI18nStore } from '@/core/i18n';
import { isHabitScheduledOnDate, isHabitSuccessfulOnDate } from '@/features/heatmap/logic/heatmapCalculator';
import styles from './HabitList.module.css';

export interface HabitListProps {
  habits: Habit[];
  logs: DailyActivityLog[];
  selectedDate: string;
  onToggleCheck: (habit: Habit) => void;
  onOpenQuickLog: (habit: Habit) => void;
  onOpenDetail: (habit: Habit) => void;
  onOpenCreateModal: () => void;
  onViewAllHabits?: () => void;
}

export const HabitList: React.FC<HabitListProps> = ({
  habits,
  logs,
  selectedDate,
  onToggleCheck,
  onOpenQuickLog,
  onOpenDetail,
  onOpenCreateModal,
  onViewAllHabits,
}) => {
  const { t } = useI18nStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter active and scheduled habits for selectedDate
  const activeScheduledHabits = useMemo(() => {
    return habits.filter(
      (h) => !h.isArchived && isHabitScheduledOnDate(h, selectedDate)
    );
  }, [habits, selectedDate]);

  // Extract unique categories present among active scheduled habits
  const categories = useMemo(() => {
    const catsSet = new Set<string>();
    activeScheduledHabits.forEach((h) => {
      if (h.category) catsSet.add(h.category);
    });
    return Array.from(catsSet);
  }, [activeScheduledHabits]);

  // Filter habits according to selectedCategory
  const displayedHabits = useMemo(() => {
    if (selectedCategory === 'all') return activeScheduledHabits;
    return activeScheduledHabits.filter((h) => h.category === selectedCategory);
  }, [activeScheduledHabits, selectedCategory]);

  const logsMap = useMemo(() => {
    const map = new Map<string, DailyActivityLog>();
    logs.forEach((l) => {
      if (l.date === selectedDate) {
        map.set(l.habitId, l);
      }
    });
    return map;
  }, [logs, selectedDate]);

  const completedCount = activeScheduledHabits.filter((h) => {
    const log = logsMap.get(h.id);
    return isHabitSuccessfulOnDate(h, selectedDate, log);
  }).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t('home.dailyHabitsTitle')}</h3>
        {activeScheduledHabits.length > 0 && (
          <span className={styles.counter}>
            {t('home.completedCount', {
              completed: completedCount,
              total: activeScheduledHabits.length,
            })}
          </span>
        )}
      </div>

      {/* Category Filter Chips Bar */}
      {categories.length > 0 && activeScheduledHabits.length > 0 && (
        <div className={styles.filterBar}>
          <button
            type="button"
            className={`${styles.filterChip} ${selectedCategory === 'all' ? styles.filterChipActive : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            <Layers size={13} />
            <span>{t('home.allCategories')}</span>
            <span className={styles.filterBadge}>{activeScheduledHabits.length}</span>
          </button>

          {categories.map((cat) => {
            const count = activeScheduledHabits.filter((h) => h.category === cat).length;
            const isSelected = selectedCategory === cat;
            const catIcon =
              CURATED_HABIT_CATEGORIES.find((c) => c.id === cat || c.label === cat)?.icon || 'Tag';

            return (
              <button
                key={cat}
                type="button"
                className={`${styles.filterChip} ${isSelected ? styles.filterChipActive : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <HabitIcon name={catIcon} size={12} />
                <span>{cat}</span>
                <span className={styles.filterBadge}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {activeScheduledHabits.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Sparkles size={32} color="var(--tk-accent)" />
          </div>
          <div className={styles.emptyTitle}>{t('home.noHabitsScheduled')}</div>
          <p className={styles.emptyText}>{t('home.noHabitsDesc')}</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus size={16} />}
              onClick={onOpenCreateModal}
            >
              {t('home.createHabit')}
            </Button>
            {habits.length > 0 && onViewAllHabits && (
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Layers size={16} />}
                onClick={onViewAllHabits}
              >
                {t('allHabits.navAllHabitsView')} ({habits.length})
              </Button>
            )}
          </div>
        </div>
      ) : displayedHabits.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Search size={32} color="var(--tk-text-muted)" />
          </div>
          <div className={styles.emptyTitle}>{t('home.noHabitsCategory')}</div>
          <p className={styles.emptyText}>
            {t('home.noHabitsCategoryDesc', { category: selectedCategory })}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            {t('home.viewAllHabits')}
          </Button>
        </div>
      ) : (
        <div className={styles.list}>
          {displayedHabits.map((habit) => (
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
