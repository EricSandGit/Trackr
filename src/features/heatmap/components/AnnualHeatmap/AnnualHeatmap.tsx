import React, { useMemo, useRef, useEffect } from 'react';
import { Habit, DailyActivityLog } from '@/core/types';
import { generateHeatmapWeeks } from '@/core/utils/dateUtils';
import {
  calculateHabitDayIntensity,
  getHabitCustomColorShade,
} from '@/features/heatmap/logic/heatmapCalculator';
import { useThemeStore } from '@/core/theme/useThemeStore';
import styles from './AnnualHeatmap.module.css';

export interface AnnualHeatmapProps {
  habit: Habit;
  logs: DailyActivityLog[];
  onSelectDate: (date: string) => void;
}

export const AnnualHeatmap: React.FC<AnnualHeatmapProps> = ({
  habit,
  logs,
  onSelectDate,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  // 52 weeks = 1 full year
  const weeks = useMemo(() => {
    return generateHeatmapWeeks(52, new Date());
  }, []);

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

  const dayNames = ['L', '', 'M', '', 'V', '', 'D'];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>Historial Anual (52 Semanas)</h4>
      </div>

      <div className={styles.scrollArea} ref={scrollRef}>
        <div className={styles.matrixWrapper}>
          <div className={styles.monthLabelsRow}>
            {weeks.map((week, idx) => {
              if (week.monthLabel) {
                const leftPos = idx * 15;
                return (
                  <span
                    key={`ann_month_${idx}`}
                    className={styles.monthLabel}
                    style={{ left: `${leftPos}px` }}
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
                  const log = logsMap.get(day.date);
                  const { level, isRecord, value } = calculateHabitDayIntensity(
                    day.date,
                    habit,
                    log
                  );

                  const cellColor = getHabitCustomColorShade(habit.color, level, isDark);

                  const cellClasses = [
                    styles.cell,
                    day.isFuture ? styles.futureCell : '',
                    isRecord ? styles.recordCell : '',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  const style: React.CSSProperties = {
                    backgroundColor: level > 0 ? cellColor : undefined,
                  };

                  const tooltip = `${day.date}: ${value} ${habit.unit || ''}`;

                  return (
                    <div
                      key={day.date}
                      className={cellClasses}
                      style={style}
                      title={tooltip}
                      onClick={() => !day.isFuture && onSelectDate(day.date)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
