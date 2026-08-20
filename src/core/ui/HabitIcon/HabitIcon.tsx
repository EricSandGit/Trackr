import React from 'react';
import {
  Target,
  Dumbbell,
  Activity,
  Bike,
  Footprints,
  BookOpen,
  Brain,
  Code,
  Laptop,
  PenLine,
  Droplet,
  Utensils,
  Apple,
  Moon,
  Sun,
  Heart,
  Smile,
  Coffee,
  Music,
  Sparkles,
  Flame,
  Zap,
  Trophy,
  Timer,
  Scale,
  Pill,
  Bed,
  Compass,
  CheckSquare,
  Circle,
  LucideIcon,
} from 'lucide-react';

export const HABIT_ICON_MAP: Record<string, LucideIcon> = {
  Target,
  Dumbbell,
  Activity,
  Bike,
  Footprints,
  BookOpen,
  Brain,
  Code,
  Laptop,
  PenLine,
  Droplet,
  Utensils,
  Apple,
  Moon,
  Sun,
  Heart,
  Smile,
  Coffee,
  Music,
  Sparkles,
  Flame,
  Zap,
  Trophy,
  Timer,
  Scale,
  Pill,
  Bed,
  Compass,
  CheckSquare,
  Circle,
};

export const CURATED_HABIT_ICONS: Array<{ name: string; label: string }> = [
  { name: 'Target', label: 'Objetivo' },
  { name: 'Dumbbell', label: 'Gimnasio' },
  { name: 'Activity', label: 'Ejercicio' },
  { name: 'Bike', label: 'Bicicleta' },
  { name: 'Footprints', label: 'Caminar' },
  { name: 'BookOpen', label: 'Lectura' },
  { name: 'Brain', label: 'Estudio' },
  { name: 'Code', label: 'Programación' },
  { name: 'Laptop', label: 'Trabajo' },
  { name: 'PenLine', label: 'Escritura' },
  { name: 'Droplet', label: 'Agua' },
  { name: 'Utensils', label: 'Alimentación' },
  { name: 'Apple', label: 'Nutrición' },
  { name: 'Moon', label: 'Sueño' },
  { name: 'Sun', label: 'Mañanas' },
  { name: 'Heart', label: 'Salud' },
  { name: 'Smile', label: 'Bienestar' },
  { name: 'Coffee', label: 'Café' },
  { name: 'Music', label: 'Música' },
  { name: 'Sparkles', label: 'Creatividad' },
  { name: 'Flame', label: 'Racha' },
  { name: 'Zap', label: 'Energía' },
  { name: 'Trophy', label: 'Logro' },
  { name: 'Timer', label: 'Meditación' },
  { name: 'Scale', label: 'Balanza' },
  { name: 'Pill', label: 'Suplementos' },
  { name: 'Bed', label: 'Descanso' },
  { name: 'Compass', label: 'Explorar' },
];

const EMOJI_TO_ICON_NAME: Record<string, string> = {
  '🎯': 'Target',
  '📚': 'BookOpen',
  '🏋️': 'Dumbbell',
  '🏋': 'Dumbbell',
  '💻': 'Code',
  '🏃': 'Activity',
  '🧘': 'Timer',
  '💧': 'Droplet',
  '🥗': 'Utensils',
  '✍️': 'PenLine',
  '✍': 'PenLine',
  '🎨': 'Sparkles',
  '🎸': 'Music',
  '🛌': 'Bed',
  '🚶': 'Footprints',
  '🌱': 'Sparkles',
  '🍎': 'Apple',
  '🔥': 'Flame',
  '⚡': 'Zap',
  '💰': 'Trophy',
  '🌟': 'Sparkles',
};

export interface HabitIconProps {
  name?: string;
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
}

export const HabitIcon: React.FC<HabitIconProps> = ({
  name = 'Target',
  size = 20,
  color,
  className,
  strokeWidth = 2,
}) => {
  // Check if name is in emoji fallback map
  let iconKey = name;
  if (EMOJI_TO_ICON_NAME[name]) {
    iconKey = EMOJI_TO_ICON_NAME[name];
  }

  const IconComponent = HABIT_ICON_MAP[iconKey] || Circle;

  return (
    <IconComponent
      size={size}
      color={color}
      className={className}
      strokeWidth={strokeWidth}
    />
  );
};
