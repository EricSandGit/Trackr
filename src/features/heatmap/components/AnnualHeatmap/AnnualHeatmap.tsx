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
import styles from './AnnualHeatmap.module.css';

export interface AnnualHeatmapProps {
  habit: Habit;
  logs: DailyActivityLog[];
  selectedDate?: string;
  onSelectDate: (date: string) => void;
}

export const AnnualHeatmap: React.FC<AnnualHeatmapProps> = React.memo(({
  habit,
  logs,
  selectedDate,
  onSelectDate,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const { t, language } = useI18nStore();
  const isDark = theme === 'dark';

  // 52 weeks = 1 full year
  const weeks = useMemo(() => {
    const locale = language === 'en' ? 'en-US' : 'es-ES';
    return generateHeatmapWeeks(52, new Date(), locale);
  }, [language]);

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
          <Calendar size={18} color={habitColor} />
          <h4 className={styles.title}>
            {language === 'en' ? 'Annual History' : 'Historial Anual'}
          </h4>
          <span className={styles.subtitle}>
            {language === 'en' ? '(Full 52 weeks)' : '(52 semanas completas)'}
          </span>
        </div>
      </div>

      <div className={styles.scrollArea} ref={scrollRef}>
        <div className={styles.matrixWrapper}>
          <div className={styles.monthLabelsRow}>
            {weeks.map((week, idx) => {
              if (week.monthLabel) {
                return (
                  <span
                    key={`ann_month_${idx}`}
                    className={styles.monthLabel}
                    style={{ left: `calc(${idx} * var(--col-step, 21.5px))` }}
                  >
                    {week.monthLabel}
                  </span>
                );
              }
              return null;
            })}
          </div>

          <div className={styles.gridBody}>
            <div className={styles.dayLabelsCol}>
              {dayNames.map((d, i) => (
                <span key={i} className={styles.dayLabel}>
                  {d}
                </span>
              ))}
            </div>

            {weeks.map((week) => (
              <div key={week.weekIndex} className={styles.weekCol}>
                {week.days.map((day) => {
                  const isOutOfRange = (habit.startDate && day.date < habit.startDate) || (habit.endDate && day.date > habit.endDate);
                  const isSelected = !isOutOfRange && day.date === selectedDate;
                  const log = logsMap.get(day.date);
                  const { level, isRecord, value } = calculateHabitDayIntensity(
                    day.date,
                    habit,
                    log
                  );

                  const cellColor = level > 0 && !isOutOfRange ? getHabitCustomColorShade(habitColor, level, isDark) : undefined;

                  const isRelapseDay = !isOutOfRange && habit.type === 'avoidance' && log !== undefined && log.isCompleted === false;

                  const cellClasses = [
                    styles.cell,
                    day.isFuture ? styles.futureCell : '',
                    isOutOfRange ? styles.outOfRangeCell : '',
                    isSelected ? styles.selectedCell : '',
                    isRecord && !isOutOfRange ? styles.recordCell : '',
                    isRelapseDay ? styles.relapseCell : '',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  const style: React.CSSProperties = {
                    backgroundColor: cellColor,
                  };

                  const tooltip = day.isFuture
                    ? ''
                    : isOutOfRange
                    ? `${day.date} (${language === 'en' ? 'Outside period' : 'Fuera del periodo'})`
                    : habit.type === 'quantitative'
                    ? `${day.date}: ${value} ${habit.unit || ''}`
                    : habit.type === 'avoidance'
                    ? `${day.date}: ${isRelapseDay ? 'Recaída' : 'Día limpio'}`
                    : `${day.date}: ${log?.isCompleted ? 'Completado' : 'Pendiente'}`;

                  return (
                    <div
                      key={day.date}
                      className={cellClasses}
                      style={style}
                      title={tooltip}
                      onClick={() => !day.isFuture && !isOutOfRange && onSelectDate(day.date)}
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
});
