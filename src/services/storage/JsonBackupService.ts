import { IStorageAdapter } from './IStorageAdapter';

export class JsonBackupService {
  constructor(private storage: IStorageAdapter) {}

  /**
   * Download a JSON backup file to the user's phone or computer
   */
  async downloadBackupFile(): Promise<void> {
    const jsonString = await this.storage.exportBackup();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `trackr-backup-${dateStr}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  /**
   * Reads a JSON file uploaded by the user and restores it
   */
  async restoreFromFile(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        if (!content) {
          resolve(false);
          return;
        }
        const success = await this.storage.importBackup(content);
        resolve(success);
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  }
}
