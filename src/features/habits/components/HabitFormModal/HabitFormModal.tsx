import React, { useState, useEffect } from 'react';
import { Check, CheckSquare, Hash } from 'lucide-react';
import { Habit, HabitType, CreateHabitInput, UpdateHabitInput } from '@/core/types';
import { Modal } from '@/core/ui/Modal';
import { Button } from '@/core/ui/Button';
import { ColorPicker, CURATED_HABIT_COLORS } from '@/core/ui/ColorPicker';
import { IconPicker } from '@/core/ui/IconPicker';
import styles from './HabitFormModal.module.css';

export interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitToEdit?: Habit | null;
  onSubmit: (data: CreateHabitInput | UpdateHabitInput) => Promise<void>;
}

export const HabitFormModal: React.FC<HabitFormModalProps> = ({
  isOpen,
  onClose,
  habitToEdit,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState(CURATED_HABIT_COLORS[0]);
  const [type, setType] = useState<HabitType>('boolean');
  const [unit, setUnit] = useState('min');
  const [dailyGoal, setDailyGoal] = useState<string>('30');
  const [frequencyType, setFrequencyType] = useState<'everyday' | 'specific_days'>('everyday');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setDescription(habitToEdit.description || '');
      setIcon(habitToEdit.icon || '🎯');
      setColor(habitToEdit.color);
      setType(habitToEdit.type);
      setUnit(habitToEdit.unit || 'min');
      setDailyGoal(habitToEdit.dailyGoal ? String(habitToEdit.dailyGoal) : '');
      setFrequencyType(habitToEdit.frequency.type);
      setSelectedDays(habitToEdit.frequency.daysOfWeek || [1, 2, 3, 4, 5]);
    } else {
      setName('');
      setDescription('');
      setIcon('🎯');
      setColor(CURATED_HABIT_COLORS[Math.floor(Math.random() * CURATED_HABIT_COLORS.length)]);
      setType('boolean');
      setUnit('min');
      setDailyGoal('30');
      setFrequencyType('everyday');
      setSelectedDays([1, 2, 3, 4, 5]);
    }
  }, [isOpen, habitToEdit]);

  const daysLabels = [
    { label: 'D', value: 0 },
    { label: 'L', value: 1 },
    { label: 'M', value: 2 },
    { label: 'X', value: 3 },
    { label: 'J', value: 4 },
    { label: 'V', value: 5 },
    { label: 'S', value: 6 },
  ];

  const toggleDay = (dayValue: number) => {
    if (selectedDays.includes(dayValue)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayValue));
      }
    } else {
      setSelectedDays([...selectedDays, dayValue].sort());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const data: CreateHabitInput = {
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        color,
        type,
        unit: type === 'quantitative' ? unit.trim() || 'uds' : undefined,
        dailyGoal: type === 'quantitative' && dailyGoal ? parseFloat(dailyGoal) : undefined,
        frequency: {
          type: frequencyType,
          daysOfWeek: frequencyType === 'specific_days' ? selectedDays : undefined,
        },
      };

      await onSubmit(data);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={habitToEdit ? 'Editar Hábito' : 'Crear Nuevo Hábito'}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Name */}
        <div className={styles.field}>
          <label className={styles.label}>Nombre de la Actividad *</label>
          <input
            type="text"
            required
            placeholder="ej. Leer libros, Gimnasio, Estudiar..."
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className={styles.field}>
          <label className={styles.label}>Descripción o Notas (Opcional)</label>
          <textarea
            placeholder="¿Por qué es importante este hábito para ti?"
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Icon & Color */}
        <IconPicker value={icon} onChange={setIcon} />
        <ColorPicker value={color} onChange={setColor} />

        {/* Measurement Type */}
        <div className={styles.field}>
          <label className={styles.label}>Tipo de Medición</label>
          <div className={styles.typeSelector}>
            <button
              type="button"
              className={`${styles.typeBtn} ${type === 'boolean' ? styles.typeBtnSelected : ''}`}
              onClick={() => setType('boolean')}
            >
              <CheckSquare size={20} color={type === 'boolean' ? 'var(--tk-accent)' : undefined} />
              <span className={styles.typeTitle}>Sí / No (Simple)</span>
              <span className={styles.typeDesc}>Completar con 1 check</span>
            </button>

            <button
              type="button"
              className={`${styles.typeBtn} ${type === 'quantitative' ? styles.typeBtnSelected : ''}`}
              onClick={() => setType('quantitative')}
            >
              <Hash size={20} color={type === 'quantitative' ? 'var(--tk-accent)' : undefined} />
              <span className={styles.typeTitle}>Por Cantidad / Volumen</span>
              <span className={styles.typeDesc}>Páginas, minutos, km...</span>
            </button>
          </div>
        </div>

        {/* Quantitative specific inputs */}
        {type === 'quantitative' && (
          <div className={styles.quantitativeFields}>
            <div className={styles.field}>
              <label className={styles.label}>Unidad de Medida</label>
              <input
                type="text"
                placeholder="ej: min, págs, km"
                className={styles.input}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Meta Diaria (Opcional)</label>
              <input
                type="number"
                step="any"
                min="1"
                placeholder="ej: 30"
                className={styles.input}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Frequency */}
        <div className={styles.field}>
          <label className={styles.label}>Frecuencia Programada</label>
          <div className={styles.typeSelector} style={{ marginBottom: '8px' }}>
            <button
              type="button"
              className={`${styles.typeBtn} ${frequencyType === 'everyday' ? styles.typeBtnSelected : ''}`}
              onClick={() => setFrequencyType('everyday')}
            >
              <span className={styles.typeTitle}>Todos los días</span>
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${frequencyType === 'specific_days' ? styles.typeBtnSelected : ''}`}
              onClick={() => setFrequencyType('specific_days')}
            >
              <span className={styles.typeTitle}>Días específicos</span>
            </button>
          </div>

          {frequencyType === 'specific_days' && (
            <div className={styles.frequencyDays}>
              {daysLabels.map((d) => {
                const isSelected = selectedDays.includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    className={`${styles.dayBtn} ${isSelected ? styles.dayBtnSelected : ''}`}
                    onClick={() => toggleDay(d.value)}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!name.trim() || isSubmitting}
            leftIcon={<Check size={16} />}
          >
            {habitToEdit ? 'Guardar Cambios' : 'Crear Hábito'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
