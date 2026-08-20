import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Habit, DailyActivityLog } from '@/core/types';
import {
  generateMonthCalendar,
  isToday,
} from '@/core/utils/dateUtils';
import {
  calculateHabitDayIntensity,
  getHabitCustomColorShade,
} from '@/features/heatmap/logic/heatmapCalculator';
import { useThemeStore } from '@/core/theme/useThemeStore';
import { useI18nStore } from '@/core/i18n';
import styles from './MonthlyGrid.module.css';

export interface MonthlyGridProps {
  habit: Habit;
  logs: DailyActivityLog[];
  onSelectDate: (date: string) => void;
}

export const MonthlyGrid: React.FC<MonthlyGridProps> = ({
  habit,
  logs,
  onSelectDate,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const { theme } = useThemeStore();
  const { formatMonthName, language, t } = useI18nStore();
  const isDark = theme === 'dark';

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();

  const days = generateMonthCalendar(year, monthIndex);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, monthIndex - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, monthIndex + 1, 1));
  };

  const weekdayHeaders =
    language === 'en'
      ? [
          t('habitForm.daysAbbrev.mon'),
          t('habitForm.daysAbbrev.tue'),
          t('habitForm.daysAbbrev.wed'),
          t('habitForm.daysAbbrev.thu'),
          t('habitForm.daysAbbrev.fri'),
          t('habitForm.daysAbbrev.sat'),
          t('habitForm.daysAbbrev.sun'),
        ]
      : ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className={styles.container}>
      <div className={styles.navHeader}>
        <h4 className={styles.monthTitle}>{formatMonthName(year, monthIndex)}</h4>
        <div className={styles.navButtons}>
          <button className={styles.arrowBtn} onClick={handlePrevMonth} aria-label={t('nav.prevDay')}>
            <ChevronLeft size={16} />
          </button>
          <button className={styles.arrowBtn} onClick={handleNextMonth} aria-label={t('nav.nextDay')}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className={styles.weekdaysRow}>
        {weekdayHeaders.map((w, i) => (
          <span key={i} className={styles.weekdayLabel}>
            {w}
          </span>
        ))}
      </div>

      <div className={styles.daysGrid}>
        {days.map((day) => {
          const log = logs.find((l) => l.habitId === habit.id && l.date === day.date);
          const { level, isRecord, value } = calculateHabitDayIntensity(
            day.date,
            habit,
            log
          );

          const isCurrentDay = isToday(day.date);
          const cellColor = getHabitCustomColorShade(habit.color, level, isDark);

          const cellClasses = [
            styles.dayCell,
            !day.isCurrentMonth ? styles.otherMonth : '',
            isCurrentDay ? styles.todayBorder : '',
            isRecord ? styles.recordDay : '',
          ]
            .filter(Boolean)
            .join(' ');

          const style: React.CSSProperties = {
            backgroundColor: level > 0 ? cellColor : undefined,
            color: level >= 3 ? '#ffffff' : undefined,
          };

          return (
            <div
              key={day.date}
              className={cellClasses}
              style={style}
              onClick={() => onSelectDate(day.date)}
            >
              <span>{day.dayNumber}</span>
              {isRecord && (
                <span className={styles.recordStar}>
                  <Sparkles size={10} />
                </span>
              )}
              {habit.type === 'quantitative' && value > 0 && (
                <span className={styles.cellValue}>
                  {value}
                  {habit.unit ? habit.unit[0] : ''}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
