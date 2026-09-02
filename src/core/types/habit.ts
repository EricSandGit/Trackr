export type HabitType = 'boolean' | 'quantitative' | 'avoidance';

export interface HabitFrequency {
  type: 'everyday' | 'specific_days' | 'casual';
  daysOfWeek?: number[]; // [1, 2, 3, 4, 5] (0 = Sunday, 1 = Monday...)
}

export interface CuratedCategory {
  id: string;
  label: string;
  icon: string;
}

export const CURATED_HABIT_CATEGORIES: CuratedCategory[] = [
  { id: 'Salud & Deporte', label: 'Salud & Deporte', icon: 'Activity' },
  { id: 'Productividad', label: 'Productividad', icon: 'Zap' },
  { id: 'Estudio & Aprendizaje', label: 'Estudio & Aprendizaje', icon: 'BookOpen' },
  { id: 'Bienestar & Mente', label: 'Bienestar & Mente', icon: 'Heart' },
  { id: 'Finanzas', label: 'Finanzas', icon: 'Trophy' },
  { id: 'Creatividad', label: 'Creatividad', icon: 'Sparkles' },
  { id: 'Personal', label: 'Personal', icon: 'Smile' },
];

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string; // Hex color code (e.g. #39d353, #58a6ff, #ec4899)
  category?: string; // e.g. "Salud & Deporte", "Productividad"
  type: HabitType;
  unit?: string; // e.g. "min", "págs", "km", "vasos"
  dailyGoal?: number; // e.g. 30, 20
  weeklyGoal?: number; // Target for the week (e.g. 5 days or 140 págs)
  monthlyGoal?: number; // Target for the month (e.g. 20 days or 600 págs)
  frequency: HabitFrequency;
  startDate?: string; // ISO String 'YYYY-MM-DD' - Start date of the habit/challenge
  endDate?: string; // ISO String 'YYYY-MM-DD' - End date of the habit/challenge (optional)
  isArchived: boolean;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export type CreateHabitInput = Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>;
export type UpdateHabitInput = Partial<CreateHabitInput> & { isArchived?: boolean };
