import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Archive,
  Maximize2,
  Minimize2,
  Plus,
  Tag,
  ShieldAlert,
  RotateCcw,
  Calendar,
} from 'lucide-react';
import { useHabitsStore } from '@/features/habits';
import { useLogsStore } from '@/features/logging';
import { Button } from '@/core/ui/Button';
import { HabitIcon } from '@/core/ui/HabitIcon';
import { useI18nStore } from '@/core/i18n';
import { MonthlyGrid, AnnualHeatmap } from '@/features/heatmap';
import { HabitStatBadges, HabitEvolutionChart, PeriodicGoalCards } from '@/features/stats';
import { HabitFormModal } from '@/features/habits';
import { QuickLogBottomSheet } from '@/features/logging';
import { isToday, formatDateToISO } from '@/core/utils/dateUtils';
import styles from './HabitDetailView.module.css';

export interface HabitDetailViewProps {
  habitId: string;
  onBack: () => void;
}

export const HabitDetailView: React.FC<HabitDetailViewProps> = ({ habitId, onBack }) => {
  const { habits, updateHabit, toggleArchiveHabit, deleteHabit } = useHabitsStore();
  const {
    logs,
    selectedDate,
    setSelectedDate,
    toggleBooleanHabit,
    toggleAvoidanceHabit,
    addQuantitativeVolume,
    setDirectQuantitativeValue,
  } = useLogsStore();
  const { t, formatRelativeDate } = useI18nStore();

  const [showAnnualHeatmap, setShowAnnualHeatmap] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

  const habit = habits.find((h) => h.id === habitId);

  if (!habit) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <h2>{t('habitDetail.notFound')}</h2>
          <Button variant="secondary" onClick={onBack} style={{ marginTop: '16px' }}>
            {t('habitDetail.returnHome')}
          </Button>
        </div>
      </div>
    );
  }

  const currentLog = logs.find((l) => l.habitId === habit.id && l.date === selectedDate);
  const isRelapse = habit.type === 'avoidance' && currentLog?.isCompleted === false;
  const isCurrentDay = isToday(selectedDate);
  const relativeDate = formatRelativeDate(selectedDate);

  const handleDelete = async () => {
    if (window.confirm(t('habitDetail.deleteConfirm', { name: habit.name }))) {
      await deleteHabit(habit.id);
      onBack();
    }
  };

  const handleToggleArchive = async () => {
    await toggleArchiveHabit(habit.id);
  };

  const handleDaySelect = (date: string) => {
    setSelectedDate(date);
    if (habit.type === 'quantitative') {
      setIsQuickLogOpen(true);
    } else if (habit.type === 'avoidance') {
      toggleAvoidanceHabit(habit, date);
    } else {
      toggleBooleanHabit(habit, date);
    }
  };

  const frequencyLabel =
    habit.frequency.type === 'everyday'
      ? t('habitDetail.everyday')
      : t('habitDetail.selectedDaysFreq', {
          count: habit.frequency.daysOfWeek?.length || 0,
        });

  let actionButtonText = '';
  if (habit.type === 'avoidance') {
    if (isCurrentDay) {
      actionButtonText = isRelapse ? t('habitDetail.undoRelapseToday') : t('habitDetail.markRelapseToday');
    } else {
      actionButtonText = isRelapse
        ? t('habitDetail.undoRelapseForDate', { date: relativeDate })
        : t('habitDetail.markRelapseForDate', { date: relativeDate });
    }
  } else if (habit.type === 'boolean') {
    if (isCurrentDay) {
      actionButtonText = currentLog?.isCompleted ? t('habitDetail.markedToday') : t('habitDetail.markCompletedToday');
    } else {
      actionButtonText = currentLog?.isCompleted
        ? t('habitDetail.markedForDate', { date: relativeDate })
        : t('habitDetail.markCompletedForDate', { date: relativeDate });
    }
  } else {
    if (isCurrentDay) {
      actionButtonText = t('habitDetail.logVolumeToday', {
        current: currentLog?.totalValue || 0,
        unit: habit.unit || '',
      });
    } else {
      actionButtonText = t('habitDetail.logVolumeForDate', {
        date: relativeDate,
        current: currentLog?.totalValue || 0,
        unit: habit.unit || '',
      });
    }
  }

  return (
    <div className={styles.container}>
      {/* Top Navigation */}
      <div className={styles.topNav}>
        <button className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={18} />
          <span>{t('common.back')}</span>
        </button>

        <div className={styles.topActions}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<Edit2 size={14} />}
          >
            {t('common.edit')}
          </Button>
        </div>
      </div>

      {/* Habit Header Card */}
      <div className={styles.headerCard}>
        <div className={styles.headerColorStrip} style={{ backgroundColor: habit.color }} />

        <div className={styles.titleRow}>
          <div className={styles.icon}>
            <HabitIcon name={habit.icon} size={28} color={habit.color} />
          </div>
          <div className={styles.titleInfo}>
            <h2 className={styles.habitName}>{habit.name}</h2>
            {habit.category && (
              <span className={styles.categoryTag}>
                <Tag size={11} /> {habit.category}
              </span>
            )}
            <span className={styles.habitMeta}>
              {habit.type === 'quantitative'
                ? t('habitDetail.dailyGoalLabel', {
                    goal: habit.dailyGoal || 0,
                    unit: habit.unit || 'uds',
                    freq: frequencyLabel,
                  })
                : habit.type === 'avoidance'
                ? t('habitDetail.avoidanceLabel', { freq: frequencyLabel })
                : t('habitDetail.simpleLabel', { freq: frequencyLabel })}
            </span>
          </div>
        </div>

        {habit.description && <p className={styles.description}>{habit.description}</p>}

        {!isCurrentDay && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              backgroundColor: 'var(--tk-bg-surface-elevated)',
              borderRadius: 'var(--tk-radius-md)',
              fontSize: '13px',
              color: 'var(--tk-text-primary)',
              marginTop: '6px',
              border: '1.5px solid var(--tk-border-default)',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
              <Calendar size={15} color="var(--tk-accent)" />
              <span>{t('habitDetail.selectedDateLabel', { date: relativeDate })}</span>
            </div>

            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: 'var(--tk-accent)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--tk-radius-full)',
                padding: '5px 12px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all var(--tk-transition-fast)',
                boxShadow: 'var(--tk-shadow-sm)',
              }}
              onClick={() => setSelectedDate(formatDateToISO(new Date()))}
            >
              <RotateCcw size={12} />
              <span>{t('habitDetail.backToToday')}</span>
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          {habit.type === 'avoidance' ? (
            <Button
              variant={isRelapse ? 'danger' : 'secondary'}
              size="md"
              fullWidth
              onClick={() => toggleAvoidanceHabit(habit, selectedDate)}
              leftIcon={isRelapse ? <RotateCcw size={16} /> : <ShieldAlert size={16} color="var(--tk-warning)" />}
            >
              {actionButtonText}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => {
                if (habit.type === 'boolean') {
                  toggleBooleanHabit(habit, selectedDate);
                } else {
                  setIsQuickLogOpen(true);
                }
              }}
              leftIcon={<Plus size={16} />}
            >
              {actionButtonText}
            </Button>
          )}
        </div>
      </div>

      {/* Periodic Goal Cards (Weekly and Monthly progress) */}
      <PeriodicGoalCards habit={habit} logs={logs} referenceDate={selectedDate} />

      {/* Metric Badges */}
      <HabitStatBadges habit={habit} logs={logs} />

      {/* Evolutionary Line Chart for Quantitative Habits */}
      {habit.type === 'quantitative' && (
        <HabitEvolutionChart
          habit={habit}
          logs={logs}
          onSelectDate={handleDaySelect}
        />
      )}

      {/* Monthly Calendar View */}
      <MonthlyGrid
        habit={habit}
        logs={logs}
        onSelectDate={handleDaySelect}
      />

      {/* Toggle Expand / Annual Heatmap */}
      <button
        className={styles.expandToggleBtn}
        onClick={() => setShowAnnualHeatmap(!showAnnualHeatmap)}
      >
        {showAnnualHeatmap ? (
          <>
            <Minimize2 size={16} />
            <span>{t('habitDetail.hideAnnual')}</span>
          </>
        ) : (
          <>
            <Maximize2 size={16} />
            <span>{t('habitDetail.expandAnnual')}</span>
          </>
        )}
      </button>

      {/* Expanded 52-Week Matrix */}
      {showAnnualHeatmap && (
        <AnnualHeatmap
          habit={habit}
          logs={logs}
          onSelectDate={handleDaySelect}
        />
      )}

      {/* Bottom Danger & Archive Actions */}
      <div className={styles.dangerZone}>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleToggleArchive}
          leftIcon={<Archive size={14} />}
        >
          {habit.isArchived ? t('habitDetail.unarchive') : t('habitDetail.archive')}
        </Button>

        <div style={{ flex: 1 }} />

        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          leftIcon={<Trash2 size={14} />}
        >
          {t('habitDetail.deleteHabit')}
        </Button>
      </div>

      {/* Quick Log Modal */}
      <QuickLogBottomSheet
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        habit={habit}
        targetDate={selectedDate}
        currentLog={currentLog}
        onAddVolume={async (h, amt, d, notes) => {
          await addQuantitativeVolume(h, amt, d, notes);
        }}
        onSetDirectValue={async (h, val, d) => {
          await setDirectQuantitativeValue(h, val, d);
        }}
      />

      {/* Edit Habit Modal */}
      <HabitFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        habitToEdit={habit}
        onSubmit={async (patch) => {
          await updateHabit(habit.id, patch);
        }}
      />
    </div>
  );
};
