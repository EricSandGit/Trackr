import React from 'react';
import { CURATED_HABIT_ICONS, HABIT_ICON_MAP } from '../HabitIcon';
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
  return (
    <div className={styles.container}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.grid}>
        {CURATED_HABIT_ICONS.map((item) => {
          const isSelected = value === item.name;
          const IconComp = HABIT_ICON_MAP[item.name];
          if (!IconComp) return null;

          return (
            <button
              key={item.name}
              type="button"
              title={item.label}
              className={`${styles.iconBtn} ${isSelected ? styles.selected : ''}`}
              onClick={() => onChange(item.name)}
            >
              <IconComp size={18} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
