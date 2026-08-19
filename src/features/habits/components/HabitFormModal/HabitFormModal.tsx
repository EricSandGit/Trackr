import React, { useState, useEffect } from 'react';
import { Check, CheckSquare, Hash, Target, Sparkles } from 'lucide-react';
import {
  Habit,
  HabitType,
  CreateHabitInput,
  UpdateHabitInput,
  CURATED_HABIT_CATEGORIES,
} from '@/core/types';
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
  const [category, setCategory] = useState<string>('Salud & Deporte');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [type, setType] = useState<HabitType>('boolean');
  const [unit, setUnit] = useState('min');
  const [dailyGoal, setDailyGoal] = useState<string>('30');
  const [weeklyGoal, setWeeklyGoal] = useState<string>('');
  const [monthlyGoal, setMonthlyGoal] = useState<string>('');
  const [frequencyType, setFrequencyType] = useState<'everyday' | 'specific_days'>('everyday');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setDescription(habitToEdit.description || '');
      setIcon(habitToEdit.icon || '🎯');
      setColor(habitToEdit.color);
      const isCurated = CURATED_HABIT_CATEGORIES.some((c) => c.id === habitToEdit.category);
      if (habitToEdit.category && !isCurated) {
        setCategory('__custom__');
        setCustomCategory(habitToEdit.category);
      } else {
        setCategory(habitToEdit.category || 'Salud & Deporte');
        setCustomCategory('');
      }
      setType(habitToEdit.type);
      setUnit(habitToEdit.unit || 'min');
      setDailyGoal(habitToEdit.dailyGoal ? String(habitToEdit.dailyGoal) : '');
      setWeeklyGoal(habitToEdit.weeklyGoal ? String(habitToEdit.weeklyGoal) : '');
      setMonthlyGoal(habitToEdit.monthlyGoal ? String(habitToEdit.monthlyGoal) : '');
      setFrequencyType(habitToEdit.frequency.type);
      setSelectedDays(habitToEdit.frequency.daysOfWeek || [1, 2, 3, 4, 5]);
    } else {
      setName('');
      setDescription('');
      setIcon('🎯');
      setColor(CURATED_HABIT_COLORS[Math.floor(Math.random() * CURATED_HABIT_COLORS.length)]);
      setCategory('Salud & Deporte');
      setCustomCategory('');
      setType('boolean');
      setUnit('min');
      setDailyGoal('30');
      setWeeklyGoal('');
      setMonthlyGoal('');
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

  const handleAutoSuggestPeriodicGoals = () => {
    if (type === 'boolean') {
      const scheduledDaysPerWeek = frequencyType === 'everyday' ? 7 : selectedDays.length;
      setWeeklyGoal(String(Math.max(1, scheduledDaysPerWeek - 1)));
      setMonthlyGoal(String(Math.max(4, scheduledDaysPerWeek * 4 - 2)));
    } else {
      const dGoal = parseFloat(dailyGoal) || 20;
      setWeeklyGoal(String(Math.round(dGoal * 6)));
      setMonthlyGoal(String(Math.round(dGoal * 25)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedCategory = category === '__custom__' ? customCategory.trim() : category;

      const data: CreateHabitInput = {
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        color,
        category: selectedCategory || undefined,
        type,
        unit: type === 'quantitative' ? unit.trim() || 'uds' : undefined,
        dailyGoal: type === 'quantitative' && dailyGoal ? parseFloat(dailyGoal) : undefined,
        weeklyGoal: weeklyGoal ? parseFloat(weeklyGoal) : undefined,
        monthlyGoal: monthlyGoal ? parseFloat(monthlyGoal) : undefined,
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

        {/* Category Picker */}
        <div className={styles.field}>
          <label className={styles.label}>Categoría / Etiqueta</label>
          <div className={styles.categoryChips}>
            {CURATED_HABIT_CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`${styles.categoryChip} ${isSelected ? styles.categoryChipActive : ''}`}
                  onClick={() => setCategory(cat.id)}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              className={`${styles.categoryChip} ${category === '__custom__' ? styles.categoryChipActive : ''}`}
              onClick={() => setCategory('__custom__')}
            >
              <span>✏️</span>
              <span>Personalizada</span>
            </button>
          </div>

          {category === '__custom__' && (
            <input
              type="text"
              placeholder="Escribe el nombre de tu categoría..."
              className={styles.input}
              style={{ marginTop: '6px' }}
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
            />
          )}
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
              <label className={styles.label}>Meta Diaria</label>
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

        {/* Periodic Goals (Weekly & Monthly Targets) */}
        <div className={styles.periodicGoalsSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className={styles.periodicSectionTitle}>
              <Target size={15} color="var(--tk-accent)" />
              <span>Metas Periódicas (Opcional)</span>
            </div>
            <button
              type="button"
              onClick={handleAutoSuggestPeriodicGoals}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--tk-accent)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <Sparkles size={11} /> Sugerir metas
            </button>
          </div>

          <div className={styles.periodicInputsGrid}>
            <div className={styles.field}>
              <label className={styles.label}>
                Meta Semanal {type === 'boolean' ? '(días/semana)' : `(${unit || 'uds'}/sem)`}
              </label>
              <input
                type="number"
                step="any"
                min="1"
                placeholder={type === 'boolean' ? 'ej. 4' : 'ej. 150'}
                className={styles.input}
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Meta Mensual {type === 'boolean' ? '(días/mes)' : `(${unit || 'uds'}/mes)`}
              </label>
              <input
                type="number"
                step="any"
                min="1"
                placeholder={type === 'boolean' ? 'ej. 18' : 'ej. 600'}
                className={styles.input}
                value={monthlyGoal}
                onChange={(e) => setMonthlyGoal(e.target.value)}
              />
            </div>
          </div>
        </div>

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

