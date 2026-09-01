import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Sparkles, Palette, Check } from 'lucide-react';
import { Habit, DailyActivityLog } from '@/core/types';
import { generateHeatmapWeeks } from '@/core/utils/dateUtils';
import {
  calculateGlobalDaySummary,
  getHabitCustomColorShade,
} from '@/features/heatmap/logic/heatmapCalculator';
import { useThemeStore } from '@/core/theme/useThemeStore';
import { useI18nStore } from '@/core/i18n';
import styles from './GlobalHeatmap.module.css';

export const GLOBAL_HEATMAP_PRESET_COLORS = [
  { name: 'Esmeralda GitHub', hex: '#39d353' },
  { name: 'Azul Océano', hex: '#38bdf8' },
  { name: 'Índigo Neón', hex: '#818cf8' },
  { name: 'Púrpura Vibrante', hex: '#a855f7' },
  { name: 'Rosa Fucsia', hex: '#ec4899' },
  { name: 'Ámbar Dorado', hex: '#f59e0b' },
  { name: 'Naranja Fuego', hex: '#f97316' },
  { name: 'Verde Azulado', hex: '#14b8a6' },
];

const GLOBAL_COLOR_STORAGE_KEY = 'tk_global_heatmap_color';

export interface GlobalHeatmapProps {
  habits: Habit[];
  logs: DailyActivityLog[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  weeksCount?: number;
  footerSlot?: React.ReactNode;
}

export const GlobalHeatmap: React.FC<GlobalHeatmapProps> = React.memo(({
  habits,
  logs,
  selectedDate,
  onSelectDate,
  weeksCount = 20,
  footerSlot,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const { t, language } = useI18nStore();
  const isDark = theme === 'dark';

  const [globalColor, setGlobalColor] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(GLOBAL_COLOR_STORAGE_KEY) || '#39d353';
    }
    return '#39d353';
  });

  const [showColorPopover, setShowColorPopover] = useState(false);

  const handleColorChange = (hex: string) => {
    setGlobalColor(hex);
    if (typeof window !== 'undefined') {
      localStorage.setItem(GLOBAL_COLOR_STORAGE_KEY, hex);
    }
  };

  // Generate week columns (Monday to Sunday)
  const weeks = useMemo(() => {
    const locale = language === 'en' ? 'en-US' : 'es-ES';
    return generateHeatmapWeeks(weeksCount, new Date(), locale);
  }, [weeksCount, language]);

  // Precompute day summaries
  const daySummaries = useMemo(() => {
    const map = new Map<string, ReturnType<typeof calculateGlobalDaySummary>>();
    weeks.forEach((week) => {
      week.days.forEach((day) => {
        if (!day.isFuture) {
          map.set(day.date, calculateGlobalDaySummary(day.date, habits, logs));
        }
      });
    });
    return map;
  }, [weeks, habits, logs]);

  // Auto-scroll to current week on mobile mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  const dayNames = language === 'en' ? ['M', '', 'W', '', 'F', '', 'S'] : ['L', '', 'M', '', 'V', '', 'D'];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>{t('stats.generalActivity')}</h3>
          <span className={styles.subtitle}>{t('stats.lastWeeks', { weeks: weeksCount })}</span>
        </div>

        {/* Small Color Selector Button on the Top-Right */}
        <div className={styles.headerRight}>
          <button
            type="button"
            className={styles.colorPickerBtn}
            onClick={() => setShowColorPopover(!showColorPopover)}
            title="Personalizar color del cuadro"
            aria-label="Personalizar color del cuadro"
          >
            <Palette size={13} />
            <span className={styles.colorDot} style={{ backgroundColor: globalColor }} />
          </button>

          {showColorPopover && (
            <>
              <div
                className={styles.popoverOverlay}
                onClick={() => setShowColorPopover(false)}
              />
              <div className={styles.colorPopover}>
                <span className={styles.popoverTitle}>{t('stats.matrixColor')}</span>
                <div className={styles.paletteGrid}>
                  {GLOBAL_HEATMAP_PRESET_COLORS.map((item) => {
                    const isSelected = globalColor.toLowerCase() === item.hex.toLowerCase();
                    return (
                      <button
                        key={item.hex}
                        type="button"
                        className={`${styles.paletteItem} ${isSelected ? styles.paletteItemSelected : ''}`}
                        style={{ backgroundColor: item.hex }}
                        onClick={() => {
                          handleColorChange(item.hex);
                          setShowColorPopover(false);
                        }}
                        title={item.name}
                      >
                        {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>

                <div className={styles.customColorRow}>
                  <span className={styles.customColorLabel}>{t('stats.custom')}</span>
                  <input
                    type="color"
                    className={styles.customInput}
                    value={globalColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
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
                    key={`month_${idx}`}
                    className={styles.monthLabel}
                    style={{ left: `calc(${idx} * var(--col-step, 15px))` }}
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
                  const summary = daySummaries.get(day.date);
                  const level = summary ? summary.intensityLevel : 0;
                  const hasRecord = !!summary?.hasRecord;

                  const cellColor = level > 0
                    ? getHabitCustomColorShade(globalColor, level, isDark)
                    : undefined;

                  const cellClasses = [
                    styles.cell,
                    day.isFuture ? styles.futureCell : '',
                    isSelected ? styles.selectedCell : '',
                    hasRecord ? styles.recordCell : '',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  const tooltipText = day.isFuture
                    ? ''
                    : t('stats.tooltip', {
                        date: day.date,
                        completed: summary?.completedCount || 0,
                        total: summary?.totalPlannedCount || 0,
                      });

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
            style={{ backgroundColor: getHabitCustomColorShade(globalColor, 1, isDark) }}
          />
          <span
            className={styles.legendCell}
            style={{ backgroundColor: getHabitCustomColorShade(globalColor, 2, isDark) }}
          />
          <span
            className={styles.legendCell}
            style={{ backgroundColor: getHabitCustomColorShade(globalColor, 3, isDark) }}
          />
          <span
            className={styles.legendCell}
            style={{ backgroundColor: getHabitCustomColorShade(globalColor, 4, isDark) }}
          />
          <span>{t('stats.more')}</span>
        </div>
      </div>

      {footerSlot && (
        <div className={styles.footerSlotWrapper}>
          {footerSlot}
        </div>
      )}
    </div>
  );
});
