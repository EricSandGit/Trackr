import React from 'react';
import { Check } from 'lucide-react';
import styles from './ColorPicker.module.css';

export const CURATED_HABIT_COLORS = [
  '#39d353', // GitHub Emerald
  '#38bdf8', // Sky Blue / Cyan
  '#818cf8', // Indigo
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#fb923c', // Orange
  '#facc15', // Amber / Gold
  '#2dd4bf', // Teal
  '#a3e635', // Lime
];

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label = 'Color del Hábito',
}) => {
  return (
    <div className={styles.container}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.palette}>
        {CURATED_HABIT_COLORS.map((hex) => {
          const isSelected = value.toLowerCase() === hex.toLowerCase();
          return (
            <button
              key={hex}
              type="button"
              className={`${styles.colorSwatch} ${isSelected ? styles.selected : ''}`}
              style={{ backgroundColor: hex }}
              onClick={() => onChange(hex)}
            >
              {isSelected && <Check size={16} color="#ffffff" strokeWidth={3} />}
            </button>
          );
        })}
      </div>

      <div className={styles.customPickerWrapper}>
        <input
          type="color"
          className={styles.customInput}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className={styles.hexText}>{value.toUpperCase()}</span>
      </div>
    </div>
  );
};
