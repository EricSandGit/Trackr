import { IStorageAdapter } from './IStorageAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { SupabaseStorageAdapter } from './SupabaseStorageAdapter';
import { JsonBackupService } from './JsonBackupService';

export * from './IStorageAdapter';
export * from './LocalStorageAdapter';
export * from './SupabaseStorageAdapter';
export * from './JsonBackupService';

export class DynamicStorageManager implements IStorageAdapter {
  private localAdapter = new LocalStorageAdapter();
  private supabaseAdapter = new SupabaseStorageAdapter();
  private activeMode: 'local' | 'supabase' = 'local';

  public setMode(mode: 'local' | 'supabase') {
    this.activeMode = mode;
  }

  public getMode(): 'local' | 'supabase' {
    return this.activeMode;
  }

  public getActiveAdapter(): IStorageAdapter {
    return this.activeMode === 'supabase' ? this.supabaseAdapter : this.localAdapter;
  }

  public getLocalAdapter(): LocalStorageAdapter {
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
