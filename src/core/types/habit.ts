export type HabitType = 'boolean' | 'quantitative';

export interface HabitFrequency {
  type: 'everyday' | 'specific_days';
  daysOfWeek?: number[]; // [1, 2, 3, 4, 5] (0 = Sunday, 1 = Monday...)
}

export interface CuratedCategory {
  id: string;
  label: string;
  icon: string;
}

export const CURATED_HABIT_CATEGORIES: CuratedCategory[] = [
  { id: 'Salud & Deporte', label: 'Salud & Deporte', icon: '🏃' },
  { id: 'Productividad', label: 'Productividad', icon: '⚡' },
  { id: 'Estudio & Aprendizaje', label: 'Estudio & Aprendizaje', icon: '📚' },
  { id: 'Bienestar & Mente', label: 'Bienestar & Mente', icon: '🧘' },
  { id: 'Finanzas', label: 'Finanzas', icon: '💰' },
  { id: 'Creatividad', label: 'Creatividad', icon: '🎨' },
  { id: 'Personal', label: 'Personal', icon: '🌟' },
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
  isArchived: boolean;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export type CreateHabitInput = Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>;
export type UpdateHabitInput = Partial<CreateHabitInput> & { isArchived?: boolean };
