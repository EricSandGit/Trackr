import React, { useMemo } from 'react';
import { Flame, TrendingUp, CheckCircle2, Award, Zap, Sparkles } from 'lucide-react';
import { Habit, DailyActivityLog } from '@/core/types';
import { HabitIcon } from '@/core/ui/HabitIcon';
import { useI18nStore } from '@/core/i18n';
import { calculateGlobalConsistencyStats } from '@/features/stats/logic/streakCalculator';
import styles from './ConsistencyOverview.module.css';

export interface ConsistencyOverviewProps {
  habits: Habit[];
  logs: DailyActivityLog[];
}

function formatCreationDate(dateStr?: string): string {
  if (!dateStr) return '---';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '---';
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '---';
  }
}

export const ConsistencyOverview: React.FC<ConsistencyOverviewProps> = ({ habits, logs }) => {
  const { t } = useI18nStore();
  const stats = useMemo(() => {
    return calculateGlobalConsistencyStats(habits, logs);
  }, [habits, logs]);

  const mostConsistentHabitFull = useMemo(() => {
    if (!stats.mostConsistentHabit) return null;
    return habits.find((h) => h.id === stats.mostConsistentHabit?.id) || null;
  }, [habits, stats.mostConsistentHabit]);

  const habitToReinforceFull = useMemo(() => {
    if (!stats.habitToReinforce) return null;
    return habits.find((h) => h.id === stats.habitToReinforce?.id) || null;
  }, [habits, stats.habitToReinforce]);

  return (
    <div className={styles.container}>
      {/* 3 Top Metric Cards */}
      <div className={styles.grid}>
        {/* Monthly Consistency */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleGroup}>
              <div className={styles.iconBadge} style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)' }}>
                <TrendingUp size={15} color="var(--tk-info)" />
              </div>
              <span className={styles.cardLabel}>{t('stats.month')}</span>
            </div>
            <span className={styles.pillBadge}>30 días</span>
          </div>

          <div className={styles.cardValueRow}>
            <span className={styles.metric} style={{ color: 'var(--tk-info)' }}>
              {stats.monthlyConsistencyPercentage}%
            </span>
          </div>

          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{
                width: `${Math.min(100, Math.max(4, stats.monthlyConsistencyPercentage))}%`,
                backgroundColor: 'var(--tk-info)',
              }}
            />
          </div>

          <span className={styles.subtext}>{t('stats.monthConsistency')}</span>
        </div>

        {/* Global Streak */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleGroup}>
              <div className={styles.iconBadge} style={{ backgroundColor: 'rgba(249, 115, 22, 0.15)' }}>
                <Flame size={15} color="#f97316" />
              </div>
              <span className={styles.cardLabel}>{t('stats.streak')}</span>
            </div>
            <span className={styles.pillBadge} title={`Récord: ${stats.bestGlobalStreak} días`}>
              🏆 {stats.bestGlobalStreak} días
            </span>
          </div>

          <div className={styles.cardValueRow}>
            <span className={styles.metric} style={{ color: '#f97316' }}>
              {stats.currentGlobalStreak}d
            </span>
          </div>

          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{
                width: `${stats.bestGlobalStreak > 0 ? Math.min(100, Math.max(5, (stats.currentGlobalStreak / stats.bestGlobalStreak) * 100)) : 5}%`,
                backgroundColor: '#f97316',
              }}
            />
          </div>

          <span className={styles.subtext}>
            {stats.currentGlobalStreak > 0 ? '¡Racha activa manteniéndose!' : 'Comienza tu racha hoy'}
          </span>
        </div>

        {/* This Week */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleGroup}>
              <div className={styles.iconBadge} style={{ backgroundColor: 'var(--tk-accent-surface)' }}>
                <CheckCircle2 size={15} color="var(--tk-accent)" />
              </div>
              <span className={styles.cardLabel}>{t('stats.week')}</span>
            </div>
            <span className={styles.pillBadge} title={`${stats.activeHabitsCount} hábitos activos`}>
              {stats.activeHabitsCount} hábitos
            </span>
          </div>

          <div className={styles.cardValueRow}>
            <span className={styles.metric} style={{ color: 'var(--tk-accent)' }}>
              {stats.totalActivitiesThisWeek}
            </span>
          </div>

          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{
                width: `${Math.min(100, Math.max(5, (stats.totalActivitiesThisWeek / Math.max(1, stats.activeHabitsCount * 7)) * 100))}%`,
                backgroundColor: 'var(--tk-accent)',
              }}
            />
          </div>

          <span className={styles.subtext}>{t('stats.completedActivities')}</span>
        </div>
      </div>

      {/* 2 Bottom Highlight Cards */}
      <div className={styles.highlightsRow}>
        {/* Most Consistent Habit */}
        <div className={styles.highlightCard}>
          <div className={styles.highlightHeader}>
            <span className={styles.highlightLabel} style={{ color: 'var(--tk-success)' }}>
              <Award size={15} />
              <span>{t('stats.mostConsistent')}</span>
            </span>
            {stats.mostConsistentHabit && (
              <span
                className={styles.highlightPercentBadge}
                style={{
                  backgroundColor: 'var(--tk-success-surface)',
                  color: 'var(--tk-success)',
                }}
              >
                {stats.mostConsistentHabit.percentage}%
              </span>
            )}
          </div>

          {stats.mostConsistentHabit ? (
            <>
              {/* Row: Big Habit Name right next to the Logo */}
              <div className={styles.highlightMainRow}>
                <div className={styles.highlightIcon}>
                  <HabitIcon
                    name={stats.mostConsistentHabit.icon}
                    color={stats.mostConsistentHabit.color}
                    size={22}
                  />
                </div>
                <span className={styles.highlightNameBig}>
                  {stats.mostConsistentHabit.name}
                </span>
              </div>

              {/* Creation Date, Category, and Description */}
              <div className={styles.highlightMetaGroup}>
                <span className={styles.highlightMetaLine}>
                  <strong>Creado:</strong> {formatCreationDate(mostConsistentHabitFull?.createdAt)}
                </span>
                <span className={styles.highlightMetaLine}>
                  <strong>Categoría:</strong> {mostConsistentHabitFull?.category || 'General'}
                </span>
                <span className={styles.highlightMetaLine}>
                  <strong>Descripción:</strong> {mostConsistentHabitFull?.description?.trim() || '---'}
                </span>
              </div>

              {/* Bottom: Progress bar and statistics below everything */}
              <div className={styles.highlightBottom}>
                <div className={styles.progressBarTrack}>
                  <div
                    className={styles.progressBarFill}
                    style={{
                      width: `${stats.mostConsistentHabit.percentage}%`,
                      backgroundColor: stats.mostConsistentHabit.color || 'var(--tk-accent)',
                    }}
                  />
                </div>
                <div className={styles.highlightStatsRow}>
                  <span className={styles.highlightStats}>
                    {stats.mostConsistentHabit.completedDays} de {stats.mostConsistentHabit.plannedDays} {t('common.days')} completados
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.emptyHighlight}>
              <Sparkles size={16} />
              <span>Completa hábitos regularmente para ver tu destacado</span>
            </div>
          )}
        </div>

        {/* Habit to Reinforce */}
        <div className={styles.highlightCard}>
          <div className={styles.highlightHeader}>
            <span className={styles.highlightLabel} style={{ color: '#fb923c' }}>
              <Zap size={15} />
              <span>{t('stats.toReinforce')}</span>
            </span>
            {stats.habitToReinforce && (
              <span
                className={styles.highlightPercentBadge}
                style={{
                  backgroundColor: 'rgba(251, 146, 60, 0.15)',
                  color: '#fb923c',
                }}
              >
                {stats.habitToReinforce.percentage}%
              </span>
            )}
          </div>

          {stats.habitToReinforce ? (
            <>
              {/* Row: Big Habit Name right next to the Logo */}
              <div className={styles.highlightMainRow}>
                <div className={styles.highlightIcon}>
                  <HabitIcon
                    name={stats.habitToReinforce.icon}
                    color={stats.habitToReinforce.color}
                    size={22}
                  />
                </div>
                <span className={styles.highlightNameBig}>
                  {stats.habitToReinforce.name}
                </span>
              </div>

              {/* Creation Date, Category, and Description */}
              <div className={styles.highlightMetaGroup}>
                <span className={styles.highlightMetaLine}>
                  <strong>Creado:</strong> {formatCreationDate(habitToReinforceFull?.createdAt)}
                </span>
                <span className={styles.highlightMetaLine}>
                  <strong>Categoría:</strong> {habitToReinforceFull?.category || 'General'}
                </span>
                <span className={styles.highlightMetaLine}>
                  <strong>Descripción:</strong> {habitToReinforceFull?.description?.trim() || '---'}
                </span>
              </div>

              {/* Bottom: Progress bar and statistics below everything */}
              <div className={styles.highlightBottom}>
                <div className={styles.progressBarTrack}>
                  <div
                    className={styles.progressBarFill}
                    style={{
                      width: `${stats.habitToReinforce.percentage}%`,
                      backgroundColor: '#fb923c',
                    }}
                  />
                </div>
                <div className={styles.highlightStatsRow}>
                  <span className={styles.highlightStats}>
                    {stats.habitToReinforce.completedDays} de {stats.habitToReinforce.plannedDays} {t('common.days')} completados
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.emptyHighlight}>
              <Sparkles size={16} />
              <span>¡Gran constancia! Todos tus hábitos van al día</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
