import React, { useMemo } from 'react';
import { Target, Calendar, Award, CheckCircle2 } from 'lucide-react';
import { Habit, DailyActivityLog } from '@/core/types';
import {
  calculateWeeklyGoalProgress,
  calculateMonthlyGoalProgress,
} from '@/features/stats/logic/periodicGoalCalculator';
import styles from './PeriodicGoalCards.module.css';

export interface PeriodicGoalCardsProps {
  habit: Habit;
  logs: DailyActivityLog[];
  referenceDate?: string;
}

export const PeriodicGoalCards: React.FC<PeriodicGoalCardsProps> = ({
  habit,
  logs,
  referenceDate,
}) => {
  const weeklyProgress = useMemo(
    () => calculateWeeklyGoalProgress(habit, logs, referenceDate),
    [habit, logs, referenceDate]
  );

  const monthlyProgress = useMemo(
    () => calculateMonthlyGoalProgress(habit, logs, referenceDate),
    [habit, logs, referenceDate]
  );

  if (!weeklyProgress && !monthlyProgress) {
    return null;
  }

  const habitColor = habit.color || 'var(--tk-accent)';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <Target size={16} color={habitColor} />
          <h4 className={styles.title}>Metas Semanales & Mensuales</h4>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Weekly Goal Card */}
        {weeklyProgress && (
          <div
            className={`${styles.goalCard} ${weeklyProgress.isMet ? styles.goalCardMet : ''}`}
          >
            <div className={styles.topRow}>
              <div className={styles.labelWrapper}>
                <Calendar size={14} color={habitColor} />
                <span>Meta Semanal</span>
              </div>

              {weeklyProgress.isMet ? (
                <span className={styles.badgeMet}>
                  <CheckCircle2 size={12} /> ¡Alcanzada!
                </span>
              ) : (
                <span className={styles.badgeRemaining}>
                  {weeklyProgress.daysRemaining === 1
                    ? 'Último día'
                    : `${weeklyProgress.daysRemaining} días restantes`}
                </span>
              )}
            </div>

            <div className={styles.progressNumbers}>
              <div>
                <span className={styles.currentValue}>{weeklyProgress.current}</span>
                <span className={styles.targetValue}>
                  {' '}
                  / {weeklyProgress.target} {weeklyProgress.unit}
                </span>
              </div>
              <span
                className={styles.percentageText}
                style={{ color: weeklyProgress.isMet ? 'var(--tk-accent)' : habitColor }}
              >
                {weeklyProgress.percentage}%
              </span>
            </div>

            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{
                  width: `${weeklyProgress.percentage}%`,
                  backgroundColor: weeklyProgress.isMet ? 'var(--tk-accent)' : habitColor,
                  boxShadow: weeklyProgress.isMet
                    ? '0 0 8px var(--tk-accent)'
                    : undefined,
                }}
              />
            </div>
          </div>
        )}

        {/* Monthly Goal Card */}
        {monthlyProgress && (
          <div
            className={`${styles.goalCard} ${monthlyProgress.isMet ? styles.goalCardMet : ''}`}
          >
            <div className={styles.topRow}>
              <div className={styles.labelWrapper}>
                <Award size={14} color={habitColor} />
                <span>Meta Mensual</span>
              </div>

              {monthlyProgress.isMet ? (
                <span className={styles.badgeMet}>
                  <CheckCircle2 size={12} /> ¡Alcanzada!
                </span>
              ) : (
                <span className={styles.badgeRemaining}>
                  {monthlyProgress.daysRemaining === 1
                    ? 'Último día'
                    : `${monthlyProgress.daysRemaining} días restantes`}
                </span>
              )}
            </div>

            <div className={styles.progressNumbers}>
              <div>
                <span className={styles.currentValue}>{monthlyProgress.current}</span>
                <span className={styles.targetValue}>
                  {' '}
                  / {monthlyProgress.target} {monthlyProgress.unit}
                </span>
              </div>
              <span
                className={styles.percentageText}
                style={{ color: monthlyProgress.isMet ? 'var(--tk-accent)' : habitColor }}
              >
                {monthlyProgress.percentage}%
              </span>
            </div>

            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{
                  width: `${monthlyProgress.percentage}%`,
                  backgroundColor: monthlyProgress.isMet ? 'var(--tk-accent)' : habitColor,
                  boxShadow: monthlyProgress.isMet
                    ? '0 0 8px var(--tk-accent)'
                    : undefined,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
