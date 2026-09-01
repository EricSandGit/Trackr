import React from 'react';
import { Sparkles, Plus, ShieldAlert, RotateCcw } from 'lucide-react';
import { Habit, DailyActivityLog } from '@/core/types';
import { Checkbox } from '@/core/ui/Checkbox';
import { HabitIcon } from '@/core/ui/HabitIcon';
import { useI18nStore } from '@/core/i18n';
import { triggerHaptic } from '@/core/utils/haptics';
import styles from './HabitCard.module.css';

export interface HabitCardProps {
  habit: Habit;
  log?: DailyActivityLog;
  onToggleCheck: (habit: Habit) => void;
  onOpenQuickLog: (habit: Habit) => void;
  onOpenDetail: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = React.memo(({
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
      triggerHaptic('light');
      onOpenQuickLog(habit);
    } else {
      triggerHaptic(isCompleted ? 'light' : 'success');
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

  const periodicGoalText = habit.weeklyGoal
    ? t('habitCard.weeklyGoal', {
        goal: habit.weeklyGoal,
        unit: habit.type === 'quantitative' ? habit.unit || '' : t('common.days'),
      })
    : habit.frequency?.type === 'everyday'
    ? 'Todos los días'
    : habit.frequency?.type === 'specific_days'
    ? `${habit.frequency.daysOfWeek?.length || 0} días por semana`
    : 'Actividad casual';

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.colorStrip} style={{ backgroundColor: habit.color }} />

      {/* Category Tag & Record Badge positioned at the top-right edge of the card */}
      {(habit.category || isRecord) && (
        <div className={styles.tagGroup}>
          {isRecord && (
            <span className={styles.recordBadge}>
              <Sparkles size={10} /> {t('habitCard.record')}
            </span>
          )}
          {habit.category && (
            <span className={styles.categoryTag}>{habit.category}</span>
          )}
        </div>
      )}

      <div className={styles.iconWrapper}>
        <HabitIcon name={habit.icon} size={20} color={habit.color} />
      </div>

      <div className={styles.content}>
        {/* Tier 1: Name (left, truncating before reaching the top-right tag) */}
        <div className={styles.nameRow}>
          <span className={styles.name} title={habit.name}>{habit.name}</span>
        </div>

        {/* Tier 2: Status / Daily Progress */}
        <div className={styles.statusRow}>
          <span
            className={`${styles.progressText} ${isCompleted ? styles.completedText : ''} ${isRelapse ? styles.relapseText : ''}`}
            style={{ color: isRelapse ? '#ef4444' : undefined }}
          >
            {progressLabel}
          </span>
        </div>

        {/* Tier 3: Weekly Goal or Frequency */}
        <div className={styles.goalRow}>
          <span className={styles.periodicGoalBadge}>
            {periodicGoalText}
          </span>
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
            className={styles.actionBtn}
            style={{
              padding: '6px 10px',
              backgroundColor: isRelapse ? 'rgba(239, 68, 68, 0.15)' : 'var(--tk-bg-surface-elevated)',
              color: isRelapse ? '#ef4444' : 'var(--tk-text-secondary)',
              borderColor: isRelapse ? '#ef4444' : 'var(--tk-border-default)',
              fontSize: '11px',
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
            className={styles.actionBtn}
            style={{
              padding: '6px 12px',
              backgroundColor: isCompleted ? habit.color : 'var(--tk-bg-surface-elevated)',
              color: isCompleted ? '#ffffff' : 'var(--tk-text-primary)',
              borderColor: isCompleted ? habit.color : 'var(--tk-border-default)',
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
});
