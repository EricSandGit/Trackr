import React, { useState, useEffect } from 'react';
import { Plus, Check, RotateCcw } from 'lucide-react';
import { Habit, DailyActivityLog } from '@/core/types';
import { BottomSheet } from '@/core/ui/BottomSheet';
import { Button } from '@/core/ui/Button';
import { HabitIcon } from '@/core/ui/HabitIcon';
import { useI18nStore } from '@/core/i18n';
import styles from './QuickLogBottomSheet.module.css';

export interface QuickLogBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  targetDate: string;
  currentLog?: DailyActivityLog;
  onAddVolume: (habit: Habit, amount: number, date: string, notes?: string) => Promise<void>;
  onSetDirectValue: (habit: Habit, value: number, date: string) => Promise<void>;
}

export const QuickLogBottomSheet: React.FC<QuickLogBottomSheetProps> = ({
  isOpen,
  onClose,
  habit,
  targetDate,
  currentLog,
  onAddVolume,
  onSetDirectValue,
}) => {
  const { t, formatRelativeDate } = useI18nStore();
  const [inputValue, setInputValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setInputValue('');
  }, [isOpen, habit]);

  if (!habit) return null;

  const currentTotal = currentLog?.totalValue || 0;
  const goal = habit.dailyGoal || 0;
  const unit = habit.unit || 'uds';
  const progressPercent = goal > 0 ? Math.min(100, Math.round((currentTotal / goal) * 100)) : 100;

  // Tailored presets based on unit
  const isTime = unit.toLowerCase().includes('min') || unit.toLowerCase().includes('hora') || unit.toLowerCase().includes('hour');
  const presets = isTime ? [15, 30, 45, 60] : [1, 5, 10, 20];

  const handleAddPreset = async (amount: number) => {
    setIsSubmitting(true);
    try {
      await onAddVolume(habit, amount, targetDate);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(inputValue);
    if (!isNaN(num) && num > 0) {
      setIsSubmitting(true);
      try {
        await onAddVolume(habit, num, targetDate);
        setInputValue('');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleResetDay = async () => {
    if (window.confirm(t('quickLog.resetConfirm'))) {
      setIsSubmitting(true);
      try {
        await onSetDirectValue(habit, 0, targetDate);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('quickLog.title')}>
      <div className={styles.container}>
        {/* Habit & Date Header */}
        <div className={styles.habitHeader}>
          <div className={styles.habitIcon}>
            <HabitIcon name={habit.icon} size={22} color={habit.color} />
          </div>
          <div className={styles.habitInfo}>
            <span className={styles.habitName}>{habit.name}</span>
            <span className={styles.habitDate}>
              {t('quickLog.logFor')} <strong>{formatRelativeDate(targetDate, 'long')}</strong>
            </span>
          </div>
        </div>

        {/* Progress Bar Section */}
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <div>
              <span className={styles.progressNumbers}>{currentTotal}</span>
              <span className={styles.progressGoal}>
                {goal > 0 ? ` / ${goal} ${unit}` : ` ${unit}`}
              </span>
            </div>
            <span className={styles.habitDate}>
              {t('quickLog.percentCompleted', { percent: progressPercent })}
            </span>
          </div>

          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{
                width: `${progressPercent}%`,
                backgroundColor: habit.color || 'var(--tk-accent)',
              }}
            />
          </div>
        </div>

        {/* Quick Add Presets */}
        <div>
          <span className={styles.sectionLabel}>
            {t('quickLog.quickAdd')}
          </span>
          <div className={styles.quickPresets}>
            {presets.map((amount) => (
              <button
                key={amount}
                type="button"
                className={styles.presetBtn}
                disabled={isSubmitting}
                onClick={() => handleAddPreset(amount)}
              >
                +{amount} {unit}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <form onSubmit={handleCustomSubmit} className={styles.manualInputSection}>
          <span className={styles.sectionLabel}>{t('quickLog.exactAdd')}</span>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="0"
              className={styles.numberInput}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <span className={styles.unitLabel}>{unit}</span>
            <Button
              type="submit"
              variant="primary"
              disabled={!inputValue || isSubmitting}
              leftIcon={<Plus size={16} />}
            >
              {t('habitCard.addVolume')}
            </Button>
          </div>
        </form>

        {/* Actions Row */}
        <div className={styles.actionsRow}>
          {currentTotal > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetDay}
              disabled={isSubmitting}
              leftIcon={<RotateCcw size={14} />}
            >
              {t('quickLog.resetToZero')}
            </Button>
          )}
          <div style={{ flex: 1 }} />
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            leftIcon={<Check size={16} />}
          >
            {t('common.ready')}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
