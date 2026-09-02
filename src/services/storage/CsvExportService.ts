import { IStorageAdapter } from './IStorageAdapter';

function sanitizeCsvField(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const stringVal = String(value);
  if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n') || stringVal.includes('\r')) {
    return `"${stringVal.replace(/"/g, '""')}"`;
  }
  return stringVal;
}

export class CsvExportService {
  constructor(private storage: IStorageAdapter) {}

  public async generateCsvData(): Promise<string> {
    const habits = await this.storage.getHabits();
    const logs = await this.storage.getLogs();

    const habitsMap = new Map(habits.map((h) => [h.id, h]));

    // CSV Headers
    const headers = [
      'Fecha',
      'Habito_ID',
      'Nombre_Habito',
      'Categoria',
      'Tipo_Habito',
      'Completado',
      'Valor_Acumulado',
      'Meta_Diaria',
      'Unidad',
      'Es_Record_Personal',
      'Notas',
    ];

    const rows: string[] = [headers.join(',')];

    // Sort logs chronologically (newest first)
    const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));

    for (const log of sortedLogs) {
      const habit = habitsMap.get(log.habitId);
      const notesCombined = (log.entries || [])
        .map((e) => e.notes)
        .filter(Boolean)
        .join('; ');

      const row = [
        sanitizeCsvField(log.date),
        sanitizeCsvField(log.habitId),
        sanitizeCsvField(habit?.name || 'Hábito Eliminado'),
        sanitizeCsvField(habit?.category || 'General'),
        sanitizeCsvField(habit?.type || 'boolean'),
        sanitizeCsvField(log.isCompleted ? 'SI' : 'NO'),
        sanitizeCsvField(log.totalValue),
        sanitizeCsvField(habit?.dailyGoal || 1),
        sanitizeCsvField(habit?.unit || ''),
        sanitizeCsvField(log.isPersonalRecord ? 'SI' : 'NO'),
        sanitizeCsvField(notesCombined),
      ];
      rows.push(row.join(','));
    }

    // Prepend UTF-8 BOM for Microsoft Excel / Google Sheets compatibility
    return '\uFEFF' + rows.join('\r\n');
  }

  public async downloadCsvFile(): Promise<void> {
    const csvContent = await this.generateCsvData();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `trackr_actividades_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
