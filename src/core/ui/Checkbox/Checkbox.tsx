import React from 'react';
import { Check } from 'lucide-react';
import styles from './Checkbox.module.css';

export interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  color?: string;
  size?: number;
  className?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  color = '#238636',
  size = 28,
  className = '',
  disabled = false,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onChange();
    }
  };

  const boxStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    ...(checked
      ? {
          backgroundColor: color,
          borderColor: color,
          '--glow-color': `${color}88`,
        }
      : {}),
  };

  return (
    <div
      className={`${styles.checkboxContainer} ${className}`}
      onClick={handleClick}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
    >
      <div
        className={`${styles.box} ${checked ? `${styles.checked} ${styles.glow}` : ''}`}
        style={boxStyle}
      >
        {checked && <Check size={size * 0.65} strokeWidth={3.5} className={styles.checkIcon} />}
      </div>
    </div>
  );
};
