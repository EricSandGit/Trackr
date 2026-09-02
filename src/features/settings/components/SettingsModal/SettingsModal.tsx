import React, { useRef, useState, useEffect } from 'react';
import {
  Download,
  Upload,
  FileSpreadsheet,
  Moon,
  Sun,
  Flame,
  Layers,
  Sparkles,
  RotateCcw,
  Shield,
  Smartphone,
  Globe,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Modal } from '@/core/ui/Modal';
import { Button } from '@/core/ui/Button';
import { useThemeStore, ThemeMode } from '@/core/theme/useThemeStore';
import { useI18nStore, LanguageCode } from '@/core/i18n';
import { jsonBackupService, csvExportService, storageAdapter } from '@/services/storage';
import { PrivacyPolicyModal, TermsOfServiceModal } from '@/features/legal';
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
  const { theme, setTheme } = useThemeStore();
  const { language, setLanguage, supportedLanguages, t } = useI18nStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Close language dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLangDropdownOpen(false);
      }
    };
    if (isLangDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLangDropdownOpen]);

  // Reset dropdown state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setIsLangDropdownOpen(false);
    }
  }, [isOpen]);

  const selectedLangObj =
    supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  const THEMES: Array<{ id: ThemeMode; label: string; icon: React.ReactNode }> = [
    { id: 'dark', label: t('settings.themes.dark'), icon: <Moon size={16} /> },
    { id: 'zinc', label: t('settings.themes.zinc'), icon: <Layers size={16} /> },
    { id: 'light', label: t('settings.themes.light'), icon: <Sun size={16} /> },
    { id: 'slate', label: t('settings.themes.slate'), icon: <Sparkles size={16} /> },
    { id: 'warm', label: t('settings.themes.warm'), icon: <Flame size={16} /> },
  ];

  const handleExportBackup = async () => {
    try {
      await jsonBackupService.downloadBackupFile();
      setFeedbackMsg(t('settings.feedbackBackupDownloaded'));
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch {
      setFeedbackMsg(t('settings.feedbackBackupError'));
    }
  };

  const handleExportCsv = async () => {
    try {
      await csvExportService.downloadCsvFile();
      setFeedbackMsg(t('settings.feedbackCsvDownloaded'));
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch {
      setFeedbackMsg(t('settings.feedbackCsvError'));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const success = await jsonBackupService.restoreFromFile(file);
      if (success) {
        setFeedbackMsg(t('settings.feedbackDataRestored'));
        await onDataResetOrImported();
        setTimeout(() => setFeedbackMsg(null), 3000);
      } else {
        setFeedbackMsg(t('settings.feedbackInvalidFile'));
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetData = async () => {
    if (window.confirm(t('settings.resetConfirm'))) {
      await storageAdapter.resetAllData();
      await onDataResetOrImported();
      setFeedbackMsg(t('settings.feedbackDataReset'));
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')} size="lg">
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

        {/* Language Selection Setting (Combobox / Dropdown) */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <Globe size={16} color="var(--tk-info)" />
            <span>{t('settings.languageSectionTitle')}</span>
          </div>
          <p className={styles.description}>
            {t('settings.languageDesc')}
          </p>

          <div className={styles.comboboxWrapper} ref={langDropdownRef}>
            <button
              type="button"
              className={`${styles.comboboxTrigger} ${isLangDropdownOpen ? styles.comboboxTriggerActive : ''}`}
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              aria-haspopup="listbox"
              aria-expanded={isLangDropdownOpen}
            >
              <div className={styles.comboboxValue}>
                <span className={styles.comboboxFlag}>{selectedLangObj.flag}</span>
                <span className={styles.comboboxLabel}>{selectedLangObj.nativeName}</span>
              </div>
              <ChevronDown
                size={16}
                className={`${styles.comboboxChevron} ${isLangDropdownOpen ? styles.comboboxChevronOpen : ''}`}
              />
            </button>

            {isLangDropdownOpen && (
              <div className={styles.comboboxDropdown} role="listbox">
                {supportedLanguages.map((lang) => {
                  const isSelected = language === lang.code;
                  const translatedName = !isSelected ? t(`languages.${lang.code}` as any) || lang.label : null;

                  return (
                    <button
                      key={lang.code}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`${styles.comboboxItem} ${isSelected ? styles.comboboxItemActive : ''}`}
                      onClick={() => {
                        setLanguage(lang.code as LanguageCode);
                        setIsLangDropdownOpen(false);
                      }}
                    >
                      <div className={styles.comboboxItemLeft}>
                        <span className={styles.comboboxFlag}>{lang.flag}</span>
                        <div className={styles.comboboxItemText}>
                          <span className={styles.comboboxLabel}>{lang.nativeName}</span>
                          {translatedName && (
                            <span className={styles.comboboxSublabel}>({translatedName})</span>
                          )}
                        </div>
                      </div>
                      {isSelected && <Check size={16} color="var(--tk-accent)" strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Theme Setting */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <span>{t('settings.themeSectionTitle')}</span>
          </div>
          <p className={styles.description}>
            {t('settings.themeDesc')}
          </p>

          <div className={styles.themeGrid}>
            {THEMES.map((item) => {
              const isSelected = theme === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.themeBtn} ${isSelected ? styles.themeBtnActive : ''}`}
                  onClick={() => setTheme(item.id)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Backup & Restore */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <Shield size={16} color="var(--tk-accent)" />
            <span>{t('settings.backupSectionTitle')}</span>
          </div>
          <p className={styles.description}>
            {t('settings.backupDesc')}
          </p>

          <div className={styles.buttonGrid}>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportBackup}
              leftIcon={<Download size={14} />}
            >
              {t('settings.downloadJson')}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              leftIcon={<Upload size={14} />}
            >
              {t('settings.restoreJson')}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCsv}
              leftIcon={<FileSpreadsheet size={14} />}
            >
              {t('settings.exportCsv')}
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

        {/* Legal & Privacy Section */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <Shield size={16} color="var(--tk-accent)" />
            <span>{t('legal.legalSectionTitle')}</span>
          </div>
          <p className={styles.description}>
            {t('legal.legalDesc')}
          </p>
          <div className={styles.actions} style={{ marginTop: '8px' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsPrivacyOpen(true)}
            >
              {t('legal.openPrivacyBtn')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsTermsOpen(true)}
            >
              {t('legal.openTermsBtn')}
            </Button>
          </div>
        </div>

        {/* PWA Info */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <Smartphone size={16} color="var(--tk-info)" />
            <span>{t('settings.pwaSectionTitle')}</span>
          </div>
          <p className={styles.description}>
            {t('settings.pwaDesc')}
          </p>
        </div>

        {/* Danger Zone: Reset */}
        <div className={`${styles.section} ${styles.dangerSection}`}>
          <div className={styles.sectionTitle}>
            <RotateCcw size={16} color="var(--tk-danger)" />
            <span style={{ color: 'var(--tk-danger)' }}>{t('settings.dangerSectionTitle')}</span>
          </div>
          <div className={styles.row}>
            <p className={styles.description}>
              {t('settings.resetDesc')}
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={handleResetData}
            >
              {t('settings.resetButton')}
            </Button>
          </div>
        </div>

        <div className={styles.appInfo}>
          <strong>Trackr v1.0.0</strong>
          <span>{t('settings.appTagline')}</span>
        </div>

        {/* Privacy Policy Modal */}
        <PrivacyPolicyModal
          isOpen={isPrivacyOpen}
          onClose={() => setIsPrivacyOpen(false)}
        />

        {/* Terms of Service Modal */}
        <TermsOfServiceModal
          isOpen={isTermsOpen}
          onClose={() => setIsTermsOpen(false)}
        />
      </div>
    </Modal>
  );
};
