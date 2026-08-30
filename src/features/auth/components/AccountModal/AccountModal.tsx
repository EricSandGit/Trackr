import React, { useState } from 'react';
import { CheckCircle, LogOut, UploadCloud } from 'lucide-react';
import { Modal } from '@/core/ui/Modal';
import { Button } from '@/core/ui/Button';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useI18nStore } from '@/core/i18n';
import styles from './AccountModal.module.css';

export interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18nStore();
  const { user, signOut, migrateLocalDataToCloud, isLoading } = useAuthStore();
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);

  if (!user) return null;

  const email = user.email || 'Usuario';
  const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0];
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const initial = (name || email)[0].toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const handleMigrate = async () => {
    setMigrationStatus(null);
    const { success } = await migrateLocalDataToCloud();
    if (success) {
      setMigrationStatus(t('auth.migrationSuccess'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('auth.accountTitle')}
    >
      <div className={styles.container}>
        {/* Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.avatar}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className={styles.avatarImg} />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.userName}>{name}</span>
            <span className={styles.userEmail}>{email}</span>
            <span className={styles.syncStatus}>
              <CheckCircle size={13} />
              <span>{t('auth.cloudSyncActive')}</span>
            </span>
          </div>
        </div>

        {/* Feedback message */}
        {migrationStatus && (
          <div className={styles.migrationFeedback}>
            {migrationStatus}
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            size="md"
            fullWidth
            onClick={handleMigrate}
            disabled={isLoading}
            leftIcon={<UploadCloud size={16} />}
          >
            {t('auth.migrateDataBtn')}
          </Button>

          <Button
            type="button"
            variant="danger"
            size="md"
            fullWidth
            onClick={handleSignOut}
            disabled={isLoading}
            leftIcon={<LogOut size={16} />}
          >
            {t('auth.signOut')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
