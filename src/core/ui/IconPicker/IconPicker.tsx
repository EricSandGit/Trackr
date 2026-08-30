import React from 'react';
import { CURATED_HABIT_ICONS, HabitIcon, EMOJI_TO_ICON_NAME } from '../HabitIcon';
import styles from './IconPicker.module.css';

export interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  label?: string;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  value = 'Target',
  onChange,
  label = 'Icono del Hábito',
}) => {
  const trimmedValue = (value || '').trim();
  const mappedValue = EMOJI_TO_ICON_NAME[trimmedValue] || trimmedValue;
  const normalizedValue = mappedValue.toLowerCase().replace(/[-_\s]/g, '');

  return (
    <div className={styles.container}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.grid}>
        {CURATED_HABIT_ICONS.map((item) => {
          const itemNormalized = item.name.toLowerCase().replace(/[-_\s]/g, '');
          const isSelected = normalizedValue === itemNormalized;

          return (
            <button
              key={item.name}
              type="button"
              title={item.label}
              className={`${styles.iconBtn} ${isSelected ? styles.selected : ''}`}
              onClick={() => onChange(item.name)}
            >
              <HabitIcon name={item.name} size={18} />
              {isSelected && <span className={styles.checkDot} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
