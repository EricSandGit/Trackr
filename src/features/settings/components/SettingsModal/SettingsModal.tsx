import React, { useRef, useState } from 'react';
import { Download, Upload, Moon, Sun, RotateCcw, Shield, Smartphone } from 'lucide-react';
import { Modal } from '@/core/ui/Modal';
import { Button } from '@/core/ui/Button';
import { useThemeStore } from '@/core/theme/useThemeStore';
import { jsonBackupService, storageAdapter } from '@/services/storage';
import styles from './SettingsModal.module.css';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataResetOrImported: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onDataResetOrImported,
}) => {
  const { theme, toggleTheme } = useThemeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleExportBackup = async () => {
    try {
      await jsonBackupService.downloadBackupFile();
      setFeedbackMsg('✅ Copia de seguridad descargada.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch {
      setFeedbackMsg('❌ Error al exportar respaldo.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const success = await jsonBackupService.restoreFromFile(file);
      if (success) {
        setFeedbackMsg('✅ Datos restaurados exitosamente.');
        await onDataResetOrImported();
        setTimeout(() => setFeedbackMsg(null), 3000);
      } else {
        setFeedbackMsg('❌ Archivo de respaldo no válido.');
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetData = async () => {
    if (
      window.confirm(
        '¿Restablecer Trackr a los datos de ejemplo iniciales? Se borrarán los hábitos y registros actuales.'
      )
    ) {
      await storageAdapter.resetAllData();
      await onDataResetOrImported();
      setFeedbackMsg('✅ Datos restablecidos.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajustes y Respaldo">
      <div className={styles.container}>
        {feedbackMsg && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--tk-radius-md)',
              backgroundColor: 'var(--tk-bg-surface-elevated)',
              fontSize: '13px',
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            {feedbackMsg}
          </div>
        )}

        {/* Theme Setting */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            <span>Tema Visual</span>
          </div>
          <div className={styles.row}>
            <p className={styles.description}>
              Tema actual: <strong>{theme === 'dark' ? 'GitHub Dark' : 'Modo Claro'}</strong>
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleTheme}
              leftIcon={theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            >
              Cambiar a {theme === 'dark' ? 'Claro' : 'Oscuro'}
            </Button>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <Shield size={16} color="var(--tk-accent)" />
            <span>Respaldo de Datos (JSON)</span>
          </div>
          <p className={styles.description}>
            Tus datos se guardan de forma privada en tu dispositivo (*Local-First*). Puedes exportar una copia de seguridad o restaurarla en cualquier momento.
          </p>

          <div className={styles.buttonGrid}>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportBackup}
              leftIcon={<Download size={14} />}
            >
              Descargar JSON
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              leftIcon={<Upload size={14} />}
            >
              Restaurar JSON
            </Button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            className={styles.hiddenInput}
            onChange={handleFileChange}
          />
        </div>

        {/* PWA Info */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <Smartphone size={16} color="var(--tk-info)" />
            <span>Instalar como App Móvil</span>
          </div>
          <p className={styles.description}>
            En Safari (iOS) toca <strong>Compartir → Añadir a pantalla de inicio</strong>. En Chrome/Android toca <strong>Menú (⋮) → Instalar aplicación</strong>.
          </p>
        </div>

        {/* Danger Zone: Reset */}
        <div className={`${styles.section} ${styles.dangerSection}`}>
          <div className={styles.sectionTitle}>
            <RotateCcw size={16} color="var(--tk-danger)" />
            <span style={{ color: 'var(--tk-danger)' }}>Restablecer Datos</span>
          </div>
          <div className={styles.row}>
            <p className={styles.description}>
              Vuelve a cargar los 3 hábitos de ejemplo iniciales.
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={handleResetData}
            >
              Restablecer
            </Button>
          </div>
        </div>

        <div className={styles.appInfo}>
          <strong>Trackr v1.0.0</strong>
          <span>Inspirado en la constancia de GitHub</span>
        </div>
      </div>
    </Modal>
  );
};
