import { IStorageAdapter } from './IStorageAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { IndexedDbStorageAdapter } from './IndexedDbStorageAdapter';
import { SupabaseStorageAdapter } from './SupabaseStorageAdapter';
import { JsonBackupService } from './JsonBackupService';
import { CsvExportService } from './CsvExportService';

export * from './IStorageAdapter';
export * from './LocalStorageAdapter';
export * from './IndexedDbStorageAdapter';
export * from './SupabaseStorageAdapter';
export * from './JsonBackupService';
export * from './CsvExportService';

export class DynamicStorageManager implements IStorageAdapter {
  private indexedDbAdapter: IndexedDbStorageAdapter;
  private localAdapter = new LocalStorageAdapter();
  private supabaseAdapter = new SupabaseStorageAdapter();
  private activeMode: 'local' | 'supabase' = 'local';

  constructor() {
    this.indexedDbAdapter = new IndexedDbStorageAdapter();
  }

  public setMode(mode: 'local' | 'supabase') {
    this.activeMode = mode;
  }

  public getMode(): 'local' | 'supabase' {
    return this.activeMode;
  }

  public getActiveAdapter(): IStorageAdapter {
    if (this.activeMode === 'supabase') {
      return this.supabaseAdapter;
    }
    // Prefer modern IndexedDB; if unsupported, fallback to LocalStorage
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      return this.indexedDbAdapter;
    }
    return this.localAdapter;
  }

  public getLocalAdapter(): IStorageAdapter {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      return this.indexedDbAdapter;
    }
    return this.localAdapter;
  }

  public getSupabaseAdapter(): SupabaseStorageAdapter {
    return this.supabaseAdapter;
  }

  async getHabits() {
    return this.getActiveAdapter().getHabits();
  }

  async saveHabit(habit: any) {
    return this.getActiveAdapter().saveHabit(habit);
  }

  async deleteHabit(id: string) {
    return this.getActiveAdapter().deleteHabit(id);
  }

  async getLogs() {
    return this.getActiveAdapter().getLogs();
  }

  async getLogsByHabit(habitId: string) {
    return this.getActiveAdapter().getLogsByHabit(habitId);
  }

  async saveLog(log: any) {
    return this.getActiveAdapter().saveLog(log);
  }

  async deleteLog(id: string) {
    return this.getActiveAdapter().deleteLog(id);
  }

  async exportBackup() {
    return this.getActiveAdapter().exportBackup();
  }

  async importBackup(jsonData: string) {
    return this.getActiveAdapter().importBackup(jsonData);
  }

  async resetAllData() {
    return this.getActiveAdapter().resetAllData();
  }
}

export const storageManager = new DynamicStorageManager();
export const storageAdapter: IStorageAdapter = storageManager;
export const jsonBackupService: JsonBackupService = new JsonBackupService(storageAdapter);
export const csvExportService: CsvExportService = new CsvExportService(storageAdapter);
