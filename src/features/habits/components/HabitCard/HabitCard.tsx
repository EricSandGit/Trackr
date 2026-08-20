import React from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { Habit, DailyActivityLog } from '@/core/types';
import { Checkbox } from '@/core/ui/Checkbox';
import { HabitIcon } from '@/core/ui/HabitIcon';
import { useI18nStore } from '@/core/i18n';
import styles from './HabitCard.module.css';

export interface HabitCardProps {
  habit: Habit;
  log?: DailyActivityLog;
  onToggleCheck: (habit: Habit) => void;
  onOpenQuickLog: (habit: Habit) => void;
  onOpenDetail: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  log,
  onToggleCheck,
  onOpenQuickLog,
  onOpenDetail,
}) => {
  const { t } = useI18nStore();
  const isCompleted = !!log?.isCompleted;
  const isRecord = !!log?.isPersonalRecord;
  const currentTotal = log?.totalValue || 0;

  const handleCardClick = () => {
    onOpenDetail(habit);
  };

  const handleCheckAction = () => {
    if (habit.type === 'boolean') {
      onToggleCheck(habit);
    } else {
      onOpenQuickLog(habit);
    }
  };

  let progressLabel = '';
  if (habit.type === 'quantitative') {
    const goal = habit.dailyGoal || 0;
    const unit = habit.unit || '';
    if (goal > 0) {
      progressLabel = `${currentTotal} / ${goal} ${unit}`;
    } else {
      progressLabel = `${currentTotal} ${unit}`;
    }
  } else {
    progressLabel = isCompleted ? t('habitCard.completed') : t('habitCard.pending');
  }

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.colorStrip} style={{ backgroundColor: habit.color }} />

      <div className={styles.iconWrapper}>
        <HabitIcon name={habit.icon} size={20} color={habit.color} />
      </div>

      <div className={styles.content}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{habit.name}</span>
          {habit.category && (
            <span className={styles.categoryTag}>{habit.category}</span>
          )}
          {isRecord && (
            <span className={styles.recordBadge}>
              <Sparkles size={10} /> {t('habitCard.record')}
            </span>
          )}
        </div>
        <div className={styles.metaRow}>
          <span
            className={`${styles.progressText} ${isCompleted ? styles.completedText : ''}`}
          >
            {progressLabel}
          </span>
          {habit.weeklyGoal && (
            <span className={styles.periodicGoalBadge}>
              {t('habitCard.weeklyGoal', {
                goal: habit.weeklyGoal,
                unit: habit.type === 'boolean' ? t('common.days') : habit.unit || '',
              })}
            </span>
          )}
        </div>
      </div>

      <div className={styles.checkAction} onClick={(e) => e.stopPropagation()}>
        {habit.type === 'boolean' ? (
          <Checkbox
            checked={isCompleted}
            onChange={handleCheckAction}
            color={habit.color}
            size={30}
          />
        ) : (
          <button
            type="button"
            className={styles.card}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--tk-radius-md)',
              backgroundColor: isCompleted ? habit.color : 'var(--tk-bg-surface-elevated)',
              color: isCompleted ? '#ffffff' : 'var(--tk-text-primary)',
              borderColor: isCompleted ? habit.color : 'var(--tk-border-default)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600,
              fontSize: '12px',
            }}
            onClick={handleCheckAction}
          >
            <Plus size={14} />
            <span>{currentTotal > 0 ? `${currentTotal}` : t('habitCard.addVolume')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
