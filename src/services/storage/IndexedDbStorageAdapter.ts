import { Habit, DailyActivityLog } from '@/core/types';
import { IStorageAdapter } from './IStorageAdapter';
import { getMockInitialData } from './mockInitialData';

const DB_NAME = 'trackr_db';
const DB_VERSION = 1;
const HABITS_STORE = 'habits';
const LOGS_STORE = 'logs';

// LocalStorage migration keys
const LS_HABITS_KEY = 'tk_habits_data_v1';
const LS_LOGS_KEY = 'tk_logs_data_v1';

export class IndexedDbStorageAdapter implements IStorageAdapter {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isSeededOrMigrated = false;

  constructor() {
    // Proactively initialize and migrate
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.initDb();
    }
  }

  private initDb(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create habits store
        if (!db.objectStoreNames.contains(HABITS_STORE)) {
          db.createObjectStore(HABITS_STORE, { keyPath: 'id' });
        }

        // Create logs store
        if (!db.objectStoreNames.contains(LOGS_STORE)) {
          const logsStore = db.createObjectStore(LOGS_STORE, { keyPath: 'id' });
          logsStore.createIndex('habitId', 'habitId', { unique: false });
          logsStore.createIndex('date', 'date', { unique: false });
        }
      };

      request.onsuccess = async () => {
        const db = request.result;
        resolve(db);
      };

      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  private async ensureDataReady(): Promise<IDBDatabase> {
    const db = await this.initDb();
    if (!this.isSeededOrMigrated) {
      await this.checkAndSeedOrMigrate(db);
      this.isSeededOrMigrated = true;
    }
    return db;
  }

  private async checkAndSeedOrMigrate(db: IDBDatabase): Promise<void> {
    const existingHabits = await this.getAllFromStore<Habit>(db, HABITS_STORE);
    if (existingHabits.length > 0) return;

    // Check for localStorage data to migrate
    let habitsToInsert: Habit[] = [];
    let logsToInsert: DailyActivityLog[] = [];

    try {
      const lsHabitsRaw = localStorage.getItem(LS_HABITS_KEY);
      const lsLogsRaw = localStorage.getItem(LS_LOGS_KEY);

      if (lsHabitsRaw) {
        const parsedHabits = JSON.parse(lsHabitsRaw);
        if (Array.isArray(parsedHabits) && parsedHabits.length > 0) {
          habitsToInsert = parsedHabits;
        }
      }

      if (lsLogsRaw) {
        const parsedLogs = JSON.parse(lsLogsRaw);
        if (Array.isArray(parsedLogs)) {
          logsToInsert = parsedLogs;
        }
      }
    } catch {
      // Ignore localStorage read errors
    }

    // If no localStorage data, use initial mock seed
    if (habitsToInsert.length === 0) {
      const mock = getMockInitialData();
      habitsToInsert = mock.habits;
      logsToInsert = mock.logs;
    }

    // Insert into IndexedDB
    const tx = db.transaction([HABITS_STORE, LOGS_STORE], 'readwrite');
    const habitsStore = tx.objectStore(HABITS_STORE);
    const logsStore = tx.objectStore(LOGS_STORE);

    for (const h of habitsToInsert) {
      habitsStore.put(h);
    }
    for (const l of logsToInsert) {
      logsStore.put(l);
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  private getAllFromStore<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve((request.result as T[]) || []);
      request.onerror = () => reject(request.error);
    });
  }

  // --- Habits CRUD ---
  async getHabits(): Promise<Habit[]> {
    try {
      const db = await this.ensureDataReady();
      return await this.getAllFromStore<Habit>(db, HABITS_STORE);
    } catch (e) {
      console.warn('IndexedDB getHabits fallback to empty', e);
      return [];
    }
  }

  async saveHabit(habit: Habit): Promise<void> {
    const db = await this.ensureDataReady();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(HABITS_STORE, 'readwrite');
      const store = tx.objectStore(HABITS_STORE);
      store.put(habit);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteHabit(id: string): Promise<void> {
    const db = await this.ensureDataReady();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction([HABITS_STORE, LOGS_STORE], 'readwrite');
      const habitsStore = tx.objectStore(HABITS_STORE);
      const logsStore = tx.objectStore(LOGS_STORE);

      habitsStore.delete(id);

      // Delete associated logs
      const logsIndex = logsStore.index('habitId');
      const logsRequest = logsIndex.getAllKeys(id);

      logsRequest.onsuccess = () => {
        const keys = logsRequest.result;
        for (const key of keys) {
          logsStore.delete(key);
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Logs CRUD ---
  async getLogs(): Promise<DailyActivityLog[]> {
    try {
      const db = await this.ensureDataReady();
      return await this.getAllFromStore<DailyActivityLog>(db, LOGS_STORE);
    } catch (e) {
      console.warn('IndexedDB getLogs fallback to empty', e);
      return [];
    }
  }

  async getLogsByHabit(habitId: string): Promise<DailyActivityLog[]> {
    const db = await this.ensureDataReady();
    return new Promise<DailyActivityLog[]>((resolve, reject) => {
      const tx = db.transaction(LOGS_STORE, 'readonly');
      const store = tx.objectStore(LOGS_STORE);
      const index = store.index('habitId');
      const request = index.getAll(habitId);

      request.onsuccess = () => resolve((request.result as DailyActivityLog[]) || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveLog(log: DailyActivityLog): Promise<void> {
    const db = await this.ensureDataReady();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(LOGS_STORE, 'readwrite');
      const store = tx.objectStore(LOGS_STORE);
      store.put(log);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteLog(id: string): Promise<void> {
    const db = await this.ensureDataReady();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(LOGS_STORE, 'readwrite');
      const store = tx.objectStore(LOGS_STORE);
      store.delete(id);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Backup & Restore ---
  async exportBackup(): Promise<string> {
    const habits = await this.getHabits();
    const logs = await this.getLogs();
    const backupData = {
      app: 'Trackr',
      version: '1.0',
      storageEngine: 'IndexedDB',
      exportedAt: new Date().toISOString(),
      habits,
      logs,
    };
    return JSON.stringify(backupData, null, 2);
  }

  async importBackup(jsonData: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed.habits) && Array.isArray(parsed.logs)) {
        const db = await this.ensureDataReady();
        const tx = db.transaction([HABITS_STORE, LOGS_STORE], 'readwrite');
        const habitsStore = tx.objectStore(HABITS_STORE);
        const logsStore = tx.objectStore(LOGS_STORE);

        habitsStore.clear();
        logsStore.clear();

        for (const h of parsed.habits) {
          habitsStore.put(h);
        }
        for (const l of parsed.logs) {
          logsStore.put(l);
        }

        await new Promise<void>((resolve, reject) => {
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });

        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import backup into IndexedDB', e);
      return false;
    }
  }

  async resetAllData(): Promise<void> {
    const db = await this.initDb();
    const tx = db.transaction([HABITS_STORE, LOGS_STORE], 'readwrite');
    tx.objectStore(HABITS_STORE).clear();
    tx.objectStore(LOGS_STORE).clear();

    const { habits, logs } = getMockInitialData();
    for (const h of habits) {
      tx.objectStore(HABITS_STORE).put(h);
    }
    for (const l of logs) {
      tx.objectStore(LOGS_STORE).put(l);
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}
