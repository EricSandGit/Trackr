import React from 'react';
import { Sparkles, Plus, ShieldAlert, RotateCcw } from 'lucide-react';
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
  const isRelapse = habit.type === 'avoidance' && log?.isCompleted === false;
  const isCompleted = habit.type === 'avoidance' ? !isRelapse : !!log?.isCompleted;
  const isRecord = !!log?.isPersonalRecord;
  const currentTotal = log?.totalValue || 0;

  const handleCardClick = () => {
    onOpenDetail(habit);
  };

  const handleCheckAction = () => {
    if (habit.type === 'quantitative') {
      onOpenQuickLog(habit);
    } else {
      onToggleCheck(habit);
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
  } else if (habit.type === 'avoidance') {
    progressLabel = isRelapse ? t('habitCard.relapse') : t('habitCard.cleanDay');
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
            className={`${styles.progressText} ${isCompleted ? styles.completedText : ''} ${isRelapse ? styles.relapseText : ''}`}
            style={{ color: isRelapse ? '#ef4444' : undefined }}
          >
            {progressLabel}
          </span>
          {habit.weeklyGoal && (
            <span className={styles.periodicGoalBadge}>
              {t('habitCard.weeklyGoal', {
                goal: habit.weeklyGoal,
                unit: habit.type === 'quantitative' ? habit.unit || '' : t('common.days'),
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
        ) : habit.type === 'avoidance' ? (
          <button
            type="button"
            className={styles.card}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--tk-radius-md)',
              backgroundColor: isRelapse ? 'rgba(239, 68, 68, 0.15)' : 'var(--tk-bg-surface-elevated)',
              color: isRelapse ? '#ef4444' : 'var(--tk-text-secondary)',
              borderColor: isRelapse ? '#ef4444' : 'var(--tk-border-default)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600,
              fontSize: '11px',
              cursor: 'pointer',
            }}
            onClick={handleCheckAction}
            title={isRelapse ? t('habitCard.undoRelapse') : t('habitCard.markRelapse')}
          >
            {isRelapse ? (
              <>
                <RotateCcw size={12} />
                <span>{t('habitCard.undoRelapse')}</span>
              </>
            ) : (
              <>
                <ShieldAlert size={12} color="var(--tk-warning)" />
                <span>{t('habitCard.markRelapse')}</span>
              </>
            )}
          </button>
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
