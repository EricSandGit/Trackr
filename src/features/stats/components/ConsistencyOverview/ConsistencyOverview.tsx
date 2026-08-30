import React, { useMemo } from 'react';
import { Flame, TrendingUp, CheckCircle2, Award, Zap } from 'lucide-react';
import { Habit, DailyActivityLog } from '@/core/types';
import { HabitIcon } from '@/core/ui/HabitIcon';
import { useI18nStore } from '@/core/i18n';
import { calculateGlobalConsistencyStats } from '@/features/stats/logic/streakCalculator';
import styles from './ConsistencyOverview.module.css';

export interface ConsistencyOverviewProps {
  habits: Habit[];
  logs: DailyActivityLog[];
}

export const ConsistencyOverview: React.FC<ConsistencyOverviewProps> = ({ habits, logs }) => {
  const { t } = useI18nStore();
  const stats = useMemo(() => {
    return calculateGlobalConsistencyStats(habits, logs);
  }, [habits, logs]);

  return (
    <div className={styles.container}>
      {/* 3 Metric Cards */}
      <div className={styles.grid}>
        {/* Monthly Consistency */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <TrendingUp size={14} color="var(--tk-info)" />
            <span>{t('stats.month')}</span>
          </div>
          <span className={styles.metric} style={{ color: 'var(--tk-info)' }}>
            {stats.monthlyConsistencyPercentage}%
          </span>
          <span className={styles.subtext}>{t('stats.monthConsistency')}</span>
        </div>

        {/* Global Streak */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Flame size={14} color="#f97316" />
            <span>{t('stats.streak')}</span>
          </div>
          <span className={styles.metric} style={{ color: '#f97316' }}>
            {stats.currentGlobalStreak}d
          </span>
          <span className={styles.subtext}>
            {t('stats.recordStreak', { days: stats.bestGlobalStreak })}
          </span>
        </div>

        {/* This Week */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <CheckCircle2 size={14} color="var(--tk-accent)" />
            <span>{t('stats.week')}</span>
          </div>
          <span className={styles.metric} style={{ color: 'var(--tk-accent)' }}>
            {stats.totalActivitiesThisWeek}
          </span>
          <span className={styles.subtext}>{t('stats.completedActivities')}</span>
        </div>
      </div>

      {/* Habit Highlights */}
      {(stats.mostConsistentHabit || stats.habitToReinforce) && (
        <div className={styles.highlightsRow}>
          {stats.mostConsistentHabit && (
            <div className={styles.highlightCard}>
              <div className={styles.highlightIcon}>
                <HabitIcon
                  name={stats.mostConsistentHabit.icon}
                  color={stats.mostConsistentHabit.color}
                  size={18}
                />
              </div>
              <div className={styles.highlightInfo}>
                <span className={styles.highlightLabel} style={{ color: 'var(--tk-accent)' }}>
                  <Award size={11} />
                  <span>{t('stats.mostConsistent')}</span>
                </span>
                <span className={styles.highlightName}>
                  {stats.mostConsistentHabit.name} ({stats.mostConsistentHabit.completedDays}/{stats.mostConsistentHabit.plannedDays} {t('common.days')} · {stats.mostConsistentHabit.percentage}%)
                </span>
              </div>
            </div>
          )}

          {stats.habitToReinforce && (
            <div className={styles.highlightCard}>
              <div className={styles.highlightIcon}>
                <HabitIcon
                  name={stats.habitToReinforce.icon}
                  color={stats.habitToReinforce.color}
                  size={18}
                />
              </div>
              <div className={styles.highlightInfo}>
                <span className={styles.highlightLabel} style={{ color: 'var(--tk-warning)' }}>
                  <Zap size={11} />
                  <span>{t('stats.toReinforce')}</span>
                </span>
                <span className={styles.highlightName}>
                  {stats.habitToReinforce.name} ({stats.habitToReinforce.completedDays}/{stats.habitToReinforce.plannedDays} {t('common.days')} · {stats.habitToReinforce.percentage}%)
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
