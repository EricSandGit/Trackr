import React from 'react';
import { BookOpen, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Modal } from '@/core/ui/Modal';
import { Button } from '@/core/ui/Button';
import { useI18nStore } from '@/core/i18n';
import styles from './TermsOfServiceModal.module.css';

export interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, language } = useI18nStore();

  const isSpanish = language === 'es';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('legal.termsTitle')}
    >
      <div className={styles.container}>
        <div className={styles.badge}>
          <BookOpen size={14} />
          <span>{isSpanish ? 'Condiciones de Uso' : 'Terms of Use'}</span>
        </div>

        <span className={styles.lastUpdated}>{t('legal.lastUpdated')}</span>

        {isSpanish ? (
          <>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <CheckCircle size={16} />
                <span>1. Aceptación de los Términos</span>
              </h3>
              <p>
                Al acceder y utilizar <strong>Trackr</strong>, aceptas cumplir con los presentes Términos y Condiciones de Uso. Si no estás de acuerdo con alguno de ellos, te recomendamos no utilizar la aplicación.
              </p>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <BookOpen size={16} />
                <span>2. Uso del Servicio</span>
              </h3>
              <p>
                Trackr es una herramienta creada para el registro, monitoreo y mejora de hábitos personales, metas y productividad:
              </p>
              <ul className={styles.list}>
                <li>El uso es estrictamente personal y lícito.</li>
                <li>Eres responsable de mantener la seguridad y confidencialidad de tu cuenta de acceso.</li>
              </ul>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <AlertCircle size={16} />
                <span>3. Disponibilidad y Limitación de Responsabilidad</span>
              </h3>
              <p>
                Trackr se proporciona "tal cual" y según disponibilidad. Aunque aplicamos las mejores prácticas de disponibilidad y seguridad mediante Supabase y Vercel, no garantizamos que el servicio sea ininterrumpido ni nos responsabilizamos por pérdidas accidentales de datos debidas a fallos de conexión externa. Te recomendamos realizar copias de respaldo periódicas en JSON.
              </p>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <RefreshCw size={16} />
                <span>4. Modificaciones del Servicio</span>
              </h3>
              <p>
                Nos reservamos el derecho de actualizar o mejorar las funciones de Trackr en cualquier momento para ofrecer una mejor experiencia de usuario.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <CheckCircle size={16} />
                <span>1. Acceptance of Terms</span>
              </h3>
              <p>
                By accessing and using <strong>Trackr</strong>, you agree to comply with these Terms of Service. If you do not agree with any of these terms, please discontinue using the application.
              </p>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <BookOpen size={16} />
                <span>2. Use of Service</span>
              </h3>
              <p>
                Trackr is an application designed for habit tracking, goal setting, and personal productivity:
              </p>
              <ul className={styles.list}>
                <li>Use is strictly for personal, lawful purposes.</li>
                <li>You are responsible for maintaining the confidentiality and security of your account.</li>
              </ul>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <AlertCircle size={16} />
                <span>3. Service Availability and Disclaimer</span>
              </h3>
              <p>
                Trackr is provided on an "as is" and "as available" basis. While we utilize modern infrastructure through Supabase and Vercel, we do not guarantee uninterrupted uptime. We encourage taking periodic JSON data backups from Settings.
              </p>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <RefreshCw size={16} />
                <span>4. Service Updates</span>
              </h3>
              <p>
                We reserve the right to update or enhance Trackr features over time to deliver continuous improvements.
              </p>
            </div>
          </>
        )}

        <div className={styles.footer}>
          <Button variant="secondary" size="md" onClick={onClose}>
            {t('legal.closeBtn')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
