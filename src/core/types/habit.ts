export type HabitType = 'boolean' | 'quantitative';

export interface HabitFrequency {
  type: 'everyday' | 'specific_days';
  daysOfWeek?: number[]; // [1, 2, 3, 4, 5] (0 = Sunday, 1 = Monday...)
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string; // Hex color code (e.g. #39d353, #58a6ff, #ec4899)
  type: HabitType;
  unit?: string; // e.g. "min", "págs", "km", "vasos"
  dailyGoal?: number; // e.g. 30, 20
  frequency: HabitFrequency;
  isArchived: boolean;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export type CreateHabitInput = Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>;
export type UpdateHabitInput = Partial<CreateHabitInput> & { isArchived?: boolean };
