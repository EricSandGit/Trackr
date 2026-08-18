import React from 'react';
import styles from './IconPicker.module.css';

export const COMMON_EMOJIS = [
  '📚', '🏋️', '💻', '🏃', '🧘', '💧', '🥗', '✍️',
  '🎨', '🎸', '🎯', '🛌', '🚶', '🌱', '🍎', '🔥',
];

export interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
  label?: string;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  value = '🎯',
  onChange,
  label = 'Icono o Emoji',
}) => {
  return (
    <div className={styles.container}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.grid}>
        {COMMON_EMOJIS.map((emoji) => {
          const isSelected = value === emoji;
          return (
            <button
              key={emoji}
              type="button"
              className={`${styles.emojiBtn} ${isSelected ? styles.selected : ''}`}
              onClick={() => onChange(emoji)}
            >
              {emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
};
