import React, { useState } from 'react';
import { Cloud } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useI18nStore } from '@/core/i18n';
import { AuthModal } from '../AuthModal';
import { AccountModal } from '../AccountModal';
import styles from './UserAccountButton.module.css';

export const UserAccountButton: React.FC = () => {
  const { t } = useI18nStore();
  const { user } = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  if (!user) {
    return (
      <>
        <button
          type="button"
          className={`${styles.btn} ${styles.guestBtn}`}
          onClick={() => setIsAuthModalOpen(true)}
          title={t('auth.signIn')}
        >
          <Cloud size={14} />
          <span>{t('auth.signIn')}</span>
        </button>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </>
    );
  }

  const email = user.email || '';
  const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0];
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const initial = (name || email)[0]?.toUpperCase() || 'U';

  return (
    <>
      <button
        type="button"
        className={`${styles.btn} ${styles.loggedInBtn}`}
        onClick={() => setIsAccountModalOpen(true)}
        title={`${t('auth.loggedAs')} ${name}`}
      >
        <div className={styles.avatar}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className={styles.avatarImg} />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <span className={styles.userName}>{name}</span>
      </button>

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </>
  );
};
