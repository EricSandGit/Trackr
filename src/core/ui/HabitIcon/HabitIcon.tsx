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
  Award,
  Star,
  Shield,
  DollarSign,
  Wallet,
  Briefcase,
  GraduationCap,
  Leaf,
  HeartPulse,
  Eye,
  Glasses,
  Watch,
  AlarmClock,
  Calendar,
  Palette,
  Gamepad2,
  Smartphone,
  Sunrise,
  Sunset,
  Trees,
  Check,
  Plus,
  Layers,
  TrendingUp,
  BarChart2,
  Tag,
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
  Award,
  Star,
  Shield,
  DollarSign,
  Wallet,
  Briefcase,
  GraduationCap,
  Leaf,
  HeartPulse,
  Eye,
  Glasses,
  Watch,
  AlarmClock,
  Calendar,
  Palette,
  Gamepad2,
  Smartphone,
  Sunrise,
  Sunset,
  Trees,
  Check,
  Plus,
  Layers,
  TrendingUp,
  BarChart2,
  Tag,
};

// Normalized lookup map for case-insensitive and kebab/snake-case matching
const NORMALIZED_ICON_MAP: Record<string, LucideIcon> = {};
Object.entries(HABIT_ICON_MAP).forEach(([key, icon]) => {
  NORMALIZED_ICON_MAP[key.toLowerCase().replace(/[-_\s]/g, '')] = icon;
});

export const CURATED_HABIT_ICONS: Array<{ name: string; label: string }> = [
  { name: 'Target', label: 'Objetivo' },
  { name: 'Dumbbell', label: 'Gimnasio' },
  { name: 'Activity', label: 'Ejercicio' },
  { name: 'Bike', label: 'Bicicleta' },
  { name: 'Footprints', label: 'Caminar' },
  { name: 'HeartPulse', label: 'Cardio' },
  { name: 'BookOpen', label: 'Lectura' },
  { name: 'Brain', label: 'Estudio' },
  { name: 'GraduationCap', label: 'Educación' },
  { name: 'Code', label: 'Programación' },
  { name: 'Laptop', label: 'Trabajo' },
  { name: 'Briefcase', label: 'Negocios' },
  { name: 'PenLine', label: 'Escritura' },
  { name: 'Droplet', label: 'Agua' },
  { name: 'Utensils', label: 'Alimentación' },
  { name: 'Apple', label: 'Nutrición' },
  { name: 'Moon', label: 'Sueño' },
  { name: 'Bed', label: 'Descanso' },
  { name: 'Sun', label: 'Mañanas' },
  { name: 'Sunrise', label: 'Amanecer' },
  { name: 'Sunset', label: 'Anochecer' },
  { name: 'Heart', label: 'Salud' },
  { name: 'Smile', label: 'Bienestar' },
  { name: 'Coffee', label: 'Café' },
  { name: 'Music', label: 'Música' },
  { name: 'Palette', label: 'Arte' },
  { name: 'Sparkles', label: 'Creatividad' },
  { name: 'Flame', label: 'Racha' },
  { name: 'Zap', label: 'Energía' },
  { name: 'Trophy', label: 'Logro' },
  { name: 'Award', label: 'Premio' },
  { name: 'Star', label: 'Favorito' },
  { name: 'Shield', label: 'Disciplina' },
  { name: 'DollarSign', label: 'Finanzas' },
  { name: 'Wallet', label: 'Ahorro' },
  { name: 'Timer', label: 'Meditación' },
  { name: 'AlarmClock', label: 'Despertar' },
  { name: 'Watch', label: 'Tiempo' },
  { name: 'Scale', label: 'Balanza' },
  { name: 'Pill', label: 'Suplementos' },
  { name: 'Leaf', label: 'Naturaleza' },
  { name: 'Trees', label: 'Aire Libre' },
  { name: 'Gamepad2', label: 'Juegos' },
  { name: 'Smartphone', label: 'Digital' },
  { name: 'Glasses', label: 'Enfoque' },
  { name: 'Compass', label: 'Explorar' },
];

const EMOJI_TO_ICON_NAME: Record<string, string> = {
  '🎯': 'Target',
  '📚': 'BookOpen',
  '📖': 'BookOpen',
  '🏋️': 'Dumbbell',
  '🏋': 'Dumbbell',
  '💪': 'Dumbbell',
  '💻': 'Code',
  '🧑‍💻': 'Code',
  '🏃': 'Activity',
  '🏃‍♂️': 'Activity',
  '🏃‍♀️': 'Activity',
  '🧘': 'Timer',
  '🧘‍♂️': 'Timer',
  '🧘‍♀️': 'Timer',
  '💧': 'Droplet',
  '🥗': 'Utensils',
  '🍽️': 'Utensils',
  '✍️': 'PenLine',
  '✍': 'PenLine',
  '📝': 'PenLine',
  '🎨': 'Palette',
  '🎸': 'Music',
  '🎵': 'Music',
  '🎧': 'Music',
  '🛌': 'Bed',
  '💤': 'Bed',
  '🚶': 'Footprints',
  '🚶‍♂️': 'Footprints',
  '🚶‍♀️': 'Footprints',
  '🌱': 'Leaf',
  '🌿': 'Leaf',
  '🍎': 'Apple',
  '🥑': 'Apple',
  '🔥': 'Flame',
  '⚡': 'Zap',
  '💰': 'DollarSign',
  '💵': 'DollarSign',
  '🌟': 'Star',
  '⭐': 'Star',
  '🏆': 'Trophy',
  '🥇': 'Award',
  '☕': 'Coffee',
  '🍵': 'Coffee',
  '🚲': 'Bike',
  '🚴': 'Bike',
  '🚴‍♂️': 'Bike',
  '🚴‍♀️': 'Bike',
  '🧠': 'Brain',
  '💊': 'Pill',
  '☀️': 'Sun',
  '🌅': 'Sunrise',
  '🌙': 'Moon',
  '🌇': 'Sunset',
  '❤️': 'Heart',
  '💖': 'Heart',
  '😊': 'Smile',
  '🎮': 'Gamepad2',
  '📱': 'Smartphone',
  '⏰': 'AlarmClock',
  '🛡️': 'Shield',
  '🛡': 'Shield',
  '🎓': 'GraduationCap',
  '💼': 'Briefcase',
};

// Helper to test if a string consists of emoji characters
const isEmojiString = (str: string): boolean => {
  return /\p{Extended_Pictographic}/u.test(str);
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
  const trimmedName = (name || '').trim();

  // 1. Direct match or mapped emoji
  let iconKey = trimmedName;
  if (EMOJI_TO_ICON_NAME[trimmedName]) {
    iconKey = EMOJI_TO_ICON_NAME[trimmedName];
  }

  // 2. Direct map check
  let IconComponent = HABIT_ICON_MAP[iconKey];

  // 3. Case-insensitive / normalized lookup
  if (!IconComponent && iconKey) {
    const normalizedKey = iconKey.toLowerCase().replace(/[-_\s]/g, '');
    IconComponent = NORMALIZED_ICON_MAP[normalizedKey];
  }

  // 4. If an IconComponent is found, render the Lucide icon
  if (IconComponent) {
    return (
      <IconComponent
        size={size}
        color={color}
        className={className}
        strokeWidth={strokeWidth}
      />
    );
  }

  // 5. If it is an unmapped emoji character, render as native emoji
  if (isEmojiString(trimmedName)) {
    return (
      <span
        className={className}
        style={{
          fontSize: `${Math.round(size * 0.9)}px`,
          lineHeight: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          userSelect: 'none',
        }}
      >
        {trimmedName}
      </span>
    );
  }

  // 6. Fallback to Target or Circle
  const FallbackIcon = HABIT_ICON_MAP.Target || Circle;
  return (
    <FallbackIcon
      size={size}
      color={color}
      className={className}
      strokeWidth={strokeWidth}
    />
  );
};
