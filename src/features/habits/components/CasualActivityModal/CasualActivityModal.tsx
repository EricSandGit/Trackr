import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Zap,
  CheckSquare,
  Hash,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { Habit, CreateHabitInput, CURATED_HABIT_CATEGORIES } from '@/core/types';
import { Modal } from '@/core/ui/Modal';
import { Button } from '@/core/ui/Button';
import { HabitIcon } from '@/core/ui/HabitIcon';
import { ColorPicker, CURATED_HABIT_COLORS } from '@/core/ui/ColorPicker';
import { IconPicker } from '@/core/ui/IconPicker';
import { useI18nStore } from '@/core/i18n';
import styles from './CasualActivityModal.module.css';

export interface CasualActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  habits: Habit[];
  onLogExistingCasualActivity: (habit: Habit, amount?: number, notes?: string) => Promise<void>;
  onCreateAndLogCasualActivity: (input: CreateHabitInput, amount?: number, notes?: string) => Promise<void>;
  onOpenHistory?: () => void;
}

export const CasualActivityModal: React.FC<CasualActivityModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  habits,
  onLogExistingCasualActivity,
  onCreateAndLogCasualActivity,
}) => {
  const { t, formatRelativeDate } = useI18nStore();

  // Input states
  const [name, setName] = useState('');
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [type, setType] = useState<'boolean' | 'quantitative'>('boolean');
  const [unit, setUnit] = useState('km');
  const [amount, setAmount] = useState<string>('1');
  const [icon, setIcon] = useState('Activity');
  const [color, setColor] = useState(CURATED_HABIT_COLORS[1]); // Cyan/Sky
  const [category, setCategory] = useState('Salud & Deporte');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Existing casual habits list
  const casualHabits = useMemo(() => {
    return habits.filter((h) => !h.isArchived && h.frequency.type === 'casual');
  }, [habits]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setSelectedHabitId(null);
      setType('boolean');
      setUnit('km');
      setAmount('1');
      setIcon('Activity');
      setColor(CURATED_HABIT_COLORS[Math.floor(Math.random() * CURATED_HABIT_COLORS.length)]);
      setCategory('Salud & Deporte');
      setNotes('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Smart suggestion: check if typed query matches an existing habit or casual activity
  const suggestedHabit = useMemo(() => {
    const trimmed = name.trim().toLowerCase();
    if (trimmed.length < 2) return null;
    if (selectedHabitId) return null; // Already selected

    // Search in casual habits first, then all active habits
    return (
      casualHabits.find((h) => h.name.toLowerCase().includes(trimmed)) ||
      habits.find(
        (h) => !h.isArchived && (h.name.toLowerCase().includes(trimmed) || h.description?.toLowerCase().includes(trimmed))
      ) ||
      null
    );
  }, [name, casualHabits, habits, selectedHabitId]);

  const selectedExistingHabit = useMemo(() => {
    if (!selectedHabitId) return null;
    return habits.find((h) => h.id === selectedHabitId) || null;
  }, [selectedHabitId, habits]);

  const handleSelectExisting = (habit: Habit) => {
    setSelectedHabitId(habit.id);
    setName(habit.name);
    setType(habit.type === 'quantitative' ? 'quantitative' : 'boolean');
    setUnit(habit.unit || 'km');
    setAmount(habit.dailyGoal ? String(habit.dailyGoal) : '1');
    setIcon(habit.icon || 'Activity');
    setColor(habit.color);
  };

  const handleClearSelectedExisting = () => {
    setSelectedHabitId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !selectedHabitId) return;

    setIsSubmitting(true);
    try {
      if (selectedExistingHabit) {
        const numAmount = type === 'quantitative' ? parseFloat(amount) || 1 : undefined;
        await onLogExistingCasualActivity(selectedExistingHabit, numAmount, notes.trim() || undefined);
      } else {
        const numAmount = type === 'quantitative' ? parseFloat(amount) || 1 : undefined;
        const newHabitData: CreateHabitInput = {
          name: name.trim(),
          icon,
          color,
          category,
          type,
          unit: type === 'quantitative' ? unit.trim() || 'km' : undefined,
          dailyGoal: type === 'quantitative' ? parseFloat(amount) || 1 : undefined,
          frequency: {
            type: 'casual',
          },
        };
        await onCreateAndLogCasualActivity(newHabitData, numAmount, notes.trim() || undefined);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('casualActivities.modalTitle')}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* If an existing habit is selected */}
        {selectedExistingHabit ? (
          <div className={styles.selectedSummary}>
            <div className={styles.selectedInfo}>
              <HabitIcon name={selectedExistingHabit.icon} color={selectedExistingHabit.color} size={24} />
              <div>
                <div className={styles.suggestionName}>{selectedExistingHabit.name}</div>
                <div className={styles.suggestionMeta}>
                  {selectedExistingHabit.category || t('casualActivities.frequencyLabel')}
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleClearSelectedExisting}
              leftIcon={<RotateCcw size={12} />}
            >
              Cambiar
            </Button>
          </div>
        ) : (
          <>
            {/* Activity Name Search / Input */}
            <div className={styles.field}>
              <label className={styles.label}>{t('casualActivities.nameLabel')}</label>
              <input
                type="text"
                autoFocus
                required
                placeholder={t('casualActivities.namePlaceholder')}
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Smart Suggestion Card */}
            {suggestedHabit && (
              <div className={styles.suggestionCard}>
                <div className={styles.suggestionHeader}>
                  <Sparkles size={14} />
                  <span>{t('casualActivities.suggestionTitle')}</span>
                </div>
                <div className={styles.suggestionBody}>
                  <div className={styles.suggestionInfo}>
                    <HabitIcon name={suggestedHabit.icon} color={suggestedHabit.color} size={20} />
                    <div>
                      <span className={styles.suggestionName}>{suggestedHabit.name}</span>
                      <span className={styles.suggestionMeta}> ({suggestedHabit.category || 'General'})</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSelectExisting(suggestedHabit)}
                    rightIcon={<ArrowRight size={13} />}
                  >
                    {t('casualActivities.useExisting')}
                  </Button>
                </div>
              </div>
            )}

            {/* Frequent / Existing Casual Activities Grid */}
            {!name && casualHabits.length > 0 && (
              <div className={styles.existingSection}>
                <span className={styles.label}>{t('casualActivities.frequentTitle')}</span>
                <div className={styles.existingGrid}>
                  {casualHabits.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      className={styles.existingCard}
                      onClick={() => handleSelectExisting(ch)}
                    >
                      <HabitIcon name={ch.icon} color={ch.color} size={18} />
                      <span className={styles.existingCardName}>{ch.name}</span>
                      <span className={styles.existingCardMeta}>
                        {ch.type === 'quantitative' ? `${ch.unit || 'uds'}` : 'Simple'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Create New Configuration (Icon, Color, Category, Type) */}
            <div className={styles.field}>
              <label className={styles.label}>{t('habitForm.typeLabel')}</label>
              <div className={styles.typeSelector}>
                <button
                  type="button"
                  className={`${styles.typeBtn} ${type === 'boolean' ? styles.typeBtnSelected : ''}`}
                  onClick={() => setType('boolean')}
                >
                  <CheckSquare size={18} />
                  <span className={styles.typeTitle}>{t('habitForm.booleanTypeTitle')}</span>
                </button>

                <button
                  type="button"
                  className={`${styles.typeBtn} ${type === 'quantitative' ? styles.typeBtnSelected : ''}`}
                  onClick={() => setType('quantitative')}
                >
                  <Hash size={18} />
                  <span className={styles.typeTitle}>{t('habitForm.quantitativeTypeTitle')}</span>
                </button>
              </div>
            </div>

            {/* Category Chips */}
            <div className={styles.field}>
              <label className={styles.label}>{t('habitForm.categoryLabel')}</label>
              <div className={styles.categoryChips}>
                {CURATED_HABIT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`${styles.categoryChip} ${category === cat.id ? styles.categoryChipActive : ''}`}
                    onClick={() => setCategory(cat.id)}
                  >
                    <HabitIcon name={cat.icon} size={12} />
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Icon & Color Pickers */}
            <IconPicker value={icon} onChange={setIcon} />
            <ColorPicker value={color} onChange={setColor} />
          </>
        )}

        {/* Quantitative volume input & quick add helpers */}
        {type === 'quantitative' && (
          <div className={styles.field}>
            <label className={styles.label}>
              {t('casualActivities.amountLabel', { unit: unit || 'uds' })}
            </label>
            <div className={styles.quantitativeRow}>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                className={styles.input}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5"
              />
              <input
                type="text"
                className={styles.input}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="km, min, págs..."
              />
            </div>
            <div className={styles.quickAddRow}>
              {[1, 5, 10, 15, 30].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={styles.quickAddBtn}
                  onClick={() => setAmount(String(val))}
                >
                  +{val} {unit}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Optional Notes */}
        <div className={styles.field}>
          <label className={styles.label}>{t('habitForm.descriptionLabel')}</label>
          <input
            type="text"
            className={styles.input}
            placeholder="ej. En el parque, con amigos..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={(!name.trim() && !selectedHabitId) || isSubmitting}
            leftIcon={selectedHabitId ? <Zap size={16} /> : <Plus size={16} />}
          >
            {t('casualActivities.logTodayBtn')} ({formatRelativeDate(selectedDate)})
          </Button>
        </div>
      </form>
    </Modal>
  );
};
