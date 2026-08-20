import React, { useMemo } from 'react';
import { Flame, Trophy, Sparkles, BarChart2 } from 'lucide-react';
import { Habit, DailyActivityLog } from '@/core/types';
import { calculateHabitIndividualStats } from '@/features/stats/logic/streakCalculator';
import { useI18nStore } from '@/core/i18n';
import styles from './HabitStatBadges.module.css';

export interface HabitStatBadgesProps {
  habit: Habit;
  logs: DailyActivityLog[];
}

export const HabitStatBadges: React.FC<HabitStatBadgesProps> = ({ habit, logs }) => {
  const { t } = useI18nStore();
  const stats = useMemo(() => {
    return calculateHabitIndividualStats(habit, logs);
  }, [habit, logs]);

  const unit = habit.unit || (habit.type === 'boolean' ? t('common.days') : 'uds');

  return (
    <div className={styles.grid}>
      {/* Current Streak */}
      <div className={styles.card}>
        <div className={styles.labelRow}>
          <Flame size={14} color="#f97316" />
          <span>{t('badges.currentStreak')}</span>
        </div>
        <span className={styles.value} style={{ color: '#f97316' }}>
          {t('badges.daysCount', { count: stats.currentStreak })}
        </span>
        <span className={styles.sublabel}>
          {t('badges.bestStreakDesc', { count: stats.bestStreak })}
        </span>
      </div>

      {/* Personal Record in 1 Day */}
      <div className={styles.card}>
        <div className={styles.labelRow}>
          <Sparkles size={14} color="var(--tk-record-gold)" />
          <span>{t('badges.recordInOneDay')}</span>
        </div>
        <span className={styles.value} style={{ color: 'var(--tk-record-gold)' }}>
          {stats.allTimeRecordValue > 0
            ? `${stats.allTimeRecordValue} ${unit}`
            : t('badges.noRecordYet')}
        </span>
        <span className={styles.sublabel}>
          {stats.allTimeRecordDate
            ? t('badges.reachedOnDate', { date: stats.allTimeRecordDate })
            : t('badges.beatRecordToday')}
        </span>
      </div>

      {/* Total Lifetime Volume */}
      <div className={styles.card}>
        <div className={styles.labelRow}>
          <Trophy size={14} color="var(--tk-accent)" />
          <span>{t('badges.totalLifetime')}</span>
        </div>
        <span className={styles.value} style={{ color: 'var(--tk-accent)' }}>
          {stats.totalLifetimeVolume} {unit}
        </span>
        <span className={styles.sublabel}>
          {t('badges.daysLogged', { count: stats.totalLifetimeEntries })}
        </span>
      </div>

      {/* Completion Rate Last 30 Days */}
      <div className={styles.card}>
        <div className={styles.labelRow}>
          <BarChart2 size={14} color="var(--tk-info)" />
          <span>{t('badges.completionRate30d')}</span>
        </div>
        <span className={styles.value} style={{ color: 'var(--tk-info)' }}>
          {stats.completionRateLast30Days}%
        </span>
        <span className={styles.sublabel}>{t('badges.ofScheduledDays')}</span>
      </div>
    </div>
  );
};
