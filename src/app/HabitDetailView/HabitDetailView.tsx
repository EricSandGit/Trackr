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
  CheckCircle2,
  Flag,
} from 'lucide-react';
import { useHabitsStore } from '@/features/habits';
import { useLogsStore } from '@/features/logging';
import { Button } from '@/core/ui/Button';
import { HabitIcon } from '@/core/ui/HabitIcon';
import { useI18nStore } from '@/core/i18n';
import { HabitHeatmap, AnnualHeatmap } from '@/features/heatmap';
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
  const { t, formatRelativeDate, language } = useI18nStore();
  const todayStr = formatDateToISO(new Date());
  const { habits, deleteHabit, toggleArchiveHabit, updateHabit } = useHabitsStore();
  const { logs, toggleBooleanHabit, toggleAvoidanceHabit, addQuantitativeVolume, setDirectQuantitativeValue } = useLogsStore();

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
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

  const isDateOutOfRange = Boolean(
    (habit.startDate && selectedDate < habit.startDate) ||
    (habit.endDate && selectedDate > habit.endDate)
  );

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
    const isOutOfRange = Boolean(
      (habit.startDate && date < habit.startDate) ||
      (habit.endDate && date > habit.endDate)
    );
    if (isOutOfRange) return;
    setSelectedDate(date);
  };

  const frequencyLabel =
    habit.frequency.type === 'casual'
      ? t('casualActivities.frequencyLabel')
      : habit.frequency.type === 'everyday'
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
        <Button
          variant="secondary"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft size={16} />}
        >
          {t('common.back')}
        </Button>

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

        {/* Challenge / Date Range Banner */}
        {(habit.startDate || habit.endDate) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: 'var(--tk-accent-surface)',
              border: '1px solid var(--tk-accent)',
              borderRadius: 'var(--tk-radius-md)',
              fontSize: '13px',
              marginTop: '10px',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--tk-accent)' }}>
              <Flag size={16} />
              <span>
                {habit.endDate && todayStr > habit.endDate
                  ? t('habitDetail.challengeStatusCompleted')
                  : habit.startDate && todayStr < habit.startDate
                  ? t('habitDetail.challengeStatusUpcoming', { date: habit.startDate })
                  : habit.endDate
                  ? t('habitDetail.challengeStatusActive', {
                      daysLeft: Math.max(0, Math.ceil((new Date(habit.endDate).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24))),
                    })
                  : t('habitDetail.challengeStatusActive', { daysLeft: '∞' })}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--tk-text-secondary)', fontWeight: 600 }}>
              {t('habitDetail.dateRangeLabel', {
                start: habit.startDate || (habit as any).createdAt?.slice(0, 10) || '',
                end: habit.endDate || '∞',
              })}
            </span>
          </div>
        )}

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
              disabled={isDateOutOfRange}
              onClick={() => toggleAvoidanceHabit(habit, selectedDate)}
              leftIcon={isRelapse ? <RotateCcw size={16} /> : <ShieldAlert size={16} color="var(--tk-warning)" />}
            >
              {isDateOutOfRange ? (language === 'en' ? 'Date outside habit period' : 'Fecha fuera del periodo') : actionButtonText}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              fullWidth
              disabled={isDateOutOfRange}
              onClick={() => {
                if (habit.type === 'boolean') {
                  toggleBooleanHabit(habit, selectedDate);
                } else {
                  setIsQuickLogOpen(true);
                }
              }}
              leftIcon={<Plus size={16} />}
            >
              {isDateOutOfRange ? (language === 'en' ? 'Date outside habit period' : 'Fecha fuera del periodo') : actionButtonText}
            </Button>
          )}
        </div>
      </div>

      {/* Main Analytics Section: 2 Columns (Heatmap Left ~50% + Histogram/Evolution Right ~50%) */}
      <div className={styles.chartsRow}>
        {/* Left: Individual GitHub-Style Heatmap (Compact 18-week matrix) */}
        <div className={styles.chartCol}>
          <HabitHeatmap
            habit={habit}
            logs={logs}
            selectedDate={selectedDate}
            onSelectDate={handleDaySelect}
            weeksCount={24}
          />
        </div>

        {/* Right: Evolution/Histogram for Quantitative Habits, or Informative Overview Card */}
        <div className={styles.chartCol}>
          {habit.type === 'quantitative' ? (
            <HabitEvolutionChart
              habit={habit}
              logs={logs}
              onSelectDate={handleDaySelect}
            />
          ) : (
            <div className={styles.noHistogramCard}>
              <div className={styles.noHistogramHeader}>
                <div
                  className={styles.noHistogramIconWrapper}
                  style={{ backgroundColor: habit.color + '22', color: habit.color }}
                >
                  {habit.type === 'avoidance' ? (
                    <ShieldAlert size={20} />
                  ) : (
                    <CheckCircle2 size={20} />
                  )}
                </div>
                <div>
                  <h4 className={styles.noHistogramTitle}>
                    {habit.type === 'avoidance'
                      ? 'Hábito de Evitación'
                      : 'Hábito Simple (Sí / No)'}
                  </h4>
                  <span className={styles.noHistogramSubtitle}>Registro de cumplimiento directo</span>
                </div>
              </div>

              <p className={styles.noHistogramDesc}>
                Los gráficos de evolución e histogramas de volumen aplican a hábitos numéricos de cantidad (páginas, minutos, repeticiones). Este hábito registra directamente cumplimiento diario y rachas en el cuadro de actividad.
              </p>

              <div className={styles.noHistogramStats}>
                <div className={styles.noHistogramStatItem}>
                  <span className={styles.noHistogramStatLabel}>Modalidad</span>
                  <span className={styles.noHistogramStatValue} style={{ color: habit.color }}>
                    {habit.type === 'avoidance' ? 'Día Limpio' : 'Completado (1 Check)'}
                  </span>
                </div>
                <div className={styles.noHistogramStatItem}>
                  <span className={styles.noHistogramStatLabel}>Frecuencia</span>
                  <span className={styles.noHistogramStatValue}>{frequencyLabel}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metric Badges (Streaks, Records, Lifetime Volume) */}
      <HabitStatBadges habit={habit} logs={logs} />

      {/* Periodic Goal Cards (Weekly and Monthly progress) */}
      <PeriodicGoalCards habit={habit} logs={logs} referenceDate={selectedDate} />

      {/* Toggle Expand / Annual Heatmap (Full 52 Weeks) */}
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
          selectedDate={selectedDate}
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
