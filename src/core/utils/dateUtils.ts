/**
 * Format a Date object to standard YYYY-MM-DD string in local timezone
 */
export function formatDateToISO(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string into a local Date object
 */
export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Shift a YYYY-MM-DD date by N days
 */
export function shiftDate(dateStr: string, daysDelta: number): string {
  const date = parseISODate(dateStr);
  date.setDate(date.getDate() + daysDelta);
  return formatDateToISO(date);
}

/**
 * Returns true if dateStr is today's local date
 */
export function isToday(dateStr: string): boolean {
  return dateStr === formatDateToISO(new Date());
}

/**
 * Returns true if dateStr is yesterday's local date
 */
export function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === formatDateToISO(yesterday);
}

/**
 * Human readable label: "Hoy", "Ayer" or "14 Ago" / "Lunes, 14 de Agosto"
 */
export function getRelativeDateLabel(dateStr: string, format: 'short' | 'long' = 'short'): string {
  if (isToday(dateStr)) return 'Hoy';
  if (isYesterday(dateStr)) return 'Ayer';

  const date = parseISODate(dateStr);
  const options: Intl.DateTimeFormatOptions = format === 'long'
    ? { weekday: 'long', day: 'numeric', month: 'long' }
    : { day: 'numeric', month: 'short' };

  const formatted = date.toLocaleDateString('es-ES', options);
  // Capitalize first letter
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function getMonthName(year: number, monthIndex: number): string {
  const date = new Date(year, monthIndex, 1);
  const name = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Generates the full calendar grid (including leading/trailing padding days) for a given month
 * Monday = 1, Sunday = 0
 */
export interface MonthCalendarDay {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday ... 6 = Saturday
}

export function generateMonthCalendar(year: number, monthIndex: number): MonthCalendarDay[] {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

  const days: MonthCalendarDay[] = [];

  // Determine weekday offset for Monday as start of week (0 = Monday, 6 = Sunday)
  let startWeekday = firstDayOfMonth.getDay(); // 0 is Sunday
  startWeekday = startWeekday === 0 ? 6 : startWeekday - 1; // convert: Mon=0, Tue=1 ... Sun=6

  // Previous month padding
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
  for (let i = startWeekday - 1; i >= 0; i--) {
    const dayNumber = prevMonthLastDay - i;
    const date = new Date(year, monthIndex - 1, dayNumber);
    days.push({
      date: formatDateToISO(date),
      dayNumber,
      isCurrentMonth: false,
      dayOfWeek: date.getDay(),
    });
  }

  // Current month days
  for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
    const date = new Date(year, monthIndex, d);
    days.push({
      date: formatDateToISO(date),
      dayNumber: d,
      isCurrentMonth: true,
      dayOfWeek: date.getDay(),
    });
  }

  // Next month padding to fill complete weeks (multiples of 7)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let n = 1; n <= remaining; n++) {
    const date = new Date(year, monthIndex + 1, n);
    days.push({
      date: formatDateToISO(date),
      dayNumber: n,
      isCurrentMonth: false,
      dayOfWeek: date.getDay(),
    });
  }

  return days;
}

/**
 * Generates an array of the last N weeks (default 20 weeks for mobile or 52 weeks for full year)
 * Formatted as weeks: columns of 7 days (Monday through Sunday)
 */
export interface HeatmapColumn {
  weekIndex: number;
  monthLabel?: string; // Appears at first day of month
  days: Array<{
    date: string; // YYYY-MM-DD
    dayOfWeek: number; // 0..6 (Mon..Sun)
    isFuture: boolean;
  }>;
}

export function generateHeatmapWeeks(weeksCount: number = 24, referenceDate: Date = new Date()): HeatmapColumn[] {
  const result: HeatmapColumn[] = [];
  const todayStr = formatDateToISO(referenceDate);

  // End date is next Sunday to complete the current week
  const endDate = new Date(referenceDate);
  const currentDayOfWeek = endDate.getDay(); // 0 is Sun, 1 is Mon
  const daysUntilSunday = currentDayOfWeek === 0 ? 0 : 7 - currentDayOfWeek;
  endDate.setDate(endDate.getDate() + daysUntilSunday);

  // Start date is weeksCount * 7 days before
  const totalDays = weeksCount * 7;
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - totalDays + 1);

  let currentDate = new Date(startDate);
  let lastMonthSeen = -1;

  for (let w = 0; w < weeksCount; w++) {
    const days: HeatmapColumn['days'] = [];
    let weekMonthLabel: string | undefined = undefined;

    for (let d = 0; d < 7; d++) {
      const dateStr = formatDateToISO(currentDate);
      const dayMonth = currentDate.getMonth();

      // Check if this day is the 1st-7th of a new month to show a label above the column
      if (dayMonth !== lastMonthSeen && currentDate.getDate() <= 7) {
        lastMonthSeen = dayMonth;
        weekMonthLabel = currentDate.toLocaleDateString('es-ES', { month: 'short' });
      }

      // Convert day of week so Monday is 0, Sunday is 6
      const rawDay = currentDate.getDay();
      const normDay = rawDay === 0 ? 6 : rawDay - 1;

      days.push({
        date: dateStr,
        dayOfWeek: normDay,
        isFuture: dateStr > todayStr,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    result.push({
      weekIndex: w,
      monthLabel: weekMonthLabel,
      days,
    });
  }

  return result;
}
