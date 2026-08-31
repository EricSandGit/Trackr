import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, ExternalLink, Info } from 'lucide-react';
import { Button } from '@/core/ui/Button';
import { useI18nStore } from '@/core/i18n';
import { PrivacyPolicyModal } from '../PrivacyPolicyModal';
import { TermsOfServiceModal } from '../TermsOfServiceModal';
import styles from './LegalConsentModal.module.css';

export interface LegalConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export const LegalConsentModal: React.FC<LegalConsentModalProps> = ({
  isOpen,
  onAccept,
}) => {
  const { t } = useI18nStore();
  const [isChecked, setIsChecked] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay}>
        <div className={styles.modal} role="dialog" aria-modal="true">
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.brandIcon}>
              <div className={styles.brandIconDot} style={{ backgroundColor: '#238636' }} />
              <div className={styles.brandIconDot} style={{ backgroundColor: '#39d353' }} />
              <div className={styles.brandIconDot} style={{ backgroundColor: '#0e4429' }} />
              <div className={styles.brandIconDot} style={{ backgroundColor: '#2ea043' }} />
            </div>
            <div className={styles.titleGroup}>
              <h2 className={styles.title}>{t('legal.consentModalTitle')}</h2>
              <p className={styles.subtitle}>{t('legal.consentModalSubtitle')}</p>
            </div>
          </div>

          {/* Highlights Box */}
          <div className={styles.highlightBox}>
            <div className={styles.highlightTitle}>
              <Info size={16} color="var(--tk-info)" />
              <span>{t('legal.consentPointsTitle')}</span>
            </div>
            <ul className={styles.pointsList}>
              <li className={styles.pointItem}>
                <CheckCircle2 size={15} className={styles.pointIcon} />
                <span>{t('legal.consentPoint1')}</span>
              </li>
              <li className={styles.pointItem}>
                <CheckCircle2 size={15} className={styles.pointIcon} />
                <span>{t('legal.consentPoint2')}</span>
              </li>
              <li className={styles.pointItem}>
                <CheckCircle2 size={15} className={styles.pointIcon} />
                <span>{t('legal.consentPoint3')}</span>
              </li>
            </ul>
          </div>

          {/* Direct links to read full documents */}
          <div className={styles.linksRow}>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => setIsTermsOpen(true)}
            >
              <span>{t('legal.termsLink')}</span>
              <ExternalLink size={12} />
            </button>
            <span className={styles.linkDivider}>•</span>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => setIsPrivacyOpen(true)}
            >
              <span>{t('legal.privacyLink')}</span>
              <ExternalLink size={12} />
            </button>
          </div>

          {/* Checkbox consent */}
          <label className={styles.checkboxContainer}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
            <span className={styles.checkboxLabel}>
              {t('legal.consentCheckbox')}
            </span>
          </label>

          {/* Action Button */}
          <div className={styles.actions}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!isChecked}
              onClick={onAccept}
              rightIcon={<ArrowRight size={16} />}
            >
              {t('legal.consentAcceptBtn')}
            </Button>
          </div>
        </div>
      </div>

      {/* Sub-modals to view full text */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <TermsOfServiceModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </>
  );
};
