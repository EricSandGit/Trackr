import React, { useMemo } from 'react';
import { Flame, Trophy, Sparkles, BarChart2 } from 'lucide-react';
import { Habit, DailyActivityLog } from '@/core/types';
import { calculateHabitIndividualStats } from '@/features/stats/logic/streakCalculator';
import styles from './HabitStatBadges.module.css';

export interface HabitStatBadgesProps {
  habit: Habit;
  logs: DailyActivityLog[];
}

export const HabitStatBadges: React.FC<HabitStatBadgesProps> = ({ habit, logs }) => {
  const stats = useMemo(() => {
    return calculateHabitIndividualStats(habit, logs);
  }, [habit, logs]);

  const unit = habit.unit || 'veces';

  return (
    <div className={styles.grid}>
      {/* Current Streak */}
      <div className={styles.card}>
        <div className={styles.labelRow}>
          <Flame size={14} color="#f97316" />
          <span>Racha Actual</span>
        </div>
        <span className={styles.value} style={{ color: '#f97316' }}>
          {stats.currentStreak} días
        </span>
        <span className={styles.sublabel}>Racha récord: {stats.bestStreak} días</span>
      </div>

      {/* Personal Record in 1 Day */}
      <div className={styles.card}>
        <div className={styles.labelRow}>
          <Sparkles size={14} color="var(--tk-record-gold)" />
          <span>Récord en 1 Día</span>
        </div>
        <span className={styles.value} style={{ color: 'var(--tk-record-gold)' }}>
          {stats.allTimeRecordValue > 0
            ? `${stats.allTimeRecordValue} ${unit}`
            : 'Sin registro'}
        </span>
        <span className={styles.sublabel}>
          {stats.allTimeRecordDate ? `Alcanzado el ${stats.allTimeRecordDate}` : '¡Bate tu récord hoy!'}
        </span>
      </div>

      {/* Total Lifetime Volume */}
      <div className={styles.card}>
        <div className={styles.labelRow}>
          <Trophy size={14} color="var(--tk-accent)" />
          <span>Total Acumulado</span>
        </div>
        <span className={styles.value} style={{ color: 'var(--tk-accent)' }}>
          {stats.totalLifetimeVolume} {unit}
        </span>
        <span className={styles.sublabel}>{stats.totalLifetimeEntries} días registrados</span>
      </div>

      {/* Completion Rate Last 30 Days */}
      <div className={styles.card}>
        <div className={styles.labelRow}>
          <BarChart2 size={14} color="var(--tk-info)" />
          <span>Cumplimiento (30d)</span>
        </div>
        <span className={styles.value} style={{ color: 'var(--tk-info)' }}>
          {stats.completionRateLast30Days}%
        </span>
        <span className={styles.sublabel}>De días programados</span>
      </div>
    </div>
  );
};
