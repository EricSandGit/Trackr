import { LocalStorageAdapter } from './LocalStorageAdapter';
import { JsonBackupService } from './JsonBackupService';
import { IStorageAdapter } from './IStorageAdapter';

export * from './IStorageAdapter';
export * from './LocalStorageAdapter';
export * from './JsonBackupService';

// Default singleton instance using LocalStorageAdapter
export const storageAdapter: IStorageAdapter = new LocalStorageAdapter();
export const jsonBackupService: JsonBackupService = new JsonBackupService(storageAdapter);
