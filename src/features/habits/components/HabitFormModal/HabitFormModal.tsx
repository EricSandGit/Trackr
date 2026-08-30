import React, { useState, useEffect } from 'react';
import { Check, CheckSquare, Hash, Target, Sparkles, PenLine, ShieldAlert } from 'lucide-react';
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
import { HabitIcon } from '@/core/ui/HabitIcon';
import { useI18nStore } from '@/core/i18n';
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
  const { t } = useI18nStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Target');
  const [color, setColor] = useState(CURATED_HABIT_COLORS[0]);
  const [category, setCategory] = useState<string>('Salud & Deporte');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [type, setType] = useState<HabitType>('boolean');
  const [unit, setUnit] = useState('min');
  const [dailyGoal, setDailyGoal] = useState<string>('30');
  const [weeklyGoal, setWeeklyGoal] = useState<string>('');
  const [monthlyGoal, setMonthlyGoal] = useState<string>('');
  const [frequencyType, setFrequencyType] = useState<'everyday' | 'specific_days' | 'casual'>('everyday');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setDescription(habitToEdit.description || '');
      setIcon(habitToEdit.icon || 'Target');
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
      setIcon('Target');
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
    { label: t('habitForm.daysAbbrev.sun'), value: 0 },
    { label: t('habitForm.daysAbbrev.mon'), value: 1 },
    { label: t('habitForm.daysAbbrev.tue'), value: 2 },
    { label: t('habitForm.daysAbbrev.wed'), value: 3 },
    { label: t('habitForm.daysAbbrev.thu'), value: 4 },
    { label: t('habitForm.daysAbbrev.fri'), value: 5 },
    { label: t('habitForm.daysAbbrev.sat'), value: 6 },
  ];

  const getCategoryLabel = (catId: string, defaultLabel: string) => {
    switch (catId) {
      case 'Salud & Deporte': return t('categories.healthSport');
      case 'Productividad': return t('categories.productivity');
      case 'Estudio & Aprendizaje': return t('categories.studyLearning');
      case 'Bienestar & Mente': return t('categories.wellnessMind');
      case 'Finanzas': return t('categories.finance');
      case 'Creatividad': return t('categories.creativity');
      case 'Personal': return t('categories.personal');
      default: return defaultLabel;
    }
  };

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
    if (type === 'boolean' || type === 'avoidance') {
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
      title={habitToEdit ? t('habitForm.editTitle') : t('habitForm.createTitle')}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Name */}
        <div className={styles.field}>
          <label className={styles.label}>{t('habitForm.nameLabel')}</label>
          <input
            type="text"
            required
            placeholder={t('habitForm.namePlaceholder')}
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Category Picker */}
        <div className={styles.field}>
          <label className={styles.label}>{t('habitForm.categoryLabel')}</label>
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
                  <HabitIcon name={cat.icon} size={13} />
                  <span>{getCategoryLabel(cat.id, cat.label)}</span>
                </button>
              );
            })}
            <button
              type="button"
              className={`${styles.categoryChip} ${category === '__custom__' ? styles.categoryChipActive : ''}`}
              onClick={() => setCategory('__custom__')}
            >
              <PenLine size={13} />
              <span>{t('habitForm.customCategoryLabel')}</span>
            </button>
          </div>

          {category === '__custom__' && (
            <input
              type="text"
              placeholder={t('habitForm.customCategoryPlaceholder')}
              className={styles.input}
              style={{ marginTop: '6px' }}
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
            />
          )}
        </div>

        {/* Description */}
        <div className={styles.field}>
          <label className={styles.label}>{t('habitForm.descriptionLabel')}</label>
          <textarea
            placeholder={t('habitForm.descriptionPlaceholder')}
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
          <label className={styles.label}>{t('habitForm.typeLabel')}</label>
          <div className={styles.typeSelector}>
            <button
              type="button"
              className={`${styles.typeBtn} ${type === 'boolean' ? styles.typeBtnSelected : ''}`}
              onClick={() => setType('boolean')}
            >
              <CheckSquare size={20} color={type === 'boolean' ? 'var(--tk-accent)' : undefined} />
              <span className={styles.typeTitle}>{t('habitForm.booleanTypeTitle')}</span>
              <span className={styles.typeDesc}>{t('habitForm.booleanTypeDesc')}</span>
            </button>

            <button
              type="button"
              className={`${styles.typeBtn} ${type === 'quantitative' ? styles.typeBtnSelected : ''}`}
              onClick={() => setType('quantitative')}
            >
              <Hash size={20} color={type === 'quantitative' ? 'var(--tk-accent)' : undefined} />
              <span className={styles.typeTitle}>{t('habitForm.quantitativeTypeTitle')}</span>
              <span className={styles.typeDesc}>{t('habitForm.quantitativeTypeDesc')}</span>
            </button>

            <button
              type="button"
              className={`${styles.typeBtn} ${type === 'avoidance' ? styles.typeBtnSelected : ''}`}
              onClick={() => setType('avoidance')}
            >
              <ShieldAlert size={20} color={type === 'avoidance' ? 'var(--tk-warning)' : undefined} />
              <span className={styles.typeTitle}>{t('habitForm.avoidanceTypeTitle')}</span>
              <span className={styles.typeDesc}>{t('habitForm.avoidanceTypeDesc')}</span>
            </button>
          </div>
        </div>

        {/* Quantitative specific inputs */}
        {type === 'quantitative' && (
          <div className={styles.quantitativeFields}>
            <div className={styles.field}>
              <label className={styles.label}>{t('habitForm.unitLabel')}</label>
              <input
                type="text"
                placeholder={t('habitForm.unitPlaceholder')}
                className={styles.input}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t('habitForm.dailyGoalLabel')}</label>
              <input
                type="number"
                step="any"
                min="1"
                placeholder={t('habitForm.dailyGoalPlaceholder')}
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
              <span>{t('habitForm.periodicGoalsTitle')}</span>
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
              <Sparkles size={11} /> {t('habitForm.suggestGoals')}
            </button>
          </div>

          <div className={styles.periodicInputsGrid}>
            <div className={styles.field}>
              <label className={styles.label}>
                {type === 'quantitative'
                  ? t('habitForm.weeklyGoalLabelQuantitative', { unit: unit || 'uds' })
                  : t('habitForm.weeklyGoalLabelBoolean')}
              </label>
              <input
                type="number"
                step="any"
                min="1"
                placeholder={type === 'quantitative' ? '150' : '4'}
                className={styles.input}
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                {type === 'quantitative'
                  ? t('habitForm.monthlyGoalLabelQuantitative', { unit: unit || 'uds' })
                  : t('habitForm.monthlyGoalLabelBoolean')}
              </label>
              <input
                type="number"
                step="any"
                min="1"
                placeholder={type === 'quantitative' ? '600' : '18'}
                className={styles.input}
                value={monthlyGoal}
                onChange={(e) => setMonthlyGoal(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Frequency */}
        <div className={styles.field}>
          <label className={styles.label}>{t('habitForm.frequencyLabel')}</label>
          <div className={styles.typeSelector} style={{ marginBottom: '8px' }}>
            <button
              type="button"
              className={`${styles.typeBtn} ${frequencyType === 'everyday' ? styles.typeBtnSelected : ''}`}
              onClick={() => setFrequencyType('everyday')}
            >
              <span className={styles.typeTitle}>{t('habitForm.frequencyEveryday')}</span>
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${frequencyType === 'specific_days' ? styles.typeBtnSelected : ''}`}
              onClick={() => setFrequencyType('specific_days')}
            >
              <span className={styles.typeTitle}>{t('habitForm.frequencySpecificDays')}</span>
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${frequencyType === 'casual' ? styles.typeBtnSelected : ''}`}
              onClick={() => setFrequencyType('casual')}
            >
              <span className={styles.typeTitle}>{t('habitForm.frequencyCasual')}</span>
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

          {frequencyType === 'casual' && (
            <p style={{ fontSize: '12px', color: 'var(--tk-text-muted)', margin: '4px 0 0 0' }}>
              {t('habitForm.frequencyCasualDesc')}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!name.trim() || isSubmitting}
            leftIcon={<Check size={16} />}
          >
            {habitToEdit ? t('habitForm.saveChanges') : t('habitForm.createHabit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

