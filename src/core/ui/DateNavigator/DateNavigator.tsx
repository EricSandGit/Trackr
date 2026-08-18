import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import {
  formatDateToISO,
  shiftDate,
  getRelativeDateLabel,
  isToday,
  parseISODate,
} from '@/core/utils/dateUtils';
import styles from './DateNavigator.module.css';

export interface DateNavigatorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handlePrevDay = () => {
    onSelectDate(shiftDate(selectedDate, -1));
  };

  const handleNextDay = () => {
    const next = shiftDate(selectedDate, 1);
    const today = formatDateToISO(new Date());
    if (next <= today) {
      onSelectDate(next);
    }
  };

  const handleGoToday = () => {
    onSelectDate(formatDateToISO(new Date()));
  };

  const isCurrentDayToday = isToday(selectedDate);
  const todayStr = formatDateToISO(new Date());

  const dateObj = parseISODate(selectedDate);
  const formattedFull = dateObj.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className={styles.container}>
      <div className={styles.navArrows}>
        <button className={styles.arrowBtn} onClick={handlePrevDay} aria-label="Día anterior">
          <ChevronLeft size={16} />
        </button>
      </div>

      <div
        className={styles.centerInfo}
        onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.click()}
      >
        <div className={styles.dateTitle}>
          <CalendarIcon size={14} color="var(--tk-info)" />
          <span>{getRelativeDateLabel(selectedDate, 'short')}</span>
          {!isCurrentDayToday && (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--tk-warning)',
                fontWeight: 600,
              }}
            >
              (Retroactivo)
            </span>
          )}
        </div>
        <span className={styles.dateSub}>{formattedFull}</span>

        <input
          type="date"
          ref={dateInputRef}
          className={styles.hiddenDatePicker}
          max={todayStr}
          value={selectedDate}
          onChange={(e) => e.target.value && onSelectDate(e.target.value)}
        />
      </div>

      <div className={styles.navArrows}>
        {!isCurrentDayToday && (
          <button className={styles.todayQuickBtn} onClick={handleGoToday}>
            Ir a Hoy
          </button>
        )}
        <button
          className={styles.arrowBtn}
          onClick={handleNextDay}
          disabled={isCurrentDayToday}
          aria-label="Día siguiente"
          style={{ opacity: isCurrentDayToday ? 0.3 : 1 }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
