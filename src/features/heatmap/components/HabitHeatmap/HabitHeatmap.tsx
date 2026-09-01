import React, { useMemo, useRef, useEffect } from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import { Habit, DailyActivityLog } from '@/core/types';
import { generateHeatmapWeeks } from '@/core/utils/dateUtils';
import {
  calculateHabitDayIntensity,
  getHabitCustomColorShade,
} from '@/features/heatmap/logic/heatmapCalculator';
import { useThemeStore } from '@/core/theme/useThemeStore';
import { useI18nStore } from '@/core/i18n';
import styles from './HabitHeatmap.module.css';

export interface HabitHeatmapProps {
  habit: Habit;
  logs: DailyActivityLog[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  weeksCount?: number;
}

export const HabitHeatmap: React.FC<HabitHeatmapProps> = ({
  habit,
  logs,
  selectedDate,
  onSelectDate,
  weeksCount = 24,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const { t, language } = useI18nStore();
  const isDark = theme === 'dark';

  const weeks = useMemo(() => {
    const locale = language === 'en' ? 'en-US' : 'es-ES';
    return generateHeatmapWeeks(weeksCount, new Date(), locale);
  }, [weeksCount, language]);

  const logsMap = useMemo(() => {
    const map = new Map<string, DailyActivityLog>();
    logs.forEach((l) => {
      if (l.habitId === habit.id) {
        map.set(l.date, l);
      }
    });
    return map;
  }, [logs, habit.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  const dayNames = language === 'en' ? ['M', '', 'W', '', 'F', '', 'S'] : ['L', '', 'M', '', 'V', '', 'D'];
  const habitColor = habit.color || '#39d353';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <Calendar size={17} color={habitColor} />
          <h4 className={styles.title}>
            {language === 'en' ? 'Activity History' : 'Historial de Actividad'}
          </h4>
          <span className={styles.subtitle}>
            {language === 'en' ? `(Last ${weeksCount} weeks)` : `(Últimas ${weeksCount} semanas)`}
          </span>
        </div>
      </div>

      <div className={styles.scrollArea} ref={scrollRef}>
        <div className={styles.matrixWrapper}>
          {/* Month Labels Row */}
          <div className={styles.monthLabelsRow}>
            {weeks.map((week, idx) => {
              if (week.monthLabel) {
                return (
                  <span
                    key={`hmonth_${idx}`}
                    className={styles.monthLabel}
                    style={{ left: `calc(${idx} * var(--col-step, 19px))` }}
                  >
                    {week.monthLabel}
                  </span>
                );
              }
              return null;
            })}
          </div>

          <div className={styles.gridBody}>
            {/* Day of week abbreviations */}
            <div className={styles.dayLabelsCol}>
              {dayNames.map((d, i) => (
                <span key={i} className={styles.dayLabel}>
                  {d}
                </span>
              ))}
            </div>

            {/* Matrix of Columns (Weeks) */}
            {weeks.map((week) => (
              <div key={week.weekIndex} className={styles.weekCol}>
                {week.days.map((day) => {
                  const isSelected = day.date === selectedDate;
                  const log = logsMap.get(day.date);
                  const { level, isRecord, value } = calculateHabitDayIntensity(
                    day.date,
                    habit,
                    log
                  );

                  const cellColor = level > 0
                    ? getHabitCustomColorShade(habitColor, level, isDark)
                    : undefined;

                  const isRelapseDay = habit.type === 'avoidance' && log !== undefined && log.isCompleted === false;

                  const cellClasses = [
                    styles.cell,
                    day.isFuture ? styles.futureCell : '',
                    isSelected ? styles.selectedCell : '',
                    isRecord ? styles.recordCell : '',
                    isRelapseDay ? styles.relapseCell : '',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  const tooltipText = day.isFuture
                    ? ''
                    : habit.type === 'quantitative'
                    ? `${day.date}: ${value} ${habit.unit || ''}`
                    : habit.type === 'avoidance'
                    ? `${day.date}: ${isRelapseDay ? 'Recaída' : 'Día limpio'}`
                    : `${day.date}: ${log?.isCompleted ? 'Completado' : 'Pendiente'}`;

                  return (
                    <div
                      key={day.date}
                      className={cellClasses}
                      style={{ backgroundColor: cellColor }}
                      title={tooltipText}
                      onClick={() => !day.isFuture && onSelectDate(day.date)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={12} color="var(--tk-record-gold)" /> {t('common.personalRecord')}
        </span>
        <div className={styles.legend}>
          <span>{t('stats.less')}</span>
          <span
            className={styles.legendCell}
            style={{ backgroundColor: 'var(--tk-cell-empty)' }}
          />
          <span
            className={styles.legendCell}
            style={{ backgroundColor: getHabitCustomColorShade(habitColor, 1, isDark) }}
          />
          <span
            className={styles.legendCell}
            style={{ backgroundColor: getHabitCustomColorShade(habitColor, 2, isDark) }}
          />
          <span
            className={styles.legendCell}
            style={{ backgroundColor: getHabitCustomColorShade(habitColor, 3, isDark) }}
          />
          <span
            className={styles.legendCell}
            style={{ backgroundColor: getHabitCustomColorShade(habitColor, 4, isDark) }}
          />
          <span>{t('stats.more')}</span>
        </div>
      </div>
    </div>
  );
};
