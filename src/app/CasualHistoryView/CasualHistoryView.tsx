import React, { useState, useMemo } from 'react';
import { Sparkles, Calendar, Layers, ArrowUpRight } from 'lucide-react';
import { Habit, DailyActivityLog } from '@/core/types';
import { HabitIcon } from '@/core/ui/HabitIcon';
import { useI18nStore } from '@/core/i18n';
import styles from './CasualHistoryView.module.css';

export interface CasualHistoryViewProps {
  habits: Habit[];
  logs: DailyActivityLog[];
  onOpenHabitDetail: (habit: Habit) => void;
}

export const CasualHistoryView: React.FC<CasualHistoryViewProps> = ({
  habits,
  logs,
  onOpenHabitDetail,
}) => {
  const { t, formatRelativeDate } = useI18nStore();
  const [viewMode, setViewMode] = useState<'by_activity' | 'timeline'>('by_activity');

  // Filter casual habits
  const casualHabits = useMemo(() => {
    return habits.filter((h) => h.frequency.type === 'casual');
  }, [habits]);

  const casualHabitIds = useMemo(() => {
    return new Set(casualHabits.map((h) => h.id));
  }, [casualHabits]);

  // Filter logs belonging to casual habits with isCompleted or totalValue > 0
  const casualLogs = useMemo(() => {
    return logs
      .filter((l) => casualHabitIds.has(l.habitId) && (l.isCompleted || l.totalValue > 0))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [logs, casualHabitIds]);

  // Aggregate stats per casual habit
  const habitStats = useMemo(() => {
    return casualHabits
      .map((habit) => {
        const hLogs = casualLogs.filter((l) => l.habitId === habit.id);
        const totalCount = hLogs.length;
        const totalVolume = hLogs.reduce((acc, l) => acc + (l.totalValue || 0), 0);
        const lastDate = hLogs.length > 0 ? hLogs[0].date : null;

        return {
          habit,
          totalCount,
          totalVolume,
          lastDate,
        };
      })
      .sort((a, b) => b.totalCount - a.totalCount);
  }, [casualHabits, casualLogs]);

  // Group logs by date for timeline view
  const timelineGroups = useMemo(() => {
    const map = new Map<string, Array<{ habit: Habit; log: DailyActivityLog }>>();
    casualLogs.forEach((log) => {
      const habit = habits.find((h) => h.id === log.habitId);
      if (!habit) return;
      const list = map.get(log.date) || [];
      list.push({ habit, log });
      map.set(log.date, list);
    });

    return Array.from(map.entries()).map(([date, items]) => ({
      date,
      items,
    }));
  }, [casualLogs, habits]);

  const uniqueActiveDatesCount = useMemo(() => {
    const dates = new Set<string>();
    casualLogs.forEach((l) => dates.add(l.date));
    return dates.size;
  }, [casualLogs]);

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>{t('casualActivities.historyTitle')}</h2>
          <p className={styles.pageSubtitle}>
            {casualHabits.length} actividades • {casualLogs.length} registros totales
          </p>
        </div>
      </div>

      {/* Metric Overview */}
      <div className={styles.statsOverview}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{casualLogs.length}</span>
          <span className={styles.statLabel}>{t('casualActivities.totalDone')}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statValue} style={{ color: 'var(--tk-accent)' }}>
            {casualHabits.length}
          </span>
          <span className={styles.statLabel}>{t('casualActivities.uniqueActivities')}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statValue} style={{ color: '#fb923c' }}>
            {uniqueActiveDatesCount}
          </span>
          <span className={styles.statLabel}>Días activos</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className={styles.tabSwitch}>
        <button
          type="button"
          className={`${styles.tabBtn} ${viewMode === 'by_activity' ? styles.tabBtnActive : ''}`}
          onClick={() => setViewMode('by_activity')}
        >
          <Layers size={14} />
          <span>Por Actividad ({casualHabits.length})</span>
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${viewMode === 'timeline' ? styles.tabBtnActive : ''}`}
          onClick={() => setViewMode('timeline')}
        >
          <Calendar size={14} />
          <span>Cronología ({casualLogs.length})</span>
        </button>
      </div>

      {/* Content List */}
      {casualHabits.length === 0 ? (
        <div className={styles.emptyState}>
          <Sparkles size={32} color="var(--tk-text-muted)" />
          <p>Aún no tienes actividades casuales registradas.</p>
        </div>
      ) : viewMode === 'by_activity' ? (
        <div className={styles.activitiesGrid}>
          {habitStats.map(({ habit, totalCount, totalVolume, lastDate }) => (
            <div
              key={habit.id}
              className={styles.activityCard}
              onClick={() => onOpenHabitDetail(habit)}
            >
              <div className={styles.activityMain}>
                <HabitIcon name={habit.icon} color={habit.color} size={24} />
                <div className={styles.activityInfo}>
                  <span className={styles.activityName}>{habit.name}</span>
                  <span className={styles.activityMeta}>
                    {t('casualActivities.timesLogged', { count: totalCount })}
                    {habit.type === 'quantitative' && ` • ${totalVolume} ${habit.unit || 'uds'}`}
                    {lastDate && ` • ${t('casualActivities.lastDone', { date: formatRelativeDate(lastDate) })}`}
                  </span>
                </div>
              </div>
              <ArrowUpRight size={18} color="var(--tk-text-muted)" />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.timelineContainer}>
          {timelineGroups.length === 0 ? (
            <div className={styles.emptyState}>
              <Calendar size={32} color="var(--tk-text-muted)" />
              <p>No hay registros en la cronología.</p>
            </div>
          ) : (
            timelineGroups.map(({ date, items }) => (
              <div key={date} className={styles.timelineGroup}>
                <span className={styles.timelineDate}>
                  {formatRelativeDate(date)} ({date})
                </span>
                <div className={styles.timelineList}>
                  {items.map(({ habit, log }) => (
                    <div
                      key={`${habit.id}_${date}`}
                      className={styles.timelineItem}
                      onClick={() => onOpenHabitDetail(habit)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <HabitIcon name={habit.icon} color={habit.color} size={18} />
                        <span style={{ fontWeight: 600, color: 'var(--tk-text-primary)' }}>
                          {habit.name}
                        </span>
                      </div>
                      <span style={{ color: 'var(--tk-accent)', fontWeight: 700 }}>
                        {habit.type === 'quantitative' ? `${log.totalValue} ${habit.unit || 'uds'}` : '✓'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
