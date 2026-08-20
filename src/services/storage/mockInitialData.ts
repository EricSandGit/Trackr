import { Habit, DailyActivityLog } from '@/core/types';
import { formatDateToISO, shiftDate } from '@/core/utils/dateUtils';

export function getMockInitialData(): { habits: Habit[]; logs: DailyActivityLog[] } {
  const today = formatDateToISO(new Date());

  const habitReading: Habit = {
    id: 'habit_reading',
    name: 'Lectura diaria',
    description: 'Aprender y adquirir nuevos conocimientos cada día',
    icon: 'BookOpen',
    color: '#38bdf8', // Cyan
    category: 'Estudio & Aprendizaje',
    type: 'quantitative',
    unit: 'págs',
    dailyGoal: 20,
    weeklyGoal: 120,
    monthlyGoal: 500,
    frequency: { type: 'everyday' },
    isArchived: false,
    createdAt: shiftDate(today, -30),
    updatedAt: shiftDate(today, -30),
  };

  const habitWorkout: Habit = {
    id: 'habit_workout',
    name: 'Entrenamiento & Fitness',
    description: 'Fuerza, movilidad y salud cardiovascular',
    icon: 'Dumbbell',
    color: '#39d353', // Emerald Green
    category: 'Salud & Deporte',
    type: 'boolean',
    weeklyGoal: 3,
    monthlyGoal: 12,
    frequency: {
      type: 'specific_days',
      daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
    },
    isArchived: false,
    createdAt: shiftDate(today, -30),
    updatedAt: shiftDate(today, -30),
  };

  const habitCode: Habit = {
    id: 'habit_code',
    name: 'Desarrollo de Software',
    description: 'Construir proyectos y avanzar en código',
    icon: 'Code',
    color: '#a855f7', // Purple
    category: 'Productividad',
    type: 'quantitative',
    unit: 'min',
    dailyGoal: 60,
    weeklyGoal: 300,
    monthlyGoal: 1200,
    frequency: { type: 'everyday' },
    isArchived: false,
    createdAt: shiftDate(today, -30),
    updatedAt: shiftDate(today, -30),
  };

  const habits: Habit[] = [habitReading, habitWorkout, habitCode];
  const logs: DailyActivityLog[] = [];

  // Generate realistic historical logs for the last 28 days
  for (let i = 28; i >= 0; i--) {
    const logDate = shiftDate(today, -i);
    const dateObj = new Date(logDate + 'T12:00:00');
    const dayOfWeek = dateObj.getDay();

    // Reading: active ~80% of days
    if ((i * 7 + 3) % 5 !== 0) {
      // simulate record on day -10 (45 pages)
      const isRecordDay = i === 10;
      const pages = isRecordDay ? 45 : (i % 2 === 0 ? 25 : 15);
      logs.push({
        id: `habit_reading_${logDate}`,
        habitId: 'habit_reading',
        date: logDate,
        totalValue: pages,
        isCompleted: pages >= 20,
        isPersonalRecord: isRecordDay,
        entries: [
          {
            id: `entry_${logDate}_1`,
            timestamp: `${logDate}T10:30:00.000Z`,
            value: pages,
          },
        ],
      });
    }

    // Workout: on Mon(1), Wed(3), Fri(5)
    if ([1, 3, 5].includes(dayOfWeek) && i !== 7) {
      logs.push({
        id: `habit_workout_${logDate}`,
        habitId: 'habit_workout',
        date: logDate,
        totalValue: 1,
        isCompleted: true,
        isPersonalRecord: false,
        entries: [
          {
            id: `entry_wo_${logDate}`,
            timestamp: `${logDate}T18:00:00.000Z`,
            value: 1,
          },
        ],
      });
    }

    // Code: active most days
    if (i % 4 !== 0) {
      const mins = i === 14 ? 120 : (i % 3 === 0 ? 90 : 45);
      const isRecord = i === 14;
      logs.push({
        id: `habit_code_${logDate}`,
        habitId: 'habit_code',
        date: logDate,
        totalValue: mins,
        isCompleted: mins >= 60,
        isPersonalRecord: isRecord,
        entries: [
          {
            id: `entry_code_${logDate}`,
            timestamp: `${logDate}T20:15:00.000Z`,
            value: mins,
          },
        ],
      });
    }
  }

  return { habits, logs };
}
