import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Archive,
  Maximize2,
  Minimize2,
  Plus,
} from 'lucide-react';
import { useHabitsStore } from '@/features/habits';
import { useLogsStore } from '@/features/logging';
import { Button } from '@/core/ui/Button';
import { MonthlyGrid, AnnualHeatmap } from '@/features/heatmap';
import { HabitStatBadges, HabitEvolutionChart } from '@/features/stats';
import { HabitFormModal } from '@/features/habits';
import { QuickLogBottomSheet } from '@/features/logging';
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
    addQuantitativeVolume,
    setDirectQuantitativeValue,
  } = useLogsStore();

  const [showAnnualHeatmap, setShowAnnualHeatmap] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

  const habit = habits.find((h) => h.id === habitId);

  if (!habit) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p>Hábito no encontrado o eliminado.</p>
          <Button variant="secondary" onClick={onBack} style={{ marginTop: '16px' }}>
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  const habitLogs = logs.filter((l) => l.habitId === habit.id);
  const currentLog = habitLogs.find((l) => l.date === selectedDate);

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el hábito "${habit.name}" y todo su historial?`)) {
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
    } else {
      toggleBooleanHabit(habit, date);
    }
  };

  const frequencyLabel =
    habit.frequency.type === 'everyday'
      ? 'Todos los días'
      : `Días seleccionados (${habit.frequency.daysOfWeek?.length || 0}/7)`;

  return (
    <div className={styles.container}>
      {/* Top Navigation */}
      <div className={styles.topNav}>
        <button className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>

        <div className={styles.topActions}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<Edit2 size={14} />}
          >
            Editar
          </Button>
        </div>
      </div>

      {/* Habit Header Card */}
      <div className={styles.headerCard}>
        <div className={styles.headerColorStrip} style={{ backgroundColor: habit.color }} />

        <div className={styles.titleRow}>
          <div className={styles.icon}>{habit.icon || '🎯'}</div>
          <div className={styles.titleInfo}>
            <h2 className={styles.habitName}>{habit.name}</h2>
            <span className={styles.habitMeta}>
              {habit.type === 'quantitative'
                ? `Meta: ${habit.dailyGoal || 0} ${habit.unit || 'uds'} • ${frequencyLabel}`
                : `Simple Sí/No • ${frequencyLabel}`}
            </span>
          </div>
        </div>

        {habit.description && <p className={styles.description}>{habit.description}</p>}

        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
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
            {habit.type === 'boolean'
              ? (currentLog?.isCompleted ? '✓ Marcado Hoy' : 'Marcar Completado Hoy')
              : `Registrar Volumen Hoy (${currentLog?.totalValue || 0} ${habit.unit || ''})`}
          </Button>
        </div>
      </div>

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
            <span>Ocultar Historial Anual</span>
          </>
        ) : (
          <>
            <Maximize2 size={16} />
            <span>Expandir Historial Anual Completo (52 semanas)</span>
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
          {habit.isArchived ? 'Desarchivar Hábito' : 'Archivar Hábito'}
        </Button>

        <div style={{ flex: 1 }} />

        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          leftIcon={<Trash2 size={14} />}
        >
          Eliminar Hábito
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
