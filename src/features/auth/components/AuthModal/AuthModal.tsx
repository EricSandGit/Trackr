import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Modal } from '@/core/ui/Modal';
import { Button } from '@/core/ui/Button';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useI18nStore } from '@/core/i18n';
import styles from './AuthModal.module.css';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18nStore();
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    isLoading,
    authError,
    clearError,
    migrateLocalDataToCloud,
  } = useAuthStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleToggleMode = () => {
    clearError();
    setSuccessMessage(null);
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setSuccessMessage(null);
    await signInWithGoogle();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(null);

    if (!email || !password) return;

    if (mode === 'signin') {
      const { error } = await signInWithEmail(email, password);
      if (!error) {
        // Auto-migrate local data if present
        await migrateLocalDataToCloud();
        onClose();
      }
    } else {
      const { error, user } = await signUpWithEmail(email, password);
      if (!error) {
        if (user && !user.confirmed_at) {
          setSuccessMessage(t('auth.checkEmailVerification'));
        } else {
          await migrateLocalDataToCloud();
          onClose();
        }
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'signin' ? t('auth.loginTitle') : t('auth.signupTitle')}
    >
      <div className={styles.container}>
        {/* Google OAuth Button */}
        <button
          type="button"
          className={styles.googleBtn}
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg className={styles.googleIcon} viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{t('auth.googleSignIn')}</span>
        </button>

        {/* Divider */}
        <div className={styles.divider}>
          <span>{t('auth.orEmail')}</span>
        </div>

        {/* Notice of Cloud Migration */}
        <div className={styles.migrationNotice}>
          <Sparkles size={14} />
          <span>{t('auth.guestModeDesc')}</span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {authError && <div className={styles.errorAlert}>{authError}</div>}
          {successMessage && (
            <div className={styles.migrationNotice} style={{ color: 'var(--tk-accent)', borderColor: 'var(--tk-accent)' }}>
              {successMessage}
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>{t('auth.emailLabel')}</label>
            <input
              type="email"
              required
              autoFocus
              className={styles.input}
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t('auth.passwordLabel')}</label>
            <input
              type="password"
              required
              minLength={6}
              className={styles.input}
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isLoading || !email || password.length < 6}
            rightIcon={<ArrowRight size={16} />}
          >
            {isLoading
              ? t('common.loading')
              : mode === 'signin'
              ? t('auth.signIn')
              : t('auth.signUp')}
          </Button>
        </form>

        {/* Mode switcher footer */}
        <div className={styles.footer}>
          <span>
            {mode === 'signin'
              ? t('auth.noAccountPrompt')
              : t('auth.haveAccountPrompt')}
          </span>
          <button
            type="button"
            className={styles.switchBtn}
            onClick={handleToggleMode}
          >
            {mode === 'signin' ? t('auth.switchToSignUp') : t('auth.switchToSignIn')}
          </button>
        </div>
      </div>
    </Modal>
  );
};
