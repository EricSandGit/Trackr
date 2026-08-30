import React, { useMemo } from 'react';
import { Plus, History, Sparkles, Trash2, ArrowUpRight } from 'lucide-react';
import { Habit, DailyActivityLog } from '@/core/types';
import { HabitIcon } from '@/core/ui/HabitIcon';
import { useI18nStore } from '@/core/i18n';
import styles from './CasualActivitiesSection.module.css';

export interface CasualActivitiesSectionProps {
  habits: Habit[];
  logs: DailyActivityLog[];
  selectedDate: string;
  onOpenCasualModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenDetail: (habit: Habit) => void;
  onAddVolume?: (habit: Habit) => void;
  onDeleteLogForDate?: (habitId: string, date: string) => Promise<void>;
}

export const CasualActivitiesSection: React.FC<CasualActivitiesSectionProps> = ({
  habits,
  logs,
  selectedDate,
  onOpenCasualModal,
  onOpenHistoryModal,
  onOpenDetail,
  onAddVolume,
  onDeleteLogForDate,
}) => {
  const { t, formatRelativeDate } = useI18nStore();

  // Find all active casual habits that have a log with totalValue > 0 or isCompleted on selectedDate
  const casualLoggedItems = useMemo(() => {
    const casualHabits = habits.filter((h) => !h.isArchived && h.frequency.type === 'casual');
    const items: Array<{ habit: Habit; log: DailyActivityLog }> = [];

    casualHabits.forEach((habit) => {
      const log = logs.find((l) => l.habitId === habit.id && l.date === selectedDate);
      if (log && (log.isCompleted || log.totalValue > 0)) {
        items.push({ habit, log });
      }
    });

    return items;
  }, [habits, logs, selectedDate]);

  const handleDeleteLog = async (e: React.MouseEvent, habitId: string) => {
    e.stopPropagation();
    if (onDeleteLogForDate && window.confirm(t('casualActivities.deleteLogConfirm'))) {
      await onDeleteLogForDate(habitId, selectedDate);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <Sparkles size={16} color="var(--tk-info)" />
          <h3 className={styles.title}>{t('casualActivities.sectionTitle')}</h3>
          {casualLoggedItems.length > 0 && (
            <span className={styles.badge}>
              {casualLoggedItems.length}
            </span>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={onOpenHistoryModal}
            title={t('casualActivities.historyBtn')}
          >
            <History size={13} />
            <span>{t('casualActivities.historyBtn')}</span>
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${styles.primaryActionBtn}`}
            onClick={onOpenCasualModal}
            title={t('casualActivities.addBtn')}
          >
            <Plus size={14} />
            <span>{t('casualActivities.addBtn')}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {casualLoggedItems.length === 0 ? (
        <div className={styles.emptyCard}>
          <div className={styles.emptyInfo}>
            <div className={styles.emptyIcon}>
              <Sparkles size={18} />
            </div>
            <div className={styles.emptyText}>
              <span className={styles.emptyTitle}>
                {t('casualActivities.emptyToday')} ({formatRelativeDate(selectedDate)})
              </span>
              <span className={styles.emptyDesc}>
                {t('casualActivities.emptyTodayDesc')}
              </span>
            </div>
          </div>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.primaryActionBtn}`}
            onClick={onOpenCasualModal}
          >
            <Plus size={13} />
            <span>{t('casualActivities.addBtn')}</span>
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {casualLoggedItems.map(({ habit, log }) => {
            const isQuantitative = habit.type === 'quantitative';
            const valueLabel = isQuantitative
              ? `${log.totalValue} ${habit.unit || 'uds'}`
              : '✓ Realizada';

            return (
              <div
                key={habit.id}
                className={styles.itemCard}
                onClick={() => onOpenDetail(habit)}
              >
                <div className={styles.itemMain}>
                  <div className={styles.itemIcon} style={{ backgroundColor: `${habit.color}20` }}>
                    <HabitIcon name={habit.icon} color={habit.color} size={20} />
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{habit.name}</span>
                    <div className={styles.itemMeta}>
                      <span className={styles.itemValueTag}>{valueLabel}</span>
                      {habit.category && <span>• {habit.category}</span>}
                    </div>
                  </div>
                </div>

                <div className={styles.itemActions}>
                  {isQuantitative && onAddVolume && (
                    <button
                      type="button"
                      className={styles.iconActionBtn}
                      title="Sumar volumen"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddVolume(habit);
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  )}

                  {onDeleteLogForDate && (
                    <button
                      type="button"
                      className={`${styles.iconActionBtn} ${styles.deleteBtn}`}
                      title="Eliminar registro de esta fecha"
                      onClick={(e) => handleDeleteLog(e, habit.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}

                  <button
                    type="button"
                    className={styles.iconActionBtn}
                    title={t('casualActivities.detailsBtn')}
                    onClick={() => onOpenDetail(habit)}
                  >
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
