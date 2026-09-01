import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import {
  formatDateToISO,
  shiftDate,
  isToday,
} from '@/core/utils/dateUtils';
import { useI18nStore } from '@/core/i18n';
import styles from './DateNavigator.module.css';

export interface DateNavigatorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  variant?: 'default' | 'embedded';
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  selectedDate,
  onSelectDate,
  variant = 'default',
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const { t, formatRelativeDate, formatFullDate } = useI18nStore();

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
  const formattedFull = formatFullDate(selectedDate);

  return (
    <div
      className={`${styles.container} ${variant === 'embedded' ? styles.embedded : ''}`}
    >
      <div className={styles.navArrows}>
        <button className={styles.arrowBtn} onClick={handlePrevDay} aria-label={t('nav.prevDay')}>
          <ChevronLeft size={16} />
        </button>
      </div>

      <div
        className={styles.centerInfo}
        onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.click()}
      >
        <div className={styles.dateTitle}>
          <CalendarIcon size={14} color="var(--tk-info)" />
          <span>{formatRelativeDate(selectedDate, 'short')}</span>
          {!isCurrentDayToday && (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--tk-warning)',
                fontWeight: 600,
              }}
            >
              {t('common.retroactive')}
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
            {t('nav.goToday')}
          </button>
        )}
        <button
          className={styles.arrowBtn}
          onClick={handleNextDay}
          disabled={isCurrentDayToday}
          aria-label={t('nav.nextDay')}
          style={{ opacity: isCurrentDayToday ? 0.3 : 1 }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
